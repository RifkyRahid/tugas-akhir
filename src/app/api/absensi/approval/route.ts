import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const { id, status } = await req.json();

  if (!["hadir", "alpha"].includes(status)) {
    return NextResponse.json({ error: "Status tidak valid" }, { status: 400 });
  }

  const updated = await prisma.attendance.update({
    where: { id },
    data: { status },
  });

  return NextResponse.json(updated);
}
