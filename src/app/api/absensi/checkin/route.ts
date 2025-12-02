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

    const form = await req.formData();
    const file = form.get("photo") as File | null;
    const latitude = parseFloat(form.get("latitude") as string);
    const longitude = parseFloat(form.get("longitude") as string);
    // Kita hapus pengambilan 'keterangan' manual di sini karena user belum input

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

    // --- CEK VALIDASI ---
    const now = new Date();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

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

    // --- CEK JAM KERJA DARI DB (UPDATE BARU) ---
    // 1. Ambil settingan jam kerja dari AppConfig
    const config = await prisma.appConfig.findFirst();
    
    // Fallback jika admin belum pernah setting (Default jam 09:00)
    const jamMasukSetting = config?.startWorkTime || "09:00"; 
    
    // 2. Konversi string "HH:mm" ke Object Date hari ini
    const [jam, menit] = jamMasukSetting.split(":").map(Number);
    const batasTepatWaktu = new Date();
    batasTepatWaktu.setHours(jam, menit, 0, 0);

    // --- LOGIKA UTAMA ---
    if (userWithArea?.area) {
      const { area } = userWithArea;
      areaName = area.name; // Simpan nama area untuk respon
      
      // 1. Hitung Jarak
      distance = haversineDistance(latitude, longitude, area.latitude, area.longitude);
      
      // 2. Logika Strict Geofencing
      if (distance > area.radius) {
        status = "pending";
        // Default system note, nanti di-update via PATCH oleh user jika pending
        finalKeterangan = `Diluar jangkauan (${Math.round(distance)}m)`;
      } else {
        // Jika dalam area, cek apakah Terlambat berdasarkan jam dari DB
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

    // --- RESPON PENTING ---
    // Kita kirimkan areaName dan attendanceId agar frontend bisa minta alasan
    if (status === 'pending') {
        return NextResponse.json({
            status: 'pending',
            message: `Lokasi Anda tidak sesuai.`,
            areaName: areaName,
            distance: Math.round(distance),
            attendanceId: absen.id // ID ini dipakai untuk PATCH alasan nanti
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

// === METHOD PATCH: UNTUK UPDATE ALASAN (JIKA DILUAR LOKASI) ===
export async function PATCH(req: NextRequest) {
  try {
    const userId = getUserIdFromSession(req);
    if (!userId) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const { attendanceId, reason } = body;

    if (!attendanceId || !reason) {
      return NextResponse.json({ message: "Data tidak lengkap" }, { status: 400 });
    }

    // Update keterangan absensi
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