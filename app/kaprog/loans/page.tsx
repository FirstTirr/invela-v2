"use client";

import React, { useEffect, useState } from 'react';
import PageAnimateWrapper from '@/components/page-animate-wrapper';
import { apiPeminjaman } from '@/lib/api/peminjaman';
import { Clock, CheckCircle2, Search } from 'lucide-react';

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

  const activeLoans = loans.filter((loan) => {
    const st = loan.status?.toLowerCase();
    return st === 'aktif' || st === 'dipinjam';
  });

  const completedLoans = loans.filter((loan) => {
    const st = loan.status?.toLowerCase();
    return st === 'selesai' || st === 'dikembalikan';
  });

  const currentList = activeTab === 'aktif' ? activeLoans : completedLoans;

  const filteredList = currentList.filter((loan) => {
    const namaBarang = loan.item_instance?.perangkat?.nama_perangkat || '';
    const namaPeminjam = loan.nama_peminjam || '';
    const query = searchQuery.toLowerCase();

    return (
      namaBarang.toLowerCase().includes(query) ||
      namaPeminjam.toLowerCase().includes(query)
    );
  });

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
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
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
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
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
            <table className="w-full text-left border-collapse text-base">
              <thead className="bg-surface-low border-b border-surface-container-high">
                <tr>
                  <th className="p-5 text-sm font-bold text-on-surface tracking-wide uppercase">Nama Barang</th>
                  <th className="p-5 text-sm font-bold text-on-surface tracking-wide uppercase">Nama Peminjam</th>
                  <th className="p-5 text-sm font-bold text-on-surface tracking-wide uppercase text-center">Tgl Mulai</th>
                  <th className="p-5 text-sm font-bold text-on-surface tracking-wide uppercase text-center">Tgl Selesai</th>
                  <th className="p-5 text-sm font-bold text-on-surface tracking-wide uppercase text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container text-on-surface font-medium">
                {filteredList.map((loan) => {
                  const namaBarang =
                    loan.item_instance?.perangkat?.nama_perangkat ||
                    `Barang #${loan.id_item_instance}`;

                  const isAktif = loan.status?.toLowerCase() === 'aktif' || loan.status?.toLowerCase() === 'dipinjam';

                  return (
                    <tr key={loan.id} className="hover:bg-surface-low/30 transition-colors">
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
          )}
        </div>
      </div>
    </PageAnimateWrapper>
  );
}