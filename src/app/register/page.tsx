"use client";

import { useState, useRef, useEffect } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import Link from "next/link";
import { Saucer } from "@/components/fatal/Saucer";
import { Starfield } from "@/components/fatal/Starfield";
import { HitchhikerQuote } from "@/components/fatal/HitchhikerQuote";
import { randomQuote } from "@/lib/hitchhiker";

// ── Schema ────────────────────────────────────────────────────────────────────

const step1Schema = z.object({
  name: z.string().min(2, "Nome precisa ter pelo menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha precisa ter pelo menos 6 caracteres"),
  callsign: z.string().min(2, "Callsign muito curto").max(20, "Callsign muito longo"),
});

type Step1 = z.infer<typeof step1Schema>;
type Step1Errors = Partial<Record<keyof Step1, string>>;

// ── Opções ────────────────────────────────────────────────────────────────────

const PLANET_SUGGESTIONS = [
  "Magrathea", "Vulcano", "Terra", "Tatooine", "Alderaan", "Krypton",
  "Pandora", "Gallifrey", "Arrakis", "Coruscant", "Trantor", "Bajor",
  "Qo'noS", "Alpha Centauri", "Betelgeuse IV", "Omicron Persei 8",
  "Zaphod", "Zirgon", "Raxacoricofallapatorius",
];

const SHIP_SUGGESTIONS = [
  "Millennium Falcon", "Heart of Gold", "USS Enterprise NCC-1701",
  "Nostromo", "Serenity", "TARDIS", "Battlestar Galactica",
  "Slave I", "Rocinante", "Discovery One", "Bebop", "Red Dwarf",
  "Executor", "Eagle 5", "Dark Star", "Lexx",
];

const SPECIES_SUGGESTIONS = [
  "Humano", "Vulcano", "Wookie", "Klingon", "Jedi", "Sith",
  "Marciano", "Android", "Ciborgue", "Elfo Espacial",
  "Fungo Consciente", "Entidade de Plasma", "Pan-dimensional",
  "Zaphod Beeblebróx (clone)", "Não-binário biológico", "Outra",
];

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

const STEP_LABELS: Record<number, string> = {
  1: "CREDENCIAIS",
  2: "COORDENADAS",
  3: "BIOLOGIA",
  4: "AFILIAÇÃO",
};

// ── Componente principal ──────────────────────────────────────────────────────

export default function RegisterPage() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Etapa 1 — credenciais (obrigatórias)
  const [step1, setStep1] = useState<Step1>({ name: "", email: "", password: "", callsign: "" });
  const [step1Errors, setStep1Errors] = useState<Step1Errors>({});

  // Etapa 2 — coordenadas (opcionais)
  const [homePlanet, setHomePlanet] = useState("");
  const [shipModel, setShipModel] = useState("");

  // Etapa 3 — dados biológicos (opcionais)
  const [species, setSpecies] = useState("");
  const [locomotion, setLocomoção] = useState("");
  const [skinColor, setSkinColor] = useState("#00f0ff");
  const [eyeCount, setEyeCount] = useState("");
  const [iq, setIq] = useState("");
  const [photoPreview, setPhotoPreview] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);

  // Etapa 4 — afiliação galáctica (opcionais)
  const [towelStatus, setTowelStatus] = useState("");
  const [forceSensitive, setForceSensitive] = useState(false);
  const [starfleetRank, setStarfleetRank] = useState("");

  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const [quote, setQuote] = useState("");

  function setS1(k: keyof Step1, v: string) {
    setStep1((f) => ({ ...f, [k]: v }));
    setStep1Errors((e) => ({ ...e, [k]: undefined }));
    setServerError("");
  }

  function goBack() {
    setStep((s) => (s > 1 ? ((s - 1) as 1 | 2 | 3 | 4) : s));
    setServerError("");
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

  async function handleFinalSubmit(skipPhoto = false) {
    setLoading(true);
    setServerError("");

    const payload = {
      ...step1,
      homePlanet: homePlanet || undefined,
      shipModel: shipModel || undefined,
      species: species || undefined,
      locomotion: locomotion || undefined,
      skinColor: skinColor !== "#00f0ff" ? skinColor : undefined,
      eyeCount: eyeCount ? parseInt(eyeCount) : undefined,
      iq: iq ? parseInt(iq) : undefined,
      towelStatus: towelStatus || undefined,
      forceSensitive: forceSensitive || undefined,
      starfleetRank: starfleetRank || undefined,
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
        setServerError(data.error ?? "Nave com defeito, tenta de novo 🛸");
      }
      setQuote(randomQuote());
      return;
    }

    const { email, password } = step1;
    setS1("password", "");

    let login: Awaited<ReturnType<typeof signIn>> | null = null;
    try {
      login = await signIn("credentials", { email, password, redirect: false });
    } catch {
      setLoading(false);
      setServerError("Conta criada! Mas a nave travou no login 🛸");
      setQuote(randomQuote());
      return;
    }

    if (login && !login.error && !skipPhoto && photoFile) {
      const fd = new FormData();
      fd.append("file", photoFile);
      const uploadResult = await fetch("/api/upload", { method: "POST", body: fd }).catch(() => null);
      if (!uploadResult?.ok) {
        setServerError("Foto não enviada, mas seu cadastro está ok. Atualize no perfil! 📸");
      }
    }

    setLoading(false);

    if (login?.error) {
      setServerError("Conta criada! Mas a nave travou no login 🛸");
      setQuote(randomQuote());
      return;
    }

    router.push("/swipe");
  }

  const icons: Record<number, string> = { 1: "", 2: "🌌", 3: "👽", 4: "🚀" };
  const subtitles: Record<number, string> = {
    1: "CREDENCIAIS DE ACESSO",
    2: "OPCIONAL — PODE PULAR",
    3: "OPCIONAL — PODE PULAR",
    4: "OPCIONAL — PODE PULAR",
  };
  const titles: Record<number, string> = {
    1: "NOVA TRIPULAÇÃO",
    2: "COORDENADAS DE ORIGEM",
    3: "DADOS BIOLÓGICOS",
    4: "AFILIAÇÃO GALÁCTICA",
  };

  return (
    <div className="fm-stage">
      <Starfield />
      <div className="fm-app" style={{ display: "flex", flexDirection: "column", overflow: "hidden", padding: 0 }}>

        {/* ── Área scrollável ── */}
        <div style={{ flex: 1, overflowY: "auto", padding: "28px 32px 16px" }}>

          {/* Cabeçalho */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, marginBottom: 24, width: "100%" }}>
            {step === 1 ? <Saucer className="w-14 h-14" /> : <div style={{ fontSize: 34 }}>{icons[step]}</div>}
            <h1 className="fm-display" style={{ fontSize: step === 1 ? 20 : 17, fontWeight: 800, color: "var(--cyan)", letterSpacing: "0.08em", margin: 0, textAlign: "center" }}>
              {titles[step]}
            </h1>
            <StepDots current={step} labels={STEP_LABELS} />
            <p style={{ color: "var(--ink-soft)", fontSize: 11, margin: 0 }}>
              ETAPA {step} DE 4 — {subtitles[step]}
            </p>
          </div>

          {/* Etapa 1 — Credenciais */}
          {step === 1 && (
            <form id="register-step1" onSubmit={handleStep1Submit} style={{ width: "100%", display: "flex", flexDirection: "column", gap: 14 }}>
              <Field label={<>NOME DO COMANDANTE <Tip text="Como você aparece no perfil." /></>} error={step1Errors.name}>
                <input type="text" className="fm-input" value={step1.name} onChange={(e) => setS1("name", e.target.value)} placeholder="Zork das Nebulosas" />
              </Field>
              <Field label="EMAIL DO ET" error={step1Errors.email}>
                <input type="email" className="fm-input" value={step1.email} onChange={(e) => setS1("email", e.target.value)} placeholder="zork@nebulosa.ufo" />
              </Field>
              <Field label="SENHA ESTELAR" error={step1Errors.password}>
                <input type="password" className="fm-input" value={step1.password} onChange={(e) => setS1("password", e.target.value)} placeholder="••••••••" />
              </Field>
              <Field label={<>CALLSIGN <Tip text="Codinome de piloto. Ex: Capitão Mugido, Zork VII." /></>} error={step1Errors.callsign}>
                <input type="text" className="fm-input" value={step1.callsign} onChange={(e) => setS1("callsign", e.target.value)} placeholder="Capitão Mugido" />
              </Field>
              {serverError && <p style={{ color: "var(--magenta)", fontSize: 13, textAlign: "center", margin: "4px 0 0" }}>{serverError}</p>}
              {quote && <HitchhikerQuote quote={quote} />}
            </form>
          )}

          {/* Etapa 2 — Coordenadas */}
          {step === 2 && (
            <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 14 }}>
              <Field label={<>PLANETA NATAL <Tip text="Onde você nasceu. Real ou fictício." /></>}>
                <Combobox value={homePlanet} onChange={setHomePlanet} options={PLANET_SUGGESTIONS} placeholder="Comece a digitar ou escolha..." />
              </Field>
              <Field label={<>MODELO DA NAVE <Tip text="Aparece no seu perfil." /></>}>
                <Combobox value={shipModel} onChange={setShipModel} options={SHIP_SUGGESTIONS} placeholder="Comece a digitar ou escolha..." />
              </Field>
            </div>
          )}

          {/* Etapa 3 — Dados Biológicos */}
          {step === 3 && (
            <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, marginBottom: 4 }}>
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  style={{
                    width: 90, height: 90, borderRadius: "50%",
                    border: "2px solid var(--cyan)",
                    background: photoPreview ? "transparent" : "var(--bg-2)",
                    cursor: "pointer", overflow: "hidden", padding: 0,
                    boxShadow: "0 0 16px rgba(0,240,255,0.3)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}
                >
                  {photoPreview
                    ? <img src={photoPreview} alt="preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    : <span style={{ fontSize: 32 }}>📸</span>}
                </button>
                <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" style={{ display: "none" }} onChange={handlePhotoChange} />
                <span className="fm-display" style={{ color: "var(--ink-soft)", fontSize: 10, letterSpacing: "0.1em" }}>
                  {photoPreview ? "ESPÉCIME IDENTIFICADO" : "FOTO DO ESPÉCIME (OPCIONAL)"}
                </span>
              </div>
              <Field label={<>ESPÉCIE <Tip text="Vulcano, Wookie, Fungo Consciente..." /></>}>
                <Combobox value={species} onChange={setSpecies} options={SPECIES_SUGGESTIONS} placeholder="Vulcano, Wookie, Pan-dimensional..." />
              </Field>
              <Field label={<>MODO DE LOCOMOÇÃO <Tip text="Afeta o tamanho da portinhola na nave." /></>}>
                <select className="fm-input" value={locomotion} onChange={(e) => setLocomoção(e.target.value)} style={{ cursor: "pointer" }}>
                  <option value="">Selecione...</option>
                  {LOCOMOTION_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              </Field>
              <div style={{ display: "flex", gap: 12 }}>
                <Field label={<>COR <Tip text="Cor predominante do seu espécime." /></>} style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, background: "var(--bg-2)", border: "1px solid var(--line)", borderRadius: 10, padding: "10px 14px" }}>
                    <input type="color" value={skinColor} onChange={(e) => setSkinColor(e.target.value)}
                      style={{ width: 32, height: 32, border: "none", background: "transparent", cursor: "pointer", padding: 0 }} />
                    <span style={{ color: "var(--ink-soft)", fontSize: 12, fontFamily: "var(--fm-body)" }}>{skinColor.toUpperCase()}</span>
                  </div>
                </Field>
                <Field label={<>Nº DE OLHOS <Tip text="Zero a cem, sem julgamento." /></>} style={{ flex: 1 }}>
                  <input type="number" className="fm-input" min={0} max={99} value={eyeCount} onChange={(e) => setEyeCount(e.target.value)} placeholder="2" />
                </Field>
              </div>
              <Field label={<>QI INTERGALÁCTICO <Tip text="42 é a média galáctica." /></>}>
                <input type="number" className="fm-input" min={1} max={9999} value={iq} onChange={(e) => setIq(e.target.value)} placeholder="42" />
              </Field>
            </div>
          )}

          {/* Etapa 4 — Afiliação */}
          {step === 4 && (
            <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 14 }}>
              <Field label={<>STATUS DA TOALHA <Tip text="Ref. ao Guia do Mochileiro das Galáxias." /></>}>
                <select className="fm-input" value={towelStatus} onChange={(e) => setTowelStatus(e.target.value)} style={{ cursor: "pointer" }}>
                  <option value="">Selecione sua relação com a toalha...</option>
                  {TOWEL_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              </Field>
              <Field label={<>PATENTE STARFLEET <Tip text="Ref. a Star Trek. Não é fã? Escolha a última opção." /></>}>
                <select className="fm-input" value={starfleetRank} onChange={(e) => setStarfleetRank(e.target.value)} style={{ cursor: "pointer" }}>
                  <option value="">Selecione sua patente...</option>
                  {STARFLEET_RANKS.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              </Field>
              <Field label={<>MIDICHLORIANS DETECTADOS? <Tip text="Ref. a Star Wars. Puramente cosmético." /></>}>
                <button
                  type="button"
                  onClick={() => setForceSensitive((v) => !v)}
                  style={{
                    display: "flex", alignItems: "center", gap: 12,
                    background: "var(--bg-2)", border: `1px solid ${forceSensitive ? "var(--violet)" : "var(--line)"}`,
                    borderRadius: 10, padding: "12px 16px", cursor: "pointer",
                    color: forceSensitive ? "var(--violet)" : "var(--ink-soft)",
                    fontFamily: "var(--fm-body)", fontSize: 13,
                    boxShadow: forceSensitive ? "0 0 12px rgba(176,107,255,0.3)" : "none",
                    transition: "all 0.2s",
                  }}
                >
                  <span style={{ fontSize: 20 }}>{forceSensitive ? "⚡" : "💤"}</span>
                  {forceSensitive ? "SIM — A FORÇA É FORTE COMIGO" : "NÃO — SOU UM MUGGLE ESPACIAL"}
                </button>
              </Field>
              {serverError && <p style={{ color: "var(--magenta)", fontSize: 13, textAlign: "center", margin: "4px 0 0" }}>{serverError}</p>}
              {quote && <HitchhikerQuote quote={quote} />}
            </div>
          )}

          <p style={{ color: "var(--ink-soft)", fontSize: 13, marginTop: 24, textAlign: "center" }}>
            Já tem nave?{" "}
            <Link href="/login" style={{ color: "var(--cyan)", textDecoration: "none", fontWeight: 600 }}>
              ENTRAR NA NAVE
            </Link>
          </p>
        </div>

        {/* ── Rodapé fixo com navegação ── */}
        <div style={{ padding: "12px 32px 28px", borderTop: "1px solid var(--line)", background: "var(--bg)" }}>
          {step === 1 && (
            <button type="submit" form="register-step1" className="fm-btn fm-cta fm-display"
              style={{ width: "100%", padding: "14px", fontSize: 14, letterSpacing: "0.1em" }}>
              PRÓXIMA →
            </button>
          )}
          {step === 2 && <NavButtons onBack={goBack} onNext={() => setStep(3)} />}
          {step === 3 && <NavButtons onBack={goBack} onNext={() => setStep(4)} />}
          {step === 4 && (
            <div style={{ display: "flex", gap: 10 }}>
              <button type="button" onClick={goBack} className="fm-btn fm-ghost fm-display"
                style={{ flex: 1, padding: "14px", fontSize: 13, letterSpacing: "0.08em" }}>
                ← VOLTAR
              </button>
              <button type="button" disabled={loading} onClick={() => handleFinalSubmit(false)}
                className="fm-btn fm-cta fm-display"
                style={{ flex: 2, padding: "14px", fontSize: 13, letterSpacing: "0.08em" }}>
                {loading ? "TRANSMITINDO..." : "CONFIRMAR ✓"}
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

// ── Subcomponentes ────────────────────────────────────────────────────────────

function StepDots({ current, labels }: { current: number; labels: Record<number, string> }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 4 }}>
      {[1, 2, 3, 4].map((n) => (
        <div key={n} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
          <div style={{
            width: n === current ? 24 : 8, height: 8, borderRadius: 4,
            background: n < current ? "var(--lime)" : n === current ? "var(--cyan)" : "var(--line)",
            transition: "all 0.3s",
          }} />
          {n === current && (
            <span style={{ fontSize: 8, color: "var(--cyan)", fontFamily: "var(--fm-display)", letterSpacing: "0.1em" }}>
              {labels[n]}
            </span>
          )}
        </div>
      ))}
    </div>
  );
}

function Combobox({ value, onChange, options, placeholder }: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const filtered = value
    ? options.filter((o) => o.toLowerCase().includes(value.toLowerCase()))
    : options;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} style={{ position: "relative" }}>
      <input
        type="text"
        className="fm-input"
        value={value}
        onChange={(e) => { onChange(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        placeholder={placeholder}
        autoComplete="off"
      />
      {open && filtered.length > 0 && (
        <div style={{
          position: "absolute", top: "calc(100% + 4px)", left: 0, right: 0, zIndex: 50,
          background: "var(--bg-2)", border: "1px solid var(--cyan)",
          borderRadius: 10, maxHeight: 180, overflowY: "auto",
          boxShadow: "0 4px 20px rgba(0,240,255,0.15)",
        }}>
          {filtered.map((o) => (
            <button
              key={o}
              type="button"
              onMouseDown={() => { onChange(o); setOpen(false); }}
              style={{
                display: "block", width: "100%", padding: "9px 14px",
                background: "transparent", border: "none", cursor: "pointer",
                color: "var(--ink)", fontFamily: "var(--fm-body)", fontSize: 13,
                textAlign: "left", transition: "background 0.15s",
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(0,240,255,0.08)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
            >
              {o}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function Tip({ text }: { text: string }) {
  const [visible, setVisible] = useState(false);
  return (
    <span
      style={{ position: "relative", display: "inline-flex", alignItems: "center", verticalAlign: "middle" }}
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
    >
      <span
        tabIndex={0}
        style={{
          width: 14, height: 14, borderRadius: "50%",
          border: "1px solid var(--ink-soft)", color: "var(--ink-soft)",
          fontSize: 9, display: "inline-flex", alignItems: "center",
          justifyContent: "center", cursor: "help",
          fontFamily: "var(--fm-body)", lineHeight: 1, flexShrink: 0,
        }}
      >
        ?
      </span>
      {visible && (
        <div style={{
          position: "absolute", bottom: "calc(100% + 6px)", left: "50%",
          transform: "translateX(-50%)",
          background: "var(--bg-2)", border: "1px solid var(--cyan)",
          borderRadius: 8, padding: "8px 12px", width: 220,
          fontSize: 11, color: "var(--ink)", lineHeight: 1.6,
          zIndex: 100, pointerEvents: "none",
          boxShadow: "0 0 12px rgba(0,240,255,0.15)",
        }}>
          {text}
        </div>
      )}
    </span>
  );
}


function NavButtons({ onBack, onNext }: { onBack: () => void; onNext: () => void }) {
  return (
    <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
      <button type="button" onClick={onBack} className="fm-btn fm-ghost fm-display"
        style={{ flex: 1, padding: "14px", fontSize: 13, letterSpacing: "0.08em" }}>
        ← VOLTAR
      </button>
      <button type="button" onClick={onNext} className="fm-btn fm-cta fm-display"
        style={{ flex: 2, padding: "14px", fontSize: 13, letterSpacing: "0.08em" }}>
        PRÓXIMA →
      </button>
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
      <label className="fm-display" style={{
        color: "var(--ink-soft)", fontSize: 10,
        letterSpacing: "0.12em", textTransform: "uppercase",
        display: "flex", alignItems: "center", gap: 5,
      }}>
        {label}
      </label>
      {children}
      {error && <span style={{ color: "var(--magenta)", fontSize: 12 }}>{error}</span>}
    </div>
  );
}
