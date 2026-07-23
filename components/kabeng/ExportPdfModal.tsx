"use client";

import React, { useState, useEffect } from 'react';
import { X, FileText, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Labor } from '@/lib/api';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ExportPdfModalProps {
  isOpen: boolean;
  onClose: () => void;
  laborList: Labor[];
  displayItems: any[];
}

export default function ExportPdfModal({ isOpen, onClose, laborList, displayItems }: ExportPdfModalProps) {
  const [selectedLaborId, setSelectedLaborId] = useState<number>(laborList[0]?.id || 0);
  const [namaSekolah, setNamaSekolah] = useState('SMKN 4 Payakumbuh');
  const [tahunAjaran, setTahunAjaran] = useState('2025/2026');
  const [nip, setNip] = useState('');
  const [password, setPassword] = useState('');
  const [lokasiTanggal, setLokasiTanggal] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (laborList.length > 0 && selectedLaborId === 0) {
        setSelectedLaborId(laborList[0].id);
      }
      const now = new Date();
      const options: Intl.DateTimeFormatOptions = { month: 'long', year: 'numeric' };
      const formattedDate = now.toLocaleDateString('id-ID', options);
      setLokasiTanggal(`Payakumbuh, ${formattedDate}`);
    }
  }, [isOpen, laborList]);

  if (!isOpen) return null;

  const handleGeneratePdf = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      alert('Masukkan password akun untuk verifikasi keamanan cetak PDF!');
      return;
    }

    try {
      setIsGenerating(true);
      const currentLabor = laborList.find(l => l.id === Number(selectedLaborId));
      const laborName = currentLabor ? currentLabor.labor : 'Laboratorium';

      // Filter item berdasarkan labor yang dipilih
      const filteredItems = displayItems.filter(item => Number(item.id_labor) === Number(selectedLaborId));

      const doc = new jsPDF();

      // Header Dokumen
      doc.setFont("helvetica", "bold");
      doc.setFontSize(14);
      doc.text("DAFTAR INVENTARIS LABOR", doc.internal.pageSize.getWidth() / 2, 20, { align: "center" });
      
      doc.setFontSize(11);
      doc.text(namaSekolah.toUpperCase(), doc.internal.pageSize.getWidth() / 2, 28, { align: "center" });
      doc.text(laborName.toUpperCase(), doc.internal.pageSize.getWidth() / 2, 35, { align: "center" });
      doc.text(`Tahun Ajaran: ${tahunAjaran}`, doc.internal.pageSize.getWidth() / 2, 42, { align: "center" });

      // Tabel Data
      const tableColumn = ["No", "Nama Barang", "Jumlah", "Baik", "Rusak", "Keterangan"];
      const tableRows: any[] = [];

      filteredItems.forEach((item, index) => {
        const baikCount = item.instances ? item.instances.filter((i: any) => i.status === 'aktif').length : item.jumlah_stok;
        const rusakCount = item.instances ? item.instances.filter((i: any) => i.status === 'rusak' || i.status === 'perbaikan').length : 0;

        const baikText = baikCount > 0 ? "CHECKED" : "-";
        const rusakText = rusakCount > 0 ? `${rusakCount}` : "-";

        tableRows.push([
          index + 1,
          item.nama_perangkat || item.namaPerangkat,
          item.jumlah_stok || item.jumlahStok || 0,
          baikText,
          rusakText,
          item.deskripsi || ""
        ]);
      });

      autoTable(doc, {
        startY: 50,
        head: [tableColumn],
        body: tableRows,
        theme: 'grid',
        headStyles: { 
          fillColor: [30, 41, 59], 
          textColor: [255, 255, 255], 
          fontStyle: 'bold', 
          halign: 'center' 
        },
        columnStyles: {
          0: { halign: 'center', cellWidth: 12 },
          2: { halign: 'center', cellWidth: 20 },
          3: { halign: 'center', cellWidth: 20 }, // Kolom Baik
          4: { halign: 'center', cellWidth: 20 }, // Kolom Rusak
        },
        styles: { fontSize: 10, cellPadding: 4, valign: 'middle' },
        margin: { bottom: 65 },

        // 🎨 RENDER CENTANG HITAM PRESISI ALA LUCIDE
        didParseCell: (data) => {
          if (data.section === 'body' && data.column.index === 3 && data.cell.raw === 'CHECKED') {
            data.cell.text = [''];
          }
        },
        didDrawCell: (data) => {
          if (data.section === 'body' && data.column.index === 3 && data.cell.raw === 'CHECKED') {
            const x = data.cell.x + data.cell.width / 2;
            const y = data.cell.y + data.cell.height / 2;

            doc.setDrawColor(0, 0, 0); // Hitam Pekat
            doc.setLineWidth(0.9);    // Ketebalan pas ala Icon Lucide

            // Dimensi lebih kecil dan presisi di tengah
            doc.line(x - 2.5, y - 0.2, x - 0.8, y + 1.8);
            doc.line(x - 0.8, y + 1.8, x + 2.5, y - 2.2);
          }
        }
      });

      // Posisi Tanda Tangan
      const pageCount = doc.getNumberOfPages();
      doc.setPage(pageCount);

      const pageHeight = doc.internal.pageSize.getHeight();
      const signatureY = pageHeight - 50;

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      
      doc.text(lokasiTanggal, 14, signatureY);
      doc.text("Mengetahui Kepala Laboratorium", 14, signatureY + 6);
      doc.text("__________________________", 14, signatureY + 28);
      doc.setFont("helvetica", "bold");
      doc.text(`NIP. ${nip || '-'}`, 14, signatureY + 34);

      doc.save(`Inventaris_${laborName.replace(/\s+/g, '_')}.pdf`);
      onClose();
    } catch (err: any) {
      alert(`Gagal membuat PDF: ${err.message}`);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-on-surface/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="bg-white w-full max-w-md border border-surface-container-high rounded-xl shadow-xl p-6 space-y-4 my-auto"
      >
        <div className="flex justify-between items-center border-b border-surface-container pb-2">
          <h3 className="text-lg font-bold text-on-surface flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" /> Cetak Laporan PDF
          </h3>
          <button onClick={onClose} className="text-outline hover:text-on-surface p-1.5 rounded-lg border border-surface-container cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleGeneratePdf} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-outline uppercase tracking-wider">Nama Sekolah</label>
            <input 
              type="text" 
              required
              value={namaSekolah}
              onChange={(e) => setNamaSekolah(e.target.value)}
              className="w-full px-3 py-2 border border-surface-container-high rounded-lg text-sm font-semibold"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-outline uppercase tracking-wider">Pilih Laboratorium</label>
            <select 
              value={selectedLaborId}
              onChange={(e) => setSelectedLaborId(Number(e.target.value))}
              className="w-full px-3 py-2 border border-surface-container-high rounded-lg text-sm font-semibold"
            >
              {laborList.map(l => (
                <option key={l.id} value={l.id}>{l.labor}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-outline uppercase tracking-wider">Tahun Ajaran</label>
            <input 
              type="text" 
              required
              placeholder="Contoh: 2025/2026"
              value={tahunAjaran}
              onChange={(e) => setTahunAjaran(e.target.value)}
              className="w-full px-3 py-2 border border-surface-container-high rounded-lg text-sm font-semibold"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-outline uppercase tracking-wider">Lokasi & Tanggal (Otomatis)</label>
            <input 
              type="text" 
              value={lokasiTanggal}
              onChange={(e) => setLokasiTanggal(e.target.value)}
              className="w-full px-3 py-2 border border-surface-container-high rounded-lg text-sm font-medium bg-surface-low"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-outline uppercase tracking-wider">NIP Kepala Labor</label>
            <input 
              type="text" 
              required
              placeholder="Masukkan NIP Anda..."
              value={nip}
              onChange={(e) => setNip(e.target.value)}
              className="w-full px-3 py-2 border border-surface-container-high rounded-lg text-sm font-semibold"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-outline uppercase tracking-wider">Password Akun (Keamanan)</label>
            <input 
              type="password" 
              required
              placeholder="Konfirmasi password akun..."
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-surface-container-high rounded-lg text-sm font-semibold"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-surface-container">
            <button 
              type="button" 
              onClick={onClose}
              className="px-4 py-2 text-sm font-bold text-secondary hover:bg-surface-low rounded-lg"
            >
              Batal
            </button>
            <button 
              type="submit" 
              disabled={isGenerating}
              className="px-5 py-2 text-sm font-bold text-white bg-primary hover:bg-primary-container rounded-lg flex items-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
            >
              {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              {isGenerating ? 'Memproses PDF...' : 'Download PDF'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}