import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { cookies } from "next/headers";

// ✅ GET untuk ambil data pengajuan
export async function GET() {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const requests = await prisma.leaveRequest.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(requests);
  } catch (error) {
    console.error("Error saat mengambil data pengajuan:", error);
    return NextResponse.json({ message: "Terjadi kesalahan" }, { status: 500 });
  }
}


// ✅ POST untuk buat pengajuan
export async function POST(req: Request) {
  try {
    const { type, startDate, endDate, reason } = await req.json();

    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const allowedTypes = ["cuti", "sakit", "izin"];
    if (!allowedTypes.includes(type)) {
      return NextResponse.json(
        { message: "Jenis cuti tidak valid" },
        { status: 400 }
      );
    }

    // --- LIMIT CUTI TAHUNAN ---
    if (type === "cuti") {
      const tahunIni = new Date().getFullYear();
      // Ambil semua pengajuan cuti yang sudah disetujui tahun ini
      const cutiTahunIni = await prisma.leaveRequest.findMany({
        where: {
          userId,
          type: "cuti",
          status: "disetujui",
          startDate: {
            gte: new Date(`${tahunIni}-01-01`),
            lte: new Date(`${tahunIni}-12-31`),
          },
        },
      });

      // Hitung total hari cuti yang sudah diambil
      let totalHariCuti = 0;
      for (const pengajuan of cutiTahunIni) {
        const start = new Date(pengajuan.startDate);
        const end = new Date(pengajuan.endDate);
        totalHariCuti += Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      }

      // Hitung hari cuti yang diajukan sekarang
      const hariDiajukan =
        Math.floor((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)) + 1;

      if (totalHariCuti + hariDiajukan > 12) {
        return NextResponse.json(
          { message: "Limit cuti tahunan sudah tercapai (maksimal 12 hari)." },
          { status: 400 }
        );
      }
    }
    // --- END LIMIT CUTI TAHUNAN ---

    const pengajuan = await prisma.leaveRequest.create({
      data: {
        userId,
        type,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        reason,
        status: "pending",
      },
    });

    return NextResponse.json(pengajuan);
  } catch (error) {
    console.error("Error saat membuat pengajuan cuti:", error);
    return NextResponse.json({ message: "Terjadi kesalahan" }, { status: 500 });
  }
}
