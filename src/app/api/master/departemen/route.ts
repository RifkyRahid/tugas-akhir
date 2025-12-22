import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: Ambil semua departemen beserta jabatannya
export async function GET() {
  try {
    const departments = await prisma.department.findMany({
      include: {
        positions: true, // Ambil sekalian jabatannya biar frontend gampang
      },
      orderBy: {
        id: "asc",
      },
    });

    return NextResponse.json({ data: departments });
  } catch (error) {
    console.error("Gagal ambil departemen:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}

// POST: Tambah Departemen Baru
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name } = body;

    if (!name) {
      return NextResponse.json({ error: "Nama wajib diisi" }, { status: 400 });
    }

    const newDept = await prisma.department.create({
      data: { name },
    });

    return NextResponse.json({ message: "Berhasil", data: newDept });
  } catch (error) {
    return NextResponse.json(
      { error: "Gagal membuat departemen" },
      { status: 500 }
    );
  }
}