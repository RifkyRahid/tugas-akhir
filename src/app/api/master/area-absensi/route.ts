import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Tambah area absensi baru
export async function POST(req: NextRequest) {
  try {
    const { name, latitude, longitude, radius, alamat } = await req.json();

    if (!latitude || !longitude || !radius) {
      return NextResponse.json({ error: "Data tidak lengkap" }, { status: 400 });
    }

    const newArea = await prisma.attendanceArea.create({
      data: {
        name: name || "Area Absensi",
        latitude,
        longitude,
        radius,
        // kalau kamu mau simpan alamat ke DB, pastikan schema ada field alamat:String?
        // kalau belum, sementara bisa diabaikan
        ...(alamat ? { alamat } : {}),
      },
    });

    return NextResponse.json({ success: true, data: newArea });
  } catch (error) {
    console.error("Gagal simpan area absensi", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

// Ambil semua area absensi
export async function GET() {
  try {
    const areas = await prisma.attendanceArea.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: {
          select: { users: true }, // hitung jumlah user
        },
      },
    });

    if (!areas || areas.length === 0) {
      return NextResponse.json({ error: "Belum ada area" }, { status: 404 });
    }

    const formatted = areas.map((a) => ({
      id: a.id,
      name: a.name,
      latitude: a.latitude,
      longitude: a.longitude,
      radius: a.radius,
      alamat: a.alamat || "-",              // <== pastikan ambil field alamat
      jumlahPersonalia: a._count.users,
      createdAt: a.createdAt,
    }));

    return NextResponse.json({ success: true, data: formatted });
  } catch (error) {
    console.error("Gagal ambil area absensi", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

