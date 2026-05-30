variable "aws_region" {
  description = "Região AWS"
  type        = string
  default     = "us-east-1"
}

variable "key_pair_name" {
  description = "Nome do key pair EC2 criado no console AWS (sem .pem)"
  type        = string
}

variable "db_username" {
  description = "Usuário do banco RDS"
  type        = string
  default     = "fatal"
}

variable "db_password" {
  description = "Senha do banco RDS"
  type        = string
  sensitive   = true
}

variable "auth_secret" {
  description = "AUTH_SECRET do NextAuth (npx auth secret)"
  type        = string
  sensitive   = true
}

variable "app_url" {
  description = "URL pública da app (ex: http://1.2.3.4). Usado como AUTH_URL."
  type        = string
  default     = "" # será preenchido depois com o Elastic IP
}

variable "github_repo" {
  description = "URL do repositório Git para clonar na EC2 (ex: https://github.com/org/fatal-muuudel)"
  type        = string
}
