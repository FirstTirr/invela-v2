// lib/api/perangkat.ts
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api';

export interface Perangkat {
  id: number;
  nama_perangkat: string;
  kategori_id: number;
  id_jurusan: number;
  id_labor: number;
  deskripsi: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreatePerangkatInput {
  nama_perangkat: string;
  kategori_id: number;
  id_jurusan: number;
  id_labor: number;
  deskripsi?: string;
}

export interface UpdatePerangkatInput {
  nama_perangkat?: string;
  kategori_id?: number;
  id_jurusan?: number;
  id_labor?: number;
  deskripsi?: string;
}

export const apiPerangkat = {
  // Method CRUD tetap sama seperti file kamu
  getAll: async (): Promise<Perangkat[]> => {
    const res = await fetch(`${BASE_URL}/api/perangkat`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Gagal mengambil data perangkat');
    const json = await res.json();
    return json.data || [];
  },

  getById: async (id: number): Promise<Perangkat> => {
    const res = await fetch(`${BASE_URL}/api/perangkat/${id}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Gagal mengambil detail perangkat');
    const json = await res.json();
    return json.data;
  },

  create: async (data: CreatePerangkatInput): Promise<Perangkat> => {
    const res = await fetch(`${BASE_URL}/api/perangkat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Gagal menambahkan perangkat');
    }
    const json = await res.json();
    return json.data;
  },

  update: async (id: number, data: UpdatePerangkatInput): Promise<Perangkat> => {
    const res = await fetch(`${BASE_URL}/api/perangkat/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Gagal mengubah perangkat');
    }
    const json = await res.json();
    return json.data;
  },

  delete: async (id: number): Promise<void> => {
    const res = await fetch(`${BASE_URL}/api/perangkat/${id}`, {
      method: 'DELETE',
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || 'Gagal menghapus perangkat');
    }
  },
};