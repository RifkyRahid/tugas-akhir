import { Metadata } from 'next'
import { prisma } from "@/lib/prisma"
import AdminLayout from "@/components/AdminLayout"
import FilterForm from "@/components/FilterForm" 
import GenerateAlphaButton from "@/components/GenerateAlphaButton"
import ExportAbsensiPDF from "@/components/ExportAbsensiPDF"
import AbsensiTable from "@/components/AbsensiTable"
import "@/styles/absensi.css"

export const metadata: Metadata = {
  title: 'Admin | Kelola Absensi',
  description: 'Halaman kelola absensi karyawan'
}

type AttendanceData = {
  id: string
  user: { name: string }
  date: string
  checkIn: string | null
  checkOut: string | null
  status: string
  photo?: string | null
  lateMinutes?: number
}

export default async function Page(props: any) {
  const searchParams = props?.searchParams ?? {}

  const mode = searchParams.mode || "bulanan"; 
  
  const tanggalStr = searchParams.tanggal || new Date().toISOString().split('T')[0];
  const bulan = Number(searchParams?.bulan) || new Date().getMonth() + 1
  const tahun = Number(searchParams?.tahun) || new Date().getFullYear()
  const nama = Array.isArray(searchParams?.nama)
    ? searchParams.nama[0] ?? ""
    : searchParams?.nama ?? ""
  const limitParam = searchParams?.limit
  const limit = limitParam === "semua" ? undefined : Number(limitParam) || 20

  let startDate: Date;
  let endDate: Date;
  let titleDate: string;

  // Offset WIB (7 Jam dalam milidetik)
  const WIB_OFFSET = 7 * 60 * 60 * 1000;

  if (mode === "harian") {
    // Mode Harian: Harus 00:00 WIB - 23:59 WIB
    const [y, m, d] = tanggalStr.split('-').map(Number);
    
    // 1. Buat UTC murni (00:00 UTC)
    const utcStart = Date.UTC(y, m - 1, d, 0, 0, 0);
    const utcEnd = Date.UTC(y, m - 1, d, 23, 59, 59);

    // 2. Geser mundur 7 jam agar setara dengan 00:00 WIB
    startDate = new Date(utcStart - WIB_OFFSET);
    endDate = new Date(utcEnd - WIB_OFFSET);
    
    // Format Judul (Tampilkan tanggal LOKAL yang dipilih user)
    // Kita buat object date baru tanpa offset untuk keperluan display judul saja
    const displayDate = new Date(y, m - 1, d);
    titleDate = displayDate.toLocaleDateString("id-ID", { 
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' 
    });
  } else {
    // Mode Bulanan: Tgl 1 00:00 WIB - Akhir Bulan 23:59 WIB
    const startOfMonthUTC = Date.UTC(tahun, bulan - 1, 1, 0, 0, 0);
    const endOfMonthUTC = Date.UTC(tahun, bulan, 0, 23, 59, 59);

    startDate = new Date(startOfMonthUTC - WIB_OFFSET);
    endDate = new Date(endOfMonthUTC - WIB_OFFSET);
    
    titleDate = new Date(tahun, bulan - 1, 1).toLocaleDateString("id-ID", { 
        month: 'long', year: 'numeric' 
    });
  }

  try {
    const absensi = await prisma.attendance.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate,
        },
        user: {
          name: {
            contains: nama,
            mode: "insensitive",
          },
        },
      },
      include: {
        user: true,
      },
      orderBy: {
        checkIn: "desc", // Urutkan berdasarkan jam masuk terbaru
      },
      take: limit,
    })

    const transformedAbsensi: AttendanceData[] = absensi.map((a) => ({
      id: a.id,
      user: { name: a.user.name },
      date: a.date.toISOString(),
      checkIn: a.checkIn?.toISOString() ?? null,
      checkOut: a.checkOut?.toISOString() ?? null,
      status: a.status,
      photo: a.photo ?? null,
      lateMinutes: a.lateMinutes ?? 0
    }))

    return (
      <AdminLayout>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px'}}>
            <h1 className="page-title" style={{margin:0}}>Kelola Absensi</h1>
            <div style={{background:'#e0f2fe', padding:'5px 15px', borderRadius:'20px', color:'#0284c7', fontWeight:'bold', fontSize:'14px', border:'1px solid #bae6fd'}}>
                📅 {titleDate}
            </div>
        </div>

        <div className="dashboard-card">
          <FilterForm />

          <div className="action-buttons" style={{marginTop:'20px', display:'flex', gap:'10px', flexWrap:'wrap'}}>
            <GenerateAlphaButton />
            <ExportAbsensiPDF absensi={transformedAbsensi} />
          </div>

          <div style={{marginTop: '20px'}}>
            <AbsensiTable absensi={transformedAbsensi} />
          </div>
        </div>
      </AdminLayout>
    )
  } catch (error) {
    console.error('Error fetching attendance data:', error)
    return (
      <AdminLayout>
        <div className="error-container">
          <h1>Error</h1>
          <p>Terjadi kesalahan saat mengambil data absensi</p>
        </div>
      </AdminLayout>
    )
  }
}