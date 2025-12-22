import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // Sesuaikan path import prisma Anda
import { cookies } from "next/headers";
import fs from "fs";
import path from "path";

// ✅ GET: Ambil Riwayat Pengajuan
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

// ✅ POST: Buat Pengajuan Baru (Support File Upload)
export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // 1. GANTI req.json() MENJADI req.formData()
    const formData = await req.formData();
    
    // 2. Ambil data dari formData
    const type = formData.get("type") as string;
    const startDateStr = formData.get("startDate") as string;
    const endDateStr = formData.get("endDate") as string;
    const reason = formData.get("reason") as string;
    const file = formData.get("attachment") as File | null;

    // 3. Validasi Tipe Cuti
    const allowedTypes = ["cuti", "sakit", "izin"];
    if (!allowedTypes.includes(type)) {
      return NextResponse.json(
        { message: "Jenis cuti tidak valid" },
        { status: 400 }
      );
    }

    // Konversi tanggal string ke Date object
    const startDate = new Date(startDateStr);
    const endDate = new Date(endDateStr);

    // --- 4. LOGIKA LIMIT CUTI TAHUNAN (DIPERTAHANKAN) ---
    if (type === "cuti") {
      const tahunIni = new Date().getFullYear();
      
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

      let totalHariCuti = 0;
      for (const pengajuan of cutiTahunIni) {
        const start = new Date(pengajuan.startDate);
        const end = new Date(pengajuan.endDate);
        totalHariCuti += Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      }

      const hariDiajukan =
        Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

      if (totalHariCuti + hariDiajukan > 12) {
        return NextResponse.json(
          { message: `Limit cuti tahunan habis. Sisa kuota: ${12 - totalHariCuti} hari.` },
          { status: 400 }
        );
      }
    }
    // --- END LIMIT CUTI TAHUNAN ---

    // 5. PROSES UPLOAD FILE (BARU)
    let attachmentUrl = null;
    if (file && file.size > 0) {
      const bytes = await file.arrayBuffer();
      const buffer = new Uint8Array(bytes);
      
      // Simpan di folder public/uploads/izin
      const uploadDir = path.join(process.cwd(), "public", "uploads", "izin");
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      // Nama file unik
      const filename = `izin-${userId}-${Date.now()}-${file.name.replace(/\s/g, "_")}`;
      const filepath = path.join(uploadDir, filename);
      
      fs.writeFileSync(filepath, buffer);
      attachmentUrl = `/uploads/izin/${filename}`;
    }

    // 6. Simpan ke Database
    const pengajuan = await prisma.leaveRequest.create({
      data: {
        userId,
        type: type as any, // Casting ke Enum Prisma
        startDate: startDate,
        endDate: endDate,
        reason,
        attachment: attachmentUrl, // Masukkan URL file
        status: "pending",
      },
    });

    return NextResponse.json(pengajuan, { status: 201 });

  } catch (error) {
    console.error("Error saat membuat pengajuan:", error);
    return NextResponse.json({ message: "Terjadi kesalahan server" }, { status: 500 });
  }
}
