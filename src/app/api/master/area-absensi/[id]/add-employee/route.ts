import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";

// GET: Cari karyawan yang BELUM punya area (untuk dropdown tambah)
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q") || "";

    if (query.length < 2) return NextResponse.json({ data: [] });

    const users = await prisma.user.findMany({
      where: {
        AND: [
          { isActive: true },
          { areaId: null }, // PENTING: Hanya cari yang belum punya area
          {
            OR: [
              { name: { contains: query, mode: "insensitive" } },
              { email: { contains: query, mode: "insensitive" } },
            ],
          },
        ],
      },
      take: 5,
      select: {
        id: true,
        name: true,
        email: true,
        position: true,
        jabatan: { // Include jabatan biar dropdown search juga rapi
            select: { title: true }
        }
      },
    });

    return NextResponse.json({ data: users });
  } catch (error) {
    return NextResponse.json({ error: "Search Error" }, { status: 500 });
  }
}

// POST: Masukkan karyawan ke Area ini
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const areaId = parseInt(params.id);
    const body = await req.json();
    const { userId } = body;

    if (!userId) return NextResponse.json({ error: "User ID required" }, { status: 400 });

    // Update User
    await prisma.user.update({
      where: { id: userId },
      data: { areaId: areaId },
    });

    return NextResponse.json({ message: "Sukses ditambahkan" });
  } catch (error) {
    return NextResponse.json({ error: "Gagal menambahkan" }, { status: 500 });
  }
}