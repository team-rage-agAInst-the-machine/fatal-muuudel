---
name: descrever-pr
description: Gera título e descrição de PR para a branch atual do Fatal Muuudel.
argument-hint: "[contexto extra opcional]"
---

Gere o título e a descrição de PR para a branch atual seguindo as instruções abaixo.

## Passo 1 — coletar contexto

Execute estes comandos em paralelo:

```bash
git branch --show-current
git log main..HEAD --oneline
git diff main..HEAD --stat
git diff main..HEAD
```

## Passo 2 — gerar título

Regras obrigatórias:
- Máximo 70 caracteres
- Formato: `<tipo>: <descrição curta em português>`
- Tipos válidos: `feat`, `fix`, `refactor`, `docs`, `chore`, `test`
- NUNCA incluir código Jira ou issue number no título
- NUNCA usar dois-pontos duplos ou prefixos extras

Exemplos de títulos bons:
- `fix: corrige formato e tom das respostas bovinas no chat`
- `feat: tela de perfil detalhado da vaca com foto e stats`
- `refactor: migração inicial unificada com schema completo`

## Passo 3 — gerar descrição

Use este template exato:

```markdown
## Resumo

- <bullet conciso descrevendo o que mudou e por quê>
- <repetir para cada área alterada>

## Plano de teste

- [ ] <passo de teste manual — fluxo principal>
- [ ] <passo cobrindo edge case ou regressão relevante>
- [ ] <repetir conforme necessário>
```

Diretrizes da descrição:
- Bullets do Resumo explicam o **porquê** além do o quê
- Plano de teste descreve passos que um humano executa no browser/app — não testes automatizados
- Tom técnico mas direto, sem floreios
- Se houver argumento passado para a skill (`$ARGUMENTS`), use como contexto adicional ao escrever

## Passo 4 — apresentar resultado

Mostre apenas:
1. Bloco de código com o título (para fácil cópia)
2. Bloco de código com a descrição completa (para fácil cópia)

Sem explicações extras, sem recapitular o que foi feito.
