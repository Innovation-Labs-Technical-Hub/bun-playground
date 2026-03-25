variable "project_name" {
  description = "Name of the project"
  type        = string
  default     = "bun-microservices"
}

variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
  default     = "dev"

  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "environment must be one of: dev, staging, prod"
  }
}

variable "azure_location" {
  description = "Azure region/location"
  type        = string
  default     = "eastus"
}

variable "vpc_cidr" {
  description = "CIDR block for the VNet"
  type        = string
  default     = "10.0.0.0/16"
}

# Database
variable "db_username" {
  description = "PostgreSQL administrator username"
  type        = string
  sensitive   = true
}

variable "db_password" {
  description = "PostgreSQL administrator password"
  type        = string
  sensitive   = true
}

variable "db_sku" {
  description = "Azure PostgreSQL Flexible Server SKU"
  type        = string
  default     = "GP_Standard_D2s_v3"
}

# Cache
variable "redis_capacity" {
  description = "Azure Cache for Redis capacity"
  type        = number
  default     = 1
}

# Messaging
variable "eventhub_capacity" {
  description = "Azure Event Hubs throughput units"
  type        = number
  default     = 1
}

# Container
variable "container_registry" {
  description = "Container registry URL (e.g., myacr.azurecr.io)"
  type        = string
}

variable "image_tag" {
  description = "Docker image tag"
  type        = string
  default     = "latest"
}

variable "service_cpu" {
  description = "Container App CPU (e.g., 0.5)"
  type        = number
  default     = 0.5
}

variable "service_memory" {
  description = "Container App memory (e.g., '1Gi')"
  type        = string
  default     = "1Gi"
}
