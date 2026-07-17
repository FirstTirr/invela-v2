import React from 'react';
import PageAnimateWrapper from '@/components/page-animate-wrapper';

export default function ReadJurusanPage() {
  const dummyJurusan = [
    { kode: 'PPLG', nama: 'Pengembangan Perangkat Lunak dan Gim', singkatan: 'Software Engineering', totalLabor: 2 },
    { kode: 'DKV', nama: 'Desain Komunikasi Visual', singkatan: 'Digital Design', totalLabor: 1 },
    { kode: 'TKJ', nama: 'Teknik Komputer dan Jaringan', singkatan: 'Computer Network', totalLabor: 2 },
    { kode: 'TITL', nama: 'Teknik Instalasi Tenaga Listrik', singkatan: 'Electrical Engineering', totalLabor: 1 },
  ];

  return (
    <PageAnimateWrapper>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-on-surface">Data Program Keahlian / Jurusan</h1>
          <p className="text-sm text-on-surface-variant">Klasterisasi jurusan penanggung jawab komparasi aset inventaris.</p>
        </div>

        <div className="bg-white border border-surface-container-high rounded-lg overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse text-sm">
            <thead className="bg-surface-low border-b border-surface-container-high">
              <tr>
                <th className="p-4 text-[11px] font-bold text-outline tracking-wider uppercase">Kode Jurusan</th>
                <th className="p-4 text-[11px] font-bold text-outline tracking-wider uppercase">Nama Program Keahlian</th>
                <th className="p-4 text-[11px] font-bold text-outline tracking-wider uppercase">Bidang Studi</th>
                <th className="p-4 text-[11px] font-bold text-outline tracking-wider uppercase text-center">Alokasi Labor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container text-on-surface">
              {dummyJurusan.map((jurus) => (
                <tr key={jurus.kode} className="hover:bg-surface-low/30 transition-colors">
                  <td className="p-4 font-bold text-primary tracking-wide text-xs font-mono">{jurus.kode}</td>
                  <td className="p-4 font-semibold">{jurus.nama}</td>
                  <td className="p-4 text-on-surface-variant text-xs">{jurus.singkatan}</td>
                  <td className="p-4 text-center tabular-nums font-medium">{jurus.totalLabor} Labor</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </PageAnimateWrapper>
  );
}