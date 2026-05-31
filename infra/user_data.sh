#!/bin/bash
set -euo pipefail
exec > /var/log/user-data.log 2>&1

# ── Dependências ──────────────────────────────────────────────────────────────
dnf update -y
dnf install -y git nginx python3-certbot-nginx

# Node.js 22
curl -fsSL https://rpm.nodesource.com/setup_22.x | bash -
dnf install -y nodejs

# PM2
npm install -g pm2

# ── App ───────────────────────────────────────────────────────────────────────
APP_DIR="/opt/fatal-muuudel"
git clone "${github_repo}" "$APP_DIR"
chown -R ec2-user:ec2-user "$APP_DIR"

# Variáveis de ambiente (sem indentação para evitar espaços extras)
cat > /etc/fatal-muuudel.env <<EOF
DATABASE_URL="${db_url}"
DATABASE_URL_MIGRATE="${db_migrate_url}"
AUTH_SECRET="${auth_secret}"
AUTH_URL="https://${domain}"
AWS_REGION="${aws_region}"
AWS_S3_BUCKET="${s3_bucket}"
NODE_ENV=production
PORT=3000
EOF
chmod 640 /etc/fatal-muuudel.env
chown root:ec2-user /etc/fatal-muuudel.env

# ── Banco: criar usuários e aplicar grants mínimos ────────────────────────────
# fatal_migrator — DDL (usado só pelo prisma migrate)
# fatal_app      — DML apenas (usado pelo app em runtime)
dnf install -y postgresql17
PGPASSWORD="${db_admin_password}" psql -h "${db_host}" -U "${db_admin_username}" -d fatal_muuudel <<SQL
-- Cria os usuários de forma idempotente (re-provisionamento não pode falhar
-- se eles já existirem). O ALTER reconcilia a senha em ambos os casos.
DO \$\$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'fatal_migrator') THEN
    CREATE ROLE fatal_migrator LOGIN;
  END IF;
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = 'fatal_app') THEN
    CREATE ROLE fatal_app LOGIN;
  END IF;
END
\$\$;
ALTER USER fatal_migrator WITH PASSWORD '${db_migrator_password}';
ALTER USER fatal_app      WITH PASSWORD '${db_admin_password}';

-- migrator: acesso total ao schema para DDL
GRANT ALL ON SCHEMA public TO fatal_migrator;
-- tabelas/sequences que JÁ existem (ex: _prisma_migrations, criadas por outro
-- usuário num provisionamento anterior) — ALTER DEFAULT só cobre as futuras.
GRANT ALL ON ALL TABLES    IN SCHEMA public TO fatal_migrator;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO fatal_migrator;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES    TO fatal_migrator;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO fatal_migrator;

-- app: apenas DML
GRANT USAGE ON SCHEMA public TO fatal_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES    IN SCHEMA public TO fatal_app;
GRANT USAGE, SELECT                  ON ALL SEQUENCES IN SCHEMA public TO fatal_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES    TO fatal_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT                  ON SEQUENCES TO fatal_app;
SQL

# ── Build como ec2-user ───────────────────────────────────────────────────────
sudo -u ec2-user bash -c "
  set -euo pipefail
  export HOME=/home/ec2-user
  export PATH=\$PATH:/usr/bin:/usr/local/bin
  cd $APP_DIR
  set -a; source /etc/fatal-muuudel.env; set +a
  npm ci
  ./node_modules/.bin/prisma generate
  : \$${DATABASE_URL_MIGRATE:?DATABASE_URL_MIGRATE nao definida no .env}
  DATABASE_URL=\$${DATABASE_URL_MIGRATE} ./node_modules/.bin/prisma migrate deploy
  npm run build
"

# ── PM2 ───────────────────────────────────────────────────────────────────────
sudo -u ec2-user bash -c "
  set -euo pipefail
  export HOME=/home/ec2-user
  export PATH=\$PATH:/usr/bin:/usr/local/bin
  cd $APP_DIR
  set -a; source /etc/fatal-muuudel.env; set +a
  pm2 start npm --name fatal-muuudel --cwd $APP_DIR -- start
  pm2 save
"
env PATH=\$PATH:/usr/bin /usr/bin/pm2 startup systemd -u ec2-user --hp /home/ec2-user | tail -1 | bash

# ── Nginx ─────────────────────────────────────────────────────────────────────
cat > /etc/nginx/conf.d/fatal-muuudel.conf <<EOF
server {
    listen 80;
    server_name ${domain} www.${domain};

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

systemctl enable nginx
systemctl start nginx

# ── HTTPS (Let's Encrypt) ─────────────────────────────────────────────────────
certbot --nginx -d ${domain} -d www.${domain} --non-interactive --agree-tos -m admin@${domain} --redirect

echo "🛸 Fatal Muuudel no ar!"
