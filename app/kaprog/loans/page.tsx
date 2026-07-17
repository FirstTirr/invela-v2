"use client";

import React from 'react';
import PageAnimateWrapper from '@/components/page-animate-wrapper';

interface LoanData {
  id: string;
  namaBarang: string;
  namaPeminjam: string;
  tanggalMulai: string;
  tanggalSelesai: string;
  statusPinjam: 'Aktif' | 'Selesai';
}

export default function KaprogLoansPage() {
  const loans: LoanData[] = [
    { id: 'L-001', namaBarang: 'Drawing Tablet Wacom Intuos', namaPeminjam: 'Radit (Siswa XI PPLG 2)', tanggalMulai: '2026-07-10', tanggalSelesai: '2026-07-17', statusPinjam: 'Aktif' },
    { id: 'L-002', namaBarang: 'Router Mikrotik RB951', namaPeminjam: 'Bapak Hafidz (Guru TKJ)', tanggalMulai: '2026-06-02', tanggalSelesai: '2026-06-05', statusPinjam: 'Selesai' }
  ];

  return (
    <PageAnimateWrapper>
      <div className="space-y-8 font-sans antialiased tracking-tight">
        <div>
          <h1 className="text-3xl font-bold text-on-surface">Monitoring Peminjaman Aset</h1>
          <p className="text-base text-on-surface-variant mt-2 font-medium">Log pemantauan aktivitas peminjaman barang labor yang dilakukan oleh civitas jurusan.</p>
        </div>

        <div className="bg-white border border-surface-container-high rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse text-base">
            <thead className="bg-surface-low border-b border-surface-container-high">
              <tr>
                <th className="p-5 text-sm font-bold text-on-surface tracking-wide uppercase">Nama Barang</th>
                <th className="p-5 text-sm font-bold text-on-surface tracking-wide uppercase">Nama Peminjam</th>
                <th className="p-5 text-sm font-bold text-on-surface tracking-wide uppercase text-center">Tgl Mulai</th>
                <th className="p-5 text-sm font-bold text-on-surface tracking-wide uppercase text-center">Tgl Selesai</th>
                <th className="p-5 text-sm font-bold text-on-surface tracking-wide uppercase text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container text-on-surface font-medium">
              {loans.map((loan) => (
                <tr key={loan.id} className="hover:bg-surface-low/30 transition-colors">
                  <td className="p-5 text-base font-bold text-primary">{loan.namaBarang}</td>
                  <td className="p-5 text-base text-on-surface-variant font-bold">{loan.namaPeminjam}</td>
                  <td className="p-5 text-center font-mono text-base text-outline tabular-nums">{loan.tanggalMulai}</td>
                  <td className="p-5 text-center font-mono text-base text-outline tabular-nums">{loan.tanggalSelesai}</td>
                  <td className="p-5 text-right">
                    <span className={`inline-block px-3 py-1 rounded-md text-sm font-bold ${
                      loan.statusPinjam === 'Aktif' ? 'bg-blue-100 text-blue-900 border border-blue-300' : 'bg-surface-container text-outline'
                    }`}>
                      {loan.statusPinjam}
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