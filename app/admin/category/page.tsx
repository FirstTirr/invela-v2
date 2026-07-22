"use client";

import React, { useState, useEffect } from 'react';
import PageAnimateWrapper from '@/components/page-animate-wrapper';
import { Trash2, Edit, Loader2, Save, X } from 'lucide-react';
import { apiKategori, Kategori } from '@/lib/api';

export default function ReadCategoryPage() {
  const [categories, setCategories] = useState<Kategori[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // State untuk edit inline
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  // Ambil daftar kategori dari server
  const loadCategories = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiKategori.getAll();
      setCategories(data);
    } catch (err: any) {
      setError(err.message || 'Gagal memuat data kategori');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  // Mulai proses edit
  const handleStartEdit = (cat: Kategori) => {
    setEditingId(cat.id);
    setEditValue(cat.kategori);
  };

  // Simpan perubahan edit
  const handleSaveEdit = async (id: number) => {
    const cleanValue = editValue.trim();
    if (!cleanValue) return;

    try {
      setActionLoading(true);
      await apiKategori.update(id, cleanValue);
      setEditingId(null);
      await loadCategories();
    } catch (err: any) {
      alert(`Gagal memperbarui: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  // Hapus data kategori
  const handleDelete = async (id: number, nama: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus kategori "${nama}"?`)) return;

    try {
      setActionLoading(true);
      await apiKategori.delete(id);
      await loadCategories();
    } catch (err: any) {
      alert(`Gagal menghapus: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <PageAnimateWrapper>
      <div className="space-y-8 font-sans antialiased tracking-tight">
        <div>
          <h1 className="text-3xl font-bold text-on-surface">Kategori Spesifikasi Barang</h1>
          <p className="text-base text-on-surface-variant mt-2 font-medium">Pengelompokan jenis barang inventaris labor untuk mempermudah pencarian logistik.</p>
        </div>

        <div className="bg-white border border-surface-container-high rounded-xl overflow-hidden shadow-sm w-full">
          <div className="overflow-x-auto w-full">
            {loading ? (
              <div className="p-12 text-center text-outline font-bold flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin text-primary" />
                <span>Memuat data kategori dari server...</span>
              </div>
            ) : error ? (
              <div className="p-8 text-center text-error font-semibold bg-error-container/20">
                {error}
              </div>
            ) : categories.length === 0 ? (
              <div className="p-12 text-center text-outline font-medium">
                Belum ada data kategori. Tambahkan melalui halaman Registrasi Master.
              </div>
            ) : (
              <table className="w-full text-left border-collapse text-base min-w-[400px]">
                <thead className="bg-surface-low border-b border-surface-container-high">
                  <tr>
                    <th className="p-5 text-sm font-bold text-on-surface uppercase tracking-wider">ID</th>
                    <th className="p-5 text-sm font-bold text-on-surface uppercase tracking-wider">Nama Kategori</th>
                    <th className="p-5 text-sm font-bold text-on-surface uppercase tracking-wider text-right w-40">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container text-on-surface font-medium">
                  {categories.map((cat) => (
                    <tr key={cat.id} className="hover:bg-surface-low/30 transition-colors">
                      <td className="p-5 text-sm font-mono font-bold text-outline w-20">#{cat.id}</td>
                      <td className="p-5 text-base font-extrabold text-primary whitespace-nowrap">
                        {editingId === cat.id ? (
                          <input
                            type="text"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            disabled={actionLoading}
                            className="px-3 py-1.5 border border-primary rounded-lg text-base font-semibold focus:outline-none w-full max-w-xs"
                            autoFocus
                          />
                        ) : (
                          cat.kategori
                        )}
                      </td>
                      <td className="p-5 text-right whitespace-nowrap">
                        {editingId === cat.id ? (
                          <div className="flex justify-end gap-2">
                            <button
                              disabled={actionLoading}
                              onClick={() => handleSaveEdit(cat.id)}
                              className="p-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors cursor-pointer"
                              title="Simpan"
                            >
                              <Save className="w-5 h-5" />
                            </button>
                            <button
                              disabled={actionLoading}
                              onClick={() => setEditingId(null)}
                              className="p-2 text-outline hover:bg-surface-low rounded-lg transition-colors cursor-pointer"
                              title="Batal"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex justify-end gap-2">
                            <button
                              disabled={actionLoading}
                              onClick={() => handleStartEdit(cat)}
                              className="p-2 text-outline hover:text-primary hover:bg-secondary-container rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                              title="Edit Kategori"
                            >
                              <Edit className="w-5 h-5" />
                            </button>
                            <button
                              disabled={actionLoading}
                              onClick={() => handleDelete(cat.id, cat.kategori)}
                              className="p-2 text-outline hover:text-error hover:bg-error-container/40 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                              title="Hapus Kategori"
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </PageAnimateWrapper>
  );
}