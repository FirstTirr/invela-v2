"use client";

import React, { useState, useEffect, useCallback } from 'react';
import PageAnimateWrapper from '@/components/page-animate-wrapper';
import { ArrowLeft, Plus, Loader2, Trash2, History, ChevronLeft, ChevronRight, X, Wrench, Edit3 } from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import { apiPerangkat, apiItemInstance, apiRiwayatPerbaikan, Perangkat, ItemInstance, RiwayatPerbaikan } from '@/lib/api';
import { incrementKodeAsset } from '@/lib/utils-asset';

export default function ItemInstancePage() {
  const router = useRouter();
  const rawParams = useParams();
  const itemId = Number(rawParams?.id);

  const [basePerangkat, setBasePerangkat] = useState<Perangkat | null>(null);
  const [unitInstances, setUnitInstances] = useState<ItemInstance[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  // Pagination & Modals State
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  const [selectedUnit, setSelectedUnit] = useState<ItemInstance | null>(null);
  const [historyList, setHistoryList] = useState<RiwayatPerbaikan[]>([]);
  const [modalType, setModalType] = useState<'history' | 'edit' | null>(null);
  const [editForm, setEditForm] = useState({ kode_asset: '', status: 'aktif' });

  const fetchInstances = useCallback(async () => {
    if (!itemId || isNaN(itemId)) return;
    try {
      setLoading(true);
      const [target, all] = await Promise.all([
        apiPerangkat.getById(itemId), 
        apiItemInstance.getAll()
      ]);
      setBasePerangkat(target);
      setUnitInstances((all || []).filter(i => Number(i.id_perangkat) === itemId));
    } catch (e: unknown) {
      console.error('Gagal mengambil data instance:', e);
    } finally {
      setLoading(false);
    }
  }, [itemId]);

  useEffect(() => { 
    let mounted = true;

    const loadData = async () => {
      if (mounted && itemId && !isNaN(itemId)) {
        await fetchInstances();
      }
    };

    void loadData();

    return () => {
      mounted = false;
    };
  }, [itemId, fetchInstances]);

  const handleAddUnit = async () => {
    if (!basePerangkat || !itemId) return;
    try {
      setActionLoading(true);
      const lastCode = unitInstances.length ? unitInstances.reduce((max, c) => 
        (parseInt(c.kode_asset.replace(/\D/g, ''), 10) || 0) > (parseInt(max.replace(/\D/g, ''), 10) || 0) ? c.kode_asset : max
      , unitInstances[0].kode_asset) : 'AST-000';

      const nextCode = incrementKodeAsset(lastCode, 1);
      await apiItemInstance.create({ id_perangkat: itemId, kode_asset: nextCode, status: 'aktif' });
      await fetchInstances();
      alert(`Berhasil menambah unit: ${nextCode}`);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Terjadi kesalahan';
      alert(`Gagal: ${errorMsg}`);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id: number, kode: string) => {
    if (!confirm(`Hapus unit ${kode}?`)) return;
    try {
      setDeletingId(id);
      await apiItemInstance.delete(id);
      await fetchInstances();
    } catch {
      alert(`Unit [${kode}] gagal dihapus! Pastikan tidak ada riwayat perbaikan/laporan kerusakan yang terikat.`);
    } finally {
      setDeletingId(null);
    }
  };

  const openHistory = async (unit: ItemInstance) => {
    setSelectedUnit(unit);
    setModalType('history');
    setHistoryLoading(true);
    try {
      const res = await apiRiwayatPerbaikan.getByKodeAsset(unit.kode_asset);
      setHistoryList(res || []);
    } catch (e: unknown) {
      console.error('Gagal memuat riwayat:', e);
      setHistoryList([]);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUnit || !itemId) return;
    try {
      setActionLoading(true);
      await apiItemInstance.update(selectedUnit.id, { ...editForm, id_perangkat: itemId });
      setModalType(null);
      await fetchInstances();
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : 'Terjadi kesalahan';
      alert(`Gagal update: ${errorMsg}`);
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return '-';
      return new Intl.DateTimeFormat('id-ID', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }).format(date);
    } catch {
      return '-';
    }
  };

  const totalPages = Math.ceil(unitInstances.length / itemsPerPage) || 1;
  const paginatedUnits = unitInstances.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const namaPerangkat = basePerangkat?.nama_perangkat || 'Detail Perangkat';

  return (
    <PageAnimateWrapper>
      <div className="space-y-6 font-sans text-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b pb-4">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/kabeng/items')} className="p-2 border rounded-lg hover:bg-gray-50 shrink-0 cursor-pointer">
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold">{loading ? 'Memuat...' : namaPerangkat}</h1>
              <p className="text-gray-500 text-xs sm:text-sm">Daftar unit aktif ({unitInstances.length} Unit)</p>
            </div>
          </div>
          <button disabled={actionLoading || loading} onClick={() => void handleAddUnit()} className="w-full sm:w-auto px-4 py-2 bg-primary text-white font-bold rounded-lg flex gap-2 items-center justify-center hover:opacity-90 disabled:opacity-50 transition-all cursor-pointer">
            {actionLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />} Tambah Unit (+1)
          </button>
        </div>

        <div className="bg-white border rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse min-w-[500px]">
              <thead className="bg-gray-50 border-b text-xs font-bold uppercase text-gray-700">
                <tr>
                  <th className="p-3 sm:p-4 w-12">No</th>
                  <th className="p-3 sm:p-4">Kode Asset</th>
                  <th className="p-3 sm:p-4 text-center">Status</th>
                  <th className="p-3 sm:p-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y font-semibold">
                {loading ? (
                  <tr><td colSpan={4} className="p-8 text-center text-gray-400"><Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />Memuat...</td></tr>
                ) : paginatedUnits.length === 0 ? (
                  <tr><td colSpan={4} className="p-8 text-center text-gray-400">Belum ada unit. Klik Tambah Unit.</td></tr>
                ) : paginatedUnits.map((u, i) => (
                  <tr key={u.id} className="hover:bg-gray-50/50">
                    <td className="p-3 sm:p-4 font-mono text-gray-400">{(currentPage - 1) * itemsPerPage + i + 1}</td>
                    <td className="p-3 sm:p-4 font-mono font-bold text-primary whitespace-nowrap">{u.kode_asset}</td>
                    <td className="p-3 sm:p-4 text-center">
                      <span className={`px-2.5 py-1 rounded-md text-xs uppercase font-bold border inline-block whitespace-nowrap ${
                        u.status === 'aktif' ? 'bg-green-100 text-green-800 border-green-300' :
                        u.status === 'perbaikan' ? 'bg-amber-100 text-amber-800 border-amber-300' : 'bg-red-100 text-red-800 border-red-300'
                      }`}>{u.status}</span>
                    </td>
                    <td className="p-3 sm:p-4 text-right">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => void openHistory(u)} className="p-2 text-primary hover:bg-primary/10 rounded-lg flex items-center gap-1 font-bold text-xs cursor-pointer" title="Riwayat">
                          <History className="w-4 h-4 sm:w-5 sm:h-5" /> <span className="hidden sm:inline">Riwayat</span>
                        </button>
                        <button onClick={() => { setSelectedUnit(u); setEditForm({ kode_asset: u.kode_asset, status: u.status || 'aktif' }); setModalType('edit'); }} className="p-2 text-gray-600 hover:text-primary rounded-lg flex items-center gap-1 font-bold text-xs cursor-pointer" title="Edit">
                          <Edit3 className="w-4 h-4 sm:w-5 sm:h-5" />
                        </button>
                        <button onClick={() => void handleDelete(u.id, u.kode_asset)} disabled={deletingId === u.id} className="p-2 text-gray-400 hover:text-red-600 rounded-lg cursor-pointer" title="Hapus">
                          {deletingId === u.id ? <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin text-red-600" /> : <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {!loading && unitInstances.length > 0 && (
            <div className="p-3 sm:p-4 bg-gray-50 border-t flex justify-between items-center text-xs">
              <span className="text-gray-500">Total <b>{unitInstances.length}</b> Unit</span>
              <div className="flex gap-2">
                <button disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)} className="p-2 border rounded-lg disabled:opacity-40 cursor-pointer"><ChevronLeft className="w-4 h-4" /></button>
                <span className="px-3 py-2 font-bold bg-primary text-white rounded-lg">{currentPage} / {totalPages}</span>
                <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)} className="p-2 border rounded-lg disabled:opacity-40 cursor-pointer"><ChevronRight className="w-4 h-4" /></button>
              </div>
            </div>
          )}
        </div>

        {modalType && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <div className="bg-white rounded-2xl border shadow-xl w-full max-w-lg overflow-hidden">
              <div className="p-4 border-b flex justify-between items-center">
                <h3 className="font-bold text-sm sm:text-base">{modalType === 'edit' ? 'Edit Unit Instance' : `Riwayat: ${selectedUnit?.kode_asset}`}</h3>
                <button onClick={() => setModalType(null)} className="p-1 hover:bg-gray-100 rounded-lg cursor-pointer"><X className="w-5 h-5" /></button>
              </div>

              {modalType === 'edit' ? (
                <form onSubmit={(e) => void handleSaveEdit(e)} className="p-4 sm:p-5 space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase mb-1">Kode Asset</label>
                    <input type="text" required value={editForm.kode_asset} onChange={e => setEditForm({ ...editForm, kode_asset: e.target.value })} className="w-full p-2.5 border rounded-lg font-mono font-bold text-primary" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase mb-1">Status</label>
                    <select value={editForm.status} onChange={e => setEditForm({ ...editForm, status: e.target.value })} className="w-full p-2.5 border rounded-lg font-bold">
                      <option value="aktif">Aktif</option>
                      <option value="perbaikan">Perbaikan</option>
                      <option value="rusak">Rusak</option>
                      <option value="nonaktif">Non-Aktif</option>
                    </select>
                  </div>
                  <div className="pt-3 flex justify-end gap-2 border-t">
                    <button type="button" onClick={() => setModalType(null)} className="px-4 py-2 font-bold text-gray-500 text-xs sm:text-sm cursor-pointer">Batal</button>
                    <button type="submit" disabled={actionLoading} className="px-4 py-2 bg-primary text-white font-bold rounded-lg flex items-center gap-2 text-xs sm:text-sm cursor-pointer">
                      {actionLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />} Simpan
                    </button>
                  </div>
                </form>
              ) : (
                <div className="p-4 sm:p-5 max-h-[60vh] overflow-y-auto">
                  {historyLoading ? <div className="p-8 text-center"><Loader2 className="w-6 h-6 animate-spin mx-auto" /></div> : 
                   historyList.length === 0 ? <div className="p-8 text-center text-gray-400"><Wrench className="w-8 h-8 mx-auto mb-2 opacity-30" />Belum ada riwayat perbaikan.</div> : (
                    <div className="space-y-3">
                      {historyList.map(h => (
                        <div key={h.id} className="p-3 border rounded-lg text-xs space-y-1">
                          <div className="flex justify-between font-bold"><span>{h.nama_teknisi}</span><span className="text-emerald-600">Rp {Number(h.biaya || 0).toLocaleString('id-ID')}</span></div>
                          <p className="text-gray-500">Perbaikan: {h.deskripsi_perbaikan}</p>
                          <span className="text-[10px] text-gray-400 block">{formatDate(h.tanggal_perbaikan)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </PageAnimateWrapper>
  );
}