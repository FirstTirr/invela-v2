"use client";

import React, { useEffect, useState } from 'react';
import PageAnimateWrapper from '@/components/page-animate-wrapper';
import { Trash2, Edit, Loader2, RefreshCw, X, Save } from 'lucide-react';
import { apiJurusan, Jurusan } from '@/lib/api/jurusan';
import { motion, AnimatePresence } from 'framer-motion';

export default function ReadJurusanPage() {
  const [jurusanList, setJurusanList] = useState<Jurusan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal State
  const [isOpenEditModal, setIsOpenEditModal] = useState(false);
  const [selectedJurusan, setSelectedJurusan] = useState<Jurusan | null>(null);
  const [editValue, setEditValue] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchJurusan = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiJurusan.getAll();
      setJurusanList(data);
    } catch (err: any) {
      setError(err.message || 'Gagal memuat data jurusan');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJurusan();
  }, []);

  const handleDelete = async (id: number, nama: string) => {
    if (!confirm(`Yakin ingin menghapus [${nama}]?`)) return;
    try {
      await apiJurusan.delete(id);
      setJurusanList((prev) => prev.filter((item) => item.id !== id));
    } catch (err: any) {
      alert(`Gagal menghapus: ${err.message}`);
    }
  };

  const handleOpenEdit = (jurusan: Jurusan) => {
    setSelectedJurusan(jurusan);
    setEditValue(jurusan.nama_jurusan || (jurusan as any).jurusan || '');
    setIsOpenEditModal(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedJurusan) return;

    try {
      setIsUpdating(true);
      const updated = await apiJurusan.update(selectedJurusan.id, editValue);
      setJurusanList((prev) =>
        prev.map((item) => (item.id === selectedJurusan.id ? updated : item))
      );
      setIsOpenEditModal(false);
    } catch (err: any) {
      alert(`Gagal memperbarui: ${err.message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <PageAnimateWrapper>
      <div className="space-y-8 font-sans antialiased tracking-tight">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-on-surface">Data Program Keahlian</h1>
            <p className="text-base text-on-surface-variant mt-2 font-medium">Daftar jurusan resmi yang menaungi rombel kelas.</p>
          </div>
          <button
            onClick={fetchJurusan}
            className="p-2 border border-surface-container-high rounded-xl hover:bg-surface-low text-on-surface transition-all"
            title="Refresh Data"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="bg-white border border-surface-container-high rounded-xl overflow-hidden shadow-sm w-full">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse text-base min-w-[300px]">
              <thead className="bg-surface-low border-b border-surface-container-high">
                <tr>
                  <th className="p-5 text-sm font-bold text-on-surface uppercase tracking-wider">Nama Jurusan</th>
                  <th className="p-5 text-sm font-bold text-on-surface uppercase tracking-wider text-right w-32">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container text-on-surface font-medium">
                {loading ? (
                  <tr>
                    <td colSpan={2} className="p-8 text-center text-outline">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                      Memuat data jurusan...
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={2} className="p-8 text-center text-error">{error}</td>
                  </tr>
                ) : jurusanList.length === 0 ? (
                  <tr>
                    <td colSpan={2} className="p-8 text-center text-outline">Belum ada data jurusan.</td>
                  </tr>
                ) : (
                  jurusanList.map((j) => {
                    const displayName = j.nama_jurusan || (j as any).jurusan || '';
                    return (
                      <tr key={j.id} className="hover:bg-surface-low/30 transition-colors">
                        <td className="p-5 text-base font-extrabold text-on-surface whitespace-nowrap">
                          {displayName}
                        </td>
                        <td className="p-5 text-right flex justify-end gap-2 whitespace-nowrap">
                          <button
                            onClick={() => handleOpenEdit(j)}
                            className="p-2 text-outline hover:text-primary hover:bg-secondary-container rounded-lg transition-colors cursor-pointer"
                          >
                            <Edit className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(j.id, displayName)}
                            className="p-2 text-outline hover:text-error hover:bg-error-container/40 rounded-lg transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal Edit */}
        <AnimatePresence>
          {isOpenEditModal && (
            <div className="fixed inset-0 bg-on-surface/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                className="bg-white w-full max-w-md border border-surface-container-high rounded-xl shadow-xl p-6 space-y-5"
              >
                <div className="flex justify-between items-center border-b border-surface-container pb-3">
                  <h3 className="text-lg font-bold text-on-surface">Ubah Data Jurusan</h3>
                  <button onClick={() => setIsOpenEditModal(false)} className="text-outline hover:text-on-surface p-1.5 rounded-lg border border-surface-container">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <form onSubmit={handleUpdate} className="space-y-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-outline uppercase tracking-wider">Nama / Singkatan Jurusan</label>
                    <input 
                      type="text" 
                      required
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      className="w-full px-4 py-3 border border-surface-container-high rounded-lg text-base text-on-surface bg-white focus:outline-none focus:border-primary font-bold shadow-sm"
                    />
                  </div>
                  <div className="flex justify-end gap-3 pt-3 border-t border-surface-container">
                    <button type="button" onClick={() => setIsOpenEditModal(false)} className="px-5 py-2.5 text-sm font-bold text-secondary hover:bg-surface-low rounded-lg cursor-pointer">
                      Batal
                    </button>
                    <button type="submit" disabled={isUpdating} className="px-6 py-2.5 text-sm font-bold text-white bg-primary hover:bg-primary-container rounded-lg cursor-pointer shadow-sm flex items-center gap-2">
                      <Save className="w-4 h-4" /> {isUpdating ? 'Menyimpan...' : 'Simpan Perubahan'}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </PageAnimateWrapper>
  );
}