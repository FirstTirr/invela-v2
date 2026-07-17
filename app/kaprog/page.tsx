import React from 'react';
import PageAnimateWrapper from '@/components/page-animate-wrapper';

export default function KaprogDashboard() {
  return (
    <PageAnimateWrapper>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-on-surface">Prodi Executive Dashboard</h1>
          <p className="text-sm text-on-surface-variant">Laporan kondisi umum inventaris labor dan total alokasi pengeluaran dana jurusan.</p>
        </div>
        
        <div className="p-6 bg-white border border-surface-container-high rounded-lg max-w-xl shadow-sm">
          <p className="text-xs font-semibold text-outline tracking-wider uppercase">Akumulasi Finansial Pemeliharaan Aset</p>
          <p className="text-4xl font-bold mt-2 text-primary tabular-nums">Rp 150.000</p>
          <div className="mt-4 text-xs text-on-surface-variant bg-surface-low p-3 rounded border border-surface-container">
            Status Terkini: Seluruh pengeluaran dana tervalidasi oleh sistem operational mekanik bengkel labor.
          </div>
        </div>
      </div>
    </PageAnimateWrapper>
  );
}