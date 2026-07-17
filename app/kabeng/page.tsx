import React from 'react';
import PageAnimateWrapper from '@/components/page-animate-wrapper';
import { ArrowUpRight } from 'lucide-react';

export default function KabengDashboardOverview() {
  return (
    <PageAnimateWrapper>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-on-surface">Workshop Operational Overview</h1>
          <p className="text-sm text-on-surface-variant">Pantau status barang aktif, peminjaman siswa, dan kondisi perangkat keras labor.</p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 bg-white border border-surface-container-high rounded-lg"><p className="text-[10px] font-bold text-outline tracking-wider uppercase">Kondisi Baik</p><p className="text-3xl font-bold mt-1 text-green-700 tabular-nums">51</p></div>
          <div className="p-5 bg-white border border-surface-container-high rounded-lg"><p className="text-[10px] font-bold text-outline tracking-wider uppercase">Sedang Dipinjam</p><p className="text-3xl font-bold mt-1 text-primary tabular-nums">1</p></div>
          <div className="p-5 bg-white border border-surface-container-high rounded-lg"><p className="text-[10px] font-bold text-outline tracking-wider uppercase">Dalam Perbaikan</p><p className="text-3xl font-bold mt-1 text-amber-600 tabular-nums">1</p></div>
          <div className="p-5 bg-white border border-surface-container-high rounded-lg"><p className="text-[10px] font-bold text-outline tracking-wider uppercase">Laporan Kerusakan</p><p className="text-3xl font-bold mt-1 text-error tabular-nums">2</p></div>
        </div>
      </div>
    </PageAnimateWrapper>
  );
}