"use client";

import React, { useState, useEffect } from 'react';
import PageAnimateWrapper from '@/components/page-animate-wrapper';
import { 
  CheckCircle2, 
  Handshake, 
  Wrench, 
  AlertTriangle, 
  Loader2, 
  TrendingUp 
} from 'lucide-react';
import Link from 'next/link';
import * as API from '@/lib/api';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

export default function KabengDashboardOverview() {
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const [stats, setStats] = useState({
    kondisiBaik: 0,
    sedangDipinjam: 0,
    barangRusak: 0,
    laporanKerusakan: 0,
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);

      const userStr = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
      const currentUser = userStr ? JSON.parse(userStr) : null;
      const myJurusanId = currentUser?.jurusan_id ? String(currentUser.jurusan_id) : null;

      const itemInstanceApi = (API as any).apiItemInstance;
      const peminjamanApi = (API as any).apiPeminjaman;
      const perbaikanApi = (API as any).apiPerbaikan || (API as any).apiLaporanKerusakan;
      const perangkatApi = (API as any).apiPerangkat;

      const [instancesData, loansData, damageReportsData, perangkatData] = await Promise.all([
        itemInstanceApi?.getAll ? itemInstanceApi.getAll().catch(() => []) : Promise.resolve([]),
        peminjamanApi?.getAll ? peminjamanApi.getAll().catch(() => []) : Promise.resolve([]),
        perbaikanApi?.getAll ? perbaikanApi.getAll().catch(() => []) : Promise.resolve([]),
        perangkatApi?.getAll ? perangkatApi.getAll().catch(() => []) : Promise.resolve([])
      ]);

      // Lookup map jurusan berdasarkan ID Perangkat
      const perangkatJurusanMap = new Map<number, string>();
      (perangkatData || []).forEach((p: any) => {
        const jId = p.labor?.id_jurusan || p.labor?.jurusan_id || p.id_jurusan || p.jurusan_id;
        if (jId) perangkatJurusanMap.set(Number(p.id), String(jId));
      });

      // Filter Item-Instance milik Jurusan Kabeng
      const filteredInstances = (instancesData || []).filter((item: any) => {
        if (!myJurusanId) return true;
        
        const itemJurusanId = 
          item.perangkat?.labor?.id_jurusan ||
          item.perangkat?.labor?.jurusan_id ||
          item.perangkat?.id_jurusan ||
          item.perangkat?.jurusan_id ||
          perangkatJurusanMap.get(Number(item.id_perangkat || item.perangkat_id));

        // Jika ada id jurusan pada item, samakan dengan Kabeng. Jika tidak ada, tampilkan saja.
        return itemJurusanId ? String(itemJurusanId) === myJurusanId : true;
      });

      // 1. Kondisi Baik (Semua item-instance yang TIDAK berstatus rusak)
      const kondisiBaik = filteredInstances.filter((i: any) => {
        const status = (i.status || '').toString().toLowerCase().trim();
        if (!status) return true; // Default item baru dianggap baik
        return ['baik', 'tersedia', 'normal', 'ready'].includes(status) || !status.includes('rusak');
      }).length;

      // 2. Barang Rusak (Item-instance berstatus rusak / dalam perbaikan)
      const barangRusak = filteredInstances.filter((i: any) => {
        const status = (i.status || '').toString().toLowerCase().trim();
        return status.includes('rusak') || status.includes('perbaikan') || status === 'maintenance';
      }).length;

      // 3. Peminjaman Aktif
      const sedangDipinjam = (loansData || []).filter((loan: any) => {
        const status = (loan.status || '').toLowerCase();
        return status === 'aktif' || status === 'dipinjam';
      }).length;

      // 4. Laporan Kerusakan (Pending)
      const laporanKerusakan = (damageReportsData || []).filter((report: any) => {
        const status = (report.status || '').toLowerCase();
        return status === 'pending' || status === 'lapor' || !status;
      }).length;

      setStats({
        kondisiBaik,
        sedangDipinjam,
        barangRusak,
        laporanKerusakan,
      });

    } catch (err) {
      console.error("Gagal memuat statistik Kabeng:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const chartData = [
    { name: 'Kondisi Baik', total: stats.kondisiBaik },
    { name: 'Dipinjam', total: stats.sedangDipinjam },
    { name: 'Barang Rusak', total: stats.barangRusak },
    { name: 'Laporan Kerusakan', total: stats.laporanKerusakan },
  ];

  return (
    <PageAnimateWrapper>
      <div className="space-y-8 font-sans antialiased tracking-tight">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-on-surface">Workshop Operational Overview</h1>
          <p className="text-base text-on-surface-variant mt-2 font-medium">
            Pantau status barang aktif, peminjaman siswa, dan kondisi perangkat keras labor secara real-time.
          </p>
        </div>

        {/* 4 Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Card 1: Kondisi Baik (Item Instance) */}
          <div className="p-6 bg-white border border-surface-container-high rounded-xl shadow-xs flex flex-col justify-between space-y-4 hover:border-green-300 transition-all">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold text-outline tracking-wider uppercase">Kondisi Baik</p>
                {loading ? (
                  <Loader2 className="w-6 h-6 animate-spin text-green-700 mt-2" />
                ) : (
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-4xl font-black text-green-700 tabular-nums">{stats.kondisiBaik}</span>
                    <span className="text-sm font-semibold text-outline">Unit</span>
                  </div>
                )}
              </div>
              <div className="p-3 bg-green-50 text-green-600 rounded-xl">
                <CheckCircle2 className="w-6 h-6" />
              </div>
            </div>
            <p className="text-xs font-medium text-outline border-t border-surface-container pt-3">
              Total item-instance siap pakai
            </p>
          </div>

          {/* Card 2: Sedang Dipinjam */}
          <div className="p-6 bg-white border border-surface-container-high rounded-xl shadow-xs flex flex-col justify-between space-y-4 hover:border-blue-300 transition-all">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold text-outline tracking-wider uppercase">Sedang Dipinjam</p>
                {loading ? (
                  <Loader2 className="w-6 h-6 animate-spin text-primary mt-2" />
                ) : (
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-4xl font-black text-primary tabular-nums">{stats.sedangDipinjam}</span>
                    <span className="text-sm font-semibold text-outline">Aktif</span>
                  </div>
                )}
              </div>
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                <Handshake className="w-6 h-6" />
              </div>
            </div>
            <p className="text-xs font-medium text-outline border-t border-surface-container pt-3">
              Peminjaman praktikum siswa
            </p>
          </div>

          {/* Card 3: Barang Rusak (Item Instance) */}
          <div className="p-6 bg-white border border-surface-container-high rounded-xl shadow-xs flex flex-col justify-between space-y-4 hover:border-amber-300 transition-all">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold text-outline tracking-wider uppercase">Barang Rusak</p>
                {loading ? (
                  <Loader2 className="w-6 h-6 animate-spin text-amber-600 mt-2" />
                ) : (
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-4xl font-black text-amber-600 tabular-nums">{stats.barangRusak}</span>
                    <span className="text-sm font-semibold text-outline">Unit</span>
                  </div>
                )}
              </div>
              <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                <Wrench className="w-6 h-6" />
              </div>
            </div>
            <p className="text-xs font-medium text-outline border-t border-surface-container pt-3">
              Unit item-instance kondisi rusak
            </p>
          </div>

          {/* Card 4: Laporan Kerusakan */}
          <div className="p-6 bg-white border border-surface-container-high rounded-xl shadow-xs flex flex-col justify-between space-y-4 hover:border-red-300 transition-all">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold text-outline tracking-wider uppercase">Laporan Kerusakan</p>
                {loading ? (
                  <Loader2 className="w-6 h-6 animate-spin text-error mt-2" />
                ) : (
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-4xl font-black text-error tabular-nums">{stats.laporanKerusakan}</span>
                    <span className="text-sm font-semibold text-outline">Pending</span>
                  </div>
                )}
              </div>
              <div className="p-3 bg-red-50 text-error rounded-xl">
                <AlertTriangle className="w-6 h-6" />
              </div>
            </div>
            <p className="text-xs font-medium text-outline border-t border-surface-container pt-3">
              Membutuhkan konfirmasi
            </p>
          </div>

        </div>

        {/* Lower Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 p-6 bg-white border border-surface-container-high rounded-xl shadow-xs flex flex-col justify-between space-y-4">
            <div className="flex items-center justify-between border-b border-surface-container pb-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-bold text-on-surface">Visualisasi Log & Status Inventaris</h3>
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
                      <linearGradient id="colorKabengTotal" x1="0" y1="0" x2="0" y2="1">
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
                      fill="url(#colorKabengTotal)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          <div className="p-6 bg-white border border-surface-container-high rounded-xl space-y-4 shadow-xs">
            <div className="flex items-center gap-2 text-on-surface font-bold text-sm">
              <span className="text-outline">⚙️</span>
              <span>Sistem Pintasan Operasional</span>
            </div>
            <p className="text-xs text-outline font-medium">
              Akses cepat verifikasi perbaikan & laporan inventaris labor.
            </p>

            <div className="space-y-3 pt-2">
              <Link
                href="/kabeng/perbaikan"
                className="p-3 bg-surface-low hover:bg-surface-container border border-surface-container-high rounded-xl flex items-center justify-between transition-all group"
              >
                <div>
                  <p className="text-xs font-bold text-on-surface">Persetujuan Perbaikan Barang</p>
                </div>
                <span className="px-2 py-1 bg-white border border-amber-200 text-amber-700 font-extrabold text-[10px] rounded uppercase tracking-wider group-hover:bg-amber-600 group-hover:text-white transition-colors">
                  PERBAIKAN
                </span>
              </Link>

              <Link
                href="/kabeng/peminjaman"
                className="p-3 bg-surface-low hover:bg-surface-container border border-surface-container-high rounded-xl flex items-center justify-between transition-all group"
              >
                <div>
                  <p className="text-xs font-bold text-on-surface">Monitoring Peminjaman Siswa</p>
                </div>
                <span className="px-2 py-1 bg-white border border-blue-200 text-blue-700 font-extrabold text-[10px] rounded uppercase tracking-wider group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  PINJAM
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </PageAnimateWrapper>
  );
}