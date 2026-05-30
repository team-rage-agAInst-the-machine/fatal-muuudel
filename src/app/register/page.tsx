"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import Link from "next/link";
import { Saucer } from "@/components/fatal/Saucer";
import { Starfield } from "@/components/fatal/Starfield";
import { HitchhikerQuote } from "@/components/fatal/HitchhikerQuote";
import { randomQuote } from "@/lib/hitchhiker";

const schema = z.object({
  name: z.string().min(2, "Nome precisa ter pelo menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha precisa ter pelo menos 6 caracteres"),
  callsign: z.string().min(2, "Callsign muito curto").max(20, "Callsign muito longo"),
  homePlanet: z.string().min(2, "Planeta natal obrigatório"),
  shipModel: z.string().min(2, "Modelo da nave obrigatório"),
});

type Fields = z.infer<typeof schema>;
type FieldErrors = Partial<Record<keyof Fields, string>>;

export default function RegisterPage() {
  const router = useRouter();
  const [fields, setFields] = useState<Fields>({
    name: "",
    email: "",
    password: "",
    callsign: "",
    homePlanet: "",
    shipModel: "",
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);
  const [quote, setQuote] = useState("");

  function set(k: keyof Fields, v: string) {
    setFields((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: undefined }));
    setServerError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = schema.safeParse(fields);
    if (!parsed.success) {
      const fieldErrors: FieldErrors = {};
      parsed.error.issues.forEach((i) => {
        fieldErrors[i.path[0] as keyof Fields] = i.message;
      });
      setErrors(fieldErrors);
      setQuote(randomQuote());
      return;
    }

    setLoading(true);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(fields),
    });

    if (!res.ok) {
      const data = await res.json();
      setLoading(false);
      if (data.error === "EMAIL_TAKEN") {
        setErrors((e) => ({ ...e, email: "Esse email já está na frota" }));
      } else if (data.error === "CALLSIGN_TAKEN") {
        setErrors((e) => ({ ...e, callsign: "Callsign já usado por outro ET" }));
      } else {
        setServerError("Nave com defeito, tenta de novo 🛸");
      }
      setQuote(randomQuote());
      return;
    }

    const { email, password } = fields;
    set("password", "");

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
      <div
        className="fm-app"
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-start",
          padding: "32px 32px 40px",
          overflowY: "auto",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, marginBottom: 32 }}>
          <Saucer className="w-14 h-14" />
          <h1 className="fm-display" style={{ fontSize: 22, fontWeight: 800, color: "var(--cyan)", letterSpacing: "0.08em", margin: 0 }}>
            NOVA TRIPULAÇÃO
          </h1>
          <p style={{ color: "var(--ink-soft)", fontSize: 12, margin: 0, textAlign: "center" }}>
            Registre seu ET e embarque na frota 🐄
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ width: "100%", display: "flex", flexDirection: "column", gap: 16 }}>
          <Field label="NOME DO COMANDANTE" error={errors.name}>
            <input type="text" className="fm-input" value={fields.name} onChange={(e) => set("name", e.target.value)} placeholder="Zork das Nebulosas" />
          </Field>

          <Field label="EMAIL DO ET" error={errors.email}>
            <input type="email" className="fm-input" value={fields.email} onChange={(e) => set("email", e.target.value)} placeholder="zork@nebulosa.ufo" />
          </Field>

          <Field label="SENHA ESTELAR" error={errors.password}>
            <input type="password" className="fm-input" value={fields.password} onChange={(e) => set("password", e.target.value)} placeholder="••••••••" />
          </Field>

          <Field label="CALLSIGN DO ET" error={errors.callsign}>
            <input type="text" className="fm-input" value={fields.callsign} onChange={(e) => set("callsign", e.target.value)} placeholder="Capitão Mugido" />
          </Field>

          <Field label="PLANETA NATAL" error={errors.homePlanet}>
            <input type="text" className="fm-input" value={fields.homePlanet} onChange={(e) => set("homePlanet", e.target.value)} placeholder="Zargon-7" />
          </Field>

          <Field label="MODELO DA NAVE" error={errors.shipModel}>
            <input type="text" className="fm-input" value={fields.shipModel} onChange={(e) => set("shipModel", e.target.value)} placeholder="Disco Voador Mk. IV" />
          </Field>

          {serverError && (
            <p style={{ color: "var(--magenta)", fontSize: 13, textAlign: "center", margin: 0 }}>
              {serverError}
            </p>
          )}

          {quote && <HitchhikerQuote quote={quote} />}

          <button
            type="submit"
            disabled={loading}
            className="fm-btn fm-btn-cta fm-display"
            style={{ width: "100%", padding: "14px", fontSize: 15, letterSpacing: "0.1em", marginTop: 4 }}
          >
            {loading ? "PREPARANDO NAVE..." : "EMBARCAR NA FROTA"}
          </button>
        </form>

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

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      <label className="fm-display" style={{ color: "var(--ink-soft)", fontSize: 10, letterSpacing: "0.12em", textTransform: "uppercase" }}>
        {label}
      </label>
      {children}
      {error && <span style={{ color: "var(--magenta)", fontSize: 12 }}>{error}</span>}
    </div>
  );
}
