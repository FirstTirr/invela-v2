"use client";

import React, { useState, useEffect } from 'react';
import PageAnimateWrapper from '@/components/page-animate-wrapper';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, Send, Package, Cpu, Loader2 } from 'lucide-react';
import { apiPerangkat, apiItemInstance, apiKerusakan, Perangkat, ItemInstance } from '@/lib/api';

export default function LaporKerusakanBarang() {
  const [perangkatList, setPerangkatList] = useState<Perangkat[]>([]);
  const [instanceList, setInstanceList] = useState<ItemInstance[]>([]);

  const [selectedPerangkatId, setSelectedPerangkatId] = useState<number | ''>('');
  const [selectedInstanceId, setSelectedInstanceId] = useState<number | ''>('');
  const [deskripsi, setDeskripsi] = useState('');

  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch Master Data (Perangkat & ItemInstance) dari Backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoadingData(true);
        const [perangkatRes, instanceRes] = await Promise.all([
          apiPerangkat.getAll(),
          apiItemInstance.getAll(),
        ]);
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

  // Filter instance berdasarkan Perangkat yang dipilih (dengan type cast 'any' aman)
  const availableInstances = instanceList.filter((inst: any) => {
    const perangkatId = inst.id_perangkat || inst.idPerangkat || inst.perangkat?.id;
    return Number(perangkatId) === Number(selectedPerangkatId);
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedInstanceId) {
      alert('Silakan pilih unit barang terlebih dahulu!');
      return;
    }

    try {
      setIsSubmitting(true);

      // Kirim payload langsung ke Backend Go (POST /api/kerusakan)
      await apiKerusakan.create({
        id_item_instance: Number(selectedInstanceId),
        deskripsi: deskripsi.trim(),
        status: 'butuh tindakan', // Optional/Default di Go backend
      });

      alert('Laporan kerusakan berhasil dikirim ke mekanik bengkel!');

      // Reset Form
      setSelectedPerangkatId('');
      setSelectedInstanceId('');
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
        <Card className="border border-surface-container-high w-full max-w-2xl shadow-md rounded-xl bg-white overflow-hidden">
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
                
                {/* 1. Pilih Perangkat */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-outline uppercase tracking-wider flex items-center gap-1.5">
                    <Package className="w-4 h-4 text-primary" /> 1. Pilih Barang / Model Perangkat
                  </label>
                  <select
                    required
                    value={selectedPerangkatId}
                    onChange={(e) => {
                      setSelectedPerangkatId(e.target.value ? Number(e.target.value) : '');
                      setSelectedInstanceId(''); // Reset instance ketika perangkat berganti
                    }}
                    className="w-full px-4 py-3 border border-surface-container-high rounded-xl text-base bg-white text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all duration-200 font-medium shadow-sm cursor-pointer"
                  >
                    <option value="">-- Pilih Barang / Perangkat --</option>
                    {perangkatList.map((item: any) => (
                      <option key={item.id} value={item.id}>
                        {item.nama_perangkat || item.namaPerangkat || item.nama}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 2. Pilih Item Instance */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-outline uppercase tracking-wider flex items-center gap-1.5">
                    <Cpu className="w-4 h-4 text-primary" /> 2. Pilih Kode Unit / Item Instance
                  </label>
                  <select
                    required
                    disabled={!selectedPerangkatId}
                    value={selectedInstanceId}
                    onChange={(e) => setSelectedInstanceId(e.target.value ? Number(e.target.value) : '')}
                    className="w-full px-4 py-3 border border-surface-container-high rounded-xl text-base bg-white text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all duration-200 font-medium shadow-sm cursor-pointer disabled:bg-surface-low disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <option value="">
                      {!selectedPerangkatId 
                        ? '-- Pilih Barang Terlebih Dahulu --' 
                        : availableInstances.length === 0 
                          ? 'Tidak ada unit tersedia' 
                          : '-- Pilih Kode Unit Spesifik --'}
                    </option>
                    {availableInstances.map((inst: any) => (
                      <option key={inst.id} value={inst.id}>
                        {inst.kode_unit || inst.kodeUnit || inst.nomor_seri || `Unit ID #${inst.id}`} ({inst.status || 'Aktif'})
                      </option>
                    ))}
                  </select>
                  {selectedPerangkatId && availableInstances.length > 0 && (
                    <p className="text-xs text-outline font-medium pl-1">
                      *Menampilkan {availableInstances.length} unit terdaftar untuk barang ini.
                    </p>
                  )}
                </div>

                {/* 3. Detail Kerusakan (Deskripsi) */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-outline uppercase tracking-wider">
                    3. Rincian & Kronologi Kerusakan
                  </label>
                  <textarea 
                    required
                    placeholder="Contoh: Layar monitor bergaris horizontal merah, PC mati total pas dinyalakan, tombol klik kanan mouse macet..." 
                    value={deskripsi}
                    onChange={(e) => setDeskripsi(e.target.value)}
                    className="w-full px-4 py-3 border border-surface-container-high rounded-xl text-base bg-white text-on-surface placeholder:text-outline/60 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all duration-200 h-32 rotate-0 resize-none leading-relaxed font-medium shadow-sm"
                  />
                </div>

                {/* Submit Buttons */}
                <div className="pt-6 border-t border-surface-container flex justify-center">
                  <button 
                    type="submit"
                    disabled={!selectedPerangkatId || !selectedInstanceId || isSubmitting}
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