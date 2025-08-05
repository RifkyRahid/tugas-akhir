import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET() {
  const cookieStore = await cookies();
  const userId = cookieStore.get("userId")?.value;
  if (!userId) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const tahunIni = new Date().getFullYear();
  const cutiTahunIni = await prisma.leaveRequest.findMany({
    where: {
      userId,
      type: "cuti",
      status: "disetujui",
      startDate: {
        gte: new Date(`${tahunIni}-01-01`),
        lte: new Date(`${tahunIni}-12-31`),
      },
    },
  });

  let totalHariCuti = 0;
  for (const pengajuan of cutiTahunIni) {
    const start = new Date(pengajuan.startDate);
    const end = new Date(pengajuan.endDate);
    totalHariCuti += Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  }

  const sisaCuti = 12 - totalHariCuti;
  return NextResponse.json({ sisaCuti });
}