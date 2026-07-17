"use client";

import React, { useState } from 'react';
import PageAnimateWrapper from '@/components/page-animate-wrapper';
import { Wrench, History, X, Coins, CheckCircle2 } from 'lucide-react';
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
  tanggalLapor: string;
  riwayatPerbaikan: RepairLog[];
}

export default function KabengDamagesPage() {
  const [isOpenRepairModal, setIsOpenRepairModal] = useState(false);
  const [isOpenHistoryModal, setIsOpenHistoryModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState<DamageReport | null>(null);

  const [damages] = useState<DamageReport[]>([
    { 
      id: 'R-01', 
      barangRusak: 'PC Client Asus ExpertCenter (BRG-01)', 
      pelapor: 'Vino (Siswa XI PPLG 2)', 
      jenisKerusakan: 'Blue Screen stuck saat booting sistem operasi', 
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
      tanggalLapor: '2026-07-12',
      riwayatPerbaikan: []
    }
  ]);

  return (
    <PageAnimateWrapper>
      <div className="space-y-8 font-sans antialiased tracking-tight">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-on-surface">Laporan Kerusakan & Perbaikan</h1>
          <p className="text-base text-on-surface-variant mt-2 font-medium">Pusat kendali tindakan pemeliharaan aset laboratorium dan log pendanaan.</p>
        </div>

        {/* 2 Top Cost Summary Cards - Responsif Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border border-surface-container-high rounded-xl p-6 flex items-center justify-between shadow-sm">
            <div className="space-y-2">
              <p className="text-xs font-bold text-outline tracking-wider uppercase">Total Estimasi Biaya Perbaikan</p>
              <p className="text-3xl sm:text-4xl font-black text-on-surface tracking-tight tabular-nums">Rp 650.000</p>
              <p className="text-sm text-on-surface-variant font-medium">Perkiraan sisa alokasi dana perbaikan labor</p>
            </div>
            <div className="w-14 h-14 rounded-xl bg-secondary-container flex items-center justify-center text-primary shrink-0">
              <Coins className="w-7 h-7" />
            </div>
          </div>

          <div className="bg-white border border-surface-container-high rounded-xl p-6 flex items-center justify-between shadow-sm">
            <div className="space-y-2">
              <p className="text-xs font-bold text-outline tracking-wider uppercase">Total Biaya Yang Sudah Dikeluarkan</p>
              <p className="text-3xl sm:text-4xl font-black text-green-700 tracking-tight tabular-nums">Rp 150.000</p>
              <p className="text-sm font-bold text-green-700">Telah terpakai pada tindakan valid</p>
            </div>
            <div className="w-14 h-14 rounded-xl bg-green-100 flex items-center justify-center text-green-700 shrink-0">
              <CheckCircle2 className="w-7 h-7" />
            </div>
          </div>
        </div>

        {/* Actionable Damages Table - Wrapper Scrollable Mulus */}
        <div className="bg-white border border-surface-container-high rounded-xl overflow-hidden shadow-sm w-full">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse text-base min-w-[900px]">
              <thead className="bg-surface-low border-b border-surface-container-high">
                <tr>
                  <th className="p-5 text-sm font-bold text-on-surface tracking-wide uppercase">Barang</th>
                  <th className="p-5 text-sm font-bold text-on-surface tracking-wide uppercase">Pelapor</th>
                  <th className="p-5 text-sm font-bold text-on-surface tracking-wide uppercase w-1/3 whitespace-normal">Jenis Kerusakan</th>
                  <th className="p-5 text-sm font-bold text-on-surface tracking-wide uppercase text-center">Tanggal</th>
                  <th className="p-5 text-sm font-bold text-on-surface tracking-wide uppercase text-right">Aksi Mekanik</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container text-on-surface font-semibold">
                {damages.map((report) => (
                  <tr key={report.id} className="hover:bg-surface-low/30 transition-colors">
                    <td className="p-5 text-base font-bold text-error whitespace-nowrap">{report.barangRusak}</td>
                    <td className="p-5 text-base text-on-surface-variant font-bold whitespace-nowrap">{report.pelapor}</td>
                    <td className="p-5 text-base leading-relaxed whitespace-normal min-w-[280px] font-medium text-on-surface">{report.jenisKerusakan}</td>
                    <td className="p-5 text-center font-mono text-base text-outline tabular-nums whitespace-nowrap">{report.tanggalLapor}</td>
                    <td className="p-5 text-right space-x-3 whitespace-nowrap">
                      <button 
                        onClick={() => { setSelectedReport(report); setIsOpenHistoryModal(true); }}
                        className="px-4 py-2 text-sm font-bold text-secondary hover:bg-surface-low border border-surface-container-high rounded-lg transition-all inline-flex items-center gap-2 cursor-pointer"
                      >
                        <History className="w-4 h-4" /> Riwayat
                      </button>
                      <button 
                        onClick={() => { setSelectedReport(report); setIsOpenRepairModal(true); }}
                        className="px-4 py-2 text-sm font-bold text-white bg-primary hover:bg-primary-container rounded-lg transition-all inline-flex items-center gap-2 cursor-pointer shadow-sm"
                      >
                        <Wrench className="w-4 h-4" /> Perbaikan
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* MODAL INPUT PERBAIKAN BARANG */}
        <AnimatePresence>
          {isOpenRepairModal && selectedReport && (
            <div className="fixed inset-0 bg-on-surface/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                className="bg-white w-full max-w-xl border border-surface-container-high rounded-xl shadow-xl p-6 space-y-5"
              >
                <div className="flex justify-between items-center border-b border-surface-container pb-3">
                  <h3 className="text-lg font-bold text-on-surface">Input Perbaikan: {selectedReport.id}</h3>
                  <button onClick={() => setIsOpenRepairModal(false)} className="text-outline hover:text-on-surface p-1.5 rounded-lg border border-surface-container cursor-pointer"><X className="w-5 h-5" /></button>
                </div>
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-outline uppercase tracking-wider">Tindakan/Apa Yang Diperbaiki</label>
                    <textarea placeholder="Contoh: Penggantian mat stylus atau reparasi mainboard PC..." className="w-full px-4 py-3 border border-surface-container-high rounded-lg text-base text-on-surface bg-white focus:outline-none focus:border-primary h-28 resize-none font-medium"/>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-outline uppercase tracking-wider">Total Biaya Perbaikan (Rp)</label>
                    <input type="number" placeholder="Contoh: 300000" className="w-full px-4 py-3 border border-surface-container-high rounded-lg text-base text-on-surface bg-white focus:outline-none focus:border-primary font-semibold"/>
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-3 border-t border-surface-container">
                  <button onClick={() => setIsOpenRepairModal(false)} className="px-5 py-2.5 text-sm font-bold text-secondary hover:bg-surface-low rounded-lg cursor-pointer">Batal</button>
                  <button onClick={() => setIsOpenRepairModal(false)} className="px-6 py-2.5 text-sm font-bold text-white bg-primary hover:bg-primary-container rounded-lg cursor-pointer shadow-sm">Simpan Data</button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* MODAL VIEW RIWAYAT PERBAIKAN */}
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
                    <h3 className="text-lg font-bold text-on-surface">Riwayat Perbaikan Unit</h3>
                    <p className="text-base text-error font-bold mt-1">{selectedReport.barangRusak}</p>
                  </div>
                  <button onClick={() => setIsOpenHistoryModal(false)} className="text-outline hover:text-on-surface p-1.5 rounded-lg border border-surface-container cursor-pointer"><X className="w-5 h-5" /></button>
                </div>
                <div className="overflow-hidden border border-surface-container rounded-lg w-full">
                  <div className="overflow-x-auto w-full">
                    <table className="w-full text-left text-base min-w-[500px]">
                      <thead className="bg-surface-low font-bold text-on-surface border-b border-surface-container">
                        <tr>
                          <th className="p-4">Tanggal</th>
                          <th className="p-4">Detail Perbaikan</th>
                          <th className="p-4 text-right">Biaya</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-surface-container text-on-surface font-semibold">
                        {selectedReport.riwayatPerbaikan.length > 0 ? (
                          selectedReport.riwayatPerbaikan.map((log, i) => (
                            <tr key={i} className="hover:bg-surface-low/50">
                              <td className="p-4 font-mono text-outline whitespace-nowrap">{log.tanggal}</td>
                              <td className="p-4 font-bold text-on-surface whitespace-nowrap">{log.perbaikan}</td>
                              <td className="p-4 text-right font-extrabold text-base text-primary tabular-nums whitespace-nowrap">Rp {log.biaya.toLocaleString('id-ID')}</td>
                            </tr>
                          ))
                        ) : (
                          <tr><td colSpan={3} className="p-6 text-center text-outline font-bold">Belum ada tindakan perbaikan terdokumentasi.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </PageAnimateWrapper>
  );
}