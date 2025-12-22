import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // 1. Ambil Data User (Include Data Cuti Awal)
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        role: true,
        yearlyLeaveQuota: true,
        leaveUsedManual: true,
        jabatan: {
          select: { 
            title: true,
            department: { select: { name: true } }
          }
        },
        position: true 
      }
    });

    if (!user) {
      return NextResponse.json({ message: "User tidak ditemukan" }, { status: 404 });
    }

    // ==========================================
    // BAGIAN 1: HITUNG SISA CUTI
    // ==========================================
    const currentYear = new Date().getFullYear();
    const startOfYear = new Date(currentYear, 0, 1);
    const endOfYear = new Date(currentYear, 11, 31);

    const approvedLeaves = await prisma.leaveRequest.findMany({
        where: {
            userId: user.id,
            status: 'disetujui',
            type: 'cuti',
            startDate: { gte: startOfYear, lte: endOfYear }
        }
    });

    let leaveUsedSystem = 0;
    approvedLeaves.forEach(leave => {
        const start = new Date(leave.startDate);
        const end = new Date(leave.endDate);
        const days = Math.floor((end.getTime() - start.getTime()) / (1000 * 3600 * 24)) + 1;
        leaveUsedSystem += days;
    });

    const quota = user.yearlyLeaveQuota || 12;
    const manualUsed = user.leaveUsedManual || 0;
    const totalUsed = manualUsed + leaveUsedSystem;
    const remainingLeave = quota - totalUsed;


    // ==========================================
    // BAGIAN 2: STATUS ABSEN HARI INI
    // ==========================================
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const absensiHariIni = await prisma.attendance.findFirst({
        where: { userId: userId, date: { gte: today } },
        select: { checkIn: true, checkOut: true, status: true }
    });

    let statusAbsen = "Belum Absen";
    let jamMasuk = "-";
    let jamPulang = "-";

    if (absensiHariIni) {
        if (absensiHariIni.status === 'pending') {
            statusAbsen = "Menunggu Approval";
        } else if (absensiHariIni.checkIn && !absensiHariIni.checkOut) {
            statusAbsen = "Sudah Masuk";
            jamMasuk = new Date(absensiHariIni.checkIn).toLocaleTimeString("id-ID", {hour: '2-digit', minute:'2-digit'});
        } else if (absensiHariIni.checkIn && absensiHariIni.checkOut) {
            statusAbsen = "Sudah Pulang";
            jamMasuk = new Date(absensiHariIni.checkIn).toLocaleTimeString("id-ID", {hour: '2-digit', minute:'2-digit'});
            jamPulang = new Date(absensiHariIni.checkOut).toLocaleTimeString("id-ID", {hour: '2-digit', minute:'2-digit'});
        } else {
            statusAbsen = absensiHariIni.status.toUpperCase(); 
        }
    }

    // ==========================================
    // BAGIAN 3: UPCOMING EVENTS (AGENDA)
    // ==========================================
    // A. Event Manual (Dari Database)
    const manualEvents = await prisma.eventReminder.findMany({
        where: { date: { gte: today } }, // Hanya yang hari ini ke depan
        orderBy: { date: 'asc' },
        take: 5 // Batasi ambil 5 saja biar ringan
    });

    // B. Event Ulang Tahun Otomatis
    const usersWithBday = await prisma.user.findMany({
        where: { birthDate: { not: null }, isActive: true },
        select: { id: true, name: true, birthDate: true }
    });

    let birthdayEvents: any[] = [];
    const targetYears = [currentYear, currentYear + 1]; // Cek tahun ini & tahun depan

    usersWithBday.forEach((u) => {
        if (u.birthDate) {
            const bday = new Date(u.birthDate);
            const day = bday.getDate();
            const month = bday.getMonth();

            targetYears.forEach(year => {
                // FIX TIMEZONE: Gunakan teknik yang sama dengan Kalender Admin
                const eventDate = new Date(Date.UTC(year, month, day, 5, 0, 0)); // Jam 12 Siang WIB

                // Hanya masukkan jika tanggalnya >= Hari Ini (00:00)
                if (eventDate >= today) {
                    birthdayEvents.push({
                        id: `bday-${u.id}-${year}`,
                        title: `Ultah ${u.name.split(" ")[0]} 🎂`,
                        date: eventDate,
                        description: `Selamat Ulang Tahun, ${u.name}!`,
                        type: "BIRTHDAY"
                    });
                }
            });
        }
    });

    // C. Gabung & Urutkan
    const allEvents = [...manualEvents, ...birthdayEvents];
    
    // Urutkan berdasarkan tanggal terdekat
    allEvents.sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Ambil 3 Event Teratas saja untuk Dashboard
    const upcomingEvents = allEvents.slice(0, 5);


    // ==========================================
    // FINAL RESPONSE
    // ==========================================
    return NextResponse.json({
      name: user.name,
      role: user.role,
      positionTitle: user.jabatan?.title || user.position || "-",
      department: user.jabatan?.department?.name || "Unit Umum",
      leaveBalance: {
          quota,
          used: totalUsed,
          remaining: remainingLeave
      },
      attendanceToday: {
          statusLabel: statusAbsen,
          jamMasuk,
          jamPulang
      },
      upcomingEvents // Data Baru
    });

  } catch (error) {
    console.error("Error get user me:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}