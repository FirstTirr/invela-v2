"use client";

import React, { useState } from 'react';
import PageAnimateWrapper from '@/components/page-animate-wrapper';
import { History, X, Coins, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface RepairLog {
  tanggal: string;
  perbaikan: string;
  biaya: number;
}

interface DamageReport {
  id: string;
  barangRusak: string;
  pelapor: string;
  jenisKerusakan: string;
  statusAset: 'Rusak' | 'Perbaikan';
  tanggalLapor: string;
  riwayatPerbaikan: RepairLog[];
}

export default function KaprogDamagesPage() {
  const [isOpenHistoryModal, setIsOpenHistoryModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState<DamageReport | null>(null);

  const damages: DamageReport[] = [
    { 
      id: 'R-01', 
      barangRusak: 'PC Client Asus ExpertCenter (BRG-01)', 
      pelapor: 'Vino (Siswa XI PPLG 2)', 
      jenisKerusakan: 'Blue Screen stuck saat booting sistem operasi', 
      statusAset: 'Perbaikan',
      tanggalLapor: '2026-07-15',
      riwayatPerbaikan: [
        { tanggal: '2026-07-16', perbaikan: 'Instal ulang OS & Ganti CMOS', biaya: 150000 }
      ]
    },
    { 
      id: 'R-02', 
      barangRusak: 'Drawing Tablet Wacom Intuos (BRG-02)', 
      pelapor: 'Ibu Ade Hudayati (Guru DKV)', 
      jenisKerusakan: 'Mata stylus pen tumpul & responsivitas sensor delay', 
      statusAset: 'Rusak',
      tanggalLapor: '2026-07-12',
      riwayatPerbaikan: []
    }
  ];

  return (
    <PageAnimateWrapper>
      <div className="space-y-8 font-sans antialiased tracking-tight">
        <div>
          <h1 className="text-3xl font-bold text-on-surface">Laporan Kerusakan & Biaya Labor</h1>
          <p className="text-base text-on-surface-variant mt-2 font-medium">Halaman khusus memantau barang rusak dan total biaya perbaikan labor.</p>
        </div>

        {/* 2 Top Cost Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border border-surface-container-high rounded-xl p-6 flex items-center justify-between shadow-sm">
            <div className="space-y-2">
              <p className="text-xs font-bold text-outline tracking-wider uppercase">Estimasi Biaya Yang Diperlukan</p>
              <p className="text-4xl font-extrabold text-on-surface tabular-nums">Rp 650.000</p>
              <p className="text-sm text-on-surface-variant font-medium">Perkiraan biaya kerusakan saat ini</p>
            </div>
            <div className="w-14 h-14 rounded-xl bg-secondary-container flex items-center justify-center text-primary">
              <Coins className="w-7 h-7" />
            </div>
          </div>

          <div className="bg-white border border-surface-container-high rounded-xl p-6 flex items-center justify-between shadow-sm">
            <div className="space-y-2">
              <p className="text-xs font-bold text-outline tracking-wider uppercase">Total Biaya Yang Sudah Dibayar</p>
              <p className="text-4xl font-extrabold text-green-700 tabular-nums">Rp 150.000</p>
              <p className="text-sm font-semibold text-green-700">Dana yang sudah resmi dikeluarkan</p>
            </div>
            <div className="w-14 h-14 rounded-xl bg-green-100 flex items-center justify-center text-green-700">
              <CheckCircle2 className="w-7 h-7" />
            </div>
          </div>
        </div>

        {/* Damages Table */}
        <div className="bg-white border border-surface-container-high rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse text-base">
            <thead className="bg-surface-low border-b border-surface-container-high">
              <tr>
                <th className="p-5 text-sm font-bold text-on-surface uppercase tracking-wider">Nama Barang</th>
                <th className="p-5 text-sm font-bold text-on-surface uppercase tracking-wider">Nama Pelapor</th>
                <th className="p-5 text-sm font-bold text-on-surface uppercase tracking-wider w-1/3">Detail Kerusakan</th>
                <th className="p-5 text-sm font-bold text-on-surface uppercase tracking-wider text-center">Status</th>
                <th className="p-5 text-sm font-bold text-on-surface uppercase tracking-wider text-center">Tanggal</th>
                <th className="p-5 text-sm font-bold text-on-surface uppercase tracking-wider text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container text-on-surface font-medium">
              {damages.map((report) => (
                <tr key={report.id} className="hover:bg-surface-low/30 transition-colors">
                  <td className="p-5 text-base font-bold text-error">{report.barangRusak}</td>
                  <td className="p-5 text-base text-on-surface-variant font-bold">{report.pelapor}</td>
                  <td className="p-5 text-base leading-relaxed">{report.jenisKerusakan}</td>
                  <td className="p-5 text-center">
                    <span className={`inline-block px-3 py-1 rounded-md text-sm font-bold ${
                      report.statusAset === 'Perbaikan' ? 'bg-amber-100 text-amber-900 border border-amber-300' : 'bg-red-100 text-red-900 border border-red-300'
                    }`}>
                      {report.statusAset}
                    </span>
                  </td>
                  <td className="p-5 text-center font-mono text-base text-outline tabular-nums">{report.tanggalLapor}</td>
                  <td className="p-5 text-right">
                    <button 
                      onClick={() => { setSelectedReport(report); setIsOpenHistoryModal(true); }}
                      className="px-4 py-2 text-sm font-bold text-primary hover:bg-secondary-container border border-primary rounded-lg transition-all inline-flex items-center gap-2 cursor-pointer shadow-sm"
                    >
                      <History className="w-4 h-4" /> Cek Riwayat
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* MODAL RIWAYAT */}
        <AnimatePresence>
          {isOpenHistoryModal && selectedReport && (
            <div className="fixed inset-0 bg-on-surface/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                className="bg-white w-full max-w-2xl border border-surface-container-high rounded-xl shadow-xl p-6 space-y-5"
              >
                <div className="flex justify-between items-start border-b border-surface-container pb-3">
                  <div>
                    <h3 className="text-xl font-bold text-on-surface">Riwayat Perbaikan Barang</h3>
                    <p className="text-base text-error font-bold mt-1">{selectedReport.barangRusak}</p>
                  </div>
                  <button onClick={() => setIsOpenHistoryModal(false)} className="text-outline hover:text-on-surface p-1.5 rounded-lg border border-surface-container cursor-pointer"><X className="w-5 h-5" /></button>
                </div>
                
                <div className="overflow-hidden border border-surface-container rounded-lg">
                  <table className="w-full text-left text-base">
                    <thead className="bg-surface-low font-bold text-on-surface border-b border-surface-container">
                      <tr>
                        <th className="p-4">Tanggal Kerja</th>
                        <th className="p-4">Tindakan Perbaikan</th>
                        <th className="p-4 text-right">Biaya Nota</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-container text-on-surface font-semibold">
                      {selectedReport.riwayatPerbaikan.length > 0 ? (
                        selectedReport.riwayatPerbaikan.map((log, i) => (
                          <tr key={i} className="hover:bg-surface-low/50">
                            <td className="p-4 font-mono text-outline">{log.tanggal}</td>
                            <td className="p-4 text-base font-bold text-on-surface">{log.perbaikan}</td>
                            <td className="p-4 text-right font-extrabold text-lg text-primary tabular-nums">Rp {log.biaya.toLocaleString('id-ID')}</td>
                          </tr>
                        ))
                      ) : (
                        <tr><td colSpan={3} className="p-6 text-center text-base text-outline font-bold">Belum ada catatan perbaikan untuk alat ini.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </PageAnimateWrapper>
  );
}