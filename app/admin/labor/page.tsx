import React from 'react';
import { School, ArrowRight } from 'lucide-react';

export default function ReadLaborPage() {
  const dummyLabor = [
    { id: 'L01', nama: 'Labor Komputer Pemrograman', lokasi: 'Gedung B Lt. 2', kapasitas: 36, penanggungJawab: 'Ibu Ranti Ermina Sari' },
    { id: 'L02', nama: 'Labor Game Development', lokasi: 'Gedung B Lt. 2', kapasitas: 32, penanggungJawab: 'Ibu Ade Hudayati' },
    { id: 'L03', nama: 'Labor Jaringan & Komputasi', lokasi: 'Gedung C Lt. 1', kapasitas: 30, penanggungJawab: 'Bapak Radit' },
    { id: 'L04', nama: 'Labor Multimedia & DKV', lokasi: 'Gedung D Lt. 2', kapasitas: 36, penanggungJawab: 'Bapak Hafidz' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-on-surface">Data Laboratorium</h1>
        <p className="text-sm text-on-surface-variant">Daftar seluruh ruang laboratorium yang aktif digunakan untuk kegiatan praktikum.</p>
      </div>

      <div className="bg-white border border-surface-container-high rounded-lg overflow-hidden">
        <table className="w-full text-left border-collapse text-sm">
          <thead className="bg-surface-low border-b border-surface-container-high">
            <tr>
              <th className="p-4 text-[11px] font-bold text-outline tracking-wider uppercase">Kode</th>
              <th className="p-4 text-[11px] font-bold text-outline tracking-wider uppercase">Nama Labor</th>
              <th className="p-4 text-[11px] font-bold text-outline tracking-wider uppercase">Lokasi</th>
              <th className="p-4 text-[11px] font-bold text-outline tracking-wider uppercase text-center">Kapasitas</th>
              <th className="p-4 text-[11px] font-bold text-outline tracking-wider uppercase">Penanggung Jawab</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-container text-on-surface">
            {dummyLabor.map((labor) => (
              <tr key={labor.id} className="hover:bg-surface-low/30 transition-colors">
                <td className="p-4 font-mono text-xs text-primary font-bold">{labor.id}</td>
                <td className="p-4 font-semibold">{labor.nama}</td>
                <td className="p-4 text-on-surface-variant">{labor.lokasi}</td>
                <td className="p-4 text-center tabular-nums font-medium">{labor.kapasitas} Unit</td>
                <td className="p-4 text-on-surface-variant">{labor.penanggungJawab}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}