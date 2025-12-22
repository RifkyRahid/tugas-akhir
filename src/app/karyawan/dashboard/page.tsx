"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Navbar from "@/components/Sidebar";
import KaryawanLayout from "@/components/KaryawanLayout";
import "../../../styles/dashboard.css";

interface UserData {
  name: string;
  role: string;
  positionTitle: string;
  department: string;
  attendanceToday: {
      statusLabel: string;
      jamMasuk: string;
      jamPulang: string;
  };
  leaveBalance: {
      quota: number;
      used: number;
      remaining: number;
  };
  // FIELD BARU: AGENDA
  upcomingEvents: {
      id: string;
      title: string;
      date: string;
      type: string;
      description: string;
  }[];
}

const getInitials = (name: string) => {
  return name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
};

const getStatusColor = (status: string) => {
    switch (status) {
        case "Sudah Masuk": return "#3b82f6";
        case "Sudah Pulang": return "#22c55e";
        case "Menunggu Approval": return "#f59e0b";
        case "Belum Absen": return "#64748b";
        default: return "#ef4444";
    }
};

// Helper Format Tanggal (Contoh: "18 Jan")
const formatDateShort = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
};

// Helper Warna Icon Event
const getEventIconColor = (type: string) => {
    if (type === 'BIRTHDAY') return '#ef4444'; // Merah
    if (type === 'HOLIDAY') return '#22c55e'; // Hijau
    if (type === 'MEETING') return '#3b82f6'; // Biru
    return '#f59e0b'; // Orange
}

export default function KaryawanDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/user/me", { credentials: "include" });
        if (!res.ok) { router.push("/"); return; }
        const data = await res.json();
        if (data.role !== "karyawan") { router.push("/"); return; }
        setUser(data);
      } catch (error) {
        router.push("/");
      }
    };
    fetchUser();
  }, [router]);

  return (
    <>
      <Navbar role={"karyawan"} />
      <KaryawanLayout>
        <div className="dashboard-container">
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', width: '100%' }}>
            
            {/* 1. KARTU PROFIL */}
            <div className="dashboard-card" style={{ 
                background: 'linear-gradient(135deg, #ffffff 0%, #f0f9ff 100%)',
                display: 'flex', alignItems: 'center', gap: '20px',
                borderLeft: '5px solid #0284c7' 
            }}>
                {user ? (
                    <>
                        <div style={{
                            minWidth: '70px', height: '70px', borderRadius: '50%',
                            backgroundColor: '#0369a1', color: 'white', display: 'flex',
                            justifyContent: 'center', alignItems: 'center', fontSize: '28px',
                            fontWeight: 'bold', boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                        }}>
                            {getInitials(user.name)}
                        </div>
                        <div>
                            <h2 style={{ margin: '0 0 5px 0', fontSize: '20px', color: '#1e293b' }}>
                                Halo, {user.name.split(" ")[0]}! 👋
                            </h2>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                <span style={{ fontSize: '12px', padding: '4px 10px', borderRadius: '15px', background: '#e0f2fe', color: '#0369a1', fontWeight: 'bold', border: '1px solid #bae6fd' }}>
                                    {user.positionTitle}
                                </span>
                                <span style={{ fontSize: '12px', padding: '4px 10px', borderRadius: '15px', background: '#f1f5f9', color: '#475569', fontWeight: '600', border: '1px solid #e2e8f0' }}>
                                    {user.department}
                                </span>
                            </div>
                        </div>
                    </>
                ) : <p>Memuat...</p>}
            </div>

            {/* 2. WIDGET STATUS ABSEN & CUTI (DIGABUNG BIAR HEMAT TEMPAT) */}
            <div className="dashboard-card" style={{ padding:'0', overflow:'hidden', display:'flex', flexDirection:'column' }}>
                {/* Bagian Atas: Absen */}
                <div style={{ padding:'20px', borderBottom:'1px solid #eee', borderLeft: `5px solid ${user ? getStatusColor(user.attendanceToday.statusLabel) : '#ccc'}` }}>
                     {user ? (
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems:'center' }}>
                             <div>
                                <h3 style={{ margin: '0 0 5px 0', fontSize: '12px', color: '#64748b', textTransform: 'uppercase' }}>Absensi Hari Ini</h3>
                                <span style={{ fontSize: '16px', fontWeight: 'bold', color: getStatusColor(user.attendanceToday.statusLabel) }}>
                                    {user.attendanceToday.statusLabel}
                                </span>
                             </div>
                             <div style={{ textAlign: 'right', fontSize: '12px', color: '#334155' }}>
                                <div>M: <strong>{user.attendanceToday.jamMasuk}</strong></div>
                                <div>P: <strong>{user.attendanceToday.jamPulang}</strong></div>
                            </div>
                        </div>
                     ) : <p style={{padding:'20px'}}>Memuat...</p>}
                </div>

                {/* Bagian Bawah: Cuti */}
                <div style={{ padding:'15px 20px', background:'#fcfcfc', borderLeft: '5px solid #10b981' }}>
                    {user ? (
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems:'center' }}>
                            <span style={{ fontSize: '12px', color: '#64748b' }}>Sisa Cuti:</span>
                            <div>
                                <strong style={{ fontSize: '18px', color: '#065f46' }}>{user.leaveBalance.remaining}</strong>
                                <span style={{ fontSize: '12px', color: '#64748b', marginLeft:'4px' }}>Hari</span>
                            </div>
                        </div>
                    ) : null}
                </div>
            </div>

            {/* 3. WIDGET AGENDA / NOTIFIKASI (BARU) */}
            <div className="dashboard-card" style={{ borderLeft: '5px solid #8b5cf6', display:'flex', flexDirection:'column' }}>
                 <h3 style={{ margin: '0 0 15px 0', fontSize: '14px', color: '#64748b', textTransform: 'uppercase', display:'flex', justifyContent:'space-between' }}>
                    Agenda Akan Datang
                    <span style={{fontSize:'18px'}}>📅</span>
                </h3>
                
                {user && user.upcomingEvents.length > 0 ? (
                    <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
                        {user.upcomingEvents.map((event, idx) => (
                            <div key={idx} style={{ display:'flex', gap:'12px', alignItems:'center', paddingBottom: idx !== user.upcomingEvents.length-1 ? '10px' : '0', borderBottom: idx !== user.upcomingEvents.length-1 ? '1px dashed #e2e8f0' : 'none' }}>
                                {/* Kotak Tanggal */}
                                <div style={{ 
                                    background: getEventIconColor(event.type), 
                                    color:'white', 
                                    padding:'5px 10px', 
                                    borderRadius:'6px', 
                                    textAlign:'center',
                                    minWidth:'50px'
                                }}>
                                    <div style={{fontSize:'12px', fontWeight:'bold'}}>{formatDateShort(event.date)}</div>
                                </div>
                                
                                {/* Detail */}
                                <div>
                                    <div style={{ fontSize:'14px', fontWeight:'600', color:'#334155' }}>{event.title}</div>
                                    <div style={{ fontSize:'11px', color:'#94a3b8' }}>
                                        {/* Tampilkan hari (Senin/Selasa dll) */}
                                        {new Date(event.date).toLocaleDateString('id-ID', { weekday: 'long' })}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div style={{ textAlign:'center', color:'#94a3b8', fontStyle:'italic', marginTop:'10px' }}>
                        Tidak ada agenda dalam waktu dekat.
                    </div>
                )}
            </div>

          </div>

          <div style={{ marginTop: '30px', color: '#94a3b8', fontSize: '14px', fontStyle: 'italic', textAlign: 'center', width: '100%' }}>
            "Disiplin adalah jembatan antara tujuan dan pencapaian."
          </div>
        </div>
      </KaryawanLayout>
    </>
  );
}