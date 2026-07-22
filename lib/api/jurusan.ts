const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export interface Jurusan {
  id: number;
  nama_jurusan: string;
  created_at?: string;
  updated_at?: string;
}

export const apiJurusan = {
  async getAll(): Promise<Jurusan[]> {
    const res = await fetch(`${BASE_URL}/api/jurusan`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });
    if (!res.ok) throw new Error('Gagal mengambil data jurusan');
    const result = await res.json();
    return result.data || [];
  },

  async create(namaJurusan: string): Promise<Jurusan> {
    const res = await fetch(`${BASE_URL}/api/jurusan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nama_jurusan: namaJurusan }),
    });
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || 'Gagal menyimpan jurusan');
    }
    const result = await res.json();
    return result.data;
  },

  async update(id: number, namaJurusan: string): Promise<Jurusan> {
    const res = await fetch(`${BASE_URL}/api/jurusan/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nama_jurusan: namaJurusan }),
    });
    if (!res.ok) throw new Error('Gagal memperbarui jurusan');
    const result = await res.json();
    return result.data;
  },

  async delete(id: number): Promise<void> {
    const res = await fetch(`${BASE_URL}/api/jurusan/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) throw new Error('Gagal menghapus data jurusan');
  }
};