"use client";

import React, { useState, useEffect, useRef } from 'react';
import PageAnimateWrapper from '@/components/page-animate-wrapper';
import { Plus, X, Search, ChevronDown, Check } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

// Mock DB - Daftar barang & unit asset terkait (Secara riil bisa di-fetch dari API backend)
interface AssetUnit {
  kodeAsset: string;
  kondisi: string;
  status: 'Tersedia' | 'Dipinjam';
}

interface ItemInventory {
  id: string;
  namaBarang: string;
  assets: AssetUnit[];
}

const MOCK_INVENTORY_DATA: ItemInventory[] = [
  {
    id: 'B-001',
    namaBarang: 'Drawing Tablet Wacom Intuos',
    assets: [
      { kodeAsset: 'WCM-001', kondisi: 'Baik', status: 'Tersedia' },
      { kodeAsset: 'WCM-002', kondisi: 'Baik', status: 'Dipinjam' },
      { kodeAsset: 'WCM-003', kondisi: 'Baik', status: 'Tersedia' },
    ]
  },
  {
    id: 'B-002',
    namaBarang: 'Router Mikrotik RB951',
    assets: [
      { kodeAsset: 'MKT-001', kondisi: 'Baik', status: 'Tersedia' },
      { kodeAsset: 'MKT-002', kondisi: 'Rusak Ringan', status: 'Tersedia' },
    ]
  },
  {
    id: 'B-003',
    namaBarang: 'Laptop Asus Core i7',
    assets: [
      { kodeAsset: 'LTP-001', kondisi: 'Baik', status: 'Tersedia' },
      { kodeAsset: 'LTP-002', kondisi: 'Baik', status: 'Tersedia' },
      { kodeAsset: 'LTP-003', kondisi: 'Baik', status: 'Dipinjam' },
      { kodeAsset: 'LTP-004', kondisi: 'Baik', status: 'Tersedia' },
    ]
  }
];

interface LoanData {
  id: string;
  namaBarang: string;
  kodeAsset: string;
  namaPeminjam: string;
  tanggalMulai: string;
  tanggalSelesai: string;
  statusPinjam: 'Aktif' | 'Selesai';
}

export default function KabengLoansPage() {
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [loans] = useState<LoanData[]>([
    { id: 'L-001', namaBarang: 'Drawing Tablet Wacom Intuos', kodeAsset: 'WCM-002', namaPeminjam: 'Radit (Siswa XI PPLG 2)', tanggalMulai: '2026-07-10', tanggalSelesai: '2026-07-17', statusPinjam: 'Aktif' },
    { id: 'L-002', namaBarang: 'Router Mikrotik RB951', kodeAsset: 'MKT-001', namaPeminjam: 'Bapak Hafidz (Guru TKJ)', tanggalMulai: '2026-06-02', tanggalSelesai: '2026-06-05', statusPinjam: 'Selesai' }
  ]);

  // Form State
  const [selectedBarang, setSelectedBarang] = useState<ItemInventory | null>(null);
  const [selectedKodeAsset, setSelectedKodeAsset] = useState<string>('');
  
  // Dropdown Open States
  const [isOpenBarangDropdown, setIsOpenBarangDropdown] = useState(false);
  const [isOpenAssetDropdown, setIsOpenAssetDropdown] = useState(false);

  // Search Queries State
  const [searchBarang, setSearchBarang] = useState('');
  const [searchAsset, setSearchAsset] = useState('');

  // Refs untuk klik luar modal/dropdown (Outside click listener)
  const barangDropdownRef = useRef<HTMLDivElement>(null);
  const assetDropdownRef = useRef<HTMLDivElement>(null);

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

  // Filter List Barang berdasarkan query pencarian
  const filteredBarang = MOCK_INVENTORY_DATA.filter(item =>
    item.namaBarang.toLowerCase().includes(searchBarang.toLowerCase())
  );

  // Filter Kode Asset dari barang yang dipilih & hanya tampilkan yang 'Tersedia'
  const availableAssets = selectedBarang
    ? selectedBarang.assets
        .filter(asset => asset.status === 'Tersedia')
        .filter(asset => asset.kodeAsset.toLowerCase().includes(searchAsset.toLowerCase()))
    : [];

  // Handler Pilih Barang -> Reset Kode Asset
  const handleSelectBarang = (item: ItemInventory) => {
    setSelectedBarang(item);
    setIsOpenBarangDropdown(false);
    setSearchBarang('');
    
    // Otomatis reset kode asset saat barang berganti
    const available = item.assets.filter(a => a.status === 'Tersedia');
    if (available.length === 1) {
      setSelectedKodeAsset(available[0].kodeAsset);
    } else {
      setSelectedKodeAsset('');
    }
  };

  // Handler Reset Form saat Tutup Modal
  const handleCloseModal = () => {
    setIsOpenModal(false);
    setSelectedBarang(null);
    setSelectedKodeAsset('');
    setSearchBarang('');
    setSearchAsset('');
  };

  return (
    <PageAnimateWrapper>
      <div className="space-y-6 font-sans antialiased tracking-tight">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 border-b border-surface-container pb-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-on-surface">Log & Otorisasi Peminjaman</h1>
            <p className="text-base text-on-surface-variant mt-1 font-medium">Pantau batas waktu pengembalian alat labor dan input registrasi peminjaman siswa.</p>
          </div>
          <button 
            onClick={() => setIsOpenModal(true)}
            className="px-5 py-2.5 text-sm font-bold text-white bg-primary hover:bg-primary-container rounded-lg flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer w-full sm:w-auto"
          >
            <Plus className="w-5 h-5" /> Input Peminjaman Baru
          </button>
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
                  <th className="p-5 text-sm font-bold text-on-surface tracking-wide uppercase text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container text-on-surface font-semibold">
                {loans.map((loan) => (
                  <tr key={loan.id} className="hover:bg-surface-low/30 transition-colors">
                    <td className="p-5 text-base font-bold text-primary whitespace-nowrap">{loan.namaBarang}</td>
                    <td className="p-5 font-mono text-sm text-outline font-bold whitespace-nowrap">{loan.kodeAsset}</td>
                    <td className="p-5 text-base text-on-surface-variant font-bold whitespace-nowrap">{loan.namaPeminjam}</td>
                    <td className="p-5 text-center font-mono text-base text-outline tabular-nums whitespace-nowrap">{loan.tanggalMulai}</td>
                    <td className="p-5 text-center font-mono text-base text-outline tabular-nums whitespace-nowrap">{loan.tanggalSelesai}</td>
                    <td className="p-5 text-right whitespace-nowrap">
                      <span className={`inline-block px-3 py-1 rounded-md text-sm font-bold border ${
                        loan.statusPinjam === 'Aktif' ? 'bg-blue-100 text-blue-900 border-blue-300' : 'bg-surface-container text-outline border-transparent'
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
                  <button onClick={handleCloseModal} className="text-outline hover:text-on-surface p-1.5 rounded-lg border border-surface-container cursor-pointer"><X className="w-5 h-5" /></button>
                </div>
                
                <div className="space-y-4">
                  
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
                          {selectedBarang ? selectedBarang.namaBarang : "Cari & pilih barang..."}
                        </span>
                        <ChevronDown className="w-4 h-4 text-outline" />
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

                    {/* 2. SEARCHABLE DROPDOWN: KODE ASSET (DEPENDENT ON BARANG) */}
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
                        <span className={selectedKodeAsset ? "text-primary font-bold font-mono" : "text-outline/60"}>
                          {selectedKodeAsset ? selectedKodeAsset : selectedBarang ? "Pilih Kode Asset..." : "Pilih Barang Dulu"}
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
                              placeholder="Cari kode (misal: LTP-001)..."
                              value={searchAsset}
                              onChange={(e) => setSearchAsset(e.target.value)}
                              className="w-full pl-9 pr-3 py-1.5 text-sm border border-surface-container rounded-md focus:outline-none focus:border-primary"
                            />
                          </div>
                          <div className="max-h-48 overflow-y-auto divide-y divide-surface-container/50">
                            {availableAssets.length > 0 ? (
                              availableAssets.map((asset) => (
                                <div
                                  key={asset.kodeAsset}
                                  onClick={() => {
                                    setSelectedKodeAsset(asset.kodeAsset);
                                    setIsOpenAssetDropdown(false);
                                    setSearchAsset('');
                                  }}
                                  className="px-3 py-2 hover:bg-surface-low text-sm font-semibold cursor-pointer rounded flex justify-between items-center text-on-surface"
                                >
                                  <span className="font-mono text-primary">{asset.kodeAsset}</span>
                                  <span className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                    {asset.kondisi}
                                  </span>
                                </div>
                              ))
                            ) : (
                              <div className="p-3 text-xs text-outline text-center">Tidak ada unit asset yang tersedia</div>
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
                      <input type="text" placeholder="Contoh: Budi (XI PPLG 2)" className="w-full px-4 py-3 border border-surface-container-high rounded-lg text-base bg-white text-on-surface focus:outline-none focus:border-primary font-semibold"/>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-outline uppercase tracking-wider">Nomor Ponsel Peminjam</label>
                      <input type="text" placeholder="Contoh: 08123456789" className="w-full px-4 py-3 border border-surface-container-high rounded-lg text-base bg-white text-on-surface focus:outline-none focus:border-primary font-semibold"/>
                    </div>
                  </div>

                  {/* BATAS WAKTU PEMINJAMAN */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-outline uppercase tracking-wider">Tanggal Mulai</label>
                      <input type="date" className="w-full px-4 py-3 border border-surface-container-high rounded-lg text-base bg-white text-outline focus:outline-none focus:border-primary font-medium"/>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-outline uppercase tracking-wider">Tanggal Selesai</label>
                      <input type="date" className="w-full px-4 py-3 border border-surface-container-high rounded-lg text-base bg-white text-outline focus:outline-none focus:border-primary font-medium"/>
                    </div>
                  </div>

                </div>

                <div className="flex justify-end gap-3 pt-3 border-t border-surface-container">
                  <button onClick={handleCloseModal} className="px-5 py-2.5 text-sm font-bold text-secondary hover:bg-surface-low rounded-lg cursor-pointer">Batal</button>
                  <button onClick={handleCloseModal} className="px-6 py-2.5 text-sm font-bold text-white bg-primary hover:bg-primary-container rounded-lg cursor-pointer shadow-sm">Simpan Otorisasi</button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </PageAnimateWrapper>
  );
}