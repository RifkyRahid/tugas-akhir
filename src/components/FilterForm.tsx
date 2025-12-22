"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

interface FilterFormProps {
    totalPages?: number;
    currentPage?: number;
    totalData?: number;
}

export default function FilterForm({ totalPages = 1, currentPage = 1, totalData = 0 }: FilterFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Ambil parameter dari URL
  const mode = searchParams.get("mode") || "bulanan"; 
  const tanggal = searchParams.get("tanggal") || new Date().toISOString().split("T")[0];
  const bulan = searchParams.get("bulan") || (new Date().getMonth() + 1).toString();
  const tahun = searchParams.get("tahun") || new Date().getFullYear().toString();
  const nama = searchParams.get("nama") || "";
  const limit = searchParams.get("limit") || "20";
  
  // Parameter Baru
  const areaId = searchParams.get("areaId") || "";
  const deptId = searchParams.get("deptId") || "";
  const status = searchParams.get("status") || "";

  // State Lokal
  const [filterMode, setFilterMode] = useState(mode);
  const [selectedDate, setSelectedDate] = useState(tanggal);
  const [selectedMonth, setSelectedMonth] = useState(bulan);
  const [selectedYear, setSelectedYear] = useState(tahun);
  const [searchName, setSearchName] = useState(nama);
  const [selectedLimit, setSelectedLimit] = useState(limit);
  
  // State Data Master (Untuk Dropdown)
  const [areas, setAreas] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);

  // Fetch Data Master saat komponen dimuat
  useEffect(() => {
    // Ambil Area
    fetch('/api/master/area-absensi')
        .then(res => res.json())
        .then(res => setAreas(res.data || []));

    // Ambil Departemen
    fetch('/api/master/departemen')
        .then(res => res.json())
        .then(res => setDepartments(res.data || []));
  }, []);

  // Fungsi update URL
  const applyFilter = (newParams: any) => {
    const params = new URLSearchParams(searchParams.toString());
    
    Object.keys(newParams).forEach(key => {
        if (newParams[key]) {
            params.set(key, newParams[key]);
        } else {
            params.delete(key); // Hapus param jika kosong (misal pilih "Semua")
        }
    });
    
    // Reset ke halaman 1 jika filter berubah
    if (!newParams.page) {
        params.set("page", "1");
    }

    router.push(`?${params.toString()}`);
  };

  const changeDate = (days: number) => {
    const current = new Date(selectedDate);
    current.setDate(current.getDate() + days);
    const newDateStr = current.toISOString().split("T")[0];
    setSelectedDate(newDateStr);
    applyFilter({ tanggal: newDateStr, mode: 'harian' });
  };

  const handleModeChange = (newMode: string) => {
    setFilterMode(newMode);
    applyFilter({ mode: newMode });
  };

  const handlePageChange = (newPage: number) => {
      if (newPage < 1 || newPage > totalPages) return;
      const params = new URLSearchParams(searchParams.toString());
      params.set("page", newPage.toString());
      router.push(`?${params.toString()}`);
  };

  return (
    <div style={{ marginBottom: "20px", background: "#f8f9fa", padding: "20px", borderRadius: "12px", border: "1px solid #e2e8f0" }}>
      
      {/* BARIS 1: MODE & SEARCH */}
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: "15px", marginBottom: "15px" }}>
          {/* Toggle Harian/Bulanan */}
          <div style={{ display: "flex", gap: "5px", background: '#e2e8f0', padding: '4px', borderRadius: '25px', height: 'fit-content' }}>
            <button onClick={() => handleModeChange("harian")} style={getTabStyle(filterMode === "harian")}>Harian</button>
            <button onClick={() => handleModeChange("bulanan")} style={getTabStyle(filterMode === "bulanan")}>Bulanan</button>
          </div>

          {/* Search Box */}
          <div style={{ display: "flex", alignItems: 'center' }}>
                <input 
                    type="text" 
                    placeholder="Cari nama karyawan..." 
                    value={searchName} 
                    onChange={(e) => setSearchName(e.target.value)} 
                    onKeyDown={(e) => e.key === 'Enter' && applyFilter({ nama: searchName })} 
                    style={styles.searchInput} 
                />
                <button onClick={() => applyFilter({ nama: searchName })} style={styles.searchBtn}>Cari</button>
          </div>
      </div>

      <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', marginBottom: '15px' }} />

      {/* BARIS 2: FILTER DROPDOWNS & DATE */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "15px", alignItems: "center" }}>
        
        {/* KONTROL TANGGAL */}
        <div style={{ minWidth: '280px' }}>
            {filterMode === "harian" ? (
                <div style={styles.dateControlWrapper}>
                    <button onClick={() => changeDate(-1)} style={{...styles.navBtn, borderRight: '1px solid #cbd5e1'}}>‹</button>
                    <input 
                        type="date" 
                        value={selectedDate} 
                        onChange={(e) => { 
                            setSelectedDate(e.target.value); 
                            applyFilter({ tanggal: e.target.value, mode: 'harian' }); 
                        }} 
                        style={styles.dateInput} 
                    />
                    <button onClick={() => changeDate(1)} style={{...styles.navBtn, borderLeft: '1px solid #cbd5e1'}}>›</button>
                </div>
            ) : (
                <div style={{display: 'flex', gap: '10px'}}>
                    <select 
                        value={selectedMonth} 
                        onChange={(e) => { setSelectedMonth(e.target.value); applyFilter({ bulan: e.target.value, mode: 'bulanan' }); }} 
                        style={styles.selectInput}
                    >
                        {Array.from({ length: 12 }, (_, i) => (
                            <option key={i + 1} value={i + 1}>{new Date(0, i).toLocaleString("id-ID", { month: "long" })}</option>
                        ))}
                    </select>
                    <select 
                        value={selectedYear} 
                        onChange={(e) => { setSelectedYear(e.target.value); applyFilter({ tahun: e.target.value, mode: 'bulanan' }); }} 
                        style={styles.selectInput}
                    >
                        {Array.from({ length: 5 }, (_, i) => { 
                            const y = new Date().getFullYear() - 2 + i; 
                            return <option key={y} value={y}>{y}</option>; 
                        })}
                    </select>
                </div>
            )}
        </div>

        {/* DROPDOWN FILTER TAMBAHAN */}
        <select 
            value={areaId} 
            onChange={(e) => applyFilter({ areaId: e.target.value })}
            style={styles.selectInput}
        >
            <option value="">Semua Area</option>
            {areas.map((area: any) => (
                <option key={area.id} value={area.id}>{area.name}</option>
            ))}
        </select>

        <select 
            value={deptId} 
            onChange={(e) => applyFilter({ deptId: e.target.value })}
            style={styles.selectInput}
        >
            <option value="">Semua Unit/Dept</option>
            {departments.map((dept: any) => (
                <option key={dept.id} value={dept.id}>{dept.name}</option>
            ))}
        </select>

        <select 
            value={status} 
            onChange={(e) => applyFilter({ status: e.target.value })}
            style={styles.selectInput}
        >
            <option value="">Semua Status</option>
            <option value="hadir">Hadir</option>
            <option value="sakit">Sakit</option>
            <option value="izin">Izin</option>
            <option value="cuti">Cuti</option>
            <option value="alpha">Alpha</option>
            <option value="terlambat">Terlambat (Hadir)</option>
        </select>

        {/* LIMIT & PAGINATION */}
        <div style={{ display: 'flex', gap: '10px', marginLeft: 'auto' }}>
            <select 
                value={selectedLimit} 
                onChange={(e) => { setSelectedLimit(e.target.value); applyFilter({ limit: e.target.value }); }}
                style={{...styles.selectInput, minWidth: '80px'}}
            >
                <option value="10">10 Baris</option>
                <option value="20">20 Baris</option>
                <option value="50">50 Baris</option>
                <option value="semua">Semua</option>
            </select>

            {selectedLimit !== "semua" && totalPages > 1 && (
                <div style={{display: 'flex', gap: '5px', alignItems: 'center', background: 'white', padding: '4px', borderRadius: '8px', border: '1px solid #cbd5e1', height: '40px'}}>
                    <button 
                        onClick={() => handlePageChange(currentPage - 1)} 
                        disabled={currentPage === 1}
                        style={{...styles.pageBtn, opacity: currentPage === 1 ? 0.5 : 1, cursor: currentPage === 1 ? 'not-allowed' : 'pointer'}}
                    >◀</button>
                    <span style={{fontSize: '13px', fontWeight: 'bold', minWidth: '60px', textAlign: 'center', color: '#334155'}}>
                        {currentPage} / {totalPages}
                    </span>
                    <button 
                        onClick={() => handlePageChange(currentPage + 1)} 
                        disabled={currentPage === totalPages}
                        style={{...styles.pageBtn, opacity: currentPage === totalPages ? 0.5 : 1, cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'}}
                    >▶</button>
                </div>
            )}
        </div>

      </div>
    </div>
  );
}

// --- STYLES HELPER ---
const getTabStyle = (isActive: boolean) => ({
    padding: "8px 24px",
    border: "none",
    background: isActive ? "white" : "transparent",
    color: isActive ? "#0f172a" : "#64748b",
    borderRadius: "20px",
    fontWeight: "bold" as const,
    cursor: "pointer",
    fontSize: "14px",
    boxShadow: isActive ? "0 2px 5px rgba(0,0,0,0.05)" : "none",
    transition: "all 0.2s"
});

const styles = {
    dateControlWrapper: { display: 'flex', alignItems: 'center', background: 'white', border: '1px solid #cbd5e1', borderRadius: '8px', overflow: 'hidden', height: '40px', width: '100%' },
    navBtn: { width: "40px", height: "100%", border: "none", background: "#f8fafc", cursor: "pointer", fontSize: '18px', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center' },
    dateInput: { flex: 1, padding: "0 10px", height: "100%", border: "none", outline: "none", fontFamily: 'inherit', color: '#334155', fontWeight: '500', cursor: 'pointer', textAlign: 'center' as const },
    selectInput: { padding: "8px 12px", borderRadius: "8px", border: "1px solid #cbd5e1", minWidth: '140px', height: '40px', background: 'white', fontSize: '14px' },
    searchInput: { padding: "0 15px", height: '40px', borderRadius: "8px 0 0 8px", border: "1px solid #cbd5e1", borderRight: 'none', width: "200px", outline: 'none' },
    searchBtn: { height: '40px', padding: "0 20px", background: "#3b82f6", color: "white", border: "1px solid #3b82f6", borderRadius: "0 8px 8px 0", cursor: "pointer", fontWeight: '600' },
    pageBtn: { padding: "0 12px", height: '30px', background: "#f1f5f9", border: "1px solid #e2e8f0", borderRadius: "6px", fontSize: "12px", fontWeight: "bold" as const, color: '#475569', display: 'flex', alignItems: 'center', justifyContent: 'center' }
};