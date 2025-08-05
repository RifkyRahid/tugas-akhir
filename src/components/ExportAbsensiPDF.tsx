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
}

export default function ExportAbsensiPDF({ absensi }: { absensi: Absensi[] }) {
  const handleExport = () => {
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.text("Laporan Absensi Harian", 14, 15);

    autoTable(doc, {
      startY: 25,
      head: [["No", "Nama", "Tanggal", "Check In", "Check Out", "Status"]],
      body: absensi.map((item, idx) => [
        idx + 1,
        item.user.name,
        new Date(item.date).toLocaleDateString(),
        item.checkIn ? new Date(item.checkIn).toLocaleTimeString() : "-",
        item.checkOut ? new Date(item.checkOut).toLocaleTimeString() : "-",
        item.status,
      ]),
    });

    doc.save("laporan-absensi.pdf");
  };

  return (
    <button onClick={handleExport} className="export-pdf-button">
      <FaFilePdf style={{ marginRight: "6px" }} />
      Export PDF
    </button>
  );
}
