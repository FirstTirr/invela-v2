"use client";

import React, { useState, useEffect } from 'react';
import PageAnimateWrapper from '@/components/page-animate-wrapper';
import { Search, MonitorCheck, UserCheck, Calendar, Filter, Loader2 } from 'lucide-react';
import { apiLabor, Labor } from '@/lib/api';

interface UsageLog {
  id: string;
  tanggal: string;
  guruInput: {
    username: string;
    namaLengkap: string;
    nip: string;
  };
  kelas: string;
  laboratorium: string;
  jamMulai: string;
  jamSelesai: string;
  status: 'Berlangsung' | 'Selesai';
}

export default function PenggunaanLaborPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLabor, setSelectedLabor] = useState('Semua');
  
  // State untuk data Laboratorium dari API backend
  const [laborList, setLaborList] = useState<Labor[]>([]);
  const [loadingLabor, setLoadingLabor] = useState(false);

  // Fetch daftar laboratorium dari Backend
  useEffect(() => {
    const fetchLaboratorium = async () => {
      try {
        setLoadingLabor(true);
        const data = await apiLabor.getAll();
        setLaborList(data);
      } catch (err) {
        console.error('Gagal memuat data laboratorium:', err);
      } finally {
        setLoadingLabor(false);
      }
    };

    fetchLaboratorium();
  }, []);

  // Dummy Data Log Penggunaan Laboratorium
  const usageLogs: UsageLog[] = [
    {
      id: 'LOG-001',
      tanggal: '2026-07-22',
      guruInput: {
        username: 'hafidz_guru',
        namaLengkap: 'Hafidz, S.Kom.',
        nip: '19880215 201503 1 002',
      },
      kelas: 'XI PPLG 2',
      laboratorium: 'Laboratorium RPL',
      jamMulai: 'Jam Ke-1',
      jamSelesai: 'Jam Ke-4',
      status: 'Berlangsung',
    },
    {
      id: 'LOG-002',
      tanggal: '2026-07-22',
      guruInput: {
        username: 'andi_dkv',
        namaLengkap: 'Andi Wijaya, S.Pd.',
        nip: '19910510 201902 1 005',
      },
      kelas: 'XII DKV 1',
      laboratorium: 'Laboratorium DKV',
      jamMulai: 'Jam Ke-5',
      jamSelesai: 'Jam Ke-8',
      status: 'Selesai',
    },
    {
      id: 'LOG-003',
      tanggal: '2026-07-21',
      guruInput: {
        username: 'budi_tkj',
        namaLengkap: 'Budi Santoso, M.T.',
        nip: '19850101 201001 1 001',
      },
      kelas: 'X TJKT 3',
      laboratorium: 'Laboratorium TKJ',
      jamMulai: 'Jam Ke-2',
      jamSelesai: 'Jam Ke-6',
      status: 'Selesai',
    },
  ];

  // Filtering Logic
  const filteredLogs = usageLogs.filter((log) => {
    const matchesSearch =
      log.kelas.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.guruInput.namaLengkap.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.guruInput.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.laboratorium.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesLabor =
      selectedLabor === 'Semua' || log.laboratorium.toLowerCase() === selectedLabor.toLowerCase();

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
            
            {/* Dynamic Dropdown Laboratorium dari Backend API */}
            <select
              value={selectedLabor}
              onChange={(e) => setSelectedLabor(e.target.value)}
              disabled={loadingLabor}
              className="w-full sm:w-auto px-3 py-2 text-sm border border-surface-container rounded-lg focus:outline-none focus:border-primary bg-white font-medium text-on-surface disabled:bg-surface-low cursor-pointer"
            >
              <option value="Semua">Semua Laboratorium</option>
              {loadingLabor ? (
                <option disabled>Memuat laboratorium...</option>
              ) : (
                laborList.map((item) => (
                  <option key={item.id} value={item.labor}>
                    {item.labor}
                  </option>
                ))
              )}
            </select>
            {loadingLabor && <Loader2 className="w-4 h-4 animate-spin text-primary shrink-0" />}
          </div>
        </div>

        {/* Tabel 1: Rekap Log Penggunaan Laboratorium */}
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
                  <th className="p-4 text-xs font-bold text-on-surface tracking-wide uppercase text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container text-on-surface font-semibold">
                {filteredLogs.length === 0 ? (
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
                          <Calendar className="w-3.5 h-3.5 text-outline" /> {log.tanggal}
                        </div>
                        <span className="text-xs font-mono text-outline font-semibold">{log.id}</span>
                      </td>

                      <td className="p-4 text-base font-bold text-primary whitespace-nowrap">
                        {log.kelas}
                      </td>

                      <td className="p-4 text-sm font-medium text-on-surface-variant max-w-[240px] truncate">
                        {log.laboratorium}
                      </td>

                      <td className="p-4 text-center whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-surface-low rounded-lg text-xs font-bold text-on-surface border border-surface-container">
                          {log.jamMulai} s/d {log.jamSelesai}
                        </span>
                      </td>

                      <td className="p-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-on-surface">{log.guruInput.namaLengkap}</div>
                        <div className="text-xs font-mono text-outline">@{log.guruInput.username}</div>
                      </td>

                      <td className="p-4 text-right whitespace-nowrap">
                        <span
                          className={`inline-block px-3 py-1 rounded-md text-xs font-bold border ${
                            log.status === 'Berlangsung'
                              ? 'bg-blue-100 text-blue-900 border-blue-300'
                              : 'bg-emerald-100 text-emerald-900 border-emerald-300'
                          }`}
                        >
                          {log.status}
                        </span>
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