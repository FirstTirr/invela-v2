"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
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

  const [jurusanList, setJurusanList] = useState<Jurusan[]>([]);
  const [loadingJurusan, setLoadingJurusan] = useState<boolean>(false);

  const roleOptions = [
    { id: 1, label: 'Kepala Bengkel (Kabeng)' },
    { id: 2, label: 'Guru' },
    { id: 3, label: 'Kepala Prodi (Kaprog)' },
    { id: 4, label: 'Sarana Prasarana (Sapras)' },
  ];

  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role_id: 1,
    jurusan_id: null as number | null,
  });

  const isGlobalRole = useCallback((roleId: number) => roleId === 2 || roleId === 4, []);

  const filteredJurusanList = useMemo(() => {
    return jurusanList.filter(
      (j) => !j.nama_jurusan.toLowerCase().includes('semua')
    );
  }, [jurusanList]);

  // Saring akun admin agar tidak masuk ke state users
  const fetchUsers = useCallback(async () => {
    try {
      setLoadingUsers(true);
      setErrorUsers(null);
      const data = await apiUsers.getAll();
      const nonAdminUsers = (data || []).filter(
        (u) =>
          u.role?.toUpperCase() !== 'ADMIN' &&
          !u.username.toLowerCase().startsWith('admin')
      );
      setUsers(nonAdminUsers);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Gagal memuat data akun';
      setErrorUsers(errorMsg);
    } finally {
      setLoadingUsers(false);
    }
  }, []);

  const fetchJurusanData = useCallback(async () => {
    try {
      setLoadingJurusan(true);
      const data = await apiJurusan.getAll();
      setJurusanList(data);
    } catch (err) {
      console.error('Gagal mengambil data jurusan:', err);
    } finally {
      setLoadingJurusan(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    queueMicrotask(() => {
      if (isMounted) {
        void fetchUsers();
        void fetchJurusanData();
      }
    });

    return () => {
      isMounted = false;
    };
  }, [fetchUsers, fetchJurusanData]);

  const handleOpenModal = () => {
    const initialRoleId = 1;
    const defaultJurusanId = !isGlobalRole(initialRoleId) && filteredJurusanList.length > 0
      ? filteredJurusanList[0].id
      : null;

    setFormData({
      username: '',
      password: '',
      role_id: initialRoleId,
      jurusan_id: defaultJurusanId,
    });
    setIsOpenModal(true);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const cleanValue = e.target.value.replace(/[^a-zA-Z0-9]/g, '');
    setFormData((prev) => ({ ...prev, password: cleanValue }));
  };

  const handleDelete = async (id: number, username: string) => {
    if (!confirm(`Yakin ingin menghapus akun [${username}]?`)) return;

    try {
      await apiUsers.delete(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Terjadi kesalahan';
      alert(`Gagal menghapus pengguna: ${errorMsg}`);
    }
  };

  const handleRoleChange = (selectedRoleId: number) => {
    const isGlobal = isGlobalRole(selectedRoleId);
    setFormData((prev) => ({
      ...prev,
      role_id: selectedRoleId,
      jurusan_id: isGlobal ? null : (prev.jurusan_id || filteredJurusanList[0]?.id || null)
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setIsSubmitting(true);
      const isGlobal = isGlobalRole(Number(formData.role_id));

      const payload = {
        username: formData.username.trim(),
        password_hash: formData.password,
        role_id: Number(formData.role_id),
        jurusan_id: isGlobal ? null : (formData.jurusan_id ? Number(formData.jurusan_id) : null),
      };

      await apiUsers.create(payload);
      await fetchUsers();

      setIsOpenModal(false);
      setFormData({
        username: '',
        password: '',
        role_id: 1,
        jurusan_id: filteredJurusanList[0]?.id || null,
      });
      setShowPassword(false);
      alert('Akun pengguna berhasil didaftarkan!');
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Terjadi kesalahan saat menyimpan';
      alert(`Gagal menyimpan akun: ${errorMsg}`);
    } fontFinally: {
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
              Manajemen hak otentikasi login untuk Kepala Bengkel, Ketua Prodi, Guru, dan Sarpras.
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
              onClick={handleOpenModal}
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
                    const rawJurusan = user.jurusan as unknown;
                    let namaJurusanDisplay = 'SEMUA JURUSAN';

                    if (typeof rawJurusan === 'string') {
                      namaJurusanDisplay = rawJurusan;
                    } else if (rawJurusan && typeof rawJurusan === 'object' && 'nama_jurusan' in rawJurusan) {
                      namaJurusanDisplay = String((rawJurusan as { nama_jurusan?: string }).nama_jurusan || 'SEMUA JURUSAN');
                    }

                    return (
                      <tr key={user.id} className="hover:bg-surface-low/30 transition-colors">
                        <td className="p-5 text-base font-bold text-primary">{user.username}</td>
                        <td className="p-5 text-base text-on-surface-variant font-bold uppercase">
                          {namaJurusanDisplay}
                        </td>
                        <td className="p-5">
                          <span className="inline-block px-3 py-1 rounded-md text-sm font-bold border bg-blue-50 text-blue-900 border-blue-200 uppercase">
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
              <div className="flex justify-between items-center border-b border-surface-container pb-3">
                <h3 className="text-xl font-bold text-on-surface">Registrasi Akun Otoritas</h3>
                <button
                  onClick={() => { setIsOpenModal(false); setShowPassword(false); }}
                  className="text-outline hover:text-on-surface p-1.5 rounded-lg border border-surface-container cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
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

                <div className="space-y-2">
                  <label className="text-xs font-bold text-outline uppercase tracking-wider flex items-center justify-between">
                    <span className="flex items-center gap-1.5"><Key className="w-3.5 h-3.5" /> Password</span>
                    <span className="text-[10px] text-outline tracking-normal font-medium lowercase">(Hanya kombinasi huruf dan angka, tanpa spasi)</span>
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

                <div className="space-y-2">
                  <label className="text-xs font-bold text-outline uppercase tracking-wider flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5" /> Pilih Role Akses
                  </label>
                  <div className="relative">
                    <select
                      value={formData.role_id}
                      onChange={(e) => handleRoleChange(Number(e.target.value))}
                      className="w-full px-4 py-3 border border-surface-container-high rounded-xl text-base bg-white text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all duration-200 font-bold shadow-sm appearance-none cursor-pointer"
                    >
                      {roleOptions.map((r) => (
                        <option key={r.id} value={r.id}>{r.label}</option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-outline">
                      <svg className="fill-current h-4 w-4" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-outline uppercase tracking-wider flex items-center gap-1.5">
                    <Network className="w-4 h-4" /> Afiliasi Jurusan Kelolaan
                  </label>
                  <div className="relative">
                    <select
                      disabled={isGlobalRole(formData.role_id) || loadingJurusan}
                      value={isGlobalRole(formData.role_id) ? '' : (formData.jurusan_id ?? '')}
                      onChange={(e) => setFormData({ ...formData, jurusan_id: Number(e.target.value) })}
                      className="w-full px-4 py-3 border border-surface-container-high rounded-xl text-base bg-white text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all duration-200 font-bold shadow-sm appearance-none cursor-pointer disabled:bg-surface-low disabled:text-outline disabled:cursor-not-allowed uppercase"
                    >
                      {isGlobalRole(formData.role_id) ? (
                        <option value="">Semua Jurusan (Akses Global)</option>
                      ) : (
                        filteredJurusanList.map((j) => (
                          <option key={j.id} value={j.id}>{j.nama_jurusan}</option>
                        ))
                      )}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-outline">
                      {loadingJurusan ? (
                        <span className="text-xs text-outline animate-pulse">Loading...</span>
                      ) : (
                        <svg className="fill-current h-4 w-4" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-surface-container">
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => { setIsOpenModal(false); setShowPassword(false); }}
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