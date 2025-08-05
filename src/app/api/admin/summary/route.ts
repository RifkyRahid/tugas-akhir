import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { startOfDay, endOfDay } from "date-fns";

export async function GET() {
  try {
    const today = new Date();
    const start = startOfDay(today);
    const end = endOfDay(today);

    const [
      totalKaryawan,
      totalPengajuan,
      izinHariIni,
      absenMasukHariIni,
      pendingPengajuan, // ⬅️ Tambahan
    ] = await Promise.all([
      prisma.user.count({
        where: { role: "karyawan" },
      }),
      prisma.leaveRequest.count(),
      prisma.leaveRequest.count({
        where: {
          status: "disetujui",
          startDate: { lte: end },
          endDate: { gte: start },
        },
      }),
      prisma.attendance.count({
        where: {
          date: {
            gte: start,
            lte: end,
          },
        },
      }),
      prisma.leaveRequest.count({
        where: {
          status: "pending",
        },
      }),
    ]);

    return NextResponse.json({
      totalKaryawan,
      totalPengajuan,
      izinHariIni,
      absenMasukHariIni,
      pendingPengajuan, // ⬅️ Tambahan
    });
  } catch (error) {
    console.error("Gagal ambil data ringkasan:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
