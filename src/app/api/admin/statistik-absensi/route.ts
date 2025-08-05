import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { subDays, format, startOfDay, endOfDay } from "date-fns";

export async function GET() {
  try {
    const today = new Date();

    // Buat array 7 hari terakhir
    const dates = Array.from({ length: 7 }, (_, i) => {
      const date = subDays(today, 6 - i); // dari 6 hari lalu ke hari ini
      return {
        tanggal: format(date, "yyyy-MM-dd"),
        start: startOfDay(date),
        end: endOfDay(date),
      };
    });

    const result = await Promise.all(
      dates.map(async ({ tanggal, start, end }) => {
        const jumlah = await prisma.attendance.count({
          where: {
            date: {
              gte: start,
              lte: end,
            },
          },
        });

        return { tanggal, jumlah };
      })
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error("Gagal ambil data statistik absensi:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
