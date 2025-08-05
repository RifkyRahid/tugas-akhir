import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { startOfMonth, endOfMonth } from "date-fns";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const bulan = Number(searchParams.get("bulan"));
  const tahun = Number(searchParams.get("tahun"));

  if (!bulan || !tahun) {
    return NextResponse.json({ error: "Bulan dan tahun wajib diisi." }, { status: 400 });
  }

  const startDate = startOfMonth(new Date(tahun, bulan - 1));
  const endDate = endOfMonth(startDate);

  try {
    const users = await prisma.user.findMany({
      where: { role: "karyawan" },
      select: { id: true, name: true },
    });

    const result = await Promise.all(
      users.map(async (user) => {
        const absensi = await prisma.attendance.findMany({
          where: {
            userId: user.id,
            date: {
              gte: startDate,
              lte: endDate,
            },
          },
        });

        let hadir = 0;
        let izin = 0;
        let sakit = 0;
        let alpha = 0;

        for (const absen of absensi) {
          if (absen.status === "hadir") hadir++;
          else if (absen.status === "izin") izin++;
          else if (absen.status === "sakit") sakit++;
          else if (absen.status === "alpha") alpha++;
        }

        return {
          nama: user.name,
          hadir,
          izin,
          sakit,
          alpha,
        };
      })
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("Gagal ambil data rekap bulanan:", error);
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}
