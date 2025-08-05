import AdminLeaveRequestTable from "@/components/AdminLeaveRequestTable";
import "@/styles/dashboard.css"; 

export default function PengajuanAdminPage() {
  return (
    <div className="content-container" style={{ marginLeft: "240px",  padding: "20px" }}>
      <h1 className="page-title">Daftar Pengajuan Karyawan</h1>
        <AdminLeaveRequestTable />
    </div>
  );
}
