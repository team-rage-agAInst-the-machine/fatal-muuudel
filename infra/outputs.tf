output "app_ip" {
  description = "IP público da EC2 (Elastic IP)"
  value       = aws_eip.app.public_ip
}

output "app_url" {
  description = "URL da aplicação"
  value       = "http://${aws_eip.app.public_ip}"
}

output "rds_endpoint" {
  description = "Endpoint do banco RDS (interno à VPC)"
  value       = aws_db_instance.postgres.address
}

output "s3_bucket" {
  description = "Nome do bucket S3 de uploads"
  value       = aws_s3_bucket.uploads.bucket
}

output "s3_url" {
  description = "URL base dos uploads no S3"
  value       = "https://${aws_s3_bucket.uploads.bucket}.s3.${var.aws_region}.amazonaws.com"
}

output "database_url" {
  description = "DATABASE_URL para usar no .env de produção"
  value       = "postgresql://${var.db_username}:${var.db_password}@${aws_db_instance.postgres.address}:5432/fatal_muuudel?schema=public"
  sensitive   = true
}

output "ssh_command" {
  description = "Comando SSH para acessar a instância"
  value       = "ssh -i <sua-chave>.pem ec2-user@${aws_eip.app.public_ip}"
}
