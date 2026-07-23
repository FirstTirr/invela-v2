import { fetchWithAuth } from './fetcher';

export interface PeminjamanInput {
  perangkat_id?: number;
  item_instance_id?: number;
  nama_peminjam: string;
  no_hp?: string;
  tanggal_pinjam: string;
  tanggal_kembali?: string;
}

export const apiPeminjaman = {
  // GET: Ambil daftar seluruh peminjaman
  async getAll() {
    const result = await fetchWithAuth('/api/peminjaman', { 
      method: 'GET', 
      cache: 'no-store' 
    });
    return result.data || [];
  },

  // GET: Ambil detail peminjaman berdasarkan ID
  async getById(id: number) {
    const result = await fetchWithAuth(`/api/peminjaman/${id}`, { 
      method: 'GET' 
    });
    return result.data;
  },

  // POST: Buat pengajuan peminjaman baru
  async create(payload: PeminjamanInput) {
    const result = await fetchWithAuth('/api/peminjaman', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return result.data;
  },

  // PUT: Update data peminjaman / status
  async update(id: number, payload: Partial<PeminjamanInput>) {
    const result = await fetchWithAuth(`/api/peminjaman/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
    return result.data;
  },

  // DELETE: Hapus log peminjaman
  async delete(id: number) {
    await fetchWithAuth(`/api/peminjaman/${id}`, { 
      method: 'DELETE' 
    });
  },
};