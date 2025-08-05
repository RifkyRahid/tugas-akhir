// src/app/api/absensi/riwayat/route.ts
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  const userId = req.cookies.get("userId")?.value;
  console.log("userId dari cookie:", userId);

  if (!userId) {
    return NextResponse.json({ error: "User belum login" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const tanggal = searchParams.get("tanggal"); // format: "2025-05-27"
  console.log("Tanggal dari query:", tanggal);

  if (!tanggal) {
    return NextResponse.json(
      { error: "Tanggal tidak ditemukan" },
      { status: 400 }
    );
  }

  const awalHari = new Date(`${tanggal}T00:00:00`);
  const akhirHari = new Date(`${tanggal}T23:59:59.999`);

  const data = await prisma.attendance.findMany({
    where: {
      userId: userId,
      date: {
        gte: awalHari,
        lte: akhirHari,
      },
    },
    orderBy: { date: "desc" },
  });

  console.log(`Jumlah data untuk ${tanggal}:`, data.length);
  return NextResponse.json(data);
}
