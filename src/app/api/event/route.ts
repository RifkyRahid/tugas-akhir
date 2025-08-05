import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, date, description, type } = body;

    if (!title || !date || !type) {
      return NextResponse.json({ error: "Field tidak lengkap" }, { status: 400 });
    }

    const newEvent = await prisma.eventReminder.create({
      data: {
        title,
        date: new Date(date),
        description,
        type,
      },
    });

    return NextResponse.json(newEvent, { status: 201 });
  } catch (error) {
    console.error("Gagal membuat event:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
