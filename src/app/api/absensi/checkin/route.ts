import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import fs from "fs";
import path from "path";
import { getUserIdFromSession } from "@/lib/auth.server";
import { haversineDistance } from "@/utils/distance";

// === METHOD POST: UNTUK ABSEN MASUK ===
export async function POST(req: NextRequest) {
  try {
    const userId = getUserIdFromSession(req);
    if (!userId) {
      return NextResponse.json({ message: "Sesi habis, silakan login ulang." }, { status: 401 });
    }

    // --- CEK 0: APAKAH SEDANG CUTI/IZIN? (FITUR BARU) ---
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset jam jadi 00:00

    const sedangCuti = await prisma.leaveRequest.findFirst({
        where: {
            userId: userId,
            status: 'disetujui', // Hanya yang sudah disetujui
            startDate: { lte: today }, // Mulai sebelum atau pas hari ini
            endDate: { gte: today }    // Berakhir setelah atau pas hari ini
        }
    });

    if (sedangCuti) {
        // Blokir Absen
        return NextResponse.json({ 
            message: `Anda tidak bisa absen karena sedang dalam status ${sedangCuti.type.toUpperCase()}.` 
        }, { status: 403 });
    }
    // -----------------------------------------------------

    const form = await req.formData();
    const file = form.get("photo") as File | null;
    const latitude = parseFloat(form.get("latitude") as string);
    const longitude = parseFloat(form.get("longitude") as string);

    if (!file) {
      return NextResponse.json({ message: "Foto wajib diambil!" }, { status: 400 });
    }

    // --- PROSES UPLOAD FOTO ---
    const bytes = await file.arrayBuffer();
    const buffer = new Uint8Array(bytes);
    const uploadDir = path.join(process.cwd(), "public", "uploads");
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

    const filename = `${Date.now()}-${file.name.replace(/\s/g, "_")}`;
    const filepath = path.join(uploadDir, filename);
    fs.writeFileSync(filepath, buffer);
    const photoUrl = `/uploads/${filename}`;

    // --- CEK VALIDASI ABSEN GANDA ---
    const now = new Date();
    
    const existing = await prisma.attendance.findFirst({
      where: { userId, date: { gte: today } },
    });
    if (existing) {
      return NextResponse.json({ message: "Anda sudah melakukan absen hari ini." }, { status: 400 });
    }

    const userWithArea = await prisma.user.findUnique({
      where: { id: userId },
      include: { area: true },
    });

    let status: "hadir" | "pending" = "hadir";
    let finalKeterangan = "Tepat Waktu";
    let lateMinutes = 0;
    let distance = 0;
    let areaName = "Lokasi Tidak Diketahui";

    // --- CEK JAM KERJA ---
    const config = await prisma.appConfig.findFirst();
    const jamMasukSetting = config?.startWorkTime || "09:00"; 
    
    const [jam, menit] = jamMasukSetting.split(":").map(Number);
    const batasTepatWaktu = new Date();
    batasTepatWaktu.setHours(jam, menit, 0, 0);

    // --- LOGIKA UTAMA ---
    if (userWithArea?.area) {
      const { area } = userWithArea;
      areaName = area.name; 
      
      distance = haversineDistance(latitude, longitude, area.latitude, area.longitude);
      
      if (distance > area.radius) {
        status = "pending";
        finalKeterangan = `Diluar jangkauan (${Math.round(distance)}m)`;
      } else {
        if (now > batasTepatWaktu) {
            lateMinutes = Math.floor((now.getTime() - batasTepatWaktu.getTime()) / 60000);
            finalKeterangan = `Terlambat (Masuk: ${jamMasukSetting})`;
        }
      }
    } else {
        finalKeterangan = "Area belum diatur oleh Admin";
    }

    // --- SIMPAN DATA ---
    const absen = await prisma.attendance.create({
      data: {
        userId,
        date: today,
        checkIn: now,
        status: status,
        keterangan: finalKeterangan,
        lateMinutes: status === 'hadir' ? lateMinutes : null,
        photo: photoUrl,
        latitude,
        longitude,
        areaId: userWithArea?.area?.id,
      },
    });

    if (status === 'pending') {
        return NextResponse.json({
            status: 'pending',
            message: `Lokasi Anda tidak sesuai.`,
            areaName: areaName,
            distance: Math.round(distance),
            attendanceId: absen.id
        }, { status: 201 });
    }

    return NextResponse.json({
      status: 'success',
      message: "Absen Berhasil! Selamat bekerja.",
    }, { status: 201 });

  } catch (error) {
    console.error("Check-in error:", error);
    return NextResponse.json({ message: "Terjadi kesalahan server." }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const userId = getUserIdFromSession(req);
    if (!userId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { attendanceId, reason } = body;

    if (!attendanceId || !reason) {
      return NextResponse.json({ message: "Data tidak lengkap" }, { status: 400 });
    }

    await prisma.attendance.update({
      where: { id: attendanceId },
      data: { keterangan: reason }
    });

    return NextResponse.json({ message: "Alasan berhasil disimpan" });
  } catch (error) {
    console.error("Error update reason:", error);
    return NextResponse.json({ message: "Gagal menyimpan alasan" }, { status: 500 });
  }
}