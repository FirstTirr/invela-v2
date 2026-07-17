"use client";

import React, { useState } from 'react';
import PageAnimateWrapper from '@/components/page-animate-wrapper';
import { Plus, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

interface LoanData {
  id: string;
  namaBarang: string;
  namaPeminjam: string;
  tanggalMulai: string;
  tanggalSelesai: string;
  statusPinjam: 'Aktif' | 'Selesai';
}

export default function KabengLoansPage() {
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [loans] = useState<LoanData[]>([
    { id: 'L-001', namaBarang: 'Drawing Tablet Wacom Intuos', namaPeminjam: 'Radit (Siswa XI PPLG 2)', tanggalMulai: '2026-07-10', tanggalSelesai: '2026-07-17', statusPinjam: 'Aktif' },
    { id: 'L-002', namaBarang: 'Router Mikrotik RB951', namaPeminjam: 'Bapak Hafidz (Guru TKJ)', tanggalMulai: '2026-06-02', tanggalSelesai: '2026-06-05', statusPinjam: 'Selesai' }
  ]);

  return (
    <PageAnimateWrapper>
      <div className="space-y-6 font-sans antialiased">
        <div className="flex justify-between items-center border-b border-surface-container pb-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-on-surface">Log & Otorisasi Peminjaman</h1>
            <p className="text-base text-on-surface-variant mt-1">Pantau batas waktu pengembalian alat labor dan input registrasi peminjaman siswa.</p>
          </div>
          <button 
            onClick={() => setIsOpenModal(true)}
            className="px-5 py-2.5 text-sm font-bold text-white bg-primary hover:bg-primary-container rounded-lg flex items-center gap-2 shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-5 h-5" /> Input Peminjaman Baru
          </button>
        </div>

        {/* Loans Table - Tipis Elegant Border-1 & Text Besar */}
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

        {/* MODAL FORM INPUT PEMINJAMAN */}
        <AnimatePresence>
          {isOpenModal && (
            <div className="fixed inset-0 bg-on-surface/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                className="bg-white w-full max-w-xl border border-surface-container-high rounded-xl shadow-xl p-6 space-y-4"
              >
                <div className="flex justify-between items-center border-b border-surface-container pb-2">
                  <h3 className="text-lg font-bold text-on-surface">Formulir Peminjaman Alat</h3>
                  <button onClick={() => setIsOpenModal(false)} className="text-outline hover:text-on-surface p-1.5 rounded-lg border border-surface-container cursor-pointer"><X className="w-5 h-5" /></button>
                </div>
                <div className="space-y-4">
                  <div className="space-y-1"><label className="text-xs font-bold text-outline uppercase tracking-wider">Nama Barang yang Dipinjam</label><input type="text" placeholder="Masukkan nama barang labor..." className="w-full px-4 py-3 border border-surface-container-high rounded-lg text-base bg-white text-on-surface focus:outline-none focus:border-primary"/></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1"><label className="text-xs font-bold text-outline uppercase tracking-wider">Nama Lengkap Peminjam</label><input type="text" placeholder="Contoh: budi (XI PPLG 2)" className="w-full px-4 py-3 border border-surface-container-high rounded-lg text-base bg-white text-on-surface focus:outline-none focus:border-primary"/></div>
                    <div className="space-y-1"><label className="text-xs font-bold text-outline uppercase tracking-wider">Nomor Ponsel Peminjam</label><input type="text" placeholder="Contoh: 08123456789" className="w-full px-4 py-3 border border-surface-container-high rounded-lg text-base bg-white text-on-surface focus:outline-none focus:border-primary"/></div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1"><label className="text-xs font-bold text-outline uppercase tracking-wider">Tanggal Mulai</label><input type="date" className="w-full px-4 py-3 border border-surface-container-high rounded-lg text-base bg-white text-outline focus:outline-none focus:border-primary"/></div>
                    <div className="space-y-1"><label className="text-xs font-bold text-outline uppercase tracking-wider">Tanggal Selesai</label><input type="date" className="w-full px-4 py-3 border border-surface-container-high rounded-lg text-base bg-white text-outline focus:outline-none focus:border-primary"/></div>
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-3 border-t border-surface-container">
                  <button onClick={() => setIsOpenModal(false)} className="px-5 py-2.5 text-sm font-bold text-secondary hover:bg-surface-low rounded-lg cursor-pointer">Batal</button>
                  <button onClick={() => setIsOpenModal(false)} className="px-6 py-2.5 text-sm font-bold text-white bg-primary hover:bg-primary-container rounded-lg cursor-pointer shadow-sm">Simpan Otorisasi</button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </PageAnimateWrapper>
  );
}