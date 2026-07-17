import React from 'react';
import PageAnimateWrapper from '@/components/page-animate-wrapper';
import { Plus } from 'lucide-react';

export default function MasterInputPage() {
  const categories = [
    { label: 'Tambahkan Labor', placeholder: 'Nama Laboratorium (Contoh: Labor Komputer 1)' },
    { label: 'Tambahkan Jurusan', placeholder: 'Singkatan Jurusan (Contoh: PPLG, DKV, TKJ)' },
    { label: 'Tambahkan Kelas', placeholder: 'Format Kelas (Contoh: XI PPLG 2)' },
    { label: 'Tambahkan Category', placeholder: 'Kategori Barang (Contoh: Perangkat Jaringan)' },
  ];

  return (
    <PageAnimateWrapper>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-on-surface">Pusat Registrasi Data Master</h1>
          <p className="text-sm text-on-surface-variant">Modul pengisian data operasional dasar untuk sinkronisasi inventarisasi labor.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {categories.map((card, idx) => (
            <div key={idx} className="bg-white border border-surface-container-high rounded-lg p-6 space-y-4 shadow-sm hover:border-outline transition-all">
              <h2 className="text-sm font-bold text-on-surface tracking-tight">{card.label}</h2>
              <input type="text" placeholder={card.placeholder} className="w-full px-3 py-2 bg-white border border-surface-container-high rounded text-xs text-on-surface focus:outline-none focus:border-primary transition-all"/>
              <div className="flex justify-end gap-2 pt-2">
                <button className="px-3 py-1.5 text-xs font-semibold text-secondary hover:bg-surface-low rounded transition-colors">Cancel</button>
                <button className="px-4 py-1.5 text-xs font-semibold text-white bg-primary hover:bg-primary-container rounded flex items-center gap-1 transition-colors">
                  <Plus className="w-3.5 h-3.5" /> Save
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </PageAnimateWrapper>
  );
}