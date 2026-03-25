# AWS outputs
output "aws_cluster_endpoint" {
  description = "AWS RDS cluster endpoint"
  value       = try(aws_rds_cluster.main[0].endpoint, "")
}

output "aws_cluster_reader_endpoint" {
  description = "AWS RDS cluster reader endpoint"
  value       = try(aws_rds_cluster.main[0].reader_endpoint, "")
}

# GCP outputs
output "gcp_instance_connection_name" {
  description = "GCP Cloud SQL connection name"
  value       = try(google_sql_database_instance.main[0].connection_name, "")
}

output "gcp_instance_private_ip" {
  description = "GCP Cloud SQL private IP"
  value       = try(google_sql_database_instance.main[0].private_ip_address, "")
}

# Azure outputs
output "azure_server_fqdn" {
  description = "Azure PostgreSQL Flexible Server FQDN"
  value       = try(azurerm_postgresql_flexible_server.main[0].fqdn, "")
}

# Common
output "db_host" {
  description = "Database host endpoint"
  value = coalesce(
    try(aws_rds_cluster.main[0].endpoint, ""),
    try(google_sql_database_instance.main[0].private_ip_address, ""),
    try(azurerm_postgresql_flexible_server.main[0].fqdn, ""),
    "localhost"
  )
}

output "db_port" {
  description = "Database port"
  value       = 5432
}
