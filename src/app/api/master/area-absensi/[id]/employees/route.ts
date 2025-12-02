import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET: Ambil daftar karyawan yang SUDAH ada di area ini
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const areaId = parseInt(params.id);

    // Cek apakah area ada
    const areaCheck = await prisma.attendanceArea.findUnique({
      where: { id: areaId },
      select: { name: true }
    });

    if (!areaCheck) {
      return NextResponse.json({ error: "Area tidak ditemukan" }, { status: 404 });
    }

    const employees = await prisma.user.findMany({
      where: {
        areaId: areaId,
        isActive: true, // Hanya ambil yang aktif
        role: "karyawan"
      },
      select: {
        id: true,
        name: true,
        position: true,
        email: true,
        // Kita tidak perlu ambil area lagi karena sudah pasti di area ini
      },
      orderBy: {
        name: 'asc'
      }
    });

    return NextResponse.json({ 
      data: employees,
      areaName: areaCheck.name
    });

  } catch (error) {
    console.error("Error fetching employees:", error);
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}

// DELETE: Keluarkan karyawan dari area ini (Set areaId jadi null)
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "User ID diperlukan" }, { status: 400 });
    }

    // Update user: Hapus areaId (set null)
    await prisma.user.update({
      where: { id: userId },
      data: {
        areaId: null
      }
    });

    return NextResponse.json({ message: "Karyawan berhasil dikeluarkan dari area" });
  } catch (error) {
    console.error("Error removing employee:", error);
    return NextResponse.json({ error: "Gagal menghapus karyawan" }, { status: 500 });
  }
}