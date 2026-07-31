"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { X, Search, ChevronDown, Check, Loader2 } from 'lucide-react';
import { apiPerangkat, apiItemInstance } from '@/lib/api';
import { apiKelas, Kelas } from '@/lib/api/kelas';

export interface ItemInstanceLocal {
  id: number;
  kode_asset: string;
  id_perangkat: number;
  status: string;
}

export interface ItemInventory {
  id: number;
  namaBarang: string;
  assets: ItemInstanceLocal[];
}

interface LoanModalProps {
  onClose: () => void;
  onSuccess: () => void;
  onSubmitLoan: (data: {
    id_item_instance: number;
    nama_peminjam: string;
    kelas: string;
    nomor_telepon: string;
    tanggal_pinjam: string;
    tanggal_kembali: string;
    status: string;
  }) => Promise<void>;
}

export default function LoanModal({ onClose, onSuccess, onSubmitLoan }: LoanModalProps) {
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Data State
  const [inventory, setInventory] = useState<ItemInventory[]>([]);
  const [kelases, setKelases] = useState<Kelas[]>([]);

  // Form State
  const [selectedBarang, setSelectedBarang] = useState<ItemInventory | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<ItemInstanceLocal | null>(null);
  const [namaPeminjam, setNamaPeminjam] = useState('');
  const [selectedKelas, setSelectedKelas] = useState('');
  const [nomorTelepon, setNomorTelepon] = useState('');
  const [tanggalPinjam, setTanggalPinjam] = useState('');
  const [tanggalKembali, setTanggalKembali] = useState('');

  // Dropdowns State
  const [isOpenBarangDropdown, setIsOpenBarangDropdown] = useState(false);
  const [isOpenAssetDropdown, setIsOpenAssetDropdown] = useState(false);
  const [searchBarang, setSearchBarang] = useState('');
  const [searchAsset, setSearchAsset] = useState('');

  const barangDropdownRef = useRef<HTMLDivElement>(null);
  const assetDropdownRef = useRef<HTMLDivElement>(null);

  const isAssetAvailable = (status?: string) => {
    const s = (status || '').toLowerCase().trim();
    return s === 'tersedia' || s === 'aktif' || s === 'baik';
  };

  // Fetch Data Inventaris & Kelas dari DB
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const userStr = localStorage.getItem('user');
        const currentUser = userStr ? JSON.parse(userStr) : null;
        
        // Ambil jurusan ID & Nama Jurusan dari user login (Kabeng)
        const myJurusanId = currentUser?.jurusan_id ? String(currentUser.jurusan_id) : (currentUser?.id_jurusan ? String(currentUser.id_jurusan) : null);
        const myJurusanName = currentUser?.jurusan?.nama_jurusan || currentUser?.jurusan?.jurusan || currentUser?.nama_jurusan || '';

        const [perangkatList, instanceList, kelasList] = await Promise.all([
          apiPerangkat.getAll(),
          apiItemInstance.getAll(),
          apiKelas.getAll(),
        ]);

        // 1. FILTER KELAS BERDASARKAN JURUSAN USER LOGGED IN
        const filteredKelases = (kelasList || []).filter((k: any) => {
          if (!myJurusanId && !myJurusanName) return true; // Jika user superadmin / tanpa jurusan, tampilkan semua

          // Match by ID Jurusan
          const kJurusanId = k.id_jurusan || k.jurusan_id || k.jurusan?.id;
          if (kJurusanId && myJurusanId && String(kJurusanId) === myJurusanId) {
            return true;
          }

          // Fallback Match by Name / String (contoh: "XI DKV 1" cocok dengan jurusan "DKV")
          const kelasName = (k.kelas || '').toLowerCase();
          const targetJurusan = (myJurusanName || '').toLowerCase();

          if (targetJurusan && kelasName.includes(targetJurusan)) {
            return true;
          }

          return false;
        });

        setKelases(filteredKelases);

        // 2. FILTER PERANGKAT BERDASARKAN JURUSAN USER LOGGED IN
        const filteredPerangkat = (perangkatList || []).filter((p: any) => {
          if (!myJurusanId) return true;
          const pJurusanId = p.labor?.id_jurusan || p.labor?.jurusan_id || p.id_jurusan;
          return pJurusanId ? String(pJurusanId) === myJurusanId : true;
        });

        const grouped: ItemInventory[] = filteredPerangkat.map((p: any) => ({
          id: Number(p.id),
          namaBarang: p.nama_perangkat || p.nama || 'Tanpa Nama',
          assets: (instanceList || [])
            .filter((inst: any) => Number(inst.id_perangkat) === Number(p.id))
            .map((inst: any) => ({
              id: Number(inst.id || inst.id_item_instance),
              kode_asset: inst.kode_asset || inst.kode_unit || `Asset-${inst.id}`,
              id_perangkat: Number(inst.id_perangkat),
              status: inst.status || 'tersedia',
            })),
        }));

        setInventory(grouped.filter((g) => g.assets.length > 0));
      } catch (err: any) {
        setErrorMessage('Gagal memuat data formulir.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Close Dropdowns on Click Outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (barangDropdownRef.current && !barangDropdownRef.current.contains(e.target as Node)) {
        setIsOpenBarangDropdown(false);
      }
      if (assetDropdownRef.current && !assetDropdownRef.current.contains(e.target as Node)) {
        setIsOpenAssetDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectBarang = (item: ItemInventory) => {
    setSelectedBarang(item);
    setIsOpenBarangDropdown(false);
    setSearchBarang('');
    const availables = item.assets.filter((a) => isAssetAvailable(a.status));
    setSelectedAsset(availables.length === 1 ? availables[0] : null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!selectedAsset) return setErrorMessage('Pilih barang & kode asset.');
    if (!isAssetAvailable(selectedAsset.status)) return setErrorMessage('Asset tidak tersedia / tidak layak pakai.');
    if (!namaPeminjam.trim() || !selectedKelas || !nomorTelepon.trim()) return setErrorMessage('Nama, kelas, dan no. telepon wajib diisi.');
    if (!tanggalPinjam || !tanggalKembali) return setErrorMessage('Tanggal mulai & selesai wajib diisi.');

    const start = new Date(tanggalPinjam);
    const end = new Date(tanggalKembali);
    if (end < start) return setErrorMessage('Tanggal selesai tidak boleh sebelum tanggal mulai.');
    if ((end.getTime() - start.getTime()) / (1000 * 3600 * 24) > 31) return setErrorMessage('Peminjaman maksimal 1 bulan (31 hari).');

    try {
      setSubmitting(true);
      await onSubmitLoan({
        id_item_instance: Number(selectedAsset.id),
        nama_peminjam: namaPeminjam.trim(),
        kelas: selectedKelas,
        nomor_telepon: nomorTelepon.trim(),
        tanggal_pinjam: tanggalPinjam,
        tanggal_kembali: tanggalKembali,
        status: 'aktif',
      });
      onSuccess();
    } catch (err: any) {
      setErrorMessage(err.message || 'Gagal menyimpan peminjaman.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredBarang = inventory.filter((i) => i.namaBarang.toLowerCase().includes(searchBarang.toLowerCase()));

  return (
    <div className="fixed inset-0 bg-on-surface/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="bg-white w-full max-w-xl border border-surface-container-high rounded-xl shadow-xl p-6 space-y-4 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center border-b border-surface-container pb-2">
          <h3 className="text-lg font-bold text-on-surface">Formulir Peminjaman Alat</h3>
          <button onClick={onClose} className="text-outline hover:text-on-surface p-1.5 rounded-lg border border-surface-container cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {errorMessage && <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-sm font-semibold rounded-lg">{errorMessage}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Barang Dropdown */}
            <div className="space-y-1 relative" ref={barangDropdownRef}>
              <label className="text-xs font-bold text-outline uppercase tracking-wider">Pilih Nama Barang</label>
              <button
                type="button"
                onClick={() => { setIsOpenBarangDropdown(!isOpenBarangDropdown); setIsOpenAssetDropdown(false); }}
                className="w-full px-4 py-3 border border-surface-container-high rounded-lg text-base bg-white text-left font-medium flex justify-between items-center cursor-pointer"
              >
                <span className={selectedBarang ? "text-on-surface font-semibold" : "text-outline/60"}>
                  {selectedBarang ? selectedBarang.namaBarang : loading ? "Memuat data..." : "Cari & pilih barang..."}
                </span>
                {loading ? <Loader2 className="w-4 h-4 animate-spin text-outline" /> : <ChevronDown className="w-4 h-4 text-outline" />}
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
                      className="w-full pl-9 pr-3 py-1.5 text-sm border border-surface-container rounded-md focus:outline-none"
                    />
                  </div>
                  <div className="max-h-48 overflow-y-auto divide-y divide-surface-container/50">
                    {filteredBarang.length > 0 ? (
                      filteredBarang.map((item) => (
                        <div key={item.id} onClick={() => handleSelectBarang(item)} className="px-3 py-2 hover:bg-surface-low text-sm font-medium cursor-pointer rounded flex justify-between items-center">
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

            {/* Asset Dropdown */}
            <div className="space-y-1 relative" ref={assetDropdownRef}>
              <label className="text-xs font-bold text-outline uppercase tracking-wider">Kode Asset / Unit</label>
              <button
                type="button"
                disabled={!selectedBarang}
                onClick={() => { setIsOpenAssetDropdown(!isOpenAssetDropdown); setIsOpenBarangDropdown(false); }}
                className={`w-full px-4 py-3 border border-surface-container-high rounded-lg text-base text-left font-medium flex justify-between items-center cursor-pointer ${
                  !selectedBarang ? "bg-surface-low text-outline/50 cursor-not-allowed" : "bg-white text-on-surface"
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
                      className="w-full pl-9 pr-3 py-1.5 text-sm border border-surface-container rounded-md focus:outline-none"
                    />
                  </div>
                  <div className="max-h-48 overflow-y-auto divide-y divide-surface-container/50">
                    {selectedBarang.assets.filter((a) => a.kode_asset.toLowerCase().includes(searchAsset.toLowerCase())).map((asset) => {
                      const canBorrow = isAssetAvailable(asset.status);
                      return (
                        <button
                          key={asset.id}
                          type="button"
                          disabled={!canBorrow}
                          onClick={() => { if (canBorrow) { setSelectedAsset(asset); setIsOpenAssetDropdown(false); setSearchAsset(''); } }}
                          className={`w-full px-3 py-2 text-sm font-semibold rounded flex justify-between items-center text-left ${
                            !canBorrow ? "bg-slate-50 opacity-60 cursor-not-allowed" : "hover:bg-surface-low cursor-pointer"
                          }`}
                        >
                          <span className={`font-mono ${canBorrow ? "text-primary" : "text-slate-400 line-through"}`}>{asset.kode_asset}</span>
                          <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded border ${canBorrow ? "text-emerald-700 bg-emerald-50 border-emerald-200" : "text-red-600 bg-red-50 border-red-200"}`}>
                            {asset.status}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Identitas Peminjam */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-outline uppercase tracking-wider">Nama Lengkap</label>
              <input
                type="text"
                placeholder="Contoh: Budi"
                value={namaPeminjam}
                onChange={(e) => setNamaPeminjam(e.target.value)}
                className="w-full px-4 py-3 border border-surface-container-high rounded-lg text-base bg-white focus:outline-none font-semibold"
              />
            </div>

            {/* GET KELAS TERFILTER BERDASARKAN JURUSAN USER LOGGED IN */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-outline uppercase tracking-wider">Kelas</label>
              <select
                value={selectedKelas}
                onChange={(e) => setSelectedKelas(e.target.value)}
                className="w-full px-4 py-3 border border-surface-container-high rounded-lg text-base bg-white focus:outline-none font-semibold cursor-pointer"
              >
                <option value="">Pilih Kelas...</option>
                {kelases.length === 0 ? (
                  <option value="" disabled>Tidak ada kelas untuk jurusan ini</option>
                ) : (
                  kelases.map((k) => (
                    <option key={k.id} value={k.kelas}>{k.kelas}</option>
                  ))
                )}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-outline uppercase tracking-wider">Nomor Ponsel</label>
              <input
                type="text"
                inputMode="numeric"
                placeholder="08123456789"
                value={nomorTelepon}
                onChange={(e) => setNomorTelepon(e.target.value.replace(/\D/g, ''))}
                className="w-full px-4 py-3 border border-surface-container-high rounded-lg text-base bg-white focus:outline-none font-semibold"
              />
            </div>
          </div>

          {/* Batas Waktu */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-outline uppercase tracking-wider">Tanggal Mulai</label>
              <input type="date" value={tanggalPinjam} onChange={(e) => setTanggalPinjam(e.target.value)} className="w-full px-4 py-3 border border-surface-container-high rounded-lg text-base" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-bold text-outline uppercase tracking-wider">Tanggal Selesai</label>
              <input type="date" value={tanggalKembali} onChange={(e) => setTanggalKembali(e.target.value)} className="w-full px-4 py-3 border border-surface-container-high rounded-lg text-base" />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-surface-container">
            <button type="button" onClick={onClose} className="px-5 py-2.5 text-sm font-bold text-secondary hover:bg-surface-low rounded-lg cursor-pointer">Batal</button>
            <button type="submit" disabled={submitting} className="px-6 py-2.5 text-sm font-bold text-white bg-primary rounded-lg shadow-sm flex items-center gap-2 cursor-pointer">
              {submitting && <Loader2 className="w-4 h-4 animate-spin" />} Simpan Otorisasi
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}