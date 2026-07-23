"use client";

import React, { useState, useEffect } from 'react';
import PageAnimateWrapper from '@/components/page-animate-wrapper';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClipboardList, Calendar, Loader2 } from 'lucide-react';
import { apiKelas, Kelas } from '@/lib/api/kelas';
import { apiLabor, Labor } from '@/lib/api/labor';

export default function LaporPemakaianLabor() {
  const [kelasList, setKelasList] = useState<Kelas[]>([]);
  const [laborList, setLaborList] = useState<Labor[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  const [formData, setFormData] = useState({
    kelas_id: '',
    labor_id: '',
    jamMulai: '1',
    jamSelesai: '4'
  });

  // Fetch Data Kelas & Labor
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoadingData(true);
        const [resKelas, resLabor] = await Promise.all([
          apiKelas.getAll(),
          apiLabor.getAll()
        ]);
        setKelasList(resKelas);
        setLaborList(resLabor);
      } catch (error) {
        console.error("Gagal mengambil data kelas/labor:", error);
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchData();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const selectedKelas = kelasList.find(k => k.id.toString() === formData.kelas_id)?.kelas;
    const selectedLabor = laborList.find(l => l.id.toString() === formData.labor_id)?.labor;
    
    alert(`Laporan pemakaian sukses dikirim!\nKelas: ${selectedKelas}\nLabor: ${selectedLabor}`);
  };

  return (
    <PageAnimateWrapper>
      {/* Pembungkus Utama */}
      <div className="w-full flex flex-col items-center justify-center space-y-8 font-sans antialiased tracking-tight min-h-[calc(100vh-80px)]">
        
        {/* Header */}
        <div className="text-center max-w-2xl">
          <h1 className="text-3xl font-bold text-on-surface">Laporan Pemakaian Ruang Laboratorium</h1>
          <p className="text-base text-on-surface-variant mt-2 font-medium">Formulir digital untuk mencatat agenda pemakaian kelas praktikum harian.</p>
        </div>

        {/* Card Form */}
        <Card className="border border-surface-container-high w-full max-w-2xl shadow-md rounded-xl bg-white overflow-hidden">
          <CardHeader className="p-6 border-b border-surface-container bg-surface-low/30">
            <CardTitle className="text-base font-bold text-on-surface flex items-center gap-2 justify-center">
              <ClipboardList className="w-5 h-5 text-primary" /> Formulir Jadwal Kelas
            </CardTitle>
          </CardHeader>
          
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Select Kelas (Dinamis dari API) */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-outline uppercase tracking-wider">Kelas Yang Menggunakan</label>
                <div className="relative">
                  <select 
                    required
                    disabled={isLoadingData}
                    value={formData.kelas_id}
                    onChange={(e) => setFormData({...formData, kelas_id: e.target.value})}
                    className="w-full px-4 py-3 border border-surface-container-high rounded-xl text-base bg-white text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all duration-200 font-semibold shadow-sm appearance-none cursor-pointer disabled:bg-slate-100 disabled:cursor-not-allowed"
                  >
                    <option value="" disabled className="text-outline">
                      {isLoadingData ? "Memuat data kelas..." : "-- Pilih Kelas --"}
                    </option>
                    {kelasList.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.kelas}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-outline">
                    {isLoadingData ? (
                      <Loader2 className="w-4 h-4 animate-spin text-primary" />
                    ) : (
                      <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                    )}
                  </div>
                </div>
              </div>

              {/* Select Laboratorium (Dinamis dari API) */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-outline uppercase tracking-wider">Laboratorium Yang Digunakan</label>
                <div className="relative">
                  <select 
                    required
                    disabled={isLoadingData}
                    value={formData.labor_id}
                    onChange={(e) => setFormData({...formData, labor_id: e.target.value})}
                    className="w-full px-4 py-3 border border-surface-container-high rounded-xl text-base bg-white text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all duration-200 font-semibold shadow-sm appearance-none cursor-pointer disabled:bg-slate-100 disabled:cursor-not-allowed"
                  >
                    <option value="" disabled className="text-outline">
                      {isLoadingData ? "Memuat data labor..." : "-- Pilih Ruangan Labor --"}
                    </option>
                    {laborList.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.labor}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-outline">
                    {isLoadingData ? (
                      <Loader2 className="w-4 h-4 animate-spin text-primary" />
                    ) : (
                      <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                    )}
                  </div>
                </div>
              </div>

              {/* Durasi Jam Pelajaran */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-outline uppercase tracking-wider">Mulai Jam Pelajaran Ke-</label>
                  <div className="relative">
                    <select 
                      value={formData.jamMulai}
                      onChange={(e) => setFormData({...formData, jamMulai: e.target.value})}
                      className="w-full px-4 py-3 border border-surface-container-high rounded-xl text-base bg-white text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all duration-200 font-bold shadow-sm appearance-none cursor-pointer"
                    >
                      {[...Array(10)].map((_, i) => (
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
                      value={formData.jamSelesai}
                      onChange={(e) => setFormData({...formData, jamSelesai: e.target.value})}
                      className="w-full px-4 py-3 border border-surface-container-high rounded-xl text-base bg-white text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all duration-200 font-bold shadow-sm appearance-none cursor-pointer"
                    >
                      {[...Array(10)].map((_, i) => (
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
                  disabled={isLoadingData}
                  className="w-full sm:w-auto px-8 py-3.5 text-base font-bold text-white bg-primary hover:bg-primary-container active:scale-[0.98] transition-all duration-200 shadow-sm rounded-xl cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  <Calendar className="w-4 h-4" /> Kirim Log Pemakaian
                </button>
              </div>

            </form>
          </CardContent>
        </Card>
      </div>
    </PageAnimateWrapper>
  );
}