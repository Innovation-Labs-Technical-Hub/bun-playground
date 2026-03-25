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

variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
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

variable "db_instance_class" {
  description = "RDS instance class"
  type        = string
  default     = "db.r6g.large"
}

# Cache
variable "redis_node_type" {
  description = "ElastiCache Redis node type"
  type        = string
  default     = "cache.r6g.large"
}

# Messaging
variable "msk_instance_type" {
  description = "MSK broker instance type"
  type        = string
  default     = "kafka.m5.large"
}

# Container
variable "container_registry" {
  description = "ECR registry URL (e.g., 123456789.dkr.ecr.us-east-1.amazonaws.com)"
  type        = string
}

variable "image_tag" {
  description = "Docker image tag"
  type        = string
  default     = "latest"
}

variable "service_replicas" {
  description = "Number of service replicas"
  type        = number
  default     = 1
}

variable "service_cpu" {
  description = "ECS task CPU units (256 = 0.25 vCPU)"
  type        = string
  default     = "512"
}

variable "service_memory" {
  description = "ECS task memory in MB"
  type        = string
  default     = "1024"
}
