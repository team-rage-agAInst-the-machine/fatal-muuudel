data "aws_ami" "amazon_linux_2023" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["al2023-ami-2023*-x86_64"]
  }

  filter {
    name   = "state"
    values = ["available"]
  }
}

resource "aws_instance" "app" {
  ami                    = data.aws_ami.amazon_linux_2023.id
  instance_type          = "c7i-flex.large"
  subnet_id              = aws_subnet.public.id
  vpc_security_group_ids = [aws_security_group.ec2.id]
  key_name               = var.key_pair_name

  user_data = base64encode(templatefile("${path.module}/user_data.sh", {
    db_url      = "postgresql://${var.db_username}:${var.db_password}@${aws_db_instance.postgres.address}:5432/fatal_muuudel?schema=public"
    auth_secret = var.auth_secret
    s3_bucket   = aws_s3_bucket.uploads.bucket
    aws_region  = var.aws_region
    app_url     = var.app_url
    github_repo = var.github_repo
    domain      = var.domain
  }))

  tags = { Name = "fatal-muuudel-app" }
}

resource "aws_eip" "app" {
  instance = aws_instance.app.id
  domain   = "vpc"

  tags = { Name = "fatal-muuudel-eip" }
}
