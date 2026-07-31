"use client";

import React, { useState, useEffect, useRef } from 'react';
import PageAnimateWrapper from '@/components/page-animate-wrapper';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Send, Package, Cpu, Loader2, Search, ChevronDown, Check, GraduationCap, Lock } from 'lucide-react';
import { apiPerangkat, apiItemInstance, apiKerusakan, apiJurusan, Perangkat, ItemInstance, Jurusan } from '@/lib/api';

export default function LaporKerusakanBarang() {
  const [jurusanList, setJurusanList] = useState<Jurusan[]>([]);
  const [perangkatList, setPerangkatList] = useState<Perangkat[]>([]);
  const [instanceList, setInstanceList] = useState<ItemInstance[]>([]);

  // State Pilihan UI
  const [selectedJurusanId, setSelectedJurusanId] = useState<number | ''>('');
  const [selectedPerangkatId, setSelectedPerangkatId] = useState<number | ''>('');
  const [selectedInstanceId, setSelectedInstanceId] = useState<number | ''>('');
  const [deskripsi, setDeskripsi] = useState('');

  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State untuk Dropdown Search Jurusan
  const [searchJurusan, setSearchJurusan] = useState('');
  const [isJurusanOpen, setIsJurusanOpen] = useState(false);
  const dropdownJurusanRef = useRef<HTMLDivElement>(null);

  // State untuk Dropdown Search Perangkat
  const [searchPerangkat, setSearchPerangkat] = useState('');
  const [isPerangkatOpen, setIsPerangkatOpen] = useState(false);
  const dropdownPerangkatRef = useRef<HTMLDivElement>(null);

  // State untuk Dropdown Search Instance / Kode Unit
  const [searchInstance, setSearchInstance] = useState('');
  const [isInstanceOpen, setIsInstanceOpen] = useState(false);
  const dropdownInstanceRef = useRef<HTMLDivElement>(null);

  // Fetch Master Data (Jurusan, Perangkat, ItemInstance)
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoadingData(true);
        const [jurusanRes, perangkatRes, instanceRes] = await Promise.all([
          apiJurusan.getAll(),
          apiPerangkat.getAll(),
          apiItemInstance.getAll(),
        ]);
        setJurusanList(jurusanRes || []);
        setPerangkatList(perangkatRes || []);
        setInstanceList(instanceRes || []);
      } catch (err: any) {
        console.error('Gagal mengambil data:', err);
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchData();
  }, []);

  // Close dropdown saat klik di luar
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownJurusanRef.current && !dropdownJurusanRef.current.contains(event.target as Node)) {
        setIsJurusanOpen(false);
      }
      if (dropdownPerangkatRef.current && !dropdownPerangkatRef.current.contains(event.target as Node)) {
        setIsPerangkatOpen(false);
      }
      if (dropdownInstanceRef.current && !dropdownInstanceRef.current.contains(event.target as Node)) {
        setIsInstanceOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 1. FILTER LIST JURUSAN (Search Input)
  const filteredJurusanList = jurusanList.filter((j: any) => {
    const name = j.nama_jurusan || j.jurusan || j.nama || '';
    return name.toLowerCase().includes(searchJurusan.toLowerCase());
  });

  // 2. FILTER PERANGKAT BERDASARKAN JURUSAN YANG DIPILIH
  const availablePerangkat = perangkatList.filter((item: any) => {
    if (!selectedJurusanId) return false;

    // Match via ID Jurusan dari Perangkat / Laboratoriumnya
    const jId = Number(
      item.id_jurusan ?? 
      item.idJurusan ?? 
      item.jurusan?.id ?? 
      item.labor?.id_jurusan ?? 
      item.labor?.idJurusan ?? 
      item.labor?.jurusan?.id ?? 
      0
    );

    if (jId > 0) {
      return jId === Number(selectedJurusanId);
    }

    // Fallback Text Match
    const selectedJurusanObj: any = jurusanList.find((j) => Number(j.id) === Number(selectedJurusanId));
    const targetJName = (selectedJurusanObj?.nama_jurusan || selectedJurusanObj?.jurusan || '').toLowerCase();
    const itemJName = (item.jurusan?.nama_jurusan || item.labor?.jurusan?.nama_jurusan || '').toLowerCase();

    return targetJName && itemJName ? itemJName.includes(targetJName) || targetJName.includes(itemJName) : true;
  });

  const filteredPerangkatList = availablePerangkat.filter((item: any) => {
    const name = item.nama_perangkat || item.namaPerangkat || item.nama || '';
    return name.toLowerCase().includes(searchPerangkat.toLowerCase());
  });

  // 3. FILTER INSTANCE BERDASARKAN PERANGKAT YANG DIPILIH
  const availableInstances = instanceList.filter((inst: any) => {
    if (!selectedPerangkatId) return false;
    const perangkatId = inst.id_perangkat || inst.idPerangkat || inst.perangkat?.id;
    return Number(perangkatId) === Number(selectedPerangkatId);
  });

  const filteredInstanceList = availableInstances.filter((inst: any) => {
    const label = `${inst.kode_unit || inst.kodeUnit || inst.nomor_seri || `Unit ID #${inst.id}`} (${inst.status || 'Aktif'})`;
    return label.toLowerCase().includes(searchInstance.toLowerCase());
  });

  // Label Pilihan Saat Ini
  const selectedJurusanObj: any = jurusanList.find((j: any) => Number(j.id) === Number(selectedJurusanId));
  const selectedJurusanName = selectedJurusanObj 
    ? (selectedJurusanObj.nama_jurusan || selectedJurusanObj.jurusan || selectedJurusanObj.nama) 
    : '';

  const selectedPerangkatObj: any = availablePerangkat.find((p: any) => Number(p.id) === Number(selectedPerangkatId));
  const selectedPerangkatName = selectedPerangkatObj 
    ? (selectedPerangkatObj.nama_perangkat || selectedPerangkatObj.namaPerangkat || selectedPerangkatObj.nama) 
    : '';

  const selectedInstanceObj: any = availableInstances.find((inst: any) => Number(inst.id) === Number(selectedInstanceId));
  const selectedInstanceName = selectedInstanceObj 
    ? `${selectedInstanceObj.kode_unit || selectedInstanceObj.kodeUnit || selectedInstanceObj.nomor_seri || `Unit ID #${selectedInstanceObj.id}`} (${selectedInstanceObj.status || 'Aktif'})` 
    : '';

  // SUBMIT FORM: Hanya mengirim payload yang dibutuhkan backend
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedInstanceId) {
      alert('Silakan pilih unit barang terlebih dahulu!');
      return;
    }

    try {
      setIsSubmitting(true);

      // PAYLOAD BERSIH (DATA JURUSAN TIDAK DIKIRIM KE BACKEND)
      await apiKerusakan.create({
        id_item_instance: Number(selectedInstanceId),
        deskripsi: deskripsi.trim(),
        status: 'butuh tindakan',
      });

      alert('Laporan kerusakan berhasil dikirim ke mekanik bengkel!');

      // Reset Form
      setSelectedJurusanId('');
      setSelectedPerangkatId('');
      setSelectedInstanceId('');
      setSearchJurusan('');
      setSearchPerangkat('');
      setSearchInstance('');
      setDeskripsi('');
    } catch (err: any) {
      alert(`Gagal mengirim laporan: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageAnimateWrapper>
      <div className="w-full flex flex-col items-center justify-center space-y-8 font-sans antialiased tracking-tight min-h-[calc(100vh-80px)] py-8">
        
        {/* Header Rata Tengah */}
        <div className="text-center max-w-2xl">
          <h1 className="text-3xl font-bold text-on-surface">Pelaporan Insiden & Kerusakan Barang</h1>
          <p className="text-base text-on-surface-variant mt-2 font-medium">
            Laporkan malafungsi perangkat keras laboratorium agar langsung direspon oleh tim mekanik bengkel.
          </p>
        </div>

        {/* Card Form */}
        <Card className="border border-surface-container-high w-full max-w-2xl shadow-md rounded-xl bg-white">
          <CardHeader className="p-6 border-b border-surface-container bg-red-50/20">
            <CardTitle className="text-base font-bold text-error flex items-center gap-2 justify-center">
              <AlertTriangle className="w-5 h-5 text-error" /> Formulir Klaim Kerusakan Aset
            </CardTitle>
          </CardHeader>
          
          <CardContent className="p-8">
            {isLoadingData ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-3">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="text-sm font-medium text-outline">Memuat data inventaris...</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* 1. SEARCHABLE SELECT: Pilih Jurusan */}
                <div className="space-y-2 relative" ref={dropdownJurusanRef}>
                  <label className="text-xs font-bold text-outline uppercase tracking-wider flex items-center gap-1.5">
                    <GraduationCap className="w-4 h-4 text-primary" /> 1. Pilih Jurusan
                  </label>

                  <div
                    onClick={() => setIsJurusanOpen(!isJurusanOpen)}
                    className="w-full px-4 py-3 border border-surface-container-high rounded-xl text-base bg-white text-on-surface flex items-center justify-between cursor-pointer shadow-sm hover:border-primary/50 transition-all font-medium"
                  >
                    <span className={selectedJurusanName ? 'text-on-surface font-semibold' : 'text-outline'}>
                      {selectedJurusanName || '-- Pilih Jurusan --'}
                    </span>
                    <ChevronDown className={`w-4 h-4 text-outline transition-transform duration-200 ${isJurusanOpen ? 'rotate-180' : ''}`} />
                  </div>

                  {/* Dropdown Menu Jurusan */}
                  {isJurusanOpen && (
                    <div className="absolute z-30 w-full mt-1 bg-white border border-surface-container-high rounded-xl shadow-lg p-2 space-y-2 max-h-64 overflow-hidden flex flex-col">
                      <div className="relative shrink-0">
                        <Search className="w-4 h-4 text-outline absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          placeholder="Cari jurusan..."
                          value={searchJurusan}
                          onChange={(e) => setSearchJurusan(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 text-sm border border-surface-container rounded-lg focus:outline-none focus:border-primary font-medium"
                          autoFocus
                        />
                      </div>
                      <div className="overflow-y-auto space-y-1 flex-1">
                        {filteredJurusanList.length === 0 ? (
                          <p className="p-3 text-xs text-center text-outline">Jurusan tidak ditemukan</p>
                        ) : (
                          filteredJurusanList.map((j: any) => {
                            const name = j.nama_jurusan || j.jurusan || j.nama;
                            const isSelected = Number(j.id) === Number(selectedJurusanId);
                            return (
                              <div
                                key={j.id}
                                onClick={() => {
                                  setSelectedJurusanId(j.id);
                                  setSelectedPerangkatId(''); // Reset pilihan perangkat
                                  setSelectedInstanceId(''); // Reset pilihan unit
                                  setSearchPerangkat('');
                                  setSearchInstance('');
                                  setIsJurusanOpen(false);
                                }}
                                className={`px-3 py-2.5 rounded-lg text-sm font-medium cursor-pointer flex items-center justify-between transition-colors ${
                                  isSelected ? 'bg-primary/10 text-primary font-bold' : 'hover:bg-surface-low text-on-surface'
                                }`}
                              >
                                {name}
                                {isSelected && <Check className="w-4 h-4 text-primary" />}
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* 2. SEARCHABLE SELECT: Pilih Barang / Model Perangkat */}
                <div className="space-y-2 relative" ref={dropdownPerangkatRef}>
                  <label className="text-xs font-bold text-outline uppercase tracking-wider flex items-center gap-1.5">
                    <Package className="w-4 h-4 text-primary" /> 2. Pilih Barang / Model Perangkat
                  </label>

                  <div
                    onClick={() => {
                      if (selectedJurusanId) setIsPerangkatOpen(!isPerangkatOpen);
                    }}
                    className={`w-full px-4 py-3 border border-surface-container-high rounded-xl text-base flex items-center justify-between shadow-sm transition-all font-medium ${
                      !selectedJurusanId
                        ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed select-none'
                        : 'bg-white text-on-surface cursor-pointer hover:border-primary/50'
                    }`}
                  >
                    <span className={selectedPerangkatName ? 'text-on-surface font-semibold' : 'text-slate-400'}>
                      {!selectedJurusanId
                        ? 'Pilih jurusan terlebih dahulu'
                        : selectedPerangkatName || '-- Pilih Barang / Perangkat --'}
                    </span>
                    {!selectedJurusanId ? (
                      <Lock className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronDown className={`w-4 h-4 text-outline transition-transform duration-200 ${isPerangkatOpen ? 'rotate-180' : ''}`} />
                    )}
                  </div>

                  {/* Dropdown Menu Perangkat */}
                  {isPerangkatOpen && selectedJurusanId && (
                    <div className="absolute z-30 w-full mt-1 bg-white border border-surface-container-high rounded-xl shadow-lg p-2 space-y-2 max-h-64 overflow-hidden flex flex-col">
                      <div className="relative shrink-0">
                        <Search className="w-4 h-4 text-outline absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          placeholder="Cari perangkat..."
                          value={searchPerangkat}
                          onChange={(e) => setSearchPerangkat(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 text-sm border border-surface-container rounded-lg focus:outline-none focus:border-primary font-medium"
                          autoFocus
                        />
                      </div>
                      <div className="overflow-y-auto space-y-1 flex-1">
                        {filteredPerangkatList.length === 0 ? (
                          <p className="p-3 text-xs text-center text-outline">
                            Tidak ada barang terdaftar di jurusan ini
                          </p>
                        ) : (
                          filteredPerangkatList.map((item: any) => {
                            const name = item.nama_perangkat || item.namaPerangkat || item.nama;
                            const isSelected = Number(item.id) === Number(selectedPerangkatId);
                            return (
                              <div
                                key={item.id}
                                onClick={() => {
                                  setSelectedPerangkatId(item.id);
                                  setSelectedInstanceId(''); // Reset unit ketika perangkat berganti
                                  setSearchInstance('');
                                  setIsPerangkatOpen(false);
                                }}
                                className={`px-3 py-2.5 rounded-lg text-sm font-medium cursor-pointer flex items-center justify-between transition-colors ${
                                  isSelected ? 'bg-primary/10 text-primary font-bold' : 'hover:bg-surface-low text-on-surface'
                                }`}
                              >
                                {name}
                                {isSelected && <Check className="w-4 h-4 text-primary" />}
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* 3. SEARCHABLE SELECT: Pilih Kode Unit / Item Instance */}
                <div className="space-y-2 relative" ref={dropdownInstanceRef}>
                  <label className="text-xs font-bold text-outline uppercase tracking-wider flex items-center gap-1.5">
                    <Cpu className="w-4 h-4 text-primary" /> 3. Pilih Kode Unit / Item Instance
                  </label>

                  <div
                    onClick={() => {
                      if (selectedPerangkatId && availableInstances.length > 0) {
                        setIsInstanceOpen(!isInstanceOpen);
                      }
                    }}
                    className={`w-full px-4 py-3 border border-surface-container-high rounded-xl text-base flex items-center justify-between shadow-sm transition-all font-medium ${
                      !selectedPerangkatId || availableInstances.length === 0
                        ? 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed select-none'
                        : 'bg-white text-on-surface cursor-pointer hover:border-primary/50'
                    }`}
                  >
                    <span className={selectedInstanceName ? 'text-on-surface font-semibold' : 'text-slate-400'}>
                      {!selectedPerangkatId 
                        ? 'Pilih barang terlebih dahulu' 
                        : availableInstances.length === 0 
                          ? 'Tidak ada unit tersedia' 
                          : selectedInstanceName || '-- Pilih Kode Unit Spesifik --'}
                    </span>
                    {!selectedPerangkatId ? (
                      <Lock className="w-4 h-4 text-slate-400" />
                    ) : (
                      <ChevronDown className={`w-4 h-4 text-outline transition-transform duration-200 ${isInstanceOpen ? 'rotate-180' : ''}`} />
                    )}
                  </div>

                  {/* Dropdown Menu Instance */}
                  {isInstanceOpen && selectedPerangkatId && (
                    <div className="absolute z-30 w-full mt-1 bg-white border border-surface-container-high rounded-xl shadow-lg p-2 space-y-2 max-h-64 overflow-hidden flex flex-col">
                      <div className="relative shrink-0">
                        <Search className="w-4 h-4 text-outline absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          placeholder="Cari kode unit / serial..."
                          value={searchInstance}
                          onChange={(e) => setSearchInstance(e.target.value)}
                          className="w-full pl-9 pr-3 py-2 text-sm border border-surface-container rounded-lg focus:outline-none focus:border-primary font-medium"
                          autoFocus
                        />
                      </div>
                      <div className="overflow-y-auto space-y-1 flex-1">
                        {filteredInstanceList.length === 0 ? (
                          <p className="p-3 text-xs text-center text-outline">Kode unit tidak ditemukan</p>
                        ) : (
                          filteredInstanceList.map((inst: any) => {
                            const label = `${inst.kode_unit || inst.kodeUnit || inst.nomor_seri || `Unit ID #${inst.id}`} (${inst.status || 'Aktif'})`;
                            const isSelected = Number(inst.id) === Number(selectedInstanceId);
                            return (
                              <div
                                key={inst.id}
                                onClick={() => {
                                  setSelectedInstanceId(inst.id);
                                  setIsInstanceOpen(false);
                                }}
                                className={`px-3 py-2.5 rounded-lg text-sm font-medium cursor-pointer flex items-center justify-between transition-colors ${
                                  isSelected ? 'bg-primary/10 text-primary font-bold' : 'hover:bg-surface-low text-on-surface'
                                }`}
                              >
                                {label}
                                {isSelected && <Check className="w-4 h-4 text-primary" />}
                              </div>
                            );
                          })
                        )}
                      </div>
                    </div>
                  )}

                  {selectedPerangkatId && availableInstances.length > 0 && (
                    <p className="text-xs text-outline font-medium pl-1">
                      *Menampilkan {availableInstances.length} unit terdaftar untuk barang ini.
                    </p>
                  )}
                </div>

                {/* 4. Detail Kerusakan (Deskripsi) */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-outline uppercase tracking-wider">
                    4. Rincian & Kronologi Kerusakan
                  </label>
                  <textarea 
                    required
                    placeholder="Contoh: Layar monitor bergaris horizontal merah, PC mati total pas dinyalakan, tombol klik kanan mouse macet..." 
                    value={deskripsi}
                    onChange={(e) => setDeskripsi(e.target.value)}
                    className="w-full px-4 py-3 border border-surface-container-high rounded-xl text-base bg-white text-on-surface placeholder:text-outline/60 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all duration-200 h-32 rotate-0 resize-none leading-relaxed font-medium shadow-sm"
                  />
                </div>

                {/* Submit Button */}
                <div className="pt-6 border-t border-surface-container flex justify-center">
                  <button 
                    type="submit"
                    disabled={!selectedJurusanId || !selectedPerangkatId || !selectedInstanceId || isSubmitting}
                    className="w-full sm:w-auto px-8 py-3.5 text-base font-bold text-white bg-error hover:bg-error/90 active:scale-[0.98] transition-all duration-200 shadow-sm rounded-xl cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Mengirim Laporan...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" /> Kirim Laporan Kerusakan
                      </>
                    )}
                  </button>
                </div>

              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </PageAnimateWrapper>
  );
}