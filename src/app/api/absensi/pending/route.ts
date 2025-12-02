import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const dateParam = searchParams.get("date"); // Format: YYYY-MM-DD
  const monthParam = searchParams.get("month"); // Format: M (1-12)
  const yearParam = searchParams.get("year");   // Format: YYYY

  // === MODE 1: REQUEST DATA PENDING HARIAN (DETAIL TABEL) ===
  if (dateParam) {
    const startDate = new Date(dateParam);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(dateParam);
    endDate.setHours(23, 59, 59, 999);

    const data = await prisma.attendance.findMany({
      where: {
        status: "pending",
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: { 
        user: {
          include: {
            area: true 
          }
        } 
      },
      orderBy: { checkIn: "asc" }, 
    });

    return NextResponse.json(data);
  }

  // === MODE 2: REQUEST REKAP BULANAN (UNTUK TITIK MERAH DI KALENDER) ===
  if (monthParam && yearParam) {
    const m = parseInt(monthParam);
    const y = parseInt(yearParam);

    // Filter range 1 bulan penuh
    const startMonth = new Date(y, m - 1, 1);
    const endMonth = new Date(y, m, 0, 23, 59, 59);

    const pendingList = await prisma.attendance.findMany({
      where: {
        status: "pending",
        date: {
          gte: startMonth,
          lte: endMonth
        }
      },
      select: { date: true }
    });

    // Grouping: Hitung jumlah pending per tanggal
    const summary: Record<string, number> = {};
    
    pendingList.forEach(item => {
      // --- PERBAIKAN DISINI ---
      // Waktu di DB tersimpan dalam UTC (Contoh: 29 Nov 00:00 WIB = 28 Nov 17:00 UTC)
      // Kita harus geser +7 jam (WIB) secara manual agar tanggalnya kembali ke 29 Nov
      const dbDate = new Date(item.date);
      const wibOffset = 7 * 60 * 60 * 1000; // 7 Jam dalam milidetik
      const localDate = new Date(dbDate.getTime() + wibOffset);
      
      // Ambil string YYYY-MM-DD dari waktu yang sudah digeser
      const dateKey = localDate.toISOString().split('T')[0];
      
      summary[dateKey] = (summary[dateKey] || 0) + 1;
    });

    return NextResponse.json({ summary });
  }

  return NextResponse.json({ error: "Parameter tidak lengkap" }, { status: 400 });
}