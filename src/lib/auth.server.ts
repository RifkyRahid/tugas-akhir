// src/lib/auth.server.ts

import { NextRequest } from "next/server";
import { cookies } from "next/headers";

// FUNGSI INI HANYA UNTUK DIGUNAKAN DI SERVER (API Routes)
export function getUserIdFromSession(req: NextRequest): string | null {
  const cookieStore = cookies();
  const userIdCookie = cookieStore.get("userId");

  if (!userIdCookie || !userIdCookie.value) {
    return null;
  }
  
  return userIdCookie.value;
}