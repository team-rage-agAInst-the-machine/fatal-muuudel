#!/bin/bash
set -euo pipefail
exec > /var/log/user-data.log 2>&1

# ── Dependências ──────────────────────────────────────────────────────────────
dnf update -y
dnf install -y git nginx python3-certbot-nginx

# Node.js 20
curl -fsSL https://rpm.nodesource.com/setup_20.x | bash -
dnf install -y nodejs

# PM2
npm install -g pm2

# ── App ───────────────────────────────────────────────────────────────────────
APP_DIR="/opt/fatal-muuudel"
git clone "${github_repo}" "$APP_DIR"
cd "$APP_DIR"

# Variáveis de ambiente
cat > /etc/fatal-muuudel.env <<EOF
DATABASE_URL="${db_url}"
AUTH_SECRET="${auth_secret}"
AUTH_URL="https://${domain}"
AWS_REGION="${aws_region}"
AWS_S3_BUCKET="${s3_bucket}"
NODE_ENV=production
PORT=3000
EOF

# Instala dependências e builda
export $(cat /etc/fatal-muuudel.env | xargs)
npm ci --omit=dev
npx prisma generate
npx prisma migrate deploy
npm run build

# ── PM2 ───────────────────────────────────────────────────────────────────────
pm2 start npm --name "fatal-muuudel" -- start
pm2 save
pm2 startup systemd -u root --hp /root | tail -1 | bash

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
