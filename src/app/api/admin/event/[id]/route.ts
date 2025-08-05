import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function PUT(req: Request, _context: any) {
  try {
    const { id } = _context.params
    const body = await req.json()
    const { title, description, date, type } = body

    const updated = await prisma.eventReminder.update({
      where: { id },
      data: { title, description, date: new Date(date), type },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error("Error update event:", error)
    return NextResponse.json({ error: "Gagal update event" }, { status: 500 })
  }
}

export async function DELETE(_req: Request, _context: any) {
  try {
    const { id } = _context.params

    await prisma.eventReminder.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error delete event:", error)
    return NextResponse.json({ error: "Gagal hapus event" }, { status: 500 })
  }
}
