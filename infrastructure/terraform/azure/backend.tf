# Remote state backend using Azure Storage.
# Uncomment and configure before running `terraform init`.

# terraform {
#   backend "azurerm" {
#     resource_group_name  = "terraform-state-rg"
#     storage_account_name = "yourtfstateaccount"
#     container_name       = "tfstate"
#     key                  = "bun-microservices/azure/terraform.tfstate"
#   }
# }

# To create the backend resources, run these Azure CLI commands first:
#
# az group create --name terraform-state-rg --location eastus
#
# az storage account create \
#   --resource-group terraform-state-rg \
#   --name yourtfstateaccount \
#   --sku Standard_LRS \
#   --encryption-services blob
#
# az storage container create \
#   --name tfstate \
#   --account-name yourtfstateaccount
