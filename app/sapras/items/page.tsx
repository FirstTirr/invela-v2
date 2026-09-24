"use client";

import React, { useEffect, useState, useMemo } from 'react';
import PageAnimateWrapper from '@/components/page-animate-wrapper';
import { Loader2, Package, Search, Eye, X, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { apiPerangkat } from '@/lib/api/perangkat';
import { apiItemInstance, ItemInstance } from '@/lib/api/item-instance';
import { apiLabor, Labor } from '@/lib/api/labor';
import { apiKategori, Kategori } from '@/lib/api/kategori';

interface DisplayItem {
  id: number;
  namaPerangkat: string;
  sampleKodeAsset: string;
  deskripsi: string;
  labor: string;
  idLabor: number;
  jurusan: string;
  kategori: string;
  idKategori: number;
  jumlahStok: number;
  instances: ItemInstance[];
}

// Helper membatasi maksimal 2 baris enter
const formatPreviewDeskripsi = (text: string) => {
  if (!text) return { previewText: '', isTruncated: false };
  const lines = text.split('\n');
  const isTruncated = lines.length > 2;
  const previewText = lines.slice(0, 2).join('\n') + (isTruncated ? '...' : '');
  return { previewText, isTruncated };
};

export default function SaprasItemsPage() {
  const [items, setItems] = useState<DisplayItem[]>([]);
  const [laborOptions, setLaborOptions] = useState<Labor[]>([]);
  const [kategoriOptions, setKategoriOptions] = useState<Kategori[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  // State Filter & Search
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedLabor, setSelectedLabor] = useState<string>('semua');
  const [selectedKategori, setSelectedKategori] = useState<string>('semua');

  // State Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);

  // State untuk Modal Lihat Unit
  const [selectedItem, setSelectedItem] = useState<DisplayItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // State Pop-up Modal Deskripsi Full
  const [selectedDeskripsi, setSelectedDeskripsi] = useState<{ nama: string; deskripsi: string } | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError('');

        const [
          perangkatList,
          instanceList,
          laborList,
          kategoriList
        ] = await Promise.all([
          apiPerangkat.getAll().catch(() => []),
          apiItemInstance.getAll().catch(() => []),
          apiLabor.getAll().catch(() => []),
          apiKategori.getAll().catch(() => [])
        ]);

        setLaborOptions(laborList || []);
        setKategoriOptions(kategoriList || []);

        const combined: DisplayItem[] = perangkatList.map((p) => {
          const matchingInstances = instanceList.filter(
            (inst) => Number(inst.id_perangkat) === Number(p.id)
          );

          const sampleKode = matchingInstances.length > 0 && matchingInstances[0].kode_asset
            ? matchingInstances[0].kode_asset
            : 'Belum ada unit';

          const foundLabor = laborList.find((l) => Number(l.id) === Number(p.id_labor));
          const namaLabor = foundLabor ? foundLabor.labor : `Labor #${p.id_labor}`;

          const foundKategori = kategoriList.find((k) => Number(k.id) === Number(p.kategori_id));
          const namaKategori = foundKategori ? foundKategori.kategori : `Kategori #${p.kategori_id}`;

          return {
            id: p.id,
            namaPerangkat: p.nama_perangkat || 'Tanpa Nama',
            sampleKodeAsset: sampleKode,
            deskripsi: p.deskripsi || '',
            labor: namaLabor,
            idLabor: Number(p.id_labor),
            jurusan: 'RPL',
            kategori: namaKategori,
            idKategori: Number(p.kategori_id),
            jumlahStok: matchingInstances.length,
            instances: matchingInstances
          };
        });

        setItems(combined);
      } catch (err) {
        console.error("Gagal memuat inventaris:", err);
        const message = err instanceof Error ? err.message : 'Gagal memuat data inventaris';
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleOpenModal = (item: DisplayItem) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
  };

  // Process Filtering Data
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const query = searchQuery.toLowerCase();
      const matchesSearch =
        item.namaPerangkat.toLowerCase().includes(query) ||
        item.sampleKodeAsset.toLowerCase().includes(query) ||
        item.kategori.toLowerCase().includes(query) ||
        item.labor.toLowerCase().includes(query);

      const matchesLabor =
        selectedLabor === 'semua' || item.idLabor === Number(selectedLabor);

      const matchesKategori =
        selectedKategori === 'semua' || item.idKategori === Number(selectedKategori);

      return matchesSearch && matchesLabor && matchesKategori;
    });
  }, [items, searchQuery, selectedLabor, selectedKategori]);

  // Reset Halaman ke 1 saat pencarian/filter berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedLabor, selectedKategori, itemsPerPage]);

  // Pagination Calculations
  const totalPages = Math.ceil(filteredItems.length / itemsPerPage) || 1;

  const currentItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredItems.slice(start, start + itemsPerPage);
  }, [filteredItems, currentPage, itemsPerPage]);

  const startIndex = (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(currentPage * itemsPerPage, filteredItems.length);

  return (
    <PageAnimateWrapper>
      <div className="space-y-6 font-sans antialiased tracking-tight">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-on-surface">Daftar Inventaris Perangkat</h1>
          <p className="text-base text-on-surface-variant mt-1 font-medium">
            Monitoring data aset perangkat dan jumlah unit laboratorium sekolah.
          </p>
        </div>

        {/* Input Pencarian & Dropdown Filter */}
        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between bg-white p-4 rounded-xl border border-surface-container-high shadow-xs">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-outline absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari nama perangkat / kode asset..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-surface-container-high rounded-xl bg-white text-on-surface focus:outline-none focus:border-primary font-medium"
            />
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Filter className="w-4 h-4 text-outline shrink-0" />
              <select
                value={selectedLabor}
                onChange={(e) => setSelectedLabor(e.target.value)}
                className="w-full sm:w-auto px-3 py-2 text-sm border border-surface-container-high rounded-xl focus:outline-none focus:border-primary bg-white font-medium text-on-surface cursor-pointer"
              >
                <option value="semua">Semua Labor</option>
                {laborOptions.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.labor}
                  </option>
                ))}
              </select>
            </div>

            <select
              value={selectedKategori}
              onChange={(e) => setSelectedKategori(e.target.value)}
              className="w-full sm:w-auto px-3 py-2 text-sm border border-surface-container-high rounded-xl focus:outline-none focus:border-primary bg-white font-medium text-on-surface cursor-pointer"
            >
              <option value="semua">Semua Kategori</option>
              {kategoriOptions.map((k) => (
                <option key={k.id} value={k.id}>
                  {k.kategori}
                </option>
              ))}
            </select>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-sm font-semibold rounded-xl">
            {error}
          </div>
        )}

        {/* Tabel Utama */}
        <div className="bg-white border border-surface-container-high rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse text-base min-w-[800px]">
              <thead className="bg-surface-low border-b border-surface-container-high">
                <tr>
                  <th className="p-4 text-xs font-bold uppercase w-12 text-center text-on-surface">NO</th>
                  <th className="p-5 text-sm font-bold text-on-surface uppercase tracking-wider">NAMA PERANGKAT</th>
                  <th className="p-5 text-sm font-bold text-on-surface uppercase tracking-wider">LABOR</th>
                  <th className="p-5 text-sm font-bold text-on-surface uppercase tracking-wider">KATEGORI</th>
                  <th className="p-5 text-sm font-bold text-on-surface uppercase tracking-wider text-center">JUMLAH STOK UNIT</th>
                  <th className="p-5 text-sm font-bold text-on-surface uppercase tracking-wider text-right">AKSI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container text-on-surface font-medium">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-outline">
                      <Loader2 className="w-6 h-6 animate-spin inline-block mr-2 text-primary" />
                      Memuat data inventaris...
                    </td>
                  </tr>
                ) : filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-outline">
                      <Package className="w-8 h-8 inline-block mb-2 text-outline/50" />
                      <p>Tidak ada data perangkat ditemukan.</p>
                    </td>
                  </tr>
                ) : (
                  currentItems.map((item, idx) => {
                    const { previewText } = formatPreviewDeskripsi(item.deskripsi);

                    return (
                      <tr key={item.id} className="hover:bg-surface-low/30 transition-colors">
                        <td className="p-4 text-center text-outline font-mono text-xs font-bold">
                          {(currentPage - 1) * itemsPerPage + idx + 1}
                        </td>

                        <td className="p-5 max-w-md">
                          <span className="block text-base font-bold text-primary">{item.namaPerangkat}</span>
                          <span className="block text-xs font-mono text-outline mt-0.5 font-bold">
                            Sample Kode Asset: {item.sampleKodeAsset}
                          </span>

                          {/* Preview Deskripsi Clickable */}
                          {item.deskripsi && (
                            <button
                              type="button"
                              onClick={() => setSelectedDeskripsi({ nama: item.namaPerangkat, deskripsi: item.deskripsi })}
                              className="mt-2 text-left w-full group focus:outline-none cursor-pointer"
                              title="Klik untuk melihat deskripsi lengkap"
                            >
                              <div className="px-3 py-1.5 rounded-lg bg-surface-low border border-surface-container-high hover:border-primary/40 hover:bg-primary/5 transition-all w-full">
                                <p className="text-xs text-on-surface-variant font-medium whitespace-pre-line break-words">
                                  <span className="font-bold text-slate-700">Deskripsi: </span>
                                  {previewText}
                                </p>
                              </div>
                            </button>
                          )}
                        </td>

                        <td className="p-5">
                          <span className="block text-base font-bold text-on-surface">{item.labor}</span>
                          <span className="block text-xs font-bold text-outline uppercase tracking-wider mt-0.5">
                            JURUSAN: {item.jurusan}
                          </span>
                        </td>

                        <td className="p-5 text-base font-semibold text-on-surface-variant">
                          {item.kategori}
                        </td>

                        <td className="p-5 text-center">
                          <span className="inline-block px-3 py-1 rounded-full text-sm font-bold bg-blue-50 text-blue-800 border border-blue-200 tabular-nums">
                            {item.jumlahStok} Unit
                          </span>
                        </td>

                        {/* TOMBOL LIHAT UNIT */}
                        <td className="p-5 text-right">
                          <button
                            onClick={() => handleOpenModal(item)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-blue-600 text-blue-600 hover:bg-blue-50 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            Lihat Unit
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Controls Bar Pagination */}
          {!loading && filteredItems.length > 0 && (
            <div className="p-4 border-t border-surface-container-high bg-surface-low/30 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4 text-xs font-semibold text-outline">
                <span>
                  Menampilkan {startIndex} - {endIndex} dari {filteredItems.length} perangkat
                </span>
                <div className="flex items-center gap-2">
                  <span>Per halaman:</span>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => setItemsPerPage(Number(e.target.value))}
                    className="bg-white border border-surface-container-high rounded-lg px-2 py-1 text-xs text-on-surface focus:outline-none focus:border-primary cursor-pointer font-bold"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={20}>20</option>
                    <option value={50}>50</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-2 border border-surface-container-high rounded-lg text-on-surface hover:bg-surface-low disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    type="button"
                    onClick={() => setCurrentPage(page)}
                    className={`w-8 h-8 text-xs font-bold rounded-lg border transition-colors cursor-pointer ${
                      currentPage === page
                        ? 'bg-primary text-white border-primary shadow-xs'
                        : 'bg-white border-surface-container-high text-on-surface hover:bg-surface-low'
                    }`}
                  >
                    {page}
                  </button>
                ))}

                <button
                  type="button"
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-2 border border-surface-container-high rounded-lg text-on-surface hover:bg-surface-low disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Pop-Up Deskripsi Full */}
        <AnimatePresence>
          {selectedDeskripsi && (
            <div className="fixed inset-0 bg-on-surface/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white w-full max-w-lg border border-surface-container-high rounded-xl shadow-xl p-6 space-y-4"
              >
                <div className="flex justify-between items-start border-b border-surface-container pb-3">
                  <div>
                    <span className="text-xs font-bold text-primary uppercase tracking-wider">Detail Deskripsi</span>
                    <h3 className="text-lg font-bold text-on-surface">{selectedDeskripsi.nama}</h3>
                  </div>
                  <button
                    onClick={() => setSelectedDeskripsi(null)}
                    className="text-outline hover:text-on-surface p-1.5 rounded-lg border cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="bg-surface-low p-4 rounded-lg border border-surface-container max-h-60 overflow-y-auto">
                  <p className="text-sm font-medium text-on-surface leading-relaxed whitespace-pre-line break-words">
                    {selectedDeskripsi.deskripsi}
                  </p>
                </div>
                <div className="flex justify-end pt-2">
                  <button
                    onClick={() => setSelectedDeskripsi(null)}
                    className="px-5 py-2 text-sm font-bold text-white bg-primary hover:bg-primary-container rounded-lg shadow-xs cursor-pointer"
                  >
                    Tutup
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* MODAL POP-UP LIHAT UNIT */}
        {isModalOpen && selectedItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-xl border border-surface-container-high w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
              {/* Header Modal */}
              <div className="flex items-center justify-between p-5 border-b border-surface-container-high bg-surface-low">
                <div>
                  <h3 className="text-lg font-bold text-on-surface">
                    Daftar Unit Instance - {selectedItem.namaPerangkat}
                  </h3>
                  <p className="text-xs text-outline font-medium">
                    Total {selectedItem.instances.length} unit terdaftar di {selectedItem.labor}
                  </p>
                </div>
                <button
                  onClick={handleCloseModal}
                  className="p-1 rounded-lg text-outline hover:text-on-surface hover:bg-surface-container-high transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Body Modal */}
              <div className="p-5 max-h-[60vh] overflow-y-auto space-y-3">
                {selectedItem.instances.length === 0 ? (
                  <div className="text-center py-8 text-outline">
                    <Package className="w-8 h-8 inline-block mb-2 opacity-50" />
                    <p className="text-sm font-medium">Belum ada unit terdaftar untuk perangkat ini.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {selectedItem.instances.map((unit, index) => (
                      <div
                        key={unit.id || index}
                        className="p-3 border border-surface-container-high rounded-lg bg-surface-low/50 flex items-center justify-between"
                      >
                        <div>
                          <span className="block text-xs text-outline font-medium">Kode Asset:</span>
                          <span className="font-mono font-bold text-sm text-on-surface">
                            {unit.kode_asset}
                          </span>
                        </div>
                        <span
                          className={`text-xs px-2.5 py-1 rounded-full font-bold uppercase ${
                            unit.status === 'aktif'
                              ? 'bg-emerald-100 text-emerald-800'
                              : unit.status === 'rusak'
                              ? 'bg-rose-100 text-rose-800'
                              : unit.status === 'perbaikan'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {unit.status || 'aktif'}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer Modal */}
              <div className="p-4 border-t border-surface-container-high bg-surface-low flex justify-end">
                <button
                  onClick={handleCloseModal}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageAnimateWrapper>
  );
}