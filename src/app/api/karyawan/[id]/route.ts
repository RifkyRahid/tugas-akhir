export async function PUT(req: Request, _context: any) {
  const { id } = _context.params;
  const body = await req.json();

  try {
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        name: body.name,
        email: body.email,
        password: body.password,
        position: body.position,
        joinDate: body.joinDate ? new Date(body.joinDate) : undefined,
        areaId: body.areaId ? Number(body.areaId) : null,
        // tambahkan field lain sesuai kebutuhan
      },
    });
    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error("Gagal update user:", error);
    return NextResponse.json({ error: "Gagal update user" }, { status: 500 });
  }
}
import { NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GANTI PARAMETER kedua dari destructuring → _context: any
export async function DELETE(_req: Request, _context: any) {
  const { id } = _context.params

  try {
    const deletedUser = await prisma.user.delete({
      where: { id },
    })

    return NextResponse.json(deletedUser)
  } catch (error) {
    console.error('Gagal hapus user:', error)
    return NextResponse.json({ error: 'Gagal hapus user' }, { status: 500 })
  }
}
