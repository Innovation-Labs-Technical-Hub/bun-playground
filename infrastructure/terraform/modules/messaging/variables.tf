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

variable "aws_kafka_security_group_id" {
  description = "AWS security group ID for Kafka"
  type        = string
  default     = ""
}

variable "aws_msk_instance_type" {
  description = "AWS MSK broker instance type"
  type        = string
  default     = "kafka.m5.large"
}

variable "aws_msk_volume_size" {
  description = "AWS MSK EBS volume size in GB"
  type        = number
  default     = 100
}

# GCP-specific
variable "gcp_region" {
  description = "GCP region"
  type        = string
  default     = ""
}

variable "gcp_project_id" {
  description = "GCP project ID"
  type        = string
  default     = ""
}

variable "gcp_private_subnet_name" {
  description = "GCP private subnet name"
  type        = string
  default     = ""
}

variable "gcp_kafka_vcpu_count" {
  description = "GCP Managed Kafka vCPU count"
  type        = number
  default     = 3
}

variable "gcp_kafka_memory_bytes" {
  description = "GCP Managed Kafka memory in bytes"
  type        = number
  default     = 3221225472 # 3 GB
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

variable "azure_eventhub_capacity" {
  description = "Azure Event Hubs throughput units"
  type        = number
  default     = 1
}

variable "tags" {
  description = "Tags to apply to all resources"
  type        = map(string)
  default     = {}
}
