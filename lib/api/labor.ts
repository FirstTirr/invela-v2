const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export interface Labor {
  id: number;
  labor: string; // 👈 Ubah dari `kelas: string` ke `labor: string`
  created_at?: string;
  updated_at?: string;
}

export const apiLabor = {
  async getAll(): Promise<Labor[]> {
    const res = await fetch(`${BASE_URL}/api/labor`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });

    if (!res.ok) throw new Error('Gagal mengambil data laboratorium');
    const result = await res.json();
    return result.data || [];
  },

  async getById(id: number): Promise<Labor> {
    const res = await fetch(`${BASE_URL}/api/labor/${id}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || 'Laboratorium tidak ditemukan');
    }

    const result = await res.json();
    return result.data;
  },

  // POST: Kirim payload { labor: "..." }
  async create(laborName: string): Promise<Labor> {
    const res = await fetch(`${BASE_URL}/api/labor`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ labor: laborName }), // 👈 Payload sekarang { labor: laborName }
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || 'Gagal menyimpan data labor');
    }

    const result = await res.json();
    return result.data;
  },

  // PUT: Kirim payload { labor: "..." }
  async update(id: number, laborName: string): Promise<Labor> {
    const res = await fetch(`${BASE_URL}/api/labor/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ labor: laborName }), // 👈 Payload sekarang { labor: laborName }
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || 'Gagal memperbarui data labor');
    }

    const result = await res.json();
    return result.data;
  },

  async delete(id: number): Promise<void> {
    const res = await fetch(`${BASE_URL}/api/labor/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || 'Gagal menghapus data labor');
    }
  },
};