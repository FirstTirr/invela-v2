"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  ClipboardList, AlertTriangle, LogOut, UserCheck, 
  PanelLeftClose, PanelRightClose, Menu, X 
} from 'lucide-react';
import { Separator } from "@/components/ui/separator";

const guruMenu = [
  { title: 'Lapor Pemakaian Labor', href: '/guru', icon: ClipboardList },
  { title: 'Lapor Kerusakan Barang', href: '/guru/damages', icon: AlertTriangle },
];

interface SidebarContentProps {
  isMobile?: boolean;
  pathname: string;
  userData: { name: string; role: string; initials: string };
  setIsSidebarOpen: (open: boolean) => void;
  setIsMobileOpen: (open: boolean) => void;
  onLogout: (e?: React.MouseEvent) => void;
}

function SidebarContent({
  isMobile = false,
  pathname,
  userData,
  setIsSidebarOpen,
  setIsMobileOpen,
  onLogout
}: SidebarContentProps) {
  return (
    <div className="flex flex-col h-full justify-between bg-white">
      <div>
        {/* Header Sidebar */}
        <div className="h-20 px-6 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded bg-primary flex items-center justify-center text-white font-bold text-sm shadow-sm shrink-0">
              GR
            </div>
            <div>
              <h1 className="text-xs font-bold tracking-wider text-on-surface font-sans uppercase">INVELA CONTROL</h1>
              <p className="text-[10px] font-semibold tracking-wider text-amber-700 uppercase flex items-center gap-1 mt-0.5">
                <UserCheck className="w-3 h-3 text-amber-600" /> Guru / Instructor Access
              </p>
            </div>
          </div>

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

        <Separator className="bg-surface-container-high" />

        {/* Menu Navigasi */}
        <nav className="px-4 py-6 space-y-2 overflow-y-auto">
          <p className="px-3 mb-3 text-[10px] font-bold tracking-widest text-outline uppercase">
            Pelaporan Aktivitas Harian
          </p>
          {guruMenu.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileOpen(false)}
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
      </div>

      <div>
        <Separator className="bg-surface-container-high" />

        {/* User Profile Footer */}
        <div className="p-4 bg-surface-bright flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-md bg-amber-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
              {userData.initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-on-surface truncate">{userData.name}</p>
              <p className="text-[10px] text-outline font-medium truncate">{userData.role}</p>
            </div>
          </div>

          <button 
            type="button"
            onClick={onLogout}
            title="Keluar / Logout"
            className="p-2 text-outline hover:text-error hover:bg-error-container/40 rounded-lg transition-colors cursor-pointer shrink-0"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function GuruLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const [userData, setUserData] = useState({
    name: 'Tenaga Pendidik',
    role: 'Guru SMKN 4 Payakumbuh',
    initials: 'TE'
  });

  useEffect(() => {
    const loadUserData = () => {
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          const user = JSON.parse(storedUser);
          const name = user.nama_lengkap || user.username || user.nama || 'Tenaga Pendidik';
          const role = user.role ? `Guru Program Studi` : 'Guru / Tenaga Pendidik';
          const initials = name.slice(0, 2).toUpperCase();
          setUserData({ name, role, initials });
          return;
        }
        const username = localStorage.getItem('username');
        if (username) {
          setUserData({
            name: username,
            role: 'Guru / Tenaga Pendidik',
            initials: username.slice(0, 2).toUpperCase()
          });
        }
      } catch (e: unknown) {
        console.error("Gagal membaca data user:", e);
      }
    };

    loadUserData();
  }, []);

  const handleLogout = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    if (!window.confirm("Apakah Anda yakin ingin keluar dari sistem?")) return;

    localStorage.clear();
    sessionStorage.clear();

    const cookies = document.cookie.split(";");
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i];
      const eqPos = cookie.indexOf("=");
      const name = eqPos > -1 ? cookie.substring(0, eqPos).trim() : cookie.trim();
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`;
    }

    window.location.href = '/login';
  };

  return (
    <div className="min-h-screen bg-background text-on-surface antialiased flex flex-col lg:flex-row selection:bg-secondary-container">
      
      {/* Sidebar Desktop Collapsible */}
      <aside 
        className={`hidden lg:block fixed inset-y-0 left-0 bg-white border-r border-surface-container-high z-20 transition-all duration-300 ease-in-out ${
          isSidebarOpen ? 'w-[280px] opacity-100' : 'w-0 opacity-0 overflow-hidden border-none'
        }`}
      >
        <div className="w-[280px] h-full">
          <SidebarContent 
            isMobile={false}
            pathname={pathname}
            userData={userData}
            setIsSidebarOpen={setIsSidebarOpen}
            setIsMobileOpen={setIsMobileOpen}
            onLogout={handleLogout}
          />
        </div>
      </aside>

      {/* Main Container Area */}
      <div 
        className={`w-full flex flex-col min-h-screen transition-all duration-300 ease-in-out relative ${
          isSidebarOpen ? 'lg:pl-[280px]' : 'lg:pl-0'
        }`}
      >
        {/* Header Mobile */}
        <header className="lg:hidden w-full bg-white border-b border-surface-container px-5 py-4 flex justify-between items-center sticky top-0 z-40 shadow-sm">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded bg-primary flex items-center justify-center text-white font-bold text-xs shadow-sm">
              GR
            </div>
            <div>
              <h2 className="text-xs font-bold tracking-wider text-on-surface font-sans uppercase">INVELA CONTROL</h2>
              <span className="text-[10px] font-semibold text-amber-700 block">Guru Access</span>
            </div>
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
            <div className="relative w-[280px] max-w-sm bg-white h-full flex flex-col shadow-2xl z-10 animate-in slide-in-from-left duration-200">
              <div className="absolute top-4 right-4 z-20">
                <button
                  type="button"
                  onClick={() => setIsMobileOpen(false)}
                  className="p-1.5 border border-surface-container rounded-lg hover:bg-surface-low text-outline cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto">
                <SidebarContent 
                  isMobile={true}
                  pathname={pathname}
                  userData={userData}
                  setIsSidebarOpen={setIsSidebarOpen}
                  setIsMobileOpen={setIsMobileOpen}
                  onLogout={handleLogout}
                />
              </div>
            </div>
          </div>
        )}

        {/* Tombol Buka Sidebar Desktop Saat Tertutup */}
        {!isSidebarOpen && (
          <button
            type="button"
            onClick={() => setIsSidebarOpen(true)}
            title="Buka Sidebar"
            className="hidden lg:flex fixed top-5 left-5 z-30 p-2.5 bg-white border border-surface-container-high shadow-md rounded-xl text-on-surface hover:text-primary hover:bg-surface-low transition-all cursor-pointer items-center justify-center"
          >
            <PanelRightClose className="w-5 h-5" />
          </button>
        )}

        {/* Main Content Page */}
        <main className="flex-1 p-5 sm:p-8 lg:p-10 max-w-7xl w-full mx-auto space-y-8">
          {children}
        </main>
      </div>
    </div>
  );
}