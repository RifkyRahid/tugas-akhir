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
