"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  UserCheck,
  GraduationCap,
  Wrench,
  Boxes,
  PieChart,
  ShieldAlert,
  ArrowRight,
  Menu,
  X,
  Zap,
  Clock,
  Smartphone,
  Database,
  LayoutDashboard,
  Sparkles,
  Loader2,
  ChevronRight,
  CheckCircle2,
} from "lucide-react";

// Fallback Theme Provider & Toggle jika file lokal belum dibuat
import Footer from "@/components/footer";
import { useTheme } from "@/components/theme-provider";
import ThemeToggle from "@/components/theme-toggle";

export default function Home() {
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Auth state
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);

  // Ambil konteks theme jika ada, default ke dark mode
  const themeContext = useTheme ? useTheme() : { isLight: false };
  const isLight = themeContext?.isLight ?? false;

  // Cek Auth & Redirect Otomatis jika user sudah login
  useEffect(() => {
    const checkAuthStatus = () => {
      try {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          const user = JSON.parse(storedUser);

          // Ekstrak string role dari berbagai kemungkinan format backend
          let roleName = "";
          if (typeof user?.role === "string") {
            roleName = user.role;
          } else if (typeof user?.role?.name === "string") {
            roleName = user.role.name;
          } else if (typeof user?.role_name === "string") {
            roleName = user.role_name;
          }

          if (roleName) {
            const cleanRole = roleName.toLowerCase().trim();
            setIsLoggedIn(true);
            setUserRole(cleanRole);

            // Redirect otomatis ke dashboard role pengguna
            router.replace(`/${cleanRole}`);
            return;
          }
        }
      } catch (error) {
        console.error("Gagal membaca session user:", error);
      } finally {
        setCheckingAuth(false);
      }
    };

    checkAuthStatus();
  }, [router]);

  // Event Listener Scroll Navbar
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // State loading sementara jika user sedang di-redirect ke dashboard
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
    <div
      className={`min-h-screen transition-colors duration-300 ${
        isLight ? "bg-slate-50 text-slate-900" : "bg-slate-950 text-white"
      } selection:bg-cyan-500 selection:text-slate-900 overflow-x-hidden font-sans`}
    >
      {/* Background Ambient Glowing Elements */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div
          className={`absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full blur-[120px] ${
            isLight ? "bg-blue-400/20" : "bg-blue-600/20"
          }`}
        />
        <div
          className={`absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full blur-[120px] ${
            isLight ? "bg-cyan-400/20" : "bg-cyan-600/20"
          }`}
        />
        <div
          className={`absolute top-[40%] left-[50%] transform -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] rounded-full blur-[100px] ${
            isLight ? "bg-violet-400/10" : "bg-violet-600/10"
          }`}
        />
      </div>

      {/* Floating Navbar */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? "py-4" : "py-6"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className={`mx-auto backdrop-blur-xl border rounded-2xl px-6 py-3 flex items-center justify-between transition-all duration-300 ${
              isLight
                ? "bg-white/80 border-slate-200 shadow-sm"
                : "bg-slate-900/80 border-white/10"
            } ${scrolled ? "shadow-lg shadow-cyan-500/5" : ""}`}
          >
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 flex items-center justify-center bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl shadow-lg shadow-cyan-500/20 text-white font-bold">
                <Boxes className="w-5 h-5" />
              </div>
              <span
                className={`text-xl font-bold tracking-tight ${
                  isLight ? "text-slate-800" : "text-white"
                }`}
              >
                Inventaris<span className="text-cyan-400"> Labor</span>
              </span>
            </div>

            {/* Desktop Links */}
            <div className="hidden md:flex items-center gap-8">
              {["Tentang", "Fitur", "Cara Kerja", "Akses"].map((item) => (
                <a
                  key={item}
                  href={`#${item.toLowerCase().replace(" ", "-")}`}
                  className={`text-sm font-medium transition-colors relative group ${
                    isLight
                      ? "text-slate-600 hover:text-cyan-600"
                      : "text-slate-300 hover:text-white"
                  }`}
                >
                  {item}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-cyan-400 transition-all group-hover:w-full" />
                </a>
              ))}
            </div>

            {/* CTA & Theme Toggle */}
            <div className="hidden md:flex items-center gap-4">
              {ThemeToggle && <ThemeToggle />}
              {isLoggedIn && userRole ? (
                <Link
                  href={`/${userRole}`}
                  className="px-6 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/25 hover:scale-105"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Dashboard</span>
                </Link>
              ) : (
                <Link
                  href="/login"
                  className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all shadow-[0_0_20px_rgba(255,255,255,0.15)] hover:shadow-[0_0_30px_rgba(6,182,212,0.4)] hover:scale-105 ${
                    isLight
                      ? "bg-slate-900 text-white hover:bg-slate-800"
                      : "bg-white text-slate-900 hover:bg-cyan-50"
                  }`}
                >
                  Login
                </Link>
              )}
            </div>

            {/* Mobile Toggle Button */}
            <button
              className={`md:hidden p-2 ${
                isLight ? "text-slate-800" : "text-white"
              }`}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {mobileMenuOpen && (
          <div
            className={`absolute top-full left-4 right-4 mt-2 p-4 backdrop-blur-xl border rounded-2xl flex flex-col gap-4 md:hidden ${
              isLight
                ? "bg-white/95 border-slate-200 shadow-xl text-slate-800"
                : "bg-slate-900/95 border-white/10 text-white"
            }`}
          >
            {["Tentang", "Fitur", "Cara Kerja", "Akses"].map((item) => (
              <a
                key={item}
                href={`#${item.toLowerCase().replace(" ", "-")}`}
                onClick={() => setMobileMenuOpen(false)}
                className={`font-medium ${
                  isLight
                    ? "text-slate-600 hover:text-cyan-600"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                {item}
              </a>
            ))}
            <div className="flex items-center justify-between border-t pt-4 border-slate-200/10">
              <span className="text-sm font-medium">Tema Visual</span>
              {ThemeToggle && <ThemeToggle />}
            </div>
            {isLoggedIn && userRole ? (
              <Link
                href={`/${userRole}`}
                onClick={() => setMobileMenuOpen(false)}
                className="text-center py-3 bg-cyan-500 text-slate-900 rounded-xl font-bold flex items-center justify-center gap-2"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Buka Dashboard ({userRole.toUpperCase()})</span>
              </Link>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="text-center py-3 bg-cyan-500 text-slate-900 rounded-xl font-bold"
              >
                Login Portal
              </Link>
            )}
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-20 px-4 sm:px-6 lg:px-8 z-10">
        <div className="max-w-5xl mx-auto text-center">
          <div
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium mb-8 backdrop-blur-sm ${
              isLight
                ? "bg-white/50 border-slate-200 text-cyan-600"
                : "bg-white/5 border-white/10 text-cyan-300"
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            web-based labor inventory control system
          </div>

          <h1
            className={`text-5xl sm:text-7xl font-extrabold tracking-tight mb-8 leading-tight ${
              isLight ? "text-slate-900" : "text-white"
            }`}
          >
            Inventaris Labor <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600">
              Berbasis Website Modern
            </span>
          </h1>

          <p
            className={`text-lg sm:text-xl mb-12 max-w-2xl mx-auto leading-relaxed ${
              isLight ? "text-slate-600" : "text-slate-400"
            }`}
          >
            Revolusi sistem inventaris sekolah dengan teknologi Website yang
            akurat, cepat, dan transparan. Hilangkan manipulasi data fasilitas & alat praktikum Laboratorium secara real-time.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <a
              href="#cara-kerja"
              className="group relative px-8 py-4 bg-cyan-500 text-slate-900 rounded-2xl font-bold text-lg overflow-hidden transition-all hover:scale-105 shadow-lg shadow-cyan-500/20"
            >
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              <span className="relative flex items-center gap-2">
                <Sparkles className="w-5 h-5" /> Pelajari Lebih Lanjut
              </span>
            </a>
            <a
              href="#akses"
              className={`px-8 py-4 border rounded-2xl font-bold text-lg transition-all hover:scale-105 backdrop-blur-sm ${
                isLight
                  ? "bg-white/50 border-slate-200 text-slate-700 hover:bg-white"
                  : "bg-white/5 border-white/10 text-white hover:bg-white/10"
              }`}
            >
              Portal Akses
            </a>
          </div>

          {/* Stats Strip */}
          <div
            className={`mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 border-t pt-12 ${
              isLight ? "border-slate-200" : "border-white/10"
            }`}
          >
            {[
              { label: "Kemudahan Navigasi", value: "100%" },
              { label: "Kecepatan Input", value: "< 1 Detik" },
              { label: "Barang Terdaftar", value: "1,200+" },
              { label: "Uptime Server", value: "24/7" },
            ].map((stat, idx) => (
              <div key={idx} className="text-center">
                <div
                  className={`text-3xl font-bold mb-1 ${
                    isLight ? "text-slate-900" : "text-white"
                  }`}
                >
                  {stat.value}
                </div>
                <div className="text-sm text-slate-500 uppercase tracking-wider font-semibold">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section id="tentang" className="py-24 relative z-10 scroll-mt-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className={`rounded-3xl border p-8 md:p-16 relative overflow-hidden ${
              isLight
                ? "bg-white border-slate-200 shadow-xl"
                : "bg-gradient-to-br from-slate-900 to-slate-950 border-white/10"
            }`}
          >
            {/* Background Accent */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />

            <div className="relative z-10 flex flex-col md:flex-row gap-12 items-center">
              <div className="w-full md:w-1/2">
                <h2
                  className={`text-3xl md:text-4xl font-bold mb-6 ${
                    isLight ? "text-slate-900" : "text-white"
                  }`}
                >
                  Revolusi Pencatatan Fasilitas Labor
                </h2>
                <p
                  className={`mb-6 leading-relaxed ${
                    isLight ? "text-slate-600" : "text-slate-400"
                  }`}
                >
                  Sistem Inventaris Labor bukan sekadar alat pencatatan. Ini
                  adalah langkah awal menuju digitalisasi manajemen aset sekolah
                  yang menyeluruh. Kami percaya bahwa efisiensi pengelolaan
                  fasilitas akan memberikan kenyamanan lebih bagi warga sekolah
                  untuk fokus pada hal yang paling penting:
                  <span className="text-cyan-400 font-semibold">
                    {" "}
                    Mencerdaskan Bangsa.
                  </span>
                </p>
                <div className="flex flex-wrap gap-4">
                  {[
                    "Digital Inventory",
                    "Asset Tracking",
                    "Smart Lab",
                    "Real-time Monitoring",
                  ].map((tag, idx) => (
                    <span
                      key={idx}
                      className={`px-4 py-2 rounded-full border text-sm ${
                        isLight
                          ? "bg-slate-100 border-slate-200 text-slate-600"
                          : "bg-white/5 border-white/10 text-slate-300"
                      }`}
                    >
                      # {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="w-full md:w-1/2 grid grid-cols-2 gap-4">
                <div className="space-y-4 mt-8">
                  <div
                    className={`p-6 rounded-2xl border backdrop-blur-sm ${
                      isLight
                        ? "bg-slate-50 border-slate-200"
                        : "bg-slate-800/50 border-white/5"
                    }`}
                  >
                    <div className="text-3xl font-bold text-cyan-400 mb-1">
                      0%
                    </div>
                    <div className="text-xs text-slate-500 uppercase tracking-wider font-medium">
                      Kecurangan Data
                    </div>
                  </div>
                  <div
                    className={`p-6 rounded-2xl border backdrop-blur-sm ${
                      isLight
                        ? "bg-slate-50 border-slate-200"
                        : "bg-slate-800/50 border-white/5"
                    }`}
                  >
                    <div className="text-3xl font-bold text-purple-400 mb-1">
                      50%
                    </div>
                    <div className="text-xs text-slate-500 uppercase tracking-wider font-medium">
                      Lebih Efisien
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div
                    className={`p-6 rounded-2xl border backdrop-blur-sm ${
                      isLight
                        ? "bg-slate-50 border-slate-200"
                        : "bg-slate-800/50 border-white/5"
                    }`}
                  >
                    <div className="text-3xl font-bold text-emerald-400 mb-1">
                      1k+
                    </div>
                    <div className="text-xs text-slate-500 uppercase tracking-wider font-medium">
                      Barang Terdata
                    </div>
                  </div>
                  <div
                    className={`p-6 rounded-2xl border backdrop-blur-sm ${
                      isLight
                        ? "bg-slate-50 border-slate-200"
                        : "bg-slate-800/50 border-white/5"
                    }`}
                  >
                    <div className="text-3xl font-bold text-rose-400 mb-1">
                      24h
                    </div>
                    <div className="text-xs text-slate-500 uppercase tracking-wider font-medium">
                      Monitoring Status
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section
        id="fitur"
        className={`py-24 relative z-10 scroll-mt-28 ${
          isLight ? "bg-slate-50/50" : "bg-slate-900/50"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2
              className={`text-3xl md:text-4xl font-bold mb-4 ${
                isLight ? "text-slate-900" : "text-white"
              }`}
            >
              Teknologi Masa Depan
            </h2>
            <p
              className={`max-w-2xl mx-auto ${
                isLight ? "text-slate-600" : "text-slate-400"
              }`}
            >
              Kami menggabungkan alur kerja yang terstruktur dan sistem cerdas untuk
              menciptakan pencatatan fasilitas labor yang sempurna.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <Database className="w-6 h-6" />,
                title: "Database Terpusat",
                desc: "Sistem pencatatan barang terintegrasi dalam satu platform pusat, memudahkan pelacakan dan pengelolaan instansi aset laboratorium.",
                color: "text-cyan-400",
                bg: "bg-cyan-500/10",
                border: "border-cyan-500/20",
              },
              {
                icon: <PieChart className="w-6 h-6" />,
                title: "Analitik Real-time",
                desc: "Dashboard interaktif untuk memantau kondisi barang (baik/rusak) dan ketersediaan alat secara real-time dengan grafik intuitif.",
                color: "text-purple-400",
                bg: "bg-purple-500/10",
                border: "border-purple-500/20",
              },
              {
                icon: <ShieldAlert className="w-6 h-6" />,
                title: "Keamanan Data Role",
                desc: "Akses sistem dilindungi otentikasi hak akses bertingkat, memastikan tiap role hanya mengelola otorisasi data yang tepat.",
                color: "text-emerald-400",
                bg: "bg-emerald-500/10",
                border: "border-emerald-500/20",
              },
              {
                icon: <Zap className="w-6 h-6" />,
                title: "Efisiensi Tinggi",
                desc: "Proses input, verifikasi perbaikan, dan pencarian item-instance dilakukan dengan cepat tanpa proses birokrasi manual rumit.",
                color: "text-amber-400",
                bg: "bg-amber-500/10",
                border: "border-amber-500/20",
              },
              {
                icon: <Smartphone className="w-6 h-6" />,
                title: "Akses Multi-Platform",
                desc: "Kelola inventaris dari mana saja melalui perangkat desktop, tablet, maupun smartphone dengan tampilan responsif.",
                color: "text-pink-400",
                bg: "bg-pink-500/10",
                border: "border-pink-500/20",
              },
              {
                icon: <Clock className="w-6 h-6" />,
                title: "Riwayat Peminjaman",
                desc: "Rekam jejak peminjaman, pengembalian, hingga estimasi biaya perbaikan teknisi tercatat otomatis tanpa cela.",
                color: "text-blue-400",
                bg: "bg-blue-500/10",
                border: "border-blue-500/20",
              },
            ].map((feature, idx) => (
              <div
                key={idx}
                className={`p-8 rounded-3xl backdrop-blur-md border transition-all duration-300 hover:-translate-y-2 group ${
                  isLight
                    ? "bg-white border-slate-200 shadow-sm hover:shadow-md"
                    : `bg-slate-950/50 ${feature.border} hover:border-opacity-50`
                }`}
              >
                <div
                  className={`w-14 h-14 rounded-2xl ${feature.bg} ${feature.color} flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform`}
                >
                  {feature.icon}
                </div>
                <h3
                  className={`text-xl font-bold mb-4 ${
                    isLight ? "text-slate-900" : "text-white"
                  }`}
                >
                  {feature.title}
                </h3>
                <p
                  className={`leading-relaxed text-sm ${
                    isLight ? "text-slate-600" : "text-slate-400"
                  }`}
                >
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="cara-kerja" className="py-24 relative z-10 scroll-mt-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center gap-16">
            <div className="w-full md:w-1/2">
              <h2
                className={`text-3xl md:text-4xl font-bold mb-6 ${
                  isLight ? "text-slate-900" : "text-white"
                }`}
              >
                Cara Kerja Sistem
              </h2>
              <div className="space-y-8">
                {[
                  {
                    step: "01",
                    title: "Input Data Barang",
                    desc: "Admin / Kabeng memasukkan data lengkap barang laboratorium ke sistem, termasuk serial number dan spesifikasi unit.",
                  },
                  {
                    step: "02",
                    title: "Pelabelan & Code Unique",
                    desc: "Setiap barang diberi penanda unik untuk memudahkan identifikasi dan pelacakan fisik di ruang laboratorium.",
                  },
                  {
                    step: "03",
                    title: "Manajemen Sirkulasi & Servis",
                    desc: "Proses peminjaman oleh siswa dan pengajuan perbaikan oleh teknisi tercatat digital dengan status real-time.",
                  },
                  {
                    step: "04",
                    title: "Laporan Executive",
                    desc: "Sistem menyajikan rekapitulasi penggunaan, sisa anggaran pemeliharaan, dan grafik kesehatan aset untuk Kaprog/Sapras.",
                  },
                ].map((item, idx) => (
                  <div key={idx} className="flex gap-6">
                    <div
                      className={`shrink-0 w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                        isLight
                          ? "bg-white border border-slate-200 shadow-md text-cyan-600"
                          : "bg-slate-800 border border-slate-700 text-cyan-400"
                      }`}
                    >
                      {item.step}
                    </div>
                    <div>
                      <h3
                        className={`text-xl font-bold mb-2 ${
                          isLight ? "text-slate-900" : "text-white"
                        }`}
                      >
                        {item.title}
                      </h3>
                      <p
                        className={`${
                          isLight ? "text-slate-600" : "text-slate-400"
                        }`}
                      >
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Terminal Preview Card */}
            <div className="w-full md:w-1/2 relative">
              <div className="absolute inset-0 bg-cyan-500/20 blur-[100px] rounded-full" />
              <div className="relative rounded-3xl p-8 shadow-2xl bg-slate-900 border border-slate-800">
                <div className="flex items-center justify-between mb-8 border-b border-slate-800 pb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500" />
                    <div className="w-3 h-3 rounded-full bg-green-500" />
                  </div>
                  <div className="text-slate-500 text-xs font-mono">
                    System Status: ONLINE
                  </div>
                </div>
                <div className="space-y-4 font-mono text-sm">
                  <div className="flex justify-between text-slate-300">
                    <span>[SYS] Initializing Dashboard...</span>
                    <span className="text-green-400">OK</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>[DB] Loading Asset Instances...</span>
                    <span className="text-green-400">Done (85ms)</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>[SYNC] Verifying User Roles...</span>
                    <span className="text-green-400">Synced</span>
                  </div>
                  <div className="h-px bg-slate-800 my-4" />
                  <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-cyan-500/10 text-cyan-400 rounded-lg flex items-center justify-center">
                        <Database className="w-5 h-5 animate-pulse" />
                      </div>
                      <div>
                        <div className="text-white text-xs font-bold">
                          Updating Item Instance Status...
                        </div>
                        <div className="text-cyan-400 text-xs mt-0.5">
                          Processing Real-time Request...
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Access Portal Section */}
      <section id="akses" className="py-24 relative z-10 scroll-mt-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-6">
            <div>
              <h2
                className={`text-4xl font-bold mb-4 ${
                  isLight ? "text-slate-900" : "text-white"
                }`}
              >
                Portal Akses Role
              </h2>
              <p
                className={`max-w-md ${
                  isLight ? "text-slate-600" : "text-slate-400"
                }`}
              >
                Pilih gerbang masuk sesuai dengan kewenangan dan peran Anda dalam ekosistem laboratorium sekolah.
              </p>
            </div>
            <div className="h-1 w-full md:w-1/3 bg-gradient-to-r from-cyan-500/50 to-transparent rounded-full" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: "Kepala Bengkel",
                role: "Kabeng Workspace",
                href: "/login",
                icon: <Wrench className="w-6 h-6" />,
                gradient: "from-blue-600 to-blue-900",
                accent: "border-blue-500/30",
              },
              {
                title: "Kepala Program",
                role: "Kaprog Executive",
                href: "/login",
                icon: <UserCheck className="w-6 h-6" />,
                gradient: "from-violet-600 to-violet-900",
                accent: "border-violet-500/30",
              },
              {
                title: "Waka Sarpras",
                role: "Sapras Global View",
                href: "/login",
                icon: <ShieldCheck className="w-6 h-6" />,
                gradient: "from-emerald-600 to-emerald-900",
                accent: "border-emerald-500/30",
              },
              {
                title: "Siswa & Teknisi",
                role: "Practical Terminal",
                href: "/login",
                icon: <GraduationCap className="w-6 h-6" />,
                gradient: "from-rose-600 to-rose-900",
                accent: "border-rose-500/30",
              },
            ].map((item, idx) => (
              <Link
                key={idx}
                href={isLoggedIn && userRole ? `/${userRole}` : item.href}
                className={`group relative h-80 rounded-3xl overflow-hidden border transition-all duration-500 hover:shadow-2xl ${
                  isLight ? "border-slate-200 shadow-lg" : item.accent
                }`}
              >
                {/* Card Background Gradient */}
                <div
                  className={`absolute inset-0 bg-gradient-to-b ${
                    item.gradient
                  } ${
                    isLight
                      ? "opacity-10 group-hover:opacity-20"
                      : "opacity-20 group-hover:opacity-40"
                  } transition-opacity duration-500`}
                />
                <div
                  className={`absolute inset-0 transition-colors duration-500 ${
                    isLight
                      ? "bg-white/80 group-hover:bg-white/60"
                      : "bg-slate-950/80 group-hover:bg-slate-950/60"
                  }`}
                />

                {/* Card Content */}
                <div className="absolute inset-0 p-8 flex flex-col justify-between z-10">
                  <div className="flex justify-between items-start">
                    <div
                      className={`p-3.5 rounded-2xl backdrop-blur-md group-hover:scale-110 transition-transform duration-300 ${
                        isLight
                          ? "bg-white shadow-md text-slate-800"
                          : "bg-white/10 text-white"
                      }`}
                    >
                      {item.icon}
                    </div>
                    <div
                      className={`w-9 h-9 rounded-full border flex items-center justify-center transition-all ${
                        isLight
                          ? "border-slate-300 group-hover:bg-slate-900 group-hover:text-white"
                          : "border-white/20 group-hover:bg-white group-hover:text-slate-900"
                      }`}
                    >
                      <ArrowRight className="w-4 h-4 -rotate-45 group-hover:rotate-0 transition-transform duration-300" />
                    </div>
                  </div>

                  <div>
                    <p
                      className={`text-xs font-bold tracking-widest uppercase mb-2 ${
                        isLight ? "text-slate-500" : "text-white/50"
                      }`}
                    >
                      {item.role}
                    </p>
                    <h3
                      className={`text-2xl font-bold group-hover:translate-x-2 transition-transform duration-300 ${
                        isLight ? "text-slate-900" : "text-white"
                      }`}
                    >
                      {item.title}
                    </h3>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Footer Fallback Component */}
      {Footer ? (
        <Footer />
      ) : (
        <footer className="border-t border-slate-800 py-8 text-center text-xs text-slate-500">
          &copy; {new Date().getFullYear()} Inventaris Labor. All rights reserved.
        </footer>
      )}
    </div>
  );
}