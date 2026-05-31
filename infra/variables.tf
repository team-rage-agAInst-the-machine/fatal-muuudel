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
  description = "Senha do banco RDS (usuário fatal_app — só DML)"
  type        = string
  sensitive   = true
}

variable "db_migrator_password" {
  description = "Senha do usuário fatal_migrator — DDL, usado só pelo prisma migrate"
  type        = string
  sensitive   = true
}

variable "auth_secret" {
  description = "AUTH_SECRET do NextAuth (npx auth secret)"
  type        = string
  sensitive   = true
}

variable "app_url" {
  description = "URL pública da app. Usado como AUTH_URL."
  type        = string
  default     = "https://fatalmuuudel.com"
}

variable "github_repo" {
  description = "URL do repositório Git para clonar na EC2 (ex: https://github.com/org/fatal-muuudel)"
  type        = string
}

variable "domain" {
  description = "Domínio da aplicação (ex: fatalmuuudel.com)"
  type        = string
  default     = "fatalmuuudel.com"
}

variable "allowed_ssh_cidrs" {
  description = "CIDRs permitidos para acesso SSH à EC2. Use o IP da equipe ou range da VPN. NÃO use 0.0.0.0/0 em produção."
  type        = list(string)
}
