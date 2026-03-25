output "api_gateway_url" {
  description = "Public URL for the API gateway (ALB DNS)"
  value       = module.container.api_gateway_url
}

output "vpc_id" {
  description = "VPC ID"
  value       = module.networking.aws_vpc_id
}

output "ecs_cluster_name" {
  description = "ECS cluster name"
  value       = module.container.aws_ecs_cluster_name
}

output "database_endpoint" {
  description = "RDS cluster endpoint"
  value       = module.database.aws_cluster_endpoint
}

output "redis_endpoint" {
  description = "ElastiCache Redis endpoint"
  value       = module.cache.redis_host
}

output "kafka_bootstrap_brokers" {
  description = "MSK bootstrap brokers (TLS)"
  value       = module.messaging.aws_msk_bootstrap_brokers_tls
}
