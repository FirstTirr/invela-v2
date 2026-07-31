"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ClipboardList, AlertTriangle, LogOut, UserCheck } from 'lucide-react';
import { Separator } from "@/components/ui/separator";

export default function GuruLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const [userData, setUserData] = useState({
    name: 'Tenaga Pendidik',
    role: 'Guru SMKN 4 Payakumbuh',
    initials: 'TE'
  });

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        const name = user.nama_lengkap || user.username || user.nama || 'Tenaga Pendidik';
        const role = user.role ? `Guru - ${user.role.toUpperCase()}` : 'Guru / Tenaga Pendidik';
        const initials = name.slice(0, 2).toUpperCase();

        setUserData({ name, role, initials });
      } else {
        const username = localStorage.getItem('username');
        if (username) {
          setUserData({
            name: username,
            role: 'Guru / Tenaga Pendidik',
            initials: username.slice(0, 2).toUpperCase()
          });
        }
      }
    } catch (e) {
      console.error("Gagal membaca data user:", e);
    }
  }, []);

  const guruMenu = [
    { title: 'Lapor Pemakaian Labor', href: '/guru', icon: ClipboardList },
    { title: 'Lapor Kerusakan Barang', href: '/guru/damages', icon: AlertTriangle },
  ];

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

  return (
    <div className="min-h-screen bg-background text-on-surface antialiased flex selection:bg-secondary-container">
      <aside className="fixed inset-y-0 left-0 w-[280px] bg-white border-r border-surface-container-high flex flex-col z-20">
        <div className="h-20 px-6 flex items-center gap-3 bg-white">
          <div className="w-9 h-9 rounded bg-primary flex items-center justify-center text-white font-bold text-sm shadow-sm">
            GR
          </div>
          <div>
            <h1 className="text-xs font-bold tracking-wider text-on-surface font-sans uppercase">INVELA CONTROL</h1>
            <p className="text-[10px] font-semibold tracking-wider text-amber-700 uppercase flex items-center gap-1 mt-0.5">
              <UserCheck className="w-3 h-3 text-amber-600" /> Guru / Instructor Access
            </p>
          </div>
        </div>

        <Separator className="bg-surface-container-high" />

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto bg-white">
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

        <div className="p-4 bg-surface-bright flex items-center justify-between">
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
            onClick={handleLogout}
            title="Keluar / Logout"
            className="p-2 text-outline hover:text-error hover:bg-error-container/40 rounded-lg transition-colors cursor-pointer shrink-0"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      <div className="pl-[280px] w-full flex flex-col min-h-screen">
        <main className="flex-1 p-10 max-w-7xl w-full mx-auto space-y-8">
          {children}
        </main>
      </div>
    </div>
  );
}