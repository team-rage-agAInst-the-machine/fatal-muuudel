---
name: gerar-pr
description: Cria branch, commita, push e abre PR no GitHub — tudo em sequência.
argument-hint: "[contexto extra opcional]"
---

Crie um Pull Request no GitHub para as mudanças atuais, seguindo os passos abaixo em ordem.

## Passo 1 — coletar contexto

Execute estes comandos em paralelo:

```bash
git status --short
git diff --stat
git diff
git log --oneline -5
```

## Passo 2 — preparar a branch

Se já estiver numa branch de feature com commits (não em `main`), pule para o Passo 3.

Se estiver em `main` com mudanças não commitadas:
1. Crie uma branch com nome descritivo em kebab-case baseado no conteúdo das mudanças
2. Faça checkout nela: `git checkout -b <nome-da-branch>`

## Passo 3 — commitar as mudanças pendentes

Se houver arquivos modificados não commitados, commite-os agora em commits pequenos e focados (poucos arquivos por commit, agrupados por tema).

```bash
git add <arquivo(s) relacionados>
git commit -m "<tipo>: <descrição curta>"
```

## Passo 4 — rodar os testes

Antes de fazer push, rode os testes para garantir que nada está quebrado:

```bash
npm test
```

Se algum teste falhar:
- Se for falha relacionada às mudanças desta branch, corrija antes de continuar
- Se for falha pré-existente não relacionada (ex: `upload.test.ts` por dependência ausente), documente no PR body e prossiga

## Passo 5 — push

```bash
git push --set-upstream origin <branch>
# ou simplesmente:
git push
```

## Passo 6 — gerar título do PR

Regras:
- Máximo 72 caracteres
- Começa com emoji temático
- Descrição em português, direta, sem prefixo de tipo
- NUNCA incluir código Jira, issue number ou prefixos como `feat:` / `fix:`

Exemplos:
- `🤖 Chat interestelar com IA real — Gemini responde como a vaca abduzida`
- `✨ Auto-dismiss na tela de match e voltar no perfil ET`
- `🔧 Botões de login/register e foto da vaca no chat`

## Passo 7 — gerar descrição do PR

Descrição **narrativa e contextual** — não um checklist genérico. Escolha seções que façam sentido:

- **O que foi feito** — o que muda e por quê
- **Como funciona** — lógica, fluxo, decisões técnicas relevantes
- **Fallback / Tratamento de erro** — se a PR lida com falhas
- **Como ativar** — se precisa de config, variável de ambiente, seed, etc.
- **Arquivos** — arquivos alterados com uma linha cada

Estilo: parágrafos curtos, direto, explica o **porquê**. Sem bullet lists genéricos.

Sempre terminar o body com uma linha em branco seguida de `SAVANOo`.

Se houver argumento passado para a skill (`$ARGUMENTS`), usar como contexto adicional.

## Passo 8 — abrir o PR

```bash
gh pr create --title "<título>" --body "$(cat <<'EOF'
<descrição completa>

SAVANOo
EOF
)"
```

Exibir apenas a URL do PR retornada pelo `gh`.
