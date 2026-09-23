import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Invela Control | Sistem Inventaris Laboratorium",
    template: "%s | Invela Control",
  },
  description:
    "Invela Control adalah sistem inventaris laboratorium sekolah untuk manajemen aset, pemakaian, peminjaman, pelaporan kerusakan, dan riwayat perbaikan secara terpusat.",
  keywords: [
    "inventaris laboratorium sekolah",
    "manajemen aset sekolah",
    "sistem inventaris sekolah",
    "peminjaman barang laboratorium",
    "laporan kerusakan aset",
    "riwayat perbaikan barang",
    "monitoring laboratorium",
    "manajemen aset pendidikan",
  ],
  authors: [{ name: "Invela Control" }],
  creator: "Invela Control",
  publisher: "Invela Control",
  applicationName: "Invela Control",
  alternates: {
    canonical: "/",
  },
  icons: {
    icon: [
      { url: "/logoRounded.png", type: "image/png" },
    ],
    apple: [
      { url: "/logoRounded.png", type: "image/png" },
    ],
  },
  category: "education",
  classification: "Education Technology",
  referrer: "origin-when-cross-origin",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: "/",
    siteName: "Invela Control",
    title: "Invela Control | Sistem Inventaris Laboratorium",
    description:
      "Sistem inventaris laboratorium sekolah untuk manajemen aset, pemakaian, peminjaman, pelaporan kerusakan, dan riwayat perbaikan secara terpusat.",
    images: [
      {
        url: "/opengraph-image",
        width: 1200,
        height: 630,
        alt: "Invela Control - Sistem Inventaris Laboratorium",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Invela Control | Sistem Inventaris Laboratorium",
    description:
      "Sistem inventaris laboratorium sekolah untuk manajemen aset, pemakaian, peminjaman, pelaporan kerusakan, dan riwayat perbaikan secara terpusat.",
    images: ["/twitter-image"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}