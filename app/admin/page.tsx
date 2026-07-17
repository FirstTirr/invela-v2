"use client";

import React from 'react';
import PageAnimateWrapper from '@/components/page-animate-wrapper';
import { Users, School, GraduationCap, Tags, ArrowUpRight, LayoutDashboard, Settings } from 'lucide-react';

export default function AdminDashboard() {
  const stats = [
    { title: 'Total User Terdaftar', value: '14', unit: 'Akun', icon: Users, desc: 'Teknisi, Kabeng & Kaprog' },
    { title: 'Infrastruktur Labor', value: '6', unit: 'Ruangan', icon: School, desc: 'Aktif digunakan pratikum' },
    { title: 'Program Keahlian', value: '3', unit: 'Jurusan', icon: GraduationCap, desc: 'Terintegrasi sistem' },
    { title: 'Kategori Inventaris', value: '8', unit: 'Jenis', icon: Tags, desc: 'Logistik klaster barang' },
  ];

  return (
    <PageAnimateWrapper>
      <div className="space-y-8 font-sans antialiased tracking-tight">
        
        {/* Welcome Banner / Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-surface-container pb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-on-surface">
              Overview Control Center
            </h1>
            <p className="text-base text-on-surface-variant mt-2 font-medium">
              Sistem manajemen terpusat untuk data labor, otentikasi entitas, dan konfigurasi master data sekolah.
            </p>
          </div>
        </div>

        {/* Modern Dashboard Grid Layout - Teks Diperbesar & Padding Lega */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div 
                key={idx} 
                className="bg-white border border-surface-container-high rounded-xl p-6 flex flex-col justify-between hover:border-primary/40 hover:shadow-md transition-all duration-200 group"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <p className="text-xs font-bold text-outline tracking-wider uppercase">
                      {stat.title}
                    </p>
                    <div className="flex items-baseline gap-2 pt-1">
                      <span className="text-4xl font-black tabular-nums text-on-surface tracking-tight">
                        {stat.value}
                      </span>
                      <span className="text-sm font-bold text-outline">
                        {stat.unit}
                      </span>
                    </div>
                  </div>
                  {/* Container Icon Gede & Elegan */}
                  <div className="w-12 h-12 rounded-xl bg-secondary-container flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-300 shadow-sm">
                    <Icon className="w-5 h-5" />
                  </div>
                </div>
                
                <div className="border-t border-surface-container mt-5 pt-4 flex items-center justify-between text-sm font-medium text-on-surface-variant">
                  <span>{stat.desc}</span>
                  <ArrowUpRight className="w-4 h-4 text-primary opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Area Visualisasi & Pintasan Rujukan */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Placeholder Chart Log */}
          <div className="lg:col-span-2 bg-white border border-surface-container-high rounded-xl p-6 min-h-[280px] flex flex-col justify-center items-center text-center shadow-sm">
            <div className="w-14 h-14 rounded-full bg-surface-low flex items-center justify-center text-primary mb-4 border border-surface-container">
              <LayoutDashboard className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-on-surface">Visualisasi Log & Aktivitas Data</h3>
            <p className="text-base text-on-surface-variant max-w-md mt-2 font-medium leading-relaxed">
              Grafik pemantauan data masuk akan dirender secara dinamis menggunakan chart komponen setelah data API terintegrasi penuh.
            </p>
          </div>
          
          {/* Quick Access Navigation */}
          <div className="bg-white border border-surface-container-high rounded-xl p-6 flex flex-col justify-between shadow-sm">
            <div>
              <h3 className="text-lg font-bold text-on-surface flex items-center gap-2">
                <Settings className="w-5 h-5 text-outline" /> Sistem Pintasan Rujukan
              </h3>
              <p className="text-sm text-on-surface-variant mt-1.5 font-medium">Akses cepat modifikasi parameter sistem kontrol.</p>
            </div>
            <div className="space-y-3 mt-6 lg:mt-0">
              <a href="/admin/master" className="p-4 bg-surface-low rounded-xl border border-surface-container text-base font-bold flex justify-between items-center hover:bg-secondary-container/50 hover:text-primary transition-all shadow-sm group">
                <span>Setup Kelas & Ruangan Baru</span>
                <span className="text-xs font-black text-primary bg-white px-2.5 py-1 rounded-md border border-surface-container-high uppercase tracking-wide">Master</span>
              </a>
              <a href="/admin/users" className="p-4 bg-surface-low rounded-xl border border-surface-container text-base font-bold flex justify-between items-center hover:bg-secondary-container/50 hover:text-primary transition-all shadow-sm group">
                <span>Registrasi Ulang Akun Otoritas</span>
                <span className="text-xs font-black text-primary bg-white px-2.5 py-1 rounded-md border border-surface-container-high uppercase tracking-wide">Akun</span>
              </a>
            </div>
          </div>

        </div>
      </div>
    </PageAnimateWrapper>
  );
}