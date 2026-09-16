"use client";

import React, { useEffect, useState, useCallback } from 'react';
import PageAnimateWrapper from '@/components/page-animate-wrapper';
import { Trash2, Edit, X, Save } from 'lucide-react';
import { apiKelas, apiJurusan, Kelas, Jurusan } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';

type ExtendedKelas = Kelas & {
  id_jurusan?: number;
  idJurusan?: number;
  ID_Jurusan?: number;
  IDJurusan?: number;
  IdJurusan?: number;
  jurusan_id?: number;
  JurusanId?: number;
  jurusan?: Jurusan & { nama_jurusan?: string; jurusan?: string; NamaJurusan?: string; Nama_Jurusan?: string };
  Jurusan?: Jurusan & { nama_jurusan?: string; jurusan?: string; NamaJurusan?: string; Nama_Jurusan?: string };
  dataJurusan?: Jurusan & { nama_jurusan?: string; jurusan?: string; NamaJurusan?: string; Nama_Jurusan?: string };
};

type ExtendedJurusan = Jurusan & {
  jurusan?: string;
  NamaJurusan?: string;
};

export default function ReadKelasPage() {
  const [kelasList, setKelasList] = useState<Kelas[]>([]);
  const [jurusanList, setJurusanList] = useState<Jurusan[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [isOpenEditModal, setIsOpenEditModal] = useState<boolean>(false);
  const [selectedKelas, setSelectedKelas] = useState<Kelas | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [editJurusanId, setEditJurusanId] = useState<number | ''>('');
  const [isSaving, setIsSaving] = useState<boolean>(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [kelasData, jurusanData] = await Promise.all([
        apiKelas.getAll(),
        apiJurusan.getAll()
      ]);
      setKelasList(kelasData);
      setJurusanList(jurusanData);
      setError(null);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Terjadi kesalahan sistem.');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const initData = async () => {
      try {
        const [kelasData, jurusanData] = await Promise.all([
          apiKelas.getAll(),
          apiJurusan.getAll()
        ]);
        if (isMounted) {
          setKelasList(kelasData);
          setJurusanList(jurusanData);
          setError(null);
        }
      } catch (err: unknown) {
        if (isMounted) {
          if (err instanceof Error) {
            setError(err.message);
          } else {
            setError('Terjadi kesalahan sistem.');
          }
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    initData();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus data kelas ini?')) return;
    try {
      await apiKelas.delete(id);
      setKelasList(prev => prev.filter(item => item.id !== id));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Terjadi kesalahan';
      alert(message);
    }
  };

  const handleEditClick = (item: Kelas) => {
    const extItem = item as ExtendedKelas;
    setSelectedKelas(item);
    setEditValue(item.kelas);
    const currentId = extItem.id_jurusan ?? extItem.idJurusan ?? extItem.ID_Jurusan ?? extItem.IDJurusan ?? extItem.jurusan?.id ?? extItem.Jurusan?.id ?? '';
    setEditJurusanId(currentId);
    setIsOpenEditModal(true);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedKelas || !editValue.trim() || !editJurusanId) return;

    try {
      setIsSaving(true);
      const updatedData = await apiKelas.update(selectedKelas.id, editValue.trim(), Number(editJurusanId));
      setKelasList(prev => prev.map(item => item.id === selectedKelas.id ? updatedData : item));
      setIsOpenEditModal(false);
      setSelectedKelas(null);
      await fetchData();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Gagal memperbarui kelas';
      alert(message);
    } finally {
      setIsSaving(false);
    }
  };

  // Helper untuk membaca nama jurusan secara aman dari berbagai variasi backend
  const getJurusanName = (item: Kelas) => {
    const extItem = item as ExtendedKelas;

    // 1. Cek objek relasi dari backend
    const relObj = extItem.jurusan || extItem.Jurusan || extItem.dataJurusan;
    if (relObj) {
      const name = relObj.nama_jurusan || relObj.jurusan || relObj.NamaJurusan || relObj.Nama_Jurusan;
      if (name) return name;
    }
    
    // 2. Cek ID foreign key lalu cari manual ke state jurusanList
    const targetId = 
      extItem.id_jurusan ?? 
      extItem.idJurusan ?? 
      extItem.ID_Jurusan ?? 
      extItem.IDJurusan ?? 
      extItem.IdJurusan ?? 
      extItem.jurusan_id ?? 
      extItem.JurusanId;

    if (targetId && jurusanList.length > 0) {
      const found = jurusanList.find((j) => Number(j.id) === Number(targetId));
      if (found) {
        const extFound = found as ExtendedJurusan;
        return found.nama_jurusan || extFound.jurusan || extFound.NamaJurusan || '-';
      }
    }
    
    return '-';
  };

  return (
    <PageAnimateWrapper>
      <div className="space-y-8 font-sans antialiased tracking-tight">
        <div>
          <h1 className="text-3xl font-bold text-on-surface">Data Kelas</h1>
          <p className="text-base text-on-surface-variant mt-2 font-medium">Daftar kelas yang terdaftar dalam cakupan hak akses peminjaman alat labor.</p>
        </div>

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
                    <th className="p-5 text-sm font-bold text-on-surface uppercase tracking-wider">Program Keahlian (Jurusan)</th>
                    <th className="p-5 text-sm font-bold text-on-surface uppercase tracking-wider text-right w-32">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container text-on-surface font-semibold">
                  {kelasList.map((item) => (
                    <tr key={item.id} className="hover:bg-surface-low/30 transition-colors">
                      <td className="p-5 text-base font-extrabold text-primary whitespace-nowrap">
                        {item.kelas}
                      </td>
                      <td className="p-5 text-base font-medium text-outline whitespace-nowrap">
                        {getJurusanName(item)}
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

        <AnimatePresence>
          {isOpenEditModal && selectedKelas && (
            <div className="fixed inset-0 bg-on-surface/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                className="bg-white w-full max-w-md border border-surface-container-high rounded-xl shadow-xl p-6 space-y-5"
              >
                <div className="flex justify-between items-center border-b border-surface-container pb-3">
                  <h3 className="text-lg font-bold text-on-surface">Ubah Identitas Kelas</h3>
                  <button 
                    onClick={() => setIsOpenEditModal(false)} 
                    className="text-outline hover:text-on-surface p-1.5 rounded-lg border border-surface-container cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleUpdate} className="space-y-4">
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

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-outline uppercase tracking-wider">Program Keahlian (Jurusan)</label>
                    <select
                      required
                      disabled={isSaving}
                      value={editJurusanId}
                      onChange={(e) => setEditJurusanId(Number(e.target.value))}
                      className="w-full px-4 py-3 border border-surface-container-high rounded-lg text-base text-on-surface bg-white focus:outline-none focus:border-primary font-medium shadow-sm cursor-pointer"
                    >
                      <option value="">-- Pilih Jurusan --</option>
                      {jurusanList.map((j) => {
                        const extJ = j as ExtendedJurusan;
                        return (
                          <option key={j.id} value={j.id}>{j.nama_jurusan || extJ.jurusan}</option>
                        );
                      })}
                    </select>
                  </div>

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