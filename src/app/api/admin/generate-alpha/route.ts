import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { startOfDay, endOfDay } from "date-fns";
import { AttendanceStatus } from "@prisma/client"; // ✅ Import enum

export async function POST() {
  try {
    const today = new Date();
    const start = startOfDay(today);
    const end = endOfDay(today);

    // Ambil semua karyawan
    const allKaryawan = await prisma.user.findMany({
      where: { role: "karyawan" },
      select: { id: true },
    });

    // Ambil semua user yang SUDAH absen hari ini
    const sudahAbsen = await prisma.attendance.findMany({
      where: {
        date: {
          gte: start,
          lte: end,
        },
      },
      select: { userId: true },
    });

    const userIdYangSudahAbsen = new Set(sudahAbsen.map((a) => a.userId));

    // Filter karyawan yang BELUM absen
    const belumAbsen = allKaryawan.filter(
      (karyawan) => !userIdYangSudahAbsen.has(karyawan.id)
    );

    // Buat data alpha
    const dataAlpha = belumAbsen.map((user) => ({
      userId: user.id,
      date: today,
      status: AttendanceStatus.alpha, // ✅ enum, bukan string
    }));

    // Simpan ke DB (bulk insert)
    if (dataAlpha.length > 0) {
      await prisma.attendance.createMany({
        data: dataAlpha,
      });
    }

    return NextResponse.json({
      message: "Berhasil generate alpha",
      totalAlpha: dataAlpha.length,
    });
  } catch (error) {
    console.error("Gagal generate alpha:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
