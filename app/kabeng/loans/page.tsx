"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import PageAnimateWrapper from '@/components/page-animate-wrapper';
import { Plus, Loader2, CheckCircle, History, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { apiPeminjaman, Peminjaman, CreatePeminjamanInput } from '@/lib/api';
import LoanModal from './LoanModal';

type PeminjamanItem = Omit<Peminjaman, 'item_instance'> & {
  item_instance?: {
    id: number;
    kode_asset: string;
    perangkat?: {
      nama_perangkat?: string;
      labor?: {
        id_jurusan?: number | string;
        jurusan_id?: number | string;
      };
      id_jurusan?: number | string;
    };
  };
};

export default function KabengLoansPage() {
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [loans, setLoans] = useState<PeminjamanItem[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // State Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Dedicated Event Handlers untuk mereset currentPage ke 1 secara sinkron saat pencarian/limit berubah
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1);
  };

  const handleItemsPerPageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const fetchLoans = useCallback(async () => {
    try {
      setLoading(true);
      const userStr = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
      const currentUser = userStr ? JSON.parse(userStr) : null;
      const myJurusanId = currentUser?.jurusan_id ? String(currentUser.jurusan_id) : null;

      const data = await apiPeminjaman.getAll();
      const filtered = ((data || []) as unknown as PeminjamanItem[]).filter((loan) => {
        if (loan.status === 'selesai') return false;
        if (!myJurusanId) return true;

        const itemJurusanId =
          loan.item_instance?.perangkat?.labor?.id_jurusan ||
          loan.item_instance?.perangkat?.labor?.jurusan_id ||
          loan.item_instance?.perangkat?.id_jurusan;
        return itemJurusanId ? String(itemJurusanId) === myJurusanId : true;
      });

      setLoans(filtered);
    } catch (err: unknown) {
      console.error('Gagal memuat peminjaman:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;

    const initFetch = async () => {
      setLoading(true);
      try {
        const userStr = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
        const currentUser = userStr ? JSON.parse(userStr) : null;
        const myJurusanId = currentUser?.jurusan_id ? String(currentUser.jurusan_id) : null;

        const data = await apiPeminjaman.getAll();
        const filtered = ((data || []) as unknown as PeminjamanItem[]).filter((loan) => {
          if (loan.status === 'selesai') return false;
          if (!myJurusanId) return true;

          const itemJurusanId =
            loan.item_instance?.perangkat?.labor?.id_jurusan ||
            loan.item_instance?.perangkat?.labor?.jurusan_id ||
            loan.item_instance?.perangkat?.id_jurusan;
          return itemJurusanId ? String(itemJurusanId) === myJurusanId : true;
        });

        if (active) {
          setLoans(filtered);
        }
      } catch (err: unknown) {
        console.error('Gagal memuat peminjaman:', err);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    initFetch();

    return () => {
      active = false;
    };
  }, []);

  // Filter berdasarkan pencarian
  const filteredLoans = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return loans;

    return loans.filter((loan) => {
      const namaBarang = loan.item_instance?.perangkat?.nama_perangkat?.toLowerCase() || '';
      const kodeAsset = loan.item_instance?.kode_asset?.toLowerCase() || '';
      const peminjam = loan.nama_peminjam?.toLowerCase() || '';
      const kelas = loan.kelas?.toLowerCase() || '';
      const telepon = loan.nomor_telepon?.toLowerCase() || '';

      return (
        namaBarang.includes(q) ||
        kodeAsset.includes(q) ||
        peminjam.includes(q) ||
        kelas.includes(q) ||
        telepon.includes(q)
      );
    });
  }, [loans, searchQuery]);

  // Perhitungan Pagination
  const totalPages = Math.ceil(filteredLoans.length / itemsPerPage) || 1;

  const currentLoans = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredLoans.slice(start, start + itemsPerPage);
  }, [filteredLoans, currentPage, itemsPerPage]);

  const startIndex = (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(currentPage * itemsPerPage, filteredLoans.length);

  const handleMarkAsDone = async (loan: PeminjamanItem) => {
    if (!confirm(`Apakah barang peminjaman "${loan.nama_peminjam}" sudah dikembalikan?`)) return;
    try {
      setUpdatingId(loan.id);

      await apiPeminjaman.update(loan.id, {
        status: 'selesai'
      });

      await fetchLoans();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Gagal mengubah status peminjaman';
      alert(errorMessage);
    } finally {
      setUpdatingId(null);
    }
  };

  const handleCreateLoan = async (data: {
    id_item_instance: number;
    nama_peminjam: string;
    kelas: string;
    nomor_telepon: string;
    tanggal_pinjam: string;
    tanggal_kembali: string;
    status: string;
  }) => {
    const payload: CreatePeminjamanInput = {
      id_item_instance: data.id_item_instance,
      nama_peminjam: data.nama_peminjam,
      kelas: data.kelas,
      nomor_telepon: data.nomor_telepon,
      tanggal_pinjam: data.tanggal_pinjam,
      tanggal_kembali: data.tanggal_kembali,
      status: data.status as 'aktif' | 'selesai' | 'melewati batas waktu',
    };
    await apiPeminjaman.create(payload);
  };

  const formatDateDisplay = (dateStr?: string) => {
    if (!dateStr) return '-';
    return dateStr.split('T')[0];
  };

  return (
    <PageAnimateWrapper>
      <div className="space-y-6 font-sans antialiased tracking-tight">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 border-b border-surface-container pb-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-on-surface">Log & Otorisasi Peminjaman</h1>
            <p className="text-base text-on-surface-variant mt-1 font-medium">
              Pantau batas waktu pengembalian alat labor dan input registrasi peminjaman siswa.
            </p>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Link href="/kabeng/loans/completed" className="px-4 py-2.5 text-sm font-bold border border-surface-container-high rounded-lg flex items-center justify-center gap-2 hover:bg-surface-low transition-colors">
              <History className="w-4 h-4" /> Riwayat Selesai
            </Link>
            <button onClick={() => setIsOpenModal(true)} className="px-5 py-2.5 text-sm font-bold text-white bg-primary rounded-lg flex items-center justify-center gap-2 shadow-xs cursor-pointer hover:bg-primary-container transition-colors">
              <Plus className="w-5 h-5" /> Input Peminjaman Baru
            </button>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white border border-surface-container-high rounded-xl p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md w-full">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-outline" />
            <input
              type="text"
              placeholder="Cari nama barang, peminjam, kelas, atau kode asset..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full pl-10 pr-4 py-2 border border-surface-container-high rounded-lg text-sm focus:outline-none focus:border-primary font-medium"
            />
          </div>
          <div className="text-right w-full md:w-auto text-xs font-bold text-outline uppercase">
            Total Peminjaman Aktif: <span className="text-sm font-black text-primary">{filteredLoans.length}</span>
          </div>
        </div>

        {/* Tabel Log Peminjaman */}
        <div className="bg-white border border-surface-container-high rounded-xl overflow-hidden shadow-xs w-full">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse text-base min-w-[850px]">
              <thead className="bg-surface-low border-b border-surface-container-high">
                <tr>
                  <th className="p-4 text-xs font-bold text-on-surface uppercase text-center w-12">No</th>
                  <th className="p-4 text-xs font-bold text-on-surface uppercase">Nama Barang</th>
                  <th className="p-4 text-xs font-bold text-on-surface uppercase">Kode Asset</th>
                  <th className="p-4 text-xs font-bold text-on-surface uppercase">Peminjam</th>
                  <th className="p-4 text-xs font-bold text-on-surface uppercase">Kelas</th>
                  <th className="p-4 text-xs font-bold text-on-surface uppercase text-center">Tgl Mulai</th>
                  <th className="p-4 text-xs font-bold text-on-surface uppercase text-center">Tgl Selesai</th>
                  <th className="p-4 text-xs font-bold text-on-surface uppercase text-center">Aksi / Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container font-semibold text-sm">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-outline">
                      <Loader2 className="w-6 h-6 animate-spin inline-block mr-2" /> Memuat data...
                    </td>
                  </tr>
                ) : filteredLoans.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-outline">
                      Tidak ada peminjaman aktif ditemukan.
                    </td>
                  </tr>
                ) : (
                  currentLoans.map((loan, idx) => (
                    <tr key={loan.id} className="hover:bg-surface-low/30">
                      <td className="p-4 text-center text-outline font-mono text-xs">
                        {(currentPage - 1) * itemsPerPage + idx + 1}
                      </td>
                      <td className="p-4 font-bold text-primary">{loan.item_instance?.perangkat?.nama_perangkat || '-'}</td>
                      <td className="p-4 font-mono text-xs text-outline">{loan.item_instance?.kode_asset || '-'}</td>
                      <td className="p-4">
                        {loan.nama_peminjam}
                        <span className="block text-xs text-outline font-normal">{loan.nomor_telepon}</span>
                      </td>
                      <td className="p-4">{loan.kelas || '-'}</td>
                      <td className="p-4 text-center font-mono text-outline text-xs">{formatDateDisplay(loan.tanggal_pinjam)}</td>
                      <td className="p-4 text-center font-mono text-outline text-xs">{formatDateDisplay(loan.tanggal_kembali)}</td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => handleMarkAsDone(loan)}
                          disabled={updatingId === loan.id}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border cursor-pointer transition-colors ${
                            loan.status === 'melewati batas waktu' 
                              ? 'bg-red-50 text-red-800 border-red-300 hover:bg-red-100' 
                              : 'bg-blue-50 text-blue-800 border-blue-300 hover:bg-emerald-100 hover:text-emerald-900'
                          }`}
                        >
                          {updatingId === loan.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <CheckCircle className="w-3.5 h-3.5 text-blue-600" />
                          )}
                          <span>
                            {loan.status === 'melewati batas waktu' ? 'Terlambat (Tandai Selesai)' : 'Aktif (Tandai Selesai)'}
                          </span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Bar Navigation Pagination */}
          {!loading && filteredLoans.length > 0 && (
            <div className="p-4 border-t border-surface-container-high bg-surface-low/30 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4 text-xs font-semibold text-outline">
                <span>
                  Menampilkan {startIndex} - {endIndex} dari {filteredLoans.length} peminjaman
                </span>
                <div className="flex items-center gap-2">
                  <span>Per halaman:</span>
                  <select
                    value={itemsPerPage}
                    onChange={handleItemsPerPageChange}
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
          )}
        </div>

        {/* Modal Form */}
        <AnimatePresence>
          {isOpenModal && (
            <LoanModal
              onClose={() => setIsOpenModal(false)}
              onSuccess={() => { setIsOpenModal(false); fetchLoans(); }}
              onSubmitLoan={handleCreateLoan}
            />
          )}
        </AnimatePresence>
      </div>
    </PageAnimateWrapper>
  );
}