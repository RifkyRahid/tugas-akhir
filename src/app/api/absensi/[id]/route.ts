import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Handle Request PATCH (Edit Data per ID)
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await request.json();
    const { checkIn, checkOut, status } = body;

    const updateData: any = {};

    // 1. Update Status (Jika ada request ubah status)
    if (status) {
      updateData.status = status;
    }

    // 2. Update Jam Pulang
    if (checkOut !== undefined) {
      updateData.checkOut = checkOut;
    }

    // 3. Update Jam Masuk & HITUNG ULANG KETERLAMBATAN
    if (checkIn !== undefined) {
      updateData.checkIn = checkIn;

      if (checkIn) {
        const checkInDate = new Date(checkIn);

        // --- LOGIKA HITUNG TELAT (TIMEZONE SAFE) ---
        // Kita ubah waktu checkIn menjadi format jam WIB (Asia/Jakarta)
        // Ini penting agar server (Hosting/Vercel) yang biasanya UTC tetap menghitung dengan benar
        const wibTime = checkInDate.toLocaleTimeString("en-US", {
          timeZone: "Asia/Jakarta",
          hour12: false, // Format 24 jam (HH:mm:ss)
        });
        
        const [hours, minutes] = wibTime.split(":").map(Number);
        const totalMinutesActual = hours * 60 + minutes;

        // Tentukan Batas Jam Masuk (Default 09:00 pagi)
        // 09:00 = 9 * 60 = 540 menit dari jam 00:00
        const targetHour = 9; 
        const targetMinute = 0;
        const totalMinutesTarget = targetHour * 60 + targetMinute;

        // Hitung selisih
        let diff = totalMinutesActual - totalMinutesTarget;

        // Jika minus (datang lebih awal), anggap 0 (tidak telat)
        if (diff < 0) diff = 0;

        // Simpan hasil hitungan baru ke database
        updateData.lateMinutes = diff;

        // BONUS: Jika admin mengubah jam jadi tidak telat (0 menit),
        // otomatis ubah status 'terlambat' menjadi 'hadir' biar rapi.
        if (diff === 0) {
           // Kita cek dulu status sekarang (optional), atau langsung paksa update saja jika logicmu setuju
           // updateData.status = 'hadir'; // Uncomment baris ini jika mau otomatis ubah status jadi Hadir
        }

      } else {
        // Jika admin menghapus jam masuk (di-null-kan)
        updateData.lateMinutes = null;
      }
    }

    // Eksekusi Update ke Database
    const updatedAttendance = await prisma.attendance.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(updatedAttendance);

  } catch (error) {
    console.error("Gagal update absensi:", error);
    return NextResponse.json(
      { error: "Gagal mengupdate data absensi" },
      { status: 500 }
    );
  }
}