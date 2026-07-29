// lib/api/riwayat-perbaikan.ts
import { fetchWithAuth } from '@/lib/api/fetcher';

export interface RiwayatPerbaikan {
  id: number;
  perbaikan_id: number;
  kerusakan_id: number;
  kode_asset: string;
  nama_perangkat: string;
  deskripsi_kerusakan: string;
  deskripsi_perbaikan: string;
  biaya: number;
  nama_teknisi: string;
  tanggal_perbaikan: string;
}

export const apiRiwayatPerbaikan = {
  // Ambil seluruh riwayat perbaikan (Urut terbaru)
  getAll: async (): Promise<RiwayatPerbaikan[]> => {
    const result = await fetchWithAuth('/api/riwayat-perbaikan', {
      cache: 'no-store',
    });
    return result.data || [];
  },

  // Ambil riwayat perbaikan spesifik berdasarkan Kode Asset
  getByKodeAsset: async (kodeAsset: string): Promise<RiwayatPerbaikan[]> => {
    const result = await fetchWithAuth(`/api/riwayat-perbaikan/${encodeURIComponent(kodeAsset)}`, {
      cache: 'no-store',
    });
    return result.data || [];
  },
};