"use client";

import React, { useState, useEffect } from 'react';
import PageAnimateWrapper from '@/components/page-animate-wrapper';
import { Wrench, History, X, Coins, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiKerusakan, Kerusakan } from '@/lib/api';

interface RepairLog {
  tanggal: string;
  perbaikan: string;
  biaya: number;
}

export default function KabengDamagesPage() {
  const [isOpenRepairModal, setIsOpenRepairModal] = useState(false);
  const [isOpenHistoryModal, setIsOpenHistoryModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Kerusakan | null>(null);

  const [damages, setDamages] = useState<Kerusakan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Fetch data laporan kerusakan dari Backend Go
  const fetchDamages = async () => {
    try {
      setIsLoading(true);
      setErrorMsg('');
      const data = await apiKerusakan.getAll();
      setDamages(data || []);
    } catch (err: any) {
      console.error("Gagal mengambil data kerusakan:", err);
      setErrorMsg(err.message || "Gagal memuat data kerusakan.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDamages();
  }, []);

  // Format Helper Tanggal
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <PageAnimateWrapper>
      <div className="space-y-8 font-sans antialiased tracking-tight">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-on-surface">Laporan Kerusakan & Perbaikan</h1>
          <p className="text-base text-on-surface-variant mt-2 font-medium">Pusat kendali tindakan pemeliharaan aset laboratorium dan log pendanaan.</p>
        </div>

        {/* 2 Top Cost Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border border-surface-container-high rounded-xl p-6 flex items-center justify-between shadow-sm">
            <div className="space-y-2">
              <p className="text-xs font-bold text-outline tracking-wider uppercase">Total Laporan Kerusakan</p>
              <p className="text-3xl sm:text-4xl font-black text-on-surface tracking-tight tabular-nums">
                {damages.length} <span className="text-base font-semibold text-outline">Insiden</span>
              </p>
              <p className="text-sm text-on-surface-variant font-medium">Laporan terdaftar dari guru & pengguna labor</p>
            </div>
            <div className="w-14 h-14 rounded-xl bg-secondary-container flex items-center justify-center text-primary shrink-0">
              <Coins className="w-7 h-7" />
            </div>
          </div>

          <div className="bg-white border border-surface-container-high rounded-xl p-6 flex items-center justify-between shadow-sm">
            <div className="space-y-2">
              <p className="text-xs font-bold text-outline tracking-wider uppercase">Butuh Penanganan</p>
              <p className="text-3xl sm:text-4xl font-black text-red-600 tracking-tight tabular-nums">
                {damages.filter(d => d.status === 'butuh tindakan').length} <span className="text-base font-semibold text-outline">Unit</span>
              </p>
              <p className="text-sm font-bold text-red-600">Perlu tindakan verifikasi mekanik</p>
            </div>
            <div className="w-14 h-14 rounded-xl bg-red-100 flex items-center justify-center text-red-600 shrink-0">
              <CheckCircle2 className="w-7 h-7" />
            </div>
          </div>
        </div>

        {/* Actionable Damages Table */}
        <div className="bg-white border border-surface-container-high rounded-xl overflow-hidden shadow-sm w-full">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 space-y-3">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-sm font-semibold text-outline">Memuat data laporan kerusakan...</p>
            </div>
          ) : errorMsg ? (
            <div className="p-8 text-center space-y-3">
              <AlertCircle className="w-10 h-10 text-error mx-auto" />
              <p className="text-base font-bold text-error">{errorMsg}</p>
              <button 
                onClick={fetchDamages}
                className="px-4 py-2 text-sm font-bold text-white bg-primary rounded-lg shadow-sm hover:bg-primary-container transition-all"
              >
                Coba Lagi
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse text-base min-w-[900px]">
                <thead className="bg-surface-low border-b border-surface-container-high">
                  <tr>
                    <th className="p-5 text-sm font-bold text-on-surface tracking-wide uppercase">Barang / Unit</th>
                    <th className="p-5 text-sm font-bold text-on-surface tracking-wide uppercase">Pelapor</th>
                    <th className="p-5 text-sm font-bold text-on-surface tracking-wide uppercase w-1/3 whitespace-normal">Rincian Kerusakan</th>
                    <th className="p-5 text-sm font-bold text-on-surface tracking-wide uppercase text-center">Status</th>
                    <th className="p-5 text-sm font-bold text-on-surface tracking-wide uppercase text-center">Tanggal</th>
                    <th className="p-5 text-sm font-bold text-on-surface tracking-wide uppercase text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container text-on-surface font-semibold">
                  {damages.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-outline font-bold">
                        Belum ada laporan kerusakan yang tercatat.
                      </td>
                    </tr>
                  ) : (
                    damages.map((report) => {
                      const itemInst = report.item_instance as any;
                      const namaBarang = itemInst?.perangkat?.nama_perangkat || itemInst?.perangkat?.nama || 'Perangkat';
                      const kodeUnit = itemInst?.kode_asset || itemInst?.kode_unit || `Unit #${report.id_item_instance}`;
                      const namaPelapor = report.user?.name || report.user?.username || `User #${report.id_user}`;

                      return (
                        <tr key={report.id} className="hover:bg-surface-low/30 transition-colors">
                          <td className="p-5 text-base font-bold text-error whitespace-nowrap">
                            {namaBarang} <span className="text-xs font-mono text-outline font-normal block">{kodeUnit}</span>
                          </td>
                          <td className="p-5 text-base text-on-surface-variant font-bold whitespace-nowrap">{namaPelapor}</td>
                          <td className="p-5 text-base leading-relaxed whitespace-normal min-w-[280px] font-medium text-on-surface">
                            {report.deskripsi}
                          </td>
                          <td className="p-5 text-center whitespace-nowrap">
                            <span className={`px-3 py-1 text-xs font-bold rounded-full capitalize ${
                              report.status === 'selesai' 
                                ? 'bg-green-100 text-green-700' 
                                : report.status === 'sedang diperbaiki'
                                ? 'bg-amber-100 text-amber-700'
                                : 'bg-red-100 text-red-700'
                            }`}>
                              {report.status}
                            </span>
                          </td>
                          <td className="p-5 text-center font-mono text-sm text-outline tabular-nums whitespace-nowrap">
                            {formatDate(report.created_at)}
                          </td>
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
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}
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
                  <h3 className="text-lg font-bold text-on-surface">Input Perbaikan: #{selectedReport.id}</h3>
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
                    <p className="text-base text-error font-bold mt-1">
                      {((selectedReport.item_instance as any)?.perangkat?.nama_perangkat || (selectedReport.item_instance as any)?.perangkat?.nama) || 'Perangkat'} (
                      {selectedReport.item_instance?.kode_asset || `ID ${selectedReport.id_item_instance}`}
                      )
                    </p>
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
                        <tr>
                          <td colSpan={3} className="p-6 text-center text-outline font-bold">
                            Belum ada tindakan perbaikan terdokumentasi.
                          </td>
                        </tr>
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