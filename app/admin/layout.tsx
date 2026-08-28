"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, UserCheck, FilePlus, ChevronDown, 
  Menu, X, LogOut, Database, PanelLeftClose, PanelRightClose 
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(true);

  // State Sidebar Desktop (Open/Collapsed)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // State User Dinamis
  const [userData, setUserData] = useState({
    name: 'Admin Root',
    role: 'Administrator',
    initials: 'AD'
  });

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        const name = user.nama_lengkap || user.username || user.nama || 'Admin Root';
        const role = user.role ? user.role.toUpperCase() : 'ADMINISTRATOR';
        const initials = name.slice(0, 2).toUpperCase();

        setUserData({ name, role, initials });
      } else {
        const username = localStorage.getItem('username');
        const role = localStorage.getItem('role');
        if (username) {
          setUserData({
            name: username,
            role: role ? role.toUpperCase() : 'ADMINISTRATOR',
            initials: username.slice(0, 2).toUpperCase()
          });
        }
      }
    } catch (e) {
      console.error("Gagal membaca data user:", e);
    }
  }, []);

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

  const SidebarContent = ({ isMobile = false }: { isMobile?: boolean }) => (
    <div className="flex flex-col h-full justify-between p-5 font-sans">
      <div className="space-y-7">
        {/* Header Sidebar */}
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-primary-container flex items-center justify-center text-white font-black text-lg shadow-sm shrink-0">
              IC
            </div>
            <div>
              <h2 className="text-base font-black tracking-tight text-on-surface uppercase leading-none">
                INVELA <span className="text-primary">CONTROL</span>
              </h2>
              <span className="text-[10px] font-bold text-outline tracking-widest uppercase block mt-1">Admin Console</span>
            </div>
          </div>

          {/* Tombol Tutup Sidebar untuk Desktop */}
          {!isMobile && (
            <button
              type="button"
              onClick={() => setIsSidebarOpen(false)}
              title="Tutup Sidebar"
              className="p-1.5 text-outline hover:text-on-surface hover:bg-surface-low rounded-lg transition-colors cursor-pointer"
            >
              <PanelLeftClose className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Navigasi Utama */}
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

          {/* Sub Menu Dropdown */}
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

      {/* Profile & Logout Section */}
      <div className="border-t border-surface-container pt-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-10 h-10 rounded-full bg-surface-low border border-surface-container-high flex items-center justify-center font-black text-sm text-primary shrink-0">
            {userData.initials}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-bold text-on-surface leading-tight truncate">{userData.name}</h4>
            <span className="text-xs font-semibold text-outline block truncate">{userData.role}</span>
          </div>
        </div>

        <button 
          type="button"
          onClick={handleLogout}
          title="Keluar dari Akun"
          className="p-2 text-outline hover:text-error hover:bg-error-container/40 rounded-lg transition-colors cursor-pointer shrink-0"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen w-full bg-surface-bright flex text-on-surface antialiased tracking-tight">
      
      {/* Sidebar Desktop */}
      <aside 
        className={`hidden lg:block bg-white border-r border-surface-container shrink-0 h-screen sticky top-0 transition-all duration-300 ease-in-out ${
          isSidebarOpen ? 'w-72 opacity-100' : 'w-0 opacity-0 overflow-hidden border-none'
        }`}
      >
        <div className="w-72 h-full">
          <SidebarContent isMobile={false} />
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 min-h-screen relative">
        
        {/* Tombol Buka Sidebar (Desktop) Saat Tersembunyi */}
        {!isSidebarOpen && (
          <button
            type="button"
            onClick={() => setIsSidebarOpen(true)}
            title="Buka Sidebar"
            className="hidden lg:flex fixed top-5 left-5 z-40 p-2.5 bg-white border border-surface-container-high shadow-md rounded-xl text-on-surface hover:text-primary hover:bg-surface-low transition-all cursor-pointer items-center justify-center"
          >
            <PanelRightClose className="w-5 h-5" />
          </button>
        )}

        {/* Header Mobile */}
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

        {/* Modal Drawer Mobile */}
        {isMobileOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <div 
              onClick={() => setIsMobileOpen(false)} 
              className="fixed inset-0 bg-on-surface/40 backdrop-blur-xs transition-opacity"
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
                <SidebarContent isMobile={true} />
              </div>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 p-5 sm:p-8 md:p-10 max-w-[1400px] w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}