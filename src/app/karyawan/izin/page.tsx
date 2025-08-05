"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getUserFromLocalStorage } from "@/lib/auth";
import Navbar from "@/components/Sidebar";
import KaryawanLayout from "@/components/KaryawanLayout";
import LeaveRequestForm from "@/components/LeaveRequestForm";
import LeaveRequestTable from "@/components/LeaveRequestTable";
import "../../../styles/dashboard.css";

export default function IzinPage() {
  const router = useRouter();

  useEffect(() => {
    const user = getUserFromLocalStorage();
    if (!user || user.role !== "karyawan") {
      router.push("/login");
    }
  }, [router]);

  return (
    <>
      <Navbar role="karyawan" />
      <KaryawanLayout>
        <div className="dashboard-container">
          <div className="dashboard-card">
            <h1>Pengajuan Izin / Cuti / Sakit</h1>
            <p>Silakan isi form di bawah ini untuk mengajukan izin.</p>
            <LeaveRequestForm />
            <LeaveRequestTable />
          </div>
        </div>
      </KaryawanLayout>
    </>
  );
}
