"use client";

import React, { useState } from 'react';
import PageAnimateWrapper from '@/components/page-animate-wrapper';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClipboardList, Calendar } from 'lucide-react';

export default function LaporPemakaianLabor() {
  const [formData, setFormData] = useState({
    kelas: '',
    labor: '',
    jamMulai: '1',
    jamSelesai: '4'
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Laporan pemakaian sukses dikirim!\nKelas: ${formData.kelas}`);
  };

  return (
    <PageAnimateWrapper>
      {/* Pembungkus Utama: Dibikin flex col dengan items-center biar sejajar di tengah */}
      <div className="w-full flex flex-col items-center justify-center space-y-8 font-sans antialiased tracking-tight min-h-[calc(100vh-80px)]">
        
        {/* Header ikutan rata tengah agar seimbang */}
        <div className="text-center max-w-2xl">
          <h1 className="text-3xl font-bold text-on-surface">Laporan Pemakaian Ruang Laboratorium</h1>
          <p className="text-base text-on-surface-variant mt-2 font-medium">Formulir digital untuk mencatat agenda pemakaian kelas praktikum harian.</p>
        </div>

        {/* Card Form di posisi tengah sempurna */}
        <Card className="border border-surface-container-high w-full max-w-2xl shadow-md rounded-xl bg-white overflow-hidden">
          <CardHeader className="p-6 border-b border-surface-container bg-surface-low/30">
            <CardTitle className="text-base font-bold text-on-surface flex items-center gap-2 justify-center">
              <ClipboardList className="w-5 h-5 text-primary" /> Formulir Jadwal Kelas
            </CardTitle>
          </CardHeader>
          
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Input Kelas */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-outline uppercase tracking-wider">Kelas Yang Menggunakan</label>
                <input 
                  type="text" 
                  required
                  placeholder="Contoh: XI PPLG 2, XII DKV 1..." 
                  value={formData.kelas}
                  onChange={(e) => setFormData({...formData, kelas: e.target.value})}
                  className="w-full px-4 py-3 border border-surface-container-high rounded-xl text-base bg-white text-on-surface placeholder:text-outline/60 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all duration-200 font-medium shadow-sm"
                />
              </div>

              {/* Pilihan Ruangan Labor */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-outline uppercase tracking-wider">Laboratorium Yang Digunakan</label>
                <div className="relative">
                  <select 
                    required
                    value={formData.labor}
                    onChange={(e) => setFormData({...formData, labor: e.target.value})}
                    className="w-full px-4 py-3 border border-surface-container-high rounded-xl text-base bg-white text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all duration-200 font-semibold shadow-sm appearance-none cursor-pointer"
                  >
                    <option value="" disabled className="text-outline">-- Pilih Ruangan Labor --</option>
                    <option value="Labor Komputer Pemrograman">Labor Komputer Pemrograman</option>
                    <option value="Labor Multimedia & DKV">Labor Multimedia & DKV</option>
                    <option value="Labor Jaringan TKJ">Labor Jaringan TKJ</option>
                    <option value="Labor Game Development">Labor Game Development</option>
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-outline">
                    <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
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

              {/* Action Button - Dibuat manis pas di tengah bawah */}
              <div className="pt-6 border-t border-surface-container flex justify-center">
                <button 
                  type="submit"
                  className="w-full sm:w-auto px-8 py-3.5 text-base font-bold text-white bg-primary hover:bg-primary-container active:scale-[0.98] transition-all duration-200 shadow-sm rounded-xl cursor-pointer flex items-center justify-center gap-2"
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