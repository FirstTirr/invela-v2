"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, UserCheck, FilePlus, ChevronDown, 
  Menu, X, ShieldAlert, LogOut, Database 
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(true);

  // Sub-menu item untuk Dropdown Tabel Data Master
  const subMenuItems = [
    { label: 'Data Labor', href: '/admin/labor' },
    { label: 'Data Kelas', href: '/admin/kelas' },
    { label: 'Data Jurusan', href: '/admin/jurusan' },
    { label: 'Data Kategori', href: '/admin/category' },
  ];

  const mainNavItems = [
    { label: 'Dashboard Overview', href: '/admin', icon: LayoutDashboard },
    { label: 'Memantau Akun', href: '/admin/users', icon: UserCheck },
    { label: 'Input Data Master', href: '/admin/master', icon: FilePlus },
  ];

  // Komponen Sidebar Isi Navigasi
  const SidebarContent = () => (
    <div className="flex flex-col h-full justify-between p-5 font-sans">
      <div className="space-y-7">
        {/* Brand System */}
        <div className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-primary-container flex items-center justify-center text-white font-black text-lg shadow-sm">
            IC
          </div>
          <div>
            <h2 className="text-base font-black tracking-tight text-on-surface uppercase leading-none">
              INVELA <span className="text-primary">CONTROL</span>
            </h2>
            <span className="text-[10px] font-bold text-outline tracking-widest uppercase block mt-1">Admin Console</span>
          </div>
        </div>

        {/* Navigasi List */}
        <nav className="space-y-1">
          <p className="px-3 text-xs font-bold text-outline tracking-wider uppercase mb-3">Platform Management</p>
          
          {mainNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-bold transition-all ${
                  isActive 
                    ? 'bg-secondary-container text-primary shadow-sm' 
                    : 'text-on-surface-variant hover:bg-surface-low hover:text-on-surface'
                }`}
              >
                <Icon className="w-5 h-5 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}

          {/* DROPDOWN MENU KELOLA LIHAT DATA TABEL */}
          <div className="pt-2">
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-base font-bold text-on-surface-variant hover:bg-surface-low hover:text-on-surface transition-all cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <Database className="w-5 h-5 text-outline shrink-0" />
                <span>Lihat Data Tabel</span>
              </div>
              <ChevronDown className={`w-4 h-4 text-outline transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Sub-menu container wrapper */}
            {isDropdownOpen && (
              <div className="mt-1 ml-6 pl-4 border-l border-surface-container space-y-1 animate-in fade-in slide-in-from-top-1 duration-200">
                {subMenuItems.map((sub) => {
                  const isSubActive = pathname === sub.href;
                  return (
                    <Link
                      key={sub.href}
                      href={sub.href}
                      onClick={() => setIsMobileOpen(false)}
                      className={`block px-4 py-2.5 rounded-lg text-sm font-bold transition-all ${
                        isSubActive 
                          ? 'text-primary bg-secondary-container/40' 
                          : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-low'
                      }`}
                    >
                      {sub.label}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </nav>
      </div>

      {/* Profile Operator Card Info */}
      <div className="border-t border-surface-container pt-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-full bg-surface-low border border-surface-container-high flex items-center justify-center font-black text-sm text-primary">
            N
          </div>
          <div>
            <h4 className="text-sm font-bold text-on-surface leading-tight">Admin Root</h4>
            <span className="text-xs font-semibold text-outline">SMKN 4 Payakumbuh</span>
          </div>
        </div>
        <Link href="/login" className="p-2 text-outline hover:text-error hover:bg-error-container/40 rounded-lg transition-colors">
          <LogOut className="w-5 h-5" />
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen w-full bg-surface-bright flex text-on-surface antialiased tracking-tight">
      
      {/* 💻 SIDEBAR PERMANEN UNTUK DESKTOP VIEW */}
      <aside className="hidden lg:block w-72 bg-white border-r border-surface-container shrink-0 h-screen sticky top-0">
        <SidebarContent />
      </aside>

      {/* CONTAINER KONTEN UTAMA */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        
        {/* 📱 TOP BAR HAMBURGER UNTUK LAYAR HP/MOBILE */}
        <header className="lg:hidden w-full bg-white border-b border-surface-container px-5 py-4 flex justify-between items-center sticky top-0 z-40 shadow-sm">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-white font-black text-sm">
              IC
            </div>
            <h2 className="text-sm font-black tracking-tight text-on-surface uppercase">
              INVELA <span className="text-primary">CONTROL</span>
            </h2>
          </div>
          <button
            type="button"
            onClick={() => setIsMobileOpen(true)}
            className="p-2 border border-surface-container-high rounded-xl hover:bg-surface-low text-on-surface transition-all cursor-pointer"
          >
            <Menu className="w-5 h-5" />
          </button>
        </header>

        {/* 📱 DRAWER SLIDE-IN UNTUK MENU MOBILE */}
        {isMobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            {/* Backdrop Gelap Belakang Modal */}
            <div 
              onClick={() => setIsMobileOpen(false)} 
              className="fixed inset-0 bg-on-surface/40 backdrop-blur-xs transition-opacity"
            />
            {/* Box Slide Sidebar Menu */}
            <div className="relative w-72 max-w-sm bg-white h-full flex flex-col shadow-2xl z-10 animate-in slide-in-from-left duration-200">
              {/* Close Button Inside Drawer */}
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

        {/* AREA PENGISIAN KONTEN HALAMAN ADMIN (PAGE INDIVIDUAL) */}
        <main className="flex-1 p-5 sm:p-8 md:p-10 max-w-[1400px] w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}