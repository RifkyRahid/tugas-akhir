import AdminLeaveRequestTable from "@/components/AdminLeaveRequestTable";
import "@/styles/dashboard.css"; 

export default function PengajuanAdminPage() {
  return (
    <div className="dashboard-container">
      <div style={{ width: "100%", paddingBottom: "20px" }}>
        <h1 className="page-title">Daftar Pengajuan Karyawan</h1>
        <AdminLeaveRequestTable />
      </div>
    </div>
  );
}