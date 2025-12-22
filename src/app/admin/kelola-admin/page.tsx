"use client";

import { useEffect, useState } from "react";
import AddAdminModal from "@/components/AddAdminModal";
import EditAdminModal from "@/components/EditAdminModal";
import Swal from "sweetalert2";
import "@/styles/dashboard.css";

export default function KelolaAdminPage() {
  const [admins, setAdmins] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [showAdd, setShowAdd] = useState(false);
  const [editUser, setEditUser] = useState<any>(null);

  const fetchAdmins = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin-users");
      const data = await res.json();
      if(Array.isArray(data)) setAdmins(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
  }, []);

  const handleDelete = async (id: string, name: string) => {
    const result = await Swal.fire({
        title: `Hapus Admin ${name}?`,
        text: "User ini tidak akan bisa login lagi ke panel admin.",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        confirmButtonText: 'Ya, Hapus',
        cancelButtonText: 'Batal'
    });

    if (result.isConfirmed) {
        try {
            Swal.fire({ title: 'Menghapus...', didOpen: () => Swal.showLoading() });
            const res = await fetch(`/api/admin-users/${id}`, { method: 'DELETE' });
            
            if (res.ok) {
                Swal.fire('Terhapus', 'Data admin berhasil dihapus', 'success');
                fetchAdmins();
            } else {
                const err = await res.json();
                Swal.fire('Gagal', err.message || 'Gagal menghapus', 'error');
            }
        } catch (error) {
            Swal.fire('Error', 'Terjadi kesalahan server', 'error');
        }
    }
  };

  return (
    <>
      <div className="page-header" style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px'}}>
        <div>
            <h1 className="page-title" style={{margin:0}}>Kelola User Admin</h1>
            <p style={{margin:0, color:'#666', fontSize:'14px'}}>Tambah atau hapus akses administrator sistem.</p>
        </div>
        <button 
            onClick={() => setShowAdd(true)}
            style={{
                backgroundColor: '#0f172a', color: 'white', border: 'none', 
                padding: '10px 20px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold'
            }}
        >
            + Tambah Admin
        </button>
      </div>

      <div className="dashboard-card">
        <table className="styled-table">
            <thead>
                <tr>
                    <th>No</th>
                    <th>Nama</th>
                    <th>Email</th>
                    <th>Terdaftar Sejak</th>
                    <th>Aksi</th>
                </tr>
            </thead>
            <tbody>
                {loading ? (
                    <tr><td colSpan={5} style={{textAlign:'center', padding:'20px'}}>Memuat data...</td></tr>
                ) : admins.length > 0 ? (
                    admins.map((admin, idx) => (
                        <tr key={admin.id}>
                            <td>{idx + 1}</td>
                            <td><strong>{admin.name}</strong></td>
                            <td>{admin.email}</td>
                            <td>{new Date(admin.createdAt).toLocaleDateString('id-ID')}</td>
                            <td>
                                <div style={{display:'flex', gap:'5px'}}>
                                    <button 
                                        onClick={() => setEditUser(admin)}
                                        style={{padding:'5px 10px', background:'#f59e0b', color:'white', border:'none', borderRadius:'4px', cursor:'pointer'}}
                                    >
                                        ✏️ Edit
                                    </button>
                                    <button 
                                        onClick={() => handleDelete(admin.id, admin.name)}
                                        style={{padding:'5px 10px', background:'#ef4444', color:'white', border:'none', borderRadius:'4px', cursor:'pointer'}}
                                    >
                                        🗑️ Hapus
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))
                ) : (
                    <tr><td colSpan={5} style={{textAlign:'center', padding:'20px'}}>Belum ada data admin lain.</td></tr>
                )}
            </tbody>
        </table>
      </div>

      <AddAdminModal 
        isOpen={showAdd} 
        onClose={() => setShowAdd(false)} 
        onSuccess={fetchAdmins} 
      />

      <EditAdminModal 
        isOpen={!!editUser} 
        user={editUser} 
        onClose={() => setEditUser(null)} 
        onSuccess={fetchAdmins} 
      />
    </>
  );
}