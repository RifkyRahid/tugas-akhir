"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { Users, Clock, CheckCircle, FileText, Activity } from "lucide-react";
import "@/styles/admindashboard.css";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// Interface yang aman
interface DashboardData {
  summary?: {
    totalKaryawan: number;
    terlambatHariIni: number;
    izinHariIni: number;
    absenMasukHariIni: number;
    pendingPengajuan: number;
  };
  chartData?: { date: string; hadir: number; telat: number; alpha: number }[];
  recentLogs?: {
    id: string;
    name: string;
    action: string;
    time: string;
    status: string;
  }[];
}

export default function AdminDashboard() {
  const [user, setUser] = useState<{ name: string; role: string } | null>(null);
  const [data, setData] = useState<DashboardData | null>(null);
  const router = useRouter();

  useEffect(() => {
    // 1. Cek User
    fetch("/api/user/me", { credentials: "include" })
      .then((res) => { if (res.ok) return res.json(); throw new Error("Auth fail"); })
      .then((u) => {
         if (u.role !== "admin" && u.role !== "superadmin") router.push("/");
         else setUser(u);
      })
      .catch(() => router.push("/"));

    // 2. Ambil Data Dashboard
    fetch("/api/admin/summary")
      .then((res) => res.json())
      .then((resData) => {
        // Log untuk memastikan data masuk di console browser
        console.log("Data Dashboard Diterima:", resData); 
        setData(resData);
      })
      .catch((err) => console.error("Gagal load dashboard", err));
  }, [router]);

  if (!user || !data) return <div style={{padding:'40px', textAlign:'center', color:'#64748b'}}>Memuat Dashboard...</div>;

  // SAFETY CHECK: Pastikan data summary & chartData ada sebelum dirender
  // Jika API error, kita pakai nilai default (0 atau []) agar tidak crash
  const summary = data.summary || { totalKaryawan:0, terlambatHariIni:0, izinHariIni:0, absenMasukHariIni:0, pendingPengajuan:0 };
  const chartData = data.chartData || []; // <--- Ini pencegah error 'undefined'
  const recentLogs = data.recentLogs || [];

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' as const, align: 'end' as const, labels: { usePointStyle: true, boxWidth: 10 } },
      tooltip: { backgroundColor: '#1e293b', padding: 12, cornerRadius: 8, displayColors: false }
    },
    scales: {
      x: { grid: { display: false }, ticks: { color: '#64748b' } },
      y: { grid: { color: '#f1f5f9', borderDash: [5, 5] }, border: { display: false } }
    },
    elements: { bar: { borderRadius: 6, borderSkipped: false } }
  };

  const chartDataConfig = {
    labels: chartData.map(d => d.date), // Aman karena chartData minimal array kosong []
    datasets: [
      { label: 'Hadir', data: chartData.map(d => d.hadir), backgroundColor: '#3b82f6', barPercentage: 0.6 },
      { label: 'Terlambat', data: chartData.map(d => d.telat), backgroundColor: '#f59e0b', barPercentage: 0.6 },
      { label: 'Alpha', data: chartData.map(d => d.alpha), backgroundColor: '#ef4444', barPercentage: 0.6 },
    ],
  };

  return (
    <div className="dashboard-container" style={{ paddingBottom: '50px' }}>
      {/* HEADER */}
      <div className="dashboard-card" style={{ marginBottom: '20px', borderLeft: '5px solid #0f172a' }}>
        <h1 style={{ fontSize: '1.5rem', marginBottom: '5px', color: '#1e293b' }}>Dashboard Admin</h1>
        <p style={{ color: '#64748b', margin: 0 }}>
            Selamat datang, <span className="highlight">{user.name}</span>! 👋 Berikut ringkasan aktivitas hari ini.
        </p>
      </div>

      {/* SUMMARY CARDS */}
      <div className="summary-grid">
        <StatCard icon={<Users size={24} color="#3b82f6" />} title="Total Karyawan" value={summary.totalKaryawan} color="blue" onClick={() => router.push("/admin/karyawan")} />
        <StatCard icon={<CheckCircle size={24} color="#22c55e" />} title="Hadir Hari Ini" value={summary.absenMasukHariIni} color="green" onClick={() => router.push("/admin/absensi")} />
        <StatCard icon={<Clock size={24} color="#ef4444" />} title="Terlambat Hari Ini" value={summary.terlambatHariIni} color="red" onClick={() => router.push("/admin/absensi?status=terlambat")} />
        <StatCard icon={<FileText size={24} color="#a855f7" />} title="Butuh Approval" value={summary.pendingPengajuan} color="purple" onClick={() => router.push("/admin/pengajuan")} />
      </div>

      {/* CHART & LOGS */}
      <div className="dashboard-split" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px', marginTop: '20px' }}>
        <div className="dashboard-card" style={{ minHeight: '420px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px' }}>
                <h3 style={{ margin:0, display:'flex', alignItems:'center', gap:'10px', fontSize:'16px', color:'#334155' }}>
                    <Activity size={20} color="#64748b" /> Statistik Kehadiran (7 Hari)
                </h3>
            </div>
            <div style={{ flex: 1, position: 'relative', minHeight: '300px' }}>
                <Bar options={chartOptions} data={chartDataConfig} />
            </div>
        </div>

        <div className="dashboard-card" style={{ maxHeight: '420px', display:'flex', flexDirection:'column' }}>
            <h3 style={{ margin:'0 0 20px 0', fontSize:'16px', color:'#334155' }}>Aktivitas Terbaru</h3>
            <div style={{ flex: 1, overflowY: 'auto', paddingRight: '5px' }}>
                {recentLogs.length === 0 ? (
                    <p style={{ color: '#94a3b8', fontStyle: 'italic', fontSize:'14px' }}>Belum ada aktivitas.</p>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                        {recentLogs.map((log) => (
                            <div key={log.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingBottom: '12px', borderBottom: '1px dashed #e2e8f0' }}>
                                <div style={{ 
                                    width: '38px', height: '38px', borderRadius: '50%', 
                                    background: log.action.includes("Masuk") ? '#eff6ff' : '#f0fdf4',
                                    color: log.action.includes("Masuk") ? '#3b82f6' : '#22c55e',
                                    display: 'flex', alignItems: 'center', justifyContent: 'center', 
                                    fontWeight: 'bold', fontSize:'14px', border: log.action.includes("Masuk") ? '1px solid #dbeafe' : '1px solid #dcfce7'
                                }}>
                                    {log.name.charAt(0).toUpperCase()}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontSize: '14px', fontWeight: '600', color: '#334155' }}>{log.name}</div>
                                    <div style={{ fontSize: '12px', color: '#64748b', display:'flex', justifyContent:'space-between' }}>
                                        <span>{log.action}</span>
                                        <span style={{ fontWeight: '600', color: '#475569' }}>{log.time}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
             <div style={{ marginTop: 'auto', paddingTop: '15px', textAlign: 'center', borderTop: '1px solid #f1f5f9' }}>
                <button onClick={() => router.push('/admin/absensi')} style={{ background: 'none', border: 'none', color: '#3b82f6', fontSize: '13px', cursor: 'pointer', fontWeight: '600' }}>Lihat Semua Aktivitas →</button>
            </div>
        </div>
      </div>
      <style jsx>{`
        .summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 20px; }
        .stat-card { background: white; padding: 20px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); display: flex; align-items: center; gap: 15px; cursor: pointer; transition: all 0.2s; border: 1px solid #f1f5f9; border-bottom: 4px solid transparent; }
        .stat-card:hover { transform: translateY(-3px); box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); }
        .stat-card.blue { border-bottom-color: #3b82f6; } .stat-card.green { border-bottom-color: #22c55e; } .stat-card.red { border-bottom-color: #ef4444; } .stat-card.purple { border-bottom-color: #a855f7; }
        .stat-icon-bg { width: 48px; height: 48px; border-radius: 12px; display: flex; align-items: center; justifyContent: center; }
        .blue .stat-icon-bg { background: #eff6ff; } .green .stat-icon-bg { background: #f0fdf4; } .red .stat-icon-bg { background: #fef2f2; } .purple .stat-icon-bg { background: #faf5ff; }
        @media (max-width: 900px) { .dashboard-split { grid-template-columns: 1fr !important; } }
      `}</style>
    </div>
  );
}

function StatCard({ icon, title, value, color, onClick }: any) {
    return (
        <div className={`stat-card ${color}`} onClick={onClick}>
            <div className="stat-icon-bg">{icon}</div>
            <div>
                <p style={{ margin: 0, fontSize: '13px', color: '#64748b', fontWeight: 600 }}>{title}</p>
                <h3 style={{ margin: '2px 0 0 0', fontSize: '24px', color: '#1e293b', fontWeight: 'bold' }}>{value}</h3>
            </div>
        </div>
    );
}