"use client";

import React, { useState, useEffect } from 'react';
import PageAnimateWrapper from '@/components/page-animate-wrapper';
import { Search, MonitorCheck, Calendar, Filter, Loader2, Trash2, RefreshCw } from 'lucide-react';
import { apiLabor, apiPenggunaan, Labor, Penggunaan } from '@/lib/api';

export default function PenggunaanLaborPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLabor, setSelectedLabor] = useState('Semua');

  // State Data Backend
  const [usageLogs, setUsageLogs] = useState<Penggunaan[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [laborList, setLaborList] = useState<Labor[]>([]);
  const [loadingLabor, setLoadingLabor] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Fetch daftar laboratorium dan log penggunaan
  const fetchData = async () => {
    try {
      setLoadingLogs(true);
      setLoadingLabor(true);
      setErrorMsg(null);

      const [dataLogs, dataLabor] = await Promise.all([
        apiPenggunaan.getAll(),
        apiLabor.getAll(),
      ]);

      setUsageLogs(Array.isArray(dataLogs) ? dataLogs : []);
      setLaborList(Array.isArray(dataLabor) ? dataLabor : []);
    } catch (err: any) {
      console.error('Gagal memuat data penggunaan:', err);
      setErrorMsg(err.message || 'Gagal memuat log penggunaan laboratorium.');
    } finally {
      setLoadingLogs(false);
      setLoadingLabor(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus log penggunaan ini?')) return;
    try {
      await apiPenggunaan.delete(id);
      setUsageLogs((prev) => prev.filter((item) => item.id !== id));
      alert('Log penggunaan berhasil dihapus.');
    } catch (err: any) {
      alert(err.message || 'Gagal menghapus log penggunaan');
    }
  };

  // Helper Format Tanggal yang Aman
  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '-';
      return new Intl.DateTimeFormat('id-ID', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      }).format(date);
    } catch {
      return '-';
    }
  };

  // Filtering Logic
  const filteredLogs = usageLogs.filter((log) => {
    const namaKelas = log.kelas?.kelas || '';
    const namaLabor = log.labor?.labor || '';
    const namaGuru = log.nama_pengguna || '';

    const matchesSearch =
      namaKelas.toLowerCase().includes(searchQuery.toLowerCase()) ||
      namaGuru.toLowerCase().includes(searchQuery.toLowerCase()) ||
      namaLabor.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesLabor =
      selectedLabor === 'Semua' || namaLabor.toLowerCase() === selectedLabor.toLowerCase();

    return matchesSearch && matchesLabor;
  });

  return (
    <PageAnimateWrapper>
      <div className="space-y-6 font-sans antialiased tracking-tight">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 border-b border-surface-container pb-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-on-surface">Log Pemakaian Ruang Laboratorium</h1>
            <p className="text-base text-on-surface-variant mt-1 font-medium">
              Daftar rekapitulasi penggunaan ruang praktikum yang telah diinputkan oleh tenaga pendidik/guru.
            </p>
          </div>
          <button
            onClick={fetchData}
            disabled={loadingLogs}
            className="self-start sm:self-auto flex items-center gap-2 px-4 py-2 text-sm font-semibold text-primary bg-primary/10 hover:bg-primary/20 rounded-xl transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loadingLogs ? 'animate-spin' : ''}`} />
            Refresh Data
          </button>
        </div>

        {/* Filters & Search Bar */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-4 rounded-xl border border-surface-container-high shadow-xs">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-outline absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari kelas, laboratorium, atau guru..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-surface-container rounded-lg focus:outline-none focus:border-primary font-medium"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-outline shrink-0" />
            <select
              value={selectedLabor}
              onChange={(e) => setSelectedLabor(e.target.value)}
              disabled={loadingLabor}
              className="w-full sm:w-auto px-3 py-2 text-sm border border-surface-container rounded-lg focus:outline-none focus:border-primary bg-white font-medium text-on-surface disabled:bg-surface-low cursor-pointer"
            >
              <option value="Semua">Semua Laboratorium</option>
              {laborList.map((item) => (
                <option key={item.id} value={item.labor}>
                  {item.labor}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Tabel Rekap Log */}
        <div className="bg-white border border-surface-container-high rounded-xl overflow-hidden shadow-xs w-full space-y-3">
          <div className="px-5 pt-5 flex items-center justify-between">
            <h2 className="text-lg font-bold text-on-surface flex items-center gap-2">
              <MonitorCheck className="w-5 h-5 text-primary" />
              Daftar Pemakaian Kelas Praktikum
            </h2>
            <span className="text-xs font-bold text-outline uppercase bg-surface-low px-2.5 py-1 rounded-md">
              Total: {filteredLogs.length} Entri
            </span>
          </div>

          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse text-base min-w-[900px]">
              <thead className="bg-surface-low border-y border-surface-container-high">
                <tr>
                  <th className="p-4 text-xs font-bold text-on-surface tracking-wide uppercase">TGL & ID</th>
                  <th className="p-4 text-xs font-bold text-on-surface tracking-wide uppercase">Kelas Menggunakan</th>
                  <th className="p-4 text-xs font-bold text-on-surface tracking-wide uppercase">Laboratorium</th>
                  <th className="p-4 text-xs font-bold text-on-surface tracking-wide uppercase text-center">Durasi Jam Pelajaran</th>
                  <th className="p-4 text-xs font-bold text-on-surface tracking-wide uppercase">Guru Penginput</th>
                  <th className="p-4 text-xs font-bold text-on-surface tracking-wide uppercase text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container text-on-surface font-semibold">
                {loadingLogs ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-outline">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" />
                      Memuat log penggunaan...
                    </td>
                  </tr>
                ) : errorMsg ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-red-600 font-medium">
                      {errorMsg}
                    </td>
                  </tr>
                ) : filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-outline font-medium">
                      Tidak ada log penggunaan laboratorium yang sesuai.
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-surface-low/30 transition-colors">
                      <td className="p-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-on-surface flex items-center gap-1.5">
                          <Calendar className="w-3.5 h-3.5 text-outline" />{' '}
                          {formatDate(log.created_at)}
                        </div>
                        <span className="text-xs font-mono text-outline font-semibold">LOG-{log.id}</span>
                      </td>

                      <td className="p-4 text-base font-bold text-primary whitespace-nowrap">
                        {log.kelas?.kelas || '-'}
                      </td>

                      <td className="p-4 text-sm font-medium text-on-surface-variant max-w-[240px] truncate">
                        {log.labor?.labor || '-'}
                      </td>

                      <td className="p-4 text-center whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-surface-low rounded-lg text-xs font-bold text-on-surface border border-surface-container">
                          Jam Ke-{log.jam_pelajaran_mulai} s/d Ke-{log.jam_pelajaran_selesai}
                        </span>
                      </td>

                      <td className="p-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-on-surface">{log.nama_pengguna || '-'}</div>
                      </td>

                      <td className="p-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => handleDelete(log.id)}
                          className="p-1.5 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
                          title="Hapus Log"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </PageAnimateWrapper>
  );
}