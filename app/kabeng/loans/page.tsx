"use client";

import React, { useState, useEffect, useCallback } from 'react';
import PageAnimateWrapper from '@/components/page-animate-wrapper';
import { Plus, Loader2, CheckCircle, History } from 'lucide-react';
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
            <Link href="/kabeng/loans/completed" className="px-4 py-2.5 text-sm font-bold border border-surface-container-high rounded-lg flex items-center justify-center gap-2">
              <History className="w-4 h-4" /> Riwayat Selesai
            </Link>
            <button onClick={() => setIsOpenModal(true)} className="px-5 py-2.5 text-sm font-bold text-white bg-primary rounded-lg flex items-center justify-center gap-2 shadow-sm cursor-pointer">
              <Plus className="w-5 h-5" /> Input Peminjaman Baru
            </button>
          </div>
        </div>

        {/* Tabel Log Peminjaman */}
        <div className="bg-white border border-surface-container-high rounded-xl overflow-hidden shadow-sm w-full">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse text-base min-w-[850px]">
              <thead className="bg-surface-low border-b border-surface-container-high">
                <tr>
                  <th className="p-5 text-sm font-bold text-on-surface uppercase">Nama Barang</th>
                  <th className="p-5 text-sm font-bold text-on-surface uppercase">Kode Asset</th>
                  <th className="p-5 text-sm font-bold text-on-surface uppercase">Peminjam</th>
                  <th className="p-5 text-sm font-bold text-on-surface uppercase">Kelas</th>
                  <th className="p-5 text-sm font-bold text-on-surface uppercase text-center">Tgl Mulai</th>
                  <th className="p-5 text-sm font-bold text-on-surface uppercase text-center">Tgl Selesai</th>
                  <th className="p-5 text-sm font-bold text-on-surface uppercase text-center">Aksi / Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container font-semibold">
                {loading ? (
                  <tr><td colSpan={7} className="p-8 text-center text-outline"><Loader2 className="w-6 h-6 animate-spin inline-block mr-2" /> Memuat...</td></tr>
                ) : loans.length === 0 ? (
                  <tr><td colSpan={7} className="p-8 text-center text-outline">Tidak ada peminjaman aktif.</td></tr>
                ) : (
                  loans.map((loan) => (
                    <tr key={loan.id} className="hover:bg-surface-low/30">
                      <td className="p-5 font-bold text-primary">{loan.item_instance?.perangkat?.nama_perangkat || '-'}</td>
                      <td className="p-5 font-mono text-sm text-outline">{loan.item_instance?.kode_asset || '-'}</td>
                      <td className="p-5">
                        {loan.nama_peminjam}
                        <span className="block text-xs text-outline font-normal">{loan.nomor_telepon}</span>
                      </td>
                      <td className="p-5">{loan.kelas || '-'}</td>
                      <td className="p-5 text-center font-mono text-outline">{formatDateDisplay(loan.tanggal_pinjam)}</td>
                      <td className="p-5 text-center font-mono text-outline">{formatDateDisplay(loan.tanggal_kembali)}</td>
                      <td className="p-5 text-center">
                        <button
                          onClick={() => handleMarkAsDone(loan)}
                          disabled={updatingId === loan.id}
                          className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold border cursor-pointer ${
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