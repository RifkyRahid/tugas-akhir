import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const startDateStr = searchParams.get("startDate");
  const endDateStr = searchParams.get("endDate");
  const deptIdStr = searchParams.get("deptId");

  if (!startDateStr || !endDateStr) {
    return NextResponse.json({ error: "Tanggal wajib diisi" }, { status: 400 });
  }

  const startDate = new Date(startDateStr);
  startDate.setHours(0, 0, 0, 0);

  const endDate = new Date(endDateStr);
  endDate.setHours(23, 59, 59, 999);
  
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  try {
    const userWhereClause: any = {
      role: "karyawan",
      isActive: true,
    };

    if (deptIdStr && deptIdStr !== "all") {
        userWhereClause.jabatan = {
            departmentId: Number(deptIdStr)
        };
    }

    const users = await prisma.user.findMany({
      where: userWhereClause,
      // Kita urutkan nama dulu sebagai secondary sort
      orderBy: { name: "asc" },
      include: {
        jabatan: { include: { department: true } },
        attendances: {
          where: {
            date: {
              gte: startDate,
              lte: endDate,
            },
          },
        },
      },
    });

    const rekapData = users.map((user) => {
      let jumlahTerlambat = 0;
      let jumlahNoCheckout = 0;
      let jumlahSakitNoMC = 0;
      let jumlahAlpha = 0;
      
      user.attendances.forEach((att) => {
        if (att.status === "hadir" && (att.lateMinutes || 0) > 0) jumlahTerlambat++;
        
        if (att.checkIn && !att.checkOut) {
          const attDate = new Date(att.date);
          if (attDate < todayStart) jumlahNoCheckout++;
        }

        if (att.status === "sakit" && !att.photo) jumlahSakitNoMC++;
        if (att.status === "alpha") jumlahAlpha++;
      });

      return {
        nama: user.name,
        // Jika tidak ada unit, beri nama "Z-Lainnya" atau "-" biar urutannya di bawah/atas sesuai selera. 
        // Disini saya pakai "-" default.
        unit: user.jabatan?.department?.name || "-", 
        jabatan: user.jabatan?.title || "-",
        jumlahTerlambat,
        jumlahNoCheckout,
        jumlahSakitNoMC,
        jumlahAlpha,
        totalPotonganAbsensi: jumlahTerlambat + jumlahNoCheckout,
        totalUnpaidHarian: jumlahSakitNoMC + jumlahAlpha,
      };
    });

    // LOGIKA SORTING BARU: Urutkan berdasarkan Unit Bisnis, lalu Nama
    rekapData.sort((a, b) => {
        // Bandingkan Unit Bisnis
        const unitComparison = a.unit.localeCompare(b.unit);
        if (unitComparison !== 0) return unitComparison;
        
        // Jika Unit sama, bandingkan Nama
        return a.nama.localeCompare(b.nama);
    });

    return NextResponse.json({ data: rekapData });
  } catch (error) {
    console.error("Export Rekap Error:", error);
    return NextResponse.json({ error: "Gagal rekap data" }, { status: 500 });
  }
}