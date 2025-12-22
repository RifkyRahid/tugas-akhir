import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// PUT: Update Nama Jabatan
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = Number(params.id);
    const body = await req.json();
    const { title } = body;

    const updated = await prisma.position.update({
      where: { id },
      data: { title },
    });

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: "Gagal update" }, { status: 500 });
  }
}

// DELETE: Hapus Jabatan
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = Number(params.id);

    // Cek apakah ada user yang pakai jabatan ini?
    const userCount = await prisma.user.count({ where: { positionId: id } });
    if (userCount > 0) {
        return NextResponse.json(
            { error: "Tidak bisa dihapus. Masih ada karyawan dengan jabatan ini." },
            { status: 400 }
        );
    }

    await prisma.position.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Terhapus" });
  } catch (error) {
    return NextResponse.json({ error: "Gagal hapus" }, { status: 500 });
  }
}