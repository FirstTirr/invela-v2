// app/kabeng/items/[id]/page.tsx
"use client";

import React, { useState, useEffect } from 'react';
import PageAnimateWrapper from '@/components/page-animate-wrapper';
import { ArrowLeft, Plus, Loader2, Trash2, History, ChevronLeft, ChevronRight, X, Wrench } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import { 
  apiPerangkat, 
  apiItemInstance, 
  apiRiwayatPerbaikan, 
  Perangkat, 
  ItemInstance, 
  RiwayatPerbaikan 
} from '@/lib/api';
import { incrementKodeAsset } from '@/lib/utils-asset';

export default function ItemInstancePage() {
  const router = useRouter();
  const params = useParams();
  const itemId = Number(params.id);

  const [basePerangkat, setBasePerangkat] = useState<Perangkat | null>(null);
  const [unitInstances, setUnitInstances] = useState<ItemInstance[]>([]);
  const [loading, setLoading] = useState(true);
  const [addingUnit, setAddingUnit] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // State Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // State Pop-up Modal Riwayat
  const [selectedUnit, setSelectedUnit] = useState<ItemInstance | null>(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [historyList, setHistoryList] = useState<RiwayatPerbaikan[]>([]);

  const fetchInstances = async () => {
    try {
      setLoading(true);
      
      const [target, allInstances] = await Promise.all([
        apiPerangkat.getById(itemId),
        apiItemInstance.getAll()
      ]);

      setBasePerangkat(target);

      const filtered = allInstances.filter(
        item => Number(item.id_perangkat) === itemId
      );
      
      setUnitInstances(filtered);
    } catch (err) {
      console.error("Gagal mengambil data unit:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (itemId) fetchInstances();
  }, [itemId]);

  // Hitung Data Pagination
  const totalPages = Math.ceil(unitInstances.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedUnits = unitInstances.slice(startIndex, startIndex + itemsPerPage);

  const handleAddQuickUnit = async () => {
    if (!basePerangkat) return;

    try {
      setAddingUnit(true);
      let nextKodeAsset = 'AST-001';

      if (unitInstances.length > 0) {
        const highestCode = unitInstances.reduce((maxCode, current) => {
          const currentNum = parseInt(current.kode_asset.replace(/\D/g, ''), 10) || 0;
          const maxNum = parseInt(maxCode.replace(/\D/g, ''), 10) || 0;
          return currentNum > maxNum ? current.kode_asset : maxCode;
        }, unitInstances[0].kode_asset);

        nextKodeAsset = incrementKodeAsset(highestCode, 1);
      }

      await apiItemInstance.create({
        id_perangkat: itemId,
        kode_asset: nextKodeAsset,
        status: 'aktif'
      });

      await fetchInstances();
      alert(`Berhasil menambahkan unit baru dengan Kode Asset: ${nextKodeAsset}`);
    } catch (err: any) {
      alert(`Gagal menambah unit: ${err.message}`);
    } finally {
      setAddingUnit(false);
    }
  };

  // ✅ Format Alert Error Jelas & Rapi (Sesuai Screenshot)
  const handleDeleteUnit = async (id: number, kode: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus unit ${kode}?`)) return;
    
    try {
      setDeletingId(id);
      await apiItemInstance.delete(id);
      alert(`Unit [${kode}] berhasil dihapus!`);
      await fetchInstances();
    } catch (err: any) {
      console.error("Error deleting unit:", err);
      
      alert(
        `Unit [${kode}] tidak dapat dihapus!\n\n` +
        `Hapus terlebih dahulu data riwayat perbaikan atau laporan kerusakan terkait sebelum menghapus unit ini.`
      );
    } finally {
      setDeletingId(null);
    }
  };

  // Buka Modal Riwayat Perbaikan
  const handleOpenHistory = async (unit: ItemInstance) => {
    setSelectedUnit(unit);
    setShowHistoryModal(true);
    setLoadingHistory(true);

    try {
      const data = await apiRiwayatPerbaikan.getByKodeAsset(unit.kode_asset);
      setHistoryList(data);
    } catch (err) {
      console.error("Gagal mengambil riwayat perbaikan:", err);
      setHistoryList([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  const namaPerangkat = basePerangkat?.nama_perangkat || (unitInstances[0] as any)?.perangkat?.nama_perangkat || 'Detail Perangkat';

  // Helper Format Rupiah
  const formatRupiah = (val: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);
  };

  // Helper Format Tanggal
  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
      return dateStr;
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
              className="p-2 rounded-lg border border-surface-container hover:bg-surface-low transition-colors cursor-pointer text-on-surface"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-on-surface">
                {loading ? 'Memuat Details...' : namaPerangkat}
              </h1>
              <p className="text-sm text-outline">
                Daftar unit instance & penomoran Kode Asset aktif ({unitInstances.length} Unit)
              </p>
            </div>
          </div>

          <button 
            disabled={addingUnit || loading}
            onClick={handleAddQuickUnit}
            className="px-4 py-2.5 text-sm font-bold text-white bg-primary hover:bg-primary-container rounded-lg flex items-center gap-2 shadow-sm cursor-pointer disabled:opacity-50 transition-all"
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
              ) : unitInstances.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-outline">
                    Belum ada unit fisik registered untuk perangkat ini. Klik &quot;Tambah Unit Baru&quot; di atas.
                  </td>
                </tr>
              ) : paginatedUnits.map((unit, index) => (
                <tr key={unit.id} className="hover:bg-surface-low/30 transition-colors">
                  <td className="p-4 text-sm font-mono text-outline">
                    {startIndex + index + 1}
                  </td>
                  <td className="p-4 font-mono text-base font-bold text-primary">
                    {unit.kode_asset}
                  </td>
                  <td className="p-4 text-center">
                    <span className={`inline-block px-3 py-1 rounded-md text-xs font-bold uppercase border ${
                      unit.status === 'aktif' ? 'bg-green-100 text-green-900 border-green-300' :
                      unit.status === 'perbaikan' ? 'bg-amber-100 text-amber-900 border-amber-300' : 
                      unit.status === 'rusak' ? 'bg-red-100 text-red-900 border-red-300' :
                      'bg-gray-100 text-gray-800 border-gray-300'
                    }`}>
                      {unit.status}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {/* Tombol Riwayat Pop-up */}
                      <button 
                        onClick={() => handleOpenHistory(unit)}
                        className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-bold"
                        title="Lihat Riwayat Perbaikan"
                      >
                        <History className="w-4 h-4" />
                        <span className="hidden sm:inline">Riwayat</span>
                      </button>

                      {/* Tombol Hapus Unit */}
                      <button 
                        onClick={() => handleDeleteUnit(unit.id, unit.kode_asset)}
                        disabled={deletingId === unit.id}
                        className="p-2 text-outline hover:text-error hover:bg-error-container rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                        title="Hapus Unit Ini"
                      >
                        {deletingId === unit.id ? (
                          <Loader2 className="w-4 h-4 animate-spin text-error" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination Bar */}
          {!loading && unitInstances.length > 0 && (
            <div className="px-6 py-4 bg-surface-low/50 border-t border-surface-container-high flex items-center justify-between">
              <span className="text-xs font-medium text-outline">
                Menampilkan <span className="font-bold text-on-surface">{startIndex + 1}</span> - <span className="font-bold text-on-surface">{Math.min(startIndex + itemsPerPage, unitInstances.length)}</span> dari <span className="font-bold text-on-surface">{unitInstances.length}</span> Unit
              </span>

              <div className="flex items-center gap-2">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  className="p-2 text-xs font-semibold rounded-lg border border-surface-container hover:bg-surface-low disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-8 h-8 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                        currentPage === page
                          ? 'bg-primary text-white'
                          : 'hover:bg-surface-low text-on-surface border border-surface-container'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  className="p-2 text-xs font-semibold rounded-lg border border-surface-container hover:bg-surface-low disabled:opacity-40 disabled:hover:bg-transparent cursor-pointer transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Pop-up Riwayat Perbaikan */}
        {showHistoryModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl border border-surface-container-high shadow-2xl w-full max-w-3xl overflow-hidden">
              {/* Header Modal */}
              <div className="p-6 border-b border-surface-container flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-bold text-on-surface">
                    Riwayat Perbaikan Unit
                  </h3>
                  <p className="text-sm font-semibold text-error">
                    {namaPerangkat} ({selectedUnit?.kode_asset})
                  </p>
                </div>
                <button
                  onClick={() => setShowHistoryModal(false)}
                  className="p-1.5 text-outline hover:text-on-surface hover:bg-surface-low rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content Modal */}
              <div className="p-6">
                {loadingHistory ? (
                  <div className="py-12 text-center text-outline">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" />
                    Memuat riwayat perbaikan...
                  </div>
                ) : historyList.length === 0 ? (
                  <div className="py-12 text-center text-outline font-medium">
                    <Wrench className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    Belum ada riwayat perbaikan terdaftar untuk unit ini.
                  </div>
                ) : (
                  <div className="border border-surface-container rounded-xl overflow-hidden max-h-[60vh] overflow-y-auto">
                    <table className="w-full text-left border-collapse text-sm">
                      <thead className="bg-surface-low border-b border-surface-container font-bold text-xs uppercase text-on-surface sticky top-0">
                        <tr>
                          <th className="p-3">Tanggal</th>
                          <th className="p-3">Teknisi</th>
                          <th className="p-3">Detail Kerusakan</th>
                          <th className="p-3">Detail Perbaikan</th>
                          <th className="p-3 text-right">Biaya</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-surface-container font-medium text-slate-700">
                        {historyList.map((item) => (
                          <tr key={item.id} className="hover:bg-surface-low/30">
                            <td className="p-3 whitespace-nowrap text-xs font-semibold text-outline">
                              {formatDate(item.tanggal_perbaikan)}
                            </td>
                            <td className="p-3 font-semibold text-on-surface">
                              {item.nama_teknisi}
                            </td>
                            <td className="p-3 text-xs text-outline max-w-[150px] truncate" title={item.deskripsi_kerusakan}>
                              {item.deskripsi_kerusakan}
                            </td>
                            <td className="p-3 text-xs text-outline max-w-[180px]" title={item.deskripsi_perbaikan}>
                              {item.deskripsi_perbaikan}
                            </td>
                            <td className="p-3 text-right font-bold text-emerald-600 whitespace-nowrap">
                              {formatRupiah(item.biaya)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </PageAnimateWrapper>
  );
}