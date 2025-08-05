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
}

export default async function Page(props: any) {
  const searchParams = props?.searchParams ?? {}

  const bulan = Number(searchParams?.bulan) || new Date().getMonth() + 1
  const tahun = Number(searchParams?.tahun) || new Date().getFullYear()
  const nama = Array.isArray(searchParams?.nama)
    ? searchParams.nama[0] ?? ""
    : searchParams?.nama ?? ""
  const limitParam = searchParams?.limit
  const limit = limitParam === "semua" ? undefined : Number(limitParam) || 10

  // Hitung rentang tanggal
  const startDate = new Date(Date.UTC(tahun, bulan - 1, 1))
  const endDate = new Date(Date.UTC(tahun, bulan, 0, 23, 59, 59))

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
        date: "desc",
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
    }))

    return (
      <AdminLayout>
        <h1 className="page-title">Kelola Absensi</h1>
        <div className="dashboard-card">
          <div className="action-buttons">
            <GenerateAlphaButton />
            <ExportAbsensiPDF absensi={transformedAbsensi} />
          </div>

          <FilterForm />
          <AbsensiTable absensi={transformedAbsensi} />
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
