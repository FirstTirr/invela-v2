"use client";

import React, { useState, useEffect } from 'react';
import PageAnimateWrapper from '@/components/page-animate-wrapper';
import { Plus, Trash2, X, User, Key, Shield, Network, Eye, EyeOff, Loader2, RefreshCw } from 'lucide-react';
import { apiJurusan, Jurusan, apiUsers, UserResponse } from '@/lib/api';

export default function UsersCRUDPage() {
  const [users, setUsers] = useState<UserResponse[]>([]);
  const [loadingUsers, setLoadingUsers] = useState<boolean>(true);
  const [errorUsers, setErrorUsers] = useState<string | null>(null);

  const [isOpenModal, setIsOpenModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // State Jurusan dari backend
  const [jurusanList, setJurusanList] = useState<Jurusan[]>([]);
  const [loadingJurusan, setLoadingJurusan] = useState<boolean>(false);

  // Form State
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role_id: 1, // Default Role ID (1: Kabeng, 2: Kaprog, 3: Sapras, 4: Guru)
    jurusan_id: null as number | null,
  });

  // Opsi Role yang dipetakan ke uint ID
  const roleOptions = [
    { id: 1, label: 'Kepala Bengkel (Kabeng)' },
    { id: 2, label: 'Kepala Prodi (Kaprog)' },
    { id: 3, label: 'Sarana Prasarana (Sapras)' },
    { id: 4, label: 'Guru' },
  ];

  // Fetch daftar user dari Backend Go
  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      setErrorUsers(null);
      const data = await apiUsers.getAll();
      setUsers(data);
    } catch (err: any) {
      setErrorUsers(err.message || 'Gagal memuat data akun');
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Fetch data Jurusan saat modal pendaftaran dibuka
  useEffect(() => {
    const fetchJurusanData = async () => {
      try {
        setLoadingJurusan(true);
        const data = await apiJurusan.getAll();
        setJurusanList(data);

        if (data.length > 0 && formData.jurusan_id === null) {
          setFormData((prev) => ({ ...prev, jurusan_id: data[0].id }));
        }
      } catch (err) {
        console.error('Gagal mengambil data jurusan:', err);
      } finally {
        setLoadingJurusan(false);
      }
    };

    if (isOpenModal) {
      fetchJurusanData();
    }
  }, [isOpenModal]);

  // Handler Sanitasi Password (Hanya Alfanumerik A-Z, a-z, 0-9)
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cleanValue = e.target.value.replace(/[^a-zA-Z0-9]/g, '');
    setFormData((prev) => ({ ...prev, password: cleanValue }));
  };

  // Handler Hapus User
  const handleDelete = async (id: number, username: string) => {
    if (!confirm(`Yakin ingin menghapus akun [${username}]?`)) return;

    try {
      await apiUsers.delete(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (err: any) {
      alert(`Gagal menghapus pengguna: ${err.message}`);
    }
  };

  // Submit Handler -> Kirim data ke API Go
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsSubmitting(true);

      const payload = {
        username: formData.username.trim(),
        password_hash: formData.password,
        role_id: Number(formData.role_id),
        jurusan_id: formData.role_id === 3 ? null : formData.jurusan_id,
      };

      await apiUsers.create(payload);

      // Refresh list agar relasi ter-load sempurna dari backend
      await fetchUsers();

      setIsOpenModal(false);

      // Reset form state
      setFormData({
        username: '',
        password: '',
        role_id: 1,
        jurusan_id: jurusanList[0]?.id || null,
      });
      setShowPassword(false);
      alert('Akun pengguna berhasil didaftarkan!');
    } catch (err: any) {
      alert(`Gagal menyimpan akun: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageAnimateWrapper>
      <div className="space-y-8 font-sans antialiased tracking-tight">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 border-b border-surface-container pb-5">
          <div>
            <h1 className="text-3xl font-bold text-on-surface">Memantau Akun Pengguna</h1>
            <p className="text-base text-on-surface-variant mt-2 font-medium">
              Manajemen hak otentikasi login untuk Kepala Bengkel, Ketua Prodi, dan Sarpras.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchUsers}
              className="p-3 border border-surface-container-high bg-white rounded-xl hover:bg-surface-low text-on-surface transition-all cursor-pointer shadow-xs"
              title="Refresh Data"
            >
              <RefreshCw className={`w-5 h-5 ${loadingUsers ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => setIsOpenModal(true)}
              className="px-5 py-3 text-base font-bold text-white bg-primary hover:bg-primary-container rounded-xl flex items-center gap-2 transition-all active:scale-[0.98] shadow-sm cursor-pointer"
            >
              <Plus className="w-5 h-5" /> Tambah Akun Baru
            </button>
          </div>
        </div>

        {/* Table Monitoring */}
        <div className="bg-white border border-surface-container-high rounded-xl overflow-hidden shadow-sm w-full">
          <div className="overflow-x-auto w-full whitespace-nowrap">
            <table className="w-full text-left border-collapse text-base min-w-[600px]">
              <thead className="bg-surface-low border-b border-surface-container-high">
                <tr>
                  <th className="p-5 text-sm font-bold text-on-surface uppercase tracking-wider">Username</th>
                  <th className="p-5 text-sm font-bold text-on-surface uppercase tracking-wider">Jurusan Kelolaan</th>
                  <th className="p-5 text-sm font-bold text-on-surface uppercase tracking-wider">Hak Akses Role</th>
                  <th className="p-5 text-sm font-bold text-on-surface uppercase tracking-wider text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-container text-on-surface font-medium">
                {loadingUsers ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-outline">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />
                      Memuat data akun pengguna...
                    </td>
                  </tr>
                ) : errorUsers ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-error font-bold">
                      {errorUsers}
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-outline font-bold">
                      Belum ada data akun pengguna.
                    </td>
                  </tr>
                ) : (
                  users.map((user) => {
                    // Pengecekan fleksibel: apakah 'jurusan' bertipe string atau object { nama_jurusan }
                    const rawJurusan = user.jurusan as any;
                    const namaJurusanDisplay = typeof rawJurusan === 'string' 
                      ? rawJurusan 
                      : rawJurusan?.nama_jurusan || 'Semua Jurusan';

                    return (
                      <tr key={user.id} className="hover:bg-surface-low/30 transition-colors">
                        <td className="p-5 text-base font-bold text-primary">{user.username}</td>
                        <td className="p-5 text-base text-on-surface-variant font-bold uppercase">
                          {namaJurusanDisplay}
                        </td>
                        <td className="p-5">
                          <span className="inline-block px-3 py-1 rounded-md text-sm font-bold border bg-blue-50 text-blue-900 border-blue-200">
                            {user.role}
                          </span>
                        </td>
                        <td className="p-5 text-right">
                          <button
                            onClick={() => handleDelete(user.id, user.username)}
                            className="p-2 text-outline hover:text-error hover:bg-error-container/40 rounded-lg transition-colors cursor-pointer"
                            title="Hapus Akun"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal Form Dialog Tambah Akun */}
        {isOpenModal && (
          <div className="fixed inset-0 bg-on-surface/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-xl border border-surface-container-high rounded-xl shadow-2xl p-6 space-y-6 animate-in fade-in zoom-in-95 duration-150">
              {/* Modal Header */}
              <div className="flex justify-between items-center border-b border-surface-container pb-3">
                <h3 className="text-xl font-bold text-on-surface">Registrasi Akun Otoritas</h3>
                <button
                  onClick={() => {
                    setIsOpenModal(false);
                    setShowPassword(false);
                  }}
                  className="text-outline hover:text-on-surface p-1.5 rounded-lg border border-surface-container cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Form Content */}
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Username */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-outline uppercase tracking-wider flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5" /> Username (Wajib Smkn4pyk.com)
                  </label>
                  <input
                    type="text"
                    required
                    pattern=".*@smkn4pyk\.com$"
                    title="Username wajib menyertakan domain '@smkn4pyk.com' di akhir kalimat."
                    placeholder="Contoh: namaotoritas@smkn4pyk.com"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="w-full px-4 py-3 border border-surface-container-high rounded-xl text-base bg-white text-on-surface placeholder:text-outline/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all duration-200 font-medium shadow-sm"
                  />
                </div>

                {/* Password Alfanumerik */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-outline uppercase tracking-wider flex items-center justify-between">
                    <span className="flex items-center gap-1.5">
                      <Key className="w-3.5 h-3.5" /> Password
                    </span>
                    <span className="text-[10px] text-outline tracking-normal font-medium lowercase">
                      (Hanya kombinasi huruf dan angka, tanpa spasi)
                    </span>
                  </label>
                  <div className="relative group">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      pattern="[a-zA-Z0-9]+"
                      title="Password hanya boleh berisi huruf dan angka (tanpa spasi atau simbol)."
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handlePasswordChange}
                      className="w-full pl-4 pr-12 py-3 border border-surface-container-high rounded-xl text-base bg-white text-on-surface placeholder:text-outline/40 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all duration-200 font-medium shadow-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-outline hover:text-on-surface transition-colors cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Role Akses */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-outline uppercase tracking-wider flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5" /> Pilih Role Akses
                  </label>
                  <div className="relative">
                    <select
                      value={formData.role_id}
                      onChange={(e) => setFormData({ ...formData, role_id: Number(e.target.value) })}
                      className="w-full px-4 py-3 border border-surface-container-high rounded-xl text-base bg-white text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all duration-200 font-bold shadow-sm appearance-none cursor-pointer"
                    >
                      {roleOptions.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.label}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-outline">
                      <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                        <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Afiliasi Jurusan */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-outline uppercase tracking-wider flex items-center gap-1.5">
                    <Network className="w-4 h-4" /> Afiliasi Jurusan Kelolaan
                  </label>
                  <div className="relative">
                    <select
                      disabled={formData.role_id === 3 || loadingJurusan}
                      value={formData.role_id === 3 ? '' : (formData.jurusan_id ?? '')}
                      onChange={(e) => setFormData({ ...formData, jurusan_id: Number(e.target.value) })}
                      className="w-full px-4 py-3 border border-surface-container-high rounded-xl text-base bg-white text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all duration-200 font-bold shadow-sm appearance-none cursor-pointer disabled:bg-surface-low disabled:text-outline disabled:cursor-not-allowed uppercase"
                    >
                      {formData.role_id === 3 ? (
                        <option value="">Semua Jurusan (Khusus Sapras)</option>
                      ) : (
                        jurusanList.map((j) => (
                          <option key={j.id} value={j.id}>
                            {j.nama_jurusan}
                          </option>
                        ))
                      )}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-outline">
                      {loadingJurusan ? (
                        <span className="text-xs text-outline animate-pulse">Loading...</span>
                      ) : (
                        <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                          <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                        </svg>
                      )}
                    </div>
                  </div>
                </div>

                {/* Footer Modal */}
                <div className="flex justify-end gap-3 pt-4 border-t border-surface-container">
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => {
                      setIsOpenModal(false);
                      setShowPassword(false);
                    }}
                    className="px-5 py-2.5 text-base font-bold text-on-surface-variant hover:bg-surface-low rounded-xl transition-colors cursor-pointer disabled:opacity-50"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2.5 text-base font-bold text-white bg-primary hover:bg-primary-container active:scale-[0.98] transition-all rounded-xl shadow-sm cursor-pointer disabled:opacity-50"
                  >
                    {isSubmitting ? 'Menyimpan...' : 'Simpan Akun'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </PageAnimateWrapper>
  );
}