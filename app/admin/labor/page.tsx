"use client";

import React, { useEffect, useState, useCallback } from 'react';
import PageAnimateWrapper from '@/components/page-animate-wrapper';
import { Trash2, Edit, Loader2, RefreshCw } from 'lucide-react';
import { apiLabor, apiJurusan, Labor, Jurusan } from '@/lib/api';

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

  // Helper untuk mendapatkan nama jurusan secara presisi
  const getJurusanName = (labor: Labor) => {
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
                    <td colSpan={3} className="p-8 text-center text-error">
                      {error}
                    </td>
                  </tr>
                ) : labors.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="p-8 text-center text-outline">
                      Belum ada data laboratorium.
                    </td>
                  </tr>
                ) : (
                  labors.map((labor) => (
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
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(labor.id, labor.labor)}
                          className="p-2 text-outline hover:text-error hover:bg-error-container/40 rounded-lg transition-colors cursor-pointer"
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
        </div>

        {editingLabor && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
            <div className="bg-white border border-surface-container-high rounded-2xl p-6 max-w-md w-full space-y-4 shadow-xl">
              <h3 className="text-xl font-bold text-on-surface">Edit Data Labor</h3>
              <form onSubmit={handleUpdate} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-outline uppercase tracking-wider">Nama Labor</label>
                  <input
                    type="text"
                    required
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    className="w-full px-4 py-3 border border-surface-container-high rounded-xl text-base focus:outline-none focus:border-primary font-bold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-outline uppercase tracking-wider">Jurusan</label>
                  <select
                    required
                    value={editJurusanId}
                    onChange={(e) => setEditJurusanId(e.target.value)}
                    className="w-full px-4 py-3 border border-surface-container-high rounded-xl text-base focus:outline-none focus:border-primary bg-white font-medium cursor-pointer"
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
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditingLabor(null)}
                    className="px-4 py-2 font-bold text-on-surface-variant hover:bg-surface-low rounded-lg cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isUpdating}
                    className="px-4 py-2 font-bold text-white bg-primary rounded-lg disabled:opacity-50 cursor-pointer"
                  >
                    {isUpdating ? 'Simpan...' : 'Update'}
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