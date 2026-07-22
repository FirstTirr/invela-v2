const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export interface PeminjamanItemInstance {
  id: number;
  id_item_instance?: number;
  kode_asset: string;
  status: string;
  item?: {
    id: number;
    nama_perangkat: string;
  };
}

export interface Peminjaman {
  id: number;
  id_item_instance: number;
  item_instance?: {
    id: number;
    kode_asset: string;
    perangkat?: {
      id: number;
      nama_perangkat: string;
    };
  };
  nama_peminjam: string;
  nomor_telepon: string;
  tanggal_pinjam: string;
  tanggal_kembali: string;
  status: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreatePeminjamanPayload {
  id_item_instance: number;
  nama_peminjam: string;
  nomor_telepon: string;
  tanggal_pinjam: string;
  tanggal_kembali: string;
  status: string;
}

export interface UpdatePeminjamanPayload {
  id_item_instance?: number;
  nama_peminjam?: string;
  nomor_telepon?: string;
  tanggal_pinjam?: string;
  tanggal_kembali?: string;
  status?: string;
}

export const apiPeminjaman = {
  async getAll(): Promise<Peminjaman[]> {
    const res = await fetch(`${BASE_URL}/api/peminjaman`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });

    if (!res.ok) throw new Error('Gagal mengambil data peminjaman');
    const result = await res.json();
    return result.data || [];
  },

  async getById(id: number): Promise<Peminjaman> {
    const res = await fetch(`${BASE_URL}/api/peminjaman/${id}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || 'Data peminjaman tidak ditemukan');
    }

    const result = await res.json();
    return result.data;
  },

  async create(payload: CreatePeminjamanPayload): Promise<Peminjaman> {
    const res = await fetch(`${BASE_URL}/api/peminjaman`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || 'Gagal menambahkan data peminjaman');
    }

    const result = await res.json();
    return result.data;
  },

  async update(id: number, payload: UpdatePeminjamanPayload): Promise<Peminjaman> {
    const res = await fetch(`${BASE_URL}/api/peminjaman/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || 'Gagal memperbarui data peminjaman');
    }

    const result = await res.json();
    return result.data;
  },

  async delete(id: number): Promise<void> {
    const res = await fetch(`${BASE_URL}/api/peminjaman/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || 'Gagal menghapus data peminjaman');
    }
  },
};