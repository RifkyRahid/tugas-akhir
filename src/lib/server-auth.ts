// import { cookies } from "next/headers";
// import { prisma } from "./prisma";

// export async function getCurrentUser() {
//   const cookieStore = cookies(); // ✅ TANPA await
//   const userId = cookieStore.get("userId")?.value;

//   if (!userId) return null;

//   const user = await prisma.user.findUnique({
//     where: { id: userId },
//     select: {
//       id: true,
//       name: true,
//       position: true,
//       email: true,
//       role: true,
//     },
//   });

//   return user;
// }

// MAU BIKIN FITUR NAMPILIN DATA PENGGUNA DI DASHBOARD TAPI ERROR 
