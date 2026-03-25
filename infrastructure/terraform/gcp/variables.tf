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

variable "gcp_project_id" {
  description = "GCP project ID"
  type        = string
}

variable "gcp_region" {
  description = "GCP region"
  type        = string
  default     = "us-central1"
}

variable "vpc_cidr" {
  description = "CIDR block for the VPC"
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

variable "db_tier" {
  description = "Cloud SQL instance tier"
  type        = string
  default     = "db-custom-2-4096"
}

# Cache
variable "redis_memory_gb" {
  description = "Memorystore Redis memory in GB"
  type        = number
  default     = 1
}

# Container
variable "container_registry" {
  description = "Container registry URL (e.g., gcr.io/my-project)"
  type        = string
}

variable "image_tag" {
  description = "Docker image tag"
  type        = string
  default     = "latest"
}

variable "service_cpu" {
  description = "Cloud Run CPU limit (e.g., '1' or '2')"
  type        = string
  default     = "1"
}

variable "service_memory" {
  description = "Cloud Run memory limit (e.g., '512Mi')"
  type        = string
  default     = "512Mi"
}
