"use client";

import React, { useEffect, useState } from 'react';
import PageAnimateWrapper from '@/components/page-animate-wrapper';
import { Trash2, Edit, Loader2, RefreshCw } from 'lucide-react';
import { apiLabor, Labor } from '@/lib/api';

export default function ReadLaborPage() {
  const [labors, setLabors] = useState<Labor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State Modal Edit
  const [editingLabor, setEditingLabor] = useState<Labor | null>(null);
  const [editValue, setEditValue] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchLabors = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await apiLabor.getAll();
      setLabors(data);
    } catch (err: any) {
      setError(err.message || 'Gagal memuat data labor');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLabors();
  }, []);

  const handleDelete = async (id: number, nama: string) => {
    if (!confirm(`Yakin ingin menghapus [${nama}]?`)) return;

    try {
      await apiLabor.delete(id);
      setLabors((prev) => prev.filter((item) => item.id !== id));
    } catch (err: any) {
      alert(`Gagal menghapus: ${err.message}`);
    }
  };

  const handleOpenEdit = (labor: Labor) => {
    setEditingLabor(labor);
    setEditValue(labor.labor);
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingLabor) return;

    try {
      setIsUpdating(true);
      const updated = await apiLabor.update(editingLabor.id, editValue);
      setLabors((prev) =>
        prev.map((item) => (item.id === editingLabor.id ? updated : item))
      );
      setEditingLabor(null);
    } catch (err: any) {
      alert(`Gagal memperbarui: ${err.message}`);
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
            onClick={fetchLabors}
            className="p-2 border border-surface-container-high rounded-xl hover:bg-surface-low text-on-surface transition-all"
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
                  <th className="p-5 text-sm font-bold text-on-surface uppercase tracking-wider text-right w-32">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container text-on-surface font-medium">
                {loading ? (
                  <tr>
                    <td colSpan={2} className="p-8 text-center text-outline">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                      Memuat data laboratorium...
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td colSpan={2} className="p-8 text-center text-error">
                      {error}
                    </td>
                  </tr>
                ) : labors.length === 0 ? (
                  <tr>
                    <td colSpan={2} className="p-8 text-center text-outline">
                      Belum ada data laboratorium.
                    </td>
                  </tr>
                ) : (
                  labors.map((labor) => (
                    <tr key={labor.id} className="hover:bg-surface-low/30 transition-colors">
                      <td className="p-5 text-base font-extrabold text-on-surface whitespace-nowrap">
                        {labor.labor}
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

        {/* Modal Edit Simple */}
        {editingLabor && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
            <div className="bg-white border border-surface-container-high rounded-2xl p-6 max-w-md w-full space-y-4 shadow-xl">
              <h3 className="text-xl font-bold text-on-surface">Edit Data Labor</h3>
              <form onSubmit={handleUpdate} className="space-y-4">
                <input
                  type="text"
                  required
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="w-full px-4 py-3 border border-surface-container-high rounded-xl text-base focus:outline-none focus:border-primary"
                />
                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setEditingLabor(null)}
                    className="px-4 py-2 font-bold text-on-surface-variant hover:bg-surface-low rounded-lg"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isUpdating}
                    className="px-4 py-2 font-bold text-white bg-primary rounded-lg disabled:opacity-50"
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