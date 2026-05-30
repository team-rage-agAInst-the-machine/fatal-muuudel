"use client";

import { useRef, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type UserData = {
  id: string;
  name: string | null;
  image: string | null;
  callsign: string | null;
  homePlanet: string | null;
  shipModel: string | null;
};

export function ProfileScreen({ user }: { user: UserData }) {
  const [image, setImage] = useState(user.image);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      const fd = new FormData();
      fd.append("file", file);

      const uploadRes = await fetch("/api/upload", { method: "POST", body: fd });
      if (!uploadRes.ok) {
        const err = await uploadRes.json();
        setError(err.error ?? "Nave com defeito, tenta de novo 🛸");
        return;
      }

      const { url } = await uploadRes.json();
      setImage(url);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  const initials = (user.callsign ?? user.name ?? "ET")
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
          <AvatarImage src={image ?? undefined} alt={user.callsign ?? "ET"} />
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

        {error && <p className="fm-profile-error">{error}</p>}

        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileChange}
          style={{ display: "none" }}
        />
      </div>

      <div className="fm-profile-card">
        <ProfileField label="CALLSIGN" value={user.callsign} />
        <ProfileField label="PLANETA NATAL" value={user.homePlanet} />
        <ProfileField label="MODELO DA NAVE" value={user.shipModel} />
      </div>
    </div>
  );
}

function ProfileField({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="fm-profile-field">
      <span className="fm-profile-label">{label}</span>
      <span className="fm-profile-value">{value ?? "—"}</span>
    </div>
  );
}
