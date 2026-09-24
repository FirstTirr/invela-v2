"use client";

import React, { useEffect, useState, useMemo } from 'react';
import PageAnimateWrapper from '@/components/page-animate-wrapper';
import { apiPeminjaman } from '@/lib/api/peminjaman';
import { Clock, CheckCircle2, Search, ChevronLeft, ChevronRight } from 'lucide-react';

export interface Peminjaman {
  id: number;
  id_item_instance: number;
  nama_peminjam: string;
  tanggal_pinjam?: string;
  tanggal_kembali?: string;
  status: string;
  item_instance?: {
    perangkat?: {
      nama_perangkat?: string;
    };
  };
}

export default function KaprogLoansPage() {
  const [loans, setLoans] = useState<Peminjaman[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  const [activeTab, setActiveTab] = useState<'aktif' | 'selesai'>('aktif');
  const [searchQuery, setSearchQuery] = useState('');

  // State Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);

  useEffect(() => {
    let isMounted = true;

    const fetchLoans = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await apiPeminjaman.getAll();
        if (isMounted) {
          setLoans(data);
        }
      } catch (err: unknown) {
        console.error("Failed to fetch loans:", err);
        if (isMounted) {
          if (err instanceof Error) {
            setError(err.message);
          } else {
            setError('Gagal mengambil data peminjaman.');
          }
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchLoans();

    return () => {
      isMounted = false;
    };
  }, []);

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toISOString().split('T')[0];
    } catch {
      return dateString;
    }
  };

  const activeLoans = useMemo(() => {
    return loans.filter((loan) => {
      const st = loan.status?.toLowerCase();
      return st === 'aktif' || st === 'dipinjam';
    });
  }, [loans]);

  const completedLoans = useMemo(() => {
    return loans.filter((loan) => {
      const st = loan.status?.toLowerCase();
      return st === 'selesai' || st === 'dikembalikan';
    });
  }, [loans]);

  const currentList = activeTab === 'aktif' ? activeLoans : completedLoans;

  // Filter Data berdasarkan Pencarian
  const filteredList = useMemo(() => {
    return currentList.filter((loan) => {
      const namaBarang = loan.item_instance?.perangkat?.nama_perangkat || '';
      const namaPeminjam = loan.nama_peminjam || '';
      const query = searchQuery.toLowerCase();

      return (
        namaBarang.toLowerCase().includes(query) ||
        namaPeminjam.toLowerCase().includes(query)
      );
    });
  }, [currentList, searchQuery]);

  // Reset Halaman ke 1 saat tab, pencarian, atau itemsPerPage berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchQuery, itemsPerPage]);

  // Kalkulasi Pagination
  const totalPages = Math.ceil(filteredList.length / itemsPerPage) || 1;

  const currentLoans = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredList.slice(start, start + itemsPerPage);
  }, [filteredList, currentPage, itemsPerPage]);

  const startIndex = (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(currentPage * itemsPerPage, filteredList.length);

  return (
    <PageAnimateWrapper>
      <div className="space-y-6 font-sans antialiased tracking-tight">
        <div>
          <h1 className="text-3xl font-bold text-on-surface">Monitoring Peminjaman Aset</h1>
          <p className="text-base text-on-surface-variant mt-1 font-medium">
            Log pemantauan aktivitas peminjaman barang labor yang dilakukan oleh civitas jurusan.
          </p>
        </div>

        {/* Navigation Tabs & Search Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex bg-surface-container/60 p-1 rounded-xl w-fit border border-surface-container-high">
            <button
              onClick={() => setActiveTab('aktif')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'aktif'
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-outline hover:text-on-surface'
              }`}
            >
              <Clock className="w-4 h-4" />
              Peminjaman Aktif
              <span className="ml-1 px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-900 font-extrabold">
                {activeLoans.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('selesai')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'selesai'
                  ? 'bg-white text-primary shadow-sm'
                  : 'text-outline hover:text-on-surface'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              Riwayat Selesai
              <span className="ml-1 px-2 py-0.5 text-xs rounded-full bg-gray-200 text-gray-700 font-extrabold">
                {completedLoans.length}
              </span>
            </button>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-outline" />
            <input
              type="text"
              placeholder="Cari barang / peminjam..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-surface-container-high rounded-xl text-sm focus:outline-none focus:border-primary text-on-surface font-medium placeholder:text-outline"
            />
          </div>
        </div>

        {/* Table Data */}
        <div className="bg-white border border-surface-container-high rounded-xl overflow-hidden shadow-sm">
          {loading ? (
            <div className="p-10 text-center text-outline font-medium">
              Memuat data peminjaman...
            </div>
          ) : error ? (
            <div className="p-10 text-center text-error font-medium">
              {error}
            </div>
          ) : filteredList.length === 0 ? (
            <div className="p-10 text-center text-outline font-medium">
              {searchQuery 
                ? 'Tidak ada data yang cocok dengan pencarian.' 
                : activeTab === 'aktif' 
                  ? 'Tidak ada peminjaman yang sedang aktif.' 
                  : 'Belum ada riwayat peminjaman yang selesai.'}
            </div>
          ) : (
            <>
              <div className="overflow-x-auto w-full">
                <table className="w-full text-left border-collapse text-base min-w-[700px]">
                  <thead className="bg-surface-low border-b border-surface-container-high">
                    <tr>
                      <th className="p-4 text-xs font-bold uppercase w-12 text-center text-on-surface">NO</th>
                      <th className="p-5 text-sm font-bold text-on-surface tracking-wide uppercase">Nama Barang</th>
                      <th className="p-5 text-sm font-bold text-on-surface tracking-wide uppercase">Nama Peminjam</th>
                      <th className="p-5 text-sm font-bold text-on-surface tracking-wide uppercase text-center">Tgl Mulai</th>
                      <th className="p-5 text-sm font-bold text-on-surface tracking-wide uppercase text-center">Tgl Selesai</th>
                      <th className="p-5 text-sm font-bold text-on-surface tracking-wide uppercase text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-container text-on-surface font-medium">
                    {currentLoans.map((loan, idx) => {
                      const namaBarang =
                        loan.item_instance?.perangkat?.nama_perangkat ||
                        `Barang #${loan.id_item_instance}`;

                      const isAktif = loan.status?.toLowerCase() === 'aktif' || loan.status?.toLowerCase() === 'dipinjam';

                      return (
                        <tr key={loan.id} className="hover:bg-surface-low/30 transition-colors">
                          <td className="p-4 text-center text-outline font-mono text-xs font-bold">
                            {(currentPage - 1) * itemsPerPage + idx + 1}
                          </td>
                          <td className="p-5 text-base font-bold text-primary">
                            {namaBarang}
                          </td>
                          <td className="p-5 text-base text-on-surface-variant font-bold">
                            {loan.nama_peminjam}
                          </td>
                          <td className="p-5 text-center font-mono text-base text-outline tabular-nums">
                            {formatDate(loan.tanggal_pinjam)}
                          </td>
                          <td className="p-5 text-center font-mono text-base text-outline tabular-nums">
                            {formatDate(loan.tanggal_kembali)}
                          </td>
                          <td className="p-5 text-right">
                            <span className={`inline-block px-3 py-1 rounded-md text-sm font-bold capitalize ${
                              isAktif 
                                ? 'bg-blue-100 text-blue-900 border border-blue-300' 
                                : 'bg-surface-container text-outline'
                            }`}>
                              {loan.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Bar Kontrol Pagination */}
              <div className="p-4 border-t border-surface-container-high bg-surface-low/30 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4 text-xs font-semibold text-outline">
                  <span>
                    Menampilkan {startIndex} - {endIndex} dari {filteredList.length} peminjaman
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
            </>
          )}
        </div>
      </div>
    </PageAnimateWrapper>
  );
}