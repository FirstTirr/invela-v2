"use client";

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import PageAnimateWrapper from '@/components/page-animate-wrapper';
import { Trash2, Edit, Loader2, RefreshCw, Search, X, Save, ChevronLeft, ChevronRight } from 'lucide-react';
import { apiLabor, apiJurusan, Labor, Jurusan } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';

type ExtendedLabor = Labor & {
  id_jurusan?: number;
  idJurusan?: number;
  ID_Jurusan?: number;
  IDJurusan?: number;
  jurusan_id?: number;
  jurusan?: Jurusan & { nama_jurusan?: string; jurusan?: string; NamaJurusan?: string };
  Jurusan?: Jurusan & { nama_jurusan?: string; jurusan?: string; NamaJurusan?: string };
};

type ExtendedJurusan = Jurusan & {
  jurusan?: string;
  NamaJurusan?: string;
};

export default function ReadLaborPage() {
  const [labors, setLabors] = useState<Labor[]>([]);
  const [jurusanList, setJurusanList] = useState<Jurusan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State Search & Pagination
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);

  // Modal State
  const [editingLabor, setEditingLabor] = useState<Labor | null>(null);
  const [editValue, setEditValue] = useState('');
  const [editJurusanId, setEditJurusanId] = useState<string | number>('');
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [laborData, jurusanData] = await Promise.all([
        apiLabor.getAll(),
        apiJurusan.getAll()
      ]);
      setLabors(laborData);
      setJurusanList(jurusanData);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Gagal memuat data labor');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const initFetch = async () => {
      try {
        setError(null);
        const [laborData, jurusanData] = await Promise.all([
          apiLabor.getAll(),
          apiJurusan.getAll()
        ]);
        if (isMounted) {
          setLabors(laborData);
          setJurusanList(jurusanData);
        }
      } catch (err: unknown) {
        if (isMounted) {
          if (err instanceof Error) {
            setError(err.message);
          } else {
            setError('Gagal memuat data labor');
          }
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    initFetch();

    return () => {
      isMounted = false;
    };
  }, []);

  // Helper untuk mendapatkan nama jurusan secara presisi
  const getJurusanName = useCallback((labor: Labor) => {
    const extLabor = labor as ExtendedLabor;
    const targetId = labor.id_jurusan ?? labor.idJurusan ?? labor.ID_Jurusan ?? extLabor.IDJurusan ?? extLabor.jurusan_id ?? labor.jurusan?.id ?? labor.Jurusan?.id;

    if (targetId !== undefined && targetId !== null && jurusanList.length > 0) {
      const found = jurusanList.find((j) => String(j.id) === String(targetId));
      if (found) {
        const extFound = found as ExtendedJurusan;
        return found.nama_jurusan || extFound.jurusan || extFound.NamaJurusan || '-';
      }
    }

    const relObj = extLabor.jurusan || extLabor.Jurusan;
    if (relObj) {
      const name = relObj.nama_jurusan || relObj.jurusan || relObj.NamaJurusan;
      if (name) return name;
    }
    
    return '-';
  }, [jurusanList]);

  // Filter data laboratorium berdasarkan nama labor & jurusan
  const filteredLabors = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return labors;

    return labors.filter((item) => {
      const laborName = item.labor.toLowerCase();
      const jurusanName = getJurusanName(item).toLowerCase();
      return laborName.includes(q) || jurusanName.includes(q);
    });
  }, [labors, searchQuery, getJurusanName]);

  // Hitung total halaman
  const totalPages = useMemo(() => {
    return Math.ceil(filteredLabors.length / itemsPerPage) || 1;
  }, [filteredLabors.length, itemsPerPage]);

  // Potong data sesuai halaman aktif
  const paginatedLabors = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredLabors.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredLabors, currentPage, itemsPerPage]);

  // Reset ke halaman 1 ketika pencarian atau limit per halaman berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, itemsPerPage]);

  const handleDelete = async (id: number, nama: string) => {
    if (!confirm(`Yakin ingin menghapus [${nama}]?`)) return;

    try {
      await apiLabor.delete(id);
      setLabors((prev) => prev.filter((item) => item.id !== id));
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Terjadi kesalahan';
      alert(`Gagal menghapus: ${message}`);
    }
  };

  const handleOpenEdit = (labor: Labor) => {
    const extLabor = labor as ExtendedLabor;
    setEditingLabor(labor);
    setEditValue(labor.labor);
    const currentId = labor.id_jurusan ?? labor.idJurusan ?? labor.ID_Jurusan ?? extLabor.IDJurusan ?? labor.jurusan?.id ?? labor.Jurusan?.id ?? '';
    setEditJurusanId(currentId);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLabor) return;

    try {
      setIsUpdating(true);
      await apiLabor.update(editingLabor.id, editValue, Number(editJurusanId));
      await fetchData();
      setEditingLabor(null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Terjadi kesalahan';
      alert(`Gagal memperbarui: ${message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <PageAnimateWrapper>
      <div className="space-y-8 font-sans antialiased tracking-tight">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-on-surface">Data Laboratorium</h1>
            <p className="text-base text-on-surface-variant mt-2 font-medium">Daftar seluruh ruang laboratorium yang aktif digunakan untuk kegiatan praktikum harian.</p>
          </div>
          <button
            onClick={fetchData}
            className="p-2 border border-surface-container-high rounded-xl hover:bg-surface-low text-on-surface transition-all cursor-pointer"
            title="Refresh Data"
          >
            <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Control Section: Search & Items Per Page */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Input Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-outline" />
            <input
              type="text"
              placeholder="Cari nama labor atau jurusan..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-10 py-2.5 border border-surface-container-high rounded-xl text-base bg-white text-on-surface placeholder:text-outline/60 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all font-medium shadow-xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Selector Items Per Page */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <span className="text-sm font-semibold text-on-surface-variant">Tampilkan:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => setItemsPerPage(Number(e.target.value))}
              className="px-3 py-2 border border-surface-container-high rounded-xl text-sm font-bold bg-white text-on-surface focus:outline-none focus:border-primary shadow-xs cursor-pointer"
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={30}>30</option>
              <option value={50}>50</option>
            </select>
            <span className="text-sm font-semibold text-on-surface-variant">data</span>
          </div>
        </div>

        {/* Tabel Data Laboratorium */}
        <div className="bg-white border border-surface-container-high rounded-xl overflow-hidden shadow-sm w-full">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse text-base min-w-[300px]">
              <thead className="bg-surface-low border-b border-surface-container-high">
                <tr>
                  <th className="p-5 text-sm font-bold text-on-surface uppercase tracking-wider">Nama Labor</th>
                  <th className="p-5 text-sm font-bold text-on-surface uppercase tracking-wider">Program Keahlian (Jurusan)</th>
                  <th className="p-5 text-sm font-bold text-on-surface uppercase tracking-wider text-right w-32">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container text-on-surface font-medium">
                {loading ? (
                  <tr>
                    <td colSpan={3} className="p-8 text-center text-outline">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                      Memuat data laboratorium...
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={3} className="p-8 text-center text-error font-bold">
                      {error}
                    </td>
                  </tr>
                ) : filteredLabors.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="p-8 text-center text-outline font-medium">
                      {searchQuery ? `Tidak ada laboratorium dengan kata kunci "${searchQuery}".` : 'Belum ada data laboratorium.'}
                    </td>
                  </tr>
                ) : (
                  paginatedLabors.map((labor) => (
                    <tr key={labor.id} className="hover:bg-surface-low/30 transition-colors">
                      <td className="p-5 text-base font-extrabold text-on-surface whitespace-nowrap">
                        {labor.labor}
                      </td>
                      <td className="p-5 text-base font-semibold text-outline whitespace-nowrap">
                        {getJurusanName(labor)}
                      </td>
                      <td className="p-5 text-right flex justify-end gap-2 whitespace-nowrap">
                        <button
                          onClick={() => handleOpenEdit(labor)}
                          className="p-2 text-outline hover:text-primary hover:bg-secondary-container rounded-lg transition-colors cursor-pointer"
                          title="Edit Laboratorium"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(labor.id, labor.labor)}
                          className="p-2 text-outline hover:text-error hover:bg-error-container/40 rounded-lg transition-colors cursor-pointer"
                          title="Hapus Laboratorium"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Navigasi Pagination */}
          {!loading && !error && filteredLabors.length > 0 && (
            <div className="p-4 border-t border-surface-container-high flex flex-col sm:flex-row items-center justify-between gap-4 bg-surface-low/50">
              <div className="text-sm font-medium text-on-surface-variant">
                Menampilkan <span className="font-bold text-on-surface">{(currentPage - 1) * itemsPerPage + 1}</span> - <span className="font-bold text-on-surface">{Math.min(currentPage * itemsPerPage, filteredLabors.length)}</span> dari <span className="font-bold text-on-surface">{filteredLabors.length}</span> laboratorium
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-lg border border-surface-container-high hover:bg-surface-low text-on-surface transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  title="Halaman Sebelumnya"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-1 px-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-1.5 rounded-lg text-sm font-bold transition-all cursor-pointer ${
                        currentPage === page
                          ? 'bg-primary text-white shadow-xs'
                          : 'hover:bg-surface-low text-on-surface-variant'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-lg border border-surface-container-high hover:bg-surface-low text-on-surface transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                  title="Halaman Selanjutnya"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Edit */}
        <AnimatePresence>
          {editingLabor && (
            <div className="fixed inset-0 bg-on-surface/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                className="bg-white w-full max-w-md border border-surface-container-high rounded-xl shadow-xl p-6 space-y-5"
              >
                <div className="flex justify-between items-center border-b border-surface-container pb-3">
                  <h3 className="text-lg font-bold text-on-surface">Ubah Data Laboratorium</h3>
                  <button 
                    onClick={() => setEditingLabor(null)} 
                    className="text-outline hover:text-on-surface p-1.5 rounded-lg border border-surface-container cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleUpdate} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-outline uppercase tracking-wider">Nama Laboratorium</label>
                    <input
                      type="text"
                      required
                      disabled={isUpdating}
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      placeholder="Contoh: Labor RPL 1"
                      className="w-full px-4 py-3 border border-surface-container-high rounded-lg text-base text-on-surface bg-white focus:outline-none focus:border-primary font-bold shadow-sm"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-outline uppercase tracking-wider">Program Keahlian (Jurusan)</label>
                    <select
                      required
                      disabled={isUpdating}
                      value={editJurusanId}
                      onChange={(e) => setEditJurusanId(e.target.value)}
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
                      disabled={isUpdating}
                      onClick={() => setEditingLabor(null)}
                      className="px-5 py-2.5 text-sm font-bold text-secondary hover:bg-surface-low rounded-lg cursor-pointer"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={isUpdating}
                      className="px-6 py-2.5 text-sm font-bold text-white bg-primary hover:bg-primary-container rounded-lg cursor-pointer shadow-sm flex items-center gap-2"
                    >
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