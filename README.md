<div align="center">

# 🛸 Fatal Muuudel 🐄

### _Tinder onde ETs escolhem quais vacas vão abduzir._

**`"O pasto inteiro na palma do raio trator 🛸🐄"`**

<br>

![Next.js](https://img.shields.io/badge/Next.js-16-02121a?style=for-the-badge&logo=next.js&logoColor=00f0ff)
![React](https://img.shields.io/badge/React-19-02121a?style=for-the-badge&logo=react&logoColor=00f0ff)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-02121a?style=for-the-badge&logo=typescript&logoColor=00f0ff)
![Postgres](https://img.shields.io/badge/PostgreSQL-17-02121a?style=for-the-badge&logo=postgresql&logoColor=5dff8f)
![Prisma](https://img.shields.io/badge/Prisma-7-02121a?style=for-the-badge&logo=prisma&logoColor=b06bff)
![Auth.js](https://img.shields.io/badge/Auth.js-v5-02121a?style=for-the-badge&logoColor=ff3ea5)
![Tailwind](https://img.shields.io/badge/Tailwind-4-02121a?style=for-the-badge&logo=tailwindcss&logoColor=00f0ff)

</div>

---

## 👽 O que é isso?

Um app de swipe espacial onde **ETs com gosto refinado** garimpam o pasto, dão `LIKE` nas vacas
mais promissoras e agendam a abdução. Tem match, tem disco voador, tem chat com tradutor de
mugido — e tudo banhado em neon ciano sobre fundo de nave.

| | |
|---|---|
| **DEIXA PASTAR** ❌ | passou batido, segue o baile |
| **ABDUZIR** 💖 | beam me up — vira abdução agendada |

> **Regra de ouro:** todo `LIKE` cria automaticamente uma **Abdução** com status `PLANNED`. A nave já reserva o porão.

---

## 🚀 Decolagem (setup local)

```bash
# 1. Dependências
npm install

# 2. Variáveis de ambiente
cp .env.example .env
npx auth secret          # gera o AUTH_SECRET
# (opcional) chaves de IA e fotos reais — veja seções abaixo

# 3. Subir o Postgres via Docker
docker compose up -d

# 4. Popular o pasto (primeira vez)
npx prisma db seed

# 5. Ligar os motores — aplica migrations pendentes automaticamente
npm run dev
```

Abra **http://localhost:3000** e entre na nave. 🛸

> 💡 O Postgres **não** expõe a porta 5432 no host por padrão (segurança). Para conectar do host
> (ex.: Prisma Studio), crie um `docker-compose.override.yml` mapeando `"5432:5432"` —
> o comentário no `docker-compose.yml` mostra exatamente como.

---

## 🔭 Variáveis de Ambiente

Copie `.env.example` para `.env` e preencha:

| Variável | Obrigatória | Descrição |
|---|---|---|
| `DATABASE_URL` | ✅ | Connection string do Postgres |
| `AUTH_SECRET` | ✅ | Gerada com `npx auth secret` |
| `PEXELS_API_KEY` | ☁️ | Fotos reais de vacas no seed |
| `GOOGLE_AI_API_KEY` | ☁️ | Chat interestelar com Gemini |

### 📸 Fotos reais de vacas (Pexels API)

Por padrão o seed usa fotos de **fallback** do Pexels. Para buscar fotos reais dinamicamente:

1. Crie a chave em https://www.pexels.com/api/ (**Get Started**).
2. Adicione no `.env`: `PEXELS_API_KEY="sua-chave-aqui"`
3. Rode `npx prisma db seed`.

O seed busca por `"cow farm"`, `"dairy cow"`, `"cattle field"` e popula cada vaca com uma foto
real. Os humanos infiltrados mantêm fotos fixas. Sem a chave (ou se a API falhar), cai
automaticamente no fallback. 🤙

### 💬 Chat interestelar (IA real)

O chat entre ET e vaca roda com **respostas mockadas** por padrão. Para ativar o Gemini de verdade:

1. Crie a chave em https://aistudio.google.com/app/api-keys (**Create API key**).
2. Adicione no `.env`: `GOOGLE_AI_API_KEY="sua-chave-aqui"`
3. Reinicie com `npm run dev`.

Daí em diante, ao clicar em **COMUNICAR** numa vaca abduzida, as respostas vêm do Gemini em tempo
real — a vaca responde com a personalidade dela, no formato `mugido (tradução)`, sabendo que foi
abduzida e com quem fala. Sem a chave (ou se a API falhar), volta pro mock sem quebrar nada.

---

## 🧪 Testes estelares

```bash
npm test            # roda toda a suíte
npm run test:watch  # re-roda ao salvar
```

Stack: **Vitest** + **@testing-library/react** + **jsdom**. Os testes vivem em `src/test/`,
organizados por `api/`, `components/` e `pages/`.

> ⚠️ Sempre rode `npm test` antes de abrir uma PR. O ET Bilu está observando.

---

## 🗺️ Mapa da nave (estrutura)

```
prisma/
  schema.prisma          # User (ET), Cow, Swipe, Abduction
  seed.ts                # vacas de exemplo
src/
  app/                   # App Router (pages + API routes)
    api/                 # cows, swipes, abductions, profile, chat, upload...
    fatal.css            # 🎨 design system — fonte da verdade de estilo
  auth.ts                # config Auth.js v5 (Credentials + Prisma adapter)
  middleware.ts          # protege /swipe, /abductions, /profile
  lib/prisma.ts          # singleton do Prisma Client
  components/
    fatal/               # SwipeDeck, CowCard, MatchScreen, ChatModal, Splash...
    ui/                  # componentes shadcn/ui
  generated/prisma/      # client gerado pelo Prisma (gitignored)
```

### 🎨 Design system (`src/app/fatal.css`)

Paleta fechada — **nunca** use cor fora dela. Toda classe do projeto leva o prefixo `fm-`.

| Token | Cor | Uso |
|---|---|---|
| `--cyan` | `#00f0ff` | ação primária, glow |
| `--magenta` | `#ff3ea5` | like, match, destaque |
| `--violet` | `#b06bff` | destaques especiais |
| `--lime` | `#5dff8f` | sucesso |
| `--bg` | `#02121a` | fundo da nave |

Títulos/botões em **Orbitron** (`--fm-display`), corpo em **Chakra Petch** (`--fm-body`).

---

## 🌌 O domínio

- **🛸 User (ET)** — pilota uma nave (`shipModel`) vinda de um `homePlanet`, com `callsign` próprio.
- **🐄 Cow** — catálogo de bovinos com raça, vibe, `mooLevel`, bio e foto.
- **👆 Swipe** — `LIKE` (beam me up) ou `PASS` (deixa pastar).
- **🎯 Abduction** — criada automaticamente no `LIKE`. Estados: `PLANNED → IN_PROGRESS → COMPLETED / ABORTED`.

---

## 🤖 Review de PRs — ET Bilu, Sócio-Fundador

Toda PR aberta neste repositório é automaticamente revisada pelo **ET Bilu**, sócio-fundador
intergaláctico do Fatal Muuudel e entidade de sabedoria ancestral originária de Varginha. O review
aparece como comentário na PR, assinado pela nave-mãe, e cobre:

- **🔭 Diagnóstico Intergaláctico** — impressão geral do que os hominídeos tentaram fazer
- **🛑 Anomalias Detectadas** — bugs, segurança e code smells, com severidade
- **✨ Padrões Evolutivos Elogiáveis** — o que está bem feito (Bilu é justo)
- **🧬 Protocolos de Otimização Sugeridos** — melhorias pela sabedoria cósmica
- **⚖️ Veredito Final** — nota 1–10 em "Maturidade Civilizatória do Código" e decisão:
  `APROVADO PARA ABDUÇÃO` / `REQUER INSPEÇÃO ADICIONAL` / `DEVOLVIDO AO PASTO`

Para funcionar, configure o secret `ANTHROPIC_API_KEY` no repositório
(**Settings → Secrets → Actions**).

---

## 🛠️ Skill do Claude Code — `/fatal-dev`

Skill customizada que ativa o **contexto completo do Fatal Muuudel** em qualquer sessão de dev:

```bash
/fatal-dev          # contexto geral
/fatal-dev auth     # foco em autenticação
/fatal-dev api      # foco nas API routes
/fatal-dev db       # foco no schema/banco
/fatal-dev chat     # foco no tradutor de mugido
```

Carrega design system, mapa de arquivos, schema + regras de negócio, convenções de nomenclatura,
tom de copy e o estado atual do git. Recomendado rodar **no início de toda sessão** antes de
codificar. Vive em `.claude/skills/fatal-dev/SKILL.md`.

---

<div align="center">

**🛸 Liga o raio trator que essa vaca é nossa! 🐄⚡**

_Feito em algum lugar acima de Varginha._

</div>
