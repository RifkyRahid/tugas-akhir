import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { targetDate } = await req.json(); // Format: "YYYY-MM-DD"

    if (!targetDate) {
      return NextResponse.json({ error: "Tanggal wajib diisi" }, { status: 400 });
    }

    // --- FIX TIMEZONE: GUNAKAN RANGE TANGGAL ---
    // Kita buat range dari jam 00:00:00 s/d 23:59:59 pada tanggal tersebut
    // untuk memastikan data tertangkap meski ada geseran jam di DB.
    
    const startOfDay = new Date(`${targetDate}T00:00:00.000Z`);
    const endOfDay = new Date(`${targetDate}T23:59:59.999Z`);

    console.log("🔍 Debug Range:", startOfDay, "s/d", endOfDay); // Cek console server

    // --- STEP 1: AMBIL DATA JADWAL (Kandidat Awal) ---
    // Revisi: Menggunakan gte (>=) dan lte (<=)
    const scheduledEmployees = await prisma.employeeSchedule.findMany({
      where: {
        date: {
            gte: startOfDay,
            lte: endOfDay
        }
      },
      select: { userId: true },
    });

    if (scheduledEmployees.length === 0) {
      return NextResponse.json({ 
        message: "Tidak ada jadwal kerja ditemukan pada tanggal ini.", 
        count: 0,
        details: { totalScheduled: 0, alreadyPresent: 0, onLeave: 0 }
      });
    }

    const scheduledUserIds = scheduledEmployees.map((s) => s.userId);

    // --- STEP 2: CEK ABSENSI YANG SUDAH ADA (Filter 1) ---
    const existingAttendances = await prisma.attendance.findMany({
      where: {
        date: {
            gte: startOfDay,
            lte: endOfDay
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
        // Logika Cuti: StartDate <= TargetDate AND EndDate >= TargetDate
        // Kita pakai string compare sederhana YYYY-MM-DD agar aman
        startDate: { lte: startOfDay }, 
        endDate: { gte: startOfDay },
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
    // Pastikan date yang diinsert bersih (tanpa jam aneh-aneh) atau sesuai startOfDay
    const result = await prisma.attendance.createMany({
      data: alphaCandidates.map((userId) => ({
        userId,
        date: startOfDay, // Gunakan tanggal yang sudah dinormalisasi
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