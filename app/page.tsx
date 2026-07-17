import React from 'react';
import PageAnimateWrapper from '@/components/page-animate-wrapper';
import { Users, School, GraduationCap, Tags, ArrowUpRight, LayoutDashboard } from 'lucide-react';

export default function AdminDashboard() {
  const stats = [
    { title: 'Total User Terdaftar', value: '14', unit: 'Akun', icon: Users, desc: 'Teknisi, Kabeng & Kaprog' },
    { title: 'Infrastruktur Labor', value: '6', unit: 'Ruangan', icon: School, desc: 'Aktif digunakan pratikum' },
    { title: 'Program Keahlian', value: '3', unit: 'Jurusan', icon: GraduationCap, desc: 'Terintegrasi sistem' },
    { title: 'Kategori Inventaris', value: '8', unit: 'Jenis', icon: Tags, desc: 'Logistik klaster barang' },
  ];

  return (
    <PageAnimateWrapper>
      <div className="space-y-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-surface-container pb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-on-surface sm:text-3xl font-sans">Overview Control Center</h1>
            <p className="text-sm text-on-surface-variant mt-1">Sistem manajemen terpusat untuk data labor, otentikasi entitas, dan konfigurasi master data sekolah.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {stats.map((stat, idx) => {
            const Icon = stat.icon;
            return (
              <div key={idx} className="bg-white border border-surface-container-high rounded-lg p-5 flex flex-col justify-between hover:border-outline-variant/60 hover:shadow-sm transition-all duration-200 group">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-outline tracking-widest uppercase font-sans">{stat.title}</p>
                    <div className="flex items-baseline gap-1.5 pt-1">
                      <span className="text-3xl font-bold tabular-nums text-on-surface tracking-tight">{stat.value}</span>
                      <span className="text-xs font-semibold text-outline">{stat.unit}</span>
                    </div>
                  </div>
                  <div className="w-9 h-9 rounded-md bg-secondary-container flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-200">
                    <Icon className="w-4 h-4" />
                  </div>
                </div>
                <div className="border-t border-surface-container mt-4 pt-3 flex items-center justify-between text-[11px] text-on-surface-variant">
                  <span>{stat.desc}</span>
                  <ArrowUpRight className="w-3 h-3 text-outline opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </PageAnimateWrapper>
  );
}