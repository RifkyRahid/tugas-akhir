"use client";
import Swal from 'sweetalert2';
import { useState } from "react";
import { useRouter } from "next/navigation";
import "../styles/login.css"; // Pastikan path css ini benar sesuai struktur folder kamu

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Tampilkan Loading Sebelum Fetch
    Swal.fire({
      title: 'Sedang Masuk...',
      text: 'Memverifikasi akun anda.',
      allowOutsideClick: false, // User tidak bisa klik luar untuk tutup
      didOpen: () => {
        Swal.showLoading(); // Tampilkan animasi loading bawaan SweetAlert
      }
    });

    try {
        const res = await fetch("/api/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        });

        const data = await res.json();

        if (res.ok) {
          // 2. Jika Sukses -> Loading otomatis terganti alert Sukses
          Swal.fire({
            icon: 'success',
            title: 'Login berhasil!',
            text: data.role === 'admin' ? 'Selamat datang Admin!' : 'Selamat datang Karyawan!',
            timer: 1500,
            showConfirmButton: false,
          }).then(() => {
            localStorage.setItem(
              "user",
              JSON.stringify({
                userId: data.userId,
                role: data.role,
              })
            );
            
            // Redirect sesuai role
            if (data.role === "admin") {
              router.push("/admin/dashboard");
            } else {
              router.push("/karyawan/dashboard");
            }
          });
        } else {
          // 3. Jika Gagal (Password salah) -> Loading terganti Error
          Swal.fire({
            icon: 'error',
            title: 'Login gagal',
            text: data.message || 'Email atau password salah.',
          });
        }

    } catch (error) {
        // 4. Jika Server Error / Tidak ada koneksi
        console.error("Login Error:", error);
        Swal.fire({
            icon: 'error',
            title: 'Gagal Terhubung',
            text: 'Terjadi kesalahan pada server atau koneksi internet Anda.',
        });
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Sign in</h2>
        <p className="small-text">Gunakan akun anda</p>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <p className="forgot">Lupa kata sandi anda? Hubungi admin</p>
          <button type="submit" className="btn-login">
            SIGN IN
          </button>
        </form>
      </div>
    </div>
  );
}