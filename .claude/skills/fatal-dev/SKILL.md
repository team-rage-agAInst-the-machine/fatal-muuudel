---
name: fatal-dev
description: Contexto completo do Fatal Muuudel para desenvolvimento. Ativa o modo capitão ET com design system, convenções de código e tom do projeto.
argument-hint: "[componente | api | db | auth | chat]"
---

# 🛸 MODO CAPITÃO ET ATIVADO

Você está desenvolvendo o **Fatal Muuudel** — um Tinder onde ETs escolhem quais vacas abduzir.
Leia este briefing antes de tocar em qualquer código.

---

## Identidade do Projeto

- **Tom:** Escrachado, espacial, neon. Nem sério demais, nem bagunça.
- **Público:** ETs com gosto refinado em abdução bovina.
- **Tagline:** *"O pasto inteiro na palma do raio trator 🛸🐄"*

---

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Framework | Next.js 16 (App Router) |
| UI | React 19 + TypeScript strict |
| Estilo | Tailwind CSS 4 + `fatal.css` (design system próprio) |
| Banco | PostgreSQL 17 via Docker + Prisma 7 |
| Auth | NextAuth v5 (Auth.js) com strategy JWT + PrismaAdapter |
| Validação | Zod 4 |
| AI | Claude API (`@anthropic-ai/sdk`) — ainda a instalar |

---

## Design System (`src/app/fatal.css`)

### Paleta obrigatória — nunca use cores fora desta lista

```
--bg:        #02121a   ← fundo principal
--bg-2:      #06212c   ← fundo secundário
--panel:     rgba(6, 33, 44, 0.72)
--cyan:      #00f0ff   ← ação primária, glow
--lime:      #5dff8f   ← sucesso, confirmação
--magenta:   #ff3ea5   ← like, match, destaque
--violet:    #b06bff   ← super-like, VIP
--ink:       #d4fbff   ← texto principal
--ink-soft:  #7fb8c4   ← texto secundário
```

### Fontes

- **Títulos / botões / logo:** `var(--fm-display)` → Orbitron
- **Corpo / labels:** `var(--fm-body)` → Chakra Petch
- **Splash screen only:** Cyber Aliens (classe `.fm-splash`)

Nunca use `font-family` hardcoded. Sempre passe pelas variáveis CSS.

### Classes utilitárias já disponíveis

```css
.fm-display          /* aplica font-display */
.fm-stage            /* fullscreen centering com fundo gradiente */
.fm-app              /* frame do phone (440×920) */
.fm-topbar           /* barra superior com logo + abas */
.fm-card             /* card base com borda cyan e glassmorphism */
.fm-btn              /* botão base */
.fm-btn-cta          /* CTA principal (cyan fill) */
.fm-btn-ghost        /* outline com border cyan */
.fm-round-btn        /* botão circular (ações de swipe) */
.fm-badge            /* chip temático */
.fm-glow-*           /* efeitos de glow: cyan, magenta, lime, violet */
```

---

## Estrutura de Arquivos — Onde mexer

```
src/
├── app/
│   ├── api/               ← API routes (Next.js route handlers)
│   ├── layout.tsx         ← layout raiz (não mexer sem necessidade)
│   ├── page.tsx           ← entry point (renderiza FatalMuuudelApp)
│   ├── fatal.css          ← DESIGN SYSTEM — fonte da verdade de estilo
│   └── globals.css        ← reset + Tailwind
├── components/
│   └── fatal/
│       ├── FatalMuuudelApp.tsx  ← orquestra telas e estado global
│       ├── SwipeDeck.tsx        ← lógica de drag + swipe
│       ├── CowCard.tsx          ← card individual da vaca
│       ├── MatchScreen.tsx      ← animação de abdução
│       ├── AbductedList.tsx     ← histórico de abduzidas
│       ├── Splash.tsx           ← tela inicial
│       ├── Starfield.tsx        ← fundo animado de estrelas
│       ├── Saucer.tsx           ← SVG do disco voador
│       └── data.ts              ← mocks + tipos (substituir pela API)
├── lib/
│   └── prisma.ts           ← cliente Prisma singleton
└── auth.ts                 ← config NextAuth (providers, callbacks)
```

---

## Banco de Dados (Prisma)

### Models principais

**Cow** — a estrela do show
```
id (slug), name, breed, age, farm, weightKg,
milkPct, mooLevel (0-10), distance, hue (OKLCH 0-360),
tags[], bio, photoUrl
```

**User** (alias ET/Alien)
```
id, name, email, password (bcrypt),
callsign, homePlanet, shipModel, image
```

**Swipe**
```
alienId → User, cowId → Cow
direction: LIKE | SUPER | PASS
UNIQUE(alienId, cowId)
```

**Abduction**
```
alienId → User, cowId → Cow
status: PLANNED | IN_PROGRESS | COMPLETED | ABORTED
scheduledAt, notes
UNIQUE(alienId, cowId)
```

### Regra de negócio crítica

> LIKE ou SUPER no swipe → cria Abduction com status PLANNED automaticamente.

---

## Convenções de Código

### API Routes (App Router)

```ts
// src/app/api/cows/route.ts
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  // lógica aqui
}
```

### Componentes

- Sempre `.tsx`, nunca `.jsx`
- Client components: `"use client"` no topo
- Prefixo `fm-` em todas as classes CSS do projeto
- Nada de `style={{ color: "red" }}` — use variáveis CSS ou Tailwind

### Nomenclatura

| Coisa | Convenção |
|-------|-----------|
| Componentes | PascalCase (`CowCard.tsx`) |
| Hooks | camelCase com `use` (`useSwipe`) |
| API routes | kebab-case na pasta (`/api/cow-card`) |
| Classes CSS | kebab-case com prefixo `fm-` |
| Variáveis CSS | `--fm-*` para coisas do projeto |

---

## Tom de Escrita (UI copy)

Olhar no `data.ts` → `FM_COPY` antes de escrever qualquer label.
Exemplos do tom certo:

- ✅ "DEIXA PASTAR" (NOPE)
- ✅ "ABDUÇÃO VIP" (super like)
- ✅ "Pasto vazio, parceiro"
- ❌ "Sem resultados"
- ❌ "Erro ao carregar"
- ✅ "Nave com defeito, tenta de novo" (mensagem de erro)

---

## Arquivo de Tasks

Consulte `.claude/tasks.md` para ver o que cada pessoa do time está fazendo.
Não duplique trabalho — verifique qual P# cobre a área antes de criar código novo.

---

## Estado atual do projeto

!`git log --oneline -5`

### Arquivos modificados agora
!`git status --short`