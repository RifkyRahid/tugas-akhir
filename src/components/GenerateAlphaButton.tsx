"use client";

import { useState } from "react";
import "@/styles/absensi.css"

export default function GenerateAlphaButton() {
  const [loading, setLoading] = useState(false);
  const [notif, setNotif] = useState<string | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    setNotif(null);
    try {
      const res = await fetch("/api/admin/generate-alpha", {
        method: "POST",
      });
      const data = await res.json();

      if (res.ok) {
        setNotif(`✅ ${data.message} (${data.totalAlpha} karyawan)`);
      } else {
        setNotif(`❌ Gagal: ${data.error || "Terjadi kesalahan."}`);
      }
    } catch (err) {
      setNotif("❌ Gagal menghubungi server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ marginBottom: "16px" }}>
      <button
        onClick={handleGenerate}
        disabled={loading}
        className="generate-alpha-btn"
      >
        {loading ? "Memproses..." : "Generate Alpha Hari Ini"}
      </button>
      {notif && (
        <p style={{ marginTop: "10px", color: notif.startsWith("✅") ? "green" : "red" }}>
          {notif}
        </p>
      )}
    </div>
  );
}
