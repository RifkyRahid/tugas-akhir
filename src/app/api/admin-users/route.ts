import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: Ambil semua user dengan role 'admin'
export async function GET() {
  try {
    const admins = await prisma.user.findMany({
      where: { role: "admin" },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        // Kita tidak ambil password
      }
    });
    return NextResponse.json(admins);
  } catch (error) {
    return NextResponse.json({ message: "Gagal mengambil data admin" }, { status: 500 });
  }
}

// POST: Tambah Admin Baru
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, password } = body;

    // Cek email duplikat
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ message: "Email sudah terdaftar" }, { status: 400 });
    }

    const newAdmin = await prisma.user.create({
      data: {
        name,
        email,
        password, // Idealnya di-hash dulu (bcrypt), tapi sesuai kodemu saat ini kita simpan raw dulu
        role: "admin", // PENTING: Set role jadi admin
        isActive: true,
        joinDate: new Date(), // Default
      },
    });

    return NextResponse.json(newAdmin, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: "Gagal menambah admin" }, { status: 500 });
  }
}