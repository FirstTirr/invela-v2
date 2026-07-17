"use client";

import React from 'react';
import PageAnimateWrapper from '@/components/page-animate-wrapper';
import { Trash2, Edit } from 'lucide-react';

export default function ReadCategoryPage() {
  const dummyCategory = [
    { id: 'CAT-01', nama: 'Perangkat Keras Utama' },
    { id: 'CAT-02', nama: 'Komponen Elektronik' },
    { id: 'CAT-03', nama: 'Networking Equipment' },
    { id: 'CAT-04', nama: 'Alat Pendukung Pengembang' },
  ];

  return (
    <PageAnimateWrapper>
      <div className="space-y-8 font-sans antialiased tracking-tight">
        <div>
          <h1 className="text-3xl font-bold text-on-surface">Kategori Spesifikasi Barang</h1>
          <p className="text-base text-on-surface-variant mt-2 font-medium">Pengelompokan jenis barang inventaris labor untuk mempermudah pencarian logistik.</p>
        </div>

        <div className="bg-white border border-surface-container-high rounded-xl overflow-hidden shadow-sm w-full">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse text-base min-w-[300px]">
              <thead className="bg-surface-low border-b border-surface-container-high">
                <tr>
                  <th className="p-5 text-sm font-bold text-on-surface uppercase tracking-wider">Nama Kategori</th>
                  <th className="p-5 text-sm font-bold text-on-surface uppercase tracking-wider text-right w-32">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container text-on-surface font-medium">
                {dummyCategory.map((cat) => (
                  <tr key={cat.id} className="hover:bg-surface-low/30 transition-colors">
                    <td className="p-5 text-base font-extrabold text-primary whitespace-nowrap">{cat.nama}</td>
                    <td className="p-5 text-right flex justify-end gap-2 whitespace-nowrap">
                      <button className="p-2 text-outline hover:text-primary hover:bg-secondary-container rounded-lg transition-colors cursor-pointer">
                        <Edit className="w-5 h-5" />
                      </button>
                      <button className="p-2 text-outline hover:text-error hover:bg-error-container/40 rounded-lg transition-colors cursor-pointer">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </PageAnimateWrapper>
  );
}