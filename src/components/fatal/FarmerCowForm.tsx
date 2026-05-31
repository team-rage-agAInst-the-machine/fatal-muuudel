"use client";

import { useRef, useState } from "react";

const EMPTY_FORM = {
  id: "",
  name: "",
  breed: "",
  age: 3,
  farm: "",
  weightKg: 400,
  milkPct: 80,
  mooLevel: 5,
  distance: "",
  hue: 180,
  tags: "",
  bio: "",
  isHuman: false,
};

export function FarmerCowForm() {
  const [form, setForm] = useState(EMPTY_FORM);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const set = <K extends keyof typeof EMPTY_FORM>(key: K, value: (typeof EMPTY_FORM)[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    setError(null);
    setUploading(true);

    try {
      let photoUrl: string | null = null;

      if (photoFile) {
        const fd = new FormData();
        fd.append("file", photoFile);
        const uploadRes = await fetch("/api/farmer/upload-cow-photo", { method: "POST", body: fd });
        const uploadData = await uploadRes.json();
        if (!uploadRes.ok) {
          setError(uploadData.error ?? "Falha no upload da foto 🛸");
          return;
        }
        photoUrl = uploadData.url;
      }

      const tags = form.tags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const res = await fetch("/api/farmer/cows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, tags, photoUrl }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "Erro ao cadastrar vaca 🐄");
        return;
      }

      setSuccess(true);
      setForm(EMPTY_FORM);
      setPhotoFile(null);
      if (photoPreview) URL.revokeObjectURL(photoPreview);
      setPhotoPreview(null);
      if (fileRef.current) fileRef.current.value = "";
      setTimeout(() => setSuccess(false), 4000);
    } catch {
      setError("Falha de comunicação intergaláctica. Tenta de novo 🛸");
    } finally {
      setUploading(false);
    }
  };

  const photoBg = photoPreview
    ? undefined
    : { background: `oklch(0.45 0.12 ${form.hue})` };

  return (
    <div className="fm-admin">
      {/* Foto */}
      <div className="fm-profile-card">
        <span className="fm-profile-label">FOTO DA VACA</span>
        <div
          className="fm-admin-photo-drop"
          style={photoBg}
          onClick={() => fileRef.current?.click()}
        >
          {photoPreview ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={photoPreview} alt="Preview" />
          ) : (
            <span className="fm-admin-photo-label">CLIQUE PARA SELECIONAR</span>
          )}
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handlePhotoSelect}
          style={{ display: "none" }}
        />
      </div>

      {/* Identificação */}
      <div className="fm-profile-card">
        <Field label="SLUG / ID" hint="ex: mimosa-2 (só minúsculas, números e hífens)">
          <input
            className="fm-profile-input"
            value={form.id}
            onChange={(e) => set("id", e.target.value.toLowerCase())}
            placeholder="mimosa-2"
            maxLength={60}
            autoComplete="off"
          />
        </Field>
        <Field label="NOME">
          <input
            className="fm-profile-input"
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            placeholder="Mimosa"
            maxLength={100}
            autoComplete="off"
          />
        </Field>
        <Field label="RAÇA">
          <input
            className="fm-profile-input"
            value={form.breed}
            onChange={(e) => set("breed", e.target.value)}
            placeholder="Girolando"
            maxLength={100}
            autoComplete="off"
          />
        </Field>
        <Field label="FAZENDA">
          <input
            className="fm-profile-input"
            value={form.farm}
            onChange={(e) => set("farm", e.target.value)}
            placeholder="Fazenda Boa Vista"
            maxLength={100}
            autoComplete="off"
          />
        </Field>
        <Field label="DISTÂNCIA">
          <input
            className="fm-profile-input"
            value={form.distance}
            onChange={(e) => set("distance", e.target.value)}
            placeholder="2,3 anos-luz"
            maxLength={60}
            autoComplete="off"
          />
        </Field>
      </div>

      {/* Dados biométricos */}
      <div className="fm-profile-card">
        <Field label={`IDADE — ${form.age} anos`}>
          <input
            className="fm-profile-input"
            type="number"
            min={0}
            max={30}
            value={form.age}
            onChange={(e) => set("age", Number(e.target.value))}
          />
        </Field>
        <Field label={`PESO — ${form.weightKg} kg`}>
          <input
            className="fm-profile-input"
            type="number"
            min={1}
            value={form.weightKg}
            onChange={(e) => set("weightKg", Number(e.target.value))}
          />
        </Field>
        <Field label={`PRODUÇÃO LEITEIRA — ${form.milkPct}%`}>
          <input
            className="fm-range-slider"
            type="range"
            min={0}
            max={100}
            value={form.milkPct}
            onChange={(e) => set("milkPct", Number(e.target.value))}
          />
        </Field>
        <Field label={`NÍVEL DE MUGIDO — ${form.mooLevel}/10`}>
          <input
            className="fm-range-slider"
            type="range"
            min={0}
            max={10}
            value={form.mooLevel}
            onChange={(e) => set("mooLevel", Number(e.target.value))}
          />
        </Field>
        <Field label={`MATIZ DA COR — ${form.hue}°`}>
          <input
            className="fm-range-slider"
            type="range"
            min={0}
            max={360}
            value={form.hue}
            onChange={(e) => set("hue", Number(e.target.value))}
          />
        </Field>
      </div>

      {/* Perfil */}
      <div className="fm-profile-card">
        <Field label="TAGS (separadas por vírgula)">
          <input
            className="fm-profile-input"
            value={form.tags}
            onChange={(e) => set("tags", e.target.value)}
            placeholder="gordinha, leiteira, dócil"
            maxLength={200}
            autoComplete="off"
          />
        </Field>
        <Field label="BIO">
          <textarea
            className="fm-profile-input"
            value={form.bio}
            onChange={(e) => set("bio", e.target.value)}
            placeholder="Topo abdução de primeira, mas só se rolar sal mineral no after. 🐄✨"
            maxLength={500}
            rows={4}
            style={{ resize: "vertical" }}
          />
        </Field>
        <div className="fm-admin-checkbox-row">
          <input
            id="isHuman"
            type="checkbox"
            checked={form.isHuman}
            onChange={(e) => set("isHuman", e.target.checked)}
            style={{ width: 20, height: 20, accentColor: "var(--magenta)", cursor: "pointer" }}
          />
          <label htmlFor="isHuman" className="fm-profile-label" style={{ cursor: "pointer" }}>
            É HUMANO DISFARÇADO?
          </label>
        </div>
      </div>

      {error && <p className="fm-profile-error">{error}</p>}
      {success && <p className="fm-profile-success">Vaca cadastrada com sucesso! 🐄🛸</p>}

      <button
        className="fm-btn fm-cta fm-display"
        onClick={handleSubmit}
        disabled={uploading}
        style={{ fontSize: 12 }}
      >
        {uploading ? "TRANSMITINDO..." : "CADASTRAR VACA 🐄"}
      </button>
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="fm-profile-field">
      <span className="fm-profile-label">{label}</span>
      {hint && (
        <span className="fm-profile-label" style={{ opacity: 0.5, fontSize: 9 }}>
          {hint}
        </span>
      )}
      {children}
    </div>
  );
}
