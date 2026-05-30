# Fatal Muuudel — Tasks do MVP

O projeto já tem base sólida: design system, deck de swipe animado, schema do banco e auth no backend. O que falta é conectar as peças.

## Ordem sugerida

P1 + P4 em paralelo → P2 → P3 → P5

---

## [P1] Auth: Telas de Login e Cadastro de ET

**Responsável:** Pessoa 1 — Frontend/Auth
**Dependência:** Nenhuma — pode começar já

O backend de autenticação já existe (NextAuth v5 + Prisma), mas faltam as telas visuais.

**O que fazer:**
- Criar página `/login` com formulário (email + senha) usando o design system do `fatal.css`
- Criar página `/register` com formulário de cadastro incluindo campos ET: callsign, homePlanet, shipModel
- Validação com Zod no client-side (já está no projeto)
- Integrar com `signIn()` e `signUp()` do Auth.js
- Redirecionar para `/swipe` após login bem-sucedido
- Tratar erros (credenciais erradas, email já cadastrado)
- Usar fonte Orbitron, cores cyan/magenta do design system
- Proteger rotas `/swipe`, `/abductions`, `/profile` via middleware (verificar se `src/middleware.ts` existe, senão criar)

**Arquivos relevantes:**
- `src/auth.ts` — config NextAuth
- `src/auth.config.ts` — config edge-safe
- `src/app/api/auth/[...nextauth]/route.ts` — rota auth
- `prisma/schema.prisma` — model User com campos ET
- `src/app/globals.css` + `src/app/fatal.css` — design system

---

## [P2] Feed: Integrar swipe com banco de dados real

**Responsável:** Pessoa 2 — Backend/Integração
**Dependência:** P1 (auth) para pegar `alienId`

Hoje o SwipeDeck usa dados mockados de `src/components/fatal/data.ts`. Precisamos conectar ao banco real.

**O que fazer:**
- Criar API route `GET /api/cows` que retorna vacas que o ET autenticado ainda não fez swipe
  - Filtrar: `WHERE NOT EXISTS (SELECT 1 FROM Swipe WHERE alienId = $userId AND cowId = cow.id)`
  - Retornar em ordem aleatória ou por distância
- Criar API route `POST /api/swipes` que recebe `{ cowId, direction: LIKE | SUPER | PASS }` e salva no banco
  - Verificar unicidade (constraint `UNIQUE(alienId, cowId)`)
  - Quando direction é LIKE ou SUPER, criar registro em `Abduction` com status `PLANNED`
- Atualizar `FatalMuuudelApp.tsx` e `SwipeDeck.tsx` para consumir essa API em vez dos mocks
- Tratar estado de loading e fim de deck (sem mais vacas)
- Usar `useSession()` do NextAuth para pegar o `alienId` autenticado

**Arquivos relevantes:**
- `src/components/fatal/FatalMuuudelApp.tsx` — componente raiz
- `src/components/fatal/SwipeDeck.tsx` — deck de swipe
- `src/components/fatal/data.ts` — mocks a serem substituídos
- `src/lib/prisma.ts` — cliente Prisma
- `prisma/schema.prisma` — models Cow, Swipe, Abduction

---

## [P3] Abduzidas: Histórico e agendamento de abdução

**Responsável:** Pessoa 3 — Frontend/Backend
**Dependência:** P2 (swipes criam abduções)

A `AbductedList.tsx` existe mas usa dados mockados. Precisamos conectar ao banco e adicionar funcionalidade de agendamento.

**O que fazer:**
- Criar API route `GET /api/abductions` que retorna as abduções do ET autenticado (com dados da Cow relacionada)
- Criar API route `PATCH /api/abductions/:id` para atualizar status (`PLANNED → IN_PROGRESS → COMPLETED | ABORTED`)
- Atualizar `AbductedList.tsx` para consumir a API real
- Adicionar tela/modal de agendamento: seletor de data/hora para `scheduledAt` e campo de `notes`
- Exibir status com badge colorido (PLANNED=cyan, IN_PROGRESS=lime, COMPLETED=magenta, ABORTED=cinza)
- Filtros simples: por status, por data
- Criar API route `POST /api/abductions/:id/schedule` para definir data/hora

**Arquivos relevantes:**
- `src/components/fatal/AbductedList.tsx` — componente existente a ser atualizado
- `src/components/fatal/FatalMuuudelApp.tsx` — navegação entre abas
- `src/lib/prisma.ts` — cliente Prisma
- `prisma/schema.prisma` — model Abduction com enum AbductionStatus

---

## [P4] Fotos reais: Upload de foto para vacas e perfil ET

**Responsável:** Pessoa 4 — Backend/Infra
**Dependência:** Independente — pode rodar paralelo a P1

Hoje as fotos das vacas são placeholders gerados com CSS (gradiente por hue OKLCH). Precisamos suportar fotos reais.

**O que fazer:**
- Configurar storage para upload — usar Cloudflare R2 ou AWS S3 (variáveis `STORAGE_*` no `.env`)
- Criar API route `POST /api/upload` que recebe multipart/form-data e retorna URL pública
- Atualizar seed (`prisma/seed.ts`) para popular `photoUrl` nas vacas com imagens placeholder realistas (ex: picsum.photos com seed fixo por vaca)
- Criar tela de perfil do ET `/profile`:
  - Exibir callsign, planeta natal, modelo da nave
  - Permitir upload de foto de perfil (salvar em `User.image`)
  - Usar componente Avatar do shadcn/ui já disponível
- Atualizar `CowCard.tsx` para exibir `photoUrl` quando disponível, mantendo fallback CSS
- Validação de tipo de arquivo e tamanho máximo (5MB)

**Arquivos relevantes:**
- `src/components/fatal/CowCard.tsx` — card com foto placeholder
- `prisma/seed.ts` — seed das vacas (adicionar photoUrl)
- `prisma/schema.prisma` — fields `photoUrl` em Cow e `image` em User
- `.env.example` — adicionar variáveis de storage
- `src/components/ui/avatar.tsx` — componente Avatar disponível

---

## [P5] Chat: Tradutor mugido↔galáctico com Claude API

**Responsável:** Pessoa 5 — AI/Backend
**Dependência:** P3 (chat abre após match/abdução)

A feature mais absurda e mais incrível: um chat entre ET e vaca onde o Claude traduz mugidos para linguagem galáctica e vice-versa.

**O que fazer:**
- Criar API route `POST /api/chat/translate` que recebe `{ message: string, from: "cow" | "alien" }` e usa Claude API:
  - cow → alien: transforma texto em "mugidos galácticos" (misto de português com onomatopeias alienígenas)
  - alien → cow: transforma texto em "moooo" com personalidade bovina
- Criar UI de chat acessível após um match (abdução com status PLANNED):
  - Interface estilo chat com bolhas de mensagem
  - Indicador "ET está traduzindo..." durante streaming
  - Histórico de mensagens (localStorage por ora)
- Usar streaming do Claude API (`stream: true`) para resposta em tempo real
- Adicionar `ANTHROPIC_API_KEY` no `.env.example`
- Model sugerido: `claude-haiku-4-5-20251001` (mais rápido/barato para tradução)
- Adicionar presentes virtuais no chat: botões de emoji temático (🌽 milho, 🧂 sal, 🛸 disco voador)

**Arquivos relevantes:**
- `src/app/api/` — criar subpasta `chat/`
- `src/components/fatal/` — criar `ChatModal.tsx` ou `ChatScreen.tsx`
- `src/components/fatal/AbductedList.tsx` — adicionar botão "Comunicar" em cada abdução
- `.env.example` — adicionar `ANTHROPIC_API_KEY`
- Instalar: `npm install @anthropic-ai/sdk`
