"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, Package, ClipboardList, 
  AlertTriangle, Eye, LogOut, Menu, X, ShieldCheck, Loader2 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function KaprogLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  // State untuk mengontrol animasi gerbang menutup saat logout
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const [userData, setUserData] = useState({
    name: 'Kaprog User',
    role: 'SMKN 4 Payakumbuh',
    initials: 'KP'
  });

  const loadUserData = useCallback(() => {
    try {
      const storedUser = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
      if (storedUser) {
        const user = JSON.parse(storedUser);
        const name = user.nama_lengkap || user.username || user.nama || 'Kepala Program';
        const jurusan = user.jurusan || user.nama_jurusan ? `Kaprog ${user.jurusan || user.nama_jurusan}` : 'Kepala Program Studi';
        const initials = name.slice(0, 2).toUpperCase();

        setUserData({ name, role: jurusan, initials });
      } else {
        const username = typeof window !== 'undefined' ? localStorage.getItem('username') : null;
        if (username) {
          setUserData({
            name: username,
            role: 'Kepala Program Studi',
            initials: username.slice(0, 2).toUpperCase()
          });
        }
      }
    } catch (e: unknown) {
      console.error("Gagal membaca data user:", e);
    }
  }, []);

  useEffect(() => {
    router.prefetch('/login');
  }, [router]);

  useEffect(() => {
    const timer = requestAnimationFrame(() => {
      loadUserData();
    });
    return () => cancelAnimationFrame(timer);
  }, [loadUserData]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsOpen(false);
    }, 0);
    
    return () => clearTimeout(timer);
  }, [pathname]);

  const handleLogout = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    if (!window.confirm("Apakah Anda yakin ingin keluar dari sistem?")) return;

    // 1. Pemicu animasi gerbang menutup
    setIsLoggingOut(true);

    // 2. Beri jeda 800ms sampai animasi gerbang selesai, baru hapus sesi & redirect
    setTimeout(() => {
      localStorage.clear();
      sessionStorage.clear();

      const cookies = document.cookie.split(";");
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i];
        const eqPos = cookie.indexOf("=");
        const name = eqPos > -1 ? cookie.slice(0, eqPos).trim() : cookie.trim();
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`;
      }

      window.location.href = '/login';
    }, 800);
  };

  const kaprogMenu = [
    { title: 'Dashboard Overview', href: '/kaprog', icon: LayoutDashboard },
    { title: 'Monitoring Aset Barang', href: '/kaprog/items', icon: Package },
    { title: 'Monitoring Peminjaman', href: '/kaprog/loans', icon: ClipboardList },
    { title: 'Log Kerusakan & Biaya', href: '/kaprog/damages', icon: AlertTriangle },
  ];

  return (
    <div className="min-h-screen bg-background text-on-surface antialiased flex flex-col md:flex-row selection:bg-secondary-container relative overflow-hidden">
      
      {/* OVERLAY ANIMASI GERBANG MENUTUP (LOGOUT GATE CLOSING) */}
      <AnimatePresence>
        {isLoggingOut && (
          <div className="fixed inset-0 z-50 flex pointer-events-none overflow-hidden">
            
            {/* GERBANG KIRI */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              transition={{ duration: 0.8, ease: [0.77, 0, 0.175, 1] }}
              className="w-[45%] h-full bg-gradient-to-br from-primary via-primary/95 to-primary-container p-12 hidden lg:flex flex-col justify-between shadow-2xl relative pointer-events-auto"
            >
              <div className="flex items-center gap-2 text-white/90">
                <ShieldCheck className="w-5 h-5 text-white animate-pulse" />
                <span className="text-xs font-bold tracking-widest uppercase">TeFa RPL BCS</span>
              </div>
              <div className="space-y-4">
                <h2 className="text-4xl font-extrabold text-white leading-tight">
                  Sistem Manajemen & <br />
                  Kontrol Inventaris Labor.
                </h2>
                <p className="text-sm text-white/70 font-medium max-w-md">
                  Menutup sesi keamanan pengguna...
                </p>
              </div>
              <div className="text-xs text-white/50 font-medium">
                &copy; {new Date().getFullYear()} Invela Control.
              </div>
            </motion.div>

            {/* GERBANG KANAN */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              transition={{ duration: 0.8, ease: [0.77, 0, 0.175, 1] }}
              className="flex-1 h-full bg-white flex flex-col items-center justify-center p-8 shadow-2xl relative pointer-events-auto"
            >
              <div className="flex flex-col items-center gap-3 text-center">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-primary to-primary-container flex items-center justify-center text-white font-black text-xl shadow-md shadow-primary/20">
                  IC
                </div>
                <div className="flex items-center gap-2 text-primary font-bold text-sm uppercase tracking-wider">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Mengakhiri Sesi...</span>
                </div>
              </div>
            </motion.div>

          </div>
        )}
      </AnimatePresence>

      <header className="md:hidden h-16 bg-white border-b border-surface-container-high px-4 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-primary flex items-center justify-center text-white font-bold text-xs shadow-sm">
            IN
          </div>
          <div>
            <h1 className="text-xs font-bold tracking-wider text-on-surface font-sans uppercase">INVELA CONTROL</h1>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 text-on-surface-variant hover:bg-surface-low rounded-md transition-colors cursor-pointer"
          aria-label="Toggle Menu"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside className={`fixed inset-y-0 left-0 w-[280px] bg-white border-r border-surface-container-high flex flex-col z-40 transition-transform duration-300 ease-in-out md:translate-x-0 ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`}>
        <div className="h-20 px-6 border-b border-surface-container flex items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded bg-primary flex items-center justify-center text-white font-bold text-sm shadow-sm">
              IN
            </div>
            <div>
              <h1 className="text-xs font-bold tracking-wider text-on-surface font-sans uppercase">INVELA CONTROL</h1>
              <p className="text-[10px] font-semibold tracking-wider text-secondary uppercase flex items-center gap-1 mt-0.5">
                <Eye className="w-3 h-3 text-primary" /> Prodi Monitor
              </p>
            </div>
          </div>
          <button 
            type="button"
            onClick={() => setIsOpen(false)} 
            className="md:hidden p-1 text-outline hover:text-on-surface rounded cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto bg-white">
          <p className="px-3 mb-3 text-[10px] font-bold tracking-widest text-outline uppercase">
            Program Executive View
          </p>
          {kaprogMenu.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-200 group ${
                  isActive 
                    ? "bg-secondary-container text-primary font-semibold" 
                    : "text-on-surface-variant hover:bg-surface-low hover:text-on-surface"
                }`}
              >
                <Icon className={`w-4 h-4 transition-transform duration-200 group-hover:scale-105 ${isActive ? "text-primary" : "text-outline"}`} />
                {item.title}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-surface-container bg-surface-bright flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-md bg-secondary text-white flex items-center justify-center font-bold text-sm shrink-0">
              {userData.initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-on-surface truncate">{userData.name}</p>
              <p className="text-[10px] text-outline font-medium truncate">{userData.role}</p>
            </div>
          </div>
          <button 
            type="button"
            disabled={isLoggingOut}
            onClick={handleLogout} 
            title="Keluar dari Akun"
            className="p-1.5 text-outline hover:text-error hover:bg-error-container/40 rounded transition-colors cursor-pointer shrink-0 disabled:opacity-50"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      <div className="flex-1 w-full flex flex-col min-h-screen md:pl-[280px]">
        <main className="flex-1 p-4 sm:p-6 md:p-10 max-w-7xl w-full mx-auto space-y-8">
          {children}
        </main>
      </div>
    </div>
  );
}