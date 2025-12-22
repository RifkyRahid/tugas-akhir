import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await req.json();
    const { status, checkIn, checkOut } = body;

    // Siapkan object penampung data yang akan diupdate
    const updateData: any = {};

    // --- LOGIKA 1: Update Status (Jika status dikirim) ---
    if (status) {
      const validStatuses = ["hadir", "sakit", "izin", "cuti", "alpha"];
      if (!validStatuses.includes(status)) {
        return NextResponse.json(
          { message: "Status tidak valid" },
          { status: 400 }
        );
      }
      updateData.status = status;
    }

    // --- LOGIKA 2: Update Waktu (Jika checkIn/checkOut dikirim) ---
    if (checkIn) {
      updateData.checkIn = new Date(checkIn);
    }
    
    // checkOut bisa null (untuk reset jam pulang), jadi cek undefined
    if (checkOut !== undefined) {
      updateData.checkOut = checkOut ? new Date(checkOut) : null;
    }

    // Validasi Akhir: Pastikan ada data yang mau diupdate
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { message: "Tidak ada data yang dikirim untuk diperbarui" },
        { status: 400 }
      );
    }

    // Update database
    const updated = await prisma.attendance.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      message: "Data absensi berhasil diperbarui",
      data: updated,
    });

  } catch (error) {
    console.error("Error update absensi:", error);
    return NextResponse.json(
      { message: "Gagal memperbarui data" },
      { status: 500 }
    );
  }
}