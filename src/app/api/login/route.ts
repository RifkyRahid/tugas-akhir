import { NextRequest, NextResponse } from 'next/server';
import prisma from "@/lib/prisma"; // Gunakan instance prisma yang sama

export async function POST(req: NextRequest) { // Gunakan NextRequest
  try {
    const { email, password } = await req.json();

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json({ message: 'User tidak ditemukan' }, { status: 404 });
    }

    if (user.password !== password) {
      return NextResponse.json({ message: 'Password salah' }, { status: 401 });
    }

    // Ambil data user tanpa password untuk dikirim ke client
    const { password: _, ...userWithoutPassword } = user;
    
    // Buat respons dengan data user
    const response = NextResponse.json(userWithoutPassword);

    // Set cookie di respons tersebut
    response.cookies.set('userId', String(user.id), { // Pastikan value adalah string
      httpOnly: true,
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24, // 1 hari
    });

    return response;

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { message: 'Terjadi kesalahan pada server' },
      { status: 500 }
    );
  }
}
