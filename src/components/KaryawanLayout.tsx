"use client";
import React from "react";
import "@/styles/karyawanLayout.css";

export default function KaryawanLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="karyawan-layout">
      <div className="sidebar-spacer" />
      <main className="karyawan-main">
        {children}
      </main>
    </div>
  );
}
