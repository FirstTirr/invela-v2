const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export interface Kategori {
  id: number;
  kategori: string;
  created_at?: string;
  updated_at?: string;
}

export const apiKategori = {
  // GET: Mengambil semua data kategori
  async getAll(): Promise<Kategori[]> {
    const res = await fetch(`${BASE_URL}/api/kategori`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store',
    });
    if (!res.ok) throw new Error('Gagal mengambil data kategori');
    const result = await res.json();
    return result.data || [];
  },

  // POST: Menambahkan kategori baru
  async create(kategoriName: string): Promise<Kategori> {
    const res = await fetch(`${BASE_URL}/api/kategori`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ Kategori: kategoriName }), // Note: Key 'Kategori' kapital sesuai struct Go
    });
    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || 'Gagal menyimpan kategori');
    }
    const result = await res.json();
    return result.data;
  },

  // PUT: Mengubah data kategori berdasarkan ID
  async update(id: number, kategoriName: string): Promise<Kategori> {
    const res = await fetch(`${BASE_URL}/api/kategori/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ Kategori: kategoriName }), // Note: Key 'Kategori' kapital sesuai struct Go
    });
    if (!res.ok) throw new Error('Gagal memperbarui kategori');
    const result = await res.json();
    return result.data;
  },

  // DELETE: Menghapus data kategori berdasarkan ID
  async delete(id: number): Promise<void> {
    const res = await fetch(`${BASE_URL}/api/kategori/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) throw new Error('Gagal menghapus data kategori');
  }
};