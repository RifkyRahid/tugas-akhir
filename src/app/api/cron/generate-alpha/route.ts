import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

const CRON_SECRET = "rahasia123"; 

export async function GET(req: NextRequest) {
  try {
    // 1. Cek Kunci Pengaman
    const { searchParams } = new URL(req.url);
    const key = searchParams.get("key");

    if (key !== CRON_SECRET) {
      return NextResponse.json({ message: "Unauthorized: Kunci salah!" }, { status: 401 });
    }

    const now = new Date();
    
    // SAFETY GUARD (Opsional: Matikan dulu saat testing lokal biar bisa dijalankan jam berapa aja)
    // const currentHour = now.getHours();
    // const MINIMUM_HOUR = 20; 
    // if (currentHour < MINIMUM_HOUR) { ... }

    // --- PERBAIKAN TIMEZONE DISINI ---
    // Gunakan Date.UTC agar menghasilkan jam 00:00 UTC (Bukan jam 00:00 WIB yang = 17:00 UTC kemarin)
    // Ini penting agar data masuk ke filter tanggal yang benar di Admin Page
    const today = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()));
    
    // 3. Ambil Semua Karyawan Aktif
    const employees = await prisma.user.findMany({
      where: {
        role: "karyawan",
        isActive: true,
      },
      select: { id: true, name: true }
    });

    // 4. Ambil Absensi Hari Ini
    // Range waktu juga harus UTC
    const attendanceToday = await prisma.attendance.findMany({
      where: {
        date: {
          gte: today, // 00:00 UTC
          lt: new Date(today.getTime() + 24 * 60 * 60 * 1000), // 00:00 UTC Besok
        },
      },
      select: { userId: true }
    });

    const presentUserIds = new Set(attendanceToday.map(a => a.userId));

    // 5. Filter Siapa yang BELUM Absen
    const alphaCandidates = employees.filter(emp => !presentUserIds.has(emp.id));

    if (alphaCandidates.length === 0) {
      return NextResponse.json({ message: "Semua karyawan sudah absen hari ini." });
    }

    // 6. Eksekusi Generate Alpha Massal
    const result = await prisma.attendance.createMany({
      data: alphaCandidates.map(emp => ({
        userId: emp.id,
        date: today, // Data tersimpan sebagai 00:00 UTC (Aman untuk filter)
        status: "alpha",
        checkIn: null,
        checkOut: null,
        keterangan: "Generate Otomatis by System",
      })),
      skipDuplicates: true 
    });

    return NextResponse.json({
      success: true,
      message: `Berhasil generate alpha untuk ${result.count} karyawan.`,
      details: alphaCandidates.map(e => e.name)
    });

  } catch (error) {
    console.error("Cron Error:", error);
    return NextResponse.json({ message: "Terjadi kesalahan server", error: String(error) }, { status: 500 });
  }
}