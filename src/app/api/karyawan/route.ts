import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // Sesuaikan path import prisma kamu

// PENTING: Tambahkan ini agar Next.js selalu ambil data terbaru (tidak cache)
export const dynamic = 'force-dynamic';

// GET: Ambil Data Karyawan (Support Filter Status)
export async function GET(req: Request) {
  try {
    // 1. Ambil parameter dari URL (contoh: /api/karyawan?status=active)
    const { searchParams } = new URL(req.url);
    const statusParam = searchParams.get("status"); // 'active' | 'inactive' | null

    // 2. Siapkan kondisi filter dasar (Role Karyawan)
    let whereCondition: any = { role: "karyawan" };

    // 3. Tambahkan filter isActive sesuai parameter
    if (statusParam === "active") {
      whereCondition.isActive = true;
    } else if (statusParam === "inactive") {
      whereCondition.isActive = false;
    }
    // Jika statusParam kosong atau 'all', maka isActive tidak difilter (tampil semua)

    // 4. Query Database
    const users = await prisma.user.findMany({
      where: whereCondition,
      include: {
        area: true,
        jabatan: {
          include: { department: true }
        }
      },
      orderBy: { createdAt: "desc" },
    });

    // 5. Bersihkan password dari hasil return
    const safeUsers = users.map((user) => {
      // @ts-ignore
      const { password, ...rest } = user;
      return rest;
    });

    return NextResponse.json(safeUsers);
  } catch (error) {
    console.error("Error fetching employees:", error);
    return NextResponse.json({ error: "Gagal fetch data" }, { status: 500 });
  }
}

// POST: Tambah Karyawan Baru (Kode Asli Kamu, Tetap Aman)
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
        isActive: true, // Default user baru pasti aktif
        
        // --- DATA TAMBAHAN (Sesuai kode lama kamu) ---
        birthDate: birthDate ? new Date(birthDate) : null, // Tanggal Lahir
        yearlyLeaveQuota: yearlyLeaveQuota ? Number(yearlyLeaveQuota) : 12, // Default 12
        leaveUsedManual: leaveUsedManual ? Number(leaveUsedManual) : 0,     // Saldo Awal
        
        position: "-", // Fallback string
      },
    });

    return NextResponse.json(newUser);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Gagal membuat user" }, { status: 500 });
  }
}