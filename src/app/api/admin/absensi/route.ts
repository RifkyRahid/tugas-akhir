import { NextResponse } from "next/server";
import prisma from "@/lib/prisma"; // pastikan path prisma sesuai dengan project kamu

export const dynamic = 'force-dynamic';
export const revalidate = 0;
// 👆 INI PERINTAH MUTLAK UNTUK MEMATIKAN CACHE

export async function GET() {
  try {
    const dataAbsensi = await prisma.attendance.findMany({
      orderBy: {
        date: "desc",
      },
      include: {
        user: {
          select: {
            name: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      data: dataAbsensi,
    });
  } catch (error) {
    console.error("Error fetching admin absensi:", error);
    return NextResponse.json({ success: false, message: "Gagal mengambil data absensi" }, { status: 500 });
  }
}
