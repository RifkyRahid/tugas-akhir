import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";  // pastikan path prisma kamu benar

export async function GET(req: NextRequest) {
  try {
    // Ambil parameter bulan dan tahun
    const { searchParams } = new URL(req.url);
    const bulan = parseInt(searchParams.get("bulan") || "");
    const tahun = parseInt(searchParams.get("tahun") || "");

    // Validasi basic
    if (!bulan || !tahun) {
      return NextResponse.json({ error: "Parameter bulan dan tahun wajib diisi." }, { status: 400 });
    }

    // Ambil userId dari cookie
    const userId = req.cookies.get("userId")?.value;
    if (!userId) {
      return NextResponse.json({ error: "User belum login." }, { status: 401 });
    }

    // Hitung rentang tanggal bulan tsb
    const startDate = new Date(tahun, bulan - 1, 1);
    const endDate = new Date(tahun, bulan, 0, 23, 59, 59, 999);

    // Query absensi hanya untuk user yang login
    const attendances = await prisma.attendance.findMany({
      where: {
        userId: userId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: {
        date: "desc",
      },
    });

    // Olah data: hitung statusDisplay berdasarkan lateMinutes
    const formatted = attendances.map((item) => ({
      id: item.id,
      date: item.date,
      checkIn: item.checkIn,
      checkOut: item.checkOut,
      status: item.status === "hadir" 
        ? (item.lateMinutes && item.lateMinutes > 0 ? "terlambat" : "hadir")
        : item.status,  // selain hadir biarin aja (izin, sakit, dll)
      keterangan: item.keterangan || "",
      lateMinutes: item.lateMinutes ?? null,
    }));

    return NextResponse.json(formatted);
  } catch (err) {
    console.error("Error di riwayat bulanan: ", err);
    return NextResponse.json({ error: "Terjadi kesalahan server." }, { status: 500 });
  }
}
