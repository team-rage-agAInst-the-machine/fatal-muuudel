# Fatal Muuudel

Tinder para extraterrestres escolherem quais vacas vão abduzir.

Stack: **Next.js 16 (App Router) + React 19 + TypeScript + Postgres + Prisma + Auth.js v5 + Tailwind + shadcn/ui**.

---

## Setup

```bash
# 1. Dependencias
npm install

# 2. Variaveis de ambiente
cp .env.example .env
# gere AUTH_SECRET com:
npx auth secret

# (opcional) chat com IA real — veja a seção "Chat interestelar" abaixo

# 3. Subir o Postgres via Docker
docker compose up -d

# 4. Popular o banco (primeira vez)
npx prisma db seed

# 5. Dev server — aplica migrations pendentes automaticamente
npm run dev
```

Abra http://localhost:3000.

---

## Estrutura

```
prisma/
  schema.prisma        # User (ET), Cow, Swipe, Abduction
  seed.ts              # vacas de exemplo
src/
  app/                 # App Router (pages + API routes)
    api/auth/[...nextauth]/route.ts
    fatal.css          # design system — fonte da verdade de estilo
  auth.ts              # config Auth.js v5 (Credentials + Prisma adapter)
  middleware.ts        # protege /swipe, /abductions, /profile
  lib/prisma.ts        # singleton do Prisma Client
  components/
    fatal/             # componentes do app (SwipeDeck, CowCard, etc.)
    ui/                # componentes shadcn/ui
  generated/prisma/    # client gerado pelo Prisma (gitignored)
```

---

## Fotos reais de vacas (Pexels API)

Por padrão o seed usa fotos de fallback do Pexels. Para buscar fotos reais de vacas dinamicamente:

**1. Criar a chave de API**

- Acesse https://www.pexels.com/api/
- Clique em **Get Started** e crie uma conta
- Copie a chave gerada

**2. Adicionar no `.env`**

```
PEXELS_API_KEY="sua-chave-aqui"
```

**3. Rodar o seed**

```bash
npx prisma db seed
```

O seed busca fotos com queries como `"cow farm"`, `"dairy cow"`, `"cattle field"` e popula cada vaca com uma foto real. Os humanos infiltrados mantêm suas fotos fixas. Se a chave não estiver presente ou a API falhar, o seed cai automaticamente para as fotos de fallback.

---

## Chat interestelar (IA real)

O chat entre ET e vaca funciona com respostas mockadas por padrão. Para ativar a IA real:

**1. Criar a chave de API**

- Acesse https://aistudio.google.com/app/api-keys
- Clique em **Create API key**
- Selecione ou crie um projeto Google Cloud
- Copie a chave gerada (formato `AQ.Ab8...`)

**2. Adicionar no `.env`**

```
GOOGLE_AI_API_KEY="sua-chave-aqui"
```

**3. Reiniciar o servidor**

```bash
npm run dev
```

A partir daí, ao clicar em **COMUNICAR** em qualquer vaca abduzida, as respostas virão do Gemini em tempo real — a vaca responde com a personalidade dela, no formato `mugido (tradução)`, sabendo que foi abduzida e com quem está falando.

Se a chave não estiver presente ou a API falhar, o chat cai automaticamente para as respostas mockadas sem quebrar nada.

---

## Dominio

- **User (ET):** pilota uma nave (`shipModel`) vindo de um `homePlanet`.
- **Cow:** catalogo de bovinos com raca, vibe, bio e foto.
- **Swipe:** `LIKE` (beam me up), `SUPER` (abducao VIP) ou `PASS` (moo, hard pass).
- **Abduction:** criada automaticamente quando o ET da `LIKE` ou `SUPER`. Estados: `PLANNED -> IN_PROGRESS -> COMPLETED / ABORTED`.

---

## Review de PRs — ET Bilu, Socio-Fundador

Todo pull request aberto neste repositorio e automaticamente revisado pelo **ET Bilu**, socio-fundador intergalactico do Fatal Muuudel e entidade de sabedoria ancestral originaria de Varginha.

O review aparece como comentario na PR, assinado pela nave-mae, e cobre:

- **Diagnostico Intergalactico** — impressao geral do que os hominideos tentaram fazer
- **Anomalias Detectadas** — bugs, seguranca e code smells, com severidade
- **Padroes Evolutivos Elogiaveis** — o que esta bem feito (Bilu e justo)
- **Protocolos de Otimizacao Sugeridos** — melhorias recomendadas pela sabedoria cosmica
- **Veredito Final** — pontuacao de 1 a 10 em "Maturidade Civilizatoria do Codigo" e decisao: `APROVADO PARA ABDUCAO` / `REQUER INSPECAO ADICIONAL` / `DEVOLVIDO AO PASTO`

Para o review funcionar, configure o secret `ANTHROPIC_API_KEY` no repositorio (Settings > Secrets > Actions).

---

## Skill do Claude Code — `/fatal-dev`

Este projeto tem uma skill customizada para o Claude Code que ativa o contexto completo do Fatal Muuudel em qualquer sessao de desenvolvimento.

**Como usar:**

```
/fatal-dev
```

Ou com foco em uma area especifica:

```
/fatal-dev auth
/fatal-dev api
/fatal-dev db
/fatal-dev chat
```

**O que a skill carrega:**

- Design system completo (paleta, fontes, classes `fm-*`)
- Mapa de arquivos e onde mexer para cada feature
- Schema do banco e regras de negocio criticas
- Convencoes de codigo e nomenclatura do projeto
- Tom de copy (exemplos do que escrever em labels e erros)
- Estado atual do git em tempo real

Recomendado usar `/fatal-dev` no inicio de toda sessao antes de codificar. A skill vive em `.claude/skills/fatal-dev/SKILL.md`.

---

## Tasks do time

O backlog das 5 frentes de trabalho esta em `.claude/tasks.md`, com responsaveis, dependencias e arquivos relevantes por tarefa.

Ordem sugerida: **P1 + P4 em paralelo -> P2 -> P3 -> P5**

---

## Proximos passos

- [ ] [P1] Paginas `/login` e `/register` para os ETs
- [ ] [P2] API `/api/cows` e `/api/swipes` integrando banco real
- [ ] [P3] API `/api/abductions` + tela de historico e agendamento
- [ ] [P4] Upload de fotos + tela de perfil do ET
- [ ] [P5] Chat com tradutor mugido<->galactico via Claude API
