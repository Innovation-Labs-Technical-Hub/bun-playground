# Terraform Infrastructure for Bun Microservices

Multi-cloud Terraform configuration for deploying the Bun microservices monorepo (api-gateway, auth-service, core-service, user-service) with PostgreSQL, Redis, and Kafka.

## Prerequisites

- **Terraform** >= 1.5 ([install guide](https://developer.hashicorp.com/terraform/install))
- **Cloud CLI tools** (install the one matching your target provider):
  - AWS CLI (`aws configure`)
  - Google Cloud SDK (`gcloud auth application-default login`)
  - Azure CLI (`az login`)
- **Docker** for building container images
- Access to a container registry (ECR, GCR, or ACR)

## Directory Structure

```
infrastructure/terraform/
├── README.md                    # This file
├── modules/                     # Cloud-agnostic reusable modules
│   ├── networking/              # VPC/VNet, subnets, security groups
│   ├── database/                # PostgreSQL (RDS / Cloud SQL / Azure Flexible Server)
│   ├── cache/                   # Redis (ElastiCache / Memorystore / Azure Cache)
│   ├── messaging/               # Kafka (MSK / Managed Kafka / Event Hubs)
│   └── container/               # Services (ECS Fargate / Cloud Run / Container Apps)
├── aws/                         # AWS-specific root configuration
├── gcp/                         # GCP-specific root configuration
└── azure/                       # Azure-specific root configuration
```

Each cloud provider directory (`aws/`, `gcp/`, `azure/`) is an independent Terraform root module. You deploy to a single provider at a time.

## Quick Start

### 1. Choose a Cloud Provider

```bash
cd infrastructure/terraform/aws    # or gcp/ or azure/
```

### 2. Configure Variables

```bash
cp terraform.tfvars.example terraform.tfvars
# Edit terraform.tfvars with your values
```

### 3. Configure Remote Backend (recommended)

Edit `backend.tf` to uncomment the backend block and set your bucket/storage account names. Then create the backend resources using the CLI commands in the comments.

### 4. Initialize and Deploy

```bash
terraform init
terraform plan -out=tfplan
terraform apply tfplan
```

### 5. Destroy (when no longer needed)

```bash
terraform destroy
```

## Environment-Specific Configurations

Use separate `.tfvars` files or Terraform workspaces to manage different environments.

### Option A: Separate tfvars files

```bash
# Dev
terraform plan -var-file="environments/dev.tfvars" -out=tfplan

# Staging
terraform plan -var-file="environments/staging.tfvars" -out=tfplan

# Production
terraform plan -var-file="environments/prod.tfvars" -out=tfplan
```

### Option B: Terraform workspaces

```bash
terraform workspace new dev
terraform workspace new staging
terraform workspace new prod

terraform workspace select dev
terraform apply -var-file="dev.tfvars"
```

### Recommended Sizing by Environment

| Resource         | Dev              | Staging          | Prod              |
|-----------------|------------------|------------------|--------------------|
| DB (AWS)        | db.t4g.medium    | db.r6g.large     | db.r6g.xlarge      |
| DB (GCP)        | db-custom-2-4096 | db-custom-2-8192 | db-custom-4-16384  |
| DB (Azure)      | GP_Standard_D2s_v3 | GP_Standard_D2s_v3 | GP_Standard_D4s_v3 |
| Redis (AWS)     | cache.t4g.medium | cache.r6g.large  | cache.r6g.xlarge   |
| Redis (GCP)     | 1 GB             | 2 GB             | 4 GB               |
| Container CPU   | 0.5 vCPU         | 1 vCPU           | 2 vCPU             |
| Container Memory| 512 MB           | 1 GB             | 2 GB               |
| Service Replicas| 1                | 2                | 3+                 |

## Security Best Practices

### Secrets Management

- **Never commit** `terraform.tfvars` to version control. It is listed in `.gitignore`.
- Store database passwords and API keys in your cloud provider's secrets manager:
  - AWS: Secrets Manager or SSM Parameter Store
  - GCP: Secret Manager
  - Azure: Key Vault
- Use `sensitive = true` on all credential variables (already configured in modules).
- For CI/CD, inject secrets via environment variables (`TF_VAR_db_password`).

### Network Isolation

- All databases and caches are placed in private subnets with no public IP.
- Only the api-gateway service is publicly accessible (via ALB / Cloud Run ingress / Container App ingress).
- Internal services communicate over private networking only.
- Security groups / firewall rules restrict traffic to only necessary ports.

### Encryption

- **At rest**: RDS/Cloud SQL/Azure PostgreSQL encrypt storage by default. ElastiCache and Memorystore encryption is enabled. S3/GCS/Azure Storage backends use server-side encryption.
- **In transit**: TLS is enforced for Redis connections. MSK uses TLS for inter-broker and client communication. Database connections should use SSL.

### Additional Recommendations

- Enable MFA on cloud provider accounts.
- Use IAM roles with least-privilege policies.
- Enable audit logging (CloudTrail / Cloud Audit Logs / Azure Activity Log).
- Rotate database credentials regularly.
- Review security group rules periodically.

## Cost Optimization Tips

1. **Use dev-appropriate instance sizes.** The default configurations use smaller instances. Scale up only for staging/prod.
2. **Scale to zero in dev.** Cloud Run and Container Apps support scaling to zero when idle.
3. **Use reserved instances / committed use discounts** for prod workloads (RDS Reserved Instances, GCP Committed Use, Azure Reserved Capacity).
4. **Right-size MSK / Event Hubs.** Kafka clusters are expensive; consider using fewer brokers or smaller instances in non-prod environments.
5. **Monitor and alert on spend.** Set up billing alerts in your cloud provider's console.
6. **Destroy dev environments nightly.** Use CI/CD schedules to tear down and recreate dev infrastructure.
7. **Use Aurora Serverless v2** (AWS) for dev/staging databases to pay only for consumed capacity.

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Terraform Deploy
on:
  push:
    branches: [main]
    paths: ['infrastructure/terraform/**']

env:
  TF_VAR_db_username: ${{ secrets.DB_USERNAME }}
  TF_VAR_db_password: ${{ secrets.DB_PASSWORD }}

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: hashicorp/setup-terraform@v3
        with:
          terraform_version: "1.5"

      - name: Terraform Init
        working-directory: infrastructure/terraform/aws
        run: terraform init

      - name: Terraform Plan
        working-directory: infrastructure/terraform/aws
        run: terraform plan -out=tfplan

      - name: Terraform Apply
        working-directory: infrastructure/terraform/aws
        run: terraform apply -auto-approve tfplan
```

### Key CI/CD Considerations

- Always run `terraform plan` in PRs and require approval before applying.
- Store Terraform state remotely (S3, GCS, or Azure Storage) to enable team collaboration.
- Use separate state files per environment to prevent cross-environment interference.
- Pin provider and module versions to avoid unexpected changes.
- Use `terraform fmt -check` and `terraform validate` in CI checks.

## State Management Strategy

### Remote State

Each cloud provider directory uses a dedicated remote backend:
- **AWS**: S3 bucket with DynamoDB locking
- **GCP**: GCS bucket (built-in locking)
- **Azure**: Azure Storage blob (built-in locking)

### State Isolation

Maintain separate state files per environment:
```
s3://tf-state/bun-microservices/aws/dev/terraform.tfstate
s3://tf-state/bun-microservices/aws/staging/terraform.tfstate
s3://tf-state/bun-microservices/aws/prod/terraform.tfstate
```

Achieve this by parameterizing the backend `key` or by using Terraform workspaces.

### State File Security

- Enable versioning on the state bucket to recover from accidental corruption.
- Enable encryption at rest on the state bucket.
- Restrict access to the state bucket to only CI/CD service accounts and authorized operators.
- Never store state files locally or commit them to version control.

## Services Overview

| Service       | Port | Public | Description                     |
|--------------|------|--------|---------------------------------|
| api-gateway  | 3000 | Yes    | External-facing API gateway     |
| user-service | 3001 | No     | User management service         |
| auth-service | 3002 | No     | Authentication and authorization|
| core-service | 3003 | No     | Core business logic service     |

Supporting infrastructure:
- **PostgreSQL 16**: Two databases (`auth_db`, `core_db`)
- **Redis 7**: Shared caching layer
- **Kafka**: Event streaming between services
