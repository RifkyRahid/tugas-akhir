import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const employees = await prisma.user.findMany({
      where: {
        role: "karyawan",
        isActive: true, 
      },
      select: {
        id: true,
        name: true,
        // Data jabatan & departemen sudah diambil disini, jadi aman.
        jabatan: {
            select: {
                title: true, 
                department: {
                    select: { name: true } 
                }
            }
        }
      },
      orderBy: {
        name: 'asc',
      },
    });

    return NextResponse.json(employees);

  } catch (error) {
    console.error("Gagal ambil karyawan:", error);
    return NextResponse.json(
      { error: "Gagal mengambil data karyawan" },
      { status: 500 }
    );
  }
}