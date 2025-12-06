import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserIdFromSession } from "@/lib/auth.server";
import fs from "fs";
import path from "path";

// === GET: AMBIL RIWAYAT KOREKSI (BARU) ===
export async function GET(req: NextRequest) {
  try {
    const userId = getUserIdFromSession(req);
    if (!userId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const corrections = await prisma.attendanceCorrection.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" }
    });

    return NextResponse.json(corrections);
  } catch (error) {
    console.error("Error fetch koreksi:", error);
    return NextResponse.json({ message: "Error fetch data" }, { status: 500 });
  }
}

// === POST: SUBMIT KOREKSI (EXISTING) ===
export async function POST(req: NextRequest) {
  try {
    const userId = getUserIdFromSession(req);
    if (!userId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const formData = await req.formData();
    const dateStr = formData.get("date") as string;
    const timeStr = formData.get("time") as string; 
    const reason = formData.get("reason") as string;
    const file = formData.get("attachment") as File | null;

    if (!dateStr || !timeStr || !reason) {
      return NextResponse.json({ message: "Data tidak lengkap" }, { status: 400 });
    }

    const correctionDate = new Date(dateStr);
    const [hours, minutes] = timeStr.split(":").map(Number);
    const fixJamPulang = new Date(correctionDate);
    fixJamPulang.setHours(hours, minutes, 0, 0);

    let attachmentUrl = null;
    if (file) {
      const bytes = await file.arrayBuffer();
      const buffer = new Uint8Array(bytes);
      const uploadDir = path.join(process.cwd(), "public", "uploads", "koreksi");
      
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }

      const filename = `koreksi-${userId}-${Date.now()}.jpg`;
      const filepath = path.join(uploadDir, filename);
      fs.writeFileSync(filepath, buffer);
      attachmentUrl = `/uploads/koreksi/${filename}`;
    }

    await prisma.attendanceCorrection.create({
      data: {
        userId,
        date: correctionDate,
        jamPulang: fixJamPulang,
        reason,
        attachment: attachmentUrl,
        status: "pending"
      }
    });

    return NextResponse.json({ message: "Pengajuan koreksi berhasil dikirim" });

  } catch (error) {
    console.error("Error koreksi:", error);
    return NextResponse.json({ message: "Terjadi kesalahan server" }, { status: 500 });
  }
}