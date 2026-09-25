"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, PackagePlus, ClipboardList, 
  AlertTriangle, User, LogOut, Menu, X, MonitorCheck, History,
  ChevronDown, PanelLeftClose, PanelRightClose, ShieldCheck, Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SubMenuItem {
  title: string;
  href: string;
  icon: React.ElementType;
}

interface MenuItem {
  title: string;
  href?: string;
  icon: React.ElementType;
  subItems?: SubMenuItem[];
}

interface SidebarContentProps {
  isMobile?: boolean;
  pathname: string;
  userData: { name: string; role: string; initials: string };
  openLoansDropdown: boolean;
  openDamagesDropdown: boolean;
  setIsSidebarOpen: (open: boolean) => void;
  setIsMobileOpen: (open: boolean) => void;
  setOpenLoansDropdown: React.Dispatch<React.SetStateAction<boolean>>;
  setOpenDamagesDropdown: React.Dispatch<React.SetStateAction<boolean>>;
  onLogout: (e?: React.MouseEvent<HTMLButtonElement>) => void;
  isLoggingOut: boolean;
}

const kabengMenu: MenuItem[] = [
  { title: 'Dashboard Overview', href: '/kabeng', icon: LayoutDashboard },
  { title: 'Kelola Barang', href: '/kabeng/items', icon: PackagePlus },
  { title: 'Penggunaan Labor', href: '/kabeng/penggunaan', icon: MonitorCheck },
  {
    title: 'Peminjaman Barang',
    icon: ClipboardList,
    subItems: [
      { title: 'Peminjaman Aktif', href: '/kabeng/loans', icon: ClipboardList },
      { title: 'Riwayat Peminjaman', href: '/kabeng/loans/completed', icon: History },
    ]
  },
  {
    title: 'Laporan & Kerusakan',
    icon: AlertTriangle,
    subItems: [
      { title: 'Laporan Kerusakan', href: '/kabeng/damages', icon: AlertTriangle },
      { title: 'Riwayat Perbaikan', href: '/kabeng/damages/repair-history', icon: History },
    ]
  },
];

function SidebarContent({
  isMobile = false,
  pathname,
  userData,
  openLoansDropdown,
  openDamagesDropdown,
  setIsSidebarOpen,
  setIsMobileOpen,
  setOpenLoansDropdown,
  setOpenDamagesDropdown,
  onLogout,
  isLoggingOut
}: SidebarContentProps) {
  return (
    <div className="flex flex-col h-full justify-between p-5 font-sans bg-white">
      <div className="space-y-7">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-3">
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

        <nav className="space-y-1.5">
          <p className="px-3 mb-3 text-xs font-bold tracking-wider text-outline uppercase">
            Bengkel Operations
          </p>
          {kabengMenu.map((item, idx) => {
            const Icon = item.icon;

            if (item.subItems) {
              const isLoansGroup = item.title === 'Peminjaman Barang';
              const isOpen = isLoansGroup ? openLoansDropdown : openDamagesDropdown;
              const toggleOpen = isLoansGroup 
                ? () => setOpenLoansDropdown(prev => !prev) 
                : () => setOpenDamagesDropdown(prev => !prev);

              const isGroupActive = item.subItems.some(sub => sub.href === pathname);

              return (
                <div key={idx} className="space-y-1">
                  <button
                    type="button"
                    onClick={toggleOpen}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-base font-bold transition-all cursor-pointer ${
                      isGroupActive 
                        ? "text-primary bg-primary/5" 
                        : "text-on-surface-variant hover:bg-surface-low hover:text-on-surface"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-5 h-5 shrink-0 ${isGroupActive ? "text-primary" : "text-outline"}`} />
                      <span>{item.title}</span>
                    </div>
                    <ChevronDown className={`w-4 h-4 transition-transform duration-200 text-outline ${isOpen ? "rotate-180" : ""}`} />
                  </button>

                  {isOpen && (
                    <div className="pl-6 space-y-1 border-l-2 border-surface-container-high ml-4 my-1">
                      {item.subItems.map((sub) => {
                        const SubIcon = sub.icon;
                        const isSubActive = pathname === sub.href;

                        return (
                          <Link
                            key={sub.href}
                            href={sub.href}
                            onClick={() => setIsMobileOpen(false)}
                            className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm font-bold transition-all ${
                              isSubActive
                                ? "bg-secondary-container text-primary shadow-xs"
                                : "text-on-surface-variant hover:bg-surface-low hover:text-on-surface"
                            }`}
                          >
                            <SubIcon className={`w-4 h-4 shrink-0 ${isSubActive ? "text-primary" : "text-outline"}`} />
                            <span>{sub.title}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href || '#'}
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
            {userData.initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-on-surface truncate">{userData.name}</p>
            <p className="text-xs font-semibold text-outline truncate">{userData.role}</p>
          </div>
        </div>
        <button 
          type="button"
          disabled={isLoggingOut}
          onClick={onLogout} 
          title="Keluar dari Akun"
          className="p-2 text-outline hover:text-error hover:bg-error-container/40 rounded-lg transition-colors cursor-pointer shrink-0 disabled:opacity-50"
        >
          <LogOut className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

export default function KabengLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // State untuk mengontrol animasi logout gerbang menutup
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const [openLoansDropdown, setOpenLoansDropdown] = useState(() => pathname.startsWith('/kabeng/loans'));
  const [openDamagesDropdown, setOpenDamagesDropdown] = useState(() => pathname.startsWith('/kabeng/damages'));

  const [userData] = useState(() => {
    if (typeof window === 'undefined') {
      return { name: 'Kepala Bengkel', role: 'SMKN 4 Payakumbuh', initials: 'KB' };
    }
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const user = JSON.parse(storedUser) as { nama_lengkap?: string; username?: string; nama?: string; jurusan?: string; nama_jurusan?: string };
        const name = user.nama_lengkap || user.username || user.nama || 'Kepala Bengkel';
        const jurusan = user.jurusan || user.nama_jurusan || 'SMKN 4 Payakumbuh';
        const initials = name.slice(0, 2).toUpperCase();
        return { name, role: jurusan, initials };
      }
      const username = localStorage.getItem('username');
      if (username) {
        return {
          name: username,
          role: 'Kepala Bengkel',
          initials: username.slice(0, 2).toUpperCase()
        };
      }
    } catch (e: unknown) {
      console.error("Gagal membaca data user:", e);
    }
    return { name: 'Kepala Bengkel', role: 'SMKN 4 Payakumbuh', initials: 'KB' };
  });

  useEffect(() => {
    router.prefetch('/login');
  }, [router]);

  const handleLogout = (e?: React.MouseEvent<HTMLButtonElement>) => {
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

  return (
    <div className="min-h-screen bg-background text-on-surface antialiased flex selection:bg-secondary-container relative overflow-hidden">
      
      {/* OVERLAY ANIMASI GERBANG MENUTUP (LOGOUT GATE CLOSING) */}
      <AnimatePresence>
        {isLoggingOut && (
          <div className="fixed inset-0 z-50 flex pointer-events-none overflow-hidden">
            
            {/* GERBANG KIRI (Meluncur dari -100% ke 0%) */}
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

            {/* GERBANG KANAN (Meluncur dari 100% ke 0%) */}
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

      <aside 
        className={`hidden lg:block bg-white border-r border-surface-container-high shrink-0 h-screen sticky top-0 z-20 transition-all duration-300 ease-in-out ${
          isSidebarOpen ? 'w-72 opacity-100' : 'w-0 opacity-0 overflow-hidden border-none'
        }`}
      >
        <div className="w-72 h-full">
          <SidebarContent 
            isMobile={false}
            pathname={pathname}
            userData={userData}
            openLoansDropdown={openLoansDropdown}
            openDamagesDropdown={openDamagesDropdown}
            setIsSidebarOpen={setIsSidebarOpen}
            setIsMobileOpen={setIsMobileOpen}
            setOpenLoansDropdown={setOpenLoansDropdown}
            setOpenDamagesDropdown={setOpenDamagesDropdown}
            onLogout={handleLogout}
            isLoggingOut={isLoggingOut}
          />
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0 min-h-screen relative">
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
                <SidebarContent 
                  isMobile={true}
                  pathname={pathname}
                  userData={userData}
                  openLoansDropdown={openLoansDropdown}
                  openDamagesDropdown={openDamagesDropdown}
                  setIsSidebarOpen={setIsSidebarOpen}
                  setIsMobileOpen={setIsMobileOpen}
                  setOpenLoansDropdown={setOpenLoansDropdown}
                  setOpenDamagesDropdown={setOpenDamagesDropdown}
                  onLogout={handleLogout}
                  isLoggingOut={isLoggingOut}
                />
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