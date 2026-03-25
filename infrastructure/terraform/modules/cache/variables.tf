variable "project_name" {
  description = "Name of the project"
  type        = string
}

variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
}

# AWS-specific
variable "aws_private_subnet_ids" {
  description = "AWS private subnet IDs"
  type        = list(string)
  default     = []
}

variable "aws_cache_security_group_id" {
  description = "AWS security group ID for cache"
  type        = string
  default     = ""
}

variable "aws_redis_node_type" {
  description = "AWS ElastiCache node type"
  type        = string
  default     = "cache.r6g.large"
}

# GCP-specific
variable "gcp_region" {
  description = "GCP region"
  type        = string
  default     = ""
}

variable "gcp_network_id" {
  description = "GCP VPC network ID"
  type        = string
  default     = ""
}

variable "gcp_redis_memory_gb" {
  description = "GCP Memorystore Redis memory in GB"
  type        = number
  default     = 1
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

variable "azure_redis_capacity" {
  description = "Azure Cache for Redis capacity"
  type        = number
  default     = 1
}

variable "tags" {
  description = "Tags to apply to all resources"
  type        = map(string)
  default     = {}
}
