output "api_gateway_url" {
  description = "Public URL for the API gateway (Cloud Run)"
  value       = module.container.api_gateway_url
}

output "cloud_run_service_urls" {
  description = "Cloud Run service URLs"
  value       = module.container.gcp_service_urls
}

output "database_connection_name" {
  description = "Cloud SQL connection name"
  value       = module.database.gcp_instance_connection_name
}

output "database_private_ip" {
  description = "Cloud SQL private IP"
  value       = module.database.gcp_instance_private_ip
}

output "redis_host" {
  description = "Memorystore Redis host"
  value       = module.cache.redis_host
}

output "kafka_cluster_id" {
  description = "Managed Kafka cluster ID"
  value       = module.messaging.gcp_kafka_cluster_id
}
