import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const jenis = searchParams.get("jenis");   // izin / sakit / cuti
  const status = searchParams.get("status"); // pending / disetujui / ditolak

  const whereClause: any = {};

  if (jenis) {
    whereClause.type = jenis;
  }

  if (status) {
    whereClause.status = status;
  }

  try {
    const pengajuan = await prisma.leaveRequest.findMany({
      where: whereClause,
      include: {
        user: {
          select: { name: true , role: true},
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(pengajuan);
  } catch (error) {
    console.error("Gagal mengambil data pengajuan (admin):", error);
    return NextResponse.json({ error: "Gagal mengambil data" }, { status: 500 });
  }
}
