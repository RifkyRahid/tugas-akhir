import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { id, status } = await req.json();

    if (!["disetujui", "ditolak"].includes(status)) {
      return NextResponse.json({ message: "Status tidak valid" }, { status: 400 });
    }

    const updated = await prisma.leaveRequest.update({
      where: { id },
      data: { status },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Gagal memverifikasi pengajuan:", error);
    return NextResponse.json({ message: "Terjadi kesalahan" }, { status: 500 });
  }
}
