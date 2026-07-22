// app/kabeng/items/[id]/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import PageAnimateWrapper from '@/components/page-animate-wrapper';
import { ArrowLeft, Plus, Loader2, Trash2 } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import { apiPerangkat, Perangkat } from '@/lib/api';
import { incrementKodeAsset } from '@/lib/utils-asset';

export default function ItemInstancePage() {
  const router = useRouter();
  const params = useParams();
  const itemId = Number(params.id);

  const [basePerangkat, setBasePerangkat] = useState<Perangkat | null>(null);
  const [unitInstances, setUnitInstances] = useState<Perangkat[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingUnit, setAddingUnit] = useState(false);

  const fetchInstances = async () => {
    try {
      setLoading(true);
      // Fetch detail perangkat acuan awal
      const target = await apiPerangkat.getById(itemId);
      setBasePerangkat(target);

      // Ambil seluruh perangkat untuk memfilter unit sejenis
      const allItems = await apiPerangkat.getAll();
      const group = allItems.filter(
        item => item.nama_perangkat.toLowerCase() === target.nama_perangkat.toLowerCase()
      );
      
      setUnitInstances(group);
    } catch (err) {
      console.error("Gagal mengambil data unit:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (itemId) fetchInstances();
  }, [itemId]);

  // Handler Tombol "+" (Otomatis Increment Kode Asset & Tambah Ke Backend)
  const handleAddQuickUnit = async () => {
    if (!basePerangkat || unitInstances.length === 0) return;

    try {
      setAddingUnit(true);
      
      // Ambil kode asset terakhir dari list unit yang ada
      const lastUnit = unitInstances[unitInstances.length - 1];
      const nextKodeAsset = incrementKodeAsset(lastUnit.kode_asset, 1);

      // Kirim request buat unit baru ke Backend Go
      await apiPerangkat.create({
        nama_perangkat: basePerangkat.nama_perangkat,
        kode_asset: nextKodeAsset,
        kategori_id: basePerangkat.kategori_id,
        id_jurusan: basePerangkat.id_jurusan,
        id_labor: basePerangkat.id_labor,
        status: 'aktif',
        deskripsi: basePerangkat.deskripsi
      });

      await fetchInstances();
      alert(`Berhasil menambahkan unit baru dengan Kode Asset: ${nextKodeAsset}`);
    } catch (err: any) {
      alert(`Gagal menambah unit: ${err.message}`);
    } finally {
      setAddingUnit(false);
    }
  };

  const handleDeleteUnit = async (id: number, kode: string) => {
    if (!confirm(`Hapus unit ${kode}?`)) return;
    try {
      await apiPerangkat.delete(id);
      await fetchInstances();
    } catch (err: any) {
      alert(`Gagal menghapus unit: ${err.message}`);
    }
  };

  return (
    <PageAnimateWrapper>
      <div className="space-y-6 font-sans antialiased tracking-tight">
        {/* Navigation & Header */}
        <div className="flex items-center justify-between border-b border-surface-container pb-4">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => router.push('/kabeng/items')}
              className="p-2 rounded-lg border border-surface-container hover:bg-surface-low transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-on-surface" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-on-surface">
                {loading ? 'Memuat Details...' : basePerangkat?.nama_perangkat}
              </h1>
              <p className="text-sm text-outline">
                Daftar unit instance & penomoran Kode Asset aktif ({unitInstances.length} Unit)
              </p>
            </div>
          </div>

          {/* 🔴 TOMBOL + TAMBAH UNIT DENGAN AUTO-INCREMENT 🔴 */}
          <button 
            disabled={addingUnit || loading}
            onClick={handleAddQuickUnit}
            className="px-4 py-2.5 text-sm font-bold text-white bg-primary hover:bg-primary-container rounded-lg flex items-center gap-2 shadow-sm cursor-pointer disabled:opacity-50"
          >
            {addingUnit ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
            Tambah Unit Baru (+1)
          </button>
        </div>

        {/* Tabel List Unit Instances */}
        <div className="bg-white border border-surface-container-high rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse text-base">
            <thead className="bg-surface-low border-b border-surface-container-high">
              <tr>
                <th className="p-4 text-xs font-bold text-on-surface uppercase">No</th>
                <th className="p-4 text-xs font-bold text-on-surface uppercase">Kode Asset Unit</th>
                <th className="p-4 text-xs font-bold text-on-surface uppercase text-center">Status</th>
                <th className="p-4 text-xs font-bold text-on-surface uppercase text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container font-semibold">
              {loading ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-outline">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" />
                    Memuat list unit...
                  </td>
                </tr>
              ) : unitInstances.map((unit, index) => (
                <tr key={unit.id} className="hover:bg-surface-low/30">
                  <td className="p-4 text-sm font-mono text-outline">{index + 1}</td>
                  <td className="p-4 font-mono text-base font-bold text-primary">
                    {unit.kode_asset}
                  </td>
                  <td className="p-4 text-center">
                    <span className={`inline-block px-3 py-1 rounded-md text-xs font-bold uppercase border ${
                      unit.status === 'aktif' ? 'bg-green-100 text-green-900 border-green-300' :
                      unit.status === 'perbaikan' ? 'bg-amber-100 text-amber-900 border-amber-300' : 'bg-red-100 text-red-900 border-red-300'
                    }`}>
                      {unit.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button 
                      onClick={() => handleDeleteUnit(unit.id, unit.kode_asset)}
                      className="p-2 text-outline hover:text-error hover:bg-error-container rounded-lg transition-colors"
                      title="Hapus Unit Ini"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </PageAnimateWrapper>
  );
}