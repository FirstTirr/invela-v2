"use client";

import React, { useEffect, useState } from 'react';
import PageAnimateWrapper from '@/components/page-animate-wrapper';
import { Trash2, Edit, X, Save } from 'lucide-react';
import { apiKelas, Kelas } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';

export default function ReadKelasPage() {
  const [kelasList, setKelasList] = useState<Kelas[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // State untuk menangani modal pop-up edit
  const [isOpenEditModal, setIsOpenEditModal] = useState<boolean>(false);
  const [selectedKelas, setSelectedKelas] = useState<Kelas | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);

  // Fetch data dari API Go saat halaman dimuat
  const fetchKelas = async () => {
    try {
      setLoading(true);
      const data = await apiKelas.getAll();
      setKelasList(data);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Terjadi kesalahan sistem.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchKelas();
  }, []);

  // Handler Hapus Data
  const handleDelete = async (id: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus data kelas ini?')) return;
    try {
      await apiKelas.delete(id);
      setKelasList(prev => prev.filter(item => item.id !== id));
    } catch (err: any) {
      alert(err.message);
    }
  };

  // Membuka modal edit dan set data yang dipilih
  const handleEditClick = (item: Kelas) => {
    setSelectedKelas(item);
    setEditValue(item.kelas);
    setIsOpenEditModal(true);
  };

  // Menyimpan perubahan data kelas ke backend Go via Pop-up
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedKelas || !editValue.trim()) return;

    try {
      setIsSaving(true);
      const updatedData = await apiKelas.update(selectedKelas.id, editValue.trim());
      setKelasList(prev => prev.map(item => item.id === selectedKelas.id ? updatedData : item));
      setIsOpenEditModal(false);
      setSelectedKelas(null);
    } catch (err: any) {
      alert(err.message || 'Gagal memperbarui kelas');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <PageAnimateWrapper>
      <div className="space-y-8 font-sans antialiased tracking-tight">
        <div>
          <h1 className="text-3xl font-bold text-on-surface">Data Kelas</h1>
          <p className="text-base text-on-surface-variant mt-2 font-medium">Daftar kelas yang terdaftar dalam cakupan hak akses peminjaman alat labor.</p>
        </div>

        {/* Tabel Data Kelas */}
        <div className="bg-white border border-surface-container-high rounded-xl overflow-hidden shadow-sm w-full">
          <div className="overflow-x-auto w-full">
            {loading ? (
              <div className="p-8 text-center text-base text-outline font-bold">Sinkronisasi dengan database backend...</div>
            ) : error ? (
              <div className="p-8 text-center text-base text-error font-bold">Gagal memuat data: {error}</div>
            ) : kelasList.length === 0 ? (
              <div className="p-8 text-center text-base text-outline font-bold">Belum ada data kelas di database master.</div>
            ) : (
              <table className="w-full text-left border-collapse text-base min-w-[300px]">
                <thead className="bg-surface-low border-b border-surface-container-high">
                  <tr>
                    <th className="p-5 text-sm font-bold text-on-surface uppercase tracking-wider">Nama Kelas</th>
                    <th className="p-5 text-sm font-bold text-on-surface uppercase tracking-wider text-right w-32">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container text-on-surface font-semibold">
                  {kelasList.map((item) => (
                    <tr key={item.id} className="hover:bg-surface-low/30 transition-colors">
                      <td className="p-5 text-base font-extrabold text-primary whitespace-nowrap">
                        {item.kelas}
                      </td>
                      <td className="p-5 text-right flex justify-end gap-2 whitespace-nowrap">
                        <button 
                          onClick={() => handleEditClick(item)}
                          className="p-2 text-outline hover:text-primary hover:bg-secondary-container rounded-lg transition-colors cursor-pointer"
                          title="Edit Kelas"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => handleDelete(item.id)}
                          className="p-2 text-outline hover:text-error hover:bg-error-container/40 rounded-lg transition-colors cursor-pointer"
                          title="Hapus Kelas"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* 💻 POP-UP MODAL EDIT KELAS */}
        <AnimatePresence>
          {isOpenEditModal && selectedKelas && (
            <div className="fixed inset-0 bg-on-surface/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                className="bg-white w-full max-w-md border border-surface-container-high rounded-xl shadow-xl p-6 space-y-5"
              >
                {/* Modal Header */}
                <div className="flex justify-between items-center border-b border-surface-container pb-3">
                  <h3 className="text-lg font-bold text-on-surface">Ubah Identitas Kelas</h3>
                  <button 
                    onClick={() => setIsOpenEditModal(false)} 
                    className="text-outline hover:text-on-surface p-1.5 rounded-lg border border-surface-container cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Modal Form Content */}
                <form onSubmit={handleUpdate} className="space-y-5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-outline uppercase tracking-wider">Nama Rombel Kelas</label>
                    <input 
                      type="text" 
                      required
                      disabled={isSaving}
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      placeholder="Contoh: XI PPLG 2" 
                      className="w-full px-4 py-3 border border-surface-container-high rounded-lg text-base text-on-surface bg-white focus:outline-none focus:border-primary font-bold shadow-sm"
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-end gap-3 pt-3 border-t border-surface-container">
                    <button 
                      type="button"
                      disabled={isSaving}
                      onClick={() => setIsOpenEditModal(false)} 
                      className="px-5 py-2.5 text-sm font-bold text-secondary hover:bg-surface-low rounded-lg cursor-pointer"
                    >
                      Batal
                    </button>
                    <button 
                      type="submit"
                      disabled={isSaving}
                      className="px-6 py-2.5 text-sm font-bold text-white bg-primary hover:bg-primary-container rounded-lg cursor-pointer shadow-sm flex items-center gap-2"
                    >
                      <Save className="w-4 h-4" /> {isSaving ? 'Menyimpan...' : 'Simpan Perubahan'}
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