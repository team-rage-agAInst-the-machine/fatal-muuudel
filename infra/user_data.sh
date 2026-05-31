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
AUTH_SECRET="${auth_secret}"
AUTH_URL="https://${domain}"
AWS_REGION="${aws_region}"
AWS_S3_BUCKET="${s3_bucket}"
NODE_ENV=production
PORT=3000
EOF
chmod 640 /etc/fatal-muuudel.env
chown root:ec2-user /etc/fatal-muuudel.env

# ── Banco: grants para o usuário da aplicação ─────────────────────────────────
# Necessário para que o Prisma consiga criar/alterar tabelas no schema public
dnf install -y postgresql17
PGPASSWORD="${db_password}" psql -h "${db_host}" -U "${db_username}" -d fatal_muuudel <<SQL
GRANT ALL ON SCHEMA public TO ${db_username};
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO ${db_username};
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO ${db_username};
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
  ./node_modules/.bin/prisma migrate deploy
  npm run build
"

# ── PM2 ───────────────────────────────────────────────────────────────────────
sudo -u ec2-user bash -c "
  set -euo pipefail
  export HOME=/home/ec2-user
  export PATH=\$PATH:/usr/bin:/usr/local/bin
  cd $APP_DIR
  set -a; source /etc/fatal-muuudel.env; set +a
  pm2 start $APP_DIR/node_modules/.bin/next --name fatal-muuudel -- start
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
