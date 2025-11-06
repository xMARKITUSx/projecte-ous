// app/layout.tsx
'use client'; // ¡Importante! Nuestro Provider usa estado, así que el layout debe ser un Client Component

import { Inter } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/contexts/LanguageContext"; // Importamos nuestro Provider

const inter = Inter({ subsets: ["latin"] });

// No necesitamos metadata aquí porque es un Client Component
// export const metadata: Metadata = { ... };

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={inter.className}>
        {/* Envolvemos toda la aplicación con nuestro LanguageProvider */}
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
