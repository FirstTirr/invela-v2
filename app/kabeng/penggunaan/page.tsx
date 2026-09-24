"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import PageAnimateWrapper from '@/components/page-animate-wrapper';
import { Search, MonitorCheck, Calendar, Filter, Loader2, Trash2, RefreshCw, FileSpreadsheet, FileText, X, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { apiLabor, apiPenggunaan, apiJurusan, Labor, Penggunaan, Jurusan } from '@/lib/api';

interface UserSession {
  role?: string;
  Role?: string;
  nama?: string;
  name?: string;
  nama_lengkap?: string;
  id_jurusan?: number | string;
  idJurusan?: number | string;
  jurusan_id?: number | string;
  jurusan?: string;
  nama_jurusan?: string;
}

type ExtendedLabor = Labor & {
  idJurusan?: number;
  nama_labor?: string;
};

type ExtendedPenggunaan = Penggunaan & {
  nama_pengguna?: string;
  NamaPengguna?: string;
  labor?: ExtendedLabor;
  Labor?: ExtendedLabor;
  kelas?: {
    id?: number | string;
    kelas?: string;
    id_jurusan?: number | string;
    idJurusan?: number;
    jurusan?: Jurusan;
  };
  Kelas?: {
    id?: number | string;
    kelas?: string;
    id_jurusan?: number | string;
    idJurusan?: number;
    jurusan?: Jurusan;
  };
};

export default function PenggunaanLaborPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLabor, setSelectedLabor] = useState('Semua');

  const [usageLogs, setUsageLogs] = useState<ExtendedPenggunaan[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [laborList, setLaborList] = useState<Labor[]>([]);
  const [loadingLabor, setLoadingLabor] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [userJurusanName, setUserJurusanName] = useState('');
  const [userJurusanId, setUserJurusanId] = useState<number | null>(null);
  const [userRole, setUserRole] = useState('');

  // State Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [pdfSignJabatan, setPdfSignJabatan] = useState('Kepala Bengkel');
  const [pdfSignNama, setPdfSignNama] = useState('');
  const [pdfSignNip, setPdfSignNip] = useState('-');

  // Fungsi manual untuk tombol "Refresh Data"
  const loadData = useCallback(async () => {
    try {
      setLoadingLogs(true);
      setLoadingLabor(true);
      setErrorMsg(null);

      let rawJurusan = '', rawRole = '', userName = '';
      let parsedJurusanId: number | null = null;

      const userStr = typeof window !== 'undefined' ? (localStorage.getItem('user') || sessionStorage.getItem('user')) : null;
      if (userStr) {
        const u: UserSession = JSON.parse(userStr);
        rawRole = (u.role || u.Role || '').toLowerCase();
        userName = u.nama || u.name || u.nama_lengkap || '';
        const jVal = u.id_jurusan ?? u.idJurusan ?? u.jurusan_id ?? u.jurusan ?? u.nama_jurusan;
        if (typeof jVal === 'number' || (typeof jVal === 'string' && !isNaN(Number(jVal)))) {
          parsedJurusanId = Number(jVal);
        } else if (typeof jVal === 'string') {
          rawJurusan = jVal.toLowerCase().trim();
        }
      }

      setUserRole(rawRole);
      setUserJurusanId(parsedJurusanId);

      setPdfSignNama((prev) => (prev ? prev : userName));

      const [dataLogs, dataLabor, dataJurusan] = await Promise.all([
        apiPenggunaan.getAll(), 
        apiLabor.getAll(), 
        apiJurusan.getAll()
      ]);

      const rawLogs = Array.isArray(dataLogs) ? (dataLogs as ExtendedPenggunaan[]) : [];
      const rawLabors = Array.isArray(dataLabor) ? (dataLabor as ExtendedLabor[]) : [];
      const rawJurusans = Array.isArray(dataJurusan) ? (dataJurusan as Jurusan[]) : [];

      let matchedJName = rawJurusan;
      if (parsedJurusanId) {
        const found = rawJurusans.find((j) => Number(j.id) === parsedJurusanId);
        if (found) matchedJName = (found.nama_jurusan || found.jurusan || '').toLowerCase().trim();
      }
      setUserJurusanName(matchedJName);

      const isNotAdmin = rawRole !== 'admin' && rawRole !== 'superadmin';
      const myLabors = isNotAdmin ? rawLabors.filter((lab) => {
        const lJId = Number(lab.id_jurusan ?? lab.idJurusan ?? lab.jurusan?.id ?? 0);
        const lJName = (lab.jurusan?.nama_jurusan || lab.jurusan?.jurusan || '').toLowerCase().trim();
        return (parsedJurusanId && lJId === parsedJurusanId) || (matchedJName && lJName.includes(matchedJName));
      }) : rawLabors;

      setLaborList(myLabors);
      setUsageLogs(rawLogs);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg('Gagal memuat log penggunaan laboratorium.');
      }
    } finally {
      setLoadingLogs(false);
      setLoadingLabor(false);
    }
  }, []);

  // Run sekali saat komponen di-mount
  useEffect(() => {
    let isMounted = true;

    const initFetch = async () => {
      try {
        setLoadingLogs(true);
        setLoadingLabor(true);
        setErrorMsg(null);

        let rawJurusan = '', rawRole = '', userName = '';
        let parsedJurusanId: number | null = null;

        const userStr = typeof window !== 'undefined' ? (localStorage.getItem('user') || sessionStorage.getItem('user')) : null;
        if (userStr) {
          const u: UserSession = JSON.parse(userStr);
          rawRole = (u.role || u.Role || '').toLowerCase();
          userName = u.nama || u.name || u.nama_lengkap || '';
          const jVal = u.id_jurusan ?? u.idJurusan ?? u.jurusan_id ?? u.jurusan ?? u.nama_jurusan;
          if (typeof jVal === 'number' || (typeof jVal === 'string' && !isNaN(Number(jVal)))) {
            parsedJurusanId = Number(jVal);
          } else if (typeof jVal === 'string') {
            rawJurusan = jVal.toLowerCase().trim();
          }
        }

        if (!isMounted) return;

        setUserRole(rawRole);
        setUserJurusanId(parsedJurusanId);
        if (userName) setPdfSignNama((prev) => (prev ? prev : userName));

        const [dataLogs, dataLabor, dataJurusan] = await Promise.all([
          apiPenggunaan.getAll(), 
          apiLabor.getAll(), 
          apiJurusan.getAll()
        ]);

        if (!isMounted) return;

        const rawLogs = Array.isArray(dataLogs) ? (dataLogs as ExtendedPenggunaan[]) : [];
        const rawLabors = Array.isArray(dataLabor) ? (dataLabor as ExtendedLabor[]) : [];
        const rawJurusans = Array.isArray(dataJurusan) ? (dataJurusan as Jurusan[]) : [];

        let matchedJName = rawJurusan;
        if (parsedJurusanId) {
          const found = rawJurusans.find((j) => Number(j.id) === parsedJurusanId);
          if (found) matchedJName = (found.nama_jurusan || found.jurusan || '').toLowerCase().trim();
        }
        setUserJurusanName(matchedJName);

        const isNotAdmin = rawRole !== 'admin' && rawRole !== 'superadmin';
        const myLabors = isNotAdmin ? rawLabors.filter((lab) => {
          const lJId = Number(lab.id_jurusan ?? lab.idJurusan ?? lab.jurusan?.id ?? 0);
          const lJName = (lab.jurusan?.nama_jurusan || lab.jurusan?.jurusan || '').toLowerCase().trim();
          return (parsedJurusanId && lJId === parsedJurusanId) || (matchedJName && lJName.includes(matchedJName));
        }) : rawLabors;

        setLaborList(myLabors);
        setUsageLogs(rawLogs);
      } catch (err: unknown) {
        if (isMounted) {
          setErrorMsg(err instanceof Error ? err.message : 'Gagal memuat log penggunaan laboratorium.');
        }
      } finally {
        if (isMounted) {
          setLoadingLogs(false);
          setLoadingLabor(false);
        }
      }
    };

    initFetch();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleDelete = async (id: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus log penggunaan ini?')) return;
    try {
      await apiPenggunaan.delete(id);
      setUsageLogs((prev) => prev.filter((item) => item.id !== id));
    } catch (err: unknown) {
      if (err instanceof Error) {
        alert(err.message);
      } else {
        alert('Gagal menghapus log penggunaan');
      }
    }
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? '-' : new Intl.DateTimeFormat('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }).format(d);
  };

  const getLaborName = (log: ExtendedPenggunaan) => log.labor?.labor || log.labor?.nama_labor || log.Labor?.labor || log.Labor?.nama_labor || '-';

  const filteredLogs = useMemo(() => {
    return usageLogs.filter((log) => {
      const namaKelas = log.kelas?.kelas || log.Kelas?.kelas || '';
      const namaLabor = getLaborName(log);
      const namaGuru = log.nama_pengguna || log.NamaPengguna || '';

      const matchesSearch = [namaKelas, namaGuru, namaLabor].some(s => s.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesLabor = selectedLabor === 'Semua' || namaLabor.toLowerCase() === selectedLabor.toLowerCase();

      if (userRole === 'admin' || userRole === 'superadmin') return matchesSearch && matchesLabor;

      const lLab = log.labor || log.Labor;
      const lKelas = log.kelas || log.Kelas;
      const labJId = Number(lLab?.id_jurusan ?? lLab?.idJurusan ?? lLab?.jurusan?.id ?? 0);
      const kelJId = Number(lKelas?.id_jurusan ?? lKelas?.idJurusan ?? lKelas?.jurusan?.id ?? 0);
      const labJName = (lLab?.jurusan?.nama_jurusan || lLab?.jurusan?.jurusan || '').toLowerCase();
      const kelJName = (lKelas?.jurusan?.nama_jurusan || lKelas?.jurusan?.jurusan || '').toLowerCase();

      const isAllowed = (userJurusanId && (labJId === userJurusanId || kelJId === userJurusanId)) ||
        (userJurusanName && (labJName.includes(userJurusanName) || kelJName.includes(userJurusanName)));

      return matchesSearch && matchesLabor && isAllowed;
    });
  }, [usageLogs, searchQuery, selectedLabor, userRole, userJurusanId, userJurusanName]);

  // Reset Halaman ke-1 saat pencarian, filter, atau jumlah entri berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedLabor, itemsPerPage]);

  // Perhitungan Pagination
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage) || 1;

  const currentLogs = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredLogs.slice(start, start + itemsPerPage);
  }, [filteredLogs, currentPage, itemsPerPage]);

  const startIndex = (currentPage - 1) * itemsPerPage + 1;
  const endIndex = Math.min(currentPage * itemsPerPage, filteredLogs.length);

  const exportExcel = async () => {
    if (!filteredLogs.length) return alert("Tidak ada data untuk diexport!");
    try {
      const XLSX = await import('xlsx');

      const dataToExport = filteredLogs.map((l, i) => {
        return {
          "No": i + 1,
          "ID Log": `LOG-${l.id}`,
          "Tanggal": formatDate(l.created_at),
          "Kelas Menggunakan": l.kelas?.kelas || '-',
          "Laboratorium": getLaborName(l),
          "Durasi Jam Pelajaran": `Jam ke-${l.jam_pelajaran_mulai} sampai jam ke ${l.jam_pelajaran_selesai}`,
          "Guru Penginput": l.nama_pengguna || '-'
        };
      });

      const worksheet = XLSX.utils.json_to_sheet(dataToExport);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Laporan Laboratorium");

      worksheet['!cols'] = [
        { wch: 6 },
        { wch: 12 },
        { wch: 15 },
        { wch: 20 },
        { wch: 25 },
        { wch: 35 },
        { wch: 25 },
      ];

      XLSX.writeFile(workbook, `Laporan_Penggunaan_Labor_SMKN4.xlsx`);
    } catch {
      alert("Gagal mengexport file Excel.");
    }
  };

  const generatePDF = async () => {
    try {
      const { default: jsPDF } = await import('jspdf');
      const autoTable = (await import('jspdf-autotable')).default;

      const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const jurusanUpper = userJurusanName ? userJurusanName.toUpperCase() : '';

      doc.setFont("helvetica", "bold").setFontSize(14).text("LAPORAN PENGGUNAAN RUANG LABORATORIUM", 105, 16, { align: "center" });
      
      const headerSubText = jurusanUpper ? `SMK NEGERI 4 PAYAKUMBUH - ${jurusanUpper}` : `SMK NEGERI 4 PAYAKUMBUH`;
      doc.setFontSize(12).text(headerSubText, 105, 22, { align: "center" });

      doc.setFont("helvetica", "normal").setFontSize(9).text("Sistem Informasi Inventaris & Penggunaan Laboratorium Sekolah", 105, 27, { align: "center" });
      doc.text(`Tanggal Cetak: ${formatDate(new Date().toISOString())}`, 105, 31, { align: "center" });
      doc.setLineWidth(0.5).line(14, 34, 196, 34);

      const tableData = filteredLogs.map((l, i) => {
        return [
          i + 1, l.kelas?.kelas || '-', getLaborName(l),
          `Jam ke-${l.jam_pelajaran_mulai} sampai jam ke ${l.jam_pelajaran_selesai}`,
          l.nama_pengguna || '-', formatDate(l.created_at)
        ];
      });

      autoTable(doc, {
        startY: 38,
        head: [['NO', 'KELAS MENGGUNAKAN', 'LABORATORIUM', 'DURASI JAM', 'GURU PENGINPUT', 'TANGGAL']],
        body: tableData,
        theme: 'grid',
        headStyles: { fillColor: [15, 23, 42], textColor: [255, 255, 255], fontStyle: 'bold', halign: 'center', fontSize: 8.5 },
        bodyStyles: { fontSize: 8.5, textColor: [30, 41, 59] },
        columnStyles: { 0: { halign: 'center', cellWidth: 10 }, 1: { cellWidth: 32 }, 2: { cellWidth: 38 }, 3: { halign: 'center', cellWidth: 44 }, 5: { halign: 'center', cellWidth: 26 } },
        margin: { left: 14, right: 14 },
      });

      const pageHeight = doc.internal.pageSize.getHeight();
      const pdfWithPlugin = doc as unknown as { lastAutoTable?: { finalY?: number } };
      const lastY = pdfWithPlugin.lastAutoTable?.finalY || 38;
      if (lastY > pageHeight - 45) doc.addPage();

      doc.setPage(doc.getNumberOfPages());
      const signY = pageHeight - 45;

      doc.setFontSize(9).setFont("helvetica", "normal").text("Mengetahui,", 14, signY);
      doc.text(`${pdfSignJabatan || 'Kepala Bengkel'},`, 14, signY + 5);
      doc.setFont("helvetica", "bold").text(pdfSignNama || '...............................', 14, signY + 25);
      doc.setFont("helvetica", "normal").text(`NIP. ${pdfSignNip || '-'}`, 14, signY + 30);

      doc.save(`Laporan_Penggunaan_Labor_SMKN4.pdf`);
      setIsPdfModalOpen(false);
    } catch {
      alert('Gagal mendownload PDF.');
    }
  };

  return (
    <PageAnimateWrapper>
      <div className="space-y-6 font-sans antialiased tracking-tight">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 border-b border-surface-container pb-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-on-surface">Log Pemakaian Ruang Laboratorium</h1>
            <p className="text-base text-on-surface-variant mt-1 font-medium">
              Daftar rekapitulasi penggunaan ruang praktikum SMK Negeri 4 Payakumbuh.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            <button type="button" onClick={exportExcel} className="flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 rounded-lg cursor-pointer border border-emerald-300">
              <FileSpreadsheet className="w-4 h-4 text-emerald-700" /> Export Excel (.xlsx)
            </button>
            <button type="button" onClick={() => setIsPdfModalOpen(true)} className="flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-white bg-blue-900 hover:bg-blue-950 rounded-lg cursor-pointer shadow-xs">
              <FileText className="w-4 h-4 text-blue-200" /> Export PDF
            </button>
            <button type="button" onClick={loadData} disabled={loadingLogs} className="flex items-center gap-2 px-3.5 py-2 text-xs font-bold text-primary bg-primary/10 hover:bg-primary/20 rounded-lg disabled:opacity-50 cursor-pointer">
              <RefreshCw className={`w-4 h-4 ${loadingLogs ? 'animate-spin' : ''}`} /> Refresh Data
            </button>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-4 rounded-xl border border-surface-container-high shadow-xs">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-outline absolute left-3 top-1/2 -translate-y-1/2" />
            <input type="text" placeholder="Cari kelas, laboratorium, atau guru..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-9 pr-4 py-2 text-sm border border-surface-container rounded-lg focus:outline-none focus:border-primary font-medium" />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-outline shrink-0" />
            <select value={selectedLabor} onChange={(e) => setSelectedLabor(e.target.value)} disabled={loadingLabor} className="w-full sm:w-auto px-3 py-2 text-sm border border-surface-container rounded-lg focus:outline-none focus:border-primary bg-white font-medium text-on-surface cursor-pointer">
              <option value="Semua">Semua Laboratorium Jurusan</option>
              {laborList.map((item) => {
                const lab = item as ExtendedLabor;
                const name = lab.labor || lab.nama_labor || '';
                return <option key={lab.id} value={name}>{name}</option>;
              })}
            </select>
          </div>
        </div>

        <div className="bg-white border border-surface-container-high rounded-xl overflow-hidden shadow-xs w-full space-y-3">
          <div className="px-5 pt-5 flex items-center justify-between">
            <h2 className="text-lg font-bold text-on-surface flex items-center gap-2">
              <MonitorCheck className="w-5 h-5 text-primary" /> Daftar Pemakaian Kelas Praktikum
            </h2>
            <span className="text-xs font-bold text-outline uppercase bg-surface-low px-2.5 py-1 rounded-md">
              Total: {filteredLogs.length} Entri
            </span>
          </div>

          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse text-base min-w-[900px]">
              <thead className="bg-surface-low border-y border-surface-container-high">
                <tr>
                  <th className="p-4 text-xs font-bold uppercase w-12 text-center">No</th>
                  <th className="p-4 text-xs font-bold uppercase">TGL & ID</th>
                  <th className="p-4 text-xs font-bold uppercase">Kelas Menggunakan</th>
                  <th className="p-4 text-xs font-bold uppercase">Laboratorium</th>
                  <th className="p-4 text-xs font-bold uppercase text-center">Durasi Jam Pelajaran</th>
                  <th className="p-4 text-xs font-bold uppercase">Guru Penginput</th>
                  <th className="p-4 text-xs font-bold uppercase text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container text-on-surface font-semibold">
                {loadingLogs ? (
                  <tr><td colSpan={7} className="p-8 text-center text-outline"><Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" /> Memuat log...</td></tr>
                ) : errorMsg ? (
                  <tr><td colSpan={7} className="p-8 text-center text-red-600 font-medium">{errorMsg}</td></tr>
                ) : filteredLogs.length === 0 ? (
                  <tr><td colSpan={7} className="p-8 text-center text-outline font-medium">Tidak ada log penggunaan laboratorium.</td></tr>
                ) : (
                  currentLogs.map((log, idx) => {
                    return (
                      <tr key={log.id} className="hover:bg-surface-low/30 transition-colors">
                        <td className="p-4 text-center text-outline font-mono text-xs">
                          {(currentPage - 1) * itemsPerPage + idx + 1}
                        </td>
                        <td className="p-4 whitespace-nowrap">
                          <div className="text-sm font-bold flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-outline" /> {formatDate(log.created_at)}</div>
                          <span className="text-xs font-mono text-outline">LOG-{log.id}</span>
                        </td>
                        <td className="p-4 text-base font-bold text-primary">{log.kelas?.kelas || '-'}</td>
                        <td className="p-4 text-sm font-medium text-on-surface-variant max-w-[240px] truncate">{getLaborName(log)}</td>
                        <td className="p-4 text-center">
                          <span className="inline-flex items-center gap-1 px-3 py-1 bg-surface-low rounded-lg text-xs font-bold border border-surface-container">
                            Jam ke-{log.jam_pelajaran_mulai} sampai jam ke {log.jam_pelajaran_selesai}
                          </span>
                        </td>
                        <td className="p-4 text-sm font-bold">{log.nama_pengguna || '-'}</td>
                        <td className="p-4 text-right">
                          <button type="button" onClick={() => handleDelete(log.id)} className="p-1.5 hover:bg-red-50 text-red-600 rounded-lg cursor-pointer" title="Hapus Log">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Bar Navigation Pagination */}
          {!loadingLogs && filteredLogs.length > 0 && (
            <div className="p-4 border-t border-surface-container-high bg-surface-low/30 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4 text-xs font-semibold text-outline">
                <span>
                  Menampilkan {startIndex} - {endIndex} dari {filteredLogs.length} entri
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
          )}
        </div>

        <AnimatePresence>
          {isPdfModalOpen && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white rounded-xl shadow-xl border border-surface-container max-w-md w-full overflow-hidden">
                <div className="flex items-center justify-between p-4 border-b border-surface-container">
                  <h3 className="text-base font-bold text-on-surface flex items-center gap-2"><FileText className="w-4 h-4 text-primary" /> Informasi Tanda Tangan</h3>
                  <button type="button" onClick={() => setIsPdfModalOpen(false)} className="p-1 text-outline hover:text-on-surface cursor-pointer"><X className="w-4 h-4" /></button>
                </div>
                <div className="p-5 space-y-4 text-sm font-medium">
                  <div>
                    <label className="block text-xs font-bold uppercase text-outline mb-1">JABATAN PENANGGUNG JAWAB</label>
                    <input type="text" value={pdfSignJabatan} onChange={(e) => setPdfSignJabatan(e.target.value)} placeholder="Contoh: Kepala Bengkel" className="w-full px-3 py-2 border border-surface-container rounded-lg font-semibold" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-outline mb-1">NAMA PENANGGUNG JAWAB</label>
                    <input type="text" value={pdfSignNama} onChange={(e) => setPdfSignNama(e.target.value)} placeholder="Nama Lengkap & Gelar" className="w-full px-3 py-2 border border-surface-container rounded-lg font-semibold" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-outline mb-1">NIP (ISI &apos;-&apos; JIKA TIDAK ADA)</label>
                    <input type="text" value={pdfSignNip} onChange={(e) => setPdfSignNip(e.target.value)} placeholder="NIP" className="w-full px-3 py-2 border border-surface-container rounded-lg font-semibold" />
                  </div>
                </div>
                <div className="flex items-center justify-end gap-2 p-4 bg-surface-low border-t border-surface-container">
                  <button type="button" onClick={() => setIsPdfModalOpen(false)} className="px-4 py-2 text-sm font-semibold text-outline hover:text-on-surface cursor-pointer">Batal</button>
                  <button type="button" onClick={generatePDF} className="flex items-center gap-2 px-5 py-2 text-sm font-bold text-white bg-blue-900 hover:bg-blue-950 rounded-lg cursor-pointer shadow-xs">
                    <Download className="w-4 h-4" /> Download PDF
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </PageAnimateWrapper>
  );
}