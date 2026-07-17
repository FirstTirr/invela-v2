"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Package, ClipboardList, AlertTriangle, Eye, LogOut } from 'lucide-react';

export default function KaprogLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const kaprogMenu = [
    { title: 'Dashboard Overview', href: '/kaprog', icon: LayoutDashboard },
    { title: 'Monitoring Aset Barang', href: '/kaprog/items', icon: Package },
    { title: 'Monitoring Peminjaman', href: '/kaprog/loans', icon: ClipboardList },
    { title: 'Log Kerusakan & Biaya', href: '/kaprog/damages', icon: AlertTriangle },
  ];

  return (
    <div className="min-h-screen bg-background text-on-surface antialiased flex selection:bg-secondary-container">
      
      {/* Fixed Sidebar */}
      <aside className="fixed inset-y-0 left-0 w-[280px] bg-white border-r border-surface-container-high flex flex-col z-20">
        
        {/* Brand Header */}
        <div className="h-20 px-6 border-b border-surface-container flex items-center gap-3 bg-white">
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

        {/* Navigation Section */}
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

        {/* Profile Footer */}
        <div className="p-4 border-t border-surface-container bg-surface-bright flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-md bg-secondary text-white flex items-center justify-center font-bold text-sm">
              KP
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-on-surface truncate">Kaprog PPLG</p>
              <p className="text-[10px] text-outline font-medium truncate">SMKN 4 Payakumbuh</p>
            </div>
          </div>
          <button className="p-1.5 text-outline hover:text-error hover:bg-error-container/40 rounded transition-colors">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* Main Content Wrapper */}
      <div className="pl-[280px] w-full flex flex-col min-h-screen">
        <main className="flex-1 p-10 max-w-7xl w-full mx-auto space-y-8">
          {children}
        </main>
      </div>
    </div>
  );
}