import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma"; // Pastikan path import ini sesuai setup kamu
import { eachDayOfInterval, addDays, isSameDay } from "date-fns";

// ==========================================
// POST: BUAT JADWAL (BULK INSERT/UPSERT)
// ==========================================
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { userId, shiftId, startDate, endDate, selectedDays } = body;

    // Validasi dasar
    if (!userId || !shiftId || !startDate || !endDate) {
      return NextResponse.json({ error: "Data tidak lengkap" }, { status: 400 });
    }

    const daysToInclude = selectedDays || [0, 1, 2, 3, 4, 5, 6];
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start > end) {
        return NextResponse.json({ error: "Tanggal akhir tidak boleh mendahului tanggal mulai" }, { status: 400 });
    }

    const allDates = eachDayOfInterval({ start, end });
    const targetDates = allDates.filter(date => daysToInclude.includes(date.getDay()));

    if (targetDates.length === 0) {
        return NextResponse.json({ error: "Tidak ada tanggal yang cocok dengan hari yang dipilih" }, { status: 400 });
    }

    // Lakukan UPSERT
    await Promise.all(
      targetDates.map(async (date) => {
        return prisma.employeeSchedule.upsert({
          where: {
            userId_date: {
              userId: userId,
              date: date,
            },
          },
          update: {
            shiftId: parseInt(shiftId),
          },
          create: {
            userId: userId,
            shiftId: parseInt(shiftId),
            date: date,
          },
        });
      })
    );

    return NextResponse.json({ 
        message: `Berhasil menyimpan jadwal untuk ${targetDates.length} hari terpilih.` 
    });

  } catch (error) {
    console.error("Gagal buat jadwal:", error);
    return NextResponse.json({ error: "Terjadi kesalahan server" }, { status: 500 });
  }
}

// ==========================================
// GET: AMBIL JADWAL (GROUPING LOGIC)
// ==========================================
export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    if(!userId) return NextResponse.json([]);

    try {
        const schedules = await prisma.employeeSchedule.findMany({
            where: { userId },
            include: { shift: true },
            orderBy: { date: 'asc' }, 
        });

        if (schedules.length === 0) return NextResponse.json([]);

        const groupedSchedules = [];
        let currentGroup = null;

        for (const schedule of schedules) {
            const schDate = new Date(schedule.date);

            if (!currentGroup) {
                currentGroup = {
                    shiftName: schedule.shift.name,
                    shiftTime: `${schedule.shift.startTime} - ${schedule.shift.endTime}`,
                    shiftId: schedule.shiftId,
                    startDate: schDate,
                    endDate: schDate,
                    count: 1
                };
                continue;
            }

            const isSameShift = currentGroup.shiftId === schedule.shiftId;
            const nextDay = addDays(new Date(currentGroup.endDate), 1);
            const isConsecutive = isSameDay(nextDay, schDate);

            if (isSameShift && isConsecutive) {
                currentGroup.endDate = schDate;
                currentGroup.count += 1;
            } else {
                groupedSchedules.push(currentGroup);
                currentGroup = {
                    shiftName: schedule.shift.name,
                    shiftTime: `${schedule.shift.startTime} - ${schedule.shift.endTime}`,
                    shiftId: schedule.shiftId,
                    startDate: schDate,
                    endDate: schDate,
                    count: 1
                };
            }
        }
        if (currentGroup) groupedSchedules.push(currentGroup);

        return NextResponse.json(groupedSchedules.reverse());

    } catch (error) {
        console.error("Gagal load jadwal:", error);
        return NextResponse.json({ error: "Gagal memuat jadwal" }, { status: 500 });
    }
}

// ==========================================
// DELETE: HAPUS JADWAL (RANGE) -- NEW!
// ==========================================
export async function DELETE(req: Request) {
  try {
    const body = await req.json();
    const { userId, startDate, endDate } = body;

    if (!userId || !startDate || !endDate) {
      return NextResponse.json({ error: "Data penghapusan tidak lengkap" }, { status: 400 });
    }

    // Hapus semua jadwal milik user ini dalam rentang tanggal tersebut
    const deleted = await prisma.employeeSchedule.deleteMany({
      where: {
        userId: userId,
        date: {
          gte: new Date(startDate), // >= Start Date
          lte: new Date(endDate),   // <= End Date
        },
      },
    });

    return NextResponse.json({ 
      message: `Berhasil menghapus ${deleted.count} jadwal.` 
    });

  } catch (error) {
    console.error("Gagal hapus jadwal:", error);
    return NextResponse.json({ error: "Gagal menghapus jadwal" }, { status: 500 });
  }
}