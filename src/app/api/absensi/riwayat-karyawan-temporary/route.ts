import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = req.cookies.get("userId")?.value;
    const tanggal = searchParams.get("tanggal");

    if (!userId || !tanggal) {
      return NextResponse.json(
        { error: "Parameter userId dan tanggal wajib diisi." },
        { status: 400 }
      );
    }

    const attendance = await prisma.attendance.findFirst({
      where: {
        userId: userId,
        date: new Date(tanggal),
      },
      select: {
        checkIn: true,
        checkOut: true,
      },
    });

    if (!attendance) {
      return NextResponse.json(null); // artinya tidak absen hari itu
    }

    // Ubah jam ke format HH:MM:SS
    const formatTime = (date: Date | null) => {
      return date ? date.toTimeString().split(" ")[0] : null;
    };

    return NextResponse.json({
      clockIn: formatTime(attendance.checkIn),
      clockOut: formatTime(attendance.checkOut),
    });
  } catch (error) {
    console.error("Gagal ambil riwayat absensi:", error);
    return NextResponse.json({ error: "Terjadi kesalahan." }, { status: 500 });
  }
}
