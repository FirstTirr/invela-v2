import React from 'react';
import PageAnimateWrapper from '@/components/page-animate-wrapper';

export default function ReadCategoryPage() {
  const dummyCategory = [
    { id: 'CAT-01', nama: 'Perangkat Keras Utama', kodeGrup: 'HARDWARE', deskripsi: 'Komputer, PC Client, Monitor, dan Server Utama.' },
    { id: 'CAT-02', nama: 'Komponen Elektronik', kodeGrup: 'COMPONENTS', deskripsi: 'RAM, SSD, Motherboard, Graphic Card cadangan.' },
    { id: 'CAT-03', nama: 'Networking Equipment', kodeGrup: 'NET-EQ', deskripsi: 'Switch Hub, Router, Access Point, dan Tang Crimping.' },
    { id: 'CAT-04', nama: 'Alat Pendukung Pengembang', kodeGrup: 'TOOLS', deskripsi: 'Drawing Tablet, VR Headset, Gamepad Emulator Testing.' },
  ];

  return (
    <PageAnimateWrapper>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-on-surface">Kategori Spesifikasi Barang</h1>
          <p className="text-sm text-on-surface-variant">Pengelompokan jenis barang inventaris labor untuk mempermudah pencarian logistik.</p>
        </div>

        <div className="bg-white border border-surface-container-high rounded-lg overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse text-sm">
            <thead className="bg-surface-low border-b border-surface-container-high">
              <tr>
                <th className="p-4 text-[11px] font-bold text-outline tracking-wider uppercase">ID Kategori</th>
                <th className="p-4 text-[11px] font-bold text-outline tracking-wider uppercase">Nama Kategori</th>
                <th className="p-4 text-[11px] font-bold text-outline tracking-wider uppercase">Grup Kode</th>
                <th className="p-4 text-[11px] font-bold text-outline tracking-wider uppercase">Deskripsi Klaster</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container text-on-surface">
              {dummyCategory.map((cat) => (
                <tr key={cat.id} className="hover:bg-surface-low/30 transition-colors">
                  <td className="p-4 font-mono text-xs text-outline">{cat.id}</td>
                  <td className="p-4 font-semibold text-primary">{cat.nama}</td>
                  <td className="p-4 font-mono text-xs text-on-surface-variant">
                    <span className="bg-surface-low px-2 py-0.5 rounded border border-surface-container">
                      {cat.kodeGrup}
                    </span>
                  </td>
                  <td className="p-4 text-on-surface-variant text-xs max-w-xs truncate">{cat.deskripsi}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </PageAnimateWrapper>
  );
}