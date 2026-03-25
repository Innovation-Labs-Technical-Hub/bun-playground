# Messaging Module - Kafka / Event Streaming
# Provisions MSK (AWS), Confluent/Pub/Sub (GCP), or Event Hubs (Azure)

terraform {
  required_version = ">= 1.5"
}

variable "cloud_provider" {
  description = "Cloud provider: aws, gcp, or azure"
  type        = string
}

# -----------------------------------------------------------------------------
# AWS - Amazon MSK (Managed Streaming for Kafka)
# -----------------------------------------------------------------------------

resource "aws_msk_configuration" "main" {
  count          = var.cloud_provider == "aws" ? 1 : 0
  name           = "${var.project_name}-msk-config"
  kafka_versions = ["3.5.1"]

  server_properties = <<-EOT
    auto.create.topics.enable=true
    default.replication.factor=2
    min.insync.replicas=1
    num.partitions=3
    log.retention.hours=168
  EOT
}

resource "aws_msk_cluster" "main" {
  count         = var.cloud_provider == "aws" ? 1 : 0
  cluster_name  = "${var.project_name}-kafka"
  kafka_version = "3.5.1"

  number_of_broker_nodes = length(var.aws_private_subnet_ids)

  broker_node_group_info {
    instance_type   = var.aws_msk_instance_type
    client_subnets  = var.aws_private_subnet_ids
    security_groups = [var.aws_kafka_security_group_id]

    storage_info {
      ebs_storage_info {
        volume_size = var.aws_msk_volume_size
      }
    }
  }

  configuration_info {
    arn      = aws_msk_configuration.main[0].arn
    revision = aws_msk_configuration.main[0].latest_revision
  }

  encryption_info {
    encryption_in_transit {
      client_broker = "TLS"
      in_cluster    = true
    }
  }

  logging_info {
    broker_logs {
      cloudwatch_logs {
        enabled   = true
        log_group = aws_cloudwatch_log_group.msk[0].name
      }
    }
  }

  tags = var.tags
}

resource "aws_cloudwatch_log_group" "msk" {
  count             = var.cloud_provider == "aws" ? 1 : 0
  name              = "/aws/msk/${var.project_name}"
  retention_in_days = 7

  tags = var.tags
}

# -----------------------------------------------------------------------------
# GCP - Managed Kafka (or use Pub/Sub as alternative)
# NOTE: For a simpler alternative, consider Google Cloud Pub/Sub instead of
# a self-managed or Confluent Kafka cluster. Pub/Sub offers similar
# event-streaming semantics with lower operational overhead.
# -----------------------------------------------------------------------------

# Using Google Managed Service for Apache Kafka (preview)
resource "google_managed_kafka_cluster" "main" {
  count      = var.cloud_provider == "gcp" ? 1 : 0
  cluster_id = "${var.project_name}-kafka"
  location   = var.gcp_region

  capacity_config {
    vcpu_count   = var.gcp_kafka_vcpu_count
    memory_bytes = var.gcp_kafka_memory_bytes
  }

  gcp_config {
    access_config {
      network_configs {
        subnet = "projects/${var.gcp_project_id}/regions/${var.gcp_region}/subnetworks/${var.gcp_private_subnet_name}"
      }
    }
  }

  labels = var.tags
}

# -----------------------------------------------------------------------------
# Azure - Event Hubs with Kafka protocol support
# -----------------------------------------------------------------------------

resource "azurerm_eventhub_namespace" "main" {
  count               = var.cloud_provider == "azure" ? 1 : 0
  name                = "${var.project_name}-eventhub"
  location            = var.azure_location
  resource_group_name = var.azure_resource_group_name
  sku                 = var.environment == "prod" ? "Standard" : "Basic"
  capacity            = var.azure_eventhub_capacity

  tags = var.tags
}

# Create topic-equivalent event hubs for each service domain
resource "azurerm_eventhub" "auth_events" {
  count             = var.cloud_provider == "azure" ? 1 : 0
  name              = "auth-events"
  namespace_name    = azurerm_eventhub_namespace.main[0].name
  resource_group_name = var.azure_resource_group_name
  partition_count   = var.environment == "prod" ? 4 : 2
  message_retention = var.environment == "prod" ? 7 : 1
}

resource "azurerm_eventhub" "core_events" {
  count             = var.cloud_provider == "azure" ? 1 : 0
  name              = "core-events"
  namespace_name    = azurerm_eventhub_namespace.main[0].name
  resource_group_name = var.azure_resource_group_name
  partition_count   = var.environment == "prod" ? 4 : 2
  message_retention = var.environment == "prod" ? 7 : 1
}

resource "azurerm_eventhub" "user_events" {
  count             = var.cloud_provider == "azure" ? 1 : 0
  name              = "user-events"
  namespace_name    = azurerm_eventhub_namespace.main[0].name
  resource_group_name = var.azure_resource_group_name
  partition_count   = var.environment == "prod" ? 4 : 2
  message_retention = var.environment == "prod" ? 7 : 1
}

resource "azurerm_eventhub_namespace_authorization_rule" "services" {
  count             = var.cloud_provider == "azure" ? 1 : 0
  name              = "services-access"
  namespace_name    = azurerm_eventhub_namespace.main[0].name
  resource_group_name = var.azure_resource_group_name
  listen            = true
  send              = true
  manage            = false
}
