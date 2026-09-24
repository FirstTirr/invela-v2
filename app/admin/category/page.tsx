"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import PageAnimateWrapper from '@/components/page-animate-wrapper';
import { Trash2, Edit, Loader2, Save, X, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { apiKategori, Kategori } from '@/lib/api';

export default function ReadCategoryPage() {
  const [categories, setCategories] = useState<Kategori[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // State untuk Search & Pagination
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);

  // State untuk modal edit
  const [isEditModalOpen, setIsEditModalOpen] = useState<boolean>(false);
  const [editingCategory, setEditingCategory] = useState<Kategori | null>(null);
  const [editValue, setEditValue] = useState<string>('');
  const [actionLoading, setActionLoading] = useState<boolean>(false);

  // Ambil daftar kategori dari server
  const loadCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiKategori.getAll();
      setCategories(data);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Gagal memuat data kategori');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const initLoad = async () => {
      try {
        setError(null);
        const data = await apiKategori.getAll();
        if (isMounted) {
          setCategories(data);
        }
      } catch (err: unknown) {
        if (isMounted) {
          if (err instanceof Error) {
            setError(err.message);
          } else {
            setError('Gagal memuat data kategori');
          }
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    initLoad();

    return () => {
      isMounted = false;
    };
  }, []);

  // Filter kategori berdasarkan pencarian
  const filteredCategories = useMemo(() => {
    return categories.filter((cat) =>
      cat.kategori.toLowerCase().includes(searchQuery.toLowerCase().trim())
    );
  }, [categories, searchQuery]);

  // Hitung total halaman
  const totalPages = useMemo(() => {
    return Math.ceil(filteredCategories.length / itemsPerPage) || 1;
  }, [filteredCategories.length, itemsPerPage]);

  // Potong data sesuai halaman aktif
  const paginatedCategories = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredCategories.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredCategories, currentPage, itemsPerPage]);

  // Reset ke halaman 1 jika query pencarian atau limit per halaman berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, itemsPerPage]);

  // Buka modal edit
  const handleOpenEditModal = (cat: Kategori) => {
    setEditingCategory(cat);
    setEditValue(cat.kategori);
    setIsEditModalOpen(true);
  };

  // Tutup modal edit
  const handleCloseEditModal = () => {
    if (actionLoading) return;
    setIsEditModalOpen(false);
    setEditingCategory(null);
    setEditValue('');
  };

  // Simpan perubahan dari modal edit
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;

    const cleanValue = editValue.trim();
    if (!cleanValue) return;

    try {
      setActionLoading(true);
      await apiKategori.update(editingCategory.id, cleanValue);
      handleCloseEditModal();
      await loadCategories();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Terjadi kesalahan';
      alert(`Gagal memperbarui: ${message}`);
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
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Terjadi kesalahan';
      alert(`Gagal menghapus: ${message}`);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <PageAnimateWrapper>
      <div className="space-y-8 font-sans antialiased tracking-tight">
        <div>
          <h1 className="text-3xl font-bold text-on-surface">Kategori Spesifikasi Barang</h1>
          <p className="text-base text-on-surface-variant mt-2 font-medium">
            Pengelompokan jenis barang inventaris labor untuk mempermudah pencarian logistik.
          </p>
        </div>

        {/* Search & Limit Control Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Input Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-outline" />
            <input
              type="text"
              placeholder="Cari kategori..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 border border-surface-container-high rounded-xl text-base bg-white text-on-surface placeholder:text-outline/60 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all font-medium shadow-xs"
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

        {/* Table Section */}
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
            ) : filteredCategories.length === 0 ? (
              <div className="p-12 text-center text-outline font-medium">
                {searchQuery ? `Tidak ada kategori dengan kata kunci "${searchQuery}".` : 'Belum ada data kategori.'}
              </div>
            ) : (
              <table className="w-full text-left border-collapse text-base min-w-[400px]">
                <thead className="bg-surface-low border-b border-surface-container-high">
                  <tr>
                    <th className="p-5 text-sm font-bold text-on-surface uppercase tracking-wider">Nama Kategori</th>
                    <th className="p-5 text-sm font-bold text-on-surface uppercase tracking-wider text-right w-40">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container text-on-surface font-medium">
                  {paginatedCategories.map((cat) => (
                    <tr key={cat.id} className="hover:bg-surface-low/30 transition-colors">
                      <td className="p-5 text-base font-extrabold text-primary whitespace-nowrap">
                        {cat.kategori}
                      </td>
                      <td className="p-5 text-right whitespace-nowrap">
                        <div className="flex justify-end gap-2">
                          <button
                            disabled={actionLoading}
                            onClick={() => handleOpenEditModal(cat)}
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
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Footer Pagination Navigation */}
          {!loading && !error && filteredCategories.length > 0 && (
            <div className="p-4 border-t border-surface-container-high flex flex-col sm:flex-row items-center justify-between gap-4 bg-surface-low/50">
              <div className="text-sm font-medium text-on-surface-variant">
                Menampilkan <span className="font-bold text-on-surface">{(currentPage - 1) * itemsPerPage + 1}</span> - <span className="font-bold text-on-surface">{Math.min(currentPage * itemsPerPage, filteredCategories.length)}</span> dari <span className="font-bold text-on-surface">{filteredCategories.length}</span> kategori
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

        {/* Modal Pop-up Edit Kategori */}
        {isEditModalOpen && (
          <div className="fixed inset-0 bg-on-surface/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-md border border-surface-container-high rounded-xl shadow-2xl p-6 space-y-6 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex justify-between items-center border-b border-surface-container pb-3">
                <h3 className="text-xl font-bold text-on-surface">Edit Kategori</h3>
                <button
                  type="button"
                  onClick={handleCloseEditModal}
                  disabled={actionLoading}
                  className="text-outline hover:text-on-surface p-1.5 rounded-lg border border-surface-container cursor-pointer disabled:opacity-50"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveEdit} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-outline uppercase tracking-wider">
                    Nama Kategori
                  </label>
                  <input
                    type="text"
                    required
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    disabled={actionLoading}
                    placeholder="Masukkan nama kategori..."
                    className="w-full px-4 py-3 border border-surface-container-high rounded-xl text-base bg-white text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all duration-200 font-medium shadow-sm disabled:opacity-50"
                    autoFocus
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-surface-container">
                  <button
                    type="button"
                    disabled={actionLoading}
                    onClick={handleCloseEditModal}
                    className="px-5 py-2.5 text-base font-bold text-on-surface-variant hover:bg-surface-low rounded-xl transition-colors cursor-pointer disabled:opacity-50"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading || !editValue.trim()}
                    className="px-6 py-2.5 text-base font-bold text-white bg-primary hover:bg-primary-container active:scale-[0.98] transition-all rounded-xl shadow-sm cursor-pointer disabled:opacity-50 flex items-center gap-2"
                  >
                    {actionLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Menyimpan...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        <span>Simpan Perubahan</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </PageAnimateWrapper>
  );
}