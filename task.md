# Tasks — Fatal Muuudel

## 🛸 DECISÃO (2026-05-31): Migrar deploy para a Vercel

O deploy/provisionamento na AWS (EC2 + RDS + Nginx + PM2 via Terraform) acumulou
débito técnico demais e a recriação da EC2 falhava em cascata. Decidimos migrar o
deploy para a **Vercel** (nativo para Next.js).

- [x] Desabilitados os workflows `deploy.yml` e `provisionamento.yml` (gatilho só
      manual + job no-op; conteúdo original preservado comentado nos arquivos)
- [ ] **Configurar deploy na Vercel** — importar o repo, setar env vars
      (`DATABASE_URL`, `AUTH_SECRET`, `AUTH_URL`, `AWS_REGION`, `AWS_S3_BUCKET`),
      conectar o domínio `fatalmuuudel.com`. O RDS pode continuar na AWS (a Vercel
      acessa via internet — conferir security group do RDS para permitir).
- [ ] **Decidir destino da infra AWS** — destruir (`terraform destroy`) o que não
      for mais usado (EC2, EIP, Nginx) para parar de pagar, ou manter só o RDS.

### 🧰 Corrigir o Terraform/provisionamento no futuro (se voltar pra AWS)

A pasta `infra/` tem bugs reais de escaping em camadas (Terraform `templatefile`
→ shell externo → `bash -c` interno) que quebravam o `prisma migrate deploy` no
`user_data.sh`. Resumo das causas encontradas na saga de 2026-05-31:

- [ ] **`user_data.sh` — escaping do migrate**: o bloco roda em `bash -c "..."`
      (aspas duplas); o shell externo expande `${...}` antes do `source` interno.
      A forma correta na fonte é `\$${VAR}` (vira `\${VAR}` após o templatefile),
      senão o `${DATABASE_URL_MIGRATE:?}` aborta com "nao definida". **Validar
      SEMPRE** renderizando o template + `bash -n` + rodar o `bash -c` real antes
      de recriar a EC2.
- [ ] **Sincronizar `main` antes de mergear fixes de infra** — vários PRs foram
      mergeados com commit intermediário errado. Conferir o conteúdo final.
- [ ] **`fatal_migrator` precisa de GRANT nas tabelas JÁ existentes**
      (`GRANT ALL ON ALL TABLES/SEQUENCES`), não só `ALTER DEFAULT PRIVILEGES`.
- [ ] **`CREATE USER` deve ser idempotente** (`DO $$ IF NOT EXISTS ... CREATE ROLE`).
- [ ] **PM2 com `--cwd`**: `pm2 start npm --cwd /opt/fatal-muuudel --update-env -- start`.
- [ ] **`allowed_ssh_cidrs`** (list) deve ir via `TF_VAR_allowed_ssh_cidrs` env, não `-var` no shell.

## 🚨 Correções Urgentes (Débito Técnico da Sessão)

### Infra & Deploy

- [ ] **`npm install` no deploy em vez de `npm ci`** — trocado por gabiarra pois o `package-lock.json` gerado no Node 24 local não é compatível com o Node 20 da EC2. Solução correta: atualizar Node da EC2 para 22+ e voltar para `npm ci`
- [ ] **Nginx configurado manualmente** — o `user_data.sh` não está configurando o Nginx corretamente no bootstrap. Se a EC2 for recriada, será necessário rodar os comandos manualmente de novo. Solução: corrigir o `user_data.sh` para rodar tudo como `ec2-user` com permissões corretas
- [ ] **PM2 iniciado manualmente** — o PM2 precisa ser iniciado com `pm2 start /opt/fatal-muuudel/node_modules/.bin/next --cwd /opt/fatal-muuudel -- start`. O `user_data.sh` atual não faz isso corretamente
- [ ] **Certbot não configurado** — HTTPS ainda não está ativo. Rodar após DNS propagar completamente: `sudo certbot --nginx -d fatalmuuudel.com -d www.fatalmuuudel.com --non-interactive --agree-tos -m admin@fatalmuuudel.com --redirect`
- [ ] **`/etc/fatal-muuudel.env` com espaços no início das linhas** — causado pelo `nano` com indentação. Corrigir com `sudo sed -i 's/^  //' /etc/fatal-muuudel.env`
- [ ] **`AUTH_SECRET` no Terraform era `"fatal-muuudel-key"`** — foi corrigido manualmente na EC2 mas o secret do GitHub `TF_VAR_AUTH_SECRET` precisa ser atualizado com um valor real gerado por `npx auth secret --raw`
- [ ] **`TF_VAR_APP_URL` vazio nos secrets do GitHub** — atualizar com `https://fatalmuuudel.com`
- [ ] **Estado do Terraform local desatualizado** — após todas as recriações manuais de recursos, o `terraform.tfstate` no S3 pode estar inconsistente. Rodar `terraform plan` para verificar drift

### Banco de Dados

- [ ] **Migration aplicada manualmente** — foi necessário rodar `DROP SCHEMA public CASCADE` e reaplicar a migration manualmente. Investigar por que a migration falhou no bootstrap e corrigir o fluxo
- [ ] **Grants do banco aplicados manualmente** — o `user_data.sh` não está aplicando os grants necessários. Adicionar no bootstrap: `GRANT ALL ON SCHEMA public TO fatal; ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO fatal;`

### CI/CD

- [ ] **Deploy não faz build correto** — o `deploy.yml` faz `npm run build` mas o PM2 continua rodando a versão antiga até ser reiniciado. O `pm2 reload --update-env` deveria ser suficiente mas não está pegando o novo `.next`. Investigar uso de `pm2 restart` vs `reload`
- [ ] **`user_data.sh` e `deploy.yml` fora de sincronia** — o bootstrap cria o ambiente como `root`, o deploy tenta rodar como `ec2-user`. Padronizar para `ec2-user` em tudo
- [ ] **Chave SSH exposta no chat 3x** — rotacionar o key pair `fatal-muuudel-key` e atualizar o secret `EC2_SSH_KEY` no GitHub

---

## ✅ O que foi implementado nessa sessão

### Infra (Terraform)
- VPC com subnets públicas e privadas, Internet Gateway, route tables
- EC2 `c7i-flex.large` com Amazon Linux 2023 (AMI via data source — sempre atualizada)
- Elastic IP fixo: `100.49.221.228`
- RDS PostgreSQL 17 `db.t3.micro` em subnet privada
- S3 `fatal-muuudel-uploads-55f4b7ce` com CORS configurado
- Security groups: EC2 exposta em 80/443/22, RDS acessível apenas pela EC2
- Backend do estado Terraform no S3 (`fatal-muuudel-tfstate`)

### CI/CD (GitHub Actions)
- `testes-estelares.yml` — roda testes em PRs e push na main
- `provisionamento.yml` — roda Terraform em push na main quando `infra/**` muda
- `deploy.yml` — deploya na EC2 via SSH em push na main

### DNS & Domínio
- Domínio `fatalmuuudel.com` apontando para `100.49.221.228`
- Nginx configurado como reverse proxy para `localhost:3000`
- HTTPS pendente (Certbot bloqueado por DNS duplo na Hostgator — já resolvido, aguardando propagação)

### App
- Aplicação rodando em `http://fatalmuuudel.com`
- PM2 gerenciando o processo com `next start`
- Migration aplicada, tabelas criadas: `User`, `Cow`, `Swipe`, `Abduction`, `Account`, `Session`, `VerificationToken`

---

## 🔧 Melhorias Estruturais (próximas sprints)

- [ ] Migrar Node.js da EC2 de 20 para 22 (requisito do `@prisma/streams-local`)
- [ ] Adicionar health check endpoint (`/api/health`) e configurar no Nginx
- [ ] Configurar renovação automática do certificado SSL (`certbot renew` via cron)
- [ ] Mover segredos do `.env` da EC2 para AWS Secrets Manager e buscar no bootstrap
- [ ] Adicionar `terraform.tfvars` de produção ao backend S3 (não versionar localmente)
- [ ] Configurar alarme no CloudWatch para CPU/memória da EC2 e RDS
- [ ] Adicionar step de smoke test no `deploy.yml` após o PM2 reiniciar
- [ ] Versionar o Nginx config no repositório e aplicar via deploy ao invés de manual
