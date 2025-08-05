import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, latitude, longitude, radius } = body;

    if (!name || !latitude || !longitude || !radius) {
      return NextResponse.json({ error: "Semua field wajib diisi" }, { status: 400 });
    }

    const area = await prisma.attendanceArea.create({
      data: {
        name,
        latitude,
        longitude,
        radius,
      },
    });

    return NextResponse.json(area, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}
