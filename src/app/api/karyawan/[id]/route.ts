import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// === UPDATE USER (PUT) ===
// Tidak ada perubahan logika, hanya perapihan tipe data
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  const body = await req.json();

  try {
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        name: body.name,
        email: body.email,
        password: body.password,
        position: body.position,
        joinDate: body.joinDate ? new Date(body.joinDate) : undefined,
        areaId: body.areaId ? Number(body.areaId) : null,
      },
    });
    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Gagal update user:", error);
    return NextResponse.json({ error: "Gagal update user" }, { status: 500 });
  }
}

// === HARD DELETE USER (DELETE) ===
// Menghapus User beserta seluruh data Absensi dan Cuti miliknya
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  try {
    // Menggunakan Transaction agar semua terhapus atau tidak sama sekali (aman)
    await prisma.$transaction(async (tx) => {
      // 1. Hapus semua data Absensi milik user ini
      await tx.attendance.deleteMany({
        where: { userId: id },
      });

      // 2. Hapus semua data Pengajuan Cuti (LeaveRequest) milik user ini
      // (Wajib dihapus juga karena ada relasi ke User)
      await tx.leaveRequest.deleteMany({
        where: { userId: id },
      });

      // 3. Terakhir, baru hapus User-nya
      await tx.user.delete({
        where: { id },
      });
    });

    return NextResponse.json({ message: "User dan data terkait berhasil dihapus permanen" });
  } catch (error) {
    console.error("Gagal hapus user (Hard Delete):", error);
    // Cek error spesifik Prisma jika perlu debug lebih lanjut
    return NextResponse.json(
      { error: "Gagal menghapus user. Pastikan tidak ada data lain yang mengunci." },
      { status: 500 }
    );
  }
}