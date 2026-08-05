"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldCheck, UserCheck, GraduationCap, Wrench, Boxes, PieChart,
  ShieldAlert, Menu, X, Zap, Clock, Smartphone, Database,
  LayoutDashboard, Sparkles, Loader2, ArrowRight
} from "lucide-react";

import Footer from "@/components/footer";
import { useTheme } from "@/components/theme-provider";
import ThemeToggle from "@/components/theme-toggle";

// --- DATA CONSTANTS (Memisahkan data dari logika UI) ---
const NAV_LINKS = ["Tentang", "Fitur", "Cara Kerja", "Akses"];

const STATS = [
  { label: "Kemudahan Navigasi", value: "100%" },
  { label: "Kecepatan Input", value: "< 1 Detik" },
  { label: "Barang Terdaftar", value: "1,200+" },
  { label: "Uptime Server", value: "24/7" },
];

const FEATURES = [
  { icon: Database, title: "Database Terpusat", desc: "Sistem pencatatan barang terintegrasi dalam satu platform pusat.", color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20" },
  { icon: PieChart, title: "Analitik Real-time", desc: "Dashboard interaktif memantau kondisi barang dengan grafik intuitif.", color: "text-purple-400 bg-purple-500/10 border-purple-500/20" },
  { icon: ShieldAlert, title: "Keamanan Data Role", desc: "Akses sistem dilindungi otentikasi hak akses bertingkat.", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
  { icon: Zap, title: "Efisiensi Tinggi", desc: "Proses input & verifikasi perbaikan dilakukan cepat tanpa birokrasi rumit.", color: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
  { icon: Smartphone, title: "Akses Multi-Platform", desc: "Kelola inventaris dari mana saja lewat desktop, tablet, atau HP.", color: "text-pink-400 bg-pink-500/10 border-pink-500/20" },
  { icon: Clock, title: "Riwayat Peminjaman", desc: "Rekam jejak peminjaman & estimasi biaya perbaikan tercatat otomatis.", color: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
];

const STEPS = [
  { step: "01", title: "Input Data Barang", desc: "Admin/Kabeng memasukkan data barang, serial number, dan spesifikasi." },
  { step: "02", title: "Pelabelan & Code Unique", desc: "Setiap barang diberi penanda unik untuk memudahkan identifikasi fisik." },
  { step: "03", title: "Manajemen Sirkulasi & Servis", desc: "Peminjaman oleh siswa dan perbaikan oleh teknisi tercatat digital." },
  { step: "04", title: "Laporan Executive", desc: "Sistem menyajikan rekapitulasi penggunaan dan kesehatan aset." },
];

const ROLES = [
  {
    title: "Kepala Bengkel",
    role: "Kabeng Workspace",
    icon: Wrench,
    glow: "hover:shadow-[0_0_30px_rgba(59,130,246,0.3)] hover:border-blue-500/60",
    bgGradient: "from-blue-500/15 via-blue-600/5 to-transparent",
    accent: "text-blue-400 bg-blue-500/10 border-blue-500/20 group-hover:bg-blue-500 group-hover:text-white",
    arrowColor: "text-blue-400",
  },
  {
    title: "Kepala Program",
    role: "Kaprog Executive",
    icon: UserCheck,
    glow: "hover:shadow-[0_0_30px_rgba(168,85,247,0.3)] hover:border-purple-500/60",
    bgGradient: "from-purple-500/15 via-purple-600/5 to-transparent",
    accent: "text-purple-400 bg-purple-500/10 border-purple-500/20 group-hover:bg-purple-500 group-hover:text-white",
    arrowColor: "text-purple-400",
  },
  {
    title: "Waka Sarpras",
    role: "Sapras Global View",
    icon: ShieldCheck,
    glow: "hover:shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:border-emerald-500/60",
    bgGradient: "from-emerald-500/15 via-emerald-600/5 to-transparent",
    accent: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20 group-hover:bg-emerald-500 group-hover:text-white",
    arrowColor: "text-emerald-400",
  },
  {
    title: "Guru Produktif",
    role: "Practical Terminal",
    icon: GraduationCap,
    glow: "hover:shadow-[0_0_30px_rgba(244,63,94,0.3)] hover:border-rose-500/60",
    bgGradient: "from-rose-500/15 via-rose-600/5 to-transparent",
    accent: "text-rose-400 bg-rose-500/10 border-rose-500/20 group-hover:bg-rose-500 group-hover:text-white",
    arrowColor: "text-rose-400",
  },
];

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      name: "Invela Control",
      url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
      description:
        "Sistem manajemen inventaris laboratorium untuk pemakaian, peminjaman, laporan kerusakan, dan pemeliharaan aset sekolah.",
    },
    {
      "@type": "SoftwareApplication",
      name: "Invela Control",
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      url: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
      description:
        "Sistem manajemen inventaris laboratorium untuk pemakaian, peminjaman, laporan kerusakan, dan pemeliharaan aset sekolah.",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "IDR",
      },
    },
  ],
};

export default function Home() {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  const themeContext = useTheme ? useTheme() : { isLight: false };
  const isLight = themeContext?.isLight ?? false;

  // Cek Auth & Redirect Otomatis
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const user = JSON.parse(storedUser);
        const roleName = user?.role || user?.role?.name || user?.role_name;

        if (roleName && typeof roleName === "string") {
          const cleanRole = roleName.toLowerCase().trim();
          setIsLoggedIn(true);
          setUserRole(cleanRole);
          router.replace(`/${cleanRole}`);
          return;
        }
      }
    } catch (error) {
      console.error("Gagal membaca session user:", error);
    } finally {
      setCheckingAuth(false);
    }
  }, [router]);

  // Scroll Listener
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Helper Class Style untuk Mempersingkat Ternary Theme
  const theme = {
    bg: isLight ? "bg-slate-50 text-slate-900" : "bg-slate-950 text-white",
    cardBg: isLight ? "bg-white border-slate-200 shadow-xl" : "bg-linear-to-br from-slate-900 to-slate-950 border-white/10",
    navBg: isLight ? "bg-white/80 border-slate-200 shadow-sm" : "bg-slate-900/80 border-white/10",
    textSub: isLight ? "text-slate-600" : "text-slate-400",
    textHead: isLight ? "text-slate-900" : "text-white",
    border: isLight ? "border-slate-200" : "border-white/10",
    cardSub: isLight ? "bg-slate-50 border-slate-200" : "bg-slate-800/50 border-white/5",
  };

  if (checkingAuth && isLoggedIn) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 text-white font-sans">
        <Loader2 className="w-10 h-10 animate-spin text-cyan-400 mb-4" />
        <p className="text-sm font-semibold tracking-wide text-slate-400 animate-pulse">
          Mengarahkan ke Dashboard {userRole?.toUpperCase()}...
        </p>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-colors duration-300 ${theme.bg} selection:bg-cyan-500 selection:text-slate-900 overflow-x-hidden font-sans`}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      {/* Background Ambient */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className={`absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full blur-[120px] ${isLight ? "bg-blue-400/20" : "bg-blue-600/20"}`} />
        <div className={`absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full blur-[120px] ${isLight ? "bg-cyan-400/20" : "bg-cyan-600/20"}`} />
      </div>

      {/* Floating Navbar */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled ? "py-4" : "py-6"}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`mx-auto backdrop-blur-xl border rounded-2xl px-6 py-3 flex items-center justify-between transition-all duration-300 ${theme.navBg}`}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 flex items-center justify-center bg-linear-to-br from-cyan-500 to-blue-600 rounded-xl shadow-lg shadow-cyan-500/20 text-white font-bold">
                <Boxes className="w-5 h-5" />
              </div>
              <span className={`text-xl font-bold tracking-tight ${theme.textHead}`}>
                Inventaris<span className="text-cyan-400"> Labor</span>
              </span>
            </div>

            {/* Desktop Navigation Links */}
            <div className="hidden md:flex items-center gap-8">
              {NAV_LINKS.map((item) => (
                <a key={item} href={`#${item.toLowerCase().replace(" ", "-")}`} className={`text-sm font-medium transition-colors relative group ${theme.textSub}`}>
                  {item}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-cyan-400 transition-all group-hover:w-full" />
                </a>
              ))}
            </div>

            <div className="hidden md:flex items-center gap-4">
              {ThemeToggle && <ThemeToggle />}
              <Link
                href={isLoggedIn && userRole ? `/${userRole}` : "/login"}
                className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 ${
                  isLoggedIn
                    ? "bg-linear-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/25 hover:scale-105"
                    : isLight ? "bg-slate-900 text-white hover:bg-slate-800" : "bg-white text-slate-900 hover:bg-cyan-50"
                }`}
              >
                {isLoggedIn ? <LayoutDashboard className="w-4 h-4" /> : null}
                <span>{isLoggedIn ? "Dashboard" : "Login"}</span>
              </Link>
            </div>

            <button className={`md:hidden p-2 ${theme.textHead}`} onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className={`absolute top-full left-4 right-4 mt-2 p-4 backdrop-blur-xl border rounded-2xl flex flex-col gap-4 md:hidden ${theme.navBg}`}>
            {NAV_LINKS.map((item) => (
              <a key={item} href={`#${item.toLowerCase().replace(" ", "-")}`} onClick={() => setMobileMenuOpen(false)} className={`font-medium ${theme.textSub}`}>
                {item}
              </a>
            ))}
            <div className="flex items-center justify-between border-t pt-4 border-slate-200/10">
              <span className="text-sm font-medium">Tema Visual</span>
              {ThemeToggle && <ThemeToggle />}
            </div>
            <Link
              href={isLoggedIn && userRole ? `/${userRole}` : "/login"}
              onClick={() => setMobileMenuOpen(false)}
              className="text-center py-3 bg-cyan-500 text-slate-900 rounded-xl font-bold flex items-center justify-center gap-2"
            >
              {isLoggedIn && <LayoutDashboard className="w-4 h-4" />}
              <span>{isLoggedIn ? `Buka Dashboard (${userRole?.toUpperCase()})` : "Login Portal"}</span>
            </Link>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 px-4 sm:px-6 lg:px-8 z-10">
        <div className="max-w-5xl mx-auto text-center">
          <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium mb-8 backdrop-blur-sm ${isLight ? "bg-white/50 border-slate-200 text-cyan-600" : "bg-white/5 border-white/10 text-cyan-300"}`}>
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            web-based labor inventory control system
          </div>

          <h1 className={`text-5xl sm:text-7xl font-extrabold tracking-tight mb-8 leading-tight ${theme.textHead}`}>
            Inventaris Labor <br />
            <span className="text-transparent bg-clip-text bg-linear-to-r from-cyan-400 via-blue-500 to-purple-600">
              Berbasis Website Modern
            </span>
          </h1>

          <p className={`text-lg sm:text-xl mb-12 max-w-2xl mx-auto leading-relaxed ${theme.textSub}`}>
            Revolusi sistem inventaris sekolah dengan teknologi Website yang akurat, cepat, dan transparan.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <a href="#cara-kerja" className="group relative px-8 py-4 bg-cyan-500 text-slate-900 rounded-2xl font-bold text-lg overflow-hidden transition-all hover:scale-105 shadow-lg shadow-cyan-500/20">
              <span className="relative flex items-center gap-2">
                <Sparkles className="w-5 h-5" /> Pelajari Lebih Lanjut
              </span>
            </a>
            <a href="#akses" className={`px-8 py-4 border rounded-2xl font-bold text-lg transition-all hover:scale-105 backdrop-blur-sm ${isLight ? "bg-white/50 border-slate-200 text-slate-700" : "bg-white/5 border-white/10 text-white"}`}>
              Portal Akses
            </a>
          </div>

          {/* Stats Strip */}
          <div className={`mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 border-t pt-12 ${theme.border}`}>
            {STATS.map((stat, idx) => (
              <div key={idx} className="text-center">
                <div className={`text-3xl font-bold mb-1 ${theme.textHead}`}>{stat.value}</div>
                <div className="text-sm text-slate-500 uppercase tracking-wider font-semibold">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="tentang" className="py-24 relative z-10 scroll-mt-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`rounded-3xl border p-8 md:p-16 relative overflow-hidden ${theme.cardBg}`}>
            <div className="relative z-10 flex flex-col md:flex-row gap-12 items-center">
              <div className="w-full md:w-1/2">
                <h2 className={`text-3xl md:text-4xl font-bold mb-6 ${theme.textHead}`}>Revolusi Pencatatan Fasilitas Labor</h2>
                <p className={`mb-6 leading-relaxed ${theme.textSub}`}>
                  Sistem Inventaris Labor bukan sekadar alat pencatatan. Ini adalah langkah awal menuju digitalisasi manajemen aset sekolah.
                </p>
                <div className="flex flex-wrap gap-4">
                  {["Digital Inventory", "Asset Tracking", "Smart Lab", "Real-time Monitoring"].map((tag, idx) => (
                    <span key={idx} className={`px-4 py-2 rounded-full border text-sm ${theme.cardSub} ${theme.textSub}`}># {tag}</span>
                  ))}
                </div>
              </div>

              <div className="w-full md:w-1/2 grid grid-cols-2 gap-4">
                {[
                  { label: "Kecurangan Data", val: "0%", color: "text-cyan-400" },
                  { label: "Lebih Efisien", val: "50%", color: "text-purple-400" },
                  { label: "Barang Terdata", val: "1k+", color: "text-emerald-400" },
                  { label: "Monitoring Status", val: "24h", color: "text-rose-400" },
                ].map((item, idx) => (
                  <div key={idx} className={`p-6 rounded-2xl border backdrop-blur-sm ${theme.cardSub}`}>
                    <div className={`text-3xl font-bold mb-1 ${item.color}`}>{item.val}</div>
                    <div className="text-xs text-slate-500 uppercase tracking-wider font-medium">{item.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="fitur" className={`py-24 relative z-10 scroll-mt-28 ${isLight ? "bg-slate-50/50" : "bg-slate-900/50"}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${theme.textHead}`}>Teknologi Masa Depan</h2>
            <p className={`max-w-2xl mx-auto ${theme.textSub}`}>Alur kerja terstruktur dan sistem cerdas untuk fasilitas labor.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {FEATURES.map((item, idx) => {
              const IconComp = item.icon;
              return (
                <div key={idx} className={`p-8 rounded-3xl backdrop-blur-md border transition-all duration-300 hover:-translate-y-2 group ${isLight ? "bg-white border-slate-200 shadow-sm" : "bg-slate-950/50 border-slate-800"}`}>
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform ${item.color}`}>
                    <IconComp className="w-6 h-6" />
                  </div>
                  <h3 className={`text-xl font-bold mb-4 ${theme.textHead}`}>{item.title}</h3>
                  <p className={`leading-relaxed text-sm ${theme.textSub}`}>{item.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="cara-kerja" className="py-24 relative z-10 scroll-mt-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center gap-16">
            <div className="w-full md:w-1/2">
              <h2 className={`text-3xl md:text-4xl font-bold mb-6 ${theme.textHead}`}>Cara Kerja Sistem</h2>
              <div className="space-y-8">
                {STEPS.map((item, idx) => (
                  <div key={idx} className="flex gap-6">
                    <div className={`shrink-0 w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${theme.cardSub} text-cyan-400`}>
                      {item.step}
                    </div>
                    <div>
                      <h3 className={`text-xl font-bold mb-2 ${theme.textHead}`}>{item.title}</h3>
                      <p className={theme.textSub}>{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Terminal Preview */}
            <div className="w-full md:w-1/2 relative">
              <div className="relative rounded-3xl p-8 shadow-2xl bg-slate-900 border border-slate-800 font-mono text-sm">
                <div className="flex items-center justify-between mb-8 border-b border-slate-800 pb-4">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                  </div>
                  <span className="text-slate-500 text-xs">System Status: ONLINE</span>
                </div>
                <div className="space-y-4">
                  <p className="flex justify-between text-slate-300"><span>[SYS] Initializing Dashboard...</span><span className="text-green-400">OK</span></p>
                  <p className="flex justify-between text-slate-300"><span>[DB] Loading Asset Instances...</span><span className="text-green-400">Done</span></p>
                  <p className="flex justify-between text-slate-300"><span>[SYNC] Verifying User Roles...</span><span className="text-green-400">Synced</span></p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Access Portal Section - Enhanced with Glassmorphism & Modern Animations */}
      <section id="akses" className="py-24 relative z-10 scroll-mt-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className={`text-4xl font-bold mb-4 ${theme.textHead}`}>Portal Akses Role</h2>
          <p className={`max-w-md mb-12 ${theme.textSub}`}>Pilih gerbang masuk sesuai kewenangan Anda.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {ROLES.map((item, idx) => {
              const RoleIcon = item.icon;
              return (
                <Link
                  key={idx}
                  href={isLoggedIn && userRole ? `/${userRole}` : "/login"}
                  className={`group relative h-80 p-6 rounded-3xl border backdrop-blur-xl flex flex-col justify-between overflow-hidden transition-all duration-500 hover:-translate-y-2.5 ${
                    isLight
                      ? "bg-white/80 border-slate-200 shadow-lg hover:shadow-2xl"
                      : `bg-slate-900/60 border-slate-800/80 ${item.glow}`
                  }`}
                >
                  {/* Ambient Gradient Glow Background */}
                  <div
                    className={`absolute inset-0 bg-linear-to-br ${item.bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none`}
                  />

                  {/* Top Section: Icon & Hover Arrow */}
                  <div className="relative z-10 flex items-center justify-between">
                    <div
                      className={`w-12 h-12 rounded-2xl border flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:rotate-6 shadow-md ${item.accent}`}
                    >
                      <RoleIcon className="w-6 h-6 transition-transform duration-300 group-hover:scale-110" />
                    </div>

                    {/* Animated Arrow Icon */}
                    <div
                      className={`opacity-0 -translate-x-3 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 ${item.arrowColor}`}
                    >
                      <ArrowRight className="w-6 h-6" />
                    </div>
                  </div>

                  {/* Bottom Section: Text Labels */}
                  <div className="relative z-10">
                    <span
                      className={`text-xs uppercase tracking-wider font-bold transition-colors ${
                        isLight ? "text-slate-500" : "text-cyan-400 group-hover:text-white"
                      }`}
                    >
                      {item.role}
                    </span>
                    <h3
                      className={`text-2xl font-bold mt-1 transition-transform duration-300 group-hover:translate-x-1 ${theme.textHead}`}
                    >
                      {item.title}
                    </h3>
                  </div>

                  {/* Bottom Subtle Light Bar */}
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-linear-to-r from-transparent via-cyan-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}