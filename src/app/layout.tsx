import "@/styles/globals.css";

export const metadata = {
  title: 'Absensi App',
  description: 'Aplikasi Absensi RAM Showroom',
  manifest: '/manifest.json',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600&display=swap"
          rel="stylesheet"
        />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#003366" />
        <link rel="icon" href="/icons/icon-192x192.png" />
      </head>
      <body>{children}</body>
    </html>
  )
}
