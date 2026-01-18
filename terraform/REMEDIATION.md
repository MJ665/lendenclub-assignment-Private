# 🛠️ Remediation Instructions

## 1. SSH Vulnerability (CRITICAL)
**Issue**: Security Group allows ingress from `0.0.0.0/0` on port 22.
**Fix**: Restrict CIDR to your specific IP address or a VPN range.
```hcl
variable "admin_ip" {
  description = "Admin IP for SSH access"
  default     = "YOUR_IP_ADDRESS/32"
}

resource "aws_security_group_rule" "ssh" {
  type              = "ingress"
  from_port         = 22
  to_port           = 22
  protocol          = "tcp"
  cidr_blocks       = [var.admin_ip]
  security_group_id = aws_security_group.web_sg.id
}
```

## 2. Unencrypted Volume (HIGH)
**Issue**: `encrypted = false` in `root_block_device`.
**Fix**: Enable encryption.
```hcl
  root_block_device {
    encrypted   = true
    volume_size = 8
    volume_type = "gp2"
  }
```

## 3. Public RDS (CRITICAL)
**Issue**: `publicly_accessible = true`.
**Fix**: Set to false and ensure it is in private subnets (if architecture supports NAT Gateway) or just remove public access flag.
```hcl
  publicly_accessible = false
```
