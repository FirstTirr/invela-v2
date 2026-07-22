"use client";

import React, { useState, useEffect } from 'react';
import PageAnimateWrapper from '@/components/page-animate-wrapper';
import { ArrowLeft, Loader2, CheckCircle2, Search } from 'lucide-react';
import Link from 'next/link';
import { apiPeminjaman, Peminjaman } from '@/lib/api';

export default function KabengLoansCompletedPage() {
  const [loans, setLoans] = useState<Peminjaman[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchCompletedLoans = async () => {
    try {
      setLoading(true);
      const data = await apiPeminjaman.getAll();
      const completed = data.filter((loan) => loan.status === 'selesai');
      setLoans(completed);
    } catch (err) {
      console.error("Gagal memuat riwayat peminjaman selesai:", err);
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

  const filteredLoans = loans.filter((loan) => {
    const namaBarang = loan.item_instance?.perangkat?.nama_perangkat || '';
    const kodeAsset = loan.item_instance?.kode_asset || '';
    const query = searchQuery.toLowerCase();

    return (
      namaBarang.toLowerCase().includes(query) ||
      kodeAsset.toLowerCase().includes(query) ||
      loan.nama_peminjam.toLowerCase().includes(query)
    );
  });

  return (
    <PageAnimateWrapper>
      <div className="space-y-6 font-sans antialiased tracking-tight">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 border-b border-surface-container pb-4">
          <div className="flex items-center gap-3">
            <Link
              href="/kabeng/loans"
              className="p-2 border border-surface-container-high rounded-lg hover:bg-surface-low text-on-surface transition-colors"
              title="Kembali ke Log Peminjaman"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-on-surface">Riwayat Peminjaman Selesai</h1>
              <p className="text-base text-on-surface-variant mt-1 font-medium">
                Daftar pengembalian alat laboratorium yang telah dikembalikan secara lengkap.
              </p>
            </div>
          </div>
        </div>

        {/* Filter Search */}
        <div className="bg-white p-4 rounded-xl border border-surface-container-high shadow-xs max-w-sm">
          <div className="relative">
            <Search className="w-4 h-4 text-outline absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari peminjam, barang, atau kode asset..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-surface-container rounded-lg focus:outline-none focus:border-primary font-medium text-on-surface"
            />
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
                  <th className="p-5 text-sm font-bold text-on-surface tracking-wide uppercase text-center">Tgl Selesai</th>
                  <th className="p-5 text-sm font-bold text-on-surface tracking-wide uppercase text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container text-on-surface font-semibold">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-outline">
                      <Loader2 className="w-6 h-6 animate-spin inline-block mr-2" /> Memuat data riwayat...
                    </td>
                  </tr>
                ) : filteredLoans.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-outline font-medium">
                      Belum ada peminjaman yang selesai.
                    </td>
                  </tr>
                ) : (
                  filteredLoans.map((loan) => {
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
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold border bg-emerald-100 text-emerald-900 border-emerald-300">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" /> Selesai
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