---
name: gerar-pr
description: Gera título e descrição de PR e abre direto no GitHub via gh pr create.
argument-hint: "[contexto extra opcional]"
---

Crie um Pull Request no GitHub para a branch atual seguindo os passos abaixo.

## Passo 1 — coletar contexto

Execute estes comandos em paralelo:

```bash
git branch --show-current
git log main..HEAD --oneline
git diff main..HEAD --stat
git diff main..HEAD
```

## Passo 2 — gerar título

Regras:
- Máximo 72 caracteres
- Pode (e deve) começar com um emoji temático que capture o espírito da mudança
- Depois do emoji: descrição em português, direta, sem prefixo de tipo
- NUNCA incluir código Jira, issue number ou prefixos como `feat:` / `fix:`

Exemplos de títulos bons:
- `🤖 Chat interestelar com IA real — Gemini responde como a vaca abduzida`
- `🐄 Perfil detalhado da vaca com foto, stats e bio`
- `🛸 Histórico de abduzidas persiste entre reloads`
- `🔧 Botões de login/register e foto da vaca no chat`

## Passo 3 — gerar descrição

A descrição deve ser **narrativa e contextual** — não um checklist genérico.

Escolha seções que façam sentido para o conteúdo da PR. Use apenas as que agregam valor:

- **O que foi feito** — o que muda e por quê, em linguagem direta
- **Como funciona** — explica a lógica, o fluxo, as decisões técnicas relevantes
- **Fallback / Tratamento de erro** — se a PR lida com falhas ou estados degradados
- **Como ativar** — se precisa de configuração, variável de ambiente, seed, etc.
- **Arquivos** — lista de arquivos alterados com uma linha explicando o papel de cada um

Estilo:
- Parágrafos curtos, linguagem direta
- Explica o **porquê** das decisões, não só o **o quê**
- Tom técnico mas sem ser burocrático
- Prefira prosa a bullet lists genéricos
- Se houver argumento passado para a skill (`$ARGUMENTS`), use como contexto adicional

## Passo 4 — abrir o PR no GitHub

Execute o comando abaixo com o título e descrição gerados:

```bash
gh pr create --title "<título>" --body "$(cat <<'EOF'
<descrição completa>
EOF
)"
```

Após criar, exiba apenas a URL do PR retornada pelo `gh`.
