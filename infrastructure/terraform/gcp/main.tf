terraform {
  required_version = ">= 1.5"

  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }
}

provider "google" {
  project = var.gcp_project_id
  region  = var.gcp_region
}

locals {
  common_tags = {
    project     = var.project_name
    environment = var.environment
    managed-by  = "terraform"
  }
}

# -----------------------------------------------------------------------------
# Networking
# -----------------------------------------------------------------------------

module "networking" {
  source = "../modules/networking"

  cloud_provider = "gcp"
  project_name   = var.project_name
  vpc_cidr       = var.vpc_cidr
  gcp_region     = var.gcp_region
  tags           = local.common_tags
}

# -----------------------------------------------------------------------------
# Database - Cloud SQL PostgreSQL 16
# -----------------------------------------------------------------------------

module "database" {
  source = "../modules/database"

  cloud_provider                  = "gcp"
  project_name                    = var.project_name
  environment                     = var.environment
  db_username                     = var.db_username
  db_password                     = var.db_password
  gcp_region                      = var.gcp_region
  gcp_network_id                  = module.networking.gcp_network_id
  gcp_private_services_connection = module.networking.gcp_private_services_connection
  gcp_db_tier                     = var.db_tier
  tags                            = local.common_tags
}

# -----------------------------------------------------------------------------
# Cache - Memorystore Redis 7
# -----------------------------------------------------------------------------

module "cache" {
  source = "../modules/cache"

  cloud_provider      = "gcp"
  project_name        = var.project_name
  environment         = var.environment
  gcp_region          = var.gcp_region
  gcp_network_id      = module.networking.gcp_network_id
  gcp_redis_memory_gb = var.redis_memory_gb
  tags                = local.common_tags
}

# -----------------------------------------------------------------------------
# Messaging - Managed Kafka
# -----------------------------------------------------------------------------

module "messaging" {
  source = "../modules/messaging"

  cloud_provider          = "gcp"
  project_name            = var.project_name
  environment             = var.environment
  gcp_region              = var.gcp_region
  gcp_project_id          = var.gcp_project_id
  gcp_private_subnet_name = module.networking.gcp_private_subnet_name
  tags                    = local.common_tags
}

# -----------------------------------------------------------------------------
# Container - Cloud Run
# -----------------------------------------------------------------------------

module "container" {
  source = "../modules/container"

  cloud_provider          = "gcp"
  project_name            = var.project_name
  environment             = var.environment
  container_registry      = var.container_registry
  image_tag               = var.image_tag
  gcp_region              = var.gcp_region
  gcp_network_name        = module.networking.gcp_network_name
  gcp_private_subnet_name = module.networking.gcp_private_subnet_name
  service_cpu_gcp         = var.service_cpu
  service_memory_gcp      = var.service_memory
  db_host                 = module.database.db_host
  db_port                 = module.database.db_port
  redis_host              = module.cache.redis_host
  redis_port              = module.cache.redis_port
  kafka_bootstrap_servers = module.messaging.kafka_bootstrap_servers
  tags                    = local.common_tags
}
