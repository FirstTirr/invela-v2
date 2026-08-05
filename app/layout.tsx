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
    default: "Invela Control | Inventaris Laboratorium",
    template: "%s | Invela Control",
  },
  description:
    "Sistem manajemen inventaris laboratorium untuk pemakaian, peminjaman, laporan kerusakan, dan pemeliharaan aset sekolah.",
  keywords: [
    "inventaris laboratorium",
    "manajemen aset sekolah",
    "peminjaman laboratorium",
    "laporan kerusakan",
    "pemeliharaan aset",
    "sistem inventaris sekolah",
  ],
  authors: [{ name: "Invela Control" }],
  creator: "Invela Control",
  publisher: "Invela Control",
  applicationName: "Invela Control",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: "/",
    siteName: "Invela Control",
    title: "Invela Control | Inventaris Laboratorium",
    description:
      "Sistem manajemen inventaris laboratorium untuk pemakaian, peminjaman, laporan kerusakan, dan pemeliharaan aset sekolah.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Invela Control | Inventaris Laboratorium",
    description:
      "Sistem manajemen inventaris laboratorium untuk pemakaian, peminjaman, laporan kerusakan, dan pemeliharaan aset sekolah.",
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