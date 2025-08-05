// GET /api/absensi/status
import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET(req: NextRequest) {
  const userId = req.cookies.get("userId")?.value

  if (!userId) {
    return NextResponse.json({ error: "User belum login" }, { status: 401 })
  }

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const attendance = await prisma.attendance.findFirst({
    where: {
      userId,
      date: today,
    },
  })

  return NextResponse.json({ attendance }) // bisa null kalau belum absen
}
