import React from 'react';
import PageAnimateWrapper from '@/components/page-animate-wrapper';

export default function ReadKelasPage() {
  const dummyKelas = [
    { id: 'K01', namaKelas: 'X PPLG 1', waliKelas: 'Ibu Wisnarti', jumlahSiswa: 34 },
    { id: 'K02', namaKelas: 'XI PPLG 1', waliKelas: 'Ibu Ade Hudayati', jumlahSiswa: 36 },
    { id: 'K03', namaKelas: 'XI PPLG 2', waliKelas: 'Ibu Ranti Ermina Sari', jumlahSiswa: 35 },
    { id: 'K04', namaKelas: 'XII PPLG 1', waliKelas: 'Bapak Vino', jumlahSiswa: 32 },
  ];

  return (
    <PageAnimateWrapper>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-on-surface">Data Kelas</h1>
          <p className="text-sm text-on-surface-variant">Daftar kelas yang terdaftar dalam cakupan hak akses peminjaman alat labor.</p>
        </div>

        <div className="bg-white border border-surface-container-high rounded-lg overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse text-sm">
            <thead className="bg-surface-low border-b border-surface-container-high">
              <tr>
                <th className="p-4 text-[11px] font-bold text-outline tracking-wider uppercase">ID</th>
                <th className="p-4 text-[11px] font-bold text-outline tracking-wider uppercase">Nama Kelas</th>
                <th className="p-4 text-[11px] font-bold text-outline tracking-wider uppercase">Wali Kelas</th>
                <th className="p-4 text-[11px] font-bold text-outline tracking-wider uppercase text-center">Jumlah Siswa</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container text-on-surface">
              {dummyKelas.map((kelas) => (
                <tr key={kelas.id} className="hover:bg-surface-low/30 transition-colors">
                  <td className="p-4 font-mono text-xs text-outline">{kelas.id}</td>
                  <td className="p-4 font-semibold text-primary">{kelas.namaKelas}</td>
                  <td className="p-4 text-on-surface-variant">{kelas.waliKelas}</td>
                  <td className="p-4 text-center tabular-nums font-medium">{kelas.jumlahSiswa} Siswa</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </PageAnimateWrapper>
  );
}