"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { z } from "zod";
import Link from "next/link";
import { Saucer } from "@/components/fatal/Saucer";
import { Starfield } from "@/components/fatal/Starfield";

const schema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha precisa ter pelo menos 6 caracteres"),
});

export default function LoginPage() {
  const router = useRouter();
  const [fields, setFields] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<Partial<typeof fields>>({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(false);

  function set(k: keyof typeof fields, v: string) {
    setFields((f) => ({ ...f, [k]: v }));
    setErrors((e) => ({ ...e, [k]: undefined }));
    setServerError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const parsed = schema.safeParse(fields);
    if (!parsed.success) {
      const fieldErrors: Partial<typeof fields> = {};
      parsed.error.issues.forEach((i) => {
        fieldErrors[i.path[0] as keyof typeof fields] = i.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);
    const res = await signIn("credentials", {
      email: fields.email,
      password: fields.password,
      redirect: false,
    });
    setLoading(false);

    if (res?.error) {
      setServerError("Nave com defeito, tenta de novo 🛸");
      return;
    }

    router.push("/swipe");
  }

  return (
    <div className="fm-stage">
      <Starfield />
      <div className="fm-app" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "40px 32px", overflow: "auto" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, marginBottom: 40 }}>
          <Saucer className="w-16 h-16" />
          <h1 className="fm-display" style={{ fontSize: 26, fontWeight: 800, color: "var(--cyan)", letterSpacing: "0.08em", margin: 0 }}>
            FATAL MUUUDEL
          </h1>
          <p style={{ color: "var(--ink-soft)", fontSize: 12, margin: 0, textAlign: "center" }}>
            O pasto inteiro na palma do raio trator 🛸🐄
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ width: "100%", display: "flex", flexDirection: "column", gap: 20 }}>
          <Field label="EMAIL DO ET" error={errors.email}>
            <input
              type="email"
              className="fm-input"
              value={fields.email}
              onChange={(e) => set("email", e.target.value)}
              placeholder="capitao@galaxia.ufo"
            />
          </Field>

          <Field label="SENHA ESTELAR" error={errors.password}>
            <input
              type="password"
              className="fm-input"
              value={fields.password}
              onChange={(e) => set("password", e.target.value)}
              placeholder="••••••••"
            />
          </Field>

          {serverError && (
            <p style={{ color: "var(--magenta)", fontSize: 13, textAlign: "center", margin: 0 }}>
              {serverError}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="fm-btn fm-btn-cta fm-display"
            style={{ width: "100%", padding: "14px", fontSize: 15, letterSpacing: "0.1em", marginTop: 4 }}
          >
            {loading ? "ATIVANDO RAIO TRATOR..." : "ENTRAR NA NAVE"}
          </button>
        </form>

        <p style={{ color: "var(--ink-soft)", fontSize: 13, marginTop: 32, textAlign: "center" }}>
          Nave nova?{" "}
          <Link href="/register" style={{ color: "var(--cyan)", textDecoration: "none", fontWeight: 600 }}>
            EMBARCAR NA FROTA
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
