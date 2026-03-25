# AWS outputs
output "aws_msk_bootstrap_brokers_tls" {
  description = "AWS MSK TLS bootstrap brokers"
  value       = try(aws_msk_cluster.main[0].bootstrap_brokers_tls, "")
}

output "aws_msk_zookeeper_connect" {
  description = "AWS MSK Zookeeper connection string"
  value       = try(aws_msk_cluster.main[0].zookeeper_connect_string, "")
}

# GCP outputs
output "gcp_kafka_cluster_id" {
  description = "GCP Managed Kafka cluster ID"
  value       = try(google_managed_kafka_cluster.main[0].cluster_id, "")
}

# Azure outputs
output "azure_eventhub_namespace_connection_string" {
  description = "Azure Event Hubs namespace connection string"
  value       = try(azurerm_eventhub_namespace.main[0].default_primary_connection_string, "")
  sensitive   = true
}

output "azure_eventhub_kafka_endpoint" {
  description = "Azure Event Hubs Kafka endpoint"
  value       = try("${azurerm_eventhub_namespace.main[0].name}.servicebus.windows.net:9093", "")
}

# Common
output "kafka_bootstrap_servers" {
  description = "Kafka bootstrap servers connection string"
  value = coalesce(
    try(aws_msk_cluster.main[0].bootstrap_brokers_tls, ""),
    try("${google_managed_kafka_cluster.main[0].cluster_id}-bootstrap:9092", ""),
    try("${azurerm_eventhub_namespace.main[0].name}.servicebus.windows.net:9093", ""),
    "localhost:9092"
  )
}
