"use client";

import { useEffect, useState } from "react";
import "@/styles/dashboard.css";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface RekapItem {
  nama: string;
  hadir: number;
  izin: number;
  sakit: number;
  alpha: number;
}

export default function RekapBulananCard() {
  const today = new Date();
  const [bulan, setBulan] = useState(today.getMonth() + 1);
  const [tahun, setTahun] = useState(today.getFullYear());
  const [data, setData] = useState<RekapItem[]>([]);

  const bulanOptions = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`/api/admin/rekap-bulanan?bulan=${bulan}&tahun=${tahun}`);
        const result = await res.json();
        setData(result);
      } catch (error) {
        console.error("Gagal mengambil data rekap bulanan:", error);
      }
    };
    fetchData();
  }, [bulan, tahun]);

  const handleExportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Rekap Absensi Bulanan", 14, 20);
    doc.setFontSize(12);
    doc.text(`Bulan: ${bulanOptions[bulan - 1]} ${tahun}`, 14, 30);

    autoTable(doc, {
      startY: 40,
      head: [["No", "Nama", "Hadir", "Izin", "Sakit", "Alpha"]],
      body: data.map((item, idx) => [
        idx + 1,
        item.nama,
        item.hadir,
        item.izin,
        item.sakit,
        item.alpha,
      ]),
      theme: "grid",
      headStyles: { fillColor: [2, 132, 199] }, // warna biru
    });

    doc.save(`rekap-absensi-${bulan}-${tahun}.pdf`);
  };

  return (
    <div className="rekap-dashboard-card">
      <h1>Rekap Absensi Bulanan</h1>

      <div className="rekap-filter">
        <select value={bulan} onChange={(e) => setBulan(Number(e.target.value))}>
          {bulanOptions.map((b, i) => (
            <option key={i} value={i + 1}>{b}</option>
          ))}
        </select>
        <input
          type="number"
          value={tahun}
          onChange={(e) => setTahun(Number(e.target.value))}
          style={{ width: "80px" }}
        />
        <button onClick={handleExportPDF} className="export-pdf-button">
          Export PDF
        </button>
      </div>

      <table className="rekap-absensi-table">
        <thead>
          <tr>
            <th>No</th>
            <th>Nama</th>
            <th>Hadir</th>
            <th>Izin</th>
            <th>Sakit</th>
            <th>Alpha</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, idx) => (
            <tr key={idx}>
              <td>{idx + 1}</td>
              <td>{item.nama}</td>
              <td>{item.hadir}</td>
              <td>{item.izin}</td>
              <td>{item.sakit}</td>
              <td>{item.alpha}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
