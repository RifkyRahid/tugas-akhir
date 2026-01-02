import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    
    // --- 1. Ambil Parameter Filter ---
    const jenis = searchParams.get("jenis") || undefined;
    const status = searchParams.get("status") || undefined;
    const year = searchParams.get("year");   // Filter Tahun
    const month = searchParams.get("month"); // Filter Bulan (0-11)
    
    // --- 2. Ambil Parameter Pagination ---
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10"); // Default 10 data per halaman
    const skip = (page - 1) * limit;

    // --- 3. Bangun Query Where ---
    const whereClause: any = {};

    if (jenis) whereClause.type = jenis;
    if (status) whereClause.status = status;

    // Logika Filter Tanggal (Berdasarkan startDate cuti)
    if (year) {
      const targetYear = parseInt(year);
      const startFilter = new Date(targetYear, 0, 1); // 1 Jan
      const endFilter = new Date(targetYear, 11, 31, 23, 59, 59); // 31 Des

      // Jika Bulan dipilih juga
      if (month) {
        const targetMonth = parseInt(month); // 1-12
        startFilter.setMonth(targetMonth - 1); // JS Month mulai dari 0
        startFilter.setDate(1);
        
        // Akhir bulan (trik ambil tanggal 0 bulan depannya)
        endFilter.setFullYear(targetYear);
        endFilter.setMonth(targetMonth);
        endFilter.setDate(0); 
      }

      whereClause.startDate = {
        gte: startFilter,
        lte: endFilter,
      };
    }

    // --- 4. Eksekusi Query dengan Transaksi (Hitung Total & Ambil Data) ---
    const [totalData, requests] = await prisma.$transaction([
      prisma.leaveRequest.count({ where: whereClause }),
      prisma.leaveRequest.findMany({
        where: whereClause,
        orderBy: { createdAt: "desc" }, // Data terbaru di atas
        skip: skip,
        take: limit,
        include: {
          user: {
            select: { name: true, jabatan: { select: { title: true } } }
          }
        }
      }),
    ]);

    // --- 5. Return Data & Meta Pagination ---
    return NextResponse.json({
      data: requests,
      meta: {
        totalData,
        totalPages: Math.ceil(totalData / limit),
        currentPage: page,
        limit,
      }
    });

  } catch (error) {
    console.error("Error API Admin Pengajuan:", error);
    return NextResponse.json({ message: "Error server" }, { status: 500 });
  }
}