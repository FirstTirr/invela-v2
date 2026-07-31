"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, PackagePlus, ClipboardList, 
  AlertTriangle, User, LogOut, Menu, X, MonitorCheck, History 
} from 'lucide-react';

export default function KabengLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // FUNGSI LOGOUT LENGKAP
  const handleLogout = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();

    if (!window.confirm("Apakah Anda yakin ingin keluar dari sistem?")) return;

    localStorage.clear();
    sessionStorage.clear();

    const cookies = document.cookie.split(";");
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i];
      const eqPos = cookie.indexOf("=");
      const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`;
    }

    window.location.href = '/login';
  };

  const kabengMenu = [
    { title: 'Dashboard Overview', href: '/kabeng', icon: LayoutDashboard },
    { title: 'Kelola & Perbaikan Barang', href: '/kabeng/items', icon: PackagePlus },
    { title: 'Penggunaan Labor', href: '/kabeng/penggunaan', icon: MonitorCheck },
    { title: 'Peminjaman Barang', href: '/kabeng/loans', icon: ClipboardList },
    { title: 'Laporan Kerusakan', href: '/kabeng/damages', icon: AlertTriangle },
    { title: 'Riwayat Perbaikan', href: '/kabeng/damages/repair-history', icon: History },
    { title: 'Riwayat Peminjaman', href: '/kabeng/loans/completed', icon: History },
  ];

  const SidebarContent = () => (
    <div className="flex flex-col h-full justify-between p-5 font-sans">
      <div className="space-y-7">
        <div className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-primary-container flex items-center justify-center text-white font-black text-lg shadow-sm shrink-0">
            IN
          </div>
          <div>
            <h1 className="text-sm font-black tracking-tight text-on-surface uppercase leading-none">INVELA CONTROL</h1>
            <p className="text-xs font-bold tracking-wider text-primary uppercase flex items-center gap-1 mt-1.5">
              <User className="w-3.5 h-3.5 text-primary" /> Kabeng Workspace
            </p>
          </div>
        </div>

        <nav className="space-y-1.5">
          <p className="px-3 mb-3 text-xs font-bold tracking-wider text-outline uppercase">
            Bengkel Operations
          </p>
          {kabengMenu.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-bold transition-all ${
                  isActive 
                    ? "bg-secondary-container text-primary shadow-sm" 
                    : "text-on-surface-variant hover:bg-surface-low hover:text-on-surface"
                }`}
              >
                <Icon className={`w-5 h-5 shrink-0 ${isActive ? "text-primary" : "text-outline"}`} />
                <span>{item.title}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="border-t border-surface-container pt-4 flex items-center justify-between bg-white">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-black text-sm shrink-0">
            KB
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-on-surface truncate">Fathir Adzan Satia</p>
            <p className="text-xs font-semibold text-outline truncate">SMKN 4 Payakumbuh</p>
          </div>
        </div>
        <button 
          onClick={handleLogout} 
          title="Keluar dari Akun"
          className="p-2 text-outline hover:text-error hover:bg-error-container/40 rounded-lg transition-colors cursor-pointer"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background text-on-surface antialiased flex selection:bg-secondary-container">
      <aside className="hidden lg:block w-72 bg-white border-r border-surface-container-high shrink-0 h-screen sticky top-0 z-20">
        <SidebarContent />
      </aside>

      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        <header className="lg:hidden w-full bg-white border-b border-surface-container px-5 py-4 flex justify-between items-center sticky top-0 z-40 shadow-sm">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-black text-sm">
              IN
            </div>
            <h2 className="text-sm font-black tracking-tight text-on-surface uppercase">
              INVELA <span className="text-primary">CONTROL</span>
            </h2>
          </div>
          <button
            type="button"
            onClick={() => setIsMobileOpen(true)}
            className="p-2 border border-surface-container rounded-xl hover:bg-surface-low text-on-surface transition-all cursor-pointer"
          >
            <Menu className="w-5 h-5" />
          </button>
        </header>

        {isMobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <div 
              onClick={() => setIsMobileOpen(false)} 
              className="fixed inset-0 bg-on-surface/40 backdrop-blur-xs transition-opacity duration-200"
            />
            <div className="relative w-72 max-w-sm bg-white h-full flex flex-col shadow-2xl z-10 animate-in slide-in-from-left duration-200">
              <div className="absolute top-4 right-4 z-20">
                <button
                  type="button"
                  onClick={() => setIsMobileOpen(false)}
                  className="p-1.5 border border-surface-container rounded-lg hover:bg-surface-low text-outline cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto pt-4">
                <SidebarContent />
              </div>
            </div>
          </div>
        )}

        <main className="flex-1 p-5 sm:p-8 md:p-10 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}