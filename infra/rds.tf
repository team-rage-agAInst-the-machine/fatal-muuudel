resource "aws_db_subnet_group" "main" {
  name       = "fatal-muuudel-db-subnet"
  subnet_ids = [aws_subnet.private_a.id, aws_subnet.private_b.id]

  tags = { Name = "fatal-muuudel-db-subnet-group" }
}

resource "aws_db_instance" "postgres" {
  identifier = "fatal-muuudel-db"

  # Free tier: db.t3.micro, 20GB, Single-AZ, sem encryption
  instance_class        = "db.t3.micro"
  allocated_storage     = 20
  storage_type          = "gp2"
  storage_encrypted     = false
  multi_az              = false
  publicly_accessible   = false

  engine         = "postgres"
  engine_version = "17"

  db_name  = "fatal_muuudel"
  username = var.db_username
  password = var.db_password

  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [aws_security_group.rds.id]

  skip_final_snapshot       = true
  delete_automated_backups  = true
  backup_retention_period   = 0 # desativa backup automático (free tier)

  tags = { Name = "fatal-muuudel-postgres" }
}
