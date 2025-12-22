import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// PUT: Update Nama Departemen
export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = Number(params.id);
    const body = await req.json();
    const { name } = body;

    const updated = await prisma.department.update({
      where: { id },
      data: { name },
    });

    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: "Gagal update" }, { status: 500 });
  }
}

// DELETE: Hapus Departemen
export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = Number(params.id);

    // Cek apakah masih ada jabatan di dalamnya?
    const countPos = await prisma.position.count({ where: { departmentId: id } });
    if (countPos > 0) {
       // Opsional: Bisa ditolak, atau dihapus paksa (cascade manual)
       // Disini kita pilih hapus paksa jabatannya dulu biar bersih (Transaction)
       await prisma.$transaction([
         prisma.position.deleteMany({ where: { departmentId: id } }),
         prisma.department.delete({ where: { id } })
       ]);
    } else {
       await prisma.department.delete({ where: { id } });
    }

    return NextResponse.json({ message: "Terhapus" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Gagal hapus" }, { status: 500 });
  }
}