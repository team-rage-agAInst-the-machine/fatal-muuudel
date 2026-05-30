# Fatal Muuudel — MVP Scope

## Escopos

### Auth & Onboarding `Backend + Frontend`

- [ ] Cadastro ET e vaca (email/senha)
- [ ] JWT + refresh token
- [ ] Perfil ET (espécie, planeta, finalidade)
- [ ] Perfil vaca (raça, biotipo, hard limits)
- [ ] Upload foto de perfil (S3/R2)
- [ ] GPS da fazenda (input manual ou geolocation)

---

### Feed & Matching `Backend + Frontend`

- [ ] Feed de perfis com filtros básicos (raça, biotipo)
- [ ] Swipe direita / esquerda
- [ ] Match bilateral confirmado

---

### Chat & Tradutor `Backend + IA`

- [ ] WebSocket para mensagens em tempo real
- [ ] Persistência no MongoDB
- [ ] Tradutor Mugido ↔ Galáctico via Claude API
- [ ] Presentes virtuais (milho, sal, disco voador)

---

### Agendamento `Backend`

- [ ] Seletor de data/horário
- [ ] Check básico de clima/nebulosidade
- [ ] Confirmação por ambos os lados

---

### Reviews & Segurança `Backend`

- [ ] Review pós-encontro (1–5 estrelas)
- [ ] Botão de report de ET suspeito
- [ ] Fila de moderação assíncrona (Claude API)

---

## Fora do MVP — pós-lançamento

| Feature | Motivo do corte |
|---|---|
| Cache Redis do feed | Postgres aguenta no volume inicial |
| Elasticsearch | Substituído por Postgres full-text |
| Filtro por tamanho da nave | Feature de engajamento, v2 |
| Status "em relacionamento" | Feature de engajamento, v2 |
| Consulta amiga do curral | Feature social, v2 |
| Indicador de digitação / lido | Email notifica no MVP |
| Push FCM/APNs | Email notifica no MVP |
| Painel de moderação admin | Retool ou script por enquanto |
| Cancelamento e remarcação | Validar primeiro se encontros acontecem |

---

## Decisões de arquitetura para o MVP

| Camada | Escolha | Nota |
|---|---|---|
| Frontend | Next.js App Router | SSR + RSC |
| Banco principal | PostgreSQL | Perfis, matches, agendamentos |
| Busca no feed | Postgres full-text + índices | Elasticsearch pós-MVP |
| Chat | MongoDB + WebSocket | Mensagens são documentos |
| Mídia | S3/R2 + CDN | Fotos de vacas são pesadas |
| Tradutor | Claude API | Mugido é língua não-documentada |
| Moderação | Claude API + fila assíncrona | Não bloqueia o fluxo do usuário |
| Notificações | Email (transacional) | Push nativo pós-MVP |
