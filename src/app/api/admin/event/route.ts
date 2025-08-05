import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Ambil semua event
export async function GET() {
  try {
    const events = await prisma.eventReminder.findMany();
    return NextResponse.json(events);
  } catch (error) {
    console.error("Error ambil event:", error);
    return NextResponse.json({ error: "Gagal mengambil data event" }, { status: 500 });
  }
}

// Tambah event baru
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, description, date, type } = body;

    if (!title || !date || !type) {
      return NextResponse.json({ error: "Data tidak lengkap" }, { status: 400 });
    }

    const newEvent = await prisma.eventReminder.create({
      data: {
        title,
        description,
        date: new Date(date),
        type,
      },
    });

    return NextResponse.json(newEvent);
  } catch (error) {
    console.error("Error tambah event:", error);
    return NextResponse.json({ error: "Gagal menambahkan event" }, { status: 500 });
  }
}
