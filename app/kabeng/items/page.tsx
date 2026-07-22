"use client";

import React, { useState, useEffect } from 'react';
import PageAnimateWrapper from '@/components/page-animate-wrapper';
import { Plus, Edit2, Trash2, X, Search, Loader2, Boxes } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { 
  apiJurusan, Jurusan, 
  apiKategori, Kategori, 
  apiLabor, Labor,
  apiPerangkat, Perangkat 
} from '@/lib/api';
import { incrementKodeAsset } from '@/lib/utils-asset';

// Tipe untuk tampilan gabungan/grouped di tabel utama
interface GroupedPerangkat {
  nama_perangkat: string;
  kode_asset_sample: string; // sampel kode asset (misal: rpl-001)
  kategori_id: number;
  id_jurusan: number;
  id_labor: number;
  status: string;
  deskripsi: string;
  jumlah: number;
  items: Perangkat[]; // daftar seluruh ID unit di grup ini
}

export default function KabengItemsPage() {
  const router = useRouter();
  const [rawItems, setRawItems] = useState<Perangkat[]>([]);
  const [groupedItems, setGroupedItems] = useState<GroupedPerangkat[]>([]);
  const [loadingItems, setLoadingItems] = useState<boolean>(true);
  const [errorItems, setErrorItems] = useState<string | null>(null);

  const [isOpenAddModal, setIsOpenAddModal] = useState(false);
  const [isOpenEditModal, setIsOpenEditModal] = useState(false);
  
  // State untuk item yang sedang diedit
  const [editingGroup, setEditingGroup] = useState<GroupedPerangkat | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');

  const [jurusanList, setJurusanList] = useState<Jurusan[]>([]);
  const [kategoriList, setKategoriList] = useState<Kategori[]>([]);
  const [laborList, setLaborList] = useState<Labor[]>([]);

  // Form State Tambah
  const [addFormData, setAddFormData] = useState({
    nama_perangkat: '',
    kode_asset: '',
    jumlah_unit: 1,
    kategori_id: 0,
    id_jurusan: 0,
    id_labor: 0,
    status: 'aktif',
    deskripsi: ''
  });

  // Form State Edit
  const [editFormData, setEditFormData] = useState({
    nama_perangkat: '',
    kategori_id: 0,
    id_jurusan: 0,
    id_labor: 0,
    status: 'aktif',
    deskripsi: ''
  });

  // Fungsi mengelompokkan data berdasarkan Nama Perangkat
  const processGroupedItems = (data: Perangkat[]) => {
    const groups: { [key: string]: GroupedPerangkat } = {};

    data.forEach(item => {
      const key = item.nama_perangkat.trim().toLowerCase();
      if (!groups[key]) {
        groups[key] = {
          nama_perangkat: item.nama_perangkat,
          kode_asset_sample: item.kode_asset,
          kategori_id: item.kategori_id,
          id_jurusan: item.id_jurusan,
          id_labor: item.id_labor,
          status: item.status,
          deskripsi: item.deskripsi,
          jumlah: 1,
          items: [item]
        };
      } else {
        groups[key].jumlah += 1;
        groups[key].items.push(item);
      }
    });

    return Object.values(groups);
  };

  const fetchItems = async () => {
    try {
      setLoadingItems(true);
      setErrorItems(null);
      const data = await apiPerangkat.getAll();
      setRawItems(data);
      setGroupedItems(processGroupedItems(data));
    } catch (err: any) {
      setErrorItems(err.message || 'Gagal memuat data perangkat');
    } finally {
      setLoadingItems(false);
    }
  };

  const fetchMasterData = async () => {
    try {
      const [dataJurusan, dataKategori, dataLabor] = await Promise.all([
        apiJurusan.getAll(),
        apiKategori.getAll(),
        apiLabor.getAll()
      ]);

      setJurusanList(dataJurusan);
      setKategoriList(dataKategori);
      setLaborList(dataLabor);

      if (dataJurusan.length > 0 && addFormData.id_jurusan === 0) {
        setAddFormData(prev => ({ ...prev, id_jurusan: dataJurusan[0].id }));
      }
      if (dataKategori.length > 0 && addFormData.kategori_id === 0) {
        setAddFormData(prev => ({ ...prev, kategori_id: dataKategori[0].id }));
      }
      if (dataLabor.length > 0 && addFormData.id_labor === 0) {
        setAddFormData(prev => ({ ...prev, id_labor: dataLabor[0].id }));
      }
    } catch (err) {
      console.error("Gagal memuat master data:", err);
    }
  };

  useEffect(() => {
    fetchItems();
    fetchMasterData();
  }, []);

  const getJurusanName = (id: number) => jurusanList.find(j => j.id === id)?.nama_jurusan || `ID: ${id}`;
  const getLaborName = (id: number) => laborList.find(l => l.id === id)?.labor || `ID: ${id}`;
  const getKategoriName = (id: number) => kategoriList.find(k => k.id === id)?.kategori || `ID: ${id}`;

  // Filter Grouped Items Realtime
  const filteredGroups = groupedItems.filter((group) => {
    const q = searchQuery.toLowerCase().trim();
    return (
      group.nama_perangkat.toLowerCase().includes(q) ||
      group.kode_asset_sample.toLowerCase().includes(q)
    );
  });

  // Handler Buka Modal Edit
  const handleEditClick = (group: GroupedPerangkat) => {
    setEditingGroup(group);
    setEditFormData({
      nama_perangkat: group.nama_perangkat,
      kategori_id: group.kategori_id,
      id_jurusan: group.id_jurusan,
      id_labor: group.id_labor,
      status: group.status,
      deskripsi: group.deskripsi || ''
    });
    setIsOpenEditModal(true);
  };

  // Handler Hapus Seluruh Group Perangkat
  const handleDeleteGroup = async (group: GroupedPerangkat) => {
    if (!confirm(`Yakin ingin menghapus seluruh ${group.jumlah} unit [${group.nama_perangkat}]?`)) return;

    try {
      setIsSubmitting(true);
      // Hapus seluruh instance yang berada di grup ini
      await Promise.all(group.items.map(item => apiPerangkat.delete(item.id)));
      await fetchItems();
      alert('Perangkat berhasil dihapus!');
    } catch (err: any) {
      alert(`Gagal menghapus: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Handler Tambah Barang
  const handleAddItemSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const totalUnits = Math.max(1, addFormData.jumlah_unit);
      const requests = [];

      for (let i = 0; i < totalUnits; i++) {
        const generatedKodeAsset = incrementKodeAsset(addFormData.kode_asset, i);
        requests.push(
          apiPerangkat.create({
            nama_perangkat: addFormData.nama_perangkat,
            kode_asset: generatedKodeAsset,
            kategori_id: Number(addFormData.kategori_id),
            id_jurusan: Number(addFormData.id_jurusan),
            id_labor: Number(addFormData.id_labor),
            status: addFormData.status,
            deskripsi: addFormData.deskripsi
          })
        );
      }

      await Promise.all(requests);
      await fetchItems();
      setIsOpenAddModal(false);
      
      setAddFormData({
        nama_perangkat: '',
        kode_asset: '',
        jumlah_unit: 1,
        kategori_id: kategoriList[0]?.id || 0,
        id_jurusan: jurusanList[0]?.id || 0,
        id_labor: laborList[0]?.id || 0,
        status: 'aktif',
        deskripsi: ''
      });
      alert(`Berhasil menambahkan ${totalUnits} unit perangkat!`);
    } catch (err: any) {
      alert(`Gagal menyimpan: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Submit Handler Edit Barang (Update Semua Unit di Group Tersebut)
  const handleEditItemSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingGroup) return;

    try {
      setIsSubmitting(true);
      // Perbarui atribut seluruh unit dalam grup ini
      const requests = editingGroup.items.map(item =>
        apiPerangkat.update(item.id, {
          nama_perangkat: editFormData.nama_perangkat,
          kategori_id: Number(editFormData.kategori_id),
          id_jurusan: Number(editFormData.id_jurusan),
          id_labor: Number(editFormData.id_labor),
          status: editFormData.status,
          deskripsi: editFormData.deskripsi
        })
      );

      await Promise.all(requests);
      await fetchItems();
      setIsOpenEditModal(false);
      setEditingGroup(null);
      alert('Data perangkat berhasil diperbarui!');
    } catch (err: any) {
      alert(`Gagal memperbarui: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageAnimateWrapper>
      <div className="space-y-6 font-sans antialiased tracking-tight">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 border-b border-surface-container pb-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-on-surface">Manajemen & Registrasi Perangkat</h1>
            <p className="text-base text-on-surface-variant mt-1 font-medium">Input data aset perangkat baru dan kelola unit laboratorium.</p>
          </div>
          <button 
            onClick={() => setIsOpenAddModal(true)}
            className="px-5 py-2.5 text-sm font-bold text-white bg-primary hover:bg-primary-container rounded-lg flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer w-full sm:w-auto shrink-0"
          >
            <Plus className="w-5 h-5" /> Input Perangkat Baru
          </button>
        </div>

        {/* 🔍 Search Bar */}
        <div className="flex items-center gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-outline pointer-events-none" />
            <input 
              type="text" 
              placeholder="Cari nama perangkat / kode asset..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-2.5 bg-white border border-surface-container-high rounded-xl text-base text-on-surface placeholder:text-outline/60 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all font-medium shadow-xs"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface p-1 rounded-full cursor-pointer transition-colors"
              >
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
                  <th className="p-5 text-sm font-bold text-on-surface tracking-wide uppercase">Nama Perangkat</th>
                  <th className="p-5 text-sm font-bold text-on-surface tracking-wide uppercase">Klaster Labor</th>
                  <th className="p-5 text-sm font-bold text-on-surface tracking-wide uppercase">Kategori</th>
                  <th className="p-5 text-sm font-bold text-on-surface tracking-wide uppercase text-center">Jumlah Stok</th>
                  <th className="p-5 text-sm font-bold text-on-surface tracking-wide uppercase text-center">Status</th>
                  <th className="p-5 text-sm font-bold text-on-surface tracking-wide uppercase text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="text-on-surface font-semibold relative">
                {loadingItems ? (
                  <tr>
                    <td colSpan={6} className="p-10 text-center text-outline font-medium">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" />
                      Memuat data perangkat...
                    </td>
                  </tr>
                ) : errorItems ? (
                  <tr>
                    <td colSpan={6} className="p-10 text-center text-error font-bold">{errorItems}</td>
                  </tr>
                ) : filteredGroups.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-10 text-center text-outline font-medium">Data perangkat tidak ditemukan.</td>
                  </tr>
                ) : (
                  <AnimatePresence initial={false}>
                    {filteredGroups.map((group, idx) => (
                      <motion.tr 
                        key={idx}
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="hover:bg-surface-low/30 border-b border-surface-container overflow-hidden"
                      >
                        <td className="p-5 whitespace-nowrap">
                          <span className="block text-base font-bold text-primary">{group.nama_perangkat}</span>
                          <span className="block text-xs font-mono text-outline mt-0.5 font-bold">Base Asset: {group.kode_asset_sample}</span>
                          {group.deskripsi && (
                            <span className="block text-xs text-on-surface-variant italic mt-1 font-medium bg-surface-low px-2 py-0.5 rounded border border-surface-container-high w-fit">
                              Deskripsi: {group.deskripsi}
                            </span>
                          )}
                        </td>
                        <td className="p-5 whitespace-nowrap">
                          <span className="block text-base font-bold text-on-surface">{getLaborName(group.id_labor)}</span>
                          <span className="block text-sm text-outline mt-0.5 uppercase">Jurusan: {getJurusanName(group.id_jurusan)}</span>
                        </td>
                        <td className="p-5 text-base font-bold text-on-surface-variant whitespace-nowrap">
                          {getKategoriName(group.kategori_id)}
                        </td>
                        {/* 🔴 KOLOM JUMLAH BARANG / STOK 🔴 */}
                        <td className="p-5 text-center whitespace-nowrap">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-extrabold bg-primary/10 text-primary border border-primary/20">
                            {group.jumlah} Unit
                          </span>
                        </td>
                        <td className="p-5 text-center whitespace-nowrap">
                          <span className={`inline-block px-3 py-1 rounded-md text-sm font-bold border uppercase ${
                            group.status === 'aktif' ? 'bg-green-100 text-green-900 border-green-300' :
                            group.status === 'perbaikan' ? 'bg-amber-100 text-amber-900 border-amber-300' :
                            group.status === 'rusak' ? 'bg-red-100 text-red-900 border-red-300' :
                            'bg-gray-100 text-gray-800 border-gray-300'
                          }`}>
                            {group.status}
                          </span>
                        </td>
                        <td className="p-5 text-right space-x-2 whitespace-nowrap">
                          {/* Tombol Ke Page Unit Instance */}
                          <button 
                            onClick={() => router.push(`/kabeng/items/${group.items[0].id}`)}
                            className="p-2.5 border border-primary/20 text-primary hover:bg-primary/10 rounded-lg transition-all cursor-pointer inline-flex items-center gap-1 font-bold text-xs"
                            title="Lihat Unit Instance"
                          >
                            <Boxes className="w-4 h-4" /> Unit
                          </button>
                          
                          {/* 🔴 TOMBOL EDIT AKTIF 🔴 */}
                          <button 
                            type="button"
                            onClick={() => handleEditClick(group)}
                            className="p-2.5 border border-surface-container text-outline hover:text-primary hover:bg-secondary-container rounded-lg transition-all cursor-pointer inline-flex items-center"
                            title="Edit Perangkat"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          {/* Tombol Hapus */}
                          <button 
                            type="button"
                            onClick={() => handleDeleteGroup(group)}
                            className="p-2.5 border border-surface-container text-outline hover:text-error hover:bg-error-container rounded-lg transition-all cursor-pointer inline-flex items-center"
                            title="Hapus Perangkat"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* MODAL INPUT PERANGKAT BARU */}
        <AnimatePresence>
          {isOpenAddModal && (
            <div className="fixed inset-0 bg-on-surface/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                className="bg-white w-full max-w-xl border border-surface-container-high rounded-xl shadow-xl p-6 space-y-4"
              >
                <div className="flex justify-between items-center border-b border-surface-container pb-2">
                  <h3 className="text-lg font-bold text-on-surface">Input Data Perangkat Baru</h3>
                  <button onClick={() => setIsOpenAddModal(false)} className="text-outline hover:text-on-surface p-1.5 rounded-lg border border-surface-container cursor-pointer"><X className="w-5 h-5" /></button>
                </div>
                
                <form onSubmit={handleAddItemSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-2 space-y-1">
                      <label className="text-xs font-bold text-outline uppercase tracking-wider">Nama Perangkat</label>
                      <input 
                        type="text" 
                        required
                        placeholder="Contoh: Laptop Asus ExpertBook" 
                        value={addFormData.nama_perangkat}
                        onChange={(e) => setAddFormData({...addFormData, nama_perangkat: e.target.value})}
                        className="w-full px-4 py-2.5 border border-surface-container-high rounded-lg text-base font-medium"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-outline uppercase tracking-wider">Jumlah Unit</label>
                      <input 
                        type="number" 
                        min="1"
                        required
                        value={addFormData.jumlah_unit}
                        onChange={(e) => setAddFormData({...addFormData, jumlah_unit: parseInt(e.target.value, 10) || 1})}
                        className="w-full px-4 py-2.5 border border-surface-container-high rounded-lg text-base font-bold text-center"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-outline uppercase tracking-wider">
                      Kode Asset Awal
                    </label>
                    <input 
                      type="text" 
                      required
                      placeholder="Contoh: rpl-001" 
                      value={addFormData.kode_asset}
                      onChange={(e) => setAddFormData({...addFormData, kode_asset: e.target.value})}
                      className="w-full px-4 py-2.5 border border-surface-container-high rounded-lg text-base font-mono font-medium"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-outline uppercase tracking-wider">Jurusan</label>
                      <select 
                        required
                        value={addFormData.id_jurusan}
                        onChange={(e) => setAddFormData({...addFormData, id_jurusan: Number(e.target.value)})}
                        className="w-full px-3 py-2.5 border border-surface-container-high rounded-lg text-sm font-semibold"
                      >
                        {jurusanList.map((j) => (
                          <option key={j.id} value={j.id}>{j.nama_jurusan}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-outline uppercase tracking-wider">Labor</label>
                      <select 
                        required
                        value={addFormData.id_labor}
                        onChange={(e) => setAddFormData({...addFormData, id_labor: Number(e.target.value)})}
                        className="w-full px-3 py-2.5 border border-surface-container-high rounded-lg text-sm font-semibold"
                      >
                        {laborList.map((l) => (
                          <option key={l.id} value={l.id}>{l.labor}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-outline uppercase tracking-wider">Kategori</label>
                      <select 
                        required
                        value={addFormData.kategori_id}
                        onChange={(e) => setAddFormData({...addFormData, kategori_id: Number(e.target.value)})}
                        className="w-full px-3 py-2.5 border border-surface-container-high rounded-lg text-sm font-semibold"
                      >
                        {kategoriList.map((k) => (
                          <option key={k.id} value={k.id}>{k.kategori}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-outline uppercase tracking-wider">Status Perangkat</label>
                    <select 
                      value={addFormData.status}
                      onChange={(e) => setAddFormData({...addFormData, status: e.target.value})}
                      className="w-full px-4 py-2.5 border border-surface-container-high rounded-lg text-base font-semibold"
                    >
                      <option value="aktif">aktif</option>
                      <option value="perbaikan">perbaikan</option>
                      <option value="rusak">rusak</option>
                      <option value="nonaktif">nonaktif</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-outline uppercase tracking-wider">Deskripsi / Catatan</label>
                    <textarea 
                      rows={2}
                      placeholder="Masukkan spesifikasi ringkas..." 
                      value={addFormData.deskripsi}
                      onChange={(e) => setAddFormData({...addFormData, deskripsi: e.target.value})}
                      className="w-full px-4 py-2.5 border border-surface-container-high rounded-lg text-base font-medium resize-none"
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-3 border-t border-surface-container">
                    <button 
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => setIsOpenAddModal(false)} 
                      className="px-5 py-2.5 text-sm font-bold text-secondary hover:bg-surface-low rounded-lg"
                    >
                      Batal
                    </button>
                    <button 
                      type="submit" 
                      disabled={isSubmitting}
                      className="px-6 py-2.5 text-sm font-bold text-white bg-primary hover:bg-primary-container rounded-lg cursor-pointer shadow-sm disabled:opacity-50"
                    >
                      {isSubmitting ? 'Menyimpan...' : `Simpan ${addFormData.jumlah_unit} Unit`}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* 🔴 MODAL EDIT PERANGKAT SANGAT PRESISI 🔴 */}
        <AnimatePresence>
          {isOpenEditModal && editingGroup && (
            <div className="fixed inset-0 bg-on-surface/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                className="bg-white w-full max-w-xl border border-surface-container-high rounded-xl shadow-xl p-6 space-y-4"
              >
                <div className="flex justify-between items-center border-b border-surface-container pb-2">
                  <h3 className="text-lg font-bold text-on-surface">Edit Perangkat ({editingGroup.jumlah} Unit)</h3>
                  <button onClick={() => setIsOpenEditModal(false)} className="text-outline hover:text-on-surface p-1.5 rounded-lg border border-surface-container cursor-pointer"><X className="w-5 h-5" /></button>
                </div>
                
                <form onSubmit={handleEditItemSubmit} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-outline uppercase tracking-wider">Nama Perangkat</label>
                    <input 
                      type="text" 
                      required
                      value={editFormData.nama_perangkat}
                      onChange={(e) => setEditFormData({...editFormData, nama_perangkat: e.target.value})}
                      className="w-full px-4 py-2.5 border border-surface-container-high rounded-lg text-base font-medium"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-outline uppercase tracking-wider">Jurusan</label>
                      <select 
                        value={editFormData.id_jurusan}
                        onChange={(e) => setEditFormData({...editFormData, id_jurusan: Number(e.target.value)})}
                        className="w-full px-3 py-2.5 border border-surface-container-high rounded-lg text-sm font-semibold"
                      >
                        {jurusanList.map((j) => (
                          <option key={j.id} value={j.id}>{j.nama_jurusan}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-outline uppercase tracking-wider">Labor</label>
                      <select 
                        value={editFormData.id_labor}
                        onChange={(e) => setEditFormData({...editFormData, id_labor: Number(e.target.value)})}
                        className="w-full px-3 py-2.5 border border-surface-container-high rounded-lg text-sm font-semibold"
                      >
                        {laborList.map((l) => (
                          <option key={l.id} value={l.id}>{l.labor}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-outline uppercase tracking-wider">Kategori</label>
                      <select 
                        value={editFormData.kategori_id}
                        onChange={(e) => setEditFormData({...editFormData, kategori_id: Number(e.target.value)})}
                        className="w-full px-3 py-2.5 border border-surface-container-high rounded-lg text-sm font-semibold"
                      >
                        {kategoriList.map((k) => (
                          <option key={k.id} value={k.id}>{k.kategori}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-outline uppercase tracking-wider">Status Perangkat</label>
                    <select 
                      value={editFormData.status}
                      onChange={(e) => setEditFormData({...editFormData, status: e.target.value})}
                      className="w-full px-4 py-2.5 border border-surface-container-high rounded-lg text-base font-semibold"
                    >
                      <option value="aktif">aktif</option>
                      <option value="perbaikan">perbaikan</option>
                      <option value="rusak">rusak</option>
                      <option value="nonaktif">nonaktif</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-outline uppercase tracking-wider">Deskripsi / Catatan</label>
                    <textarea 
                      rows={2}
                      value={editFormData.deskripsi}
                      onChange={(e) => setEditFormData({...editFormData, deskripsi: e.target.value})}
                      className="w-full px-4 py-2.5 border border-surface-container-high rounded-lg text-base font-medium resize-none"
                    />
                  </div>

                  <div className="flex justify-end gap-3 pt-3 border-t border-surface-container">
                    <button 
                      type="button"
                      disabled={isSubmitting}
                      onClick={() => setIsOpenEditModal(false)} 
                      className="px-5 py-2.5 text-sm font-bold text-secondary hover:bg-surface-low rounded-lg"
                    >
                      Batal
                    </button>
                    <button 
                      type="submit" 
                      disabled={isSubmitting}
                      className="px-6 py-2.5 text-sm font-bold text-white bg-primary hover:bg-primary-container rounded-lg cursor-pointer shadow-sm disabled:opacity-50"
                    >
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
}1