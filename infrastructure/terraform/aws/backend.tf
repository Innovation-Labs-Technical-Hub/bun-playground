# Remote state backend using S3 + DynamoDB for locking.
# Uncomment and configure before running `terraform init`.

# terraform {
#   backend "s3" {
#     bucket         = "your-terraform-state-bucket"
#     key            = "bun-microservices/aws/terraform.tfstate"
#     region         = "us-east-1"
#     encrypt        = true
#     dynamodb_table = "terraform-state-lock"
#   }
# }

# To create the backend resources, run these AWS CLI commands first:
#
# aws s3api create-bucket \
#   --bucket your-terraform-state-bucket \
#   --region us-east-1
#
# aws s3api put-bucket-versioning \
#   --bucket your-terraform-state-bucket \
#   --versioning-configuration Status=Enabled
#
# aws s3api put-bucket-encryption \
#   --bucket your-terraform-state-bucket \
#   --server-side-encryption-configuration \
#     '{"Rules":[{"ApplyServerSideEncryptionByDefault":{"SSEAlgorithm":"aws:kms"}}]}'
#
# aws dynamodb create-table \
#   --table-name terraform-state-lock \
#   --attribute-definitions AttributeName=LockID,AttributeType=S \
#   --key-schema AttributeName=LockID,KeyType=HASH \
#   --billing-mode PAY_PER_REQUEST
