
"use client";
import Swal from 'sweetalert2';
import { useState } from "react";
import { useRouter } from "next/navigation";
import "../styles/login.css";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (res.ok) {
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
        if (data.role === "admin") {
          router.push("/admin/dashboard");
        } else {
          router.push("/karyawan/dashboard");
        }
      });
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Login gagal',
        text: data.message || 'Email atau password salah.',
      });
      setError("");
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
