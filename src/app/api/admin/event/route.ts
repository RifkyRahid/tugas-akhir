import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

// === GET: Ambil Data Kalender (Event Manual + Ulang Tahun Otomatis) ===
export async function GET(req: NextRequest) {
  try {
    // 1. Ambil Event Manual dari Database
    const manualEvents = await prisma.eventReminder.findMany({
      orderBy: { date: 'asc' }
    });

    // 2. Ambil Data User Aktif yang punya Tanggal Lahir
    const users = await prisma.user.findMany({
      where: {
        birthDate: { not: null },
        isActive: true 
      },
      select: {
        id: true,
        name: true,
        birthDate: true
      }
    });

    // 3. GENERASI EVENT ULANG TAHUN (FIX TIMEZONE)
    const currentYear = new Date().getFullYear();
    const targetYears = [currentYear - 1, currentYear, currentYear + 1]; // Cover 3 tahun
    
    let birthdayEvents: any[] = [];

    users.forEach((user) => {
      if (user.birthDate) {
        const birthDate = new Date(user.birthDate);
        
        // Ambil tanggal & bulan
        // Gunakan getUTCDate jika data tersimpan UTC, atau getDate biasa jika lokal
        // Kita pakai metode aman: ambil komponen tanggalnya saja
        const day = birthDate.getDate();
        const month = birthDate.getMonth(); // 0-11

        targetYears.forEach((year) => {
          // FIX TIMEZONE: Paksa jam ke 12:00 Siang UTC 
          // agar aman dari pergeseran jam WIB (+7) atau lainnya.
          // Format Date.UTC(year, month, day, 12, 0, 0)
          const eventDate = new Date(Date.UTC(year, month, day, 5, 0, 0)); 
          // Note: Jam 05:00 UTC = Jam 12:00 WIB (Siang). Aman.

          birthdayEvents.push({
            id: `bday-${user.id}-${year}`,
            title: `Ultah ${user.name.split(" ")[0]} 🎂`,
            date: eventDate, 
            description: `Ulang tahun ${user.name}`,
            type: "BIRTHDAY",
            isAutomatic: true // Penanda agar tidak bisa diedit
          });
        });
      }
    });

    // 4. Gabungkan Event Manual + Event Ulang Tahun
    const allEvents = [...manualEvents, ...birthdayEvents];

    return NextResponse.json(allEvents);

  } catch (error) {
    console.error("Gagal mengambil event:", error);
    return NextResponse.json({ error: "Gagal mengambil data kalender" }, { status: 500 });
  }
}

// === POST: Tambah Event Manual ===
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, date, description, type } = body;

    if (!title || !date || !type) {
      return NextResponse.json({ error: "Field tidak lengkap" }, { status: 400 });
    }

    const newEvent = await prisma.eventReminder.create({
      data: {
        title,
        date: new Date(date),
        description,
        type,
      },
    });

    return NextResponse.json(newEvent, { status: 201 });
  } catch (error) {
    console.error("Gagal membuat event:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}