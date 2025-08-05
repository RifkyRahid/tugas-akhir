"use client";

export const dynamic = "force-dynamic";

import React, { useState, useEffect } from "react";
import nextDynamic from "next/dynamic";
import { LatLngExpression } from "leaflet";
import "@/styles/areaabsensi.css";

// ⬇️ Load LeafletMap hanya di client
const LeafletMap = nextDynamic(() => import("@/components/LeafletMap"), {
  ssr: false,
});

export default function AreaAbsensiPage() {
  const [location, setLocation] = useState<LatLngExpression | null>(null);
  const [radius, setRadius] = useState<number>(100);
  const [name, setName] = useState<string>("");

  useEffect(() => {
    async function fetchArea() {
      try {
        const res = await fetch("/api/master/area-absensi");
        const data = await res.json();
        if (res.ok && data?.data) {
          const { latitude, longitude, radius, name } = data.data;
          setLocation([latitude, longitude]);
          setRadius(radius);
          setName(name);
        }
      } catch (err) {
        console.error("Gagal mengambil data area", err);
      }
    }

    fetchArea();
  }, []);

  async function handleSave() {
    try {
      if (!location) {
        alert("Tentukan lokasi terlebih dahulu");
        return;
      }

      const payload = {
        name,
        latitude: Array.isArray(location) ? location[0] : 0,
        longitude: Array.isArray(location) ? location[1] : 0,
        radius,
      };

      const res = await fetch("/api/master/area-absensi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        alert("Area berhasil disimpan");
      } else {
        const data = await res.json();
        alert("Gagal menyimpan: " + data.error);
      }
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan");
    }
  }

  return (
    <div className="area-absensi-container">
      <h1 className="page-title">Pengaturan Area Absensi</h1>

      <div className="form-section">
        <div className="form-group">
          <label>Latitude</label>
          <input
            type="number"
            value={Array.isArray(location) ? location[0] : ""}
            onChange={(e) =>
              setLocation([
                parseFloat(e.target.value),
                Array.isArray(location) ? location[1] : 0,
              ])
            }
          />
        </div>

        <div className="form-group">
          <label>Longitude</label>
          <input
            type="number"
            value={Array.isArray(location) ? location[1] : ""}
            onChange={(e) =>
              setLocation([
                Array.isArray(location) ? location[0] : 0,
                parseFloat(e.target.value),
              ])
            }
          />
        </div>

        <div className="form-group">
          <label>Radius (Meter)</label>
          <input
            type="number"
            value={radius}
            onChange={(e) => setRadius(parseInt(e.target.value))}
          />
        </div>

        <div className="form-group">
          <label>Nama Spot</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <button className="save-button" onClick={handleSave}>Simpan</button>
      </div>

      <div className="map-section">
        {location && (
          <LeafletMap
            location={location}
            radius={radius}
            setLocation={setLocation}
          />
        )}
      </div>
    </div>
  );
}
