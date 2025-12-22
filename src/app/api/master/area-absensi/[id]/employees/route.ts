import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: Ambil daftar karyawan di Area tertentu
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const areaId = parseInt(params.id);

    // 1. Cek Area
    const area = await prisma.attendanceArea.findUnique({
      where: { id: areaId },
    });

    if (!area) {
      return NextResponse.json({ error: "Area tidak ditemukan" }, { status: 404 });
    }

    // 2. Ambil User dengan areaId ini + Include JABATAN
    const employees = await prisma.user.findMany({
      where: {
        areaId: areaId,
        isActive: true, // Hanya ambil yang aktif
      },
      select: {
        id: true,
        name: true,
        email: true,
        position: true, // Data lama (backup)
        jabatan: {      // DATA BARU: Relasi Jabatan
            select: { title: true }
        }
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json({
      areaName: area.name,
      data: employees,
    });
  } catch (error) {
    console.error("Error fetch employees in area:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}

// DELETE: Keluarkan Karyawan dari Area
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "User ID wajib ada" }, { status: 400 });
    }

    // Set areaId user menjadi NULL
    await prisma.user.update({
      where: { id: userId },
      data: { areaId: null },
    });

    return NextResponse.json({ message: "Berhasil dikeluarkan" });
  } catch (error) {
    return NextResponse.json({ error: "Gagal menghapus" }, { status: 500 });
  }
}