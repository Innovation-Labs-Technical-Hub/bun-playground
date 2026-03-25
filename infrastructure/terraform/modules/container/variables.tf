variable "project_name" {
  description = "Name of the project"
  type        = string
}

variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
}

variable "container_registry" {
  description = "Container registry URL (e.g. ECR, GCR, ACR)"
  type        = string
}

variable "image_tag" {
  description = "Container image tag"
  type        = string
  default     = "latest"
}

variable "service_replicas" {
  description = "Desired number of service replicas"
  type        = number
  default     = 1
}

variable "service_max_replicas" {
  description = "Maximum number of service replicas for autoscaling"
  type        = number
  default     = 5
}

# Service connection info
variable "db_host" {
  description = "Database host"
  type        = string
}

variable "db_port" {
  description = "Database port"
  type        = number
  default     = 5432
}

variable "redis_host" {
  description = "Redis host"
  type        = string
}

variable "redis_port" {
  description = "Redis port"
  type        = string
  default     = "6379"
}

variable "kafka_bootstrap_servers" {
  description = "Kafka bootstrap servers"
  type        = string
}

# AWS-specific
variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = ""
}

variable "aws_vpc_id" {
  description = "AWS VPC ID"
  type        = string
  default     = ""
}

variable "aws_public_subnet_ids" {
  description = "AWS public subnet IDs (for ALB)"
  type        = list(string)
  default     = []
}

variable "aws_private_subnet_ids" {
  description = "AWS private subnet IDs (for ECS tasks)"
  type        = list(string)
  default     = []
}

variable "aws_services_security_group_id" {
  description = "AWS services security group ID"
  type        = string
  default     = ""
}

variable "aws_alb_security_group_id" {
  description = "AWS ALB security group ID"
  type        = string
  default     = ""
}

variable "service_cpu" {
  description = "CPU units for ECS task (256 = 0.25 vCPU)"
  type        = string
  default     = "512"
}

variable "service_memory" {
  description = "Memory in MB for ECS task"
  type        = string
  default     = "1024"
}

# GCP-specific
variable "gcp_region" {
  description = "GCP region"
  type        = string
  default     = ""
}

variable "gcp_network_name" {
  description = "GCP VPC network name"
  type        = string
  default     = ""
}

variable "gcp_private_subnet_name" {
  description = "GCP private subnet name"
  type        = string
  default     = ""
}

variable "service_cpu_gcp" {
  description = "CPU limit for Cloud Run (e.g., '1' or '2')"
  type        = string
  default     = "1"
}

variable "service_memory_gcp" {
  description = "Memory limit for Cloud Run (e.g., '512Mi')"
  type        = string
  default     = "512Mi"
}

# Azure-specific
variable "azure_location" {
  description = "Azure location"
  type        = string
  default     = ""
}

variable "azure_resource_group_name" {
  description = "Azure resource group name"
  type        = string
  default     = ""
}

variable "azure_private_subnet_id" {
  description = "Azure private subnet ID for Container Apps environment"
  type        = string
  default     = ""
}

variable "service_cpu_azure" {
  description = "CPU for Azure Container App (e.g., 0.5)"
  type        = number
  default     = 0.5
}

variable "service_memory_azure" {
  description = "Memory for Azure Container App (e.g., '1Gi')"
  type        = string
  default     = "1Gi"
}

variable "tags" {
  description = "Tags to apply to all resources"
  type        = map(string)
  default     = {}
}
