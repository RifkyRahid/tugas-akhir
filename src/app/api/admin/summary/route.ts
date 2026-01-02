import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { startOfDay, endOfDay, subDays, format } from "date-fns";
import { id } from "date-fns/locale";

export const dynamic = 'force-dynamic'; 
export const revalidate = 0;

export async function GET() {
  try {
    const today = new Date();
    const start = startOfDay(today);
    const end = endOfDay(today);

    // 1. DATA SUMMARY CARDS
    const [
      totalKaryawan,
      terlambatHariIni,
      izinHariIni,
      absenMasukHariIni,
      pendingPengajuan,
    ] = await Promise.all([
      prisma.user.count({ where: { role: "karyawan", isActive: true } }),
      prisma.attendance.count({ where: { date: { gte: start, lte: end }, lateMinutes: { gt: 0 } } }),
      prisma.leaveRequest.count({ where: { status: "disetujui", startDate: { lte: end }, endDate: { gte: start } } }),
      prisma.attendance.count({ where: { date: { gte: start, lte: end } } }),
      prisma.leaveRequest.count({ where: { status: "pending" } }),
    ]);

    // 2. DATA CHART
    const chartData = [];
    for (let i = 6; i >= 0; i--) {
        const d = subDays(today, i);
        const dayStart = startOfDay(d);
        const dayEnd = endOfDay(d);
        
        const [hadir, telat, alpha] = await Promise.all([
            prisma.attendance.count({ where: { date: { gte: dayStart, lte: dayEnd }, status: 'hadir' } }),
            prisma.attendance.count({ where: { date: { gte: dayStart, lte: dayEnd }, lateMinutes: { gt: 0 } } }),
            prisma.attendance.count({ where: { date: { gte: dayStart, lte: dayEnd }, status: 'alpha' } }),
        ]);

        chartData.push({
            date: format(d, 'dd MMM', { locale: id }),
            hadir,
            telat,
            alpha
        });
    }

    // 3. RECENT LOGS (MODIFIED: Tanpa updatedAt)
    const recentLogs = await prisma.attendance.findMany({
        take: 5,
        // Kita urutkan berdasarkan checkIn saja (karena updatedAt tidak ada)
        orderBy: { checkIn: 'desc' }, 
        include: { user: { select: { name: true } } }
    });

    const formattedLogs = recentLogs.map((log: any) => {
        // Logika: Kalau ada checkOut, anggap statusnya "Absen Pulang"
        // Kalau belum ada checkOut, berarti baru "Absen Masuk"
        const isCheckout = !!log.checkOut; 
        
        // Gunakan waktu checkout jika ada, jika tidak gunakan checkin
        const timeRef = log.checkOut || log.checkIn || new Date();

        return {
            id: log.id,
            name: log.user ? log.user.name : "Karyawan",
            action: isCheckout ? "Absen Pulang" : "Absen Masuk",
            time: format(new Date(timeRef), "HH:mm"),
            status: log.status
        };
    });

    return NextResponse.json({
      summary: { totalKaryawan, terlambatHariIni, izinHariIni, absenMasukHariIni, pendingPengajuan },
      chartData,
      recentLogs: formattedLogs
    });

  } catch (error) {
    console.error("Gagal ambil data dashboard:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}