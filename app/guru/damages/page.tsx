"use client";

import React, { useState } from 'react';
import PageAnimateWrapper from '@/components/page-animate-wrapper';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Send } from 'lucide-react';

export default function LaporKerusakanBarang() {
  const [formData, setFormData] = useState({
    namaBarang: '',
    jenisKerusakan: '',
    jumlahRusak: 1
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Laporan dikirim!\nBarang: ${formData.namaBarang}`);
  };

  return (
    <PageAnimateWrapper>
      {/* Pembungkus Utama: Dibikin flex col dengan items-center biar sejajar di tengah */}
      <div className="w-full flex flex-col items-center justify-center space-y-8 font-sans antialiased tracking-tight min-h-[calc(100vh-80px)]">
        
        {/* Header Rata Tengah */}
        <div className="text-center max-w-2xl">
          <h1 className="text-3xl font-bold text-on-surface">Pelaporan Insiden & Kerusakan Barang</h1>
          <p className="text-base text-on-surface-variant mt-2 font-medium">Laporkan malafungsi perangkat keras laboratorium agar langsung direspon oleh tim mekanik bengkel.</p>
        </div>

        {/* Card Form di posisi tengah sempurna */}
        <Card className="border border-surface-container-high w-full max-w-2xl shadow-md rounded-xl bg-white overflow-hidden">
          <CardHeader className="p-6 border-b border-surface-container bg-red-50/20">
            <CardTitle className="text-base font-bold text-error flex items-center gap-2 justify-center">
              <AlertTriangle className="w-5 h-5 text-error" /> Formulir Klaim Kerusakan Aset
            </CardTitle>
          </CardHeader>
          
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* Nama Barang */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-outline uppercase tracking-wider">Nama Barang / Model Alat</label>
                <input 
                  type="text" 
                  required
                  placeholder="Contoh: PC Client ExpertCenter, Stylus Pen Wacom, Switch Hub..." 
                  value={formData.namaBarang}
                  onChange={(e) => setFormData({...formData, namaBarang: e.target.value})}
                  className="w-full px-4 py-3 border border-surface-container-high rounded-xl text-base bg-white text-on-surface placeholder:text-outline/60 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all duration-200 font-medium shadow-sm"
                />
              </div>

              {/* Jumlah yang Rusak */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-outline uppercase tracking-wider">Jumlah Unit Malafungsi / Rusak</label>
                <input 
                  type="number" 
                  min="1"
                  required
                  placeholder="Masukkan kuantitas barang..." 
                  value={formData.jumlahRusak}
                  onChange={(e) => setFormData({...formData, jumlahRusak: parseInt(e.target.value) || 1})}
                  className="w-full px-4 py-3 border border-surface-container-high rounded-xl text-base bg-white text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all duration-200 font-bold tabular-nums shadow-sm"
                />
              </div>

              {/* Jenis / Detail Kerusakan */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-outline uppercase tracking-wider">Rincian & Kronologi Kerusakan</label>
                <textarea 
                  required
                  placeholder="Contoh: Layar monitor bergaris horizontal merah, PC mati total pas dinyalakan, tombol klik kanan mouse macet..." 
                  value={formData.jenisKerusakan}
                  onChange={(e) => setFormData({...formData, jenisKerusakan: e.target.value})}
                  className="w-full px-4 py-3 border border-surface-container-high rounded-xl text-base bg-white text-on-surface placeholder:text-outline/60 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all duration-200 h-32 rotate-0 resize-none leading-relaxed font-medium shadow-sm"
                />
              </div>

              {/* Submit Buttons - Rata Tengah Manis */}
              <div className="pt-6 border-t border-surface-container flex justify-center">
                <button 
                  type="submit"
                  className="w-full sm:w-auto px-8 py-3.5 text-base font-bold text-white bg-error hover:bg-error/90 active:scale-[0.98] transition-all duration-200 shadow-sm rounded-xl cursor-pointer flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" /> Kirim Laporan Kerusakan
                </button>
              </div>

            </form>
          </CardContent>
        </Card>
      </div>
    </PageAnimateWrapper>
  );
}