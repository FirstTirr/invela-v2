"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Package, AlertTriangle, ShieldCheck, LogOut, Menu, X } from 'lucide-react';
import { Separator } from "@/components/ui/separator";

interface StoredUser {
  nama_lengkap?: string;
  username?: string;
  nama?: string;
  role?: string;
}

export default function SaprasLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // State Mobile Sidebar Overlay
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // State User Dinamis
  const [userData, setUserData] = useState({
    name: 'Tim Sapras',
    role: 'SMKN 4 Payakumbuh',
    initials: 'SP'
  });

  useEffect(() => {
    const handleInitUser = () => {
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const user = JSON.parse(storedUser) as StoredUser;
          const name = user.nama_lengkap || user.username || user.nama || 'Tim Sapras';
          const role = user.role ? `Sapras - ${user.role.toUpperCase()}` : 'SMKN 4 Payakumbuh';
          const initials = name.slice(0, 2).toUpperCase();

          setUserData({ name, role, initials });
        } else {
          const username = localStorage.getItem('username');
          if (username) {
            setUserData({
              name: username,
              role: 'SMKN 4 Payakumbuh',
              initials: username.slice(0, 2).toUpperCase()
            });
          }
        }
      } catch (e: unknown) {
        console.error("Gagal membaca data user:", e);
      }
    };

    const animFrame = requestAnimationFrame(() => {
      handleInitUser();
    });

    return () => cancelAnimationFrame(animFrame);
  }, []);

  // Tutup menu mobile jika rute/halaman berubah
  useEffect(() => {
    const animFrame = requestAnimationFrame(() => {
      setIsMobileMenuOpen(false);
    });

    return () => cancelAnimationFrame(animFrame);
  }, [pathname]);

  const saprasMenu = [
    { title: 'Dashboard Overview', href: '/sapras', icon: LayoutDashboard },
    { title: 'Daftar Aset Sekolah', href: '/sapras/items', icon: Package },
    { title: 'Log Kerusakan & Biaya', href: '/sapras/damages', icon: AlertTriangle },
  ];

  // FUNGSI LOGOUT LENGKAP
  const handleLogout = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();

    if (!window.confirm("Apakah Anda yakin ingin keluar dari sistem?")) return;

    // 1. Bersihkan Local Storage & Session Storage
    localStorage.clear();
    sessionStorage.clear();

    // 2. Bersihkan Semua Cookie (termasuk path dan domain)
    const cookies = document.cookie.split(";");
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i];
      const eqPos = cookie.indexOf("=");
      const name = eqPos > -1 ? cookie.slice(0, eqPos).trim() : cookie.trim();
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`;
    }

    // 3. Hard Redirect ke Halaman Login
    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen bg-background text-on-surface antialiased flex flex-col md:flex-row selection:bg-secondary-container">
      
      {/* Top Bar untuk Layar HP (Mobile Header) */}
      <header className="md:hidden sticky top-0 z-30 bg-white border-b border-surface-container-high h-16 px-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-primary flex items-center justify-center text-white font-bold text-xs shadow-sm">
            IN
          </div>
          <span className="text-xs font-bold tracking-wider text-on-surface uppercase">INVELA CONTROL</span>
        </div>
        
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 text-on-surface hover:bg-surface-low rounded-lg transition-colors cursor-pointer"
          aria-label="Toggle Menu"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* Backdrop Gelap untuk Mobile saat Menu Terbuka */}
      {isMobileMenuOpen && (
        <div 
          onClick={() => setIsMobileMenuOpen(false)} 
          className="fixed inset-0 bg-on-surface/40 backdrop-blur-xs z-40 md:hidden"
        />
      )}

      {/* Sidebar Responsive */}
      <aside 
        className={`fixed inset-y-0 left-0 w-[280px] bg-white border-r border-surface-container-high flex flex-col z-50 transition-transform duration-300 ease-in-out md:translate-x-0 ${
          isMobileMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        
        {/* Sidebar Header */}
        <div className="h-20 px-6 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded bg-primary flex items-center justify-center text-white font-bold text-sm shadow-sm">
              IN
            </div>
            <div>
              <h1 className="text-xs font-bold tracking-wider text-on-surface font-sans uppercase">INVELA CONTROL</h1>
              <p className="text-[10px] font-semibold tracking-wider text-emerald-700 uppercase flex items-center gap-1 mt-0.5">
                <ShieldCheck className="w-3 h-3 text-emerald-600" /> Sapras Authority
              </p>
            </div>
          </div>

          {/* Tombol Close Khusus Layar HP */}
          <button 
            onClick={() => setIsMobileMenuOpen(false)}
            className="md:hidden p-1.5 text-outline hover:text-on-surface rounded-md hover:bg-surface-low cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <Separator className="bg-surface-container-high" />

        {/* Menu Navigasi */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto bg-white">
          <p className="px-3 mb-3 text-[10px] font-bold tracking-widest text-outline uppercase">
            Logistics & Infrastructure
          </p>
          {saprasMenu.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-3 rounded-md text-sm font-medium transition-all duration-200 group ${
                  isActive 
                    ? "bg-secondary-container text-primary font-bold shadow-sm" 
                    : "text-on-surface-variant hover:bg-surface-low hover:text-on-surface"
                }`}
              >
                <Icon className={`w-4 h-4 transition-transform duration-200 group-hover:scale-105 ${isActive ? "text-primary" : "text-outline"}`} />
                {item.title}
              </Link>
            );
          })}
        </nav>

        <Separator className="bg-surface-container-high" />

        {/* Footer & Tombol Logout */}
        <div className="p-4 bg-surface-bright flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-md bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
              {userData.initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-on-surface truncate">{userData.name}</p>
              <p className="text-[10px] text-outline font-medium truncate">{userData.role}</p>
            </div>
          </div>
          <button 
            type="button"
            onClick={handleLogout}
            title="Keluar / Logout"
            className="p-2 text-outline hover:text-error hover:bg-error-container/40 rounded-lg transition-colors cursor-pointer shrink-0"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* Wrapper Konten Utama */}
      <div className="w-full flex-1 md:pl-[280px] flex flex-col min-h-screen min-w-0">
        <main className="flex-1 p-4 sm:p-6 md:p-10 max-w-7xl w-full mx-auto space-y-8">
          {children}
        </main>
      </div>
    </div>
  );
}