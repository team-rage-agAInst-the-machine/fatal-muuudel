"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// ── Constants ─────────────────────────────────────────────────────────────────

const TOWEL_OPTIONS = [
  "Sempre com a toalha — sou um mochileiro sério",
  "Perdi no buraco negro de Magrathea",
  "Nunca ouvi falar — o que é uma toalha?",
  "Uso apenas para secar meus tentáculos",
  "Tenho 42 toalhas, só por precaução",
];

const SIGNOS = [
  "Touro Nebular", "Leite de Andrômeda", "Escorpião Cósmico", "Buraco Negro do Boi",
  "Cometa Lanoso", "Pulsar Bovino", "Galáxia Mugidora", "Supernova do Pasto",
  "Quasar Ruminante", "Buraco de Minhoca", "Matéria Escura da Vaca", "Luz do Capim",
];

// ── Types ──────────────────────────────────────────────────────────────────────

type MissionData = {
  id: string;
  name: string;
  isActive: boolean;
  abductionStyle: string | null;
  objetivoDaMissao: string | null;
  temperamento: string | null;
  signoGalactico: string | null;
  mooPreference: number | null;
  maxCargoKg: number | null;
  createdAt: Date | string;
};

type UserData = {
  id: string;
  email?: string | null;
  name: string | null;
  image: string | null;
  callsign: string | null;
  homePlanet: string | null;
  shipModel: string | null;
  towelStatus?: string | null;
  missions: MissionData[];
};

type MissionForm = {
  name: string;
  abductionStyle: string;
  objetivoDaMissao: string;
  temperamento: string;
  signoGalactico: string;
  mooPreference: number;
  maxCargoKg: string;
};

const EMPTY_MISSION_FORM: MissionForm = {
  name: "", abductionStyle: "", objetivoDaMissao: "",
  temperamento: "", signoGalactico: "", mooPreference: 5, maxCargoKg: "",
};

function missionToForm(m: MissionData): MissionForm {
  return {
    name: m.name,
    abductionStyle: m.abductionStyle ?? "",
    objetivoDaMissao: m.objetivoDaMissao ?? "",
    temperamento: m.temperamento ?? "",
    signoGalactico: m.signoGalactico ?? "",
    mooPreference: m.mooPreference ?? 5,
    maxCargoKg: m.maxCargoKg?.toString() ?? "",
  };
}

// ── Component ──────────────────────────────────────────────────────────────────

export function ProfileScreen({ user }: { user: UserData }) {
  const [image, setImage] = useState(user.image);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Profile fields
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const [display, setDisplay] = useState({
    name: user.name, callsign: user.callsign,
    homePlanet: user.homePlanet, shipModel: user.shipModel,
    towelStatus: user.towelStatus ?? "",
  });

  const [form, setForm] = useState({
    name: user.name ?? "", callsign: user.callsign ?? "",
    homePlanet: user.homePlanet ?? "", shipModel: user.shipModel ?? "",
    towelStatus: TOWEL_OPTIONS.includes(user.towelStatus ?? "") ? (user.towelStatus ?? "") : "",
  });

  // Mission management
  const [missions, setMissions] = useState<MissionData[]>(user.missions ?? []);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [missionForm, setMissionForm] = useState<MissionForm>(EMPTY_MISSION_FORM);
  const [missionSaving, setMissionSaving] = useState(false);
  const [missionError, setMissionError] = useState<string | null>(null);
  const [missionSaved, setMissionSaved] = useState(false);

  // ── Photo upload ─────────────────────────────────────────────────────────────

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setUploadError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) { setUploadError(data.error ?? "Nave com defeito 🛸"); return; }
      setImage(data.url);
    } catch { setUploadError("Falha de comunicação intergaláctica 🛸"); }
    finally { setUploading(false); if (fileRef.current) fileRef.current.value = ""; }
  };

  // ── Profile save ─────────────────────────────────────────────────────────────

  const handleSave = async () => {
    setSaving(true); setSaveError(null);
    const payload: Record<string, string | null> = {};
    if (form.name.trim()) payload.name = form.name.trim();
    if (form.callsign.trim()) payload.callsign = form.callsign.trim();
    if (form.homePlanet.trim()) payload.homePlanet = form.homePlanet.trim();
    if (form.shipModel.trim()) payload.shipModel = form.shipModel.trim();
    payload.towelStatus = form.towelStatus || null;

    try {
      const res = await fetch("/api/profile", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) { setSaveError(data.error ?? "Nave com defeito 🛸"); return; }
      setDisplay({
        name: (data.user.name ?? form.name.trim()) || null,
        callsign: (data.user.callsign ?? form.callsign.trim()) || null,
        homePlanet: (data.user.homePlanet ?? form.homePlanet.trim()) || null,
        shipModel: (data.user.shipModel ?? form.shipModel.trim()) || null,
        towelStatus: data.user.towelStatus ?? "",
      });
      setSaved(true); setEditing(false);
      setTimeout(() => setSaved(false), 3000);
    } catch { setSaveError("Falha de comunicação intergaláctica 🛸"); }
    finally { setSaving(false); }
  };

  // ── Mission helpers ───────────────────────────────────────────────────────────

  const handleSelectMission = (m: MissionData) => {
    setSelectedId(m.id);
    setIsCreating(false);
    setMissionForm(missionToForm(m));
    setMissionError(null);
  };

  const handleNewMission = () => {
    setIsCreating(true);
    setSelectedId(null);
    setMissionForm(EMPTY_MISSION_FORM);
    setMissionError(null);
  };

  const handleCancelMission = () => {
    setIsCreating(false); setSelectedId(null); setMissionError(null);
  };

  const buildMissionPayload = (form: MissionForm) => ({
    name: form.name,
    ...(form.abductionStyle && { abductionStyle: form.abductionStyle }),
    ...(form.objetivoDaMissao && { objetivoDaMissao: form.objetivoDaMissao }),
    ...(form.temperamento && { temperamento: form.temperamento }),
    ...(form.signoGalactico && { signoGalactico: form.signoGalactico }),
    mooPreference: form.mooPreference,
    ...(form.maxCargoKg !== "" && { maxCargoKg: Number(form.maxCargoKg) }),
  });

  const handleSaveMission = async (activate = false) => {
    if (!missionForm.name.trim()) { setMissionError("Dê um nome à missão, capitão 👽"); return; }
    setMissionSaving(true); setMissionError(null);

    try {
      const payload = { ...buildMissionPayload(missionForm), activate };

      if (isCreating) {
        const res = await fetch("/api/mission", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) { setMissionError(data.error ?? "Nave com defeito 🛸"); return; }
        const newMission = data.mission as MissionData;
        setMissions((prev) => {
          const updated = activate ? prev.map((m) => ({ ...m, isActive: false })) : prev;
          return [newMission, ...updated];
        });
        setIsCreating(false);
        setSelectedId(newMission.id);
      } else {
        const res = await fetch(`/api/mission?id=${selectedId}`, {
          method: "PATCH", headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const data = await res.json();
        if (!res.ok) { setMissionError(data.error ?? "Nave com defeito 🛸"); return; }
        const updated = data.mission as MissionData;
        setMissions((prev) =>
          prev.map((m) => {
            if (activate && m.id !== selectedId) return { ...m, isActive: false };
            if (m.id === selectedId) return updated;
            return m;
          })
        );
      }

      setMissionSaved(true);
      setTimeout(() => setMissionSaved(false), 3000);
    } catch { setMissionError("Falha de comunicação intergaláctica 🛸"); }
    finally { setMissionSaving(false); }
  };

  const handleDeleteMission = async () => {
    if (!selectedId) return;
    setMissionSaving(true); setMissionError(null);
    try {
      const res = await fetch(`/api/mission?id=${selectedId}`, { method: "DELETE" });
      if (!res.ok) { const d = await res.json(); setMissionError(d.error ?? "Nave com defeito 🛸"); return; }
      setMissions((prev) => {
        const remaining = prev.filter((m) => m.id !== selectedId);
        // Se deletou a ativa, ativa a mais recente restante (espelha o backend)
        const hadActive = prev.find((m) => m.id === selectedId)?.isActive;
        if (hadActive && remaining.length > 0) remaining[0] = { ...remaining[0], isActive: true };
        return remaining;
      });
      setSelectedId(null); setIsCreating(false);
    } catch { setMissionError("Falha de comunicação intergaláctica 🛸"); }
    finally { setMissionSaving(false); }
  };

  const setF = (k: keyof MissionForm, v: string | number) =>
    setMissionForm((f) => ({ ...f, [k]: v }));

  const initials = (display.callsign ?? display.name ?? "ET").slice(0, 2).toUpperCase();

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <div className="fm-profile">
      <div className="fm-profile-et-topbar">
        <Link href="/" className="fm-tab" title="Voltar ao pasto" aria-label="Voltar">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M5 12l7 7M5 12l7-7" />
          </svg>
        </Link>
        <span className="fm-display fm-profile-et-title">PERFIL ET</span>
        <div style={{ width: 40 }} />
      </div>

      {/* Avatar */}
      <div className="fm-profile-avatar">
        <Avatar className="fm-avatar-xl" onClick={() => fileRef.current?.click()} style={{ cursor: "pointer" }}>
          <AvatarImage src={image ?? undefined} alt={display.callsign ?? "ET"} />
          <AvatarFallback className="fm-avatar-fallback">{initials}</AvatarFallback>
        </Avatar>
        <button className="fm-btn fm-ghost fm-display" style={{ fontSize: 11, padding: "8px 18px" }}
          onClick={() => fileRef.current?.click()} disabled={uploading}>
          {uploading ? "TRANSMITINDO..." : "TROCAR FOTO"}
        </button>
        {uploadError && <p className="fm-profile-error">{uploadError}</p>}
        <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp"
          onChange={handleFileChange} style={{ display: "none" }} />
      </div>

      {/* Email */}
      <div className="fm-profile-card">
        <div className="fm-profile-field">
          <span className="fm-profile-label">EMAIL — IMUTÁVEL COMO O COSMOS</span>
          <span className="fm-profile-value fm-profile-readonly">{user.email ?? "—"}</span>
        </div>
      </div>

      {/* Dados do ET */}
      <div className="fm-profile-card">
        {editing ? (
          <>
            <ProfileInput label="NOME GALÁCTICO" value={form.name}
              onChange={(v) => setForm((f) => ({ ...f, name: v }))} placeholder="Ex: Zork das Estrelas" maxLength={60} />
            <ProfileInput label="CALLSIGN" value={form.callsign}
              onChange={(v) => setForm((f) => ({ ...f, callsign: v }))} placeholder="Ex: Capitão Mugido" maxLength={30} />
            <ProfileInput label="PLANETA NATAL" value={form.homePlanet}
              onChange={(v) => setForm((f) => ({ ...f, homePlanet: v }))} placeholder="Ex: Zargon-7" maxLength={50} />
            <ProfileInput label="MODELO DA NAVE" value={form.shipModel}
              onChange={(v) => setForm((f) => ({ ...f, shipModel: v }))} placeholder="Ex: Disco Mk IV" maxLength={50} />
            <ProfileSelect label="STATUS DA TOALHA" value={form.towelStatus}
              onChange={(v) => setForm((f) => ({ ...f, towelStatus: v }))}
              options={[
                { value: "", label: "Selecione sua relação com a toalha..." },
                ...TOWEL_OPTIONS.map((o) => ({ value: o, label: o })),
              ]} />
            {saveError && <p className="fm-profile-error">{saveError}</p>}
            <div className="fm-profile-actions">
              <button className="fm-btn fm-ghost fm-display" style={{ flex: 1, fontSize: 11 }}
                onClick={() => { setEditing(false); setSaveError(null); }} disabled={saving}>CANCELAR</button>
              <button className="fm-btn fm-cta fm-display" style={{ flex: 1, fontSize: 11 }}
                onClick={handleSave} disabled={saving}>{saving ? "SALVANDO..." : "SALVAR DADOS"}</button>
            </div>
          </>
        ) : (
          <>
            <ProfileField label="NOME GALÁCTICO" value={display.name} />
            <ProfileField label="CALLSIGN" value={display.callsign} />
            <ProfileField label="PLANETA NATAL" value={display.homePlanet} />
            <ProfileField label="MODELO DA NAVE" value={display.shipModel} />
            <ProfileField label="STATUS DA TOALHA" value={display.towelStatus || null} />
            {saved && <p className="fm-profile-success">Transmissão recebida! Dados atualizados 🛸</p>}
            <button className="fm-btn fm-ghost fm-display" style={{ width: "100%", fontSize: 11 }}
              onClick={() => { setForm({ name: display.name ?? "", callsign: display.callsign ?? "", homePlanet: display.homePlanet ?? "", shipModel: display.shipModel ?? "", towelStatus: display.towelStatus ?? "" }); setSaveError(null); setEditing(true); }}>
              EDITAR PERFIL
            </button>
          </>
        )}
      </div>

      {/* Missões */}
      <div className="fm-profile-card">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <span className="fm-profile-label">🛸 MISSÕES DE ABDUÇÃO</span>
          <button className="fm-btn fm-ghost fm-display"
            style={{ fontSize: 10, padding: "6px 14px" }} onClick={handleNewMission}>
            + NOVA
          </button>
        </div>

        {missions.length === 0 && !isCreating && (
          <p style={{ color: "var(--ink-soft)", fontSize: 12, textAlign: "center", padding: "12px 0" }}>
            Nenhuma missão configurada. Cria a primeira! 🐄
          </p>
        )}

        {/* Lista de missões */}
        {missions.map((m) => (
          <div key={m.id} onClick={() => handleSelectMission(m)}
            style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              padding: "10px 14px", marginBottom: 8, cursor: "pointer", borderRadius: 10,
              border: `1px solid ${m.id === selectedId ? "var(--cyan)" : m.isActive ? "rgba(0,240,255,0.4)" : "rgba(0,240,255,0.15)"}`,
              background: m.id === selectedId ? "rgba(0,240,255,0.08)" : "rgba(0,240,255,0.02)",
              transition: "all 0.15s",
            }}>
            <span style={{ color: m.isActive ? "var(--cyan)" : "var(--ink)", fontSize: 13, fontFamily: "var(--fm-body)" }}>
              {m.name}
            </span>
            {m.isActive && (
              <span style={{
                background: "var(--cyan)", color: "var(--bg)", fontSize: 9,
                padding: "2px 8px", borderRadius: 20,
                fontFamily: "var(--fm-display)", letterSpacing: "0.1em",
              }}>ATIVA</span>
            )}
          </div>
        ))}

        {/* Formulário: editar missão selecionada ou criar nova */}
        {(selectedId || isCreating) && (
          <div style={{ borderTop: "1px solid rgba(0,240,255,0.15)", paddingTop: 16, marginTop: 8 }}>
            <span className="fm-profile-label" style={{ display: "block", marginBottom: 12 }}>
              {isCreating ? "✦ NOVA MISSÃO" : "✦ EDITAR MISSÃO"}
            </span>

            <ProfileInput label="NOME DA MISSÃO *" value={missionForm.name}
              onChange={(v) => setF("name", v)} placeholder="Ex: Operação Vaca Stealth" maxLength={60} />

            <ProfileSelect label="ESTILO DE ABDUÇÃO" value={missionForm.abductionStyle}
              onChange={(v) => setF("abductionStyle", v)}
              options={[
                { value: "", label: "— selecionar —" },
                { value: "stealth", label: "Stealth 🌑" },
                { value: "científico", label: "Científico 🔬" },
                { value: "flashy", label: "Flashy ✨" },
                { value: "casual", label: "Casual 😎" },
              ]} />

            <ProfileSelect label="OBJETIVO DA MISSÃO" value={missionForm.objetivoDaMissao}
              onChange={(v) => setF("objetivoDaMissao", v)}
              options={[
                { value: "", label: "— selecionar —" },
                { value: "pesquisa", label: "Pesquisa 🔭" },
                { value: "troféu", label: "Troféu 🏆" },
                { value: "companhia", label: "Companhia 🤝" },
                { value: "experimento", label: "Experimento 🧪" },
              ]} />

            <ProfileSelect label="TEMPERAMENTO ET" value={missionForm.temperamento}
              onChange={(v) => setF("temperamento", v)}
              options={[
                { value: "", label: "— selecionar —" },
                { value: "paciente", label: "Paciente 🧘" },
                { value: "agitado", label: "Agitado ⚡" },
                { value: "curioso", label: "Curioso 🔍" },
                { value: "dominante", label: "Dominante 👑" },
              ]} />

            <ProfileSelect label="SIGNO GALÁCTICO" value={missionForm.signoGalactico}
              onChange={(v) => setF("signoGalactico", v)}
              options={[{ value: "", label: "— selecionar —" }, ...SIGNOS.map((s) => ({ value: s, label: s }))]} />

            <div className="fm-profile-field">
              <span className="fm-profile-label">PREFERÊNCIA DE MUGIDO: {missionForm.mooPreference}/10</span>
              <input type="range" min={0} max={10} step={1} value={missionForm.mooPreference}
                onChange={(e) => setF("mooPreference", Number(e.target.value))}
                className="fm-range-slider" style={{ width: "100%", marginTop: 6 }} />
            </div>

            <div className="fm-profile-field">
              <span className="fm-profile-label">CAPACIDADE DE CARGA (kg)</span>
              <input className="fm-profile-input" type="number" min={1}
                value={missionForm.maxCargoKg}
                onChange={(e) => setF("maxCargoKg", e.target.value)}
                placeholder="Ex: 600" />
            </div>

            {missionError && <p className="fm-profile-error">{missionError}</p>}
            {missionSaved && <p className="fm-profile-success">Missão salva com sucesso! 🛸</p>}

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 8 }}>
              {isCreating ? (
                <>
                  <button className="fm-btn fm-ghost fm-display" style={{ flex: 1, fontSize: 10 }}
                    onClick={() => handleSaveMission(false)} disabled={missionSaving}>
                    {missionSaving ? "..." : "SALVAR"}
                  </button>
                  <button className="fm-btn fm-cta fm-display" style={{ flex: 1, fontSize: 10 }}
                    onClick={() => handleSaveMission(true)} disabled={missionSaving}>
                    {missionSaving ? "..." : "SALVAR E ATIVAR"}
                  </button>
                </>
              ) : (
                <>
                  <button className="fm-btn fm-ghost fm-display" style={{ flex: 1, fontSize: 10 }}
                    onClick={() => handleSaveMission(false)} disabled={missionSaving}>
                    {missionSaving ? "..." : "SALVAR"}
                  </button>
                  <button className="fm-btn fm-cta fm-display" style={{ flex: 1, fontSize: 10 }}
                    onClick={() => handleSaveMission(true)} disabled={missionSaving}>
                    {missionSaving ? "..." : "ATIVAR"}
                  </button>
                  <button className="fm-btn fm-display" style={{ fontSize: 10, padding: "8px 12px", color: "var(--magenta)", border: "1px solid var(--magenta)", borderRadius: 10, background: "transparent", cursor: "pointer" }}
                    onClick={handleDeleteMission} disabled={missionSaving}>
                    🗑
                  </button>
                </>
              )}
              <button className="fm-btn fm-ghost fm-display" style={{ fontSize: 10, padding: "8px 12px" }}
                onClick={handleCancelMission} disabled={missionSaving}>✕</button>
            </div>
          </div>
        )}
      </div>

      <button className="fm-btn fm-display fm-btn-eject" onClick={() => signOut({ callbackUrl: "/" })}>
        EJETAR DA NAVE 🚀
      </button>
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function ProfileField({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="fm-profile-field">
      <span className="fm-profile-label">{label}</span>
      <span className="fm-profile-value">{value ?? "—"}</span>
    </div>
  );
}

function ProfileInput({ label, value, onChange, placeholder, maxLength }: {
  label: string; value: string; onChange: (v: string) => void;
  placeholder?: string; maxLength?: number;
}) {
  return (
    <div className="fm-profile-field">
      <span className="fm-profile-label">{label}</span>
      <input className="fm-profile-input" value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder} maxLength={maxLength} autoComplete="off" />
    </div>
  );
}

function ProfileSelect({ label, value, onChange, options }: {
  label: string; value: string; onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="fm-profile-field">
      <span className="fm-profile-label">{label}</span>
      <select className="fm-input" value={value}
        onChange={(e) => onChange(e.target.value)} style={{ cursor: "pointer" }}>
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}
