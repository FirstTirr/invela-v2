"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { X, Package, Cpu, Loader2, Search, ChevronDown, Check, AlertTriangle } from 'lucide-react';
import { apiPerangkat, apiItemInstance, apiKerusakan, Perangkat, ItemInstance } from '@/lib/api';

// Interface pembantu untuk mencakup variasi response API
interface ExtendedPerangkat extends Partial<Perangkat> {
  id: number;
  nama_perangkat?: string;
  nama?: string;
}

interface ExtendedItemInstance extends Partial<ItemInstance> {
  id: number;
  id_perangkat?: number;
  idPerangkat?: number;
  perangkat?: { id: number };
  kode_asset?: string;
  kode_unit?: string;
  status?: string;
}

interface AddDamageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddDamageModal({ isOpen, onClose, onSuccess }: AddDamageModalProps) {
  const [perangkatList, setPerangkatList] = useState<ExtendedPerangkat[]>([]);
  const [instanceList, setInstanceList] = useState<ExtendedItemInstance[]>([]);
  const [selectedPerangkatId, setSelectedPerangkatId] = useState<number | ''>('');
  const [selectedInstanceId, setSelectedInstanceId] = useState<number | ''>('');
  const [deskripsi, setDeskripsi] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Search & Dropdown State
  const [searchPerangkat, setSearchPerangkat] = useState('');
  const [isPerangkatOpen, setIsPerangkatOpen] = useState(false);
  const [searchInstance, setSearchInstance] = useState('');
  const [isInstanceOpen, setIsInstanceOpen] = useState(false);

  const pRef = useRef<HTMLDivElement>(null);
  const iRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [pData, iData] = await Promise.all([apiPerangkat.getAll(), apiItemInstance.getAll()]);
        setPerangkatList((pData as ExtendedPerangkat[]) || []);
        setInstanceList((iData as ExtendedItemInstance[]) || []);
      } catch (err) {
        console.error("Gagal memuat inventaris:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [isOpen]);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (pRef.current && !pRef.current.contains(e.target as Node)) setIsPerangkatOpen(false);
      if (iRef.current && !iRef.current.contains(e.target as Node)) setIsInstanceOpen(false);
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const resetAndClose = () => {
    setSelectedPerangkatId('');
    setSelectedInstanceId('');
    setDeskripsi('');
    setSearchPerangkat('');
    setSearchInstance('');
    onClose();
  };

  const filteredPerangkat = perangkatList.filter((p) => 
    (p.nama_perangkat || p.nama || '').toLowerCase().includes(searchPerangkat.toLowerCase())
  );

  const availableInstances = instanceList.filter((inst) => 
    Number(inst.id_perangkat || inst.idPerangkat || inst.perangkat?.id) === Number(selectedPerangkatId)
  );

  const filteredInstances = availableInstances.filter((inst) => 
    (inst.kode_asset || inst.kode_unit || `Unit #${inst.id}`).toLowerCase().includes(searchInstance.toLowerCase())
  );

  const getPerangkatLabel = () => {
    const p = perangkatList.find((item) => Number(item.id) === Number(selectedPerangkatId));
    return p ? (p.nama_perangkat || p.nama) : '-- Pilih Barang / Perangkat --';
  };

  const getInstanceLabel = () => {
    const inst = availableInstances.find((item) => Number(item.id) === Number(selectedInstanceId));
    return inst ? `${inst.kode_asset || inst.kode_unit || `Unit #${inst.id}`} (${inst.status || 'Aktif'})` : '-- Pilih Kode Unit Spesifik --';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInstanceId) return alert('Silakan pilih unit barang!');
    try {
      setIsSubmitting(true);
      await apiKerusakan.create({
        id_item_instance: Number(selectedInstanceId),
        deskripsi: deskripsi.trim(),
        status: 'butuh tindakan',
      });
      alert('Laporan kerusakan berhasil dibuat!');
      resetAndClose();
      onSuccess();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Gagal mengirim laporan';
      alert(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-on-surface/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }} className="bg-white w-full max-w-lg border border-surface-container-high rounded-xl shadow-xl p-6 space-y-4">
        <div className="flex justify-between items-center border-b border-surface-container pb-3">
          <h3 className="text-lg font-bold text-on-surface flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-error" /> Tambah Kerusakan Baru
          </h3>
          <button onClick={resetAndClose} className="text-outline hover:text-on-surface p-1 rounded-lg border border-surface-container cursor-pointer"><X className="w-5 h-5" /></button>
        </div>

        {isLoading ? (
          <div className="py-10 text-center space-y-2"><Loader2 className="w-6 h-6 animate-spin mx-auto text-primary" /><p className="text-xs text-outline font-medium">Memuat inventaris...</p></div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Select Perangkat */}
            <div className="space-y-1 relative" ref={pRef}>
              <label className="text-xs font-bold text-outline uppercase tracking-wider flex items-center gap-1"><Package className="w-3.5 h-3.5 text-primary" /> Perangkat</label>
              <div onClick={() => setIsPerangkatOpen(!isPerangkatOpen)} className="w-full px-3.5 py-2.5 border border-surface-container-high rounded-lg text-sm bg-white flex justify-between items-center cursor-pointer font-medium">
                <span className={selectedPerangkatId ? 'text-on-surface font-semibold' : 'text-outline'}>{getPerangkatLabel()}</span>
                <ChevronDown className={`w-4 h-4 text-outline transition-transform ${isPerangkatOpen ? 'rotate-180' : ''}`} />
              </div>
              {isPerangkatOpen && (
                <div className="absolute z-30 w-full mt-1 bg-white border rounded-lg shadow-lg p-2 max-h-48 overflow-hidden flex flex-col">
                  <div className="relative mb-2"><Search className="w-3.5 h-3.5 text-outline absolute left-2.5 top-2.5" /><input type="text" placeholder="Cari..." value={searchPerangkat} onChange={(e) => setSearchPerangkat(e.target.value)} className="w-full pl-8 pr-2 py-1 text-xs border rounded-md" autoFocus /></div>
                  <div className="overflow-y-auto space-y-0.5 flex-1">
                    {filteredPerangkat.map((p) => (
                      <div key={p.id} onClick={() => { setSelectedPerangkatId(p.id); setSelectedInstanceId(''); setIsPerangkatOpen(false); }} className={`px-2.5 py-1.5 text-xs rounded-md cursor-pointer flex justify-between ${Number(p.id) === Number(selectedPerangkatId) ? 'bg-primary/10 text-primary font-bold' : 'hover:bg-surface-low'}`}>
                        {p.nama_perangkat || p.nama} {Number(p.id) === Number(selectedPerangkatId) && <Check className="w-3.5 h-3.5" />}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Select Unit Instance */}
            <div className="space-y-1 relative" ref={iRef}>
              <label className="text-xs font-bold text-outline uppercase tracking-wider flex items-center gap-1"><Cpu className="w-3.5 h-3.5 text-primary" /> Kode Asset Unit</label>
              <div onClick={() => selectedPerangkatId && availableInstances.length && setIsInstanceOpen(!isInstanceOpen)} className={`w-full px-3.5 py-2.5 border border-surface-container-high rounded-lg text-sm bg-white flex justify-between items-center font-medium ${!selectedPerangkatId || !availableInstances.length ? 'bg-surface-low cursor-not-allowed opacity-60' : 'cursor-pointer'}`}>
                <span className={selectedInstanceId ? 'text-on-surface font-semibold' : 'text-outline'}>
                  {!selectedPerangkatId ? '-- Pilih Barang Dulu --' : !availableInstances.length ? 'Tidak ada unit' : getInstanceLabel()}
                </span>
                <ChevronDown className={`w-4 h-4 text-outline transition-transform ${isInstanceOpen ? 'rotate-180' : ''}`} />
              </div>
              {isInstanceOpen && selectedPerangkatId && (
                <div className="absolute z-30 w-full mt-1 bg-white border rounded-lg shadow-lg p-2 max-h-48 overflow-hidden flex flex-col">
                  <div className="relative mb-2"><Search className="w-3.5 h-3.5 text-outline absolute left-2.5 top-2.5" /><input type="text" placeholder="Cari unit..." value={searchInstance} onChange={(e) => setSearchInstance(e.target.value)} className="w-full pl-8 pr-2 py-1 text-xs border rounded-md" autoFocus /></div>
                  <div className="overflow-y-auto space-y-0.5 flex-1">
                    {filteredInstances.map((inst) => (
                      <div key={inst.id} onClick={() => { setSelectedInstanceId(inst.id); setIsInstanceOpen(false); }} className={`px-2.5 py-1.5 text-xs rounded-md cursor-pointer flex justify-between ${Number(inst.id) === Number(selectedInstanceId) ? 'bg-primary/10 text-primary font-bold' : 'hover:bg-surface-low'}`}>
                        {inst.kode_asset || inst.kode_unit || `Unit #${inst.id}`} {Number(inst.id) === Number(selectedInstanceId) && <Check className="w-3.5 h-3.5" />}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Rincian Deskripsi */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-outline uppercase tracking-wider">Deskripsi Kerusakan</label>
              <textarea required placeholder="Jelaskan detail kerusakan..." value={deskripsi} onChange={(e) => setDeskripsi(e.target.value)} className="w-full px-3.5 py-2 border rounded-lg text-sm bg-white focus:outline-none focus:border-primary h-24 resize-none font-medium" />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t">
              <button type="button" onClick={resetAndClose} className="px-4 py-2 text-xs font-bold text-secondary hover:bg-surface-low rounded-lg cursor-pointer">Batal</button>
              <button type="submit" disabled={!selectedInstanceId || isSubmitting} className="px-5 py-2 text-xs font-bold text-white bg-error hover:bg-error/90 rounded-lg cursor-pointer flex items-center gap-1.5 disabled:opacity-50">
                {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />} Kirim Laporan
              </button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
}