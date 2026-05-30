#!/bin/bash
set -euo pipefail
exec > /var/log/user-data.log 2>&1

# ── Dependências ──────────────────────────────────────────────────────────────
dnf update -y
dnf install -y git

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
AUTH_URL="${app_url}"
AWS_REGION="${aws_region}"
AWS_S3_BUCKET="${s3_bucket}"
NODE_ENV=production
PORT=80
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

echo "🛸 Fatal Muuudel no ar!"
