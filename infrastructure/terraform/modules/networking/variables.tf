variable "project_name" {
  description = "Name of the project, used as prefix for resources"
  type        = string
}

variable "vpc_cidr" {
  description = "CIDR block for VPC/VNet"
  type        = string
  default     = "10.0.0.0/16"
}

variable "availability_zones" {
  description = "List of availability zones (AWS)"
  type        = list(string)
  default     = []
}

variable "gcp_region" {
  description = "GCP region"
  type        = string
  default     = ""
}

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

variable "tags" {
  description = "Tags to apply to all resources"
  type        = map(string)
  default     = {}
}
