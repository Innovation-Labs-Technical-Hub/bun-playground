terraform {
  required_version = ">= 1.5"

  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.0"
    }
  }
}

provider "azurerm" {
  features {}
}

locals {
  common_tags = {
    Project     = var.project_name
    Environment = var.environment
    ManagedBy   = "terraform"
  }
}

# -----------------------------------------------------------------------------
# Resource Group
# -----------------------------------------------------------------------------

resource "azurerm_resource_group" "main" {
  name     = "${var.project_name}-${var.environment}-rg"
  location = var.azure_location

  tags = local.common_tags
}

# -----------------------------------------------------------------------------
# Networking
# -----------------------------------------------------------------------------

module "networking" {
  source = "../modules/networking"

  cloud_provider            = "azure"
  project_name              = var.project_name
  vpc_cidr                  = var.vpc_cidr
  azure_location            = var.azure_location
  azure_resource_group_name = azurerm_resource_group.main.name
  tags                      = local.common_tags
}

# -----------------------------------------------------------------------------
# Database - Azure Database for PostgreSQL Flexible Server
# -----------------------------------------------------------------------------

module "database" {
  source = "../modules/database"

  cloud_provider            = "azure"
  project_name              = var.project_name
  environment               = var.environment
  db_username               = var.db_username
  db_password               = var.db_password
  azure_location            = var.azure_location
  azure_resource_group_name = azurerm_resource_group.main.name
  azure_vnet_id             = module.networking.azure_vnet_id
  azure_database_subnet_id  = module.networking.azure_database_subnet_id
  azure_db_sku              = var.db_sku
  tags                      = local.common_tags
}

# -----------------------------------------------------------------------------
# Cache - Azure Cache for Redis
# -----------------------------------------------------------------------------

module "cache" {
  source = "../modules/cache"

  cloud_provider            = "azure"
  project_name              = var.project_name
  environment               = var.environment
  azure_location            = var.azure_location
  azure_resource_group_name = azurerm_resource_group.main.name
  azure_redis_capacity      = var.redis_capacity
  tags                      = local.common_tags
}

# -----------------------------------------------------------------------------
# Messaging - Azure Event Hubs (Kafka protocol)
# -----------------------------------------------------------------------------

module "messaging" {
  source = "../modules/messaging"

  cloud_provider            = "azure"
  project_name              = var.project_name
  environment               = var.environment
  azure_location            = var.azure_location
  azure_resource_group_name = azurerm_resource_group.main.name
  azure_eventhub_capacity   = var.eventhub_capacity
  tags                      = local.common_tags
}

# -----------------------------------------------------------------------------
# Container - Azure Container Apps
# -----------------------------------------------------------------------------

module "container" {
  source = "../modules/container"

  cloud_provider            = "azure"
  project_name              = var.project_name
  environment               = var.environment
  container_registry        = var.container_registry
  image_tag                 = var.image_tag
  azure_location            = var.azure_location
  azure_resource_group_name = azurerm_resource_group.main.name
  azure_private_subnet_id   = module.networking.azure_private_subnet_id
  service_cpu_azure         = var.service_cpu
  service_memory_azure      = var.service_memory
  db_host                   = module.database.db_host
  db_port                   = module.database.db_port
  redis_host                = module.cache.redis_host
  redis_port                = module.cache.redis_port
  kafka_bootstrap_servers   = module.messaging.kafka_bootstrap_servers
  tags                      = local.common_tags
}
