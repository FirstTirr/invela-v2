"use client";

import React, { useState, useEffect } from 'react';
import PageAnimateWrapper from '@/components/page-animate-wrapper';
import { History, X, Coins, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { apiKerusakan, apiRiwayatPerbaikan, Kerusakan, RiwayatPerbaikan } from '@/lib/api';

export default function KaprogDamagesPage() {
  const [isOpenHistoryModal, setIsOpenHistoryModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState<Kerusakan | null>(null);

  const [damages, setDamages] = useState<Kerusakan[]>([]);
  const [allHistory, setAllHistory] = useState<RiwayatPerbaikan[]>([]);
  const [unitHistory, setUnitHistory] = useState<RiwayatPerbaikan[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setErrorMsg('');
      const [dataKerusakan, dataRiwayat] = await Promise.all([
        apiKerusakan.getAll(),
        apiRiwayatPerbaikan.getAll(),
      ]);

      setDamages(dataKerusakan || []);
      setAllHistory(dataRiwayat || []);
    } catch (err: any) {
      console.error("Gagal mengambil data kaprog:", err);
      setErrorMsg(err.message || "Gagal memuat data kerusakan.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenHistoryModal = async (report: Kerusakan) => {
    setSelectedReport(report);
    setIsOpenHistoryModal(true);
    setIsLoadingHistory(true);

    const kodeAsset = report.item_instance?.kode_asset;

    try {
      if (kodeAsset) {
        const historyData = await apiRiwayatPerbaikan.getByKodeAsset(kodeAsset);
        setUnitHistory(historyData);
      } else {
        setUnitHistory([]);
      }
    } catch (err) {
      console.error("Gagal mengambil detail riwayat:", err);
      setUnitHistory([]);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const totalPengeluaranResmi = allHistory.reduce((acc, curr) => acc + (curr.biaya || 0), 0);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return '-';
      return new Intl.DateTimeFormat('id-ID', { year: 'numeric', month: 'short', day: 'numeric' }).format(date);
    } catch {
      return '-';
    }
  };

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);
  };

  return (
    <PageAnimateWrapper>
      <div className="space-y-8 font-sans antialiased tracking-tight">
        <div>
          <h1 className="text-3xl font-bold text-on-surface">Laporan Kerusakan & Biaya Labor</h1>
          <p className="text-base text-on-surface-variant mt-2 font-medium">Halaman khusus memantau barang rusak dan total biaya perbaikan labor.</p>
        </div>

        {/* 2 Top Cost Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border border-surface-container-high rounded-xl p-6 flex items-center justify-between shadow-xs">
            <div className="space-y-2">
              <p className="text-xs font-bold text-outline tracking-wider uppercase">Total Insiden Kerusakan</p>
              <p className="text-4xl font-extrabold text-on-surface tabular-nums">
                {damages.length} <span className="text-base font-semibold text-outline">Laporan</span>
              </p>
              <p className="text-sm text-on-surface-variant font-medium">Laporan terdaftar di jurusan</p>
            </div>
            <div className="w-14 h-14 rounded-xl bg-secondary-container flex items-center justify-center text-primary">
              <Coins className="w-7 h-7" />
            </div>
          </div>

          <div className="bg-white border border-surface-container-high rounded-xl p-6 flex items-center justify-between shadow-xs">
            <div className="space-y-2">
              <p className="text-xs font-bold text-outline tracking-wider uppercase">Total Biaya Yang Sudah Dibayar</p>
              <p className="text-4xl font-extrabold text-green-700 tabular-nums">
                {formatRupiah(totalPengeluaranResmi)}
              </p>
              <p className="text-sm font-semibold text-green-700">Dana yang sudah resmi dikeluarkan</p>
            </div>
            <div className="w-14 h-14 rounded-xl bg-green-100 flex items-center justify-center text-green-700">
              <CheckCircle2 className="w-7 h-7" />
            </div>
          </div>
        </div>

        {/* Damages Table */}
        <div className="bg-white border border-surface-container-high rounded-xl overflow-hidden shadow-xs">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16 space-y-3">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-sm font-semibold text-outline">Memuat rekapitulasi kerusakan...</p>
            </div>
          ) : errorMsg ? (
            <div className="p-8 text-center space-y-3">
              <AlertCircle className="w-10 h-10 text-error mx-auto" />
              <p className="text-base font-bold text-error">{errorMsg}</p>
              <button onClick={fetchData} className="px-4 py-2 text-sm font-bold text-white bg-primary rounded-lg">Coba Lagi</button>
            </div>
          ) : (
            <div className="overflow-x-auto w-full">
              <table className="w-full text-left border-collapse text-base min-w-[900px]">
                <thead className="bg-surface-low border-b border-surface-container-high">
                  <tr>
                    <th className="p-5 text-sm font-bold text-on-surface uppercase tracking-wider">Nama Barang</th>
                    <th className="p-5 text-sm font-bold text-on-surface uppercase tracking-wider">Pelapor</th>
                    <th className="p-5 text-sm font-bold text-on-surface uppercase tracking-wider w-1/3">Detail Kerusakan</th>
                    <th className="p-5 text-sm font-bold text-on-surface uppercase tracking-wider text-center">Status Aset</th>
                    <th className="p-5 text-sm font-bold text-on-surface uppercase tracking-wider text-center">Tanggal Lapor</th>
                    <th className="p-5 text-sm font-bold text-on-surface uppercase tracking-wider text-right">Log Audit</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container text-on-surface font-medium">
                  {damages.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-outline font-bold">
                        Belum ada laporan kerusakan.
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
                          <td className="p-5 text-base font-bold text-error">
                            {namaBarang} <span className="text-xs font-mono text-outline font-normal block">{kodeUnit}</span>
                          </td>
                          <td className="p-5 text-base text-on-surface-variant font-bold">{namaPelapor}</td>
                          <td className="p-5 text-base leading-relaxed">{report.deskripsi}</td>
                          <td className="p-5 text-center">
                            <span className={`inline-block px-3 py-1 rounded-md text-sm font-bold capitalize ${
                              report.status === 'selesai' ? 'bg-green-100 text-green-900 border border-green-300' :
                              report.status === 'sedang diperbaiki' ? 'bg-amber-100 text-amber-900 border border-amber-300' :
                              'bg-red-100 text-red-900 border border-red-300'
                            }`}>
                              {report.status}
                            </span>
                          </td>
                          <td className="p-5 text-center font-mono text-base text-outline tabular-nums">{formatDate(report.created_at)}</td>
                          <td className="p-5 text-right">
                            <button 
                              onClick={() => handleOpenHistoryModal(report)}
                              className="px-4 py-2 text-sm font-bold text-primary hover:bg-secondary-container border border-primary rounded-lg transition-all inline-flex items-center gap-2 cursor-pointer shadow-xs"
                            >
                              <History className="w-4 h-4" /> Cek Riwayat
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

        {/* MODAL AUDIT RIWAYAT BIAYA */}
        <AnimatePresence>
          {isOpenHistoryModal && selectedReport && (
            <div className="fixed inset-0 bg-on-surface/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                className="bg-white w-full max-w-3xl border border-surface-container-high rounded-xl shadow-xl p-6 space-y-5"
              >
                <div className="flex justify-between items-start border-b border-surface-container pb-3">
                  <div>
                    <h3 className="text-xl font-bold text-on-surface">Detail Nota & Riwayat Tindakan</h3>
                    <p className="text-base text-error font-bold mt-1">
                      {((selectedReport.item_instance as any)?.perangkat?.nama_perangkat || (selectedReport.item_instance as any)?.perangkat?.nama) || 'Perangkat'} (
                      {selectedReport.item_instance?.kode_asset || `ID ${selectedReport.id_item_instance}`}
                      )
                    </p>
                  </div>
                  <button onClick={() => setIsOpenHistoryModal(false)} className="text-outline hover:text-on-surface p-1.5 rounded-lg border border-surface-container cursor-pointer"><X className="w-5 h-5" /></button>
                </div>
                
                <div className="overflow-hidden border border-surface-container rounded-lg">
                  {isLoadingHistory ? (
                    <div className="py-12 text-center text-outline">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" />
                      Memuat audit riwayat perbaikan...
                    </div>
                  ) : (
                    <table className="w-full text-left text-base">
                      <thead className="bg-surface-low font-bold text-on-surface border-b border-surface-container">
                        <tr>
                          <th className="p-4">Tanggal Kerja</th>
                          <th className="p-4">Teknisi</th>
                          <th className="p-4">Tindakan Perbaikan</th>
                          <th className="p-4 text-right">Biaya Nota</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-surface-container text-on-surface font-semibold">
                        {unitHistory.length > 0 ? (
                          unitHistory.map((log) => (
                            <tr key={log.id} className="hover:bg-surface-low/50">
                              <td className="p-4 font-mono text-outline">{formatDate(log.tanggal_perbaikan)}</td>
                              <td className="p-4 font-bold text-on-surface">{log.nama_teknisi}</td>
                              <td className="p-4 text-base font-normal text-on-surface">{log.deskripsi_perbaikan}</td>
                              <td className="p-4 text-right font-extrabold text-lg text-primary tabular-nums">{formatRupiah(log.biaya)}</td>
                            </tr>
                          ))
                        ) : (
                          <tr><td colSpan={4} className="p-6 text-center text-base text-outline font-bold">Belum ada dana yang dikeluarkan untuk unit ini.</td></tr>
                        )}
                      </tbody>
                    </table>
                  )}
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </PageAnimateWrapper>
  );
}