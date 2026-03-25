# AWS outputs
output "aws_alb_dns_name" {
  description = "AWS ALB DNS name"
  value       = try(aws_lb.main[0].dns_name, "")
}

output "aws_alb_zone_id" {
  description = "AWS ALB hosted zone ID"
  value       = try(aws_lb.main[0].zone_id, "")
}

output "aws_ecs_cluster_name" {
  description = "AWS ECS cluster name"
  value       = try(aws_ecs_cluster.main[0].name, "")
}

output "aws_ecs_service_names" {
  description = "AWS ECS service names"
  value       = { for k, v in aws_ecs_service.services : k => v.name }
}

# GCP outputs
output "gcp_service_urls" {
  description = "GCP Cloud Run service URLs"
  value       = { for k, v in google_cloud_run_v2_service.services : k => v.uri }
}

# Azure outputs
output "azure_container_app_fqdns" {
  description = "Azure Container App FQDNs"
  value = {
    for k, v in azurerm_container_app.services : k =>
    try(v.ingress[0].fqdn, "internal")
  }
}

# Common
output "api_gateway_url" {
  description = "Public URL for the API gateway"
  value = coalesce(
    try("http://${aws_lb.main[0].dns_name}", ""),
    try(google_cloud_run_v2_service.services["api-gateway"].uri, ""),
    try("https://${azurerm_container_app.services["api-gateway"].ingress[0].fqdn}", ""),
    "http://localhost:3000"
  )
}
