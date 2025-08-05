// /src/app/api/absensi/status/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getTodayRange } from "@/lib/date"; // helper untuk dapatkan awal-akhir hari ini

export async function GET(req: NextRequest) {
  const userId = req.cookies.get("userId")?.value;

  if (!userId) {
    return NextResponse.json({ error: "User tidak ditemukan di cookie" }, { status: 401 });
  }

  const { startOfDay, endOfDay } = getTodayRange();

  const attendance = await prisma.attendance.findFirst({
    where: {
      userId: (userId),
      checkIn: {
        gte: startOfDay,
        lte: endOfDay,
      },
    },
  });

  return NextResponse.json({ attendance });
}
