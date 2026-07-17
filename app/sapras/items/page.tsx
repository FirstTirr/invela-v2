"use client";

import React from 'react';
import PageAnimateWrapper from '@/components/page-animate-wrapper';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface LaborItem {
  id: string;
  nama: string;
  jurusan: string;
  labor: string;
  jumlah: number;
  kategori: string;
  status: 'Baik' | 'Perbaikan' | 'Rusak';
}

export default function SaprasItemsPage() {
  const items: LaborItem[] = [
    { id: 'BRG-01', nama: 'PC Client Asus ExpertCenter', jurusan: 'PPLG', labor: 'Labor Komputer Pemrograman', jumlah: 36, kategori: 'Perangkat Keras Utama', status: 'Baik' },
    { id: 'BRG-02', nama: 'Drawing Tablet Wacom Intuos', jurusan: 'DKV', labor: 'Labor Multimedia & DKV', jumlah: 15, kategori: 'Alat Pendukung Pengembang', status: 'Perbaikan' }
  ];

  return (
    <PageAnimateWrapper>
      <div className="space-y-8 font-sans antialiased tracking-tight">
        <div>
          <h1 className="text-3xl font-bold text-on-surface">Daftar Inventaris Aset Sekolah</h1>
          <p className="text-base text-on-surface-variant mt-2 font-medium">Hak akses Sapras untuk meninjau seluruh log barang dan alat praktikum antar jurusan.</p>
        </div>

        <div className="bg-white border border-surface-container-high rounded-xl overflow-hidden shadow-sm">
          <Table className="text-base">
            <TableHeader className="bg-surface-low border-b border-surface-container-high">
              <TableRow>
                <TableHead className="p-5 text-sm font-bold text-on-surface uppercase tracking-wider">Nama & ID Barang</TableHead>
                <TableHead className="p-5 text-sm font-bold text-on-surface uppercase tracking-wider">Lokasi Jurusan / Labor</TableHead>
                <TableHead className="p-5 text-sm font-bold text-on-surface uppercase tracking-wider text-center">Jumlah Stok</TableHead>
                <TableHead className="p-5 text-sm font-bold text-on-surface uppercase tracking-wider">Kategori Kelompok</TableHead>
                <TableHead className="p-5 text-sm font-bold text-on-surface uppercase tracking-wider text-right">Kondisi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="text-on-surface font-medium">
              {items.map((item) => (
                <TableRow key={item.id} className="hover:bg-surface-low/30 transition-colors border-b border-surface-container">
                  <TableCell className="p-5">
                    <span className="block text-base font-bold text-primary">{item.nama}</span>
                    <span className="block text-xs font-mono text-outline mt-0.5">ID Unit: {item.id}</span>
                  </TableCell>
                  <TableCell className="p-5">
                    <span className="block text-base font-bold text-on-surface">{item.labor}</span>
                    <span className="block text-sm text-outline font-bold mt-0.5">Program Keahlian: {item.jurusan}</span>
                  </TableCell>
                  <TableCell className="p-5 text-center font-bold text-base tabular-nums">{item.jumlah} Unit</TableCell>
                  <TableCell className="p-5 text-base font-semibold text-on-surface-variant">{item.kategori}</TableCell>
                  <TableCell className="p-5 text-right">
                    <Badge className={`px-3 py-1 rounded-md text-sm font-bold shadow-none border ${
                      item.status === 'Baik' ? 'bg-green-100 text-green-900 border-green-300 hover:bg-green-100' :
                      item.status === 'Perbaikan' ? 'bg-amber-100 text-amber-900 border-amber-300 hover:bg-amber-100' : 
                      'bg-red-100 text-red-900 border-red-300 hover:bg-red-100'
                    }`}>
                      {item.status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </PageAnimateWrapper>
  );
}