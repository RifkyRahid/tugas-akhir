import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// POST: Tambah Jabatan Baru
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, departmentId } = body;

    if (!title || !departmentId) {
      return NextResponse.json(
        { error: "Nama jabatan dan Departemen wajib diisi" },
        { status: 400 }
      );
    }

    const newPos = await prisma.position.create({
      data: {
        title,
        departmentId: Number(departmentId),
      },
    });

    return NextResponse.json({ message: "Berhasil", data: newPos });
  } catch (error) {
    return NextResponse.json(
      { error: "Gagal membuat jabatan" },
      { status: 500 }
    );
  }
}