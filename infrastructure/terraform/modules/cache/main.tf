# Cache Module - Redis 7
# Provisions ElastiCache (AWS), Memorystore (GCP), or Azure Cache for Redis

terraform {
  required_version = ">= 1.5"
}

variable "cloud_provider" {
  description = "Cloud provider: aws, gcp, or azure"
  type        = string
}

# -----------------------------------------------------------------------------
# AWS - ElastiCache Redis 7
# -----------------------------------------------------------------------------

resource "aws_elasticache_subnet_group" "main" {
  count      = var.cloud_provider == "aws" ? 1 : 0
  name       = "${var.project_name}-redis-subnet"
  subnet_ids = var.aws_private_subnet_ids
}

resource "aws_elasticache_replication_group" "main" {
  count                      = var.cloud_provider == "aws" ? 1 : 0
  replication_group_id       = "${var.project_name}-redis"
  description                = "Redis cluster for ${var.project_name}"
  engine_version             = "7.0"
  node_type                  = var.aws_redis_node_type
  num_cache_clusters         = var.environment == "prod" ? 2 : 1
  port                       = 6379
  subnet_group_name          = aws_elasticache_subnet_group.main[0].name
  security_group_ids         = [var.aws_cache_security_group_id]
  at_rest_encryption_enabled = true
  transit_encryption_enabled = true
  automatic_failover_enabled = var.environment == "prod"

  tags = var.tags
}

# -----------------------------------------------------------------------------
# GCP - Memorystore Redis 7
# -----------------------------------------------------------------------------

resource "google_redis_instance" "main" {
  count              = var.cloud_provider == "gcp" ? 1 : 0
  name               = "${var.project_name}-redis"
  tier               = var.environment == "prod" ? "STANDARD_HA" : "BASIC"
  memory_size_gb     = var.gcp_redis_memory_gb
  region             = var.gcp_region
  redis_version      = "REDIS_7_0"
  authorized_network = var.gcp_network_id
  transit_encryption_mode = "SERVER_AUTHENTICATION"

  labels = var.tags
}

# -----------------------------------------------------------------------------
# Azure - Azure Cache for Redis
# -----------------------------------------------------------------------------

resource "azurerm_redis_cache" "main" {
  count               = var.cloud_provider == "azure" ? 1 : 0
  name                = "${var.project_name}-redis"
  location            = var.azure_location
  resource_group_name = var.azure_resource_group_name
  capacity            = var.azure_redis_capacity
  family              = var.environment == "prod" ? "P" : "C"
  sku_name            = var.environment == "prod" ? "Premium" : "Standard"
  enable_non_ssl_port = false
  minimum_tls_version = "1.2"
  redis_version       = "6"  # Azure Cache max supported; closest to Redis 7

  redis_configuration {
  }

  tags = var.tags
}
