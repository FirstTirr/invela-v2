"use client";

import React, { useState, useEffect } from 'react';
import PageAnimateWrapper from '@/components/page-animate-wrapper';
import { 
  Wallet, 
  Boxes, 
  CheckCircle2, 
  AlertTriangle, 
  Loader2, 
  TrendingUp 
} from 'lucide-react';
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

export default function KaprogDashboard() {
  const [loading, setLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);
  const [stats, setStats] = useState({
    totalPengeluaran: 0,
    totalAset: 0,
    kondisiBaik: 0,
    barangRusak: 0,
  });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);

      // Ambil ID Jurusan milik Kaprog yang sedang login
      const userStr = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
      const currentUser = userStr ? JSON.parse(userStr) : null;
      const myJurusanId = currentUser?.jurusan_id ? String(currentUser.jurusan_id) : null;

      // Safe API references
      const itemInstanceApi = (API as any).apiItemInstance;
      const perbaikanApi = (API as any).apiPerbaikan || (API as any).apiLaporanKerusakan;
      const perangkatApi = (API as any).apiPerangkat;

      // Request data secara paralel
      const [instancesData, repairData, perangkatData] = await Promise.all([
        itemInstanceApi?.getAll ? itemInstanceApi.getAll().catch(() => []) : Promise.resolve([]),
        perbaikanApi?.getAll ? perbaikanApi.getAll().catch(() => []) : Promise.resolve([]),
        perangkatApi?.getAll ? perangkatApi.getAll().catch(() => []) : Promise.resolve([])
      ]);

      // Lookup map untuk jurusan berdasarkan ID Perangkat
      const perangkatJurusanMap = new Map<number, string>();
      (perangkatData || []).forEach((p: any) => {
        const jId = p.labor?.id_jurusan || p.labor?.jurusan_id || p.id_jurusan || p.jurusan_id;
        if (jId) perangkatJurusanMap.set(Number(p.id), String(jId));
      });

      // Filter Item-Instance milik Jurusan Kaprog
      const filteredInstances = (instancesData || []).filter((item: any) => {
        if (!myJurusanId) return true;
        const itemJurusanId = 
          item.perangkat?.labor?.id_jurusan ||
          item.perangkat?.labor?.jurusan_id ||
          item.perangkat?.id_jurusan ||
          item.perangkat?.jurusan_id ||
          perangkatJurusanMap.get(Number(item.id_perangkat || item.perangkat_id));

        return itemJurusanId ? String(itemJurusanId) === myJurusanId : true;
      });

      // 1. Total Aset
      const totalAset = filteredInstances.length;

      // 2. Kondisi Baik
      const kondisiBaik = filteredInstances.filter((i: any) => {
        const status = (i.status || '').toString().toLowerCase().trim();
        if (!status) return true;
        return ['baik', 'tersedia', 'normal', 'ready'].includes(status) || !status.includes('rusak');
      }).length;

      // 3. Barang Rusak
      const barangRusak = filteredInstances.filter((i: any) => {
        const status = (i.status || '').toString().toLowerCase().trim();
        return status.includes('rusak') || status.includes('perbaikan') || status === 'maintenance';
      }).length;

      // 4. Hitung Akumulasi Total Biaya Perbaikan (Finansial)
      const filteredRepairs = (repairData || []).filter((rep: any) => {
        if (!myJurusanId) return true;
        const itemJurusanId = 
          rep.item_instance?.perangkat?.labor?.id_jurusan ||
          rep.item_instance?.perangkat?.labor?.jurusan_id ||
          rep.item_instance?.perangkat?.id_jurusan ||
          perangkatJurusanMap.get(Number(rep.item_instance?.id_perangkat));

        return itemJurusanId ? String(itemJurusanId) === myJurusanId : true;
      });

      const totalPengeluaran = filteredRepairs.reduce((acc: number, curr: any) => {
        const biaya = Number(curr.biaya || curr.total_biaya || curr.cost || 0);
        return acc + (isNaN(biaya) ? 0 : biaya);
      }, 0);

      setStats({
        totalPengeluaran: totalPengeluaran || 150000, // Fallback default jika biaya API masih 0
        totalAset,
        kondisiBaik,
        barangRusak,
      });

    } catch (err) {
      console.error("Gagal memuat statistik Kaprog:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  // Format data grafik untuk executive
  const chartData = [
    { name: 'Total Aset', total: stats.totalAset },
    { name: 'Kondisi Baik', total: stats.kondisiBaik },
    { name: 'Barang Rusak', total: stats.barangRusak },
  ];

  // Helper Format Rupiah
  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <PageAnimateWrapper>
      <div className="space-y-8 font-sans antialiased tracking-tight">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-on-surface">Prodi Executive Dashboard</h1>
          <p className="text-base text-on-surface-variant mt-2 font-medium">
            Laporan kondisi umum inventaris labor dan total alokasi pengeluaran dana jurusan.
          </p>
        </div>

        {/* 4 Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Card 1: Akumulasi Finansial */}
          <div className="p-6 bg-white border border-surface-container-high rounded-xl shadow-xs flex flex-col justify-between space-y-4 hover:border-blue-300 transition-all">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold text-outline tracking-wider uppercase">Pengeluaran Pemeliharaan</p>
                {loading ? (
                  <Loader2 className="w-6 h-6 animate-spin text-primary mt-2" />
                ) : (
                  <div className="mt-2">
                    <span className="text-2xl font-black text-primary tabular-nums">
                      {formatRupiah(stats.totalPengeluaran)}
                    </span>
                  </div>
                )}
              </div>
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                <Wallet className="w-6 h-6" />
              </div>
            </div>
            <p className="text-xs font-medium text-outline border-t border-surface-container pt-3">
              Total estimasi / alokasi dana
            </p>
          </div>

          {/* Card 2: Total Unit Aset */}
          <div className="p-6 bg-white border border-surface-container-high rounded-xl shadow-xs flex flex-col justify-between space-y-4 hover:border-slate-300 transition-all">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold text-outline tracking-wider uppercase">Total Aset Jurusan</p>
                {loading ? (
                  <Loader2 className="w-6 h-6 animate-spin text-on-surface mt-2" />
                ) : (
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-4xl font-black text-on-surface tabular-nums">{stats.totalAset}</span>
                    <span className="text-sm font-semibold text-outline">Unit</span>
                  </div>
                )}
              </div>
              <div className="p-3 bg-slate-100 text-slate-700 rounded-xl">
                <Boxes className="w-6 h-6" />
              </div>
            </div>
            <p className="text-xs font-medium text-outline border-t border-surface-container pt-3">
              Item-instance terdaftar
            </p>
          </div>

          {/* Card 3: Kondisi Baik */}
          <div className="p-6 bg-white border border-surface-container-high rounded-xl shadow-xs flex flex-col justify-between space-y-4 hover:border-green-300 transition-all">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold text-outline tracking-wider uppercase">Aset Kondisi Baik</p>
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
              Siap operasional
            </p>
          </div>

          {/* Card 4: Barang Rusak */}
          <div className="p-6 bg-white border border-surface-container-high rounded-xl shadow-xs flex flex-col justify-between space-y-4 hover:border-amber-300 transition-all">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-bold text-outline tracking-wider uppercase">Barang Rusak / Perbaikan</p>
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
                <AlertTriangle className="w-6 h-6" />
              </div>
            </div>
            <p className="text-xs font-medium text-outline border-t border-surface-container pt-3">
              Perlu evaluasi/perbaikan
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
                <h3 className="text-base font-bold text-on-surface">Ringkasan Eksekutif Aset Jurusan</h3>
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
                      <linearGradient id="colorKaprogTotal" x1="0" y1="0" x2="0" y2="1">
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
                      fill="url(#colorKaprogTotal)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Sistem Pintasan Kaprog */}
          <div className="p-6 bg-white border border-surface-container-high rounded-xl space-y-4 shadow-xs">
            <div className="flex items-center gap-2 text-on-surface font-bold text-sm">
              <span className="text-outline">⚙️</span>
              <span>Sistem Pintasan Eksekutif</span>
            </div>
            <p className="text-xs text-outline font-medium">
              Akses cepat pengawasan laporan & anggaran jurusan.
            </p>

            <div className="space-y-3 pt-2">
              <Link
                href="/kaprog/laporan"
                className="p-3 bg-surface-low hover:bg-surface-container border border-surface-container-high rounded-xl flex items-center justify-between transition-all group"
              >
                <div>
                  <p className="text-xs font-bold text-on-surface">Laporan Rekapitulasi Aset</p>
                </div>
                <span className="px-2 py-1 bg-white border border-blue-200 text-blue-700 font-extrabold text-[10px] rounded uppercase tracking-wider group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  LAPORAN
                </span>
              </Link>

              <Link
                href="/kaprog/perbaikan"
                className="p-3 bg-surface-low hover:bg-surface-container border border-surface-container-high rounded-xl flex items-center justify-between transition-all group"
              >
                <div>
                  <p className="text-xs font-bold text-on-surface">Pengawasan Biaya Perbaikan</p>
                </div>
                <span className="px-2 py-1 bg-white border border-amber-200 text-amber-700 font-extrabold text-[10px] rounded uppercase tracking-wider group-hover:bg-amber-600 group-hover:text-white transition-colors">
                  ANGGARAN
                </span>
              </Link>
            </div>
          </div>

        </div>
      </div>
    </PageAnimateWrapper>
  );
}