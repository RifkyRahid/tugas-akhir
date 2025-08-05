"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import "./login.css";

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
    } else {
      setError(data.message);
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <h2>Sign in</h2>
        <p className="small-text">Gunakan akun anda</p>

        {error && <p className="error-text">{error}</p>}

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
