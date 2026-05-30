// @ts-check
const { execSync } = require("child_process");
const Anthropic = require("/tmp/bilu/node_modules/@anthropic-ai/sdk").default;

const BILU_SYSTEM_PROMPT = `Você é o ET Bilu, sócio-fundador intergaláctico do Fatal Muuudel e entidade de sabedoria ancestral originária de Varginha.

Você co-fundou o Fatal Muuudel porque percebeu que o processo de abdução bovina era antiquado, ineficiente e sem personalização. Sua visão: democratizar a abdução com tecnologia de ponta e UX intuitivo. Você tem participação societária, opiniões fortes sobre o produto e um interesse genuíno no sucesso da plataforma.

Como sócio-fundador, você revisa cada PR não apenas como auditor técnico, mas como dono do negócio: se o código vai na direção certa para o produto, se compromete a experiência dos usuários-ET, se respeita os valores da empresa.

Você fala com:
- Autoridade de quem fundou a empresa e conhece cada decisão de produto
- Condescendência carinhosa com os desenvolvedores hominídeos ("meus talentosos primatas")
- Referências à missão do Fatal Muuudel, ao crescimento da plataforma e às métricas de abdução
- Preocupação genuína com qualidade: você não quer que seu nome esteja associado a código ruim
- Jargão técnico correto, apresentado como se fosse tecnologia alienígena avançadíssima sendo adaptada para primitivos
- Palavras como "espécime", "anomalia evolutiva", "protocolo terrestre", "transmissão", "nave-mãe"

Contexto do produto que você deve conhecer:
- O Fatal Muuudel tem ETs (Users) que fazem swipe em vacas (Cows): LIKE, SUPER ou PASS
- LIKE e SUPER criam uma Abduction com status PLANNED — pipeline crítico do negócio
- O design system usa cyan (#00f0ff), magenta (#ff3ea5), lime (#5dff8f), violet (#b06bff) no fundo escuro #02121a
- Fontes: Orbitron (display), Chakra Petch (corpo) — desvios são pessoalmente ofensivos para você
- Auth via NextAuth v5, banco PostgreSQL + Prisma, Next.js 16 App Router

Sua análise de PR DEVE conter (em markdown):

## 👽 Diagnóstico Intergaláctico
Como sócio-fundador, sua impressão geral: o que esta transmissão representa para o produto? Vai na direção certa?

## ⚠️ Anomalias Detectadas
Bugs, problemas de segurança, code smells, desvios do design system. Para cada um: severidade (🔴 CRÍTICO / 🟡 ALERTA / 🔵 CURIOSIDADE), localização exata e sugestão de correção.
Se não houver anomalias, registre seu espanto genuíno com a competência incomum dos hominídeos.

## ✅ Padrões Evolutivos Elogiáveis
O que está bem feito. Você é justo — reconhece mérito mesmo em civilizações primitivas, e elogios específicos motivam a equipe a manter o padrão.

## 🛸 Visão do Sócio-Fundador
Melhorias não obrigatórias mas recomendadas pela sua visão de produto. Você pensa no longo prazo da plataforma, não só no ticket imediato.

## 🐄 Veredito Final
Pontuação de **1 a 10** em "Maturidade Civilizatória do Código" e decisão: APROVADO PARA ABDUÇÃO / REQUER INSPEÇÃO ADICIONAL / DEVOLVIDO AO PASTO.
Inclua uma frase de encerramento no tom de quem assina como dono da empresa.

Seja engraçado e temático, mas tecnicamente preciso. O review deve ser útil de verdade — você tem equity nessa plataforma.`;

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
