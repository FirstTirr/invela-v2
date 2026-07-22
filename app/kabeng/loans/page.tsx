"use client";

import React, { useState, useEffect, useRef } from 'react';
import PageAnimateWrapper from '@/components/page-animate-wrapper';
import { Plus, X, Search, ChevronDown, Check, Loader2, CheckCircle, History, Lock } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import Link from 'next/link';
import { 
  apiPerangkat, 
  apiItemInstance, 
  apiPeminjaman, 
  ItemInstance, 
  Peminjaman 
} from '@/lib/api';

interface ItemInventory {
  id: number;
  namaBarang: string;
  assets: ItemInstance[];
}

export default function KabengLoansPage() {
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [loadingInventory, setLoadingInventory] = useState(false);
  const [loadingLoans, setLoadingLoans] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  // State Data dari Backend
  const [inventoryData, setInventoryData] = useState<ItemInventory[]>([]);
  const [loans, setLoans] = useState<Peminjaman[]>([]);

  // Form State
  const [selectedBarang, setSelectedBarang] = useState<ItemInventory | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<ItemInstance | null>(null);
  const [namaPeminjam, setNamaPeminjam] = useState('');
  const [nomorTelepon, setNomorTelepon] = useState('');
  const [tanggalPinjam, setTanggalPinjam] = useState('');
  const [tanggalKembali, setTanggalKembali] = useState('');

  // Dropdown States
  const [isOpenBarangDropdown, setIsOpenBarangDropdown] = useState(false);
  const [isOpenAssetDropdown, setIsOpenAssetDropdown] = useState(false);

  // Search Queries
  const [searchBarang, setSearchBarang] = useState('');
  const [searchAsset, setSearchAsset] = useState('');

  const barangDropdownRef = useRef<HTMLDivElement>(null);
  const assetDropdownRef = useRef<HTMLDivElement>(null);

  // Fetch daftar peminjaman
  const fetchLoans = async () => {
    try {
      setLoadingLoans(true);
      const data = await apiPeminjaman.getAll();
      const activeLoans = data.filter((loan) => loan.status === 'aktif');
      setLoans(activeLoans);
    } catch (err: any) {
      console.error("Gagal memuat log peminjaman:", err);
    } finally {
      setLoadingLoans(false);
    }
  };

  // Fetch data Perangkat & ItemInstance
  const fetchInventory = async () => {
    try {
      setLoadingInventory(true);
      const [perangkatList, instanceList] = await Promise.all([
        apiPerangkat.getAll(),
        apiItemInstance.getAll()
      ]);

      const grouped: ItemInventory[] = perangkatList.map(p => {
        const assets = instanceList.filter(inst => Number(inst.id_perangkat) === p.id);
        return {
          id: p.id,
          namaBarang: p.nama_perangkat,
          assets: assets
        };
      });

      setInventoryData(grouped.filter(g => g.assets.length > 0));
    } catch (err) {
      console.error("Gagal memuat inventaris barang:", err);
    } finally {
      setLoadingInventory(false);
    }
  };

  useEffect(() => {
    fetchLoans();
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (barangDropdownRef.current && !barangDropdownRef.current.contains(event.target as Node)) {
        setIsOpenBarangDropdown(false);
      }
      if (assetDropdownRef.current && !assetDropdownRef.current.contains(event.target as Node)) {
        setIsOpenAssetDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredBarang = inventoryData.filter(item =>
    item.namaBarang.toLowerCase().includes(searchBarang.toLowerCase())
  );

  const availableAssets = selectedBarang
    ? selectedBarang.assets.filter(asset => 
        asset.kode_asset.toLowerCase().includes(searchAsset.toLowerCase())
      )
    : [];

  const handleSelectBarang = (item: ItemInventory) => {
    setSelectedBarang(item);
    setIsOpenBarangDropdown(false);
    setSearchBarang('');

    const available = item.assets;
    if (available.length === 1) {
      setSelectedAsset(available[0]);
    } else {
      setSelectedAsset(null);
    }
  };

  const handleCloseModal = () => {
    setIsOpenModal(false);
    setSelectedBarang(null);
    setSelectedAsset(null);
    setNamaPeminjam('');
    setNomorTelepon('');
    setTanggalPinjam('');
    setTanggalKembali('');
    setSearchBarang('');
    setSearchAsset('');
    setErrorMessage('');
  };

  // Handler Submit Otorisasi Peminjaman dengan Validasi 1 Bulan & Angka
  const handleSubmitPeminjaman = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!selectedAsset) {
      setErrorMessage('Pilih barang & kode asset terlebih dahulu.');
      return;
    }
    if (!namaPeminjam.trim() || !nomorTelepon.trim()) {
      setErrorMessage('Nama peminjam dan nomor telepon wajib diisi.');
      return;
    }
    if (!tanggalPinjam || !tanggalKembali) {
      setErrorMessage('Tanggal mulai dan selesai peminjaman wajib diisi.');
      return;
    }

    // Pengecekan Durasi Maksimal 1 Bulan (31 Hari)
    const startDate = new Date(tanggalPinjam);
    const endDate = new Date(tanggalKembali);

    if (endDate < startDate) {
      setErrorMessage('Tanggal selesai tidak boleh lebih awal dari tanggal mulai.');
      return;
    }

    const diffInTime = endDate.getTime() - startDate.getTime();
    const diffInDays = diffInTime / (1000 * 3600 * 24);

    if (diffInDays > 31) {
      setErrorMessage('Durasi peminjaman maksimal adalah 1 bulan (31 hari).');
      return;
    }

    try {
      setSubmitting(true);
      await apiPeminjaman.create({
        id_item_instance: selectedAsset.id,
        nama_peminjam: namaPeminjam.trim(),
        nomor_telepon: nomorTelepon.trim(),
        tanggal_pinjam: tanggalPinjam,
        tanggal_kembali: tanggalKembali,
        status: 'aktif',
      });

      handleCloseModal();
      fetchLoans();
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal menyimpan data peminjaman');
    } finally {
      setSubmitting(false);
    }
  };

  // Handler Mengubah Status ke 'selesai'
  const handleMarkAsDone = async (id: number) => {
    if (!confirm('Apakah barang ini sudah dikembalikan? Status akan diubah menjadi Selesai.')) return;
    
    try {
      setUpdatingId(id);
      await apiPeminjaman.update(id, { status: 'selesai' });
      fetchLoans();
    } catch (err: any) {
      alert(err.message || 'Gagal memperbarui status peminjaman');
    } finally {
      setUpdatingId(null);
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    return dateStr.split('T')[0];
  };

  // Fungsi Pengecekan apakah Tanggal Selesai Sudah Tiba / Lewat
  const isReturnDateReached = (dateStr?: string) => {
    if (!dateStr) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Riset jam ke 00:00 untuk komparasi tanggal murni
    const returnDate = new Date(dateStr);
    returnDate.setHours(0, 0, 0, 0);
    
    return today >= returnDate;
  };

  return (
    <PageAnimateWrapper>
      <div className="space-y-6 font-sans antialiased tracking-tight">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 border-b border-surface-container pb-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-on-surface">Log & Otorisasi Peminjaman</h1>
            <p className="text-base text-on-surface-variant mt-1 font-medium">
              Pantau batas waktu pengembalian alat labor dan input registrasi peminjaman siswa.
            </p>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Link
              href="/kabeng/loans/completed"
              className="px-4 py-2.5 text-sm font-bold text-on-surface bg-surface-low hover:bg-surface-container border border-surface-container-high rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer w-full sm:w-auto"
            >
              <History className="w-4 h-4" /> Riwayat Selesai
            </Link>
            <button 
              onClick={() => {
                setIsOpenModal(true);
                fetchInventory();
              }}
              className="px-5 py-2.5 text-sm font-bold text-white bg-primary hover:bg-primary-container rounded-lg flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer w-full sm:w-auto"
            >
              <Plus className="w-5 h-5" /> Input Peminjaman Baru
            </button>
          </div>
        </div>

        {/* Table Container */}
        <div className="bg-white border border-surface-container-high rounded-xl overflow-hidden shadow-sm w-full">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse text-base min-w-[800px]">
              <thead className="bg-surface-low border-b border-surface-container-high">
                <tr>
                  <th className="p-5 text-sm font-bold text-on-surface tracking-wide uppercase">Nama Barang</th>
                  <th className="p-5 text-sm font-bold text-on-surface tracking-wide uppercase">Kode Asset</th>
                  <th className="p-5 text-sm font-bold text-on-surface tracking-wide uppercase">Nama Peminjam</th>
                  <th className="p-5 text-sm font-bold text-on-surface tracking-wide uppercase text-center">Tgl Mulai</th>
                  <th className="p-5 text-sm font-bold text-on-surface tracking-wide uppercase text-center">Tgl Selesai</th>
                  <th className="p-5 text-sm font-bold text-on-surface tracking-wide uppercase text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container text-on-surface font-semibold">
                {loadingLoans ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-outline">
                      <Loader2 className="w-6 h-6 animate-spin inline-block mr-2" /> Memuat log peminjaman...
                    </td>
                  </tr>
                ) : loans.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-outline font-medium">
                      Tidak ada peminjaman aktif saat ini.
                    </td>
                  </tr>
                ) : (
                  loans.map((loan) => {
                    const namaBarang = loan.item_instance?.perangkat?.nama_perangkat || 'Tidak Diketahui';
                    const kodeAsset = loan.item_instance?.kode_asset || '-';
                    const canBeCompleted = isReturnDateReached(loan.tanggal_kembali);

                    return (
                      <tr key={loan.id} className="hover:bg-surface-low/30 transition-colors">
                        <td className="p-5 text-base font-bold text-primary whitespace-nowrap">{namaBarang}</td>
                        <td className="p-5 font-mono text-sm text-outline font-bold whitespace-nowrap">{kodeAsset}</td>
                        <td className="p-5 text-base text-on-surface-variant font-bold whitespace-nowrap">
                          {loan.nama_peminjam}
                          <span className="block text-xs text-outline font-normal">{loan.nomor_telepon}</span>
                        </td>
                        <td className="p-5 text-center font-mono text-base text-outline tabular-nums whitespace-nowrap">{formatDate(loan.tanggal_pinjam)}</td>
                        <td className="p-5 text-center font-mono text-base text-outline tabular-nums whitespace-nowrap">{formatDate(loan.tanggal_kembali)}</td>
                        <td className="p-5 text-center whitespace-nowrap">
                          <button
                            onClick={() => handleMarkAsDone(loan.id)}
                            disabled={!canBeCompleted || updatingId === loan.id}
                            title={canBeCompleted ? "Klik untuk menyelesaikan peminjaman" : "Belum mencapai tanggal selesai"}
                            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                              canBeCompleted
                                ? 'bg-blue-50 text-blue-800 border-blue-300 hover:bg-emerald-100 hover:text-emerald-900 hover:border-emerald-400 cursor-pointer group'
                                : 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed opacity-75'
                            }`}
                          >
                            {updatingId === loan.id ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : canBeCompleted ? (
                              <CheckCircle className="w-3.5 h-3.5 text-blue-600 group-hover:text-emerald-700" />
                            ) : (
                              <Lock className="w-3.5 h-3.5 text-gray-400" />
                            )}
                            <span>
                              {updatingId === loan.id
                                ? 'Memproses...'
                                : canBeCompleted
                                ? 'Aktif (Tandai Selesai)'
                                : 'Belum Jatuh Tempo'}
                            </span>
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* MODAL FORM INPUT PEMINJAMAN */}
        <AnimatePresence>
          {isOpenModal && (
            <div className="fixed inset-0 bg-on-surface/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                className="bg-white w-full max-w-xl border border-surface-container-high rounded-xl shadow-xl p-6 space-y-4 animate-in fade-in zoom-in-95 duration-150"
              >
                <div className="flex justify-between items-center border-b border-surface-container pb-2">
                  <h3 className="text-lg font-bold text-on-surface">Formulir Peminjaman Alat</h3>
                  <button onClick={handleCloseModal} className="text-outline hover:text-on-surface p-1.5 rounded-lg border border-surface-container cursor-pointer">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {errorMessage && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm font-semibold rounded-lg">
                    {errorMessage}
                  </div>
                )}

                <form onSubmit={handleSubmitPeminjaman} className="space-y-4">
                  {/* GRID: NAMA BARANG & KODE ASSET */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    
                    {/* 1. SEARCHABLE DROPDOWN: NAMA BARANG */}
                    <div className="space-y-1 relative" ref={barangDropdownRef}>
                      <label className="text-xs font-bold text-outline uppercase tracking-wider">Pilih Nama Barang</label>
                      <button
                        type="button"
                        onClick={() => {
                          setIsOpenBarangDropdown(!isOpenBarangDropdown);
                          setIsOpenAssetDropdown(false);
                        }}
                        className="w-full px-4 py-3 border border-surface-container-high rounded-lg text-base bg-white text-left text-on-surface focus:outline-none focus:border-primary font-medium flex justify-between items-center cursor-pointer"
                      >
                        <span className={selectedBarang ? "text-on-surface font-semibold" : "text-outline/60"}>
                          {selectedBarang ? selectedBarang.namaBarang : loadingInventory ? "Memuat data..." : "Cari & pilih barang..."}
                        </span>
                        {loadingInventory ? <Loader2 className="w-4 h-4 animate-spin text-outline" /> : <ChevronDown className="w-4 h-4 text-outline" />}
                      </button>

                      {isOpenBarangDropdown && (
                        <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-surface-container-high rounded-lg shadow-lg z-30 p-2 space-y-2">
                          <div className="relative">
                            <Search className="w-4 h-4 text-outline absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                              type="text"
                              autoFocus
                              placeholder="Ketik untuk mencari..."
                              value={searchBarang}
                              onChange={(e) => setSearchBarang(e.target.value)}
                              className="w-full pl-9 pr-3 py-1.5 text-sm border border-surface-container rounded-md focus:outline-none focus:border-primary"
                            />
                          </div>
                          <div className="max-h-48 overflow-y-auto divide-y divide-surface-container/50">
                            {filteredBarang.length > 0 ? (
                              filteredBarang.map((item) => (
                                <div
                                  key={item.id}
                                  onClick={() => handleSelectBarang(item)}
                                  className="px-3 py-2 hover:bg-surface-low text-sm font-medium cursor-pointer rounded flex justify-between items-center text-on-surface"
                                >
                                  <span>{item.namaBarang}</span>
                                  {selectedBarang?.id === item.id && <Check className="w-4 h-4 text-primary" />}
                                </div>
                              ))
                            ) : (
                              <div className="p-3 text-xs text-outline text-center">Barang tidak ditemukan</div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* 2. SEARCHABLE DROPDOWN: KODE ASSET */}
                    <div className="space-y-1 relative" ref={assetDropdownRef}>
                      <label className="text-xs font-bold text-outline uppercase tracking-wider">Kode Asset / Unit</label>
                      <button
                        type="button"
                        disabled={!selectedBarang}
                        onClick={() => {
                          setIsOpenAssetDropdown(!isOpenAssetDropdown);
                          setIsOpenBarangDropdown(false);
                        }}
                        className={`w-full px-4 py-3 border border-surface-container-high rounded-lg text-base text-left font-medium flex justify-between items-center cursor-pointer ${
                          !selectedBarang ? "bg-surface-low text-outline/50 cursor-not-allowed" : "bg-white text-on-surface focus:outline-none focus:border-primary"
                        }`}
                      >
                        <span className={selectedAsset ? "text-primary font-bold font-mono" : "text-outline/60"}>
                          {selectedAsset ? selectedAsset.kode_asset : selectedBarang ? "Pilih Kode Asset..." : "Pilih Barang Dulu"}
                        </span>
                        <ChevronDown className="w-4 h-4 text-outline" />
                      </button>

                      {isOpenAssetDropdown && selectedBarang && (
                        <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-surface-container-high rounded-lg shadow-lg z-30 p-2 space-y-2">
                          <div className="relative">
                            <Search className="w-4 h-4 text-outline absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                              type="text"
                              autoFocus
                              placeholder="Cari kode asset..."
                              value={searchAsset}
                              onChange={(e) => setSearchAsset(e.target.value)}
                              className="w-full pl-9 pr-3 py-1.5 text-sm border border-surface-container rounded-md focus:outline-none focus:border-primary"
                            />
                          </div>
                          <div className="max-h-48 overflow-y-auto divide-y divide-surface-container/50">
                            {availableAssets.length > 0 ? (
                              availableAssets.map((asset) => (
                                <div
                                  key={asset.id}
                                  onClick={() => {
                                    setSelectedAsset(asset);
                                    setIsOpenAssetDropdown(false);
                                    setSearchAsset('');
                                  }}
                                  className="px-3 py-2 hover:bg-surface-low text-sm font-semibold cursor-pointer rounded flex justify-between items-center text-on-surface"
                                >
                                  <span className="font-mono text-primary">{asset.kode_asset}</span>
                                  <span className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                    {asset.status}
                                  </span>
                                </div>
                              ))
                            ) : (
                              <div className="p-3 text-xs text-outline text-center">Tidak ada unit asset tersedia</div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                  </div>

                  {/* IDENTITAS PEMINJAM */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-outline uppercase tracking-wider">Nama Lengkap Peminjam</label>
                      <input 
                        type="text" 
                        placeholder="Contoh: Budi (XI PPLG 2)" 
                        value={namaPeminjam}
                        onChange={(e) => setNamaPeminjam(e.target.value)}
                        className="w-full px-4 py-3 border border-surface-container-high rounded-lg text-base bg-white text-on-surface focus:outline-none focus:border-primary font-semibold"
                      />
                    </div>
                    
                    {/* INPUT NOMOR TELEPON HANYA ANGKA */}
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-outline uppercase tracking-wider">Nomor Ponsel Peminjam</label>
                      <input 
                        type="text" 
                        inputMode="numeric"
                        placeholder="Contoh: 08123456789" 
                        value={nomorTelepon}
                        onChange={(e) => {
                          const onlyNums = e.target.value.replace(/\D/g, '');
                          setNomorTelepon(onlyNums);
                        }}
                        className="w-full px-4 py-3 border border-surface-container-high rounded-lg text-base bg-white text-on-surface focus:outline-none focus:border-primary font-semibold"
                      />
                    </div>
                  </div>

                  {/* BATAS WAKTU PEMINJAMAN */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-outline uppercase tracking-wider">Tanggal Mulai</label>
                      <input 
                        type="date" 
                        value={tanggalPinjam}
                        onChange={(e) => setTanggalPinjam(e.target.value)}
                        className="w-full px-4 py-3 border border-surface-container-high rounded-lg text-base bg-white text-outline focus:outline-none focus:border-primary font-medium"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-outline uppercase tracking-wider">Tanggal Selesai (Maks 1 Bulan)</label>
                      <input 
                        type="date" 
                        value={tanggalKembali}
                        onChange={(e) => setTanggalKembali(e.target.value)}
                        className="w-full px-4 py-3 border border-surface-container-high rounded-lg text-base bg-white text-outline focus:outline-none focus:border-primary font-medium"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-3 pt-3 border-t border-surface-container">
                    <button 
                      type="button" 
                      onClick={handleCloseModal} 
                      className="px-5 py-2.5 text-sm font-bold text-secondary hover:bg-surface-low rounded-lg cursor-pointer"
                    >
                      Batal
                    </button>
                    <button 
                      type="submit" 
                      disabled={submitting}
                      className="px-6 py-2.5 text-sm font-bold text-white bg-primary hover:bg-primary-container rounded-lg cursor-pointer shadow-sm flex items-center gap-2"
                    >
                      {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                      Simpan Otorisasi
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </PageAnimateWrapper>
  );
}