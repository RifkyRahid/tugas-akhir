import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const { latitude, longitude, radius } = await req.json();

    // Validasi data sederhana
    if (!latitude || !longitude || !radius) {
      return NextResponse.json({ error: "Data tidak lengkap" }, { status: 400 });
    }

    // Hapus semua area sebelumnya (karena skenario 1: hanya 1 area aktif)
    await prisma.attendanceArea.deleteMany({});

    // Simpan area baru
    const newArea = await prisma.attendanceArea.create({
      data: {
        name: "Area Absensi", // Ganti dengan nama yang sesuai jika perlu
        latitude,
        longitude,
        radius,
      },
    });

    return NextResponse.json({ success: true, data: newArea });
  } catch (error) {
    console.error("Gagal simpan area absensi", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const latestArea = await prisma.attendanceArea.findFirst({
      orderBy: { createdAt: 'desc' },
    });

    if (!latestArea) {
      return NextResponse.json({ error: "Belum ada area" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: latestArea });
  } catch (error) {
    console.error("Gagal ambil area absensi", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
