# Container Module - Microservice Orchestration
# Provisions ECS Fargate (AWS), Cloud Run (GCP), or Container Apps (Azure)

terraform {
  required_version = ">= 1.5"
}

variable "cloud_provider" {
  description = "Cloud provider: aws, gcp, or azure"
  type        = string
}

locals {
  services = {
    api-gateway  = { port = 3000, public = true }
    user-service = { port = 3001, public = false }
    auth-service = { port = 3002, public = false }
    core-service = { port = 3003, public = false }
  }
}

# -----------------------------------------------------------------------------
# AWS - ECS Fargate
# -----------------------------------------------------------------------------

resource "aws_ecs_cluster" "main" {
  count = var.cloud_provider == "aws" ? 1 : 0
  name  = "${var.project_name}-cluster"

  setting {
    name  = "containerInsights"
    value = "enabled"
  }

  tags = var.tags
}

resource "aws_cloudwatch_log_group" "services" {
  for_each          = var.cloud_provider == "aws" ? local.services : {}
  name              = "/ecs/${var.project_name}/${each.key}"
  retention_in_days = 14

  tags = var.tags
}

resource "aws_iam_role" "ecs_task_execution" {
  count = var.cloud_provider == "aws" ? 1 : 0
  name  = "${var.project_name}-ecs-exec-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = { Service = "ecs-tasks.amazonaws.com" }
    }]
  })

  tags = var.tags
}

resource "aws_iam_role_policy_attachment" "ecs_task_execution" {
  count      = var.cloud_provider == "aws" ? 1 : 0
  role       = aws_iam_role.ecs_task_execution[0].name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy"
}

resource "aws_iam_role" "ecs_task" {
  count = var.cloud_provider == "aws" ? 1 : 0
  name  = "${var.project_name}-ecs-task-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action = "sts:AssumeRole"
      Effect = "Allow"
      Principal = { Service = "ecs-tasks.amazonaws.com" }
    }]
  })

  tags = var.tags
}

resource "aws_ecs_task_definition" "services" {
  for_each                 = var.cloud_provider == "aws" ? local.services : {}
  family                   = "${var.project_name}-${each.key}"
  network_mode             = "awsvpc"
  requires_compatibilities = ["FARGATE"]
  cpu                      = var.service_cpu
  memory                   = var.service_memory
  execution_role_arn       = aws_iam_role.ecs_task_execution[0].arn
  task_role_arn            = aws_iam_role.ecs_task[0].arn

  container_definitions = jsonencode([{
    name      = each.key
    image     = "${var.container_registry}/${each.key}:${var.image_tag}"
    essential = true

    portMappings = [{
      containerPort = each.value.port
      protocol      = "tcp"
    }]

    environment = [
      { name = "PORT", value = tostring(each.value.port) },
      { name = "NODE_ENV", value = var.environment },
      { name = "DATABASE_HOST", value = var.db_host },
      { name = "DATABASE_PORT", value = tostring(var.db_port) },
      { name = "REDIS_HOST", value = var.redis_host },
      { name = "REDIS_PORT", value = var.redis_port },
      { name = "KAFKA_BROKERS", value = var.kafka_bootstrap_servers },
    ]

    logConfiguration = {
      logDriver = "awslogs"
      options = {
        "awslogs-group"         = "/ecs/${var.project_name}/${each.key}"
        "awslogs-region"        = var.aws_region
        "awslogs-stream-prefix" = "ecs"
      }
    }
  }])

  tags = var.tags
}

resource "aws_ecs_service" "services" {
  for_each        = var.cloud_provider == "aws" ? local.services : {}
  name            = each.key
  cluster         = aws_ecs_cluster.main[0].id
  task_definition = aws_ecs_task_definition.services[each.key].arn
  desired_count   = var.service_replicas
  launch_type     = "FARGATE"

  network_configuration {
    subnets          = var.aws_private_subnet_ids
    security_groups  = [var.aws_services_security_group_id]
    assign_public_ip = false
  }

  dynamic "load_balancer" {
    for_each = each.value.public ? [1] : []
    content {
      target_group_arn = aws_lb_target_group.api_gateway[0].arn
      container_name   = each.key
      container_port   = each.value.port
    }
  }

  tags = var.tags
}

# ALB for api-gateway
resource "aws_lb" "main" {
  count              = var.cloud_provider == "aws" ? 1 : 0
  name               = "${var.project_name}-alb"
  internal           = false
  load_balancer_type = "application"
  security_groups    = [var.aws_alb_security_group_id]
  subnets            = var.aws_public_subnet_ids

  tags = var.tags
}

resource "aws_lb_target_group" "api_gateway" {
  count       = var.cloud_provider == "aws" ? 1 : 0
  name        = "${var.project_name}-api-tg"
  port        = 3000
  protocol    = "HTTP"
  vpc_id      = var.aws_vpc_id
  target_type = "ip"

  health_check {
    path                = "/health"
    healthy_threshold   = 2
    unhealthy_threshold = 3
    interval            = 30
  }

  tags = var.tags
}

resource "aws_lb_listener" "http" {
  count             = var.cloud_provider == "aws" ? 1 : 0
  load_balancer_arn = aws_lb.main[0].arn
  port              = 80
  protocol          = "HTTP"

  default_action {
    type             = "forward"
    target_group_arn = aws_lb_target_group.api_gateway[0].arn
  }

  tags = var.tags
}

# -----------------------------------------------------------------------------
# GCP - Cloud Run
# -----------------------------------------------------------------------------

resource "google_cloud_run_v2_service" "services" {
  for_each = var.cloud_provider == "gcp" ? local.services : {}
  name     = "${var.project_name}-${each.key}"
  location = var.gcp_region

  template {
    scaling {
      min_instance_count = var.environment == "prod" ? 1 : 0
      max_instance_count = var.service_max_replicas
    }

    vpc_access {
      network_interfaces {
        network    = var.gcp_network_name
        subnetwork = var.gcp_private_subnet_name
      }
      egress = "PRIVATE_RANGES_ONLY"
    }

    containers {
      image = "${var.container_registry}/${each.key}:${var.image_tag}"

      ports {
        container_port = each.value.port
      }

      resources {
        limits = {
          cpu    = var.service_cpu_gcp
          memory = var.service_memory_gcp
        }
      }

      env { name = "PORT";              value = tostring(each.value.port) }
      env { name = "NODE_ENV";          value = var.environment }
      env { name = "DATABASE_HOST";     value = var.db_host }
      env { name = "DATABASE_PORT";     value = tostring(var.db_port) }
      env { name = "REDIS_HOST";        value = var.redis_host }
      env { name = "REDIS_PORT";        value = var.redis_port }
      env { name = "KAFKA_BROKERS";     value = var.kafka_bootstrap_servers }
    }
  }

  labels = var.tags
}

# Allow unauthenticated access to api-gateway only
resource "google_cloud_run_v2_service_iam_member" "api_gateway_public" {
  count    = var.cloud_provider == "gcp" ? 1 : 0
  location = var.gcp_region
  name     = google_cloud_run_v2_service.services["api-gateway"].name
  role     = "roles/run.invoker"
  member   = "allUsers"
}

# -----------------------------------------------------------------------------
# Azure - Container Apps
# -----------------------------------------------------------------------------

resource "azurerm_container_app_environment" "main" {
  count                      = var.cloud_provider == "azure" ? 1 : 0
  name                       = "${var.project_name}-env"
  location                   = var.azure_location
  resource_group_name        = var.azure_resource_group_name
  infrastructure_subnet_id   = var.azure_private_subnet_id

  tags = var.tags
}

resource "azurerm_container_app" "services" {
  for_each                     = var.cloud_provider == "azure" ? local.services : {}
  name                         = "${var.project_name}-${each.key}"
  container_app_environment_id = azurerm_container_app_environment.main[0].id
  resource_group_name          = var.azure_resource_group_name
  revision_mode                = "Single"

  template {
    min_replicas = var.environment == "prod" ? 1 : 0
    max_replicas = var.service_max_replicas

    container {
      name   = each.key
      image  = "${var.container_registry}/${each.key}:${var.image_tag}"
      cpu    = var.service_cpu_azure
      memory = var.service_memory_azure

      env { name = "PORT";              value = tostring(each.value.port) }
      env { name = "NODE_ENV";          value = var.environment }
      env { name = "DATABASE_HOST";     value = var.db_host }
      env { name = "DATABASE_PORT";     value = tostring(var.db_port) }
      env { name = "REDIS_HOST";        value = var.redis_host }
      env { name = "REDIS_PORT";        value = var.redis_port }
      env { name = "KAFKA_BROKERS";     value = var.kafka_bootstrap_servers }
    }
  }

  dynamic "ingress" {
    for_each = each.value.public ? [1] : []
    content {
      external_enabled = true
      target_port      = each.value.port
      traffic_weight {
        percentage      = 100
        latest_revision = true
      }
    }
  }

  tags = var.tags
}
