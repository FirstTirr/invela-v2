"use client";

import React, { useState, useEffect, useRef } from 'react';
import PageAnimateWrapper from '@/components/page-animate-wrapper';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClipboardList, Calendar, Loader2, Search, ChevronDown, Check } from 'lucide-react';
import { apiKelas, Kelas } from '@/lib/api/kelas';
import { apiLabor, Labor } from '@/lib/api/labor';
import { apiPenggunaan } from '@/lib/api/penggunaan';

export default function LaporPemakaianLabor() {
  const [kelasList, setKelasList] = useState<Kelas[]>([]);
  const [laborList, setLaborList] = useState<Labor[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    kelas_id: '',
    labor_id: '',
    jamMulai: '1',
    jamSelesai: '4'
  });

  // State Search & Dropdown Open
  const [searchKelas, setSearchKelas] = useState('');
  const [isKelasOpen, setIsKelasOpen] = useState(false);
  const dropdownKelasRef = useRef<HTMLDivElement>(null);

  const [searchLabor, setSearchLabor] = useState('');
  const [isLaborOpen, setIsLaborOpen] = useState(false);
  const dropdownLaborRef = useRef<HTMLDivElement>(null);

  // Fetch Data Kelas & Labor
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoadingData(true);
        const [resKelas, resLabor] = await Promise.all([
          apiKelas.getAll(),
          apiLabor.getAll()
        ]);
        setKelasList(resKelas || []);
        setLaborList(resLabor || []);
      } catch (error) {
        console.error("Gagal mengambil data kelas/labor:", error);
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchData();
  }, []);

  // Event Listener untuk menutup dropdown saat klik luar
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownKelasRef.current && !dropdownKelasRef.current.contains(event.target as Node)) {
        setIsKelasOpen(false);
      }
      if (dropdownLaborRef.current && !dropdownLaborRef.current.contains(event.target as Node)) {
        setIsLaborOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter List Kelas berdasarkan kata kunci pencarian
  const filteredKelasList = kelasList.filter((item) =>
    (item.kelas || '').toLowerCase().includes(searchKelas.toLowerCase())
  );

  // Filter List Laboratorium berdasarkan kata kunci pencarian
  const filteredLaborList = laborList.filter((item) =>
    (item.labor || '').toLowerCase().includes(searchLabor.toLowerCase())
  );

  // Label Pilihan Saat Ini
  const selectedKelasObj = kelasList.find((k) => String(k.id) === String(formData.kelas_id));
  const selectedKelasName = selectedKelasObj ? selectedKelasObj.kelas : '';

  const selectedLaborObj = laborList.find((l) => String(l.id) === String(formData.labor_id));
  const selectedLaborName = selectedLaborObj ? selectedLaborObj.labor : '';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.kelas_id || !formData.labor_id) {
      alert('Silakan pilih kelas dan laboratorium!');
      return;
    }

    try {
      setIsSubmitting(true);

      const storedUser = localStorage.getItem('user');
      const user = storedUser ? JSON.parse(storedUser) : null;
      const userId = user?.id || 1;

      await apiPenggunaan.create({
        id_user: Number(userId),
        id_kelas: Number(formData.kelas_id),
        id_labor: Number(formData.labor_id),
        jam_pelajaran_mulai: Number(formData.jamMulai),
        jam_pelajaran_selesai: Number(formData.jamSelesai),
      });

      alert('Laporan pemakaian sukses dikirim!');
      
      // Reset Form
      setFormData({
        kelas_id: '',
        labor_id: '',
        jamMulai: '1',
        jamSelesai: '4',
      });
      setSearchKelas('');
      setSearchLabor('');
    } catch (error: any) {
      alert(error.message || 'Gagal mengirim laporan pemakaian.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageAnimateWrapper>
      <div className="w-full flex flex-col items-center justify-center space-y-8 font-sans antialiased tracking-tight min-h-[calc(100vh-80px)]">
        
        {/* Header */}
        <div className="text-center max-w-2xl">
          <h1 className="text-3xl font-bold text-on-surface">Laporan Pemakaian Ruang Laboratorium</h1>
          <p className="text-base text-on-surface-variant mt-2 font-medium">
            Formulir digital untuk mencatat agenda pemakaian kelas praktikum harian.
          </p>
        </div>

        {/* Card Form */}
        <Card className="border border-surface-container-high w-full max-w-2xl shadow-md rounded-xl bg-white">
          <CardHeader className="p-6 border-b border-surface-container bg-surface-low/30">
            <CardTitle className="text-base font-bold text-on-surface flex items-center gap-2 justify-center">
              <ClipboardList className="w-5 h-5 text-primary" /> Formulir Jadwal Kelas
            </CardTitle>
          </CardHeader>
          
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* 1. SEARCHABLE SELECT: Kelas */}
              <div className="space-y-2 relative" ref={dropdownKelasRef}>
                <label className="text-xs font-bold text-outline uppercase tracking-wider">Kelas Yang Menggunakan</label>
                
                {/* Trigger Button */}
                <div
                  onClick={() => !isLoadingData && !isSubmitting && setIsKelasOpen(!isKelasOpen)}
                  className={`w-full px-4 py-3 border border-surface-container-high rounded-xl text-base bg-white text-on-surface flex items-center justify-between shadow-sm transition-all font-semibold ${
                    isLoadingData || isSubmitting
                      ? 'bg-slate-100 cursor-not-allowed opacity-60'
                      : 'cursor-pointer hover:border-primary/50'
                  }`}
                >
                  <span className={selectedKelasName ? 'text-on-surface font-semibold' : 'text-outline'}>
                    {isLoadingData ? "Memuat data kelas..." : selectedKelasName || "-- Pilih Kelas --"}
                  </span>
                  {isLoadingData ? (
                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                  ) : (
                    <ChevronDown className={`w-4 h-4 text-outline transition-transform duration-200 ${isKelasOpen ? 'rotate-180' : ''}`} />
                  )}
                </div>

                {/* Popover Dropdown Menu */}
                {isKelasOpen && (
                  <div className="absolute z-30 w-full mt-1 bg-white border border-surface-container-high rounded-xl shadow-lg p-2 space-y-2 max-h-64 overflow-hidden flex flex-col">
                    <div className="relative shrink-0">
                      <Search className="w-4 h-4 text-outline absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Cari kelas (contoh: XI RPL 1)..."
                        value={searchKelas}
                        onChange={(e) => setSearchKelas(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-sm border border-surface-container rounded-lg focus:outline-none focus:border-primary font-medium"
                        autoFocus
                      />
                    </div>
                    <div className="overflow-y-auto space-y-1 flex-1">
                      {filteredKelasList.length === 0 ? (
                        <p className="p-3 text-xs text-center text-outline">Kelas tidak ditemukan</p>
                      ) : (
                        filteredKelasList.map((item) => {
                          const isSelected = String(item.id) === String(formData.kelas_id);
                          return (
                            <div
                              key={item.id}
                              onClick={() => {
                                setFormData({ ...formData, kelas_id: String(item.id) });
                                setIsKelasOpen(false);
                              }}
                              className={`px-3 py-2.5 rounded-lg text-sm font-medium cursor-pointer flex items-center justify-between transition-colors ${
                                isSelected ? 'bg-primary/10 text-primary font-bold' : 'hover:bg-surface-low text-on-surface'
                              }`}
                            >
                              {item.kelas}
                              {isSelected && <Check className="w-4 h-4 text-primary" />}
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* 2. SEARCHABLE SELECT: Laboratorium */}
              <div className="space-y-2 relative" ref={dropdownLaborRef}>
                <label className="text-xs font-bold text-outline uppercase tracking-wider">Laboratorium Yang Digunakan</label>
                
                {/* Trigger Button */}
                <div
                  onClick={() => !isLoadingData && !isSubmitting && setIsLaborOpen(!isLaborOpen)}
                  className={`w-full px-4 py-3 border border-surface-container-high rounded-xl text-base bg-white text-on-surface flex items-center justify-between shadow-sm transition-all font-semibold ${
                    isLoadingData || isSubmitting
                      ? 'bg-slate-100 cursor-not-allowed opacity-60'
                      : 'cursor-pointer hover:border-primary/50'
                  }`}
                >
                  <span className={selectedLaborName ? 'text-on-surface font-semibold' : 'text-outline'}>
                    {isLoadingData ? "Memuat data labor..." : selectedLaborName || "-- Pilih Ruangan Labor --"}
                  </span>
                  {isLoadingData ? (
                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                  ) : (
                    <ChevronDown className={`w-4 h-4 text-outline transition-transform duration-200 ${isLaborOpen ? 'rotate-180' : ''}`} />
                  )}
                </div>

                {/* Popover Dropdown Menu */}
                {isLaborOpen && (
                  <div className="absolute z-30 w-full mt-1 bg-white border border-surface-container-high rounded-xl shadow-lg p-2 space-y-2 max-h-64 overflow-hidden flex flex-col">
                    <div className="relative shrink-0">
                      <Search className="w-4 h-4 text-outline absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        placeholder="Cari ruangan labor..."
                        value={searchLabor}
                        onChange={(e) => setSearchLabor(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-sm border border-surface-container rounded-lg focus:outline-none focus:border-primary font-medium"
                        autoFocus
                      />
                    </div>
                    <div className="overflow-y-auto space-y-1 flex-1">
                      {filteredLaborList.length === 0 ? (
                        <p className="p-3 text-xs text-center text-outline">Ruangan labor tidak ditemukan</p>
                      ) : (
                        filteredLaborList.map((item) => {
                          const isSelected = String(item.id) === String(formData.labor_id);
                          return (
                            <div
                              key={item.id}
                              onClick={() => {
                                setFormData({ ...formData, labor_id: String(item.id) });
                                setIsLaborOpen(false);
                              }}
                              className={`px-3 py-2.5 rounded-lg text-sm font-medium cursor-pointer flex items-center justify-between transition-colors ${
                                isSelected ? 'bg-primary/10 text-primary font-bold' : 'hover:bg-surface-low text-on-surface'
                              }`}
                            >
                              {item.labor}
                              {isSelected && <Check className="w-4 h-4 text-primary" />}
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Durasi Jam Pelajaran */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-outline uppercase tracking-wider">Mulai Jam Pelajaran Ke-</label>
                  <div className="relative">
                    <select 
                      disabled={isSubmitting}
                      value={formData.jamMulai}
                      onChange={(e) => setFormData({...formData, jamMulai: e.target.value})}
                      className="w-full px-4 py-3 border border-surface-container-high rounded-xl text-base bg-white text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all duration-200 font-bold shadow-sm appearance-none cursor-pointer"
                    >
                      {[...Array(12)].map((_, i) => (
                        <option key={i+1} value={i+1}>Jam Ke-{i+1}</option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-outline">
                      <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-outline uppercase tracking-wider">Sampai Jam Pelajaran Ke-</label>
                  <div className="relative">
                    <select 
                      disabled={isSubmitting}
                      value={formData.jamSelesai}
                      onChange={(e) => setFormData({...formData, jamSelesai: e.target.value})}
                      className="w-full px-4 py-3 border border-surface-container-high rounded-xl text-base bg-white text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all duration-200 font-bold shadow-sm appearance-none cursor-pointer"
                    >
                      {[...Array(12)].map((_, i) => (
                        <option key={i+1} value={i+1} disabled={i+1 < parseInt(formData.jamMulai)}>Jam Ke-{i+1}</option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-outline">
                      <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-6 border-t border-surface-container flex justify-center">
                <button 
                  type="submit"
                  disabled={isLoadingData || isSubmitting}
                  className="w-full sm:w-auto px-8 py-3.5 text-base font-bold text-white bg-primary hover:bg-primary-container active:scale-[0.98] transition-all duration-200 shadow-sm rounded-xl cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Mengirim...
                    </>
                  ) : (
                    <>
                      <Calendar className="w-4 h-4" /> Kirim Log Pemakaian
                    </>
                  )}
                </button>
              </div>

            </form>
          </CardContent>
        </Card>
      </div>
    </PageAnimateWrapper>
  );
}