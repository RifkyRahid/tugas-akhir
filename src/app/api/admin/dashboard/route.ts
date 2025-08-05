// GET /api/admin/dashboard
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  const [totalKaryawan, totalPengajuan, totalHadirHariIni, totalIzinHariIni] = await Promise.all([
    prisma.user.count({ where: { role: "karyawan" } }),
    prisma.leaveRequest.count(),
    prisma.attendance.count({
      where: {
        checkIn: {
          gte: new Date(new Date().setHours(0, 0, 0, 0)),
        },
      },
    }),
    prisma.leaveRequest.count({
      where: {
        startDate: {
          lte: new Date(),
        },
        endDate: {
          gte: new Date(),
        },
        status: "disetujui",
      },
    }),
  ]);

  return NextResponse.json({
    totalKaryawan,
    totalPengajuan,
    totalHadirHariIni,
    totalIzinHariIni,
  });
}
