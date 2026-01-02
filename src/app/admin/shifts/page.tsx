"use client";

import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import "@/styles/admindashboard.css";

interface Shift {
  id: number;
  name: string;
  startTime: string;
  endTime: string;
}

export default function MasterShiftPage() {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);

  // Load Data
  const fetchShifts = async () => {
    try {
      const res = await fetch("/api/admin/shifts");
      const data = await res.json();
      if (Array.isArray(data)) setShifts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchShifts(); }, []);

  // --- HANDLER TAMBAH / EDIT ---
  const handleForm = async (shift?: Shift) => {
    const isEdit = !!shift;
    
    const { value: formValues } = await Swal.fire({
      title: isEdit ? "Edit Shift" : "Tambah Shift Baru",
      html: `
        <div style="text-align:left">
            <label style="font-weight:600; font-size:14px; display:block; margin-bottom:5px;">Nama Shift</label>
            <input id="swal-name" class="swal2-input" placeholder="Contoh: Shift Pagi / LIBUR" value="${shift?.name || ''}" style="margin-bottom:15px;">
            
            <label style="display:block; font-weight:600; font-size:14px">Jam Masuk</label>
            <p style="font-size:12px; color:#64748b; margin:0 0 5px 0">Format: <b>09:00</b> atau ketik <b>OFF</b> untuk libur</p>
            <input 
                id="swal-start" 
                type="text" 
                class="swal2-input" 
                placeholder="09:00" 
                value="${shift?.startTime || ''}"
                oninput="this.value = this.value.toUpperCase()"
                style="margin-bottom:15px;"
            >

            <label style="display:block; font-weight:600; font-size:14px">Jam Pulang</label>
            <p style="font-size:12px; color:#64748b; margin:0 0 5px 0">Format: <b>18:00</b> atau ketik <b>OFF</b> untuk libur</p>
            <input 
                id="swal-end" 
                type="text" 
                class="swal2-input" 
                placeholder="18:00" 
                value="${shift?.endTime || ''}"
                oninput="this.value = this.value.toUpperCase()"
            >
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "Simpan",
      confirmButtonColor: "#3b82f6",
      preConfirm: () => {
        const nameVal = (document.getElementById("swal-name") as HTMLInputElement).value;
        const startVal = (document.getElementById("swal-start") as HTMLInputElement).value.toUpperCase();
        const endVal = (document.getElementById("swal-end") as HTMLInputElement).value.toUpperCase();

        if (!nameVal || !startVal || !endVal) {
            Swal.showValidationMessage("Semua field wajib diisi!");
            return false;
        }
        return { name: nameVal, startTime: startVal, endTime: endVal };
      },
    });

    if (formValues) {
      // Logic URL: Jika Edit pakai ID, Jika Baru pakai Root
      const url = isEdit ? `/api/admin/shifts/${shift.id}` : "/api/admin/shifts";
      const method = isEdit ? "PATCH" : "POST"; // Method sesuai API Route yang kita buat

      Swal.fire({ title: 'Menyimpan...', didOpen: () => Swal.showLoading() });

      try {
        const res = await fetch(url, {
            method: method,
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formValues),
        });

        const json = await res.json(); // Baca error message dari server jika ada

        if (res.ok) {
            await Swal.fire("Sukses", `Shift berhasil ${isEdit ? "diupdate" : "dibuat"}`, "success");
            fetchShifts();
        } else {
            throw new Error(json.error || "Gagal menyimpan");
        }
      } catch (err: any) {
        Swal.fire("Gagal", err.message, "error");
      }
    }
  };

  // --- HANDLER DELETE ---
  const handleDelete = async (id: number) => {
    const result = await Swal.fire({
        title: "Hapus Shift?",
        text: "Data yang dihapus tidak bisa dikembalikan.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        confirmButtonText: "Ya, Hapus"
    });

    if (result.isConfirmed) {
        try {
            // Fetch ke endpoint [id] dengan method DELETE
            const res = await fetch(`/api/admin/shifts/${id}`, { method: "DELETE" });
            const json = await res.json();
            
            if (res.ok) {
                Swal.fire("Terhapus", "Shift berhasil dihapus.", "success");
                fetchShifts();
            } else {
                Swal.fire("Gagal", json.error || "Gagal menghapus", "error");
            }
        } catch (error) {
            Swal.fire("Error", "Gagal menghubungi server", "error");
        }
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-card header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
            <h1 style={{ margin: 0, fontSize: '1.5rem' }}>Master Shift Kerja</h1>
            <p style={{ color: '#64748b', margin: '5px 0 0 0' }}>Atur jam kerja. Gunakan "OFF" untuk shift libur.</p>
        </div>
        <button 
            onClick={() => handleForm()} 
            style={{ 
                backgroundColor: '#3b82f6', color: 'white', padding: '10px 20px', 
                border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' 
            }}
        >
            + Tambah Shift
        </button>
      </div>

      <div className="dashboard-card">
        {loading ? (
            <p style={{padding:'20px', textAlign:'center'}}>Memuat data...</p>
        ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                    <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>
                        <th style={{ padding: '15px' }}>Nama Shift</th>
                        <th style={{ padding: '15px' }}>Jam Masuk</th>
                        <th style={{ padding: '15px' }}>Jam Pulang</th>
                        <th style={{ padding: '15px', textAlign: 'center' }}>Aksi</th>
                    </tr>
                </thead>
                <tbody>
                    {shifts.length === 0 ? (
                        <tr><td colSpan={4} style={{ padding: '20px', textAlign: 'center', color:'#64748b' }}>Belum ada data shift.</td></tr>
                    ) : (
                        shifts.map((shift) => (
                            <tr key={shift.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                <td style={{ padding: '15px', fontWeight: 'bold' }}>{shift.name}</td>
                                <td style={{ padding: '15px', color: '#166534', fontWeight: '500' }}>
                                    {shift.startTime === 'OFF' ? 
                                        <span style={{background:'#fee2e2', color:'#991b1b', padding:'2px 8px', borderRadius:'4px', fontSize:'12px', fontWeight:'bold'}}>LIBUR</span> 
                                        : shift.startTime}
                                </td>
                                <td style={{ padding: '15px', color: '#b91c1c', fontWeight: '500' }}>
                                    {shift.endTime === 'OFF' ? '-' : shift.endTime}
                                </td>
                                <td style={{ padding: '15px', textAlign: 'center' }}>
                                    <div style={{display:'flex', gap:'10px', justifyContent:'center'}}>
                                        <button 
                                            onClick={() => handleForm(shift)}
                                            style={{ 
                                                background: '#fef3c7', color: '#d97706', border: '1px solid #fcd34d',
                                                padding: '5px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px'
                                            }}
                                        >
                                            Edit
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(shift.id)}
                                            style={{ 
                                                background: '#fee2e2', color: '#991b1b', border: '1px solid #fecaca',
                                                padding: '5px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '12px'
                                            }}
                                        >
                                            Hapus
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        )}
      </div>
    </div>
  );
}