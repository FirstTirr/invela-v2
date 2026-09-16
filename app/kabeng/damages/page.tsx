"use client";

import React, { useState, useEffect, useCallback } from 'react';
import PageAnimateWrapper from '@/components/page-animate-wrapper';
import { History, X, Coins, CheckCircle2, Loader2, AlertCircle, Trash2, Wrench, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  apiKerusakan, 
  apiPerbaikan, 
  apiRiwayatPerbaikan, 
  Kerusakan, 
  RiwayatPerbaikan 
} from '@/lib/api';
import AddDamageModal from '@/components/kabeng/addDamagesModal';

// Extend tipe Kerusakan lokal untuk mengakomodasi struktur relasi terurai
type ExtendedKerusakan = Kerusakan & {
  item_instance?: {
    kode_asset?: string;
    kode_unit?: string;
    perangkat?: {
      nama_perangkat?: string;
      nama?: string;
      id_jurusan?: number;
      labor?: {
        id_jurusan?: number;
        jurusan_id?: number;
      };
    };
  };
  user?: {
    name?: string;
    username?: string;
    jurusan_id?: number;
  };
};

export default function KabengDamagesPage() {
  const [isOpenRepairModal, setIsOpenRepairModal] = useState(false);
  const [isOpenHistoryModal, setIsOpenHistoryModal] = useState(false);
  const [isOpenAddModal, setIsOpenAddModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState<ExtendedKerusakan | null>(null);

  // State Data Backend
  const [damages, setDamages] = useState<ExtendedKerusakan[]>([]);
  const [historyList, setHistoryList] = useState<RiwayatPerbaikan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Form State untuk Modal Perbaikan
  const [deskripsiPerbaikan, setDeskripsiPerbaikan] = useState('');
  const [biayaPerbaikan, setBiayaPerbaikan] = useState('');

  // Helper Formatting Ribuan (Titik)
  const formatRibuan = (value: string) => {
    const rawValue = value.replace(/\D/g, ''); // Hapus semua karakter selain angka
    if (!rawValue) return '';
    return new Intl.NumberFormat('id-ID').format(Number(rawValue));
  };

  const parseRawNumber = (value: string) => {
    return value.replace(/\D/g, '');
  };

  const handleBiayaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatRibuan(e.target.value);
    setBiayaPerbaikan(formatted);
  };

  // Fetch data laporan kerusakan & filter berdasarkan jurusan Kabeng yang login
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      // Ambil user dari localStorage
      const userStr = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
      const currentUser = userStr ? JSON.parse(userStr) : null;
      const myJurusanId = currentUser?.jurusan_id ? String(currentUser.jurusan_id) : null;

      const dataKerusakan = (await apiKerusakan.getAll()) as ExtendedKerusakan[];

      // Filtering Sesuai Jurusan
      const filtered = (dataKerusakan || []).filter((report) => {
        if (!myJurusanId) return true; // Jika tidak ada batasan jurusan, tampilkan semua
        
        // Cek id_jurusan dari perangkat / labor
        const itemJurusanId = 
          report.item_instance?.perangkat?.labor?.id_jurusan ||
          report.item_instance?.perangkat?.labor?.jurusan_id ||
          report.item_instance?.perangkat?.id_jurusan ||
          report.user?.jurusan_id;

        return itemJurusanId ? String(itemJurusanId) === myJurusanId : true;
      });

      setDamages(filtered);
    } catch (err: unknown) {
      console.error("Gagal mengambil data:", err);
      const message = err instanceof Error ? err.message : "Gagal memuat data kerusakan.";
      setErrorMsg(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    
    const loadInitialData = async () => {
      if (isMounted) {
        await fetchData();
      }
    };

    void loadInitialData();

    return () => {
      isMounted = false;
    };
  }, [fetchData]);

  // Handler Buka Modal Riwayat
  const handleOpenHistoryModal = async (report: ExtendedKerusakan) => {
    setSelectedReport(report);
    setIsOpenHistoryModal(true);
    setIsLoadingHistory(true);

    const kodeAsset = report.item_instance?.kode_asset;

    try {
      if (kodeAsset) {
        const historyData = await apiRiwayatPerbaikan.getByKodeAsset(kodeAsset);
        setHistoryList(historyData);
      } else {
        setHistoryList([]);
      }
    } catch (err: unknown) {
      console.error("Gagal mengambil riwayat perbaikan:", err);
      setHistoryList([]);
    } finally {
      setIsLoadingHistory(false);
    }
  };

  // Submit Perbaikan Baru
  const handleSaveRepair = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReport) return;
    if (!deskripsiPerbaikan.trim()) {
      alert("Deskripsi perbaikan wajib diisi.");
      return;
    }

    try {
      setIsSubmitting(true);
      const rawBiaya = parseRawNumber(biayaPerbaikan);

      await apiPerbaikan.create({
        id_kerusakan: selectedReport.id,
        deskripsi_perbaikan: deskripsiPerbaikan,
        biaya: Number(rawBiaya) || 0,
      });

      alert("Data perbaikan berhasil disimpan!");
      setIsOpenRepairModal(false);
      setDeskripsiPerbaikan('');
      setBiayaPerbaikan('');
      
      void fetchData();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Gagal menyimpan data perbaikan.";
      alert(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handler Hapus Laporan Kerusakan
  const handleDelete = async (id: number) => {
    const confirmed = window.confirm("Apakah Anda yakin ingin menghapus laporan kerusakan ini?");
    if (!confirmed) return;

    try {
      setDeletingId(id);
      await apiKerusakan.delete(id);
      alert("Laporan kerusakan berhasil dihapus!");
      void fetchData();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Gagal menghapus laporan kerusakan.";
      alert(message);
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return '-';
      return new Intl.DateTimeFormat('id-ID', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }).format(date);
    } catch {
      return '-';
    }
  };

  const formatRupiah = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <PageAnimateWrapper>
      <div className="space-y-8 font-sans antialiased tracking-tight">
        
        {/* Header dengan Tombol Tambah Laporan */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-on-surface">Laporan Kerusakan & Perbaikan</h1>
            <p className="text-base text-on-surface-variant mt-2 font-medium">
              Pusat kendali tindakan pemeliharaan aset laboratorium dan log pendanaan.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setIsOpenAddModal(true)}
            className="px-4 py-2.5 bg-error hover:bg-error/90 text-white font-bold text-sm rounded-xl flex items-center gap-2 shadow-xs transition-all cursor-pointer shrink-0 self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" /> Laporkan Kerusakan
          </button>
        </div>

        {/* 2 Top Cost Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white border border-surface-container-high rounded-xl p-6 flex items-center justify-between shadow-xs">
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

          <div className="bg-white border border-surface-container-high rounded-xl p-6 flex items-center justify-between shadow-xs">
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
        <div className="bg-white border border-surface-container-high rounded-xl overflow-hidden shadow-xs w-full">
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
                type="button"
                onClick={() => void fetchData()}
                className="px-4 py-2 text-sm font-bold text-white bg-primary rounded-lg shadow-xs hover:bg-primary-container transition-all cursor-pointer"
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
                        Belum ada laporan kerusakan yang tercatat untuk jurusan ini.
                      </td>
                    </tr>
                  ) : (
                    damages.map((report) => {
                      const itemInst = report.item_instance;
                      const namaBarang = itemInst?.perangkat?.nama_perangkat || itemInst?.perangkat?.nama || 'Perangkat';
                      const kodeUnit = itemInst?.kode_asset || itemInst?.kode_unit || `Unit #${report.id_item_instance}`;
                      const namaPelapor = report.user?.name || report.user?.username || `User #${report.id_user}`;
                      const isSelesai = report.status?.toLowerCase() === 'selesai';

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
                              isSelesai 
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
                          <td className="p-5 text-right space-x-2 whitespace-nowrap">
                            <button 
                              type="button"
                              onClick={() => handleOpenHistoryModal(report)}
                              className="px-3 py-2 text-sm font-bold text-secondary hover:bg-surface-low border border-surface-container-high rounded-lg transition-all inline-flex items-center gap-1.5 cursor-pointer"
                            >
                              <History className="w-4 h-4" /> Riwayat
                            </button>
                            <button 
                              type="button"
                              onClick={() => { 
                                setSelectedReport(report); 
                                setDeskripsiPerbaikan('');
                                setBiayaPerbaikan('');
                                setIsOpenRepairModal(true); 
                              }}
                              disabled={isSelesai}
                              className={`px-3 py-2 text-sm font-bold rounded-lg transition-all inline-flex items-center gap-1.5 ${
                                isSelesai 
                                  ? 'bg-slate-200 text-slate-400 border border-slate-300 cursor-not-allowed opacity-60' 
                                  : 'text-white bg-primary hover:bg-primary-container cursor-pointer shadow-xs'
                              }`}
                            >
                              <Wrench className="w-4 h-4" /> Perbaikan
                            </button>
                            <button 
                              type="button"
                              onClick={() => handleDelete(report.id)}
                              disabled={deletingId === report.id}
                              className="p-2 text-sm font-bold text-red-600 hover:bg-red-50 border border-red-200 rounded-lg transition-all inline-flex items-center justify-center cursor-pointer disabled:opacity-50"
                              title="Hapus Laporan Kerusakan"
                            >
                              {deletingId === report.id ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                              ) : (
                                <Trash2 className="w-4 h-4" />
                              )}
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

        {/* MODAL INPUT KERUSAKAN BARU */}
        <AnimatePresence>
          {isOpenAddModal && (
            <AddDamageModal
              isOpen={isOpenAddModal}
              onClose={() => setIsOpenAddModal(false)}
              onSuccess={() => void fetchData()}
            />
          )}
        </AnimatePresence>

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
                  <button 
                    type="button"
                    onClick={() => setIsOpenRepairModal(false)} 
                    className="text-outline hover:text-on-surface p-1.5 rounded-lg border border-surface-container cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <form onSubmit={handleSaveRepair} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-outline uppercase tracking-wider">Tindakan / Deskripsi Perbaikan</label>
                    <textarea 
                      placeholder="Contoh: Penggantian mainboard PC, kalibrasi instrumen, dll..." 
                      value={deskripsiPerbaikan}
                      onChange={(e) => setDeskripsiPerbaikan(e.target.value)}
                      required
                      className="w-full px-4 py-3 border border-surface-container-high rounded-lg text-base text-on-surface bg-white focus:outline-none focus:border-primary h-28 resize-none font-medium"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-outline uppercase tracking-wider">Total Biaya Perbaikan (Rp)</label>
                    <input 
                      type="text" 
                      placeholder="Contoh: 300.000" 
                      value={biayaPerbaikan}
                      onChange={handleBiayaChange}
                      className="w-full px-4 py-3 border border-surface-container-high rounded-lg text-base text-on-surface bg-white focus:outline-none focus:border-primary font-semibold"
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-3 border-t border-surface-container">
                    <button 
                      type="button"
                      onClick={() => setIsOpenRepairModal(false)} 
                      className="px-5 py-2.5 text-sm font-bold text-secondary hover:bg-surface-low rounded-lg cursor-pointer"
                    >
                      Batal
                    </button>
                    <button 
                      type="submit"
                      disabled={isSubmitting}
                      className="px-6 py-2.5 text-sm font-bold text-white bg-primary hover:bg-primary-container rounded-lg cursor-pointer shadow-xs flex items-center gap-2 disabled:opacity-50"
                    >
                      {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
                      Simpan Data
                    </button>
                  </div>
                </form>
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
                className="bg-white w-full max-w-3xl border border-surface-container-high rounded-xl shadow-xl p-6 space-y-5"
              >
                <div className="flex justify-between items-start border-b border-surface-container pb-3">
                  <div>
                    <h3 className="text-lg font-bold text-on-surface">Riwayat Perbaikan Unit</h3>
                    <p className="text-base text-error font-bold mt-1">
                      {selectedReport.item_instance?.perangkat?.nama_perangkat || selectedReport.item_instance?.perangkat?.nama || 'Perangkat'} (
                      {selectedReport.item_instance?.kode_asset || `ID ${selectedReport.id_item_instance}`}
                      )
                    </p>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setIsOpenHistoryModal(false)} 
                    className="text-outline hover:text-on-surface p-1.5 rounded-lg border border-surface-container cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="overflow-hidden border border-surface-container rounded-lg w-full">
                  <div className="overflow-x-auto w-full">
                    {isLoadingHistory ? (
                      <div className="py-12 text-center text-outline">
                        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" />
                        Memuat riwayat perbaikan...
                      </div>
                    ) : (
                      <table className="w-full text-left text-base min-w-[600px]">
                        <thead className="bg-surface-low font-bold text-on-surface border-b border-surface-container">
                          <tr>
                            <th className="p-4">Tanggal</th>
                            <th className="p-4">Teknisi</th>
                            <th className="p-4">Deskripsi Perbaikan</th>
                            <th className="p-4 text-right">Biaya</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-surface-container text-on-surface font-semibold">
                          {historyList.length === 0 ? (
                            <tr>
                              <td colSpan={4} className="p-6 text-center text-outline font-bold">
                                Belum ada tindakan perbaikan terdokumentasi untuk unit ini.
                              </td>
                            </tr>
                          ) : (
                            historyList.map((log) => (
                              <tr key={log.id} className="hover:bg-surface-low/30">
                                <td className="p-4 text-sm font-mono text-outline whitespace-nowrap">
                                  {formatDate(log.tanggal_perbaikan)}
                                </td>
                                <td className="p-4 text-sm font-bold text-on-surface whitespace-nowrap">
                                  {log.nama_teknisi}
                                </td>
                                <td className="p-4 text-sm font-medium leading-normal">
                                  {log.deskripsi_perbaikan}
                                </td>
                                <td className="p-4 text-sm font-bold text-right text-emerald-700 whitespace-nowrap">
                                  {formatRupiah(log.biaya)}
                                </td>
                              </tr>
                            ))
                          )}
                        </tbody>
                      </table>
                    )}
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