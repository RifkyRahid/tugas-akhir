import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

function haversine(lat1: number, lon1: number, lat2: number, lon2: number) {
  const toRad = (x: number) => x * Math.PI / 180;
  const R = 6371000; // meter
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export async function POST(req: NextRequest) {
  const userId = req.cookies.get("userId")?.value;
  if (!userId) return NextResponse.json({ error: "User belum login" }, { status: 401 });

  const now = new Date();
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const body = await req.json();
  const { photo, latitude, longitude } = body;
  if (!photo) return NextResponse.json({ error: "Foto tidak ditemukan" }, { status: 400 });

  const existing = await prisma.attendance.findFirst({
    where: { userId, date: today },
  });
  if (existing) return NextResponse.json({ error: "Sudah absen hari ini" }, { status: 400 });

  const batasTepatWaktu = new Date();
  batasTepatWaktu.setHours(9, 0, 0, 0);
  let lateMinutes: number | null = null;
  if (now > batasTepatWaktu) {
    const diffMs = now.getTime() - batasTepatWaktu.getTime();
    lateMinutes = Math.floor(diffMs / 1000 / 60);
  }

  const area = await prisma.attendanceArea.findFirst(); // ambil area aktif
  let status: "hadir" | "pending" = "pending";

  if (area) {
    const distance = haversine(latitude, longitude, area.latitude, area.longitude);
    console.log("Jarak:", distance, "meter");
    if (distance <= area.radius) {
      status = "hadir";
    }
  }

  const keterangan = now > batasTepatWaktu ? "Terlambat" : "Tepat Waktu";

  const absen = await prisma.attendance.create({
    data: {
      userId,
      date: today,
      checkIn: now,
      status,
      keterangan,
      lateMinutes,
      photo,
      latitude,
      longitude,
    },
  });

  return NextResponse.json(absen, { status: 201 });
}
