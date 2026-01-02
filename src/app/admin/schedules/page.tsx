"use client";

import { useState, useEffect, useMemo } from "react";
import Swal from "sweetalert2";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";
import "@/styles/admindashboard.css";

// --- Interfaces ---
interface User {
  id: string;
  name: string;
  jabatan?: {
    department?: {
      name: string;
    };
  };
}

interface Shift {
  id: number;
  name: string;
  startTime: string;
  endTime: string;
}

interface GroupedSchedule {
  startDate: string;
  endDate: string;
  shiftName: string;
  shiftTime: string;
  shiftId: number;
  count: number;
}

export default function SchedulePage() {
  // --- State Data Master ---
  const [users, setUsers] = useState<User[]>([]);
  const [shifts, setShifts] = useState<Shift[]>([]);
  
  // --- State Filter & Form ---
  const [loading, setLoading] = useState(false);
  
  // Filter Departemen (NEW)
  const [selectedDept, setSelectedDept] = useState(""); 
  
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedShift, setSelectedShift] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  // --- State Pilihan Hari ---
  const [selectedDays, setSelectedDays] = useState<number[]>([1, 2, 3, 4, 5]);

  // --- State Riwayat Jadwal ---
  const [userSchedules, setUserSchedules] = useState<GroupedSchedule[]>([]);

  // --- Helper: Mapping Hari ---
  const daysMap = [
    { id: 1, label: "Sen" },
    { id: 2, label: "Sel" },
    { id: 3, label: "Rab" },
    { id: 4, label: "Kam" },
    { id: 5, label: "Jum" },
    { id: 6, label: "Sab" },
    { id: 0, label: "Min" },
  ];

  const handleDayChange = (dayIndex: number) => {
    if (selectedDays.includes(dayIndex)) {
        setSelectedDays(selectedDays.filter(d => d !== dayIndex));
    } else {
        setSelectedDays([...selectedDays, dayIndex]);
    }
  };

  // 1. Load Data Master
  useEffect(() => {
    const fetchData = async () => {
        try {
            const [resUsers, resShifts] = await Promise.all([
                fetch("/api/admin/karyawan").then(r => r.json()),
                fetch("/api/admin/shifts").then(r => r.json())
            ]);
            
            const userList = Array.isArray(resUsers) ? resUsers : (resUsers.data || []);
            setUsers(userList);
            setShifts(Array.isArray(resShifts) ? resShifts : []);
        } catch (err) {
            console.error("Gagal load data master:", err);
            Swal.fire("Error", "Gagal memuat data karyawan/shift", "error");
        }
    };
    fetchData();
  }, []);

  // 2. LOGIKA FILTER DEPARTMENT (NEW)
  // Ambil list unik departemen dari data users yang sudah di-fetch
  const departments = useMemo(() => {
    const depts = users
      .map(u => u.jabatan?.department?.name)
      .filter((name): name is string => !!name); // Filter null/undefined
    return Array.from(new Set(depts)).sort(); // Unique & Sort
  }, [users]);

  // Filter list user berdasarkan departemen yang dipilih
  const filteredUsers = useMemo(() => {
    if (!selectedDept) return users;
    return users.filter(u => u.jabatan?.department?.name === selectedDept);
  }, [users, selectedDept]);

  // Reset pilihan user jika departemen berubah (Supaya tidak membingungkan)
  const handleDeptChange = (dept: string) => {
    setSelectedDept(dept);
    setSelectedUser(""); // Reset user saat ganti departemen
  };


  // 3. Load History Jadwal
  const fetchUserSchedules = async (userId: string) => {
    try {
        const res = await fetch(`/api/admin/schedules?userId=${userId}`);
        const data = await res.json();
        if (Array.isArray(data)) {
            setUserSchedules(data);
        } else {
            setUserSchedules([]);
        }
    } catch (err) {
        console.error(err);
    }
  };

  useEffect(() => {
    if (selectedUser) {
        fetchUserSchedules(selectedUser);
    } else {
        setUserSchedules([]);
    }
  }, [selectedUser]);

  // 4. Handler Simpan
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedUser || !selectedShift || !startDate || !endDate) {
        Swal.fire("Peringatan", "Mohon lengkapi semua form", "warning");
        return;
    }
    if (new Date(startDate) > new Date(endDate)) {
        Swal.fire("Error", "Tanggal Mulai tidak boleh lebih besar dari Tanggal Akhir", "error");
        return;
    }
    if (selectedDays.length === 0) {
        Swal.fire("Peringatan", "Pilih minimal satu hari kerja", "warning");
        return;
    }

    setLoading(true);
    try {
        const res = await fetch("/api/admin/schedules", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                userId: selectedUser,
                shiftId: selectedShift,
                startDate,
                endDate,
                selectedDays
            })
        });

        const json = await res.json();
        if (res.ok) {
            Swal.fire("Sukses", json.message, "success");
            fetchUserSchedules(selectedUser);
        } else {
            throw new Error(json.error);
        }
    } catch (err: any) {
        Swal.fire("Gagal", err.message, "error");
    } finally {
        setLoading(false);
    }
  };

  // 5. Handler Hapus
  const handleDelete = async (group: GroupedSchedule) => {
    const confirm = await Swal.fire({
        title: "Hapus Jadwal?",
        text: `Anda akan menghapus jadwal shift "${group.shiftName}" dari tanggal ${format(new Date(group.startDate), "dd MMM")} s/d ${format(new Date(group.endDate), "dd MMM")}.`,
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#3085d6",
        confirmButtonText: "Ya, Hapus!",
    });

    if (!confirm.isConfirmed) return;

    setLoading(true);
    try {
        const res = await fetch("/api/admin/schedules", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                userId: selectedUser,
                startDate: group.startDate,
                endDate: group.endDate
            })
        });

        const json = await res.json();
        if (res.ok) {
            Swal.fire("Terhapus", json.message, "success");
            fetchUserSchedules(selectedUser);
        } else {
            throw new Error(json.error);
        }
    } catch (err: any) {
        Swal.fire("Gagal", err.message, "error");
    } finally {
        setLoading(false);
    }
  };

  // 6. Handler Edit
  const handleEdit = (group: GroupedSchedule) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setSelectedShift(group.shiftId.toString());
    setStartDate(new Date(group.startDate).toISOString().split('T')[0]);
    setEndDate(new Date(group.endDate).toISOString().split('T')[0]);
    setSelectedDays([0, 1, 2, 3, 4, 5, 6]);

    Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'info',
        title: 'Form terisi. Silakan ubah dan simpan.',
        showConfirmButton: false,
        timer: 3000
    });
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-card header">
        <h1 style={{ margin: 0, fontSize: '1.5rem', color: '#1e293b' }}>📅 Atur Jadwal Karyawan</h1>
        <p style={{ color: '#64748b', margin: '5px 0 0 0' }}>
            Tetapkan shift kerja (Roster) untuk rentang tanggal tertentu.
        </p>
      </div>

      <div className="dashboard-split">
        {/* === KOLOM KIRI: FORM INPUT === */}
        <div className="dashboard-card" style={{ height: 'fit-content' }}>
            <h3 style={{ marginTop: 0, marginBottom: '20px', borderBottom: '1px solid #e2e8f0', paddingBottom: '10px' }}>
                Buat / Edit Jadwal
            </h3>
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                
                {/* --- FILTER DEPARTEMEN (BARU) --- */}
                <div style={{ background: '#eff6ff', padding: '10px', borderRadius: '8px', border: '1px solid #dbeafe' }}>
                    <label style={{ fontWeight: '600', display: 'block', marginBottom: '5px', fontSize: '13px', color:'#1e40af' }}>
                        📂 Filter Unit Bisnis / Departemen
                    </label>
                    <select 
                        className="form-input"
                        value={selectedDept} 
                        onChange={(e) => handleDeptChange(e.target.value)}
                        style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #93c5fd', background: 'white' }}
                    >
                        <option value="">-- Tampilkan Semua --</option>
                        {departments.map((dept, idx) => (
                            <option key={idx} value={dept}>
                                {dept}
                            </option>
                        ))}
                    </select>
                </div>

                {/* Input User (Sekarang pakai filteredUsers) */}
                <div>
                    <label style={{ fontWeight: '600', display: 'block', marginBottom: '5px', fontSize: '14px' }}>
                        Pilih Karyawan {selectedDept && <span style={{fontSize:'12px', fontWeight:'normal'}}>(Unit: {selectedDept})</span>}
                    </label>
                    <select 
                        className="form-input"
                        value={selectedUser} 
                        onChange={(e) => setSelectedUser(e.target.value)}
                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc' }}
                    >
                        <option value="">
                            {filteredUsers.length === 0 ? "-- Tidak ada karyawan di unit ini --" : "-- Cari Nama Karyawan --"}
                        </option>
                        {filteredUsers.map((u) => {
                            const deptName = u.jabatan?.department?.name || 'Tanpa Divisi';
                            return (
                                <option key={u.id} value={u.id}>
                                    {u.name} — {deptName}
                                </option>
                            );
                        })}
                    </select>
                </div>

                {/* Range Tanggal */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                    <div>
                        <label style={{ fontWeight: '600', display: 'block', marginBottom: '5px', fontSize: '14px' }}>
                            Dari Tanggal
                        </label>
                        <input 
                            type="date" 
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                        />
                    </div>
                    <div>
                        <label style={{ fontWeight: '600', display: 'block', marginBottom: '5px', fontSize: '14px' }}>
                            Sampai Tanggal
                        </label>
                        <input 
                            type="date" 
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }}
                        />
                    </div>
                </div>

                {/* Filter Hari */}
                <div>
                    <label style={{ fontWeight: '600', marginBottom: '8px', display:'block', fontSize:'14px' }}>
                        Terapkan Pada Hari
                    </label>
                    <div style={{ display: 'flex', gap: '8px', flexWrap:'wrap' }}>
                        {daysMap.map((day) => (
                            <div 
                                key={day.id} 
                                onClick={() => handleDayChange(day.id)}
                                style={{
                                    padding: '8px 12px',
                                    borderRadius: '6px',
                                    border: selectedDays.includes(day.id) ? '1px solid #3b82f6' : '1px solid #cbd5e1',
                                    background: selectedDays.includes(day.id) ? '#eff6ff' : 'white',
                                    color: selectedDays.includes(day.id) ? '#3b82f6' : '#64748b',
                                    cursor: 'pointer',
                                    fontSize: '13px',
                                    fontWeight: '600',
                                    transition: 'all 0.2s',
                                    userSelect: 'none'
                                }}
                            >
                                {day.label}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Pilih Shift */}
                <div>
                    <label style={{ fontWeight: '600', display: 'block', marginBottom: '5px', fontSize: '14px' }}>
                        Pilih Shift Kerja
                    </label>
                    <select 
                        className="form-input"
                        value={selectedShift} 
                        onChange={(e) => setSelectedShift(e.target.value)}
                        style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc' }}
                    >
                        <option value="">-- Pilih Jenis Shift --</option>
                        {shifts.map((s) => (
                            <option key={s.id} value={s.id}>
                                {s.name} ({s.startTime} - {s.endTime})
                            </option>
                        ))}
                    </select>
                </div>

                <button 
                    type="submit" 
                    disabled={loading}
                    style={{
                        marginTop: '15px',
                        background: loading ? '#94a3b8' : '#3b82f6',
                        color: 'white', 
                        padding: '12px', 
                        border: 'none', 
                        borderRadius: '8px', 
                        fontWeight: 'bold', 
                        cursor: loading ? 'not-allowed' : 'pointer',
                        transition: 'background 0.2s'
                    }}
                >
                    {loading ? "Menyimpan..." : "Simpan Jadwal"}
                </button>
            </form>
        </div>

        {/* === KOLOM KANAN: TABEL RIWAYAT === */}
        <div className="dashboard-card" style={{ display: 'flex', flexDirection: 'column', maxHeight: '500px' }}>
            <h3 style={{ marginTop: 0, marginBottom: '15px' }}>Riwayat Jadwal</h3>
            
            {!selectedUser ? (
                <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontStyle: 'italic', flexDirection: 'column', gap: '10px' }}>
                    <span style={{ fontSize: '30px' }}>👈</span>
                    <p>Pilih karyawan di sebelah kiri untuk melihat jadwal.</p>
                </div>
            ) : userSchedules.length === 0 ? (
                <div style={{ padding: '20px', textAlign: 'center', color: '#64748b', background: '#f8fafc', borderRadius: '8px' }}>
                    Belum ada jadwal yang diatur untuk user ini.
                </div>
            ) : (
                <div style={{ flex: 1, overflowY: 'auto', paddingRight: '5px' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                        <thead style={{ position: 'sticky', top: 0, zIndex: 10 }}>
                            <tr style={{ background: '#f1f5f9', textAlign: 'left', borderBottom: '2px solid #e2e8f0' }}>
                                <th style={{ padding: '12px', color: '#475569' }}>Periode Tanggal</th>
                                <th style={{ padding: '12px', color: '#475569' }}>Shift</th>
                                <th style={{ padding: '12px', textAlign: 'center', color: '#475569' }}>Durasi</th>
                                <th style={{ padding: '12px', textAlign: 'center', color: '#475569' }}>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {userSchedules.map((group, index) => (
                                <tr key={index} style={{ borderBottom: '1px solid #e2e8f0', background: 'white' }}>
                                    <td style={{ padding: '15px 12px' }}>
                                        <div style={{ fontWeight: '600', color: '#334155', display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            {format(new Date(group.startDate), "dd MMM", { locale: idLocale })}
                                            <span style={{ color: '#94a3b8', fontSize: '10px' }}>➜</span>
                                            {format(new Date(group.endDate), "dd MMM yyyy", { locale: idLocale })}
                                        </div>
                                    </td>
                                    <td style={{ padding: '15px 12px' }}>
                                        <div style={{ fontWeight: 'bold', color: '#0f172a' }}>{group.shiftName}</div>
                                        <div style={{ fontSize: '11px', color: '#64748b' }}>{group.shiftTime}</div>
                                    </td>
                                    <td style={{ padding: '15px 12px', textAlign: 'center' }}>
                                        <span style={{background: '#dbeafe', color: '#1e40af', padding: '2px 8px', borderRadius: '10px', fontSize:'11px', fontWeight:'bold'}}>
                                            {group.count} Hari
                                        </span>
                                    </td>
                                    <td style={{ padding: '15px 12px', textAlign: 'center' }}>
                                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                                            <button 
                                                onClick={() => handleEdit(group)}
                                                style={{ border:'1px solid #cbd5e1', background:'white', color:'#334155', borderRadius:'4px', padding:'4px 8px', cursor:'pointer', fontSize:'11px' }}
                                                title="Edit"
                                            >
                                                ✏️
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(group)}
                                                style={{ border:'1px solid #fca5a5', background:'#fef2f2', color:'#ef4444', borderRadius:'4px', padding:'4px 8px', cursor:'pointer', fontSize:'11px' }}
                                                title="Hapus"
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
      </div>
    </div>
  );
}