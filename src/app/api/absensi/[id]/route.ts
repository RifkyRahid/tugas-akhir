import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await req.json();
    const { status } = body;

    // Validasi input
    const validStatuses = ["hadir", "sakit", "izin", "cuti", "alpha"];
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        { message: "Status tidak valid" },
        { status: 400 }
      );
    }

    // Update database
    const updated = await prisma.attendance.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json({
      message: "Status berhasil diperbarui",
      data: updated,
    });
  } catch (error) {
    console.error("Error update status:", error);
    return NextResponse.json(
      { message: "Gagal memperbarui status" },
      { status: 500 }
    );
  }
}