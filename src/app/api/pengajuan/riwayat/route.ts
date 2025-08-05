import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

// opsional, bisa dipertahankan
export const runtime = "edge"; // atau hapus sekalian

export async function GET() {
  try {
    const cookieStore = await cookies(); // ✅ pakai await
    const userId = cookieStore.get("userId")?.value;

    if (!userId) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const leaveRequests = await prisma.leaveRequest.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(leaveRequests);
  } catch (error) {
    console.error("Error fetching leave requests:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
