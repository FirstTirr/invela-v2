"use client";

import React, { useState, useEffect, useMemo } from 'react';
import PageAnimateWrapper from '@/components/page-animate-wrapper';
import { Plus, Edit2, Trash2, X, Search, Loader2, Boxes, FileText, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { 
  apiJurusan, Jurusan, 
  apiKategori, Kategori, 
  apiLabor, Labor,
  apiPerangkat, Perangkat,
  apiItemInstance, ItemInstance
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

export default function KabengItemsPage() {
  const router = useRouter();
  const [displayItems, setDisplayItems] = useState<DisplayPerangkat[]>([]);
  const [loadingItems, setLoadingItems] = useState(true);
  const [errorItems, setErrorItems] = useState<string | null>(null);

  const [currentUser, setCurrentUser] = useState<{
    id?: number; username?: string; role?: string; jurusan_id?: number | null; jurusan?: string | null;
  } | null>(null);

  const [isOpenAddModal, setIsOpenAddModal] = useState(false);
  const [isOpenEditModal, setIsOpenEditModal] = useState(false);
  const [isOpenPdfModal, setIsOpenPdfModal] = useState(false);
  
  const [editingPerangkat, setEditingPerangkat] = useState<Perangkat | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [jurusanList, setJurusanList] = useState<Jurusan[]>([]);
  const [kategoriList, setKategoriList] = useState<Kategori[]>([]);
  const [laborList, setLaborList] = useState<Labor[]>([]);

  const [addFormData, setAddFormData] = useState({
    nama_perangkat: '', kode_asset: '', jumlah_unit: 1, kategori_id: 0, id_jurusan: 0, id_labor: 0, status: 'aktif', deskripsi: ''
  });

  const [editFormData, setEditFormData] = useState({
    nama_perangkat: '', kategori_id: 0, id_jurusan: 0, id_labor: 0, deskripsi: ''
  });

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('user');
      if (storedUser) setCurrentUser(JSON.parse(storedUser));
    } catch (e) {
      console.error('Gagal membaca data user:', e);
    }
  }, []);

  const fetchItems = async () => {
    try {
      setLoadingItems(true);
      setErrorItems(null);
      const [perangkatData, instanceData] = await Promise.all([
        apiPerangkat.getAll(), apiItemInstance.getAll()
      ]);

      const formatted: DisplayPerangkat[] = (perangkatData || []).map((p: any) => {
        const matchingInstances = (instanceData || []).filter(inst => Number(inst.id_perangkat) === p.id);
        return {
          id: p.id,
          nama_perangkat: p.nama_perangkat,
          kategori_id: Number(p.kategori_id),
          id_jurusan: Number(p.id_jurusan ?? p.jurusan_id ?? 0),
          id_labor: Number(p.id_labor ?? p.labor_id ?? 0),
          deskripsi: p.deskripsi,
          jumlah_stok: matchingInstances.length,
          kode_asset_sample: matchingInstances.length > 0 ? matchingInstances[0].kode_asset : '-',
          instances: matchingInstances
        };
      });

      setDisplayItems(formatted);
    } catch (err: any) {
      setErrorItems(err.message || 'Gagal memuat data perangkat');
    } finally {
      setLoadingItems(false);
    }
  };

  const fetchMasterData = async () => {
    try {
      const [dataJurusan, dataKategori, dataLabor] = await Promise.all([
        apiJurusan.getAll(), apiKategori.getAll(), apiLabor.getAll()
      ]);
      setJurusanList(dataJurusan || []);
      setKategoriList(dataKategori || []);
      setLaborList(dataLabor || []);
    } catch (err) {
      console.error("Gagal memuat master data:", err);
    }
  };

  useEffect(() => {
    fetchItems();
    fetchMasterData();
  }, [currentUser]);

  // 🔥 FILTER LABOR SESUAI JURUSAN USER DENGAN SAFE CASTING
  const filteredLaborList = useMemo(() => {
    const userJurusanId = currentUser?.jurusan_id ? Number(currentUser.jurusan_id) : null;
    const isRestrictedRole = currentUser?.role === 'kabeng' || currentUser?.role === 'kaprog';
    
    if (isRestrictedRole && userJurusanId) {
      return laborList.filter(l => {
        const itemLabor = l as any;
        const laborJurusanId = Number(itemLabor.id_jurusan ?? itemLabor.jurusan_id ?? 0);
        return laborJurusanId === userJurusanId;
      });
    }
    return laborList;
  }, [laborList, currentUser]);

  const handleOpenAddModal = () => {
    const userJurusanId = currentUser?.jurusan_id ? Number(currentUser.jurusan_id) : (jurusanList[0]?.id || 0);
    const initialLaborId = filteredLaborList[0]?.id || 0;

    setAddFormData({
      nama_perangkat: '', kode_asset: '', jumlah_unit: 1,
      kategori_id: kategoriList[0]?.id || 0,
      id_jurusan: userJurusanId,
      id_labor: initialLaborId,
      status: 'aktif', deskripsi: ''
    });
    setIsOpenAddModal(true);
  };

  const getJurusanName = (id: number) => jurusanList.find(j => j.id === id)?.nama_jurusan || `ID: ${id}`;
  const getLaborName = (id: number) => laborList.find(l => l.id === id)?.labor || `ID: ${id}`;
  const getKategoriName = (id: number) => kategoriList.find(k => k.id === id)?.kategori || `ID: ${id}`;

  const filteredItems = displayItems.filter((item) => {
    const userJurusanId = currentUser?.jurusan_id ? Number(currentUser.jurusan_id) : null;
    const isRestrictedRole = currentUser?.role === 'kabeng' || currentUser?.role === 'kaprog';
    if (isRestrictedRole && userJurusanId && Number(item.id_jurusan) !== userJurusanId) return false;

    const q = searchQuery.toLowerCase().trim();
    return item.nama_perangkat.toLowerCase().includes(q) || item.kode_asset_sample.toLowerCase().includes(q);
  });

  const handleEditClick = (item: DisplayPerangkat) => {
    setEditingPerangkat(item as unknown as Perangkat);
    setEditFormData({
      nama_perangkat: item.nama_perangkat, kategori_id: item.kategori_id,
      id_jurusan: item.id_jurusan, id_labor: item.id_labor, deskripsi: item.deskripsi || ''
    });
    setIsOpenEditModal(true);
  };

  const handleDeletePerangkat = async (item: DisplayPerangkat) => {
    if (item.jumlah_stok > 0) {
      return alert(`Perangkat [${item.nama_perangkat}] masih memiliki ${item.jumlah_stok} unit instance!\n\nHapus unit terlebih dahulu.`);
    }
    if (!confirm(`Yakin menghapus master perangkat [${item.nama_perangkat}]?`)) return;

    try {
      setIsSubmitting(true);
      await apiPerangkat.delete(item.id);
      await fetchItems();
      alert('Perangkat berhasil dihapus!');
    } catch (err: any) {
      alert(`Gagal menghapus: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddItemSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const payload = {
        nama_perangkat: addFormData.nama_perangkat,
        kategori_id: Number(addFormData.kategori_id),
        id_jurusan: Number(addFormData.id_jurusan),
        jurusan_id: Number(addFormData.id_jurusan),
        id_labor: Number(addFormData.id_labor),
        labor_id: Number(addFormData.id_labor),
        deskripsi: addFormData.deskripsi
      };

      const newPerangkat = await apiPerangkat.create(payload);
      const totalUnits = Math.max(1, addFormData.jumlah_unit);
      
      const instanceRequests = Array.from({ length: totalUnits }, (_, i) => 
        apiItemInstance.create({
          id_perangkat: newPerangkat.id,
          kode_asset: incrementKodeAsset(addFormData.kode_asset, i),
          status: addFormData.status
        })
      );

      await Promise.all(instanceRequests);
      await fetchItems();
      setIsOpenAddModal(false);
      alert(`Berhasil menambahkan perangkat dan ${totalUnits} unit!`);
    } catch (err: any) {
      alert(`Gagal menyimpan: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditItemSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPerangkat) return;
    try {
      setIsSubmitting(true);
      const payload = {
        nama_perangkat: editFormData.nama_perangkat,
        kategori_id: Number(editFormData.kategori_id),
        id_jurusan: Number(editFormData.id_jurusan),
        jurusan_id: Number(editFormData.id_jurusan),
        id_labor: Number(editFormData.id_labor),
        labor_id: Number(editFormData.id_labor),
        deskripsi: editFormData.deskripsi
      };
      await apiPerangkat.update(editingPerangkat.id, payload);
      await fetchItems();
      setIsOpenEditModal(false);
      setEditingPerangkat(null);
      alert('Data master perangkat diperbarui!');
    } catch (err: any) {
      alert(`Gagal memperbarui: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isKabengOrKaprog = currentUser?.role === 'kabeng' || currentUser?.role === 'kaprog';

  return (
    <PageAnimateWrapper>
      <div className="space-y-6 font-sans antialiased tracking-tight">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 border-b border-surface-container pb-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-on-surface">Manajemen & Registrasi Perangkat</h1>
            <p className="text-base text-on-surface-variant mt-1 font-medium flex items-center gap-2">
              Input data aset perangkat baru dan kelola unit laboratorium.
              {currentUser?.jurusan && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-primary/10 text-primary text-xs font-bold border border-primary/20 uppercase">
                  <Filter className="w-3 h-3" /> Jurusan: {currentUser.jurusan}
                </span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsOpenPdfModal(true)}
              className="px-4 py-2.5 text-sm font-bold text-secondary bg-surface-low hover:bg-surface-container border border-surface-container-high rounded-lg flex items-center justify-center gap-2 shadow-xs cursor-pointer"
            >
              <FileText className="w-4 h-4 text-primary" /> Export PDF
            </button>
            <button 
              onClick={handleOpenAddModal}
              className="px-5 py-2.5 text-sm font-bold text-white bg-primary hover:bg-primary-container rounded-lg flex items-center justify-center gap-2 shadow-sm cursor-pointer"
            >
              <Plus className="w-5 h-5" /> Input Perangkat Baru
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-outline pointer-events-none" />
            <input 
              type="text" 
              placeholder="Cari nama perangkat / kode asset..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 bg-white border border-surface-container-high rounded-xl text-base text-on-surface focus:outline-none focus:border-primary font-medium shadow-xs"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface p-1 rounded-full cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Tabel Data Perangkat */}
        <div className="bg-white border border-surface-container-high rounded-xl overflow-hidden shadow-sm w-full">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse text-base min-w-[900px]">
              <thead className="bg-surface-low border-b border-surface-container-high">
                <tr>
                  <th className="p-5 text-sm font-bold uppercase">Nama Perangkat</th>
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
                    {filteredItems.map((item) => (
                      <motion.tr key={item.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="hover:bg-surface-low/30 border-b border-surface-container">
                        <td className="p-5 whitespace-nowrap">
                          <span className="block text-base font-bold text-primary">{item.nama_perangkat}</span>
                          <span className="block text-xs font-mono text-outline mt-0.5 font-bold">Sample Kode Asset: {item.kode_asset_sample}</span>
                          {item.deskripsi && <span className="block text-xs text-on-surface-variant italic mt-1 font-medium bg-surface-low px-2 py-0.5 rounded border border-surface-container-high w-fit">Deskripsi: {item.deskripsi}</span>}
                        </td>
                        <td className="p-5 whitespace-nowrap">
                          <span className="block text-base font-bold">{getLaborName(item.id_labor)}</span>
                          <span className="block text-sm text-outline mt-0.5 uppercase">Jurusan: {getJurusanName(item.id_jurusan)}</span>
                        </td>
                        <td className="p-5 text-base font-bold text-on-surface-variant whitespace-nowrap">{getKategoriName(item.kategori_id)}</td>
                        <td className="p-5 text-center whitespace-nowrap">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-extrabold bg-primary/10 text-primary border border-primary/20">{item.jumlah_stok} Unit</span>
                        </td>
                        <td className="p-5 text-right space-x-2 whitespace-nowrap">
                          <button onClick={() => router.push(`/kabeng/items/${item.id}`)} className="p-2.5 border border-primary/20 text-primary hover:bg-primary/10 rounded-lg cursor-pointer inline-flex items-center gap-1 font-bold text-xs" title="Kelola Unit">
                            <Boxes className="w-4 h-4" /> Kelola Unit
                          </button>
                          <button type="button" onClick={() => handleEditClick(item)} className="p-2.5 border border-surface-container text-outline hover:text-primary rounded-lg cursor-pointer inline-flex items-center"><Edit2 className="w-4 h-4" /></button>
                          <button type="button" onClick={() => handleDeletePerangkat(item)} className="p-2.5 border border-surface-container text-outline hover:text-error rounded-lg cursor-pointer inline-flex items-center"><Trash2 className="w-4 h-4" /></button>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* MODAL EXPORT PDF - CASTING currentUser / MENYESUAIKAN PROPS UNTUK MENGHINDARI TYPE ERROR */}
        <ExportPdfModal 
          isOpen={isOpenPdfModal} 
          onClose={() => setIsOpenPdfModal(false)} 
          laborList={filteredLaborList}
          displayItems={displayItems}
          {...(currentUser ? { currentUser } : {})}
        />

        {/* MODAL INPUT PERANGKAT BARU */}
        <AnimatePresence>
          {isOpenAddModal && (
            <div className="fixed inset-0 bg-on-surface/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }} className="bg-white w-full max-w-xl border border-surface-container-high rounded-xl shadow-xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center border-b border-surface-container pb-2">
                  <h3 className="text-lg font-bold text-on-surface">Input Data Perangkat Baru</h3>
                  <button onClick={() => setIsOpenAddModal(false)} className="text-outline hover:text-on-surface p-1.5 rounded-lg border cursor-pointer"><X className="w-5 h-5" /></button>
                </div>
                
                <form onSubmit={handleAddItemSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-2 space-y-1">
                      <label className="text-xs font-bold text-outline uppercase">Nama Perangkat</label>
                      <input type="text" required placeholder="Contoh: Laptop Asus ExpertBook" value={addFormData.nama_perangkat} onChange={(e) => setAddFormData({...addFormData, nama_perangkat: e.target.value})} className="w-full px-4 py-2.5 border rounded-lg text-base font-medium" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-outline uppercase">Jumlah Unit</label>
                      <input type="number" min="1" required value={addFormData.jumlah_unit} onChange={(e) => setAddFormData({...addFormData, jumlah_unit: parseInt(e.target.value, 10) || 1})} className="w-full px-4 py-2.5 border rounded-lg text-base font-bold text-center" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-outline uppercase">Kode Asset Awal (Auto-Increment)</label>
                    <input type="text" required placeholder="Contoh: RPL-001" value={addFormData.kode_asset} onChange={(e) => setAddFormData({...addFormData, kode_asset: e.target.value})} className="w-full px-4 py-2.5 border rounded-lg text-base font-mono font-medium" />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-outline uppercase">Jurusan</label>
                      <select required disabled={isKabengOrKaprog} value={addFormData.id_jurusan} onChange={(e) => setAddFormData({...addFormData, id_jurusan: Number(e.target.value)})} className="w-full px-3 py-2.5 border rounded-lg text-sm font-semibold uppercase disabled:bg-slate-100 disabled:text-slate-500">
                        {jurusanList.map((j) => (<option key={j.id} value={j.id}>{j.nama_jurusan}</option>))}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-outline uppercase">Labor</label>
                      <select required value={addFormData.id_labor} onChange={(e) => setAddFormData({...addFormData, id_labor: Number(e.target.value)})} className="w-full px-3 py-2.5 border rounded-lg text-sm font-semibold">
                        {filteredLaborList.map((l) => (<option key={l.id} value={l.id}>{l.labor}</option>))}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-outline uppercase">Kategori</label>
                      <select required value={addFormData.kategori_id} onChange={(e) => setAddFormData({...addFormData, kategori_id: Number(e.target.value)})} className="w-full px-3 py-2.5 border rounded-lg text-sm font-semibold">
                        {kategoriList.map((k) => (<option key={k.id} value={k.id}>{k.kategori}</option>))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-outline uppercase">Status Awal Unit</label>
                    <select value={addFormData.status} onChange={(e) => setAddFormData({...addFormData, status: e.target.value})} className="w-full px-4 py-2.5 border rounded-lg text-base font-semibold">
                      <option value="aktif">aktif</option>
                      <option value="perbaikan">perbaikan</option>
                      <option value="rusak">rusak</option>
                      <option value="nonaktif">nonaktif</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-outline uppercase">Deskripsi / Catatan</label>
                    <textarea rows={2} placeholder="Masukkan spesifikasi ringkas..." value={addFormData.deskripsi} onChange={(e) => setAddFormData({...addFormData, deskripsi: e.target.value})} className="w-full px-4 py-2.5 border rounded-lg text-base font-medium resize-none" />
                  </div>

                  <div className="flex justify-end gap-3 pt-3 border-t">
                    <button type="button" disabled={isSubmitting} onClick={() => setIsOpenAddModal(false)} className="px-5 py-2.5 text-sm font-bold text-secondary">Batal</button>
                    <button type="submit" disabled={isSubmitting} className="px-6 py-2.5 text-sm font-bold text-white bg-primary rounded-lg shadow-sm disabled:opacity-50">
                      {isSubmitting ? 'Menyimpan...' : `Simpan ${addFormData.jumlah_unit} Unit`}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* MODAL EDIT PERANGKAT */}
        <AnimatePresence>
          {isOpenEditModal && editingPerangkat && (
            <div className="fixed inset-0 bg-on-surface/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }} className="bg-white w-full max-w-xl border border-surface-container-high rounded-xl shadow-xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center border-b border-surface-container pb-2">
                  <h3 className="text-lg font-bold text-on-surface">Edit Data Master Perangkat</h3>
                  <button onClick={() => setIsOpenEditModal(false)} className="text-outline hover:text-on-surface p-1.5 rounded-lg border cursor-pointer"><X className="w-5 h-5" /></button>
                </div>
                
                <form onSubmit={handleEditItemSubmit} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-outline uppercase">Nama Perangkat</label>
                    <input type="text" required value={editFormData.nama_perangkat} onChange={(e) => setEditFormData({...editFormData, nama_perangkat: e.target.value})} className="w-full px-4 py-2.5 border rounded-lg text-base font-medium" />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-outline uppercase">Jurusan</label>
                      <select disabled={isKabengOrKaprog} value={editFormData.id_jurusan} onChange={(e) => setEditFormData({...editFormData, id_jurusan: Number(e.target.value)})} className="w-full px-3 py-2.5 border rounded-lg text-sm font-semibold uppercase disabled:bg-slate-100 disabled:text-slate-500">
                        {jurusanList.map((j) => (<option key={j.id} value={j.id}>{j.nama_jurusan}</option>))}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-outline uppercase">Labor</label>
                      <select value={editFormData.id_labor} onChange={(e) => setEditFormData({...editFormData, id_labor: Number(e.target.value)})} className="w-full px-3 py-2.5 border rounded-lg text-sm font-semibold">
                        {filteredLaborList.map((l) => (<option key={l.id} value={l.id}>{l.labor}</option>))}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-outline uppercase">Kategori</label>
                      <select value={editFormData.kategori_id} onChange={(e) => setEditFormData({...editFormData, kategori_id: Number(e.target.value)})} className="w-full px-3 py-2.5 border rounded-lg text-sm font-semibold">
                        {kategoriList.map((k) => (<option key={k.id} value={k.id}>{k.kategori}</option>))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-outline uppercase">Deskripsi / Catatan</label>
                    <textarea rows={2} value={editFormData.deskripsi} onChange={(e) => setEditFormData({...editFormData, deskripsi: e.target.value})} className="w-full px-4 py-2.5 border rounded-lg text-base font-medium resize-none" />
                  </div>

                  <div className="flex justify-end gap-3 pt-3 border-t">
                    <button type="button" disabled={isSubmitting} onClick={() => setIsOpenEditModal(false)} className="px-5 py-2.5 text-sm font-bold text-secondary">Batal</button>
                    <button type="submit" disabled={isSubmitting} className="px-6 py-2.5 text-sm font-bold text-white bg-primary rounded-lg shadow-sm disabled:opacity-50">
                      {isSubmitting ? 'Memperbarui...' : 'Update Data'}
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