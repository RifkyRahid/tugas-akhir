import { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import FilterForm from "@/components/FilterForm";
import GenerateAlphaButton from "@/components/GenerateAlphaButton";
import ExportAbsensiPDF from "@/components/ExportAbsensiPDF";
import AbsensiTable from "@/components/AbsensiTable";
import { Prisma } from "@prisma/client";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import "@/styles/absensi.css";

export const metadata: Metadata = {
  title: "Admin | Kelola Absensi",
  description: "Halaman kelola absensi karyawan",
};

// Tipe data yang disesuaikan
type AttendanceWithUser = Prisma.AttendanceGetPayload<{
  include: { 
    user: {
      include: {
        jabatan: {
          include: { department: true }
        };
        area: true;
      }
    } 
  };
}>;

type AttendanceData = {
  id: string;
  user: { 
    name: string;
    jabatan?: string; // Menampung Nama Jabatan + Unit
  };
  date: string;
  checkIn: string | null;
  checkOut: string | null;
  status: string;
  photo?: string | null;
  lateMinutes?: number;
  // Opsional: Jika mau kirim koordinat untuk maps
  latitude?: number | null;
  longitude?: number | null;
};

function getTodayWIB(): string {
  const now = new Date();
  const wibOffset = 7 * 60 * 60 * 1000;
  const localDate = new Date(now.getTime() + wibOffset);
  return localDate.toISOString().split("T")[0];
}

export default async function Page(props: any) {
  const cookieStore = cookies();
  const userIdCookie = cookieStore.get("userId");

  if (!userIdCookie?.value) {
    redirect("/login"); 
  }

  const currentUser = await prisma.user.findUnique({
    where: { id: userIdCookie.value },
    select: { role: true }
  });

  if (!currentUser || (currentUser.role !== 'admin' && currentUser.role !== 'superadmin')) {
      redirect("/login");
  }

  const userRole = currentUser.role; 
  
  const searchParams = props?.searchParams ?? {};
  
  // --- PARAMETER FILTER UTAMA ---
  const mode = searchParams.mode || "bulanan";
  const tanggalStr = searchParams.tanggal || getTodayWIB();
  const bulan = Number(searchParams?.bulan) || new Date().getMonth() + 1;
  const tahun = Number(searchParams?.tahun) || new Date().getFullYear();
  const nama = Array.isArray(searchParams?.nama) ? searchParams.nama[0] : searchParams?.nama;
  
  // --- PARAMETER FILTER TAMBAHAN (Area, Dept, Status) ---
  const areaId = searchParams.areaId ? Number(searchParams.areaId) : undefined;
  const deptId = searchParams.deptId ? Number(searchParams.deptId) : undefined;
  const statusParam = searchParams.status;

  const page = Number(searchParams?.page) || 1;
  const limitParam = searchParams?.limit;
  const limit = limitParam === "semua" ? undefined : Number(limitParam) || 20;
  const skip = limit ? (page - 1) * limit : undefined;

  const WIB_OFFSET = 7 * 60 * 60 * 1000;

  let startDate: Date;
  let endDate: Date;
  let titleDate: string;

  if (mode === "harian") {
    const [y, m, d] = tanggalStr.split("-").map(Number);
    const utcStart = Date.UTC(y, m - 1, d, 0, 0, 0);
    const utcEnd = Date.UTC(y, m - 1, d, 23, 59, 59);

    startDate = new Date(utcStart - WIB_OFFSET);
    endDate = new Date(utcEnd - WIB_OFFSET);

    titleDate = new Date(y, m - 1, d).toLocaleDateString("id-ID", {
      weekday: "long", day: "numeric", month: "long", year: "numeric",
    });
  } else {
    const startOfMonthUTC = Date.UTC(tahun, bulan - 1, 1, 0, 0, 0);
    const endOfMonthUTC = Date.UTC(tahun, bulan, 0, 23, 59, 59);

    startDate = new Date(startOfMonthUTC - WIB_OFFSET);
    endDate = new Date(endOfMonthUTC - WIB_OFFSET);

    titleDate = new Date(tahun, bulan - 1, 1).toLocaleDateString("id-ID", {
      month: "long", year: "numeric",
    });
  }

  try {
    // --- BUILD WHERE CLAUSE ---
    const whereClause: Prisma.AttendanceWhereInput = {
      date: { gte: startDate, lte: endDate },
      // Filter Nama User
      user: {
        name: nama ? { contains: nama, mode: "insensitive" } : undefined,
        
        // 1. FILTER AREA (Berdasarkan Area Karyawan)
        areaId: areaId, 

        // 2. FILTER DEPARTEMEN (Berdasarkan Jabatan -> Department)
        jabatan: deptId ? {
            departmentId: deptId
        } : undefined
      },
    };

    // 3. FILTER STATUS
    if (statusParam) {
        if (statusParam === "terlambat") {
            // Logika khusus terlambat (Status Hadir + lateMinutes > 0)
            whereClause.status = "hadir";
            whereClause.lateMinutes = { gt: 0 };
        } else {
            // Status normal (hadir, sakit, izin, alpha)
            // Casting ke enum yang valid agar TS tidak protes
            whereClause.status = statusParam as any;
        }
    }

    const totalData = await prisma.attendance.count({ where: whereClause });
    const totalPages = limit ? Math.ceil(totalData / limit) : 1;

    const absensi = await prisma.attendance.findMany({
      where: whereClause,
      include: { 
          user: {
              include: {
                  jabatan: { include: { department: true } }, // Include Dept buat ditampilkan (opsional)
                  area: true
              }
          } 
      },
      orderBy: { checkIn: "desc" }, // Urutkan yang baru absen paling atas
      take: limit,
      skip: skip,
    });

    const transformedAbsensi: AttendanceData[] = absensi.map((a: AttendanceWithUser) => ({
      id: a.id,
      user: { 
          name: a.user.name,
          // Opsional: Tampilkan Nama Jabatan di tabel jika mau
          jabatan: a.user.jabatan?.title 
      },
      date: a.date.toISOString(),
      checkIn: a.checkIn?.toISOString() ?? null,
      checkOut: a.checkOut?.toISOString() ?? null,
      status: a.status,
      photo: a.photo ?? null,
      lateMinutes: a.lateMinutes ?? 0,
      latitude: a.latitude,
      longitude: a.longitude
    }));

    return (
      <>
        <div style={styles.headerContainer}>
          <h1 className="page-title" style={{ margin: 0 }}>Kelola Absensi</h1>
          <div style={styles.dateBadge}>📅 {titleDate}</div>
        </div>

        <div className="dashboard-card">
          {/* Kirim props pagination ke FilterForm */}
          <FilterForm
            totalPages={totalPages}
            currentPage={page}
            totalData={totalData}
          />

          <div style={styles.actionContainer}>
            <GenerateAlphaButton />
            <ExportAbsensiPDF/>
          </div>

          <div style={{ marginTop: "20px" }}>
            <AbsensiTable absensi={transformedAbsensi} userRole={userRole} />
          </div>

          <div style={{ marginTop: "15px", textAlign: "right", fontSize: "13px", color: "#666" }}>
            Menampilkan {transformedAbsensi.length} dari {totalData} data
          </div>
        </div>
      </>
    );
  } catch (error) {
    console.error("Error fetching attendance data:", error);
    return (
        <div className="error-container">
          <h1>Error</h1>
          <p>Terjadi kesalahan saat mengambil data absensi</p>
        </div>
    );
  }
}

const styles = {
  headerContainer: {
    display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px",
  } as React.CSSProperties,
  dateBadge: {
    background: "#e0f2fe", padding: "6px", borderRadius: "20px", color: "#0284c7",
    fontWeight: "bold", fontSize: "14px", border: "1px solid #bae6fd", boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
  } as React.CSSProperties,
  actionContainer: {
    marginTop: "20px", display: "flex", gap: "10px", flexWrap: "wrap",
  } as React.CSSProperties,
};