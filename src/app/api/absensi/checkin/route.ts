import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import fs from "fs";
import path from "path";

function haversine(lat1: number, lon1: number, lat2: number, lon2: number) {
  const toRad = (x: number) => (x * Math.PI) / 180;
  const R = 6371000; // meter
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export async function POST(req: NextRequest) {
  const userId = req.cookies.get("userId")?.value;
  if (!userId) {
    return NextResponse.json(
      { error: "User belum login" },
      { status: 401 }
    );
  }

  const now = new Date();
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  // 🔹 1. Ganti dari req.json() → req.formData()
  const form = await req.formData();

  // 🔹 2. Ambil file & data lain
  const file = form.get("photo") as File | null;
  const latitude = parseFloat(form.get("latitude") as string);
  const longitude = parseFloat(form.get("longitude") as string);

  if (!file) {
    return NextResponse.json(
      { error: "Foto tidak ditemukan" },
      { status: 400 }
    );
  }

  // 🔹 3. Simpan file ke folder public/uploads
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const uploadDir = path.join(process.cwd(), "public", "uploads");
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const filename = `${Date.now()}-${file.name}`;
  const filepath = path.join(uploadDir, filename);
  fs.writeFileSync(filepath, buffer);

  // url file yg bisa diakses frontend
  const photoUrl = `/uploads/${filename}`;

  // pastikan 1x absen per hari
  const existing = await prisma.attendance.findFirst({
    where: {
      userId,
      date: {
        gte: today,
        lt: tomorrow,
      },
    },
  });
  if (existing) {
    return NextResponse.json(
      { error: "Sudah absen hari ini" },
      { status: 400 }
    );
  }

  const batasTepatWaktu = new Date();
  batasTepatWaktu.setHours(9, 0, 0, 0);

  let lateMinutes: number | null = null;
  if (now > batasTepatWaktu) {
    const diffMs = now.getTime() - batasTepatWaktu.getTime();
    lateMinutes = Math.floor(diffMs / 1000 / 60);
  }

  // ambil area absensi aktif
  const area = await prisma.attendanceArea.findFirst();
  if (!area) {
    return NextResponse.json(
      { error: "Area absensi belum diset" },
      { status: 400 }
    );
  }

  // cek jarak
  let status: "hadir" | "pending" = "pending";
  const distance = haversine(
    latitude,
    longitude,
    area.latitude,
    area.longitude
  );
  console.log("Jarak:", distance, "meter");

  if (distance <= area.radius) {
    status = "hadir";
  }

  const keterangan =
    now > batasTepatWaktu ? "Terlambat" : "Tepat Waktu";

  const absen = await prisma.attendance.create({
    data: {
      userId,
      date: now, // simpan full timestamp check-in
      checkIn: now,
      status,
      keterangan,
      lateMinutes,
      photo: photoUrl, // 🔹 simpan url foto
      latitude,
      longitude,
    },
  });

  return NextResponse.json(absen, { status: 201 });
}
