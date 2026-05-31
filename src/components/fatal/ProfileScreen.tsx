"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const SIGNOS = [
  "Touro Nebular", "Leite de Andrômeda", "Escorpião Cósmico", "Buraco Negro do Boi",
  "Cometa Lanoso", "Pulsar Bovino", "Galáxia Mugidora", "Supernova do Pasto",
  "Quasar Ruminante", "Buraco de Minhoca", "Matéria Escura da Vaca", "Luz do Capim",
];

type UserData = {
  id: string;
  email?: string | null;
  name: string | null;
  image: string | null;
  callsign: string | null;
  homePlanet: string | null;
  shipModel: string | null;
  towelStatus?: string | null;
  mooPreference?: number | null;
  maxCargoKg?: number | null;
  abductionStyle?: string | null;
  temperamento?: string | null;
  signoGalactico?: string | null;
  objetivoDaMissao?: string | null;
};

type DisplayValues = {
  name: string | null;
  callsign: string | null;
  homePlanet: string | null;
  shipModel: string | null;
};

export function ProfileScreen({ user }: { user: UserData }) {
  const [image, setImage] = useState(user.image);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const [display, setDisplay] = useState<DisplayValues>({
    name: user.name,
    callsign: user.callsign,
    homePlanet: user.homePlanet,
    shipModel: user.shipModel,
  });

  const [form, setForm] = useState({
    name: user.name ?? "",
    callsign: user.callsign ?? "",
    homePlanet: user.homePlanet ?? "",
    shipModel: user.shipModel ?? "",
  });

  const [mission, setMission] = useState({
    towelStatus: user.towelStatus ?? "",
    abductionStyle: user.abductionStyle ?? "",
    objetivoDaMissao: user.objetivoDaMissao ?? "",
    temperamento: user.temperamento ?? "",
    signoGalactico: user.signoGalactico ?? "",
    mooPreference: user.mooPreference ?? 5,
    maxCargoKg: user.maxCargoKg ?? "",
  });
  const [savingMission, setSavingMission] = useState(false);
  const [missionSaved, setMissionSaved] = useState(false);
  const [missionError, setMissionError] = useState<string | null>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadError(null);

    try {
      const fd = new FormData();
      fd.append("file", file);

      const uploadRes = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await uploadRes.json();
      if (!uploadRes.ok) {
        setUploadError(data.error ?? "Nave com defeito, tenta de novo 🛸");
        return;
      }
      setImage(data.url);
    } catch {
      setUploadError("Falha de comunicação intergaláctica. Tenta de novo 🛸");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const handleEdit = () => {
    setForm({
      name: display.name ?? "",
      callsign: display.callsign ?? "",
      homePlanet: display.homePlanet ?? "",
      shipModel: display.shipModel ?? "",
    });
    setSaveError(null);
    setEditing(true);
  };

  const handleCancel = () => {
    setEditing(false);
    setSaveError(null);
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveError(null);

    const payload: Record<string, string> = {};
    if (form.name.trim()) payload.name = form.name.trim();
    if (form.callsign.trim()) payload.callsign = form.callsign.trim();
    if (form.homePlanet.trim()) payload.homePlanet = form.homePlanet.trim();
    if (form.shipModel.trim()) payload.shipModel = form.shipModel.trim();

    if (Object.keys(payload).length === 0) {
      setSaveError("Preenche pelo menos um campo, capitão 👽");
      setSaving(false);
      return;
    }

    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) {
        setSaveError(data.error ?? "Nave com defeito, tenta de novo 🛸");
        return;
      }
      setDisplay({
        name: (data.user.name ?? form.name.trim()) || null,
        callsign: (data.user.callsign ?? form.callsign.trim()) || null,
        homePlanet: (data.user.homePlanet ?? form.homePlanet.trim()) || null,
        shipModel: (data.user.shipModel ?? form.shipModel.trim()) || null,
      });
      setSaved(true);
      setEditing(false);
      setTimeout(() => setSaved(false), 3000);
    } catch {
      setSaveError("Falha de comunicação intergaláctica. Tenta de novo 🛸");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveMission = async () => {
    setSavingMission(true);
    setMissionError(null);
    const payload: Record<string, unknown> = {};
    if (mission.towelStatus) payload.towelStatus = mission.towelStatus;
    else payload.towelStatus = null;
    if (mission.abductionStyle) payload.abductionStyle = mission.abductionStyle;
    if (mission.objetivoDaMissao) payload.objetivoDaMissao = mission.objetivoDaMissao;
    if (mission.temperamento) payload.temperamento = mission.temperamento;
    if (mission.signoGalactico) payload.signoGalactico = mission.signoGalactico;
    payload.mooPreference = mission.mooPreference;
    if (mission.maxCargoKg !== "") payload.maxCargoKg = Number(mission.maxCargoKg);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json();
        setMissionError(data.error ?? "Nave com defeito, tenta de novo 🛸");
        return;
      }
      setMissionSaved(true);
      setTimeout(() => setMissionSaved(false), 3000);
    } catch {
      setMissionError("Falha de comunicação intergaláctica. Tenta de novo 🛸");
    } finally {
      setSavingMission(false);
    }
  };

  const initials = (display.callsign ?? display.name ?? "ET")
    .slice(0, 2)
    .toUpperCase();

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

      <div className="fm-profile-avatar">
        <Avatar
          className="fm-avatar-xl"
          onClick={() => fileRef.current?.click()}
          style={{ cursor: "pointer" }}
        >
          <AvatarImage src={image ?? undefined} alt={display.callsign ?? "ET"} />
          <AvatarFallback className="fm-avatar-fallback">
            {initials}
          </AvatarFallback>
        </Avatar>

        <button
          className="fm-btn fm-ghost fm-display"
          style={{ fontSize: 11, padding: "8px 18px" }}
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? "TRANSMITINDO..." : "TROCAR FOTO"}
        </button>

        {uploadError && <p className="fm-profile-error">{uploadError}</p>}

        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileChange}
          style={{ display: "none" }}
        />
      </div>

      <div className="fm-profile-card">
        <div className="fm-profile-field">
          <span className="fm-profile-label">EMAIL — IMUTÁVEL COMO O COSMOS</span>
          <span className="fm-profile-value fm-profile-readonly">
            {user.email ?? "—"}
          </span>
        </div>
      </div>

      <div className="fm-profile-card">
        {editing ? (
          <>
            <ProfileInput
              label="NOME GALÁCTICO"
              value={form.name}
              onChange={(v) => setForm((f) => ({ ...f, name: v }))}
              placeholder="Ex: Zork das Estrelas"
              maxLength={60}
            />
            <ProfileInput
              label="CALLSIGN"
              value={form.callsign}
              onChange={(v) => setForm((f) => ({ ...f, callsign: v }))}
              placeholder="Ex: Capitão Mugido"
              maxLength={30}
            />
            <ProfileInput
              label="PLANETA NATAL"
              value={form.homePlanet}
              onChange={(v) => setForm((f) => ({ ...f, homePlanet: v }))}
              placeholder="Ex: Zargon-7"
              maxLength={50}
            />
            <ProfileInput
              label="MODELO DA NAVE"
              value={form.shipModel}
              onChange={(v) => setForm((f) => ({ ...f, shipModel: v }))}
              placeholder="Ex: Disco Mk IV"
              maxLength={50}
            />

            {saveError && <p className="fm-profile-error">{saveError}</p>}

            <div className="fm-profile-actions">
              <button
                className="fm-btn fm-ghost fm-display"
                style={{ flex: 1, fontSize: 11 }}
                onClick={handleCancel}
                disabled={saving}
              >
                CANCELAR
              </button>
              <button
                className="fm-btn fm-cta fm-display"
                style={{ flex: 1, fontSize: 11 }}
                onClick={handleSave}
                disabled={saving}
              >
                {saving ? "SALVANDO..." : "SALVAR DADOS"}
              </button>
            </div>
          </>
        ) : (
          <>
            <ProfileField label="NOME GALÁCTICO" value={display.name} />
            <ProfileField label="CALLSIGN" value={display.callsign} />
            <ProfileField label="PLANETA NATAL" value={display.homePlanet} />
            <ProfileField label="MODELO DA NAVE" value={display.shipModel} />

            {saved && (
              <p className="fm-profile-success">
                Transmissão recebida! Dados atualizados 🛸
              </p>
            )}

            <button
              className="fm-btn fm-ghost fm-display"
              style={{ width: "100%", fontSize: 11 }}
              onClick={handleEdit}
            >
              EDITAR PERFIL
            </button>
          </>
        )}
      </div>

      <div className="fm-profile-card">
        <span className="fm-profile-label" style={{ marginBottom: 12, display: "block" }}>
          ⚙️ CONFIGURAÇÕES DE MISSÃO
        </span>

        <ProfileSelect
          label="STATUS DA TOALHA"
          value={mission.towelStatus}
          onChange={(v) => setMission((m) => ({ ...m, towelStatus: v }))}
          options={[
            { value: "", label: "Não sei onde deixei 🤷" },
            { value: "mochila", label: "Na mochila intergaláctica 🎒" },
            { value: "capsula", label: "Na cápsula de escape 🚀" },
            { value: "cintura", label: "Pendurada na cintura 🪢" },
            { value: "perdida", label: "Perdi no último planeta 😱" },
          ]}
        />

        <ProfileSelect
          label="ESTILO DE ABDUÇÃO"
          value={mission.abductionStyle}
          onChange={(v) => setMission((m) => ({ ...m, abductionStyle: v }))}
          options={[
            { value: "", label: "— selecionar —" },
            { value: "stealth", label: "Stealth 🌑" },
            { value: "científico", label: "Científico 🔬" },
            { value: "flashy", label: "Flashy ✨" },
            { value: "casual", label: "Casual 😎" },
          ]}
        />

        <ProfileSelect
          label="OBJETIVO DA MISSÃO"
          value={mission.objetivoDaMissao}
          onChange={(v) => setMission((m) => ({ ...m, objetivoDaMissao: v }))}
          options={[
            { value: "", label: "— selecionar —" },
            { value: "pesquisa", label: "Pesquisa 🔭" },
            { value: "troféu", label: "Troféu 🏆" },
            { value: "companhia", label: "Companhia 🤝" },
            { value: "experimento", label: "Experimento 🧪" },
          ]}
        />

        <ProfileSelect
          label="TEMPERAMENTO ET"
          value={mission.temperamento}
          onChange={(v) => setMission((m) => ({ ...m, temperamento: v }))}
          options={[
            { value: "", label: "— selecionar —" },
            { value: "paciente", label: "Paciente 🧘" },
            { value: "agitado", label: "Agitado ⚡" },
            { value: "curioso", label: "Curioso 🔍" },
            { value: "dominante", label: "Dominante 👑" },
          ]}
        />

        <ProfileSelect
          label="SIGNO GALÁCTICO"
          value={mission.signoGalactico}
          onChange={(v) => setMission((m) => ({ ...m, signoGalactico: v }))}
          options={[
            { value: "", label: "— selecionar —" },
            ...SIGNOS.map((s) => ({ value: s, label: s })),
          ]}
        />

        <div className="fm-profile-field">
          <span className="fm-profile-label">PREFERÊNCIA DE MUGIDO: {mission.mooPreference}/10</span>
          <input
            type="range"
            min={0}
            max={10}
            step={1}
            value={mission.mooPreference}
            onChange={(e) => setMission((m) => ({ ...m, mooPreference: Number(e.target.value) }))}
            className="fm-range-slider"
            style={{ width: "100%", marginTop: 6 }}
          />
        </div>

        <div className="fm-profile-field">
          <span className="fm-profile-label">CAPACIDADE DE CARGA (kg)</span>
          <input
            className="fm-profile-input"
            type="number"
            min={1}
            value={mission.maxCargoKg}
            onChange={(e) => setMission((m) => ({ ...m, maxCargoKg: e.target.value }))}
            placeholder="Ex: 600"
          />
        </div>

        {missionError && <p className="fm-profile-error">{missionError}</p>}
        {missionSaved && (
          <p className="fm-profile-success">Configurações de missão salvas! 🛸</p>
        )}

        <button
          className="fm-btn fm-btn-cta fm-display"
          style={{ width: "100%", fontSize: 11, marginTop: 4 }}
          onClick={handleSaveMission}
          disabled={savingMission}
        >
          {savingMission ? "SALVANDO..." : "SALVAR CONFIGURAÇÕES"}
        </button>
      </div>

      <button
        className="fm-btn fm-display fm-btn-eject"
        onClick={() => signOut({ callbackUrl: "/" })}
      >
        EJETAR DA NAVE 🚀
      </button>
    </div>
  );
}

function ProfileField({
  label,
  value,
}: {
  label: string;
  value: string | null;
}) {
  return (
    <div className="fm-profile-field">
      <span className="fm-profile-label">{label}</span>
      <span className="fm-profile-value">{value ?? "—"}</span>
    </div>
  );
}

function ProfileInput({
  label,
  value,
  onChange,
  placeholder,
  maxLength,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  maxLength?: number;
}) {
  return (
    <div className="fm-profile-field">
      <span className="fm-profile-label">{label}</span>
      <input
        className="fm-profile-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        maxLength={maxLength}
        autoComplete="off"
      />
    </div>
  );
}

function ProfileSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="fm-profile-field">
      <span className="fm-profile-label">{label}</span>
      <select
        className="fm-profile-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
}
