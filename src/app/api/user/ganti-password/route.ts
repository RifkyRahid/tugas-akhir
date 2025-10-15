import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getUserIdFromSession } from "@/lib/auth.server";

// --- PERINGATAN KEAMANAN ---
// Kode ini menyimpan dan membandingkan password dalam bentuk teks biasa.
// Sangat direkomendasikan untuk menggunakan hashing (seperti bcrypt) di aplikasi produksi.

export async function POST(req: NextRequest) {
  try {
    // Fungsi ini sekarang akan berhasil karena login sudah membuat cookie 'userId'
    const userId = getUserIdFromSession(req); 
    if (!userId) {
      return NextResponse.json(
        { message: "Akses ditolak: Anda tidak terautentikasi." },
        { status: 401 }
      );
    }

    const { oldPassword, newPassword } = await req.json();
    if (!oldPassword || !newPassword) {
      return NextResponse.json(
        { message: "Password lama dan password baru wajib diisi." },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || !user.password) {
      return NextResponse.json(
        { message: "User tidak ditemukan." },
        { status: 404 }
      );
    }

    // Membandingkan password lama (teks biasa)
    if (oldPassword !== user.password) {
      return NextResponse.json(
        { message: "Password lama yang Anda masukkan salah." },
        { status: 400 }
      );
    }

    // Menyimpan password baru (teks biasa)
    await prisma.user.update({
      where: { id: userId },
      data: { password: newPassword },
    });

    return NextResponse.json(
      { message: "Password berhasil diubah!" },
      { status: 200 }
    );
    
  } catch (error) {
    console.error("Error saat mengubah password:", error);
    return NextResponse.json(
      { message: "Terjadi kesalahan internal pada server." },
      { status: 500 }
    );
  }
}

