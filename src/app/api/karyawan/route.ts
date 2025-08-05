// src/app/api/karyawan/route.ts
import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  const users = await prisma.user.findMany({
    where: {
      role: 'karyawan',
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  return NextResponse.json(users)
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password, position, joinDate } = body;

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password,
        role: "karyawan",
        position,
        joinDate: new Date(joinDate),
        isActive: true,
      },
    });

    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    console.error("Gagal tambah user:", error);
    return NextResponse.json({ error: "Gagal tambah user" }, { status: 500 });
  }
}