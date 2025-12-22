import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, status } = body; // status: 'hadir' (Setujui) atau 'alpha' (Tolak)

    // Validasi input
    if (!id || !status) {
        return NextResponse.json({ message: "Data tidak lengkap" }, { status: 400 });
    }

    if (!["hadir", "alpha"].includes(status)) {
        return NextResponse.json({ message: "Status tidak valid" }, { status: 400 });
    }

    // 1. Ambil Identitas Admin yang sedang login
    const cookieStore = await cookies();
    const adminId = cookieStore.get("userId")?.value;
    
    if (!adminId) {
        return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // 2. Cari Nama Admin untuk Audit Trail
    const admin = await prisma.user.findUnique({ 
        where: { id: adminId },
        select: { name: true }
    });

    // 3. Ambil Data Absensi Existing (Kita butuh jam checkIn-nya)
    const existingAbsensi = await prisma.attendance.findUnique({
        where: { id }
    });

    if (!existingAbsensi || !existingAbsensi.checkIn) {
        return NextResponse.json({ message: "Data absensi tidak ditemukan" }, { status: 404 });
    }

    // --- LOGIKA HITUNG TELAT (RE-CALCULATION) ---
    let finalLateMinutes = 0;

    // Hanya hitung telat jika status disetujui jadi 'hadir'
    if (status === 'hadir') {
        // A. Ambil Jam Kerja dari Config
        const config = await prisma.appConfig.findFirst();
        const jamMasukSetting = config?.startWorkTime || "09:00"; // Default 09:00

        // B. Buat Object Date untuk Batas Waktu Masuk pada HARI YANG SAMA dengan checkIn user
        const checkInTime = new Date(existingAbsensi.checkIn);
        const workStartTime = new Date(checkInTime); // Copy tanggal dari checkIn
        
        const [jam, menit] = jamMasukSetting.split(":").map(Number);
        workStartTime.setHours(jam, menit, 0, 0); // Set jam sesuai config

        // C. Bandingkan
        if (checkInTime > workStartTime) {
            // Hitung selisih menit
            finalLateMinutes = Math.floor((checkInTime.getTime() - workStartTime.getTime()) / 60000);
        }
    }

    // 4. Eksekusi Update dengan Audit Trail & Late Minutes
    const updated = await prisma.attendance.update({
      where: { id },
      data: {
        status: status, 
        
        // UPDATE BARU: Masukkan hasil hitungan telat
        // Jika ditolak (alpha), lateMinutes otomatis 0 atau null (tergantung preferensi, disini kita 0-kan)
        lateMinutes: status === 'hadir' ? finalLateMinutes : 0,

        // KUNCI HISTORY:
        // Kita set isViolation = true agar data ini tetap dianggap "spesial" 
        // dan tetap muncul di history halaman pending.
        isViolation: true, 
        
        // Catat jejak audit (Siapa & Kapan)
        reviewedBy: admin?.name || "Admin",
        reviewedAt: new Date(),
      },
    });

    return NextResponse.json(updated);

  } catch (error) {
    console.error("Error approval:", error);
    return NextResponse.json({ message: "Gagal update status" }, { status: 500 });
  }
}