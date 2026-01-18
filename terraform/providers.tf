terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 4.0"
    }
  }
}

provider "aws" {
  region = "ap-south-1"

  # Best Practice: Use default tags for cost allocation
  default_tags {
    tags = {
      Project     = var.project_name
      Environment = "Production-PoC"
      ManagedBy   = "Terraform"
    }
  }
}
