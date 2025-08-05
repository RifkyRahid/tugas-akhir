// src/components/AdminLayout.tsx
'use client';
import React from 'react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex' }}>
      <div style={{ width: '220px' }} /> {/* Spacer agar tidak tertutup sidebar */}
      <main style={{ flex: 1, padding: '2rem', backgroundColor: '#f3f6fd' }}>
        {children}
      </main>
    </div>
  );
}
