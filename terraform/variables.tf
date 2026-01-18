variable "aws_region" {
  description = "AWS Region to deploy resources"
  default     = "ap-south-1"
}

variable "project_name" {
  description = "Name of the project"
  default     = "InfraGuard"
}

variable "vpc_cidr" {
  description = "CIDR block for the VPC"
  default     = "10.0.0.0/16"
}

variable "public_subnet_cidr" {
  description = "CIDR block for the public subnet"
  default     = "10.0.1.0/24"
}

variable "instance_type" {
  description = "EC2 Instance Type"
  default     = "t2.micro"
}

variable "ami_id" {
  description = "AMI ID for the EC2 instance (Amazon Linux 2)"
  default     = "ami-0d682f26195e9ec0f" 
}

variable "db_password" {
  description = "Password for the RDS instance"
  type        = string
  sensitive   = true
  default     = "ChangeMeInProduction!"
}
