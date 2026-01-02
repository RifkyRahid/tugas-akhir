import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const shifts = await prisma.shift.findMany({
      orderBy: { id: 'asc' }
    });
    return NextResponse.json(shifts);
  } catch (error) {
    return NextResponse.json({ error: "Gagal ambil data shift" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    // Validasi sederhana
    if (!body.name || !body.startTime || !body.endTime) {
        return NextResponse.json({ error: "Data tidak lengkap" }, { status: 400 });
    }

    const newShift = await prisma.shift.create({
      data: {
        name: body.name,
        startTime: body.startTime,
        endTime: body.endTime,
      },
    });
    return NextResponse.json(newShift, { status: 201 });
  } catch (error) {
    console.error("Error create shift:", error);
    return NextResponse.json({ error: "Gagal membuat shift (Cek Permission Sequence DB)" }, { status: 500 });
  }
}