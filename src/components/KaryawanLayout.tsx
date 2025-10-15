"use client";
import React from "react";
import "@/styles/karyawanLayout.css";

export default function KaryawanLayout({ children }: { children: React.ReactNode }) {
  // Gunakan div pembungkus agar Flexbox bekerja dengan baik
  return (
    <div className="layout-container">
      <main className="karyawan-main">
        {children}
      </main>
    </div>
  );
}
