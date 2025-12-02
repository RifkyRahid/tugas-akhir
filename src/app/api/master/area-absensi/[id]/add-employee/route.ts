import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET: Cari karyawan untuk ditambahkan
// Filter: Hanya tampilkan yang BELUM punya area (areaId: null)
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") || "";

  // Cari user: Role karyawan, Aktif, Nama cocok, DAN areaId NULL (belum punya lokasi)
  const users = await prisma.user.findMany({
    where: {
      role: "karyawan",
      isActive: true,
      areaId: null, // <--- INI FILTERNYA (Sesuai request awal: jangan dimunculkan jika sudah ada)
      name: {
        contains: query,
        mode: "insensitive",
      },
    },
    select: {
      id: true,
      name: true,
      email: true,
      position: true,
    },
    take: 5, 
  });

  return NextResponse.json({ data: users });
}

// POST: Masukkan karyawan ke Area ini (STRICT MODE)
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const areaId = parseInt(params.id);
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json({ error: "User ID wajib diisi" }, { status: 400 });
    }

    // 1. Cek dulu status user saat ini (Strict Check)
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      include: { area: true } // Include data area dia sekarang
    });

    if (!existingUser) {
      return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 });
    }

    // LOGIKA STRICT: Jika user sudah punya area, tolak request.
    if (existingUser.areaId !== null && existingUser.areaId !== areaId) {
      return NextResponse.json({ 
        error: `Gagal! ${existingUser.name} sudah terdaftar di area "${existingUser.area?.name}". Hapus dulu dari sana jika ingin memindahkan.` 
      }, { status: 409 }); // 409 Conflict
    }

    // Jika user sudah di area ini (double click prevention)
    if (existingUser.areaId === areaId) {
       return NextResponse.json({ message: "User sudah berada di area ini" });
    }

    // 2. Eksekusi Update jika lolos validasi
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        areaId: areaId
      }
    });

    return NextResponse.json({ message: "Berhasil menambahkan karyawan", data: updatedUser });

  } catch (error) {
    console.error("Error adding employee:", error);
    return NextResponse.json({ error: "Gagal menambahkan karyawan" }, { status: 500 });
  }
}