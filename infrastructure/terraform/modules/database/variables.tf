variable "project_name" {
  description = "Name of the project"
  type        = string
}

variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
}

variable "db_username" {
  description = "Database administrator username"
  type        = string
  sensitive   = true
}

variable "db_password" {
  description = "Database administrator password"
  type        = string
  sensitive   = true
}

# AWS-specific
variable "aws_private_subnet_ids" {
  description = "AWS private subnet IDs for DB subnet group"
  type        = list(string)
  default     = []
}

variable "aws_database_security_group_id" {
  description = "AWS security group ID for database"
  type        = string
  default     = ""
}

variable "db_instance_class" {
  description = "AWS RDS instance class"
  type        = string
  default     = "db.r6g.large"
}

variable "db_instance_count" {
  description = "Number of RDS cluster instances"
  type        = number
  default     = 1
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

variable "gcp_private_services_connection" {
  description = "GCP private services connection ID (used as dependency)"
  type        = string
  default     = ""
}

variable "gcp_db_tier" {
  description = "GCP Cloud SQL instance tier"
  type        = string
  default     = "db-custom-2-4096"
}

# Azure-specific
variable "azure_resource_group_name" {
  description = "Azure resource group name"
  type        = string
  default     = ""
}

variable "azure_location" {
  description = "Azure location"
  type        = string
  default     = ""
}

variable "azure_vnet_id" {
  description = "Azure VNet ID"
  type        = string
  default     = ""
}

variable "azure_database_subnet_id" {
  description = "Azure database subnet ID"
  type        = string
  default     = ""
}

variable "azure_db_sku" {
  description = "Azure PostgreSQL Flexible Server SKU"
  type        = string
  default     = "GP_Standard_D2s_v3"
}

variable "tags" {
  description = "Tags to apply to all resources"
  type        = map(string)
  default     = {}
}
