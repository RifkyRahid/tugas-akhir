import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

// PUT: Edit Admin
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await req.json();

    // Pastikan user yang diedit adalah admin
    const targetUser = await prisma.user.findUnique({ where: { id } });
    if (!targetUser || targetUser.role !== 'admin') {
       return NextResponse.json({ message: "User tidak ditemukan atau bukan admin" }, { status: 404 });
    }

    const updatedAdmin = await prisma.user.update({
      where: { id },
      data: {
        name: body.name,
        email: body.email,
        password: body.password, // Update password jika dikirim
      },
    });

    return NextResponse.json(updatedAdmin);
  } catch (error) {
    return NextResponse.json({ message: "Gagal update admin" }, { status: 500 });
  }
}

// DELETE: Hapus Admin
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Cek apakah admin tinggal 1? (Opsional, untuk mencegah sistem tanpa admin)
    const count = await prisma.user.count({ where: { role: "admin" } });
    if (count <= 1) {
        return NextResponse.json({ message: "Tidak bisa menghapus admin terakhir!" }, { status: 400 });
    }

    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Admin berhasil dihapus" });
  } catch (error) {
    return NextResponse.json({ message: "Gagal menghapus admin" }, { status: 500 });
  }
}