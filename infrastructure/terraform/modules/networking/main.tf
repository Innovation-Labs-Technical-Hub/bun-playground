# Networking Module - Cloud-agnostic interface
# Provisions VPC/VNet with public and private subnets, security groups/NSGs

terraform {
  required_version = ">= 1.5"
}

variable "cloud_provider" {
  description = "Cloud provider: aws, gcp, or azure"
  type        = string
  validation {
    condition     = contains(["aws", "gcp", "azure"], var.cloud_provider)
    error_message = "cloud_provider must be one of: aws, gcp, azure"
  }
}

# -----------------------------------------------------------------------------
# AWS Resources
# -----------------------------------------------------------------------------

resource "aws_vpc" "main" {
  count                = var.cloud_provider == "aws" ? 1 : 0
  cidr_block           = var.vpc_cidr
  enable_dns_support   = true
  enable_dns_hostnames = true

  tags = merge(var.tags, { Name = "${var.project_name}-vpc" })
}

resource "aws_internet_gateway" "main" {
  count  = var.cloud_provider == "aws" ? 1 : 0
  vpc_id = aws_vpc.main[0].id

  tags = merge(var.tags, { Name = "${var.project_name}-igw" })
}

resource "aws_subnet" "public" {
  count                   = var.cloud_provider == "aws" ? length(var.availability_zones) : 0
  vpc_id                  = aws_vpc.main[0].id
  cidr_block              = cidrsubnet(var.vpc_cidr, 4, count.index)
  availability_zone       = var.availability_zones[count.index]
  map_public_ip_on_launch = true

  tags = merge(var.tags, { Name = "${var.project_name}-public-${count.index}" })
}

resource "aws_subnet" "private" {
  count             = var.cloud_provider == "aws" ? length(var.availability_zones) : 0
  vpc_id            = aws_vpc.main[0].id
  cidr_block        = cidrsubnet(var.vpc_cidr, 4, count.index + length(var.availability_zones))
  availability_zone = var.availability_zones[count.index]

  tags = merge(var.tags, { Name = "${var.project_name}-private-${count.index}" })
}

resource "aws_eip" "nat" {
  count  = var.cloud_provider == "aws" ? 1 : 0
  domain = "vpc"

  tags = merge(var.tags, { Name = "${var.project_name}-nat-eip" })
}

resource "aws_nat_gateway" "main" {
  count         = var.cloud_provider == "aws" ? 1 : 0
  allocation_id = aws_eip.nat[0].id
  subnet_id     = aws_subnet.public[0].id

  tags = merge(var.tags, { Name = "${var.project_name}-nat" })
}

resource "aws_route_table" "public" {
  count  = var.cloud_provider == "aws" ? 1 : 0
  vpc_id = aws_vpc.main[0].id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main[0].id
  }

  tags = merge(var.tags, { Name = "${var.project_name}-public-rt" })
}

resource "aws_route_table" "private" {
  count  = var.cloud_provider == "aws" ? 1 : 0
  vpc_id = aws_vpc.main[0].id

  route {
    cidr_block     = "0.0.0.0/0"
    nat_gateway_id = aws_nat_gateway.main[0].id
  }

  tags = merge(var.tags, { Name = "${var.project_name}-private-rt" })
}

resource "aws_route_table_association" "public" {
  count          = var.cloud_provider == "aws" ? length(var.availability_zones) : 0
  subnet_id      = aws_subnet.public[count.index].id
  route_table_id = aws_route_table.public[0].id
}

resource "aws_route_table_association" "private" {
  count          = var.cloud_provider == "aws" ? length(var.availability_zones) : 0
  subnet_id      = aws_subnet.private[count.index].id
  route_table_id = aws_route_table.private[0].id
}

resource "aws_security_group" "services" {
  count       = var.cloud_provider == "aws" ? 1 : 0
  name        = "${var.project_name}-services-sg"
  description = "Security group for microservices"
  vpc_id      = aws_vpc.main[0].id

  ingress {
    from_port   = 3000
    to_port     = 3003
    protocol    = "tcp"
    cidr_blocks = [var.vpc_cidr]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = merge(var.tags, { Name = "${var.project_name}-services-sg" })
}

resource "aws_security_group" "database" {
  count       = var.cloud_provider == "aws" ? 1 : 0
  name        = "${var.project_name}-database-sg"
  description = "Security group for database"
  vpc_id      = aws_vpc.main[0].id

  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.services[0].id]
  }

  tags = merge(var.tags, { Name = "${var.project_name}-database-sg" })
}

resource "aws_security_group" "cache" {
  count       = var.cloud_provider == "aws" ? 1 : 0
  name        = "${var.project_name}-cache-sg"
  description = "Security group for Redis cache"
  vpc_id      = aws_vpc.main[0].id

  ingress {
    from_port       = 6379
    to_port         = 6379
    protocol        = "tcp"
    security_groups = [aws_security_group.services[0].id]
  }

  tags = merge(var.tags, { Name = "${var.project_name}-cache-sg" })
}

resource "aws_security_group" "kafka" {
  count       = var.cloud_provider == "aws" ? 1 : 0
  name        = "${var.project_name}-kafka-sg"
  description = "Security group for Kafka"
  vpc_id      = aws_vpc.main[0].id

  ingress {
    from_port       = 9092
    to_port         = 9098
    protocol        = "tcp"
    security_groups = [aws_security_group.services[0].id]
  }

  tags = merge(var.tags, { Name = "${var.project_name}-kafka-sg" })
}

resource "aws_security_group" "alb" {
  count       = var.cloud_provider == "aws" ? 1 : 0
  name        = "${var.project_name}-alb-sg"
  description = "Security group for ALB"
  vpc_id      = aws_vpc.main[0].id

  ingress {
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = merge(var.tags, { Name = "${var.project_name}-alb-sg" })
}

# -----------------------------------------------------------------------------
# GCP Resources
# -----------------------------------------------------------------------------

resource "google_compute_network" "main" {
  count                   = var.cloud_provider == "gcp" ? 1 : 0
  name                    = "${var.project_name}-vpc"
  auto_create_subnetworks = false
}

resource "google_compute_subnetwork" "public" {
  count         = var.cloud_provider == "gcp" ? 1 : 0
  name          = "${var.project_name}-public"
  ip_cidr_range = cidrsubnet(var.vpc_cidr, 4, 0)
  network       = google_compute_network.main[0].id
  region        = var.gcp_region
}

resource "google_compute_subnetwork" "private" {
  count                    = var.cloud_provider == "gcp" ? 1 : 0
  name                     = "${var.project_name}-private"
  ip_cidr_range            = cidrsubnet(var.vpc_cidr, 4, 1)
  network                  = google_compute_network.main[0].id
  region                   = var.gcp_region
  private_ip_google_access = true
}

resource "google_compute_global_address" "private_services" {
  count         = var.cloud_provider == "gcp" ? 1 : 0
  name          = "${var.project_name}-private-ip"
  purpose       = "VPC_PEERING"
  address_type  = "INTERNAL"
  prefix_length = 16
  network       = google_compute_network.main[0].id
}

resource "google_service_networking_connection" "private" {
  count                   = var.cloud_provider == "gcp" ? 1 : 0
  network                 = google_compute_network.main[0].id
  service                 = "servicenetworking.googleapis.com"
  reserved_peering_ranges = [google_compute_global_address.private_services[0].name]
}

resource "google_compute_firewall" "allow_internal" {
  count   = var.cloud_provider == "gcp" ? 1 : 0
  name    = "${var.project_name}-allow-internal"
  network = google_compute_network.main[0].name

  allow {
    protocol = "tcp"
    ports    = ["0-65535"]
  }

  source_ranges = [var.vpc_cidr]
}

resource "google_compute_router" "main" {
  count   = var.cloud_provider == "gcp" ? 1 : 0
  name    = "${var.project_name}-router"
  network = google_compute_network.main[0].name
  region  = var.gcp_region
}

resource "google_compute_router_nat" "main" {
  count                              = var.cloud_provider == "gcp" ? 1 : 0
  name                               = "${var.project_name}-nat"
  router                             = google_compute_router.main[0].name
  region                             = var.gcp_region
  nat_ip_allocate_option             = "AUTO_ONLY"
  source_subnetwork_ip_ranges_to_nat = "ALL_SUBNETWORKS_ALL_IP_RANGES"
}

# -----------------------------------------------------------------------------
# Azure Resources
# -----------------------------------------------------------------------------

resource "azurerm_virtual_network" "main" {
  count               = var.cloud_provider == "azure" ? 1 : 0
  name                = "${var.project_name}-vnet"
  address_space       = [var.vpc_cidr]
  location            = var.azure_location
  resource_group_name = var.azure_resource_group_name

  tags = var.tags
}

resource "azurerm_subnet" "public" {
  count                = var.cloud_provider == "azure" ? 1 : 0
  name                 = "${var.project_name}-public"
  resource_group_name  = var.azure_resource_group_name
  virtual_network_name = azurerm_virtual_network.main[0].name
  address_prefixes     = [cidrsubnet(var.vpc_cidr, 4, 0)]
}

resource "azurerm_subnet" "private" {
  count                = var.cloud_provider == "azure" ? 1 : 0
  name                 = "${var.project_name}-private"
  resource_group_name  = var.azure_resource_group_name
  virtual_network_name = azurerm_virtual_network.main[0].name
  address_prefixes     = [cidrsubnet(var.vpc_cidr, 4, 1)]

  delegation {
    name = "container-apps"
    service_delegation {
      name = "Microsoft.App/environments"
    }
  }
}

resource "azurerm_subnet" "database" {
  count                = var.cloud_provider == "azure" ? 1 : 0
  name                 = "${var.project_name}-database"
  resource_group_name  = var.azure_resource_group_name
  virtual_network_name = azurerm_virtual_network.main[0].name
  address_prefixes     = [cidrsubnet(var.vpc_cidr, 4, 2)]

  delegation {
    name = "postgresql"
    service_delegation {
      name = "Microsoft.DBforPostgreSQL/flexibleServers"
    }
  }
}

resource "azurerm_network_security_group" "services" {
  count               = var.cloud_provider == "azure" ? 1 : 0
  name                = "${var.project_name}-services-nsg"
  location            = var.azure_location
  resource_group_name = var.azure_resource_group_name

  security_rule {
    name                       = "allow-services"
    priority                   = 100
    direction                  = "Inbound"
    access                     = "Allow"
    protocol                   = "Tcp"
    source_port_range          = "*"
    destination_port_range     = "3000-3003"
    source_address_prefix      = var.vpc_cidr
    destination_address_prefix = "*"
  }

  tags = var.tags
}
