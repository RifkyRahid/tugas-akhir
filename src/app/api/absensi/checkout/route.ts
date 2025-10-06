// /src/app/api/absensi/checkOut/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(req: NextRequest) {
  const userId = req.cookies.get("userId")?.value

  if (!userId) {
    return NextResponse.json({ error: "User belum login" }, { status: 401 })
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const attendance = await prisma.attendance.findFirst({
    where: {
      userId,
      date: {
        gte: today,
        lt: tomorrow,
      },
    },
  });

  if (!attendance) {
    return NextResponse.json({ error: "Belum absen masuk hari ini" }, { status: 404 })
  }

  if (attendance.checkOut) {
    return NextResponse.json({ error: "Sudah absen pulang" }, { status: 400 })
  }

  const updated = await prisma.attendance.update({
    where: { id: attendance.id },
    data: {
      checkOut: new Date(),
      status: "hadir", // atau sesuaikan enum kamu
    },
  })

  return NextResponse.json({ message: "Absen pulang berhasil", data: updated })
}
