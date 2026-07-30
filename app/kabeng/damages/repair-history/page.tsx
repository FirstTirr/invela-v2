"use client";

import React, { useState, useEffect } from "react";
import PageAnimateWrapper from "@/components/page-animate-wrapper";
import { History, Search, FileSpreadsheet, Printer, Loader2, AlertCircle, ArrowLeft, X, FileCheck } from "lucide-react";
import Link from "next/link";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { apiRiwayatPerbaikan, RiwayatPerbaikan, apiKerusakan, apiJurusan } from "@/lib/api";

export default function RepairHistoryPage() {
  const [historyList, setHistoryList] = useState<RiwayatPerbaikan[]>([]);
  const [pelaporMap, setPelaporMap] = useState<Record<number, string>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [userJurusanName, setUserJurusanName] = useState<string>("-");

  // State Modal TTD
  const [isPdfModalOpen, setIsPdfModalOpen] = useState(false);
  const [pdfSignData, setPdfSignData] = useState({ jabatan: "Kepala Bengkel", nama: "", nip: "-" });

  const fetchHistory = async () => {
    try {
      setIsLoading(true);
      setErrorMsg("");

      const userStr = typeof window !== "undefined" ? localStorage.getItem("user") : null;
      const currentUser = userStr ? JSON.parse(userStr) : null;
      const myJurusanId = currentUser?.jurusan_id ? String(currentUser.jurusan_id) : null;

      // 1. Ambil Nama Jurusan User Login
      let detectedJurusan =
        currentUser?.jurusan?.nama_jurusan ||
        currentUser?.jurusan?.nama ||
        currentUser?.nama_jurusan ||
        currentUser?.jurusan_nama;

      // Jika di user object hanya ada jurusan_id tanpa nama jurusan, fetch master jurusan
      if (!detectedJurusan && myJurusanId) {
        try {
          const listJurusan = await apiJurusan.getAll();
          const found = listJurusan.find((j: any) => String(j.id) === String(myJurusanId));
          if (found) detectedJurusan = found.nama_jurusan || found.nama;
        } catch {
          // fallback jika api fail
        }
      }

      setUserJurusanName(detectedJurusan || "Rekayasa Perangkat Lunak");

      // 2. Fetch Data Riwayat & Kerusakan
      const [riwayatData, kerusakanData] = await Promise.all([
        apiRiwayatPerbaikan.getAll(),
        apiKerusakan.getAll().catch(() => []),
      ]);

      const pMap: Record<number, string> = {};
      const kerusakanJurusanMap = new Map<number, string>();

      (kerusakanData || []).forEach((k: any) => {
        if (k.id) {
          pMap[k.id] = k.user?.name || k.user?.email || k.user?.username || (k.id_user ? `User #${k.id_user}` : "-");
          const jId = k.item_instance?.perangkat?.labor?.id_jurusan || k.item_instance?.perangkat?.labor?.jurusan_id || k.item_instance?.perangkat?.id_jurusan || k.user?.jurusan_id;
          if (jId != null) kerusakanJurusanMap.set(k.id, String(jId));
        }
      });

      setPelaporMap(pMap);

      const filteredByJurusan = (riwayatData || []).filter((item: any) => {
        const itemJurusanId = item.jurusan_id || item.id_jurusan || kerusakanJurusanMap.get(item.kerusakan_id);
        if (!itemJurusanId) return false;
        if (!myJurusanId) return true;
        return String(itemJurusanId) === myJurusanId;
      });

      setHistoryList(filteredByJurusan);
    } catch (err: any) {
      setErrorMsg(err.message || "Gagal memuat riwayat perbaikan.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchHistory(); }, []);

  // Formatters
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "-";
    try {
      return new Intl.DateTimeFormat("id-ID", { day: "numeric", month: "short", year: "numeric" }).format(new Date(dateStr));
    } catch {
      return "-";
    }
  };

  const formatRupiah = (amount: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(amount || 0);

  // Search Filter
  const filteredData = historyList.filter((item) => {
    const q = searchQuery.toLowerCase();
    const pelapor = pelaporMap[item.kerusakan_id] || item.nama_teknisi || "";
    return (
      (item.nama_perangkat && item.nama_perangkat.toLowerCase().includes(q)) ||
      (item.kode_asset && item.kode_asset.toLowerCase().includes(q)) ||
      pelapor.toLowerCase().includes(q) ||
      (item.deskripsi_perbaikan && item.deskripsi_perbaikan.toLowerCase().includes(q))
    );
  });

  const totalBiaya = filteredData.reduce((acc, curr) => acc + (Number(curr.biaya) || 0), 0);

  // Export Excel
  const handleExportExcel = () => {
    if (filteredData.length === 0) return alert("Tidak ada data untuk diexport.");
    const excelData = filteredData.map((item, index) => ({
      No: index + 1,
      Tanggal: formatDate(item.tanggal_perbaikan),
      "Nama Barang": item.nama_perangkat || "Perangkat",
      "Kode Asset": item.kode_asset || "-",
      "Teknisi / Pelapor": pelaporMap[item.kerusakan_id] || item.nama_teknisi || "-",
      "Deskripsi Perbaikan": item.deskripsi_perbaikan || "-",
      "Biaya (Rp)": item.biaya || 0,
    }));
    const ws = XLSX.utils.json_to_sheet(excelData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Riwayat Perbaikan");
    XLSX.writeFile(wb, `Riwayat_Perbaikan_${userJurusanName.replace(/\s+/g, "_")}_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  // Generate & Download PDF
  const handleGeneratePDF = (e: React.FormEvent) => {
    e.preventDefault();
    setIsPdfModalOpen(false);

    const doc = new jsPDF("p", "pt", "a4");
    const pw = doc.internal.pageSize.getWidth();
    const ph = doc.internal.pageSize.getHeight();

    // Header Laporan
    doc.setFontSize(13).setFont("helvetica", "bold").text("LAPORAN RIWAYAT PERBAIKAN PERANGKAT", pw / 2, 40, { align: "center" });
    doc.setFontSize(10).text(`JURUSAN: ${userJurusanName.toUpperCase()}`, pw / 2, 54, { align: "center" });
    doc.setFontSize(8).setFont("helvetica", "normal");
    doc.text("Sistem Informasi Inventaris Laboratorium Sekolah", pw / 2, 67, { align: "center" });
    doc.text(`Tanggal Cetak: ${formatDate(new Date().toISOString())}`, pw / 2, 78, { align: "center" });

    doc.setLineWidth(1).line(40, 86, pw - 40, 86);

    // Tabel PDF
    autoTable(doc, {
      startY: 96,
      head: [["NO", "TANGGAL", "BARANG / UNIT", "TEKNISI / PELAPOR", "DESKRIPSI PERBAIKAN", "BIAYA"]],
      body: filteredData.map((item, idx) => [
        idx + 1,
        formatDate(item.tanggal_perbaikan),
        `${item.nama_perangkat || "Perangkat"}\n(${item.kode_asset || "-"})`,
        pelaporMap[item.kerusakan_id] || item.nama_teknisi || "-",
        item.deskripsi_perbaikan || "-",
        formatRupiah(item.biaya),
      ]),
      foot: [
        [
          // TOTAL BIAYA DI KIRI (colSpan 5, align left)
          { content: "TOTAL BIAYA PERBAIKAN", colSpan: 5, styles: { halign: "left", fontStyle: "bold" } },
          { content: formatRupiah(totalBiaya), styles: { halign: "right", fontStyle: "bold" } },
        ],
      ],
      theme: "grid",
      headStyles: { fillColor: [30, 41, 59], textColor: 255, fontStyle: "bold", halign: "center" },
      footStyles: { fillColor: [241, 245, 249], textColor: [15, 23, 42] },
      columnStyles: { 0: { halign: "center", cellWidth: 30 }, 5: { halign: "right", cellWidth: 80 } },
      styles: { fontSize: 8, cellPadding: 5 },
    });

    // 1. Kunci ke Halaman Terakhir PDF
    const totalPages = doc.getNumberOfPages();
    doc.setPage(totalPages);

    // 2. TTD di Pojok Kiri Bawah Halaman (Margin bawah ~110pt dari ph)
    const signX = 40; 
    const signY = ph - 110; 

    doc.setFontSize(9).setFont("helvetica", "normal");
    doc.text("Mengetahui,", signX, signY);
    doc.text(`${pdfSignData.jabatan || "Kepala Bengkel"},`, signX, signY + 12);

    const nameY = signY + 60;
    doc.setFont("helvetica", "bold").text(pdfSignData.nama || "( .................................... )", signX, nameY);
    doc.setFont("helvetica", "normal");
    doc.text(pdfSignData.nip && pdfSignData.nip.trim() !== "" ? `NIP. ${pdfSignData.nip}` : "NIP. -", signX, nameY + 11);

    doc.save(`Riwayat_Perbaikan_${userJurusanName.replace(/\s+/g, "_")}_${new Date().toISOString().slice(0, 10)}.pdf`);
  };

  return (
    <PageAnimateWrapper>
      <div className="space-y-6 font-sans tracking-tight">
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <Link href="/kabeng/damages" className="inline-flex items-center gap-1.5 text-sm font-bold text-outline hover:text-primary mb-1">
              <ArrowLeft className="w-4 h-4" /> Kembali ke Laporan Kerusakan
            </Link>
            <h1 className="text-3xl font-bold text-on-surface flex items-center gap-2">
              <History className="w-8 h-8 text-primary" /> Riwayat Perbaikan
            </h1>
            <p className="text-sm text-on-surface-variant font-medium">
              Log pemeliharaan perangkat jurusan <span className="font-bold text-primary">{userJurusanName}</span>.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button onClick={handleExportExcel} className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl flex items-center gap-2 shadow-xs cursor-pointer">
              <FileSpreadsheet className="w-4 h-4" /> Export Excel
            </button>
            <button onClick={() => { if (filteredData.length === 0) return alert("Tidak ada data."); setIsPdfModalOpen(true); }} className="px-4 py-2 bg-primary hover:bg-primary-container text-white font-bold text-sm rounded-xl flex items-center gap-2 shadow-xs cursor-pointer">
              <Printer className="w-4 h-4" /> Export PDF
            </button>
          </div>
        </div>

        {/* Search & Total */}
        <div className="bg-white border border-surface-container-high rounded-xl p-4 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative flex-1 max-w-md w-full">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-outline" />
            <input
              type="text"
              placeholder="Cari perangkat, asset, atau pelapor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-surface-container-high rounded-lg text-sm focus:outline-none focus:border-primary font-medium"
            />
          </div>
          <div className="text-right w-full md:w-auto">
            <span className="text-xs font-bold text-outline uppercase block">Total Pengeluaran</span>
            <span className="text-xl font-black text-emerald-700">{formatRupiah(totalBiaya)}</span>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white border border-surface-container-high rounded-xl overflow-hidden shadow-xs">
          {isLoading ? (
            <div className="flex flex-col items-center py-12 space-y-2">
              <Loader2 className="w-7 h-7 animate-spin text-primary" />
              <p className="text-sm font-semibold text-outline">Memuat data...</p>
            </div>
          ) : errorMsg ? (
            <div className="p-8 text-center space-y-2">
              <AlertCircle className="w-8 h-8 text-error mx-auto" />
              <p className="text-sm font-bold text-error">{errorMsg}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm min-w-[700px]">
                <thead className="bg-surface-low border-b border-surface-container-high text-xs font-bold uppercase">
                  <tr>
                    <th className="p-3.5 text-center w-10">No</th>
                    <th className="p-3.5">Tanggal</th>
                    <th className="p-3.5">Barang / Unit</th>
                    <th className="p-3.5">Teknisi / Pelapor</th>
                    <th className="p-3.5 w-1/3">Deskripsi Perbaikan</th>
                    <th className="p-3.5 text-right">Biaya</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-container font-semibold">
                  {filteredData.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-6 text-center text-outline">Tidak ada riwayat perbaikan ditemukan.</td>
                    </tr>
                  ) : (
                    filteredData.map((item, idx) => (
                      <tr key={item.id || idx} className="hover:bg-surface-low/30">
                        <td className="p-3.5 text-center text-outline">{idx + 1}</td>
                        <td className="p-3.5 font-mono text-outline whitespace-nowrap">{formatDate(item.tanggal_perbaikan)}</td>
                        <td className="p-3.5 font-bold">
                          {item.nama_perangkat || "Perangkat"}
                          <span className="text-xs font-mono text-outline font-normal block">{item.kode_asset || "-"}</span>
                        </td>
                        <td className="p-3.5 whitespace-nowrap">{pelaporMap[item.kerusakan_id] || item.nama_teknisi || "-"}</td>
                        <td className="p-3.5 font-medium">{item.deskripsi_perbaikan || "-"}</td>
                        <td className="p-3.5 text-right text-emerald-700 whitespace-nowrap font-bold">{formatRupiah(item.biaya)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal TTD PDF */}
      {isPdfModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-sm w-full p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b pb-2">
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-primary" />
                <h3 className="text-base font-bold">Informasi Tanda Tangan</h3>
              </div>
              <button onClick={() => setIsPdfModalOpen(false)} className="text-outline hover:text-on-surface">
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
                  className="w-full px-3 py-1.5 border rounded-lg text-sm focus:outline-none focus:border-primary"
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
                  className="w-full px-3 py-1.5 border rounded-lg text-sm focus:outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase mb-1">NIP (Isi '-' jika tidak ada)</label>
                <input
                  type="text"
                  value={pdfSignData.nip}
                  onChange={(e) => setPdfSignData({ ...pdfSignData, nip: e.target.value })}
                  className="w-full px-3 py-1.5 border rounded-lg text-sm focus:outline-none focus:border-primary"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setIsPdfModalOpen(false)} className="px-3 py-1.5 text-sm font-bold text-outline hover:bg-surface-low rounded-lg">
                  Batal
                </button>
                <button type="submit" className="px-4 py-1.5 text-sm font-bold text-white bg-primary hover:bg-primary-container rounded-lg flex items-center gap-1.5">
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