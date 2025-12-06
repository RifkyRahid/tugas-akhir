"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getUserFromLocalStorage } from "@/lib/auth";
import Navbar from "@/components/Sidebar"; 
import KaryawanLayout from "@/components/KaryawanLayout";
import Swal from "sweetalert2";
import EmployeeHistoryTable from "@/components/EmployeeHistoryTable"; 
import "@/styles/dashboard.css";

export default function IzinPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"izin" | "koreksi">("izin");
  const [loading, setLoading] = useState(false);
  const [refreshHistory, setRefreshHistory] = useState(0); 

  const [izinForm, setIzinForm] = useState({ type: "izin", startDate: "", endDate: "", reason: "" });
  const [izinFile, setIzinFile] = useState<File | null>(null);

  const [koreksiForm, setKoreksiForm] = useState({ date: "", time: "", reason: "" });
  const [koreksiFile, setKoreksiFile] = useState<File | null>(null);

  useEffect(() => {
    const user = getUserFromLocalStorage();
    if (!user || user.role !== "karyawan") router.push("/");
  }, [router]);

  const submitIzin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData();
    formData.append("type", izinForm.type);
    formData.append("startDate", izinForm.startDate);
    formData.append("endDate", izinForm.endDate);
    formData.append("reason", izinForm.reason);
    if (izinFile) formData.append("attachment", izinFile);

    try {
        const res = await fetch("/api/pengajuan", { 
            method: "POST",
            body: formData
        });
        const result = await res.json();

        if(res.ok) {
            Swal.fire("Berhasil", "Pengajuan izin terkirim", "success");
            setIzinForm({ type: "izin", startDate: "", endDate: "", reason: "" });
            setIzinFile(null);
            setRefreshHistory(prev => prev + 1); 
        } else {
            Swal.fire("Gagal", result.message || "Terjadi kesalahan", "error");
        }
    } catch(err) {
        Swal.fire("Error", "Gagal koneksi", "error");
    } finally {
        setLoading(false);
    }
  };

  const submitKoreksi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!koreksiFile) {
        Swal.fire("Wajib", "Bukti foto wajib dilampirkan.", "warning");
        return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("date", koreksiForm.date);
    formData.append("time", koreksiForm.time);
    formData.append("reason", koreksiForm.reason);
    formData.append("attachment", koreksiFile);

    try {
        const res = await fetch("/api/pengajuan/koreksi", {
            method: "POST",
            body: formData
        });
        if(res.ok) {
            Swal.fire("Berhasil", "Permintaan koreksi dikirim", "success");
            setKoreksiForm({ date: "", time: "", reason: "" });
            setKoreksiFile(null);
            setRefreshHistory(prev => prev + 1); 
        } else {
            Swal.fire("Gagal", "Gagal mengirim data", "error");
        }
    } catch(err) {
        Swal.fire("Error", "Gagal koneksi", "error");
    } finally {
        setLoading(false);
    }
  };

  return (
    <>
      <Navbar role="karyawan" />
      <KaryawanLayout>
        <div className="dashboard-container">
          <div className="dashboard-card responsive-card">
            <h1 className="page-title">Pusat Pengajuan</h1>

            {/* TAB FORM */}
            <div className="tab-container">
                <button 
                    onClick={() => setActiveTab("izin")}
                    className={`tab-btn ${activeTab === 'izin' ? 'active-blue' : ''}`}
                >
                    Form Izin / Cuti
                </button>
                <button 
                    onClick={() => setActiveTab("koreksi")}
                    className={`tab-btn ${activeTab === 'koreksi' ? 'active-orange' : ''}`}
                >
                    Form Koreksi Absen
                </button>
            </div>

            {/* AREA FORM */}
            <div className="form-container">
                {activeTab === "izin" ? (
                    <form onSubmit={submitIzin} className="form-content">
                        <div className="form-grid">
                            <div className="form-group">
                                <label>Jenis Pengajuan</label>
                                <select 
                                    className="form-input" 
                                    value={izinForm.type}
                                    onChange={(e) => setIzinForm({...izinForm, type: e.target.value})}
                                >
                                    <option value="izin">Izin</option>
                                    <option value="sakit">Sakit</option>
                                    <option value="cuti">Cuti</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Lampiran</label>
                                <input type="file" className="form-input" accept="image/*,.pdf" 
                                    onChange={(e) => setIzinFile(e.target.files ? e.target.files[0] : null)} />
                            </div>
                        </div>
                        <div className="form-grid">
                            <div className="form-group">
                                <label>Dari Tanggal</label>
                                <input type="date" className="form-input" required 
                                    value={izinForm.startDate} onChange={(e) => setIzinForm({...izinForm, startDate: e.target.value})} />
                            </div>
                            <div className="form-group">
                                <label>Sampai Tanggal</label>
                                <input type="date" className="form-input" required 
                                    value={izinForm.endDate} onChange={(e) => setIzinForm({...izinForm, endDate: e.target.value})} />
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Alasan</label>
                            <textarea className="form-input" rows={2} required 
                                value={izinForm.reason} onChange={(e) => setIzinForm({...izinForm, reason: e.target.value})} />
                        </div>
                        <button type="submit" className="add-button blue-btn" disabled={loading}>{loading ? "Mengirim..." : "Ajukan Izin"}</button>
                    </form>
                ) : (
                    <form onSubmit={submitKoreksi} className="form-content">
                        <div className="alert-box">
                            <strong>⚠️ Info:</strong> Gunakan ini jika lupa absen pulang karena urusan darurat. Wajib lampirkan foto bukti.
                        </div>
                        <div className="form-grid">
                            <div className="form-group">
                                <label>Tanggal Absen</label>
                                <input type="date" className="form-input" required 
                                    value={koreksiForm.date} onChange={(e) => setKoreksiForm({...koreksiForm, date: e.target.value})} />
                            </div>
                            <div className="form-group">
                                <label>Jam Pulang Sebenarnya</label>
                                <input type="time" className="form-input" required 
                                    value={koreksiForm.time} onChange={(e) => setKoreksiForm({...koreksiForm, time: e.target.value})} />
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Alasan & Bukti Foto</label>
                            <div className="split-input">
                                <textarea className="form-input" rows={1} required placeholder="Alasan..." 
                                    value={koreksiForm.reason} onChange={(e) => setKoreksiForm({...koreksiForm, reason: e.target.value})} />
                                <input type="file" className="form-input" accept="image/*" required 
                                    onChange={(e) => setKoreksiFile(e.target.files ? e.target.files[0] : null)} />
                            </div>
                        </div>
                        <button type="submit" className="add-button orange-btn" disabled={loading}>
                            {loading ? "Mengirim..." : "Kirim Koreksi"}
                        </button>
                    </form>
                )}
            </div>

            <EmployeeHistoryTable refreshTrigger={refreshHistory} />

          </div>
        </div>
      </KaryawanLayout>

      <style jsx>{`
        .responsive-card {
            max-width: 850px;
            margin: 0 auto;
            width: 100%;
            box-sizing: border-box;
        }
        .page-title {
            margin-bottom: 20px;
            font-size: 1.5rem;
        }
        
        /* TABS Responsive */
        .tab-container {
            display: flex;
            gap: 10px;
            margin-bottom: 20px;
            border-bottom: 1px solid #ddd;
            overflow-x: auto; /* Bisa discroll horizontal di HP kecil */
            white-space: nowrap;
            padding-bottom: 2px;
        }
        .tab-btn {
            padding: 10px 20px;
            border: none;
            border-radius: 5px 5px 0 0;
            cursor: pointer;
            font-weight: bold;
            color: #666;
            background: transparent;
            flex-shrink: 0;
        }
        .active-blue {
            background: #3b82f6;
            color: white;
        }
        .active-orange {
            background: #f59e0b;
            color: white;
        }

        /* FORM Container */
        .form-container {
            background: #f9fafb;
            padding: 20px;
            border-radius: 8px;
            border: 1px solid #e5e7eb;
        }
        .form-content {
            display: flex;
            flex-direction: column;
            gap: 15px;
        }
        
        /* GRID SYSTEM */
        .form-grid {
            display: grid;
            grid-template-columns: 1fr; /* Default 1 kolom (Mobile First) */
            gap: 15px;
        }
        /* Jika layar lebar (Tablet/PC), jadi 2 kolom */
        @media (min-width: 768px) {
            .form-grid {
                grid-template-columns: 1fr 1fr;
            }
        }

        .form-group {
            display: flex;
            flex-direction: column;
        }
        .form-group label {
            font-weight: bold;
            margin-bottom: 5px;
            font-size: 0.9rem;
        }
        
        /* Input Styles */
        .form-input {
            padding: 10px;
            border: 1px solid #ccc;
            border-radius: 5px;
            width: 100%;
            box-sizing: border-box; /* Agar padding tidak menambah lebar */
        }

        /* Alert Box */
        .alert-box {
            background: #fffbeb;
            padding: 10px;
            border-radius: 4px;
            font-size: 13px;
            color: #b45309;
            border-left: 4px solid #f59e0b;
        }

        /* Split Input (Alasan + File) */
        .split-input {
            display: flex;
            flex-direction: column; /* Default tumpuk di HP */
            gap: 10px;
        }
        @media (min-width: 768px) {
            .split-input {
                flex-direction: row; /* Sebelahan di PC */
            }
            .split-input > * {
                flex: 1;
            }
        }

        /* Buttons */
        .add-button {
            padding: 12px;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
            font-weight: bold;
            font-size: 1rem;
            width: 100%;
        }
        .blue-btn { background-color: #3b82f6; }
        .orange-btn { background-color: #f59e0b; }
      `}</style>
    </>
  );
}