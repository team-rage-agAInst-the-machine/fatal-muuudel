# 🛸 Fatal Muuudel

Tinder/Fatal Model para extraterrestres escolherem quais vacas vão abduzir.
Stack: **Next.js 16 (App Router) + React 19 + TypeScript + Postgres + Prisma + Auth.js v5 + Tailwind + shadcn/ui**.

## Setup

```bash
# 1. Dependências
npm install

# 2. Variáveis de ambiente
cp .env.example .env
# preencha DATABASE_URL e gere AUTH_SECRET com:
npx auth secret

# 3. Banco de dados (com Postgres rodando localmente)
npx prisma migrate dev --name init
npx prisma db seed   # popula com vacas de exemplo

# 4. Dev server
npm run dev
```

Abra http://localhost:3000.

## Estrutura

```
prisma/
  schema.prisma        # User (ET), Cow, Swipe, Abduction
  seed.ts              # vacas de exemplo
src/
  app/                 # App Router (pages + API routes)
    api/auth/[...nextauth]/route.ts
  auth.ts              # config Auth.js v5 (Credentials + Prisma adapter)
  middleware.ts        # protege /swipe, /abductions, /profile
  lib/prisma.ts        # singleton do Prisma Client
  components/ui/       # componentes shadcn/ui
  generated/prisma/    # client gerado pelo Prisma (gitignored)
```

## Domínio

- **User** (ET): pilota uma nave (`shipModel`) vindo de um `homePlanet`.
- **Cow**: catálogo de bovinos com raça, vibe, bio e foto.
- **Swipe**: `LIKE` (beam me up) ou `PASS` (moo, hard pass).
- **Abduction**: agendada quando o ET dá `LIKE`. Estados: `PLANNED → IN_PROGRESS → COMPLETED/ABORTED`.

## Próximos passos sugeridos

- [ ] Páginas `/login` e `/register` para os ETs
- [ ] Tela `/swipe` com card swipeable (drag/swipe) — pode usar `framer-motion`
- [ ] Server Actions para criar `Swipe` + `Abduction` em transação
- [ ] `/abductions` lista o backlog do ET logado
- [ ] Painel admin para cadastrar vacas

Diga ao Claude qual destes você quer atacar primeiro.
