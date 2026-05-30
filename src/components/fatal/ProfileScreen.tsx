"use client";

import { useRef, useState } from "react";
import { signOut } from "next-auth/react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type UserData = {
  id: string;
  email?: string | null;
  name: string | null;
  image: string | null;
  callsign: string | null;
  homePlanet: string | null;
  shipModel: string | null;
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

  const initials = (display.callsign ?? display.name ?? "ET")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="fm-profile">
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
            />
            <ProfileInput
              label="CALLSIGN"
              value={form.callsign}
              onChange={(v) => setForm((f) => ({ ...f, callsign: v }))}
              placeholder="Ex: Capitão Mugido"
            />
            <ProfileInput
              label="PLANETA NATAL"
              value={form.homePlanet}
              onChange={(v) => setForm((f) => ({ ...f, homePlanet: v }))}
              placeholder="Ex: Zargon-7"
            />
            <ProfileInput
              label="MODELO DA NAVE"
              value={form.shipModel}
              onChange={(v) => setForm((f) => ({ ...f, shipModel: v }))}
              placeholder="Ex: Disco Mk IV"
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
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="fm-profile-field">
      <span className="fm-profile-label">{label}</span>
      <input
        className="fm-profile-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete="off"
      />
    </div>
  );
}
