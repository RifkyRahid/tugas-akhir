"use client";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { FaFilePdf } from "react-icons/fa";

interface AbsensiItem {
  nama: string;
  jabatan: string;
  jamMasuk: string | null;
  jamPulang: string | null;
  status: string;
}

interface Props {
  data: AbsensiItem[];
  tanggal: string; // Format: YYYY-MM-DD
}

export default function ExportAbsensiHarianButton({ data, tanggal }: Props) {
  const handleExport = () => {
    const doc = new jsPDF();

    doc.setFontSize(14);
    doc.text(`Laporan Absensi Harian - ${tanggal}`, 14, 20);

    autoTable(doc, {
      startY: 30,
      head: [["No", "Nama", "Jabatan", "Jam Masuk", "Jam Pulang", "Status"]],
      body: data.map((item, index) => [
        index + 1,
        item.nama,
        item.jabatan,
        item.jamMasuk || "-",
        item.jamPulang || "-",
        item.status,
      ]),
      styles: {
        fontSize: 10,
      },
      headStyles: {
        fillColor: [41, 128, 185], // warna biru
        textColor: 255,
      },
    });

    doc.save(`absensi-harian-${tanggal}.pdf`);
  };

  return (
    <button onClick={handleExport} className="export-btn">
      <FaFilePdf style={{ marginRight: "5px" }} />
      Export PDF
    </button>
  );
}
