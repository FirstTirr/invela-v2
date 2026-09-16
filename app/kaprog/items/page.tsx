"use client";

import React, { useEffect, useState } from 'react';
import PageAnimateWrapper from '@/components/page-animate-wrapper';
import { Loader2, Package, Search, Eye, X } from 'lucide-react';

import { apiPerangkat } from '@/lib/api/perangkat';
import { apiItemInstance, ItemInstance } from '@/lib/api/item-instance';
import { apiLabor } from '@/lib/api/labor';
import { apiKategori } from '@/lib/api/kategori';

interface DisplayItem {
  id: number;
  namaPerangkat: string;
  sampleKodeAsset: string;
  deskripsi: string;
  labor: string;
  jurusan: string;
  kategori: string;
  jumlahStok: number;
  instances: ItemInstance[];
}

export default function KaprogItemsPage() {
  const [items, setItems] = useState<DisplayItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // State untuk Modal Lihat Unit
  const [selectedItem, setSelectedItem] = useState<DisplayItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

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
            deskripsi: p.deskripsi || 'Tidak ada deskripsi',
            labor: namaLabor,
            jurusan: 'RPL',
            kategori: namaKategori,
            jumlahStok: matchingInstances.length,
            instances: matchingInstances
          };
        });

        setItems(combined);
      } catch (err: unknown) {
        console.error("Gagal memuat inventaris:", err);
        if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('Gagal memuat data inventaris');
        }
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

  const filteredItems = items.filter((item) =>
    item.namaPerangkat.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.sampleKodeAsset.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.kategori.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.labor.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

        {/* Input Pencarian */}
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-outline absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari nama perangkat / kode asset..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm border border-surface-container-high rounded-xl bg-white text-on-surface focus:outline-none focus:border-primary font-medium shadow-sm"
          />
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-sm font-semibold rounded-xl">
            {error}
          </div>
        )}

        {/* Tabel Utama */}
        <div className="bg-white border border-surface-container-high rounded-xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse text-base min-w-[800px]">
              <thead className="bg-surface-low border-b border-surface-container-high">
                <tr>
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
                    <td colSpan={5} className="p-8 text-center text-outline">
                      <Loader2 className="w-6 h-6 animate-spin inline-block mr-2" />
                      Memuat data inventaris...
                    </td>
                  </tr>
                ) : filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-outline">
                      <Package className="w-8 h-8 inline-block mb-2 text-outline/50" />
                      <p>Tidak ada data perangkat ditemukan.</p>
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((item) => (
                    <tr key={item.id} className="hover:bg-surface-low/30 transition-colors">
                      <td className="p-5 space-y-1">
                        <span className="block text-base font-bold text-primary">{item.namaPerangkat}</span>
                        <span className="block text-xs font-mono text-outline">
                          kode asset: <span className="font-semibold text-on-surface-variant">{item.sampleKodeAsset}</span>
                        </span>
                        <div className="inline-block px-2.5 py-0.5 rounded border border-surface-container-high bg-surface-low text-xs text-outline font-medium">
                          Deskripsi: {item.deskripsi}
                        </div>
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
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-blue-600 text-blue-600 hover:bg-blue-50 rounded-lg text-xs font-bold transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          Lihat Unit
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

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
                  className="p-1 rounded-lg text-outline hover:text-on-surface hover:bg-surface-container-high transition-colors"
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
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg text-xs font-bold transition-colors"
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