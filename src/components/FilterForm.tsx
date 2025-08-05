'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import React, { useState } from 'react';

export default function FilterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  const [nama, setNama] = useState(searchParams.get("nama") || "");
  const tahun = Number(searchParams.get("tahun")) || currentYear;
  const bulan = Number(searchParams.get("bulan")) || currentMonth;
  const limit = searchParams.get("limit") || "10";

  const handleChange = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams);
    params.set(key, value);
    if (key !== "nama") {
      router.push(`?${params.toString()}`);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams(searchParams);
    params.set("nama", nama);
    router.push(`?${params.toString()}`);
  };

  const tahunSekarang = new Date().getFullYear();
  const daftarTahun = Array.from({ length: 5 }, (_, i) => tahunSekarang - i);

  return (
    <form onSubmit={handleSubmit} style={{
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '1rem',
      marginBottom: '1rem'
    }}>
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <select name="bulan" defaultValue={bulan} style={dropdownStyle} onChange={(e) => handleChange("bulan", e.target.value)}>
          {[...Array(12)].map((_, i) => (
            <option key={i + 1} value={i + 1}>
              {new Date(0, i).toLocaleString("id-ID", { month: "long" })}
            </option>
          ))}
        </select>

        <select name="tahun" defaultValue={tahun} style={dropdownStyle} onChange={(e) => handleChange("tahun", e.target.value)}>
          {daftarTahun.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>

        <select name="limit" defaultValue={limit} style={dropdownStyle} onChange={(e) => handleChange("limit", e.target.value)}>
          <option value="10">10 data</option>
          <option value="25">25 data</option>
          <option value="50">50 data</option>
          <option value="100">100 data</option>
          <option value="semua">Semua</option>
        </select>
      </div>

      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <input
          type="text"
          name="nama"
          placeholder="Cari nama"
          value={nama}
          onChange={(e) => setNama(e.target.value)}
          style={inputNamaStyle}
        />
        <button type="submit" style={buttonStyle}>Terapkan</button>
      </div>
    </form>
  );
}

const dropdownStyle = {
  padding: '0.4rem 0.6rem',
  borderRadius: '6px',
  border: '1px solid #ccc',
};

const inputNamaStyle = {
  padding: '0.4rem 0.6rem',
  borderRadius: '6px',
  border: '1px solid #ccc',
  width: '160px',
};

const buttonStyle = {
  padding: '0.4rem 0.8rem',
  backgroundColor: '#3b82f6',
  color: 'white',
  border: 'none',
  borderRadius: '6px',
  cursor: 'pointer',
};
