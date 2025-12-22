import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // Sesuaikan import prisma kamu

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      where: { role: "karyawan" },
      include: {
        area: true,
        jabatan: {
          include: { department: true }
        }
      },
      orderBy: { createdAt: "desc" },
    });

    const safeUsers = users.map((user) => {
      // @ts-ignore
      const { password, ...rest } = user;
      return rest;
    });

    return NextResponse.json(safeUsers);
  } catch (error) {
    return NextResponse.json({ error: "Gagal fetch data" }, { status: 500 });
  }
}

// POST: Tambah Karyawan Baru (UPDATE FITUR CUTI)
export async function POST(req: Request) {
  try {
    const body = await req.json();
    // Tambahkan field baru: birthDate, yearlyLeaveQuota, leaveUsedManual
    const { name, email, password, positionId, areaId, joinDate, birthDate, yearlyLeaveQuota, leaveUsedManual } = body;

    // Cek email duplikat
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
        return NextResponse.json({ message: "Email sudah terdaftar" }, { status: 400 });
    }

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: password, 
        role: "karyawan",
        positionId: positionId ? Number(positionId) : null,
        areaId: areaId ? Number(areaId) : null,
        joinDate: new Date(joinDate),
        
        // --- DATA BARU ---
        birthDate: birthDate ? new Date(birthDate) : null, // Tanggal Lahir
        yearlyLeaveQuota: yearlyLeaveQuota ? Number(yearlyLeaveQuota) : 12, // Default 12
        leaveUsedManual: leaveUsedManual ? Number(leaveUsedManual) : 0,     // Saldo Awal
        
        position: "-", 
      },
    });

    return NextResponse.json(newUser);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Gagal membuat user" }, { status: 500 });
  }
}