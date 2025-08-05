import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const data = await prisma.attendance.findMany({
    where: { status: "pending" },
    include: { user: true },
    orderBy: { date: "desc" },
  });

  return NextResponse.json(data);
}
