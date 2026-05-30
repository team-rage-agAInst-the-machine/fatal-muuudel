const fs = require("fs");
const https = require("https");

const token = process.env.GITHUB_TOKEN;
const repo = process.env.REPO;
const prNumber = process.env.PR_NUMBER;

const raw = fs.existsSync("test-output.txt")
  ? fs.readFileSync("test-output.txt", "utf8")
  : "Arquivo de output não encontrado.";

// Extrai só as linhas relevantes (falhas + sumário)
const lines = raw.split("\n");
const failLines = lines.filter(
  (l) =>
    l.includes("FAIL") ||
    l.includes("✗") ||
    l.includes("×") ||
    l.includes("AssertionError") ||
    l.includes("Error:") ||
    l.includes("expected") ||
    l.includes("Test Files") ||
    l.includes("Tests ") ||
    l.includes("Duration")
);

const excerpt = failLines.slice(0, 60).join("\n") || raw.slice(0, 2000);

const body = `## 🛸 Relatório da Varredura Estelar

> **Capitão, temos um problema.** Os testes falharam antes de decolar. O raio trator está instável — revise os espécimes abaixo antes de tentar a abdução novamente.

---

### 🔴 Falhas detectadas no hangar

\`\`\`
${excerpt}
\`\`\`

---

> 🐄 Corrija os bugs, reabastece a nave e empurra de novo.
> *— Sistema de Monitoramento Bovino Intergaláctico v1.0*`;

const payload = JSON.stringify({ body });

const [owner, repoName] = repo.split("/");
const options = {
  hostname: "api.github.com",
  path: `/repos/${owner}/${repoName}/issues/${prNumber}/comments`,
  method: "POST",
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    "User-Agent": "fatal-muuudel-bot",
    "Content-Length": Buffer.byteLength(payload),
  },
};

const req = https.request(options, (res) => {
  let data = "";
  res.on("data", (chunk) => (data += chunk));
  res.on("end", () => {
    if (res.statusCode === 201) {
      console.log("🛸 Relatório de falhas postado no PR.");
    } else {
      console.error(`Erro ao postar comentário: ${res.statusCode}`, data);
      process.exit(1);
    }
  });
});

req.on("error", (err) => {
  console.error("Falha na requisição:", err);
  process.exit(1);
});

req.write(payload);
req.end();
