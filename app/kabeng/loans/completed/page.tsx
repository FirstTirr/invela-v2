"use client";

import React, { useState, useEffect } from 'react';
import PageAnimateWrapper from '@/components/page-animate-wrapper';
import { ArrowLeft, History, Loader2, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { apiPeminjaman } from '@/lib/api';

interface PeminjamanItem {
  id: number;
  id_item_instance: number;
  nama_peminjam: string;
  nomor_telepon: string;
  tanggal_pinjam: string;
  tanggal_kembali: string;
  status: string;
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
}

export default function KabengCompletedLoansPage() {
  const [loans, setLoans] = useState<PeminjamanItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchCompletedLoans = async () => {
    try {
      setLoading(true);

      const userStr = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
      const currentUser = userStr ? JSON.parse(userStr) : null;
      const myJurusanId = currentUser?.jurusan_id ? String(currentUser.jurusan_id) : null;

      const data = await apiPeminjaman.getAll();
      
      const filteredLoans = (data || []).filter((loan: any) => {
        // Ambil hanya yang sudah selesai
        if (loan.status !== 'selesai') return false;
        if (!myJurusanId) return true;

        const itemJurusanId = 
          loan.item_instance?.perangkat?.labor?.id_jurusan ||
          loan.item_instance?.perangkat?.labor?.jurusan_id ||
          loan.item_instance?.perangkat?.id_jurusan;

        return itemJurusanId ? String(itemJurusanId) === myJurusanId : true;
      });

      setLoans(filteredLoans);
    } catch (err: any) {
      console.error("Gagal memuat riwayat peminjaman:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompletedLoans();
  }, []);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    return dateStr.split('T')[0];
  };

  return (
    <PageAnimateWrapper>
      <div className="space-y-6 font-sans antialiased tracking-tight">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 border-b border-surface-container pb-4">
          <div className="space-y-1">
            <Link 
              href="/kabeng/loans" 
              className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline mb-2"
            >
              <ArrowLeft className="w-4 h-4" /> Kembali ke Peminjaman Aktif
            </Link>
            <h1 className="text-3xl font-bold tracking-tight text-on-surface">Riwayat Peminjaman Selesai</h1>
            <p className="text-base text-on-surface-variant font-medium">
              Daftar seluruh alat labor yang telah dikembalikan oleh peminjam.
            </p>
          </div>
        </div>

        {/* Table Container */}
        <div className="bg-white border border-surface-container-high rounded-xl overflow-hidden shadow-sm w-full">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse text-base min-w-[800px]">
              <thead className="bg-surface-low border-b border-surface-container-high">
                <tr>
                  <th className="p-5 text-sm font-bold text-on-surface tracking-wide uppercase">Nama Barang</th>
                  <th className="p-5 text-sm font-bold text-on-surface tracking-wide uppercase">Kode Asset</th>
                  <th className="p-5 text-sm font-bold text-on-surface tracking-wide uppercase">Nama Peminjam</th>
                  <th className="p-5 text-sm font-bold text-on-surface tracking-wide uppercase text-center">Tgl Mulai</th>
                  <th className="p-5 text-sm font-bold text-on-surface tracking-wide uppercase text-center">Tgl Pengembalian</th>
                  <th className="p-5 text-sm font-bold text-on-surface tracking-wide uppercase text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container text-on-surface font-semibold">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-outline">
                      <Loader2 className="w-6 h-6 animate-spin inline-block mr-2" /> Memuat riwayat...
                    </td>
                  </tr>
                ) : loans.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-outline font-medium">
                      Belum ada riwayat peminjaman yang selesai untuk jurusan ini.
                    </td>
                  </tr>
                ) : (
                  loans.map((loan) => {
                    const namaBarang = loan.item_instance?.perangkat?.nama_perangkat || 'Tidak Diketahui';
                    const kodeAsset = loan.item_instance?.kode_asset || '-';

                    return (
                      <tr key={loan.id} className="hover:bg-surface-low/30 transition-colors">
                        <td className="p-5 text-base font-bold text-primary whitespace-nowrap">{namaBarang}</td>
                        <td className="p-5 font-mono text-sm text-outline font-bold whitespace-nowrap">{kodeAsset}</td>
                        <td className="p-5 text-base text-on-surface-variant font-bold whitespace-nowrap">
                          {loan.nama_peminjam}
                          <span className="block text-xs text-outline font-normal">{loan.nomor_telepon}</span>
                        </td>
                        <td className="p-5 text-center font-mono text-base text-outline tabular-nums whitespace-nowrap">{formatDate(loan.tanggal_pinjam)}</td>
                        <td className="p-5 text-center font-mono text-base text-outline tabular-nums whitespace-nowrap">{formatDate(loan.tanggal_kembali)}</td>
                        <td className="p-5 text-center whitespace-nowrap">
                          <span className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold border bg-emerald-50 text-emerald-800 border-emerald-300">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Selesai (Dikembalikan)</span>
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </PageAnimateWrapper>
  );
}