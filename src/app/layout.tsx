import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/layout/theme-provider";
// ServiceWorkerRegistration is only imported in production builds

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "UniLife — Персональный трекер жизни",
  description: "Дневник, финансы, питание, тренировки, коллекции и социальная лента — всё в одном месте",
  keywords: ["UniLife", "трекер", "дневник", "финансы", "питание", "тренировки", "коллекции"],
  icons: {
    icon: "/unilife-logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <head>
        {/* PWA manifest link removed — was causing browser reload behavior in dev */}
        <meta name="theme-color" content="#059669" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="UniLife" />
        <meta name="description" content="Универсальный трекер жизни: дневник, финансы, питание, тренировки, привычки и многое другое" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          {children}
          <Toaster />
          <SonnerToaster richColors position="top-right" />
          {/* Service worker registration removed for dev stability */}
        </ThemeProvider>
      </body>
    </html>
  );
}
