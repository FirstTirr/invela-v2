"use client";

import React from 'react';
import PageAnimateWrapper from '@/components/page-animate-wrapper';

export default function KabengDashboardOverview() {
  return (
    <PageAnimateWrapper>
      <div className="space-y-8 font-sans antialiased tracking-tight">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-on-surface">Workshop Operational Overview</h1>
          <p className="text-base text-on-surface-variant mt-2 font-medium">Pantau status barang aktif, peminjaman siswa, dan kondisi perangkat keras labor.</p>
        </div>
        
        {/* Responsive Grid Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 bg-white border border-surface-container-high rounded-xl hover:border-green-300 hover:shadow-sm transition-all duration-200">
            <p className="text-xs font-bold text-outline tracking-wider uppercase">Kondisi Baik</p>
            <p className="text-4xl font-black mt-2 text-green-700 tabular-nums">51</p>
          </div>
          <div className="p-6 bg-white border border-surface-container-high rounded-xl hover:border-primary/40 hover:shadow-sm transition-all duration-200">
            <p className="text-xs font-bold text-outline tracking-wider uppercase">Sedang Dipinjam</p>
            <p className="text-4xl font-black mt-2 text-primary tabular-nums">1</p>
          </div>
          <div className="p-6 bg-white border border-surface-container-high rounded-xl hover:border-amber-400 hover:shadow-sm transition-all duration-200">
            <p className="text-xs font-bold text-outline tracking-wider uppercase">Dalam Perbaikan</p>
            <p className="text-4xl font-black mt-2 text-amber-600 tabular-nums">1</p>
          </div>
          <div className="p-6 bg-white border border-surface-container-high rounded-xl hover:border-error/40 hover:shadow-sm transition-all duration-200">
            <p className="text-xs font-bold text-outline tracking-wider uppercase">Laporan Kerusakan</p>
            <p className="text-4xl font-black mt-2 text-error tabular-nums">2</p>
          </div>
        </div>
      </div>
    </PageAnimateWrapper>
  );
}