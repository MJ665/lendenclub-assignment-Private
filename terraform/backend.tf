terraform {
  # For this hiring PoC, we are using a local backend to avoid requiring S3 credentials setup.
  # In a production environment, uncomment the following block to use S3 for remote state.
  
  # backend "s3" {
  #   bucket         = "project-infraguard-tfstate"
  #   key            = "terraform.tfstate"
  #   region         = "ap-south-1"
  #   dynamodb_table = "terraform-lock"
  #   encrypt        = true
  # }
}
