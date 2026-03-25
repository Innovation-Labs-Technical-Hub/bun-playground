output "resource_group_name" {
  description = "Azure resource group name"
  value       = azurerm_resource_group.main.name
}

output "api_gateway_url" {
  description = "Public URL for the API gateway (Container App)"
  value       = module.container.api_gateway_url
}

output "container_app_fqdns" {
  description = "Azure Container App FQDNs"
  value       = module.container.azure_container_app_fqdns
}

output "database_fqdn" {
  description = "Azure PostgreSQL Flexible Server FQDN"
  value       = module.database.azure_server_fqdn
}

output "redis_hostname" {
  description = "Azure Cache for Redis hostname"
  value       = module.cache.redis_host
}

output "eventhub_kafka_endpoint" {
  description = "Azure Event Hubs Kafka endpoint"
  value       = module.messaging.azure_eventhub_kafka_endpoint
}
