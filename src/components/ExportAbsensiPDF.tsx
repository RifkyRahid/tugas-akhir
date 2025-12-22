"use client";

import { useState, useEffect } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import Swal from "sweetalert2";

export default function ExportAbsensiPDF() {
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/master/departemen')
      .then(res => res.json())
      .then(res => {
          if(res.data) setDepartments(res.data);
      })
      .catch(err => console.error("Gagal load dept", err));
  }, []);

  const handleExportClick = async () => {
    const deptOptions = departments.map(d => `<option value="${d.id}">${d.name}</option>`).join("");
    
    // STYLE KHUSUS MODAL: Font size 14px, Input lebih kecil
    const { value: formValues } = await Swal.fire({
      title: '<span style="font-size: 18px; font-weight:bold;">Export Laporan Absensi</span>',
      html: `
        <div style="text-align: left; font-size: 14px;">
            <label style="display:block; margin-bottom:4px; font-weight:600; color:#333;">Dari Tanggal</label>
            <input id="swal-start" type="date" class="swal2-input custom-swal-input">
            
            <label style="display:block; margin-bottom:4px; margin-top:10px; font-weight:600; color:#333;">Sampai Tanggal</label>
            <input id="swal-end" type="date" class="swal2-input custom-swal-input">

            <label style="display:block; margin-bottom:4px; margin-top:10px; font-weight:600; color:#333;">Unit Bisnis / Departemen</label>
            <select id="swal-dept" class="swal2-select custom-swal-input" style="display:block;">
                <option value="all">-- Semua Unit --</option>
                ${deptOptions}
            </select>

            <label style="display:block; margin-bottom:4px; margin-top:10px; font-weight:600; color:#333;">Jenis Laporan</label>
            <select id="swal-type" class="swal2-select custom-swal-input" style="display:block;">
                <option value="rekap">📊 Rekapitulasi (Payroll)</option>
                <option value="detail">📝 Detail Harian (Log)</option>
            </select>

            <div id="status-container" style="display:none;">
                <label style="display:block; margin-bottom:4px; margin-top:10px; font-weight:600; color:#333;">Filter Status</label>
                <select id="swal-status" class="swal2-select custom-swal-input" style="display:block;">
                    <option value="all">Semua Status</option>
                    <option value="hadir">Hadir</option>
                    <option value="terlambat">Terlambat</option>
                    <option value="alpha">Alpha</option>
                    <option value="sakit">Sakit</option>
                    <option value="izin">Izin</option>
                </select>
            </div>
            
            <style>
                .custom-swal-input {
                    margin: 0 !important;
                    width: 100% !important;
                    font-size: 14px !important;
                    height: 38px !important; /* Tinggi input dikecilkan */
                    padding: 0 10px !important;
                    box-sizing: border-box !important;
                }
            </style>
        </div>
      `,
      didOpen: () => {
        const typeSelect = document.getElementById('swal-type') as HTMLSelectElement;
        const statusContainer = document.getElementById('status-container') as HTMLDivElement;
        
        typeSelect.addEventListener('change', () => {
            if (typeSelect.value === 'detail') {
                statusContainer.style.display = 'block';
            } else {
                statusContainer.style.display = 'none';
            }
        });
      },
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "Download PDF",
      confirmButtonColor: "#dc2626",
      preConfirm: () => {
        const startDate = (document.getElementById("swal-start") as HTMLInputElement).value;
        const endDate = (document.getElementById("swal-end") as HTMLInputElement).value;
        const deptId = (document.getElementById("swal-dept") as HTMLSelectElement).value;
        const type = (document.getElementById("swal-type") as HTMLSelectElement).value;
        const status = (document.getElementById("swal-status") as HTMLSelectElement).value;
        
        if (!startDate || !endDate) {
          Swal.showValidationMessage("Harap isi rentang tanggal!");
        }
        return { startDate, endDate, deptId, type, status };
      },
    });

    if (formValues) {
      if (formValues.type === 'rekap') {
        generateRekapPDF(formValues.startDate, formValues.endDate, formValues.deptId);
      } else {
        generateDetailPDF(formValues.startDate, formValues.endDate, formValues.deptId, formValues.status);
      }
    }
  };

  const generateRekapPDF = async (startDate: string, endDate: string, deptId: string) => {
    setLoading(true);
    Swal.fire({ title: 'Menghitung Rekap...', didOpen: () => Swal.showLoading() });

    try {
        const res = await fetch(`/api/admin/export-rekap?startDate=${startDate}&endDate=${endDate}&deptId=${deptId}`);
        const json = await res.json();
        if (!res.ok) throw new Error(json.error);
        
        const data = json.data;
        if (data.length === 0) {
            Swal.fire("Info", "Tidak ada data.", "info");
            return;
        }

        const doc = new jsPDF('l', 'mm', 'a4');
        doc.setFontSize(16);
        doc.text("Laporan Rekapitulasi Absensi (Payroll)", 14, 20);
        doc.setFontSize(10);
        doc.text(`Periode: ${startDate} s/d ${endDate}`, 14, 28);

        autoTable(doc, {
            startY: 35,
            // UPDATE: Unit Bisnis pindah ke kolom ke-2
            head: [[
                "No", 
                "Unit Bisnis", 
                "Nama Karyawan", 
                "Jumlah Telat", 
                "Tidak Pulang", 
                "Sakit No MC", 
                "Alpha", 
                "Total Potongan", 
                "Total Unpaid"
            ]],
            body: data.map((row: any, i: number) => [
                i + 1,
                row.unit, // Unit dulu
                row.nama, // Baru Nama
                row.jumlahTerlambat,
                row.jumlahNoCheckout,
                row.jumlahSakitNoMC,
                row.jumlahAlpha,
                { content: row.totalPotonganAbsensi, styles: { fontStyle: 'bold', fillColor: [255, 237, 213] } },
                { content: row.totalUnpaidHarian, styles: { fontStyle: 'bold', fillColor: [254, 202, 202] } }
            ]),
            theme: 'grid',
            headStyles: { fillColor: [44, 62, 80], halign: 'center' },
            bodyStyles: { halign: 'center' },
            columnStyles: {
                1: { halign: 'left' }, // Unit rata kiri
                2: { halign: 'left' }  // Nama rata kiri
            }
        });

        doc.save(`Rekap_Payroll_${startDate}.pdf`);
        Swal.close();
    } catch (err) {
        Swal.fire("Error", "Gagal export rekap", "error");
    } finally {
        setLoading(false);
    }
  };

  const generateDetailPDF = async (startDate: string, endDate: string, deptId: string, status: string) => {
    setLoading(true);
    Swal.fire({ title: 'Mengambil Data...', didOpen: () => Swal.showLoading() });

    try {
      const res = await fetch(`/api/admin/export-absensi?startDate=${startDate}&endDate=${endDate}&deptId=${deptId}&status=${status}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error);

      const data = json.data;
      if (data.length === 0) {
        Swal.fire("Info", "Tidak ada data.", "info");
        return;
      }

      const doc = new jsPDF('p', 'mm', 'a4');
      doc.setFontSize(16);
      doc.text("Laporan Detail Harian Absensi", 14, 20);
      doc.setFontSize(10);
      doc.text(`Periode: ${startDate} s/d ${endDate}`, 14, 28);

      autoTable(doc, {
        startY: 35,
        head: [["No", "Unit", "Nama", "Tanggal", "Masuk", "Pulang", "Status", "Ket"]],
        body: data.map((row: any, i: number) => [
            i + 1,
            row.unit,
            row.nama,
            row.tanggal,
            row.jamMasuk,
            row.jamPulang,
            row.status.toUpperCase(),
            row.keterangan
        ]),
        headStyles: { fillColor: [41, 128, 185] },
        styles: { fontSize: 9 }
      });

      doc.save(`Detail_Absensi_${startDate}.pdf`);
      Swal.close();
    } catch (err) {
        Swal.fire("Error", "Gagal export detail", "error");
    } finally {
        setLoading(false);
    }
  };

  return (
    <button
      onClick={handleExportClick}
      disabled={loading}
      style={{
        backgroundColor: "#dc2626", 
        color: "white",
        border: "none",
        // UPDATE: Padding disamakan dengan generate alpha (8px 16px)
        padding: "8px 16px",
        borderRadius: "6px",
        cursor: loading ? "not-allowed" : "pointer",
        fontWeight: "bold",
        display: "flex",
        alignItems: "center",
        gap: "8px"
      }}
    >
      📄 {loading ? "Memproses..." : "Export PDF"}
    </button>
  );
}