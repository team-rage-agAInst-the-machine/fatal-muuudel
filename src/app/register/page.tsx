"use client";

import { useState, useRef } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import Link from "next/link";
import { Saucer } from "@/components/fatal/Saucer";
import { Starfield } from "@/components/fatal/Starfield";
import { HitchhikerQuote } from "@/components/fatal/HitchhikerQuote";
import { randomQuote } from "@/lib/hitchhiker";

// ── Schemas ───────────────────────────────────────────────────────────────────

const step1Schema = z.object({
  name: z.string().min(2, "Nome precisa ter pelo menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha precisa ter pelo menos 6 caracteres"),
  callsign: z.string().min(2, "Callsign muito curto").max(20, "Callsign muito longo"),
  homePlanet: z.string().min(2, "Planeta natal obrigatório"),
  shipModel: z.string().min(2, "Modelo da nave obrigatório"),
});

type Step1 = z.infer<typeof step1Schema>;
type Step1Errors = Partial<Record<keyof Step1, string>>;

interface Step2 {
  image: string;
  species: string;
  locomotion: string;
  skinColor: string;
  eyeCount: string;
  iq: string;
  towelStatus: string;
  forceSensitive: boolean;
  starfleetRank: string;
}

// ── Options ───────────────────────────────────────────────────────────────────

const LOCOMOTION_OPTIONS = [
  "Bípede", "Quadrúpede", "Flutuante", "Tentáculos",
  "Rastejante", "Teletransporte", "Sem corpo físico", "Outro",
];

const TOWEL_OPTIONS = [
  "Sempre com a toalha — sou um mochileiro sério",
  "Perdi no buraco negro de Magrathea",
  "Nunca ouvi falar — o que é uma toalha?",
  "Uso apenas para secar meus tentáculos",
  "Tenho 42 toalhas, só por precaução",
];

const STARFLEET_RANKS = [
  "Recruta — primeiro dia na frota",
  "Tenente — ainda aprendendo",
  "Capitão — comando a minha nave",
  "Almirante — comando a galáxia",
  "Desertor da Federação",
  "Nunca ouvi falar da Starfleet",
];

// ── Main Component ────────────────────────────────────────────────────────────

export default function RegisterPage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<1 | 2>(1);

  const [step1, setStep1] = useState<Step1>({
    name: "", email: "", password: "",
    callsign: "", homePlanet: "", shipModel: "",
  });
  const [step1Errors, setStep1Errors] = useState<Step1Errors>({});

  const [step2, setStep2] = useState<Step2>({
    image: "", species: "", locomotion: "",
    skinColor: "#00f0ff", eyeCount: "",
    iq: "", towelStatus: "", forceSensitive: false, starfleetRank: "",
  });
  const [photoPreview, setPhotoPreview] = useState<string>("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const [quote, setQuote] = useState("");

  function setS1(k: keyof Step1, v: string) {
    setStep1((f) => ({ ...f, [k]: v }));
    setStep1Errors((e) => ({ ...e, [k]: undefined }));
    setServerError("");
  }

  function setS2<K extends keyof Step2>(k: K, v: Step2[K]) {
    setStep2((f) => ({ ...f, [k]: v }));
  }

  function handleStep1Submit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = step1Schema.safeParse(step1);
    if (!parsed.success) {
      const errs: Step1Errors = {};
      parsed.error.issues.forEach((i) => { errs[i.path[0] as keyof Step1] = i.message; });
      setStep1Errors(errs);
      setQuote(randomQuote());
      return;
    }
    setStep(2);
  }

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  }

  async function handleFinalSubmit(skip = false) {
    setLoading(true);
    setServerError("");

    let imageUrl = "";
    if (!skip && photoFile) {
      const fd = new FormData();
      fd.append("file", photoFile);
      const uploadRes = await fetch("/api/upload", { method: "POST", body: fd });
      if (uploadRes.ok) {
        const data = await uploadRes.json();
        imageUrl = data.url;
      }
    }

    const payload = {
      ...step1,
      image: imageUrl || undefined,
      species: step2.species || undefined,
      locomotion: step2.locomotion || undefined,
      skinColor: step2.skinColor !== "#00f0ff" ? step2.skinColor : undefined,
      eyeCount: step2.eyeCount ? parseInt(step2.eyeCount) : undefined,
      iq: step2.iq ? parseInt(step2.iq) : undefined,
      towelStatus: step2.towelStatus || undefined,
      forceSensitive: step2.forceSensitive || undefined,
      starfleetRank: step2.starfleetRank || undefined,
    };

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const data = await res.json();
      setLoading(false);
      if (data.error === "EMAIL_TAKEN") {
        setStep1Errors((e) => ({ ...e, email: "Esse email já está na frota" }));
        setStep(1);
      } else if (data.error === "CALLSIGN_TAKEN") {
        setStep1Errors((e) => ({ ...e, callsign: "Callsign já usado por outro ET" }));
        setStep(1);
      } else {
        setServerError("Nave com defeito, tenta de novo 🛸");
      }
      setQuote(randomQuote());
      return;
    }

    const { email, password } = step1;
    setS1("password", "");

    const login = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);

    if (login?.error) {
      setServerError("Conta criada! Mas a nave travou no login 🛸");
      setQuote(randomQuote());
      return;
    }

    router.push("/swipe");
  }

  return (
    <div className="fm-stage">
      <Starfield />
      <div className="fm-app" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-start", padding: "32px 32px 40px", overflowY: "auto" }}>

        {step === 1 ? (
          <>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, marginBottom: 28 }}>
              <Saucer className="w-14 h-14" />
              <h1 className="fm-display" style={{ fontSize: 20, fontWeight: 800, color: "var(--cyan)", letterSpacing: "0.08em", margin: 0 }}>
                NOVA TRIPULAÇÃO
              </h1>
              <StepDots current={1} />
              <p style={{ color: "var(--ink-soft)", fontSize: 11, margin: 0 }}>ETAPA 1 DE 2 — CREDENCIAIS DE ACESSO</p>
            </div>

            <form onSubmit={handleStep1Submit} style={{ width: "100%", display: "flex", flexDirection: "column", gap: 14 }}>
              <Field label="NOME DO COMANDANTE" error={step1Errors.name}>
                <input type="text" className="fm-input" value={step1.name} onChange={(e) => setS1("name", e.target.value)} placeholder="Zork das Nebulosas" />
              </Field>
              <Field label="EMAIL DO ET" error={step1Errors.email}>
                <input type="email" className="fm-input" value={step1.email} onChange={(e) => setS1("email", e.target.value)} placeholder="zork@nebulosa.ufo" />
              </Field>
              <Field label="SENHA ESTELAR" error={step1Errors.password}>
                <input type="password" className="fm-input" value={step1.password} onChange={(e) => setS1("password", e.target.value)} placeholder="••••••••" />
              </Field>
              <Field label="CALLSIGN DO ET" error={step1Errors.callsign}>
                <input type="text" className="fm-input" value={step1.callsign} onChange={(e) => setS1("callsign", e.target.value)} placeholder="Capitão Mugido" />
              </Field>
              <Field label="PLANETA NATAL" error={step1Errors.homePlanet}>
                <input type="text" className="fm-input" value={step1.homePlanet} onChange={(e) => setS1("homePlanet", e.target.value)} placeholder="Magrathea, Vulcano, Terra..." />
              </Field>
              <Field label="MODELO DA NAVE" error={step1Errors.shipModel}>
                <input type="text" className="fm-input" value={step1.shipModel} onChange={(e) => setS1("shipModel", e.target.value)} placeholder="Millennium Falcon Mk. II" />
              </Field>
              <button type="submit" className="fm-btn fm-btn-cta fm-display" style={{ width: "100%", padding: "14px", fontSize: 14, letterSpacing: "0.1em", marginTop: 6 }}>
                PRÓXIMA ETAPA →
              </button>
            </form>
          </>
        ) : (
          <>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, marginBottom: 24 }}>
              <div style={{ fontSize: 36 }}>👽</div>
              <h1 className="fm-display" style={{ fontSize: 18, fontWeight: 800, color: "var(--cyan)", letterSpacing: "0.08em", margin: 0, textAlign: "center" }}>
                ESCANEANDO ESPÉCIME
              </h1>
              <StepDots current={2} />
              <p style={{ color: "var(--ink-soft)", fontSize: 11, margin: 0 }}>ETAPA 2 DE 2 — DADOS BIOLÓGICOS</p>
            </div>

            {/* Foto */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12, marginBottom: 24 }}>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                style={{
                  width: 100, height: 100, borderRadius: "50%",
                  border: "2px solid var(--cyan)",
                  background: photoPreview ? "transparent" : "var(--bg-2)",
                  cursor: "pointer", overflow: "hidden", padding: 0,
                  boxShadow: "0 0 16px rgba(0,240,255,0.3)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}
              >
                {photoPreview
                  ? <img src={photoPreview} alt="preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  : <span style={{ fontSize: 36 }}>📸</span>
                }
              </button>
              <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" style={{ display: "none" }} onChange={handlePhotoChange} />
              <span className="fm-display" style={{ color: "var(--ink-soft)", fontSize: 10, letterSpacing: "0.1em" }}>
                {photoPreview ? "ESPÉCIME IDENTIFICADO" : "FOTO DO ESPÉCIME (OPCIONAL)"}
              </span>
            </div>

            <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 14 }}>
              <SectionLabel>DADOS BIOLÓGICOS</SectionLabel>

              <Field label="ESPÉCIE">
                <input type="text" className="fm-input" value={step2.species} onChange={(e) => setS2("species", e.target.value)} placeholder="Vulcano, Wookie, Pan-dimensional..." />
              </Field>

              <Field label="MODO DE LOCOMOÇÃO">
                <select className="fm-input" value={step2.locomotion} onChange={(e) => setS2("locomotion", e.target.value)} style={{ cursor: "pointer" }}>
                  <option value="">Selecione...</option>
                  {LOCOMOTION_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              </Field>

              <div style={{ display: "flex", gap: 12 }}>
                <Field label="COR DO ESPÉCIME" style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, background: "var(--bg-2)", border: "1px solid var(--line)", borderRadius: 10, padding: "10px 14px" }}>
                    <input type="color" value={step2.skinColor} onChange={(e) => setS2("skinColor", e.target.value)}
                      style={{ width: 32, height: 32, border: "none", background: "transparent", cursor: "pointer", padding: 0 }} />
                    <span style={{ color: "var(--ink-soft)", fontSize: 12, fontFamily: "var(--fm-body)" }}>{step2.skinColor.toUpperCase()}</span>
                  </div>
                </Field>
                <Field label="Nº DE OLHOS" style={{ flex: 1 }}>
                  <input type="number" className="fm-input" min={1} max={99} value={step2.eyeCount} onChange={(e) => setS2("eyeCount", e.target.value)} placeholder="2" />
                </Field>
              </div>

              <Field label={<>QI INTERGALÁCTICO <span style={{ color: "var(--ink-soft)", fontSize: 9 }}>(42 É A MÉDIA GALÁCTICA)</span></>}>
                <input type="number" className="fm-input" min={1} max={9999} value={step2.iq} onChange={(e) => setS2("iq", e.target.value)} placeholder="42" />
              </Field>

              <SectionLabel>AFILIAÇÃO GALÁCTICA</SectionLabel>

              <Field label="STATUS DA TOALHA">
                <select className="fm-input" value={step2.towelStatus} onChange={(e) => setS2("towelStatus", e.target.value)} style={{ cursor: "pointer" }}>
                  <option value="">Selecione sua relação com a toalha...</option>
                  {TOWEL_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              </Field>

              <Field label="PATENTE STARFLEET">
                <select className="fm-input" value={step2.starfleetRank} onChange={(e) => setS2("starfleetRank", e.target.value)} style={{ cursor: "pointer" }}>
                  <option value="">Selecione sua patente...</option>
                  {STARFLEET_RANKS.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              </Field>

              <Field label="MIDICHLORIANS DETECTADOS?">
                <button
                  type="button"
                  onClick={() => setS2("forceSensitive", !step2.forceSensitive)}
                  style={{
                    display: "flex", alignItems: "center", gap: 12,
                    background: "var(--bg-2)", border: `1px solid ${step2.forceSensitive ? "var(--violet)" : "var(--line)"}`,
                    borderRadius: 10, padding: "12px 16px", cursor: "pointer",
                    color: step2.forceSensitive ? "var(--violet)" : "var(--ink-soft)",
                    fontFamily: "var(--fm-body)", fontSize: 13,
                    boxShadow: step2.forceSensitive ? "0 0 12px rgba(176,107,255,0.3)" : "none",
                    transition: "all 0.2s",
                  }}
                >
                  <span style={{ fontSize: 20 }}>{step2.forceSensitive ? "⚡" : "💤"}</span>
                  {step2.forceSensitive ? "SIM — A FORÇA É FORTE COMIGO" : "NÃO — SOU UM MUGGLE ESPACIAL"}
                </button>
              </Field>
            </div>

            {serverError && (
              <p style={{ color: "var(--magenta)", fontSize: 13, textAlign: "center", margin: "12px 0 0" }}>
                {serverError}
              </p>
            )}

            {quote && <HitchhikerQuote quote={quote} />}

            <div style={{ display: "flex", flexDirection: "column", gap: 10, width: "100%", marginTop: 20 }}>
              <button
                type="button"
                disabled={loading}
                onClick={() => handleFinalSubmit(false)}
                className="fm-btn fm-btn-cta fm-display"
                style={{ width: "100%", padding: "14px", fontSize: 14, letterSpacing: "0.1em" }}
              >
                {loading ? "TRANSMITINDO DNA..." : "CONFIRMAR ESPÉCIME ✓"}
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={() => handleFinalSubmit(true)}
                className="fm-btn fm-btn-ghost fm-display"
                style={{ width: "100%", padding: "12px", fontSize: 12, letterSpacing: "0.1em" }}
              >
                PULAR — SOU MISTERIOSO
              </button>
            </div>
          </>
        )}

        <p style={{ color: "var(--ink-soft)", fontSize: 13, marginTop: 24, textAlign: "center" }}>
          Já tem nave?{" "}
          <Link href="/login" style={{ color: "var(--cyan)", textDecoration: "none", fontWeight: 600 }}>
            ENTRAR NA NAVE
          </Link>
        </p>
      </div>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function StepDots({ current }: { current: 1 | 2 }) {
  return (
    <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
      {[1, 2].map((n) => (
        <div key={n} style={{
          width: n === current ? 20 : 8, height: 8, borderRadius: 4,
          background: n === current ? "var(--cyan)" : "var(--line)",
          transition: "all 0.3s",
        }} />
      ))}
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "4px 0 -2px" }}>
      <span className="fm-display" style={{ color: "var(--cyan-dim)", fontSize: 10, letterSpacing: "0.15em" }}>
        &gt; {children}
      </span>
      <div style={{ flex: 1, height: 1, background: "var(--line)" }} />
    </div>
  );
}

function Field({ label, error, children, style }: {
  label: React.ReactNode;
  error?: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6, ...style }}>
      <label className="fm-display" style={{ color: "var(--ink-soft)", fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase" }}>
        {label}
      </label>
      {children}
      {error && <span style={{ color: "var(--magenta)", fontSize: 12 }}>{error}</span>}
    </div>
  );
}
