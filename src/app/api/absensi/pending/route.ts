import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const dateParam = searchParams.get("date"); 

  if (!dateParam) return NextResponse.json([]);

  const startDate = new Date(dateParam);
  startDate.setHours(0, 0, 0, 0);
  
  const endDate = new Date(dateParam);
  endDate.setHours(23, 59, 59, 999);

  const data = await prisma.attendance.findMany({
    where: {
      // LOGIKA BARU:
      // Ambil yang statusnya "pending" (data lama)
      // ATAU yang punya flag "isViolation" (data baru yg sudah diapprove/reject)
      OR: [
        { status: "pending" },
        { isViolation: true }
      ],
      
      // TAPI JANGAN AMBIL YANG SUDAH DIHAPUS SUPERADMIN
      isPendingDeleted: false, 

      date: {
        gte: startDate,
        lte: endDate,
      },
    },
    include: { 
      user: {
        include: { area: true }
      } 
    },
    orderBy: { checkIn: "asc" }, 
  });

  return NextResponse.json(data);
}

// === TAMBAHAN ENDPOINT DELETE (KHUSUS SUPERADMIN) ===
// Kita gabung saja DELETE di file route yang sama untuk kemudahan
export async function DELETE(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        if(!id) return NextResponse.json({error: "ID required"}, {status:400});

        // Cek Role Admin
        const cookieStore = await cookies();
        const userId = cookieStore.get("userId")?.value;
        const user = await prisma.user.findUnique({where: {id: userId}});

        if (user?.role !== 'superadmin') {
            return NextResponse.json({message: "Hanya Superadmin"}, {status: 403});
        }

        // SOFT DELETE: Hanya set flag hidden, data asli aman
        await prisma.attendance.update({
            where: { id },
            data: { isPendingDeleted: true }
        });

        return NextResponse.json({message: "Success soft delete"});
    } catch(e) {
        return NextResponse.json({message: "Error"}, {status:500});
    }
}