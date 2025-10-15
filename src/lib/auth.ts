import { NextRequest } from "next/server";
import { cookies } from "next/headers";

// --- FUNGSI UNTUK CLIENT-SIDE ---
// Fungsi ini tetap berguna untuk mengambil data user dari localStorage di UI.
export function getUserFromLocalStorage() {
  if (typeof window !== 'undefined') {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
  }
  return null;
}


// --- FUNGSI LOGOUT ---
// Fungsi ini menghapus data di client dan memanggil API untuk menghapus cookie di server.
export async function logoutUser() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem("user");
  }
  try {
    await fetch('/api/logout', {
      method: 'POST',
    });
  } catch (error) {
    console.error('Gagal saat proses logout di server:', error);
  }
}

