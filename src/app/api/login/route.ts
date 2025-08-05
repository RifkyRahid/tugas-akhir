import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json()

    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      return NextResponse.json({ message: 'User tidak ditemukan' }, { status: 404 })
    }

    if (user.password !== password) {
      return NextResponse.json({ message: 'Password salah' }, { status: 401 })
    }

    // ✅ Set cookie via NextResponse
    const response = NextResponse.json({
      message: 'Login berhasil',
      role: user.role,
      userId: user.id,
    })

    response.cookies.set('userId', user.id, {
      httpOnly: true,
      path: '/',
    })

    return response

  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { message: 'Terjadi kesalahan pada server' },
      { status: 500 }
    )
  }
}
