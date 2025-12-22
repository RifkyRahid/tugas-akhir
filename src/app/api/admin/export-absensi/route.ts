import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const startDateStr = searchParams.get("startDate");
  const endDateStr = searchParams.get("endDate");
  const statusStr = searchParams.get("status");
  const deptIdStr = searchParams.get("deptId");

  if (!startDateStr || !endDateStr) {
    return NextResponse.json({ error: "Tanggal wajib diisi" }, { status: 400 });
  }

  const startDate = new Date(startDateStr);
  startDate.setHours(0, 0, 0, 0);

  const endDate = new Date(endDateStr);
  endDate.setHours(23, 59, 59, 999);

  try {
    // 1. Bangun Query Filter Attendance
    const whereClause: Prisma.AttendanceWhereInput = {
      date: { gte: startDate, lte: endDate },
      
      // Filter User berdasarkan Unit Bisnis (via Relasi)
      user: {
         jabatan: deptIdStr && deptIdStr !== "all" ? {
             departmentId: Number(deptIdStr)
         } : undefined
      }
    };

    // 2. Filter Status Spesifik
    if (statusStr && statusStr !== "all") {
        if (statusStr === "terlambat") {
            // Khusus Terlambat: Status Hadir TAPI lateMinutes > 0
            whereClause.status = "hadir";
            whereClause.lateMinutes = { gt: 0 };
        } else {
            // Status normal (hadir, sakit, izin, alpha, cuti)
            // Casting ke any untuk menghindari error enum strict TypeScript
            whereClause.status = statusStr as any;
        }
    }

    // 3. Ambil Data dari Database
    const data = await prisma.attendance.findMany({
      where: whereClause,
      include: {
        user: {
          include: {
            jabatan: { include: { department: true } }
          }
        },
      },
      orderBy: { date: "asc" }, // Urutkan tanggal terlama ke terbaru
    });

    // 4. Format Data untuk Frontend/PDF
    const formattedData = data.map((item) => ({
      nama: item.user.name,
      jabatan: item.user.jabatan?.title || "-",
      unit: item.user.jabatan?.department?.name || "-",
      tanggal: item.date.toISOString().split("T")[0],
      
      // Format Jam (HH:mm) atau "-" jika kosong
      jamMasuk: item.checkIn ? new Date(item.checkIn).toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' }) : "-",
      jamPulang: item.checkOut ? new Date(item.checkOut).toLocaleTimeString("id-ID", { hour: '2-digit', minute: '2-digit' }) : "-",
      
      status: item.status,
      
      // Keterangan Tambahan (misal: Telat berapa menit)
      keterangan: item.lateMinutes && item.lateMinutes > 0 ? `Telat ${item.lateMinutes} mnt` : "",
    }));

    return NextResponse.json({ data: formattedData });
  } catch (error) {
    console.error("Export Detail Error:", error);
    return NextResponse.json({ error: "Gagal ambil data export" }, { status: 500 });
  }
}