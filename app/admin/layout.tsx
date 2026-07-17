"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, Layers, Shield, ChevronDown, ChevronRight, Table2, LogOut } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isDropdownOpen, setIsDropdownOpen] = useState(true);

  const subMenuItems = [
    { title: 'Data Labor', href: '/admin/labor' },
    { title: 'Data Kelas', href: '/admin/kelas' },
    { title: 'Data Jurusan', href: '/admin/jurusan' },
    { title: 'Data Kategori', href: '/admin/category' },
  ];

  return (
    <div className="min-h-screen bg-background text-on-surface antialiased flex selection:bg-secondary-container">
      
      {/* Sidebar Panel */}
      <aside className="fixed inset-y-0 left-0 w-[280px] bg-white border-r border-surface-container-high flex flex-col z-20">
        <div className="h-20 px-6 border-b border-surface-container flex items-center gap-3 bg-white">
          <div className="w-9 h-9 rounded bg-primary flex items-center justify-center text-white font-bold text-sm shadow-sm">
            IN
          </div>
          <div>
            <h1 className="text-xs font-bold tracking-wider text-on-surface font-sans uppercase">INVELA CONTROL</h1>
            <p className="text-[10px] font-semibold tracking-wider text-primary uppercase flex items-center gap-1 mt-0.5">
              <Shield className="w-3 h-3 text-primary-container" /> Admin Console
            </p>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto bg-white">
          <p className="px-3 mb-3 text-[10px] font-bold tracking-widest text-outline uppercase">Platform Management</p>
          
          <Link
            href="/admin"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-200 ${
              pathname === '/admin' ? "bg-secondary-container text-primary font-semibold" : "text-on-surface-variant hover:bg-surface-low hover:text-on-surface"
            }`}
          >
            <LayoutDashboard className="w-4 h-4 text-outline" />
            Dashboard Overview
          </Link>

          <Link
            href="/admin/users"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-200 ${
              pathname === '/admin/users' ? "bg-secondary-container text-primary font-semibold" : "text-on-surface-variant hover:bg-surface-low hover:text-on-surface"
            }`}
          >
            <Users className="w-4 h-4 text-outline" />
            Memantau Akun
          </Link>

          <Link
            href="/admin/master"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all duration-200 ${
              pathname === '/admin/master' ? "bg-secondary-container text-primary font-semibold" : "text-on-surface-variant hover:bg-surface-low hover:text-on-surface"
            }`}
          >
            <Layers className="w-4 h-4 text-outline" />
            Input Data Master
          </Link>

          {/* Collapsible Dropdown Menu */}
          <div className="space-y-1">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-md text-sm font-medium text-on-surface-variant hover:bg-surface-low hover:text-on-surface transition-all duration-200"
            >
              <div className="flex items-center gap-3">
                <Table2 className="w-4 h-4 text-outline" />
                <span>Lihat Data Tabel</span>
              </div>
              {isDropdownOpen ? <ChevronDown className="w-4 h-4 text-outline" /> : <ChevronRight className="w-4 h-4 text-outline" />}
            </button>

            {isDropdownOpen && (
              <div className="pl-9 space-y-1.5 mt-1 border-l border-surface-container ml-5">
                {subMenuItems.map((sub) => {
                  const isSubActive = pathname === sub.href;
                  return (
                    <Link
                      key={sub.href}
                      href={sub.href}
                      className={`block px-3 py-2 text-xs font-medium rounded-md transition-all duration-150 ${
                        isSubActive ? "text-primary font-bold bg-secondary-container/50" : "text-on-surface-variant hover:text-on-surface hover:bg-surface-low"
                      }`}
                    >
                      {sub.title}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </nav>

        <div className="p-4 border-t border-surface-container bg-surface-bright flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-md bg-primary text-white flex items-center justify-center font-bold text-sm">AR</div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-on-surface truncate">Admin Root</p>
              <p className="text-[10px] text-outline font-medium truncate">SMKN 4 Payakumbuh</p>
            </div>
          </div>
          <button className="p-1.5 text-outline hover:text-error hover:bg-error-container/40 rounded transition-colors">
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* Main Container */}
      <div className="pl-[280px] w-full flex flex-col min-h-screen">
        <main className="flex-1 p-10 max-w-7xl w-full mx-auto space-y-8">{children}</main>
      </div>
    </div>
  );
}