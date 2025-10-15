"use client";

import { useState } from "react";
import Swal from "sweetalert2"; // 1. Import SweetAlert2
import Navbar from "@/components/Sidebar";
import KaryawanLayout from "@/components/KaryawanLayout";
import "@/styles/profil.css";

export default function ProfilPage() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // 2. Ganti setError dengan Swal.fire untuk validasi
    if (!oldPassword || !newPassword || !confirmPassword) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Semua field wajib diisi.",
      });
      setIsLoading(false);
      return;
    }
    if (newPassword.length < 6) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Password baru minimal 6 karakter.",
      });
      setIsLoading(false);
      return;
    }
    if (newPassword !== confirmPassword) {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: "Password baru dan konfirmasi tidak cocok.",
      });
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/user/ganti-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ oldPassword, newPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Terjadi kesalahan");
      }

      // 3. Ganti setSuccessMessage dengan Swal.fire untuk notifikasi sukses
      Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: "Password Anda telah berhasil diubah.",
        timer: 2000, // Alert akan hilang setelah 2 detik
        showConfirmButton: false,
      });

      // Reset form
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");

    } catch (err: any) {
      // 4. Ganti setError dengan Swal.fire untuk error dari API
      Swal.fire({
        icon: "error",
        title: "Gagal Mengubah Password",
        text: err.message,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Navbar role={"karyawan"} />
      <KaryawanLayout>
        {/* Kontainer baru untuk memastikan card tidak terlalu besar */}
        <div className="profil-container"> 
          <div className="dashboard-card">
            <h1>Ubah Password</h1>
            <p>Untuk keamanan, silakan ganti password Anda secara berkala.</p>

            <form onSubmit={handleSubmit} className="profil-form">
              <div className="form-group">
                <label htmlFor="oldPassword">Password Lama</label>
                <input
                  type="password"
                  id="oldPassword"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="newPassword">Password Baru</label>
                <input
                  type="password"
                  id="newPassword"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="confirmPassword">Konfirmasi Password Baru</label>
                <input
                  type="password"
                  id="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              {/* 5. Hapus elemen <p> untuk pesan error dan sukses */}

              <button
                type="submit"
                className="submit-button"
                disabled={isLoading}
              >
                {isLoading ? "Menyimpan..." : "Simpan Perubahan"}
              </button>
            </form>
          </div>
        </div>
      </KaryawanLayout>
    </>
  );
}

