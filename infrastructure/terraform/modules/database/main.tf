# Database Module - PostgreSQL 16
# Provisions RDS (AWS), Cloud SQL (GCP), or Azure Database for PostgreSQL

terraform {
  required_version = ">= 1.5"
}

variable "cloud_provider" {
  description = "Cloud provider: aws, gcp, or azure"
  type        = string
}

# -----------------------------------------------------------------------------
# AWS - RDS PostgreSQL 16
# -----------------------------------------------------------------------------

resource "aws_db_subnet_group" "main" {
  count      = var.cloud_provider == "aws" ? 1 : 0
  name       = "${var.project_name}-db-subnet"
  subnet_ids = var.aws_private_subnet_ids

  tags = merge(var.tags, { Name = "${var.project_name}-db-subnet" })
}

resource "aws_rds_cluster" "main" {
  count                   = var.cloud_provider == "aws" ? 1 : 0
  cluster_identifier      = "${var.project_name}-pg"
  engine                  = "aurora-postgresql"
  engine_version          = "16.1"
  database_name           = "app"
  master_username         = var.db_username
  master_password         = var.db_password
  db_subnet_group_name    = aws_db_subnet_group.main[0].name
  vpc_security_group_ids  = [var.aws_database_security_group_id]
  storage_encrypted       = true
  skip_final_snapshot     = var.environment != "prod"
  final_snapshot_identifier = "${var.project_name}-final-snapshot"
  backup_retention_period = var.environment == "prod" ? 7 : 1

  tags = var.tags
}

resource "aws_rds_cluster_instance" "main" {
  count               = var.cloud_provider == "aws" ? var.db_instance_count : 0
  identifier          = "${var.project_name}-pg-${count.index}"
  cluster_identifier  = aws_rds_cluster.main[0].id
  instance_class      = var.db_instance_class
  engine              = "aurora-postgresql"
  engine_version      = "16.1"
  publicly_accessible = false

  tags = var.tags
}

# Create auth_db and core_db via provisioner (runs once)
resource "terraform_data" "aws_databases" {
  count = var.cloud_provider == "aws" ? 1 : 0

  depends_on = [aws_rds_cluster.main]

  provisioner "local-exec" {
    command = <<-EOT
      PGPASSWORD=${var.db_password} psql -h ${aws_rds_cluster.main[0].endpoint} -U ${var.db_username} -d app -c "CREATE DATABASE auth_db;" || true
      PGPASSWORD=${var.db_password} psql -h ${aws_rds_cluster.main[0].endpoint} -U ${var.db_username} -d app -c "CREATE DATABASE core_db;" || true
    EOT
  }
}

# -----------------------------------------------------------------------------
# GCP - Cloud SQL PostgreSQL 16
# -----------------------------------------------------------------------------

resource "google_sql_database_instance" "main" {
  count               = var.cloud_provider == "gcp" ? 1 : 0
  name                = "${var.project_name}-pg"
  database_version    = "POSTGRES_16"
  region              = var.gcp_region
  deletion_protection = var.environment == "prod"

  settings {
    tier              = var.gcp_db_tier
    availability_type = var.environment == "prod" ? "REGIONAL" : "ZONAL"
    disk_autoresize   = true

    ip_configuration {
      ipv4_enabled    = false
      private_network = var.gcp_network_id
    }

    backup_configuration {
      enabled                        = true
      point_in_time_recovery_enabled = var.environment == "prod"
    }
  }

  depends_on = [var.gcp_private_services_connection]
}

resource "google_sql_user" "main" {
  count    = var.cloud_provider == "gcp" ? 1 : 0
  name     = var.db_username
  instance = google_sql_database_instance.main[0].name
  password = var.db_password
}

resource "google_sql_database" "auth_db" {
  count    = var.cloud_provider == "gcp" ? 1 : 0
  name     = "auth_db"
  instance = google_sql_database_instance.main[0].name
}

resource "google_sql_database" "core_db" {
  count    = var.cloud_provider == "gcp" ? 1 : 0
  name     = "core_db"
  instance = google_sql_database_instance.main[0].name
}

# -----------------------------------------------------------------------------
# Azure - Flexible Server PostgreSQL 16
# -----------------------------------------------------------------------------

resource "azurerm_private_dns_zone" "postgres" {
  count               = var.cloud_provider == "azure" ? 1 : 0
  name                = "${var.project_name}.postgres.database.azure.com"
  resource_group_name = var.azure_resource_group_name

  tags = var.tags
}

resource "azurerm_private_dns_zone_virtual_network_link" "postgres" {
  count                 = var.cloud_provider == "azure" ? 1 : 0
  name                  = "${var.project_name}-pg-dns-link"
  resource_group_name   = var.azure_resource_group_name
  private_dns_zone_name = azurerm_private_dns_zone.postgres[0].name
  virtual_network_id    = var.azure_vnet_id
}

resource "azurerm_postgresql_flexible_server" "main" {
  count                         = var.cloud_provider == "azure" ? 1 : 0
  name                          = "${var.project_name}-pg"
  resource_group_name           = var.azure_resource_group_name
  location                      = var.azure_location
  version                       = "16"
  delegated_subnet_id           = var.azure_database_subnet_id
  private_dns_zone_id           = azurerm_private_dns_zone.postgres[0].id
  administrator_login           = var.db_username
  administrator_password        = var.db_password
  sku_name                      = var.azure_db_sku
  storage_mb                    = 32768
  backup_retention_days         = var.environment == "prod" ? 7 : 1
  geo_redundant_backup_enabled  = var.environment == "prod"

  depends_on = [azurerm_private_dns_zone_virtual_network_link.postgres]

  tags = var.tags
}

resource "azurerm_postgresql_flexible_server_database" "auth_db" {
  count     = var.cloud_provider == "azure" ? 1 : 0
  name      = "auth_db"
  server_id = azurerm_postgresql_flexible_server.main[0].id
  charset   = "UTF8"
  collation = "en_US.utf8"
}

resource "azurerm_postgresql_flexible_server_database" "core_db" {
  count     = var.cloud_provider == "azure" ? 1 : 0
  name      = "core_db"
  server_id = azurerm_postgresql_flexible_server.main[0].id
  charset   = "UTF8"
  collation = "en_US.utf8"
}
