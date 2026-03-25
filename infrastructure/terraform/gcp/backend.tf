# Remote state backend using Google Cloud Storage.
# Uncomment and configure before running `terraform init`.

# terraform {
#   backend "gcs" {
#     bucket = "your-terraform-state-bucket"
#     prefix = "bun-microservices/gcp"
#   }
# }

# To create the backend bucket, run:
#
# gcloud storage buckets create gs://your-terraform-state-bucket \
#   --project=your-gcp-project \
#   --location=us-central1 \
#   --uniform-bucket-level-access
#
# gcloud storage buckets update gs://your-terraform-state-bucket \
#   --versioning
