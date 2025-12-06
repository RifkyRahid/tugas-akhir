"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

export default function FilterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Ambil parameter dari URL atau gunakan default
  const mode = searchParams.get("mode") || "bulanan"; // 'harian' | 'bulanan'
  const tanggal = searchParams.get("tanggal") || new Date().toISOString().split("T")[0];
  const bulan = searchParams.get("bulan") || (new Date().getMonth() + 1).toString();
  const tahun = searchParams.get("tahun") || new Date().getFullYear().toString();
  const nama = searchParams.get("nama") || "";

  // State lokal untuk input
  const [filterMode, setFilterMode] = useState(mode);
  const [selectedDate, setSelectedDate] = useState(tanggal);
  const [selectedMonth, setSelectedMonth] = useState(bulan);
  const [selectedYear, setSelectedYear] = useState(tahun);
  const [searchName, setSearchName] = useState(nama);

  // Fungsi untuk update URL
  const applyFilter = (newParams: any) => {
    const params = new URLSearchParams(searchParams.toString());
    
    // Update params sesuai input
    Object.keys(newParams).forEach(key => {
        params.set(key, newParams[key]);
    });

    // Reset pagination jika filter berubah
    // params.delete('page'); 

    router.push(`?${params.toString()}`);
  };

  // Navigasi Tanggal (Prev/Next Day)
  const changeDate = (days: number) => {
    const current = new Date(selectedDate);
    current.setDate(current.getDate() + days);
    const newDateStr = current.toISOString().split("T")[0];
    setSelectedDate(newDateStr);
    applyFilter({ tanggal: newDateStr, mode: 'harian' });
  };

  // Handler Ganti Mode
  const handleModeChange = (newMode: string) => {
    setFilterMode(newMode);
    applyFilter({ mode: newMode });
  };

  return (
    <div className="filter-container" style={{ marginBottom: "20px", background: "#f8f9fa", padding: "15px", borderRadius: "8px", border: "1px solid #e9ecef" }}>
      
      {/* 1. TAB MODE (Harian vs Bulanan) */}
      <div style={{ display: "flex", gap: "10px", marginBottom: "15px", borderBottom: "1px solid #ddd", paddingBottom: "10px" }}>
        <button
          onClick={() => handleModeChange("harian")}
          style={{
            padding: "8px 16px",
            border: "none",
            background: filterMode === "harian" ? "#0f172a" : "transparent",
            color: filterMode === "harian" ? "white" : "#666",
            borderRadius: "20px",
            fontWeight: "bold",
            cursor: "pointer",
            fontSize: "13px"
          }}
        >
          Harian
        </button>
        <button
          onClick={() => handleModeChange("bulanan")}
          style={{
            padding: "8px 16px",
            border: "none",
            background: filterMode === "bulanan" ? "#0f172a" : "transparent",
            color: filterMode === "bulanan" ? "white" : "#666",
            borderRadius: "20px",
            fontWeight: "bold",
            cursor: "pointer",
            fontSize: "13px"
          }}
        >
          Bulanan
        </button>
      </div>

      {/* 2. AREA FILTER */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "15px", alignItems: "center", justifyContent: "space-between" }}>
        
        {/* KIRI: Kontrol Tanggal / Bulan */}
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            
            {filterMode === "harian" ? (
                // MODE HARIAN (Prev - DatePicker - Next)
                <>
                    <button 
                        onClick={() => changeDate(-1)}
                        style={{ width: "30px", height: "30px", border: "1px solid #ccc", background: "white", borderRadius: "4px", cursor: "pointer" }}
                    >
                        ‹
                    </button>
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => {
                            setSelectedDate(e.target.value);
                            applyFilter({ tanggal: e.target.value, mode: 'harian' });
                        }}
                        style={{ padding: "6px 10px", borderRadius: "4px", border: "1px solid #ccc" }}
                    />
                    <button 
                        onClick={() => changeDate(1)}
                        style={{ width: "30px", height: "30px", border: "1px solid #ccc", background: "white", borderRadius: "4px", cursor: "pointer" }}
                    >
                        ›
                    </button>
                </>
            ) : (
                // MODE BULANAN (Select Bulan - Select Tahun)
                <>
                    <select
                        value={selectedMonth}
                        onChange={(e) => {
                            setSelectedMonth(e.target.value);
                            applyFilter({ bulan: e.target.value, mode: 'bulanan' });
                        }}
                        style={{ padding: "7px", borderRadius: "4px", border: "1px solid #ccc" }}
                    >
                        {Array.from({ length: 12 }, (_, i) => (
                            <option key={i + 1} value={i + 1}>
                                {new Date(0, i).toLocaleString("id-ID", { month: "long" })}
                            </option>
                        ))}
                    </select>
                    <select
                        value={selectedYear}
                        onChange={(e) => {
                            setSelectedYear(e.target.value);
                            applyFilter({ tahun: e.target.value, mode: 'bulanan' });
                        }}
                        style={{ padding: "7px", borderRadius: "4px", border: "1px solid #ccc" }}
                    >
                        {Array.from({ length: 5 }, (_, i) => {
                            const y = new Date().getFullYear() - 2 + i;
                            return <option key={y} value={y}>{y}</option>;
                        })}
                    </select>
                </>
            )}
        </div>

        {/* KANAN: Search Nama & Limit */}
        <div style={{ display: "flex", gap: "10px" }}>
            <input
                type="text"
                placeholder="Cari nama karyawan..."
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && applyFilter({ nama: searchName })}
                style={{ padding: "7px", borderRadius: "4px", border: "1px solid #ccc", width: "200px" }}
            />
            <button 
                onClick={() => applyFilter({ nama: searchName })}
                style={{ padding: "7px 15px", background: "#3b82f6", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}
            >
                Cari
            </button>
        </div>

      </div>
    </div>
  );
}