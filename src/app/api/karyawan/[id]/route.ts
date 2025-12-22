import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// PUT: Update Data Karyawan (UPDATE FITUR CUTI)
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    // Tangkap field baru
    const { name, email, password, positionId, areaId, joinDate, birthDate, yearlyLeaveQuota, leaveUsedManual } = body;

    const updateData: any = {
      name,
      email,
      positionId: positionId ? Number(positionId) : null,
      areaId: areaId ? Number(areaId) : null,
      joinDate: new Date(joinDate),
      
      // --- UPDATE FIELD BARU ---
      birthDate: birthDate ? new Date(birthDate) : null,
      yearlyLeaveQuota: yearlyLeaveQuota ? Number(yearlyLeaveQuota) : 12,
      leaveUsedManual: leaveUsedManual ? Number(leaveUsedManual) : 0,
    };

    if (password && password.length > 0) {
      updateData.password = password; 
    }

    const updatedUser = await prisma.user.update({
      where: { id: params.id },
      data: updateData,
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Error update karyawan:", error);
    return NextResponse.json(
      { error: "Gagal mengupdate data karyawan" },
      { status: 500 }
    );
  }
}

// DELETE: Hapus Karyawan (Sama seperti kodemu sebelumnya)
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      return NextResponse.json({ error: "User tidak ditemukan" }, { status: 404 });
    }

    await prisma.$transaction([
      prisma.attendance.deleteMany({ where: { userId: id } }),
      prisma.leaveRequest.deleteMany({ where: { userId: id } }),
      prisma.attendanceCorrection.deleteMany({ where: { userId: id } }),
      prisma.user.delete({ where: { id } }),
    ]);

    return NextResponse.json({ message: "User berhasil dihapus total" });
  } catch (error) {
    console.error("Error delete karyawan:", error);
    return NextResponse.json(
      { error: "Gagal menghapus user" },
      { status: 500 }
    );
  }
}