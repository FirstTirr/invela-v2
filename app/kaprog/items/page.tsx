"use client";

import React from 'react';
import PageAnimateWrapper from '@/components/page-animate-wrapper';

interface LaborItem {
  id: string;
  nama: string;
  jurusan: string;
  labor: string;
  jumlah: number;
  kategori: string;
  status: 'Baik' | 'Perbaikan' | 'Rusak';
}

export default function KaprogItemsPage() {
  const items: LaborItem[] = [
    { id: 'BRG-01', nama: 'PC Client Asus ExpertCenter', jurusan: 'PPLG', labor: 'Labor Komputer Pemrograman', jumlah: 36, kategori: 'Perangkat Keras Utama', status: 'Baik' },
    { id: 'BRG-02', nama: 'Drawing Tablet Wacom Intuos', jurusan: 'DKV', labor: 'Labor Multimedia & DKV', jumlah: 15, kategori: 'Alat Pendukung Pengembang', status: 'Perbaikan' }
  ];

  return (
    <PageAnimateWrapper>
      <div className="space-y-8 font-sans antialiased tracking-tight">
        <div>
          <h1 className="text-3xl font-bold text-on-surface">Daftar Inventaris Aset Labor</h1>
          <p className="text-base text-on-surface-variant mt-2 font-medium">Daftar lengkap seluruh aset alat praktikum di laboratorium sekolah.</p>
        </div>

        <div className="bg-white border border-surface-container-high rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse text-base">
            <thead className="bg-surface-low border-b border-surface-container-high">
              <tr>
                <th className="p-5 text-sm font-bold text-on-surface uppercase tracking-wider">Nama & ID Barang</th>
                <th className="p-5 text-sm font-bold text-on-surface uppercase tracking-wider">Ruangan / Labor</th>
                <th className="p-5 text-sm font-bold text-on-surface uppercase tracking-wider text-center">Jumlah Stok</th>
                <th className="p-5 text-sm font-bold text-on-surface uppercase tracking-wider">Kategori Kelompok</th>
                <th className="p-5 text-sm font-bold text-on-surface uppercase tracking-wider text-right">Status Kondisi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container text-on-surface font-medium">
              {items.map((item) => (
                <tr key={item.id} className="hover:bg-surface-low/30 transition-colors">
                  <td className="p-5">
                    <span className="block text-base font-bold text-primary">{item.nama}</span>
                    <span className="block text-xs font-mono text-outline mt-0.5">ID Unit: {item.id}</span>
                  </td>
                  <td className="p-5">
                    <span className="block text-base font-bold text-on-surface">{item.labor}</span>
                    <span className="block text-sm text-outline font-bold mt-0.5">Jurusan: {item.jurusan}</span>
                  </td>
                  <td className="p-5 text-center font-bold text-base tabular-nums">{item.jumlah} Unit</td>
                  <td className="p-5 text-base font-semibold text-on-surface-variant">{item.kategori}</td>
                  <td className="p-5 text-right">
                    <span className={`inline-block px-3 py-1 rounded-md text-sm font-bold ${
                      item.status === 'Baik' ? 'bg-green-100 text-green-900 border border-green-300' :
                      item.status === 'Perbaikan' ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-red-100 text-red-900 border border-red-300'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </PageAnimateWrapper>
  );
}