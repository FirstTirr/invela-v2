"use client";

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import PageAnimateWrapper from '@/components/page-animate-wrapper';
import { Plus, Edit2, Trash2, X, Search, Loader2, Boxes, FileText, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { 
  apiJurusan, Jurusan, apiKategori, Kategori, apiLabor, Labor,
  apiPerangkat, Perangkat, apiItemInstance, ItemInstance
} from '@/lib/api';
import { incrementKodeAsset } from '@/lib/utils-asset';
import ExportPdfModal from '@/components/kabeng/ExportPdfModal';

interface DisplayPerangkat {
  id: number;
  nama_perangkat: string;
  kategori_id: number;
  id_jurusan: number;
  id_labor: number;
  deskripsi: string;
  jumlah_stok: number;
  kode_asset_sample: string;
  instances: ItemInstance[];
}

type FlexibleLabor = Labor & { id_jurusan?: number | string; jurusan_id?: number | string };
type FlexiblePerangkat = Perangkat & { id_jurusan?: number | string; jurusan_id?: number | string; id_labor?: number | string; labor_id?: number | string };

interface CurrentUser {
  id?: number;
  username?: string;
  role?: string;
  jurusan_id?: number | null;
  jurusan?: string | null;
}

// Helper membatasi maksimal 2 baris enter
const formatPreviewDeskripsi = (text: string) => {
  if (!text) return { previewText: '', isTruncated: false };
  const lines = text.split('\n');
  const isTruncated = lines.length > 2;
  const previewText = lines.slice(0, 2).join('\n') + (isTruncated ? '...' : '');
  return { previewText, isTruncated };
};

export default function KabengItemsPage() {
  const router = useRouter();
  const [displayItems, setDisplayItems] = useState<DisplayPerangkat[]>([]);
  const [loadingItems, setLoadingItems] = useState(true);
  const [errorItems, setErrorItems] = useState<string | null>(null);

  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);

  const [modalState, setModalState] = useState<{ add: boolean; edit: boolean; pdf: boolean }>({ add: false, edit: false, pdf: false });
  const [editingPerangkatId, setEditingPerangkatId] = useState<number | null>(null);
  
  // State Pop-up Modal Deskripsi Full
  const [selectedDeskripsi, setSelectedDeskripsi] = useState<{ nama: string; deskripsi: string } | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [jurusanList, setJurusanList] = useState<Jurusan[]>([]);
  const [kategoriList, setKategoriList] = useState<Kategori[]>([]);
  const [laborList, setLaborList] = useState<Labor[]>([]);

  const [addForm, setAddForm] = useState({ nama_perangkat: '', kode_asset: '', jumlah_unit: 1, kategori_id: 0, id_jurusan: 0, id_labor: 0, status: 'aktif', deskripsi: '' });
  const [editForm, setEditForm] = useState({ nama_perangkat: '', kategori_id: 0, id_jurusan: 0, id_labor: 0, deskripsi: '' });

  useEffect(() => {
    const animFrame = requestAnimationFrame(() => {
      try {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          setCurrentUser(JSON.parse(storedUser) as CurrentUser);
        }
      } catch (e: unknown) {
        console.error('Gagal membaca data user:', e);
      }
    });

    return () => cancelAnimationFrame(animFrame);
  }, []);

  const fetchItems = useCallback(async () => {
    setLoadingItems(true);
    setErrorItems(null);
    try {
      const [perangkatData, instanceData] = await Promise.all([apiPerangkat.getAll(), apiItemInstance.getAll()]);
      const rawPerangkat = (perangkatData || []) as FlexiblePerangkat[];

      const formatted: DisplayPerangkat[] = rawPerangkat.map((p) => {
        const matchingInstances = (instanceData || []).filter(inst => Number(inst.id_perangkat) === p.id);
        return {
          id: p.id,
          nama_perangkat: p.nama_perangkat || '',
          kategori_id: Number(p.kategori_id),
          id_jurusan: Number(p.id_jurusan ?? p.jurusan_id ?? 0),
          id_labor: Number(p.id_labor ?? p.labor_id ?? 0),
          deskripsi: p.deskripsi || '',
          jumlah_stok: matchingInstances.length,
          kode_asset_sample: matchingInstances.length > 0 ? matchingInstances[0].kode_asset : '-',
          instances: matchingInstances
        };
      });
      setDisplayItems(formatted);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Gagal memuat data perangkat';
      setErrorItems(msg);
    } finally {
      setLoadingItems(false);
    }
  }, []);

  const fetchMasterData = useCallback(async () => {
    try {
      const [dataJurusan, dataKategori, dataLabor] = await Promise.all([apiJurusan.getAll(), apiKategori.getAll(), apiLabor.getAll()]);
      setJurusanList(dataJurusan || []);
      setKategoriList(dataKategori || []);
      setLaborList(dataLabor || []);
    } catch (err: unknown) {
      console.error("Gagal memuat master data:", err);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const initData = async () => {
      if (isMounted) {
        await Promise.all([fetchItems(), fetchMasterData()]);
      }
    };

    void initData();

    return () => {
      isMounted = false;
    };
  }, [currentUser, fetchItems, fetchMasterData]);

  const filteredLaborList = useMemo(() => {
    const userJurusanId = currentUser?.jurusan_id ? Number(currentUser.jurusan_id) : null;
    const isRestrictedRole = currentUser?.role === 'kabeng' || currentUser?.role === 'kaprog';
    if (isRestrictedRole && userJurusanId) {
      return laborList.filter(l => Number((l as FlexibleLabor).id_jurusan ?? (l as FlexibleLabor).jurusan_id ?? 0) === userJurusanId);
    }
    return laborList;
  }, [laborList, currentUser]);

  const handleOpenAddModal = () => {
    const userJurusanId = currentUser?.jurusan_id ? Number(currentUser.jurusan_id) : (jurusanList[0]?.id || 0);
    setAddForm({ 
      nama_perangkat: '', 
      kode_asset: '', 
      jumlah_unit: 1, 
      kategori_id: kategoriList[0]?.id || 0, 
      id_jurusan: userJurusanId, 
      id_labor: filteredLaborList[0]?.id || 0, 
      status: 'aktif', 
      deskripsi: '' 
    });
    setModalState(prev => ({ ...prev, add: true }));
  };

  const getJurusanName = (id: number) => jurusanList.find(j => j.id === id)?.nama_jurusan || `ID: ${id}`;
  const getLaborName = (id: number) => laborList.find(l => l.id === id)?.labor || `ID: ${id}`;
  const getKategoriName = (id: number) => kategoriList.find(k => k.id === id)?.kategori || `ID: ${id}`;

  const filteredItems = displayItems.filter((item) => {
    const userJurusanId = currentUser?.jurusan_id ? Number(currentUser.jurusan_id) : null;
    if ((currentUser?.role === 'kabeng' || currentUser?.role === 'kaprog') && userJurusanId && Number(item.id_jurusan) !== userJurusanId) return false;
    const q = searchQuery.toLowerCase().trim();
    return item.nama_perangkat.toLowerCase().includes(q) || item.kode_asset_sample.toLowerCase().includes(q);
  });

  const handleEditClick = (item: DisplayPerangkat) => {
    setEditingPerangkatId(item.id);
    setEditForm({ 
      nama_perangkat: item.nama_perangkat, 
      kategori_id: item.kategori_id, 
      id_jurusan: item.id_jurusan, 
      id_labor: item.id_labor, 
      deskripsi: item.deskripsi || '' 
    });
    setModalState(prev => ({ ...prev, edit: true }));
  };

  const handleDeletePerangkat = async (item: DisplayPerangkat) => {
    if (item.jumlah_stok > 0) {
      return alert(`Harap hapus semua unit sebelum hapus product.`);
    }

    if (!confirm(`Yakin menghapus master perangkat [${item.nama_perangkat}]?`)) return;
    try {
      setIsSubmitting(true);
      await apiPerangkat.delete(item.id);
      await fetchItems();
      alert('Perangkat berhasil dihapus!');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Terjadi kesalahan';
      alert(`Gagal menghapus: ${msg}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddItemSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const payload = { 
        nama_perangkat: addForm.nama_perangkat, 
        kategori_id: Number(addForm.kategori_id), 
        id_jurusan: Number(addForm.id_jurusan), 
        jurusan_id: Number(addForm.id_jurusan), 
        id_labor: Number(addForm.id_labor), 
        labor_id: Number(addForm.id_labor), 
        deskripsi: addForm.deskripsi 
      };
      const newPerangkat = await apiPerangkat.create(payload);
      const totalUnits = Math.max(1, addForm.jumlah_unit);
      
      await Promise.all(Array.from({ length: totalUnits }, (_, i) => 
        apiItemInstance.create({ id_perangkat: newPerangkat.id, kode_asset: incrementKodeAsset(addForm.kode_asset, i), status: addForm.status })
      ));

      await fetchItems();
      setModalState(prev => ({ ...prev, add: false }));
      alert(`Berhasil menambahkan perangkat dan ${totalUnits} unit!`);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Terjadi kesalahan';
      alert(`Gagal menyimpan: ${msg}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditItemSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPerangkatId) return;
    try {
      setIsSubmitting(true);
      const payload = { 
        nama_perangkat: editForm.nama_perangkat, 
        kategori_id: Number(editForm.kategori_id), 
        id_jurusan: Number(editForm.id_jurusan), 
        jurusan_id: Number(editForm.id_jurusan), 
        id_labor: Number(editForm.id_labor), 
        labor_id: Number(editForm.id_labor), 
        deskripsi: editForm.deskripsi 
      };
      await apiPerangkat.update(editingPerangkatId, payload);
      await fetchItems();
      setModalState(prev => ({ ...prev, edit: false }));
      setEditingPerangkatId(null);
      alert('Data master perangkat diperbarui!');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Terjadi kesalahan';
      alert(`Gagal memperbarui: ${msg}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isKabengOrKaprog = currentUser?.role === 'kabeng' || currentUser?.role === 'kaprog';

  return (
    <PageAnimateWrapper>
      <div className="space-y-6 font-sans antialiased tracking-tight">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 border-b border-surface-container pb-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-on-surface">Manajemen & Registrasi Perangkat</h1>
            <p className="text-base text-on-surface-variant mt-1 font-medium flex items-center gap-2">
              Input data aset perangkat baru dan kelola unit laboratorium.
              {currentUser?.jurusan && <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-primary/10 text-primary text-xs font-bold border border-primary/20 uppercase"><Filter className="w-3 h-3" /> Jurusan: {currentUser.jurusan}</span>}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setModalState(prev => ({ ...prev, pdf: true }))} className="px-4 py-2.5 text-sm font-bold text-secondary bg-surface-low hover:bg-surface-container border border-surface-container-high rounded-lg flex items-center justify-center gap-2 shadow-xs cursor-pointer"><FileText className="w-4 h-4 text-primary" /> Export PDF</button>
            <button onClick={handleOpenAddModal} className="px-5 py-2.5 text-sm font-bold text-white bg-primary hover:bg-primary-container rounded-lg flex items-center justify-center gap-2 shadow-sm cursor-pointer"><Plus className="w-5 h-5" /> Input Perangkat Baru</button>
          </div>
        </div>

        <div className="relative w-full sm:w-80">
          <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-outline pointer-events-none" />
          <input type="text" placeholder="Cari nama perangkat / kode asset..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-10 pr-10 py-2.5 bg-white border border-surface-container-high rounded-xl text-base text-on-surface focus:outline-none focus:border-primary font-medium shadow-xs" />
          {searchQuery && <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface p-1 rounded-full cursor-pointer"><X className="w-4 h-4" /></button>}
        </div>

        <div className="bg-white border border-surface-container-high rounded-xl overflow-hidden shadow-sm w-full">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse text-base min-w-[900px]">
              <thead className="bg-surface-low border-b border-surface-container-high">
                <tr>
                  <th className="p-5 text-sm font-bold uppercase w-1/2">Nama Perangkat</th>
                  <th className="p-5 text-sm font-bold uppercase">Labor</th>
                  <th className="p-5 text-sm font-bold uppercase">Kategori</th>
                  <th className="p-5 text-sm font-bold uppercase text-center">Jumlah Stok Unit</th>
                  <th className="p-5 text-sm font-bold uppercase text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="text-on-surface font-semibold">
                {loadingItems ? (
                  <tr><td colSpan={5} className="p-10 text-center text-outline"><Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" /> Memuat data...</td></tr>
                ) : errorItems ? (
                  <tr><td colSpan={5} className="p-10 text-center text-error font-bold">{errorItems}</td></tr>
                ) : filteredItems.length === 0 ? (
                  <tr><td colSpan={5} className="p-10 text-center text-outline">Data perangkat tidak ditemukan.</td></tr>
                ) : (
                  <AnimatePresence initial={false}>
                    {filteredItems.map((item) => {
                      const { previewText, isTruncated } = formatPreviewDeskripsi(item.deskripsi);

                      return (
                        <motion.tr key={item.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="hover:bg-surface-low/30 border-b border-surface-container">
                          <td className="p-5 max-w-md">
                            <span className="block text-base font-bold text-primary">{item.nama_perangkat}</span>
                            <span className="block text-xs font-mono text-outline mt-0.5 font-bold">Sample Kode Asset: {item.kode_asset_sample}</span>
                            
                            {item.deskripsi && (
                              <button
                                type="button"
                                onClick={() => setSelectedDeskripsi({ nama: item.nama_perangkat, deskripsi: item.deskripsi })}
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
                          <td className="p-5 whitespace-nowrap"><span className="block text-base font-bold">{getLaborName(item.id_labor)}</span><span className="block text-sm text-outline mt-0.5 uppercase">Jurusan: {getJurusanName(item.id_jurusan)}</span></td>
                          <td className="p-5 text-base font-bold text-on-surface-variant whitespace-nowrap">{getKategoriName(item.kategori_id)}</td>
                          <td className="p-5 text-center whitespace-nowrap"><span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-extrabold bg-primary/10 text-primary border border-primary/20">{item.jumlah_stok} Unit</span></td>
                          <td className="p-5 text-right space-x-2 whitespace-nowrap">
                            <button onClick={() => router.push(`/kabeng/items/${item.id}`)} className="p-2.5 border border-primary/20 text-primary hover:bg-primary/10 rounded-lg cursor-pointer inline-flex items-center gap-1 font-bold text-xs"><Boxes className="w-4 h-4" /> Kelola Unit</button>
                            <button type="button" onClick={() => handleEditClick(item)} className="p-2.5 border border-surface-container text-outline hover:text-primary rounded-lg cursor-pointer inline-flex items-center"><Edit2 className="w-4 h-4" /></button>
                            <button type="button" onClick={() => handleDeletePerangkat(item)} className="p-2.5 border border-surface-container text-outline hover:text-error rounded-lg cursor-pointer inline-flex items-center"><Trash2 className="w-4 h-4" /></button>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </AnimatePresence>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal Pop-Up Deskripsi Full */}
        <AnimatePresence>
          {selectedDeskripsi && (
            <div className="fixed inset-0 bg-on-surface/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white w-full max-w-lg border border-surface-container-high rounded-xl shadow-xl p-6 space-y-4">
                <div className="flex justify-between items-start border-b border-surface-container pb-3">
                  <div>
                    <span className="text-xs font-bold text-primary uppercase tracking-wider">Detail Deskripsi</span>
                    <h3 className="text-lg font-bold text-on-surface">{selectedDeskripsi.nama}</h3>
                  </div>
                  <button onClick={() => setSelectedDeskripsi(null)} className="text-outline hover:text-on-surface p-1.5 rounded-lg border cursor-pointer"><X className="w-5 h-5" /></button>
                </div>
                <div className="bg-surface-low p-4 rounded-lg border border-surface-container max-h-60 overflow-y-auto">
                  <p className="text-sm font-medium text-on-surface leading-relaxed whitespace-pre-line break-words">
                    {selectedDeskripsi.deskripsi}
                  </p>
                </div>
                <div className="flex justify-end pt-2">
                  <button onClick={() => setSelectedDeskripsi(null)} className="px-5 py-2 text-sm font-bold text-white bg-primary hover:bg-primary-container rounded-lg shadow-xs cursor-pointer">
                    Tutup
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <ExportPdfModal isOpen={modalState.pdf} onClose={() => setModalState(prev => ({ ...prev, pdf: false }))} laborList={filteredLaborList} displayItems={displayItems} {...(currentUser ? { currentUser } : {})} />

        <AnimatePresence>
          {modalState.add && (
            <div className="fixed inset-0 bg-on-surface/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }} className="bg-white w-full max-w-xl border border-surface-container-high rounded-xl shadow-xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center border-b border-surface-container pb-2">
                  <h3 className="text-lg font-bold text-on-surface">Input Data Perangkat Baru</h3>
                  <button onClick={() => setModalState(prev => ({ ...prev, add: false }))} className="text-outline hover:text-on-surface p-1.5 rounded-lg border cursor-pointer"><X className="w-5 h-5" /></button>
                </div>
                <form onSubmit={handleAddItemSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-2 space-y-1"><label className="text-xs font-bold text-outline uppercase">Nama Perangkat</label><input type="text" required placeholder="Contoh: Laptop Asus ExpertBook" value={addForm.nama_perangkat} onChange={(e) => setAddForm({...addForm, nama_perangkat: e.target.value})} className="w-full px-4 py-2.5 border rounded-lg text-base font-medium" /></div>
                    <div className="space-y-1"><label className="text-xs font-bold text-outline uppercase">Jumlah Unit</label><input type="number" min="1" required value={addForm.jumlah_unit} onChange={(e) => setAddForm({...addForm, jumlah_unit: parseInt(e.target.value, 10) || 1})} className="w-full px-4 py-2.5 border rounded-lg text-base font-bold text-center" /></div>
                  </div>
                  <div className="space-y-1"><label className="text-xs font-bold text-outline uppercase">Kode Asset Awal (Auto-Increment)</label><input type="text" required placeholder="Contoh: RPL-001" value={addForm.kode_asset} onChange={(e) => setAddForm({...addForm, kode_asset: e.target.value})} className="w-full px-4 py-2.5 border rounded-lg text-base font-mono font-medium" /></div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1"><label className="text-xs font-bold text-outline uppercase">Jurusan</label><select required disabled={isKabengOrKaprog} value={addForm.id_jurusan} onChange={(e) => setAddForm({...addForm, id_jurusan: Number(e.target.value)})} className="w-full px-3 py-2.5 border rounded-lg text-sm font-semibold uppercase disabled:bg-slate-100 disabled:text-slate-500">{jurusanList.map((j) => (<option key={j.id} value={j.id}>{j.nama_jurusan}</option>))}</select></div>
                    <div className="space-y-1"><label className="text-xs font-bold text-outline uppercase">Labor</label><select required value={addForm.id_labor} onChange={(e) => setAddForm({...addForm, id_labor: Number(e.target.value)})} className="w-full px-3 py-2.5 border rounded-lg text-sm font-semibold">{filteredLaborList.map((l) => (<option key={l.id} value={l.id}>{l.labor}</option>))}</select></div>
                    <div className="space-y-1"><label className="text-xs font-bold text-outline uppercase">Kategori</label><select required value={addForm.kategori_id} onChange={(e) => setAddForm({...addForm, kategori_id: Number(e.target.value)})} className="w-full px-3 py-2.5 border rounded-lg text-sm font-semibold">{kategoriList.map((k) => (<option key={k.id} value={k.id}>{k.kategori}</option>))}</select></div>
                  </div>
                  <div className="space-y-1"><label className="text-xs font-bold text-outline uppercase">Status Awal Unit</label><select value={addForm.status} onChange={(e) => setAddForm({...addForm, status: e.target.value})} className="w-full px-4 py-2.5 border rounded-lg text-base font-semibold"><option value="aktif">aktif</option><option value="perbaikan">perbaikan</option><option value="rusak">rusak</option><option value="nonaktif">nonaktif</option></select></div>
                  <div className="space-y-1"><label className="text-xs font-bold text-outline uppercase">Deskripsi / Catatan</label><textarea rows={2} placeholder="Masukkan spesifikasi ringkas..." value={addForm.deskripsi} onChange={(e) => setAddForm({...addForm, deskripsi: e.target.value})} className="w-full px-4 py-2.5 border rounded-lg text-base font-medium resize-none" /></div>
                  <div className="flex justify-end gap-3 pt-3 border-t">
                    <button type="button" disabled={isSubmitting} onClick={() => setModalState(prev => ({ ...prev, add: false }))} className="px-5 py-2.5 text-sm font-bold text-secondary">Batal</button>
                    <button type="submit" disabled={isSubmitting} className="px-6 py-2.5 text-sm font-bold text-white bg-primary rounded-lg shadow-sm disabled:opacity-50">{isSubmitting ? 'Menyimpan...' : `Simpan ${addForm.jumlah_unit} Unit`}</button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {modalState.edit && editingPerangkatId && (
            <div className="fixed inset-0 bg-on-surface/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }} className="bg-white w-full max-w-xl border border-surface-container-high rounded-xl shadow-xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center border-b border-surface-container pb-2">
                  <h3 className="text-lg font-bold text-on-surface">Edit Data Master Perangkat</h3>
                  <button onClick={() => setModalState(prev => ({ ...prev, edit: false }))} className="text-outline hover:text-on-surface p-1.5 rounded-lg border cursor-pointer"><X className="w-5 h-5" /></button>
                </div>
                <form onSubmit={handleEditItemSubmit} className="space-y-4">
                  <div className="space-y-1"><label className="text-xs font-bold text-outline uppercase">Nama Perangkat</label><input type="text" required value={editForm.nama_perangkat} onChange={(e) => setEditForm({...editForm, nama_perangkat: e.target.value})} className="w-full px-4 py-2.5 border rounded-lg text-base font-medium" /></div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1"><label className="text-xs font-bold text-outline uppercase">Jurusan</label><select disabled={isKabengOrKaprog} value={editForm.id_jurusan} onChange={(e) => setEditForm({...editForm, id_jurusan: Number(e.target.value)})} className="w-full px-3 py-2.5 border rounded-lg text-sm font-semibold uppercase disabled:bg-slate-100 disabled:text-slate-500">{jurusanList.map((j) => (<option key={j.id} value={j.id}>{j.nama_jurusan}</option>))}</select></div>
                    <div className="space-y-1"><label className="text-xs font-bold text-outline uppercase">Labor</label><select value={editForm.id_labor} onChange={(e) => setEditForm({...editForm, id_labor: Number(e.target.value)})} className="w-full px-3 py-2.5 border rounded-lg text-sm font-semibold">{filteredLaborList.map((l) => (<option key={l.id} value={l.id}>{l.labor}</option>))}</select></div>
                    <div className="space-y-1"><label className="text-xs font-bold text-outline uppercase">Kategori</label><select value={editForm.kategori_id} onChange={(e) => setEditForm({...editForm, kategori_id: Number(e.target.value)})} className="w-full px-3 py-2.5 border rounded-lg text-sm font-semibold">{kategoriList.map((k) => (<option key={k.id} value={k.id}>{k.kategori}</option>))}</select></div>
                  </div>
                  <div className="space-y-1"><label className="text-xs font-bold text-outline uppercase">Deskripsi / Catatan</label><textarea rows={2} value={editForm.deskripsi} onChange={(e) => setEditForm({...editForm, deskripsi: e.target.value})} className="w-full px-4 py-2.5 border rounded-lg text-base font-medium resize-none" /></div>
                  <div className="flex justify-end gap-3 pt-3 border-t">
                    <button type="button" disabled={isSubmitting} onClick={() => setModalState(prev => ({ ...prev, edit: false }))} className="px-5 py-2.5 text-sm font-bold text-secondary">Batal</button>
                    <button type="submit" disabled={isSubmitting} className="px-6 py-2.5 text-sm font-bold text-white bg-primary rounded-lg shadow-sm disabled:opacity-50">{isSubmitting ? 'Memperbarui...' : 'Update Data'}</button>
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