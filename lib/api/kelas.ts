const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export interface Kelas {
  id: number;
  kelas: string;
  created_at?: string;
  updated_at?: string;
}

export const apiKelas = {
  async getAll(): Promise<Kelas[]> {
    const res = await fetch(`${BASE_URL}/api/kelas`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });
    if (!res.ok) throw new Error('Gagal mengambil data kelas');
    const result = await res.json();
    return result.data || [];
  },

  async create(kelasName: string): Promise<Kelas> {
    const res = await fetch(`${BASE_URL}/api/kelas`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ kelas: kelasName }),
    });
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || 'Gagal menyimpan kelas');
    }
    const result = await res.json();
    return result.data;
  },

  async update(id: number, kelasName: string): Promise<Kelas> {
    const res = await fetch(`${BASE_URL}/api/kelas/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ kelas: kelasName }),
    });
    if (!res.ok) throw new Error('Gagal memperbarui kelas');
    const result = await res.json();
    return result.data;
  },

  async delete(id: number): Promise<void> {
    const res = await fetch(`${BASE_URL}/api/kelas/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) throw new Error('Gagal menghapus data kelas');
  }
};