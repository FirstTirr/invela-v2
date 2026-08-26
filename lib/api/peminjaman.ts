import { fetchWithAuth } from './fetcher';

export interface Peminjaman {
  id: number;
  id_item_instance: number;
  nama_peminjam: string;
  kelas: string;
  nomor_telepon: string;
  tanggal_pinjam: string;
  tanggal_kembali: string;
  actual_return_date: string;
  status: 'aktif' | 'selesai' | 'melewati batas waktu';
  created_at?: string;
  updated_at?: string;
  item_instance?: {
    id: number;
    kode_asset: string;
    status: string;
    perangkat?: {
      id: number;
      nama_perangkat: string;
      tipe?: string;
      labor?: {
        id_jurusan?: number | string;
        jurusan_id?: number | string;
      };
      id_jurusan?: number | string;
    };
  };
}

export interface CreatePeminjamanInput {
  id_item_instance: number;
  nama_peminjam: string;
  kelas: string;
  nomor_telepon: string;
  tanggal_pinjam: string; // Format: YYYY-MM-DD
  tanggal_kembali: string; // Format: YYYY-MM-DD
  status: 'aktif' | 'selesai' | 'melewati batas waktu';
}

export interface UpdatePeminjamanInput {
  id_item_instance?: number;
  nama_peminjam?: string;
  kelas?: string;
  nomor_telepon?: string;
  tanggal_pinjam?: string;
  tanggal_kembali?: string;
  status?: 'aktif' | 'selesai' | 'melewati batas waktu';
}

export const apiPeminjaman = {
  // GET: Ambil daftar seluruh peminjaman
  async getAll(): Promise<Peminjaman[]> {
    const result = await fetchWithAuth('/api/peminjaman', { 
      method: 'GET', 
      cache: 'no-store' 
    });
    return result.data || result || [];
  },

  // GET: Detail peminjaman by ID
  async getById(id: number): Promise<Peminjaman> {
    const result = await fetchWithAuth(`/api/peminjaman/${id}`, { 
      method: 'GET' 
    });
    return result.data || result;
  },

  // POST: Buat peminjaman baru
  async create(payload: CreatePeminjamanInput): Promise<Peminjaman> {
    const result = await fetchWithAuth('/api/peminjaman', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return result.data || result;
  },

  // PUT: Update peminjaman / status
  async update(id: number, payload: UpdatePeminjamanInput): Promise<Peminjaman> {
    const result = await fetchWithAuth(`/api/peminjaman/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    });
    return result.data || result;
  },

  // DELETE: Hapus log peminjaman
  async delete(id: number): Promise<void> {
    await fetchWithAuth(`/api/peminjaman/${id}`, { 
      method: 'DELETE' 
    });
  },
};