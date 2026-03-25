terraform {
  required_version = ">= 1.5"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = local.common_tags
  }
}

locals {
  common_tags = {
    Project     = var.project_name
    Environment = var.environment
    ManagedBy   = "terraform"
  }

  availability_zones = ["${var.aws_region}a", "${var.aws_region}b"]
}

# -----------------------------------------------------------------------------
# Networking
# -----------------------------------------------------------------------------

module "networking" {
  source = "../modules/networking"

  cloud_provider     = "aws"
  project_name       = var.project_name
  vpc_cidr           = var.vpc_cidr
  availability_zones = local.availability_zones
  tags               = local.common_tags
}

# -----------------------------------------------------------------------------
# Database - RDS PostgreSQL 16
# -----------------------------------------------------------------------------

module "database" {
  source = "../modules/database"

  cloud_provider                 = "aws"
  project_name                   = var.project_name
  environment                    = var.environment
  db_username                    = var.db_username
  db_password                    = var.db_password
  db_instance_class              = var.db_instance_class
  db_instance_count              = var.environment == "prod" ? 2 : 1
  aws_private_subnet_ids         = module.networking.aws_private_subnet_ids
  aws_database_security_group_id = module.networking.aws_database_security_group_id
  tags                           = local.common_tags
}

# -----------------------------------------------------------------------------
# Cache - ElastiCache Redis 7
# -----------------------------------------------------------------------------

module "cache" {
  source = "../modules/cache"

  cloud_provider              = "aws"
  project_name                = var.project_name
  environment                 = var.environment
  aws_private_subnet_ids      = module.networking.aws_private_subnet_ids
  aws_cache_security_group_id = module.networking.aws_cache_security_group_id
  aws_redis_node_type         = var.redis_node_type
  tags                        = local.common_tags
}

# -----------------------------------------------------------------------------
# Messaging - Amazon MSK
# -----------------------------------------------------------------------------

module "messaging" {
  source = "../modules/messaging"

  cloud_provider              = "aws"
  project_name                = var.project_name
  environment                 = var.environment
  aws_private_subnet_ids      = module.networking.aws_private_subnet_ids
  aws_kafka_security_group_id = module.networking.aws_kafka_security_group_id
  aws_msk_instance_type       = var.msk_instance_type
  tags                        = local.common_tags
}

# -----------------------------------------------------------------------------
# Container - ECS Fargate
# -----------------------------------------------------------------------------

module "container" {
  source = "../modules/container"

  cloud_provider                 = "aws"
  project_name                   = var.project_name
  environment                    = var.environment
  container_registry             = var.container_registry
  image_tag                      = var.image_tag
  service_replicas               = var.service_replicas
  aws_region                     = var.aws_region
  aws_vpc_id                     = module.networking.aws_vpc_id
  aws_public_subnet_ids          = module.networking.aws_public_subnet_ids
  aws_private_subnet_ids         = module.networking.aws_private_subnet_ids
  aws_services_security_group_id = module.networking.aws_services_security_group_id
  aws_alb_security_group_id      = module.networking.aws_alb_security_group_id
  service_cpu                    = var.service_cpu
  service_memory                 = var.service_memory
  db_host                        = module.database.db_host
  db_port                        = module.database.db_port
  redis_host                     = module.cache.redis_host
  redis_port                     = module.cache.redis_port
  kafka_bootstrap_servers        = module.messaging.kafka_bootstrap_servers
  tags                           = local.common_tags
}
