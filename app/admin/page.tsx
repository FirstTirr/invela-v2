"use client";

import React, { useState, useEffect } from 'react';
import PageAnimateWrapper from '@/components/page-animate-wrapper';
import { Users, Building2, GraduationCap, Tags, Loader2, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import * as API from '@/lib/api';

// Import Recharts
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

export default function AdminDashboardOverview() {
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const [stats, setStats] = useState({
    totalUser: 0,
    totalLabor: 0,
    totalJurusan: 0,
    totalKategori: 0,
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const fetchAdminStats = async () => {
    try {
      setLoading(true);

      // Cek variasi nama export untuk API
      const userApi = (API as any).apiUser || (API as any).apiUsers;
      const laborApi = (API as any).apiLabor;
      const jurusanApi = (API as any).apiJurusan;
      const kategoriApi = (API as any).apiKategori;

      const [usersData, laborData, jurusanData, kategoriData] = await Promise.all([
        userApi?.getAll ? userApi.getAll().catch(() => []) : Promise.resolve([]),
        laborApi?.getAll ? laborApi.getAll().catch(() => []) : Promise.resolve([]),
        jurusanApi?.getAll ? jurusanApi.getAll().catch(() => []) : Promise.resolve([]),
        kategoriApi?.getAll ? kategoriApi.getAll().catch(() => []) : Promise.resolve([])
      ]);

      setStats({
        totalUser: Array.isArray(usersData) ? usersData.length : 0,
        totalLabor: Array.isArray(laborData) ? laborData.length : 0,
        totalJurusan: Array.isArray(jurusanData) ? jurusanData.length : 0,
        totalKategori: Array.isArray(kategoriData) ? kategoriData.length : 0,
      });
    } catch (err) {
      console.error("Gagal memuat statistik admin:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminStats();
  }, []);

  // Data ringkasan visualisasi grafik berdasarkan status master data
  const chartData = [
    { name: 'User', total: stats.totalUser },
    { name: 'Labor', total: stats.totalLabor },
    { name: 'Jurusan', total: stats.totalJurusan },
    { name: 'Kategori', total: stats.totalKategori },
  ];

  return (
    <PageAnimateWrapper>
      <div className="space-y-8 font-sans antialiased tracking-tight">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-on-surface">Overview Control Center</h1>
          <p className="text-base text-on-surface-variant mt-2 font-medium">
            Sistem manajemen terpusat untuk data labor, otentikasi entitas, dan konfigurasi master data sekolah.
          </p>
        </div>

        {/* 4 Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Card 1: Total User */}
          <div className="p-6 bg-white border border-surface-container-high rounded-xl shadow-xs flex flex-col justify-between space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold text-outline tracking-wider uppercase">Total User Terdaftar</p>
                {loading ? (
                  <Loader2 className="w-6 h-6 animate-spin text-primary mt-2" />
                ) : (
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-4xl font-black text-on-surface tabular-nums">{stats.totalUser}</span>
                    <span className="text-sm font-semibold text-outline">Akun</span>
                  </div>
                )}
              </div>
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                <Users className="w-6 h-6" />
              </div>
            </div>
            <p className="text-xs font-medium text-outline border-t border-surface-container pt-3">
              Teknisi, Kabeng & Kaprog
            </p>
          </div>

          {/* Card 2: Labor */}
          <div className="p-6 bg-white border border-surface-container-high rounded-xl shadow-xs flex flex-col justify-between space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold text-outline tracking-wider uppercase">Infrastruktur Labor</p>
                {loading ? (
                  <Loader2 className="w-6 h-6 animate-spin text-primary mt-2" />
                ) : (
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-4xl font-black text-on-surface tabular-nums">{stats.totalLabor}</span>
                    <span className="text-sm font-semibold text-outline">Ruangan</span>
                  </div>
                )}
              </div>
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                <Building2 className="w-6 h-6" />
              </div>
            </div>
            <p className="text-xs font-medium text-outline border-t border-surface-container pt-3">
              Aktif digunakan praktikum
            </p>
          </div>

          {/* Card 3: Jurusan */}
          <div className="p-6 bg-white border border-surface-container-high rounded-xl shadow-xs flex flex-col justify-between space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold text-outline tracking-wider uppercase">Program Keahlian</p>
                {loading ? (
                  <Loader2 className="w-6 h-6 animate-spin text-primary mt-2" />
                ) : (
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-4xl font-black text-on-surface tabular-nums">{stats.totalJurusan}</span>
                    <span className="text-sm font-semibold text-outline">Jurusan</span>
                  </div>
                )}
              </div>
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                <GraduationCap className="w-6 h-6" />
              </div>
            </div>
            <p className="text-xs font-medium text-outline border-t border-surface-container pt-3">
              Terintegrasi sistem
            </p>
          </div>

          {/* Card 4: Kategori */}
          <div className="p-6 bg-white border border-surface-container-high rounded-xl shadow-xs flex flex-col justify-between space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold text-outline tracking-wider uppercase">Kategori Inventaris</p>
                {loading ? (
                  <Loader2 className="w-6 h-6 animate-spin text-primary mt-2" />
                ) : (
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-4xl font-black text-on-surface tabular-nums">{stats.totalKategori}</span>
                    <span className="text-sm font-semibold text-outline">Jenis</span>
                  </div>
                )}
              </div>
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                <Tags className="w-6 h-6" />
              </div>
            </div>
            <p className="text-xs font-medium text-outline border-t border-surface-container pt-3">
              Logistik klaster barang
            </p>
          </div>

        </div>

        {/* Lower Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Grafik Recharts Card */}
          <div className="lg:col-span-2 p-6 bg-white border border-surface-container-high rounded-xl shadow-xs flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between border-b border-surface-container pb-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-bold text-on-surface">Distribusi & Visualisasi Master Data</h3>
              </div>
              <span className="text-xs font-semibold text-outline bg-surface-low px-2.5 py-1 rounded-md border border-surface-container">
                Real-time API
              </span>
            </div>

            <div className="h-[220px] w-full pt-2">
              {!isMounted || loading ? (
                <div className="w-full h-full flex items-center justify-center text-outline gap-2 text-sm font-medium">
                  <Loader2 className="w-5 h-5 animate-spin text-primary" /> Memuat data grafik...
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0.0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis 
                      dataKey="name" 
                      tickLine={false} 
                      axisLine={false} 
                      tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} 
                    />
                    <YAxis 
                      tickLine={false} 
                      axisLine={false} 
                      tick={{ fill: '#64748b', fontSize: 12 }} 
                      allowDecimals={false} 
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#ffffff', 
                        borderRadius: '8px', 
                        borderColor: '#e2e8f0',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        fontSize: '12px',
                        fontWeight: '600'
                      }} 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="total" 
                      stroke="#2563eb" 
                      strokeWidth={3} 
                      fillOpacity={1} 
                      fill="url(#colorTotal)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Sistem Pintasan Rujukan */}
          <div className="p-6 bg-white border border-surface-container-high rounded-xl space-y-4 shadow-xs">
            <div className="flex items-center gap-2 text-on-surface font-bold text-sm">
              <span className="text-outline">⚙️</span>
              <span>Sistem Pintasan Rujukan</span>
            </div>
            <p className="text-xs text-outline font-medium">
              Akses cepat modifikasi parameter sistem kontrol.
            </p>

            <div className="space-y-3 pt-2">
              <Link
                href="/admin/master"
                className="p-3 bg-surface-low hover:bg-surface-container border border-surface-container-high rounded-xl flex items-center justify-between transition-all group"
              >
                <div>
                  <p className="text-xs font-bold text-on-surface">Setup Kelas & Ruangan Baru</p>
                </div>
                <span className="px-2 py-1 bg-white border border-blue-200 text-blue-700 font-extrabold text-[10px] rounded uppercase tracking-wider group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  MASTER
                </span>
              </Link>

              <Link
                href="/admin/users"
                className="p-3 bg-surface-low hover:bg-surface-container border border-surface-container-high rounded-xl flex items-center justify-between transition-all group"
              >
                <div>
                  <p className="text-xs font-bold text-on-surface">Registrasi Ulang Akun Otoritas</p>
                </div>
                <span className="px-2 py-1 bg-white border border-blue-200 text-blue-700 font-extrabold text-[10px] rounded uppercase tracking-wider group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  AKUN
                </span>
              </Link>
            </div>
          </div>

        </div>
      </div>
    </PageAnimateWrapper>
  );
}