# AWS outputs
output "aws_vpc_id" {
  description = "AWS VPC ID"
  value       = try(aws_vpc.main[0].id, "")
}

output "aws_public_subnet_ids" {
  description = "AWS public subnet IDs"
  value       = aws_subnet.public[*].id
}

output "aws_private_subnet_ids" {
  description = "AWS private subnet IDs"
  value       = aws_subnet.private[*].id
}

output "aws_services_security_group_id" {
  description = "AWS services security group ID"
  value       = try(aws_security_group.services[0].id, "")
}

output "aws_database_security_group_id" {
  description = "AWS database security group ID"
  value       = try(aws_security_group.database[0].id, "")
}

output "aws_cache_security_group_id" {
  description = "AWS cache security group ID"
  value       = try(aws_security_group.cache[0].id, "")
}

output "aws_kafka_security_group_id" {
  description = "AWS Kafka security group ID"
  value       = try(aws_security_group.kafka[0].id, "")
}

output "aws_alb_security_group_id" {
  description = "AWS ALB security group ID"
  value       = try(aws_security_group.alb[0].id, "")
}

# GCP outputs
output "gcp_network_id" {
  description = "GCP VPC network ID"
  value       = try(google_compute_network.main[0].id, "")
}

output "gcp_network_name" {
  description = "GCP VPC network name"
  value       = try(google_compute_network.main[0].name, "")
}

output "gcp_public_subnet_name" {
  description = "GCP public subnet name"
  value       = try(google_compute_subnetwork.public[0].name, "")
}

output "gcp_private_subnet_name" {
  description = "GCP private subnet name"
  value       = try(google_compute_subnetwork.private[0].name, "")
}

output "gcp_private_services_connection" {
  description = "GCP private services connection"
  value       = try(google_service_networking_connection.private[0].id, "")
}

# Azure outputs
output "azure_vnet_id" {
  description = "Azure VNet ID"
  value       = try(azurerm_virtual_network.main[0].id, "")
}

output "azure_public_subnet_id" {
  description = "Azure public subnet ID"
  value       = try(azurerm_subnet.public[0].id, "")
}

output "azure_private_subnet_id" {
  description = "Azure private subnet ID"
  value       = try(azurerm_subnet.private[0].id, "")
}

output "azure_database_subnet_id" {
  description = "Azure database subnet ID"
  value       = try(azurerm_subnet.database[0].id, "")
}
