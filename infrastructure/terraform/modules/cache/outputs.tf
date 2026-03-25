output "redis_host" {
  description = "Redis host endpoint"
  value = coalesce(
    try(aws_elasticache_replication_group.main[0].primary_endpoint_address, ""),
    try(google_redis_instance.main[0].host, ""),
    try(azurerm_redis_cache.main[0].hostname, ""),
    "localhost"
  )
}

output "redis_port" {
  description = "Redis port"
  value = coalesce(
    try(tostring(aws_elasticache_replication_group.main[0].port), ""),
    try(tostring(google_redis_instance.main[0].port), ""),
    try(tostring(azurerm_redis_cache.main[0].ssl_port), ""),
    "6379"
  )
}

output "azure_redis_primary_key" {
  description = "Azure Redis primary access key"
  value       = try(azurerm_redis_cache.main[0].primary_access_key, "")
  sensitive   = true
}
