import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // Pastikan import prisma pakai kurung kurawal {} jika di lib/prisma export const
import { Prisma } from "@prisma/client";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const jenis = searchParams.get("jenis");
  const status = searchParams.get("status");

  // Gunakan Tipe dari Prisma supaya auto-complete jalan
  const whereClause: Prisma.LeaveRequestWhereInput = {};

  if (jenis) {
    // Casting agar Prisma tau ini enum yang valid
    whereClause.type = jenis as any; 
  }

  if (status) {
    whereClause.status = status as any;
  }

  try {
    const pengajuan = await prisma.leaveRequest.findMany({
      where: whereClause,
      include: {
        user: {
          select: { name: true, role: true },
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