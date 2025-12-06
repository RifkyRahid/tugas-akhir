import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, status, category } = body; 
    // category: 'leave' (cuti/izin) atau 'correction' (koreksi absen)

    if (!id || !status) return NextResponse.json({ message: "Data invalid" }, { status: 400 });

    // === LOGIKA 1: APPROVAL KOREKSI ABSEN ===
    if (category === "correction") {
      // Update status di tabel Koreksi
      const correction = await prisma.attendanceCorrection.update({
        where: { id },
        data: { status }
      });

      // JIKA DISETUJUI -> UPDATE TABEL ATTENDANCE ASLI
      if (status === "disetujui") {
        // Cari absensi di tanggal tersebut
        // Kita cari range start-end day untuk tanggal koreksi
        const targetDate = new Date(correction.date);
        const startOfDay = new Date(targetDate.setHours(0,0,0,0));
        const endOfDay = new Date(targetDate.setHours(23,59,59,999));

        const existingAttendance = await prisma.attendance.findFirst({
            where: {
                userId: correction.userId,
                date: {
                    gte: startOfDay,
                    lte: endOfDay
                }
            }
        });

        if (existingAttendance) {
            // Update Jam Pulang Real
            await prisma.attendance.update({
                where: { id: existingAttendance.id },
                data: {
                    checkOut: correction.jamPulang,
                    keterangan: "Koreksi: " + correction.reason // Append keterangan
                }
            });
        } else {
            // Opsional: Jika data absen tidak ada (lupa checkin juga), mau dibuatkan baru?
            // Untuk sekarang kita asumsikan hanya update yang sudah checkin.
        }
      }
    } 
    
    // === LOGIKA 2: APPROVAL CUTI/IZIN/SAKIT ===
    else {
      await prisma.leaveRequest.update({
        where: { id },
        data: { status }
      });
      // Logika tambahan: Jika cuti disetujui, mungkin mau otomatis insert data 'Cuti' ke tabel Attendance?
      // Bisa ditambahkan disini nanti.
    }

    return NextResponse.json({ message: "Status berhasil diperbarui" });

  } catch (error) {
    console.error("Verifikasi error:", error);
    return NextResponse.json({ message: "Gagal memproses" }, { status: 500 });
  }
}