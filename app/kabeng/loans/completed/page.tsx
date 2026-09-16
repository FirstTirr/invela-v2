"use client";

import React, { useState, useEffect } from 'react';
import PageAnimateWrapper from '@/components/page-animate-wrapper';
import { ArrowLeft, History, Loader2, FileSpreadsheet, Printer, X, FileCheck } from 'lucide-react';
import Link from 'next/link';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { apiPeminjaman, apiJurusan, Jurusan, Peminjaman } from '@/lib/api';

type ExtendedJurusan = Jurusan & {
  nama?: string;
  nama_jurusan?: string;
};

type PeminjamanItem = Omit<Peminjaman, 'item_instance'> & {
  actual_return_date?: string;
  tanggal_dikembalikan?: string;
  updated_at?: string;
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

export default function KabengCompletedLoansPage() {
  const [loans, setLoans] = useState<PeminjamanItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [userJurusanName, setUserJurusanName] = useState<string>("-");

  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [pdfSignData, setPdfSignData] = useState({ jabatan: "Kepala Bengkel", nama: "", nip: "-" });

  useEffect(() => {
    let isMounted = true;

    const fetchCompletedLoans = async () => {
      try {
        setLoading(true);

        const userStr = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
        const currentUser = userStr ? JSON.parse(userStr) : null;
        const myJurusanId = currentUser?.jurusan_id ? String(currentUser.jurusan_id) : null;

        let detectedJurusan: string =
          currentUser?.jurusan?.nama_jurusan ||
          currentUser?.jurusan?.nama ||
          currentUser?.nama_jurusan ||
          currentUser?.jurusan_nama ||
          "";

        if (!detectedJurusan && myJurusanId) {
          try {
            const listJurusan = (await apiJurusan.getAll()) as ExtendedJurusan[];
            const found = listJurusan.find((j) => String(j.id) === String(myJurusanId));
            if (found) {
              detectedJurusan = found.nama_jurusan || found.nama || "";
            }
          } catch {
            // Fallback silat
          }
        }

        if (isMounted) {
          setUserJurusanName(detectedJurusan || "TKJ");
        }

        const data = await apiPeminjaman.getAll();
        
        const filteredLoans = ((data || []) as unknown as PeminjamanItem[]).filter((loan) => {
          if (loan.status !== 'selesai') return false;
          if (!myJurusanId) return true;

          const itemJurusanId = 
            loan.item_instance?.perangkat?.labor?.id_jurusan ||
            loan.item_instance?.perangkat?.labor?.jurusan_id ||
            loan.item_instance?.perangkat?.id_jurusan;

          return itemJurusanId ? String(itemJurusanId) === myJurusanId : true;
        });

        if (isMounted) {
          setLoans(filteredLoans);
        }
      } catch (err: unknown) {
        console.error("Gagal memuat riwayat peminjaman:", err);
        // Safe check
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchCompletedLoans();

    return () => {
      isMounted = false;
    };
  }, []);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '-';
    try {
      return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric" }).format(new Date(dateStr));
    } catch {
      return dateStr.split('T')[0];
    }
  };

  const getReturnDate = (loan: PeminjamanItem) => {
    const rawDate = loan.actual_return_date || loan.tanggal_dikembalikan || loan.updated_at || loan.tanggal_kembali;
    return formatDate(rawDate);
  };

  const handleExportCSV = () => {
    if (loans.length === 0) return alert("Tidak ada data untuk diexport.");
    const excelData = loans.map((loan, index) => ({
      No: index + 1,
      "Nama Barang": loan.item_instance?.perangkat?.nama_perangkat || "Tidak Diketahui",
      "Kode Asset": loan.item_instance?.kode_asset || "-",
      "Nama Peminjam": loan.nama_peminjam || "-",
      "No. Telepon": loan.nomor_telepon || "-",
      "Tgl Pinjam": formatDate(loan.tanggal_pinjam),
      "Tgl Pengembalian": getReturnDate(loan),
    }));

    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Riwayat Peminjaman");
    XLSX.writeFile(wb, `Riwayat_Peminjaman_${userJurusanName.replace(/\s+/g, "_")}_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  const handleGeneratePDF = (e: React.FormEvent) => {
    e.preventDefault();
    setIsPdfModalOpen(false);

    const doc = new jsPDF("p", "pt", "a4");
    const pw = doc.internal.pageSize.getWidth();
    const ph = doc.internal.pageSize.getHeight();

    doc.setFontSize(13).setFont("helvetica", "bold").text("LAPORAN RIWAYAT PEMINJAMAN ALAT LABOR", pw / 2, 40, { align: "center" });
    doc.setFontSize(10).text(`JURUSAN: ${userJurusanName.toUpperCase()}`, pw / 2, 54, { align: "center" });
    doc.setFontSize(8).setFont("helvetica", "normal");
    doc.text("Sistem Informasi Inventaris Laboratorium Sekolah", pw / 2, 67, { align: "center" });
    doc.text(`Tanggal Cetak: ${formatDate(new Date().toISOString())}`, pw / 2, 78, { align: "center" });

    doc.setLineWidth(1).line(40, 86, pw - 40, 86);

    autoTable(doc, {
      startY: 96,
      head: [["NO", "NAMA BARANG", "KODE ASSET", "PEMINJAM", "NO TELEPON", "TGL MULAI", "TGL KEMBALI"]],
      body: loans.map((loan, idx) => [
        idx + 1,
        loan.item_instance?.perangkat?.nama_perangkat || "Tidak Diketahui",
        loan.item_instance?.kode_asset || "-",
        loan.nama_peminjam || "-",
        loan.nomor_telepon || "-",
        formatDate(loan.tanggal_pinjam),
        getReturnDate(loan),
      ]),
      theme: "grid",
      headStyles: { fillColor: [30, 41, 59], textColor: 255, fontStyle: "bold", halign: "center" },
      columnStyles: { 
        0: { halign: "center", cellWidth: 30 }, 
        5: { halign: "center" }, 
        6: { halign: "center" } 
      },
      styles: { fontSize: 8, cellPadding: 6 },
    });

    const totalPages = doc.getNumberOfPages();
    doc.setPage(totalPages);

    const signX = 40; 
    const signY = ph - 110; 

    doc.setFontSize(9).setFont("helvetica", "normal");
    doc.text("Mengetahui,", signX, signY);
    doc.text(`${pdfSignData.jabatan || "Kepala Bengkel"},`, signX, signY + 12);

    const nameY = signY + 60;
    doc.setFont("helvetica", "bold").text(pdfSignData.nama || "( .................................... )", signX, nameY);
    doc.setFont("helvetica", "normal");
    doc.text(pdfSignData.nip && pdfSignData.nip.trim() !== "" ? `NIP. ${pdfSignData.nip}` : "NIP. -", signX, nameY + 11);

    doc.save(`Riwayat_Peminjaman_${userJurusanName.replace(/\s+/g, "_")}_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  return (
    <PageAnimateWrapper>
      <div className="space-y-6 font-sans antialiased tracking-tight">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 border-b border-surface-container pb-4">
          <div className="space-y-1">
            <Link 
              href="/kabeng/loans" 
              className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline mb-2"
            >
              <ArrowLeft className="w-4 h-4" /> Kembali ke Peminjaman Aktif
            </Link>
            <h1 className="text-3xl font-bold tracking-tight text-on-surface flex items-center gap-2">
              <History className="w-8 h-8 text-primary" /> Riwayat Peminjaman Selesai
            </h1>
            <p className="text-base text-on-surface-variant font-medium">
              Daftar seluruh alat labor jurusan <span className="font-bold text-primary">{userJurusanName}</span> yang telah dikembalikan oleh peminjam.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button 
              type="button"
              onClick={handleExportCSV} 
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl flex items-center gap-2 shadow-xs cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4" /> Export CSV / Excel
            </button>
            <button 
              type="button"
              onClick={() => { if (loans.length === 0) return alert("Tidak ada data."); setIsPdfModalOpen(true); }} 
              className="px-4 py-2 bg-primary hover:bg-primary-container text-white font-bold text-sm rounded-xl flex items-center gap-2 shadow-xs cursor-pointer"
            >
              <Printer className="w-4 h-4" /> Export PDF
            </button>
          </div>
        </div>

        <div className="bg-white border border-surface-container-high rounded-xl overflow-hidden shadow-xs w-full">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse text-base min-w-[700px]">
              <thead className="bg-surface-low border-b border-surface-container-high">
                <tr>
                  <th className="p-5 text-sm font-bold text-on-surface tracking-wide uppercase">Nama Barang</th>
                  <th className="p-5 text-sm font-bold text-on-surface tracking-wide uppercase">Kode Asset</th>
                  <th className="p-5 text-sm font-bold text-on-surface tracking-wide uppercase">Nama Peminjam</th>
                  <th className="p-5 text-sm font-bold text-on-surface tracking-wide uppercase text-center">Tgl Mulai</th>
                  <th className="p-5 text-sm font-bold text-on-surface tracking-wide uppercase text-center">Tgl Pengembalian</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container text-on-surface font-semibold">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-outline">
                      <Loader2 className="w-6 h-6 animate-spin inline-block mr-2" /> Memuat riwayat...
                    </td>
                  </tr>
                ) : loans.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-outline font-medium">
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
                        <td className="p-5 text-center font-mono text-base text-outline tabular-nums whitespace-nowrap">{getReturnDate(loan)}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {isPdfModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-primary" />
                <h3 className="text-base font-bold">Informasi Tanda Tangan</h3>
              </div>
              <button type="button" onClick={() => setIsPdfModalOpen(false)} className="text-outline hover:text-on-surface cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleGeneratePDF} className="space-y-3">
              <div>
                <label className="block text-xs font-bold uppercase mb-1">Jabatan Penanggung Jawab</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Kepala Bengkel RPL"
                  value={pdfSignData.jabatan}
                  onChange={(e) => setPdfSignData({ ...pdfSignData, jabatan: e.target.value })}
                  className="w-full px-3 py-1.5 border rounded-lg text-sm focus:outline-none focus:border-primary font-medium"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase mb-1">Nama Penanggung Jawab</label>
                <input
                  type="text"
                  required
                  placeholder="Nama Lengkap & Gelar"
                  value={pdfSignData.nama}
                  onChange={(e) => setPdfSignData({ ...pdfSignData, nama: e.target.value })}
                  className="w-full px-3 py-1.5 border rounded-lg text-sm focus:outline-none focus:border-primary font-medium"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase mb-1">NIP (Isi &apos;-&apos; jika tidak ada)</label>
                <input
                  type="text"
                  value={pdfSignData.nip}
                  onChange={(e) => setPdfSignData({ ...pdfSignData, nip: e.target.value })}
                  className="w-full px-3 py-1.5 border rounded-lg text-sm focus:outline-none focus:border-primary font-medium"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setIsPdfModalOpen(false)} className="px-3 py-1.5 text-sm font-bold text-outline hover:bg-surface-low rounded-lg cursor-pointer">
                  Batal
                </button>
                <button type="submit" className="px-4 py-1.5 text-sm font-bold text-white bg-primary hover:bg-primary-container rounded-lg flex items-center gap-1.5 cursor-pointer">
                  <Printer className="w-4 h-4" /> Download PDF
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageAnimateWrapper>
  );
}