import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// Paksa agar tidak dicache oleh Vercel/Next.js (PENTING!)
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(req: Request) {
  try {
    const { targetDate } = await req.json(); // Format: "YYYY-MM-DD"

    if (!targetDate) {
      return NextResponse.json({ error: "Tanggal wajib diisi" }, { status: 400 });
    }

    // --- FIX TIMEZONE LOGIC (THE SNIPER METHOD) ---
    // Target: 2026-01-02 (WIB)
    // Database menyimpan UTC. 
    // 00:00 WIB = 17:00 UTC Hari Sebelumnya.
    // 23:59 WIB = 16:59 UTC Hari H.
    
    // 1. Buat object Date murni dari string tanggal
    const dateObj = new Date(targetDate);
    
    // 2. Set Start Time: Jam 00:00 WIB (yaitu jam 17:00 UTC kemarin)
    // Kita kurangi 7 jam dari jam 00:00 UTC tanggal target
    const startOfDayWIB_inUTC = new Date(dateObj.toISOString().split('T')[0] + 'T00:00:00.000Z');
    startOfDayWIB_inUTC.setHours(startOfDayWIB_inUTC.getHours() - 7);

    // 3. Set End Time: Jam 23:59 WIB (yaitu jam 16:59 UTC hari ini)
    const endOfDayWIB_inUTC = new Date(startOfDayWIB_inUTC);
    endOfDayWIB_inUTC.setHours(startOfDayWIB_inUTC.getHours() + 23);
    endOfDayWIB_inUTC.setMinutes(59);
    endOfDayWIB_inUTC.setSeconds(59);

    console.log(`🔍 LOGIKA WIB: Mencari absen dari [${startOfDayWIB_inUTC.toISOString()}] s/d [${endOfDayWIB_inUTC.toISOString()}]`);

    // --- STEP 1: AMBIL DATA JADWAL (Kandidat Awal) ---
    // Gunakan filter yang sudah dikoreksi (WIB range)
    // OPSIONAL: Jika tidak pakai sistem jadwal ketat, ganti ini dengan ambil semua active user
    const scheduledEmployees = await prisma.employeeSchedule.findMany({
      where: {
        date: {
            gte: startOfDayWIB_inUTC,
            lte: endOfDayWIB_inUTC
        }
      },
      select: { userId: true },
    });

    // JAGA-JAGA: Jika Jadwal Kosong, apakah mau cek semua karyawan aktif?
    // Jika iya, uncomment blok di bawah ini dan comment blok scheduledEmployees di atas.
    /*
    const allActiveUsers = await prisma.user.findMany({
        where: { isActive: true, role: 'user' }, // Sesuaikan filter role
        select: { id: true }
    });
    const scheduledUserIds = allActiveUsers.map(u => u.id);
    */

    // Jika tetap pakai jadwal:
    if (scheduledEmployees.length === 0) {
      return NextResponse.json({ 
        message: "Tidak ada jadwal kerja ditemukan pada tanggal ini (Cek Data Shift/Jadwal).", 
        count: 0,
        details: { totalScheduled: 0, alreadyPresent: 0, onLeave: 0 }
      });
    }

    const scheduledUserIds = scheduledEmployees.map((s) => s.userId);

    // --- STEP 2: CEK ABSENSI YANG SUDAH ADA (Filter 1) ---
    // PENTING: Gunakan range WIB yang sudah kita hitung
    const existingAttendances = await prisma.attendance.findMany({
      where: {
        date: {
            gte: startOfDayWIB_inUTC,
            lte: endOfDayWIB_inUTC
        },
        userId: { in: scheduledUserIds },
      },
      select: { userId: true },
    });

    const attendedUserIds = new Set(existingAttendances.map((a) => a.userId));

    // --- STEP 3: CEK CUTI/IZIN YANG DISETUJUI (Filter 2) ---
    const approvedLeaves = await prisma.leaveRequest.findMany({
      where: {
        status: "disetujui",
        // Cek irisan tanggal cuti dengan targetDate
        startDate: { lte: startOfDayWIB_inUTC }, // Mulai sebelum atau pas hari ini
        endDate: { gte: startOfDayWIB_inUTC },   // Berakhir setelah atau pas hari ini
        userId: { in: scheduledUserIds },
      },
      select: { userId: true },
    });

    const onLeaveUserIds = new Set(approvedLeaves.map((l) => l.userId));

    // --- STEP 4: FILTER FINAL ---
    const alphaCandidates = scheduledUserIds.filter((userId) => {
      const hasAttended = attendedUserIds.has(userId);
      const hasLeave = onLeaveUserIds.has(userId);
      return !hasAttended && !hasLeave;
    });

    if (alphaCandidates.length === 0) {
      return NextResponse.json({
        message: "Semua karyawan hadir atau izin.",
        count: 0,
        details: {
            totalScheduled: scheduledUserIds.length,
            alreadyPresent: attendedUserIds.size,
            onLeave: onLeaveUserIds.size
        }
      });
    }

    // --- STEP 5: EKSEKUSI ---
    // Kita gunakan startOfDayWIB_inUTC (Jam 17:00 UTC kemarin) sebagai tanggal record
    // Ini PENTING supaya konsisten dengan data Inject kita tadi (agar 1 hari = 1 tanggal unik)
    
    const result = await prisma.attendance.createMany({
      data: alphaCandidates.map((userId) => ({
        userId,
        date: startOfDayWIB_inUTC, // Hasilnya akan masuk sebagai 2026-01-01 17:00:00 UTC (00:00 WIB)
        status: "alpha",
        isViolation: true,
        keterangan: "Generate by System (Alpha Otomatis)",
      })),
      skipDuplicates: true, 
    });

    return NextResponse.json({
      success: true,
      message: "Proses Generate Alpha Selesai.",
      count: result.count,
      details: {
        totalScheduled: scheduledUserIds.length,
        alreadyPresent: attendedUserIds.size,
        onLeave: onLeaveUserIds.size,
        markedAlpha: result.count
      }
    });

  } catch (error: any) {
    console.error("Error Generate Alpha:", error);
    return NextResponse.json(
      { error: error.message || "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}