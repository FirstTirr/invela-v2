// Membaca IP global dari variabel lingkungan (.env.local)
const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export interface Kelas {
  id: number;
  kelas: string;
  created_at?: string;
  updated_at?: string;
}

// 🚀 TAMBAHKAN INTERFACE JURUSAN SESUAI MODEL GO
export interface Jurusan {
  id: number;
  nama_jurusan: string;
  created_at?: string;
  updated_at?: string;
}

export const apiKelas = {
  // GET: Mengambil semua data kelas
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

  // POST: Menambahkan kelas baru
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

  // PUT: Mengubah data kelas berdasarkan ID
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

  // DELETE: Menghapus data kelas berdasarkan ID
  async delete(id: number): Promise<void> {
    const res = await fetch(`${BASE_URL}/api/kelas/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) throw new Error('Gagal menghapus data kelas');
  }
};

// 🚀 TAMBAHKAN HELPER CRUD JURUSAN DI SINI
export const apiJurusan = {
  // GET: Mengambil semua data jurusan
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

  // POST: Menambahkan jurusan baru
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

  // PUT: Mengubah data jurusan berdasarkan ID
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

  // DELETE: Menghapus data jurusan berdasarkan ID
  async delete(id: number): Promise<void> {
    const res = await fetch(`${BASE_URL}/api/jurusan/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!res.ok) throw new Error('Gagal menghapus data jurusan');
  }
};