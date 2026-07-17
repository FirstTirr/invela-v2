import React from 'react';
import { Users, School, GraduationCap, Tags, ArrowUpRight, LayoutDashboard } from 'lucide-react';

export default function AdminDashboard() {
  const stats = [
    { title: 'Total User Terdaftar', value: '14', unit: 'Akun', icon: Users, desc: 'Teknisi, Kabeng & Kaprog' },
    { title: 'Infrastruktur Labor', value: '6', unit: 'Ruangan', icon: School, desc: 'Aktif digunakan pratikum' },
    { title: 'Program Keahlian', value: '3', unit: 'Jurusan', icon: GraduationCap, desc: 'Terintegrasi sistem' },
    { title: 'Kategori Inventaris', value: '8', unit: 'Jenis', icon: Tags, desc: 'Logistik klaster barang' },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Banner / Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-surface-container pb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-on-surface sm:text-3xl font-sans">
            Overview Control Center
          </h1>
          <p className="text-sm text-on-surface-variant mt-1">
            Sistem manajemen terpusat untuk data labor, otentikasi entitas, dan konfigurasi master data sekolah.
          </p>
        </div>
      </div>

      {/* Modern Dashboard Grid Layout */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div 
              key={idx} 
              className="bg-white border border-surface-container-high rounded-lg p-5 flex flex-col justify-between hover:border-outline-variant/60 transition-all duration-200 group"
            >
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-outline tracking-widest uppercase font-sans">
                    {stat.title}
                  </p>
                  <div className="flex items-baseline gap-1.5 pt-1">
                    <span className="text-3xl font-bold tabular-nums text-on-surface tracking-tight">
                      {stat.value}
                    </span>
                    <span className="text-xs font-semibold text-outline">
                      {stat.unit}
                    </span>
                  </div>
                </div>
                {/* Secondary blue icon container base on design.md */}
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

      {/* Area Placeholder untuk Konten Berikutnya */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white border border-surface-container-high rounded-lg p-6 h-64 flex flex-col justify-center items-center text-center">
          <div className="w-12 h-12 rounded-full bg-surface-low flex items-center justify-center text-outline mb-3">
            <LayoutDashboard className="w-5 h-5" />
          </div>
          <h3 className="text-sm font-bold text-on-surface">Visualisasi Log & Aktivitas Data</h3>
          <p className="text-xs text-on-surface-variant max-w-sm mt-1">
            Grafik pemantauan data masuk akan dirender secara dinamis menggunakan chart komponen setelah data terintegrasi.
          </p>
        </div>
        
        <div className="bg-white border border-surface-container-high rounded-lg p-6 h-64 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-on-surface">Sistem Pintasan Rujukan</h3>
            <p className="text-xs text-on-surface-variant mt-0.5">Akses cepat modifikasi parameter sistem.</p>
          </div>
          <div className="space-y-2">
            <div className="p-2.5 bg-surface-low rounded border border-surface-container text-xs font-medium flex justify-between items-center hover:bg-surface-container transition-colors cursor-pointer">
              <span>Setup Kelas & Ruangan Baru</span>
              <span className="text-[10px] font-bold text-primary bg-white px-1.5 py-0.5 rounded border border-surface-container">Master</span>
            </div>
            <div className="p-2.5 bg-surface-low rounded border border-surface-container text-xs font-medium flex justify-between items-center hover:bg-surface-container transition-colors cursor-pointer">
              <span>Registrasi Ulang Akun Guru / Teknisi</span>
              <span className="text-[10px] font-bold text-primary bg-white px-1.5 py-0.5 rounded border border-surface-container">Akun</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}