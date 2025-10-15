import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  try {
    // Memberitahu server untuk "melupakan" sesi dengan menghapus cookie
    const cookieStore = cookies();
    cookieStore.delete('auth_token');

    return NextResponse.json({ message: 'Logout berhasil' }, { status: 200 });
  } catch (error) {
    console.error("Error saat logout:", error);
    return NextResponse.json({ message: 'Terjadi kesalahan saat logout' }, { status: 500 });
  }
}
