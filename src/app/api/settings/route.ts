import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: Ambil pengaturan saat ini (untuk ditampilkan di form admin)
export async function GET() {
  // Ambil config pertama, jika tidak ada buat default
  let config = await prisma.appConfig.findFirst();

  if (!config) {
    config = await prisma.appConfig.create({
      data: {
        startWorkTime: "09:00",
        endWorkTime: "17:00"
      }
    });
  }

  return NextResponse.json(config);
}

// POST: Update pengaturan
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { startWorkTime, endWorkTime } = body;

    // Validasi sederhana
    if (!startWorkTime || !endWorkTime) {
      return NextResponse.json({ message: "Jam harus diisi" }, { status: 400 });
    }

    // Upsert: Update kalau ada, Create kalau belum ada
    // Kita asumsikan ID 1 selalu dipakai untuk config global
    const config = await prisma.appConfig.findFirst();

    if (config) {
      await prisma.appConfig.update({
        where: { id: config.id },
        data: { startWorkTime, endWorkTime }
      });
    } else {
      await prisma.appConfig.create({
        data: { startWorkTime, endWorkTime }
      });
    }

    return NextResponse.json({ message: "Pengaturan berhasil disimpan" });
  } catch (error) {
    console.error("Error saving settings:", error);
    return NextResponse.json({ message: "Gagal menyimpan pengaturan" }, { status: 500 });
  }
}