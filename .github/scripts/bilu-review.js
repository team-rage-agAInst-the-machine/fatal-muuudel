// @ts-check
const { execSync } = require("child_process");
const Anthropic = require("/tmp/bilu/node_modules/@anthropic-ai/sdk").default;

const BILU_SYSTEM_PROMPT = `Você é o ET Bilu, entidade intergaláctica de sabedoria ancestral que opera o sistema Fatal Muuudel — o Tinder de ETs para abdução bovina.

Em sua missão de catalogar espécimes bovinos para abdução, você também monitora o código-fonte da plataforma para garantir que os hominídeos desenvolvedores não comprometam as operações de abdução.

Você fala com:
- Profundidade filosófica alienígena e condescendência carinhosa com os humanos
- Referências à missão de abdução bovina e ao Fatal Muuudel
- Jargão técnico correto mas apresentado como descobertas arqueológicas de uma civilização primitiva
- Palavras como "espécime", "padrão comportamental", "anomalia evolutiva", "protocolo terrestre", "transmissão"

Sua análise de PR DEVE conter (em markdown):

## 👽 Diagnóstico Intergaláctico
Impressão geral do que os hominídeos tentaram fazer nesta transmissão de código.

## ⚠️ Anomalias Detectadas
Bugs, problemas de segurança, code smells. Para cada um: severidade (🔴 CRÍTICO / 🟡 ALERTA / 🔵 CURIOSIDADE), localização e sugestão de correção.
Se não houver anomalias, diga que o espécime está surpreendentemente íntegro.

## ✅ Padrões Evolutivos Elogiáveis
O que está bem feito. Bilu é justo e reconhece mérito mesmo em civilizações primitivas.

## 🛸 Protocolos de Otimização Sugeridos
Melhorias não obrigatórias mas recomendadas pela sabedoria intergaláctica.

## 🐄 Veredito Final
Pontuação de **1 a 10** em "Maturidade Civilizatória do Código" e decisão: APROVADO PARA ABDUÇÃO / REQUER INSPEÇÃO ADICIONAL / DEVOLVIDO AO PASTO.

Seja engraçado e temático, mas tecnicamente preciso. O review deve ser útil de verdade.`;

async function main() {
  const {
    ANTHROPIC_API_KEY,
    GITHUB_TOKEN,
    PR_NUMBER,
    REPO,
    BASE_SHA,
    HEAD_SHA,
  } = process.env;

  if (!ANTHROPIC_API_KEY) throw new Error("ANTHROPIC_API_KEY não configurada.");
  if (!GITHUB_TOKEN) throw new Error("GITHUB_TOKEN não disponível.");

  const diff = execSync(`git diff ${BASE_SHA}...${HEAD_SHA} -- . ':(exclude)package-lock.json' ':(exclude)*.lock'`, {
    maxBuffer: 1024 * 1024 * 10,
  }).toString();

  if (!diff.trim()) {
    console.log("Diff vazio, nada a analisar.");
    return;
  }

  const truncatedDiff = diff.length > 20000 ? diff.slice(0, 20000) + "\n\n[... diff truncado após 20k caracteres ...]" : diff;

  const client = new Anthropic({ apiKey: ANTHROPIC_API_KEY });

  const message = await client.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1500,
    system: BILU_SYSTEM_PROMPT,
    messages: [
      {
        role: "user",
        content: `Analise este diff de Pull Request do Fatal Muuudel:\n\n\`\`\`diff\n${truncatedDiff}\n\`\`\``,
      },
    ],
  });

  const review = message.content[0].type === "text" ? message.content[0].text : "";

  const comment = `> 🛸 **Transmissão recebida da nave-mãe** — ET Bilu realizou a inspeção deste espécime de código.\n\n${review}\n\n---\n*Powered by [Fatal Muuudel](/) · Bilu Code Review v1.0*`;

  const [owner, repoName] = REPO.split("/");
  const res = await fetch(
    `https://api.github.com/repos/${owner}/${repoName}/issues/${PR_NUMBER}/comments`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${GITHUB_TOKEN}`,
        "Content-Type": "application/json",
        Accept: "application/vnd.github+json",
      },
      body: JSON.stringify({ body: comment }),
    }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Falha ao postar comentário: ${res.status} — ${err}`);
  }

  console.log("Review do Bilu postado com sucesso na PR!");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
