"use client";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { FaFilePdf } from "react-icons/fa";
import React from "react";

interface Absensi {
  id: string;
  user: { name: string };
  date: string;
  checkIn: string | null;
  checkOut: string | null;
  status: string;
  lateMinutes?: number;
}

export default function ExportAbsensiPDF({ absensi }: { absensi: Absensi[] }) {
  const handleExport = () => {
    const doc = new jsPDF();

    // Judul Dokumen
    doc.setFontSize(18);
    doc.text("Laporan Rekapitulasi Absensi", 14, 15);
    
    doc.setFontSize(11);
    doc.text(`Dicetak pada: ${new Date().toLocaleDateString('id-ID', { dateStyle: 'full' })}`, 14, 22);

    // Persiapan Data Tabel
    const tableData = absensi.map((item, idx) => {
      const tanggal = new Date(item.date).toLocaleDateString('id-ID', { 
        weekday: 'long', day: '2-digit', month: '2-digit', year: 'numeric' 
      });
      
      const jamMasuk = item.checkIn 
        ? new Date(item.checkIn).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) 
        : "-";
        
      const jamPulang = item.checkOut 
        ? new Date(item.checkOut).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) 
        : "-";

      const keterlambatan = item.lateMinutes ? `${item.lateMinutes} menit` : "-";

      return [
        idx + 1,
        item.user.name,
        tanggal,
        jamMasuk,
        jamPulang,
        item.status.toUpperCase(),
        keterlambatan
      ];
    });

    // Generate Tabel
    autoTable(doc, {
      startY: 30,
      head: [["No", "Nama Karyawan", "Hari, Tanggal", "Masuk", "Pulang", "Status", "Terlambat"]],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [41, 128, 185], textColor: 255, fontStyle: 'bold' }, // Warna Header Biru
      styles: { fontSize: 10, cellPadding: 3 },
      columnStyles: {
        0: { cellWidth: 10, halign: 'center' }, // No
        1: { cellWidth: 40 }, // Nama
        2: { cellWidth: 40 }, // Tanggal
        3: { cellWidth: 20, halign: 'center' }, // Masuk
        4: { cellWidth: 20, halign: 'center' }, // Pulang
        5: { cellWidth: 25, halign: 'center' }, // Status
        6: { cellWidth: 25, halign: 'center' }  // Terlambat
      },
      alternateRowStyles: { fillColor: [245, 245, 245] } // Zebra stripe
    });

    doc.save(`laporan-absensi-${new Date().toISOString().split('T')[0]}.pdf`);
  };

  return (
    <button 
      onClick={handleExport} 
      className="export-pdf-button"
      style={{
        backgroundColor: '#e74c3c', 
        color: 'white', 
        border: 'none', 
        padding: '10px 20px', 
        borderRadius: '5px', 
        cursor: 'pointer', 
        display: 'flex', 
        alignItems: 'center', 
        gap: '8px',
        fontWeight: 'bold',
        fontSize: '14px'
      }}
    >
      <FaFilePdf size={16} />
      Export PDF
    </button>
  );
}