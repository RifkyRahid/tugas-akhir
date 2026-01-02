import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// PATCH: Edit Shift
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    const body = await req.json();
    const { name, startTime, endTime } = body;

    const updatedShift = await prisma.shift.update({
      where: { id },
      data: { name, startTime, endTime },
    });

    return NextResponse.json(updatedShift);
  } catch (error) {
    return NextResponse.json({ error: "Gagal update shift" }, { status: 500 });
  }
}

// DELETE: Hapus Shift
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);

    // Validasi: Jangan hapus kalau sedang dipakai user atau jadwal
    const isUsed = await prisma.user.findFirst({ where: { shiftId: id } });
    const isScheduled = await prisma.employeeSchedule.findFirst({ where: { shiftId: id } });

    if (isUsed || isScheduled) {
        return NextResponse.json(
            { error: "Shift sedang digunakan user/jadwal, tidak bisa dihapus." }, 
            { status: 400 }
        );
    }

    await prisma.shift.delete({ where: { id } });
    return NextResponse.json({ message: "Shift berhasil dihapus" });
  } catch (error) {
    return NextResponse.json({ error: "Gagal menghapus shift" }, { status: 500 });
  }
}