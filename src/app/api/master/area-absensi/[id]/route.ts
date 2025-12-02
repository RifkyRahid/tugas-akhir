import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// UPDATE (PUT)
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } } // UBAH BAGIAN INI
) {
  try {
    const { id } = params; // UBAH JUGA CARA MENGAMBIL ID
    const body = await req.json();

    const updated = await prisma.attendanceArea.update({
      where: { id: Number(id) },
      data: {
        name: body.nama_area,
        latitude: body.latitude, 
        longitude: body.longitude,
        radius: body.radius,
        alamat: body.alamat,
      },
    });

    return NextResponse.json(updated, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } } // UBAH BAGIAN INI
) {
  try {
    const { id } = params; // UBAH JUGA CARA MENGAMBIL ID

    await prisma.attendanceArea.delete({
      where: { id: Number(id) },
    });

    return NextResponse.json(
      { message: "Area absensi berhasil dihapus" },
      { status: 200 }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}


