"use client";

import React, { useState } from 'react';
import PageAnimateWrapper from '@/components/page-animate-wrapper';
import { Plus, Trash2, X, User, Key, Shield, Network, Eye, EyeOff } from 'lucide-react';

interface UserAccount {
  id: string;
  username: string;
  jurusan: string;
  role: string;
}

export default function UsersCRUDPage() {
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: 'kabeng',
    jurusan: 'pplg'
  });

  const [users, setUsers] = useState<UserAccount[]>([
    { id: '1', username: 'fathir_kabeng@smkn4pyk.com', jurusan: 'PPLG', role: 'Kabeng' },
    { id: '2', username: 'ranti_kaprog@smkn4pyk.com', jurusan: 'PPLG', role: 'Kaprog' },
    { id: '3', username: 'sapras_school@smkn4pyk.com', jurusan: 'Semua Jurusan', role: 'Sapras' },
  ]);

  const dummyJurusan = ['PPLG', 'TKJ', 'DKV', 'TITL'];

  const handleDelete = (id: string) => {
    setUsers(users.filter(u => u.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Mapping role display name
    const roleMapping: Record<string, string> = {
      kabeng: 'Kabeng',
      kaprog: 'Kaprog',
      sapras: 'Sapras'
    };

    const newAccount: UserAccount = {
      id: Date.now().toString(),
      username: formData.username,
      jurusan: formData.role === 'sapras' ? 'Semua Jurusan' : formData.jurusan.toUpperCase(),
      role: roleMapping[formData.role] || 'Kabeng'
    };

    setUsers([...users, newAccount]);
    setIsOpenModal(false);
    
    // Reset form
    setFormData({ username: '', password: '', role: 'kabeng', jurusan: 'pplg' });
    setShowPassword(false);
  };

  return (
    <PageAnimateWrapper>
      <div className="space-y-8 font-sans antialiased tracking-tight">
        
        {/* Header Section */}
        <div className="flex justify-between items-center border-b border-surface-container pb-5">
          <div>
            <h1 className="text-3xl font-bold text-on-surface">Memantau Akun Pengguna</h1>
            <p className="text-base text-on-surface-variant mt-2 font-medium">Manajemen hak otentikasi login untuk Kepala Bengkel, Ketua Prodi, dan Sarpras.</p>
          </div>
          <button 
            onClick={() => setIsOpenModal(true)}
            className="px-5 py-3 text-base font-bold text-white bg-primary hover:bg-primary-container rounded-xl flex items-center gap-2 transition-all active:scale-[0.98] shadow-sm cursor-pointer"
          >
            <Plus className="w-5 h-5" /> Tambah Akun Baru
          </button>
        </div>

        {/* Table Monitoring */}
        <div className="bg-white border border-surface-container-high rounded-xl overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse text-base">
            <thead className="bg-surface-low border-b border-surface-container-high">
              <tr>
                <th className="p-5 text-sm font-bold text-on-surface uppercase tracking-wider">Username</th>
                <th className="p-5 text-sm font-bold text-on-surface uppercase tracking-wider">Jurusan Kelolaan</th>
                <th className="p-5 text-sm font-bold text-on-surface uppercase tracking-wider">Hak Akses Role</th>
                <th className="p-5 text-sm font-bold text-on-surface uppercase tracking-wider text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-container text-on-surface font-medium">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-surface-low/30 transition-colors">
                  <td className="p-5 text-base font-bold text-primary">{user.username}</td>
                  <td className="p-5 text-base text-on-surface-variant font-bold">{user.jurusan}</td>
                  <td className="p-5">
                    <span className={`inline-block px-3 py-1 rounded-md text-sm font-bold border ${
                      user.role === 'Kabeng' ? 'bg-blue-100 text-blue-900 border-blue-300' :
                      user.role === 'Kaprog' ? 'bg-purple-100 text-purple-900 border-purple-300' : 
                      'bg-amber-100 text-amber-900 border-amber-300'
                    }`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="p-5 text-right">
                    <button 
                      onClick={() => handleDelete(user.id)}
                      className="p-2 text-outline hover:text-error hover:bg-error-container/40 rounded-lg transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Modal Dialog Form Tambah Akun */}
        {isOpenModal && (
          <div className="fixed inset-0 bg-on-surface/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-xl border border-surface-container-high rounded-xl shadow-2xl p-6 space-y-6 animate-in fade-in zoom-in-95 duration-150">
              
              {/* Modal Header */}
              <div className="flex justify-between items-center border-b border-surface-container pb-3">
                <h3 className="text-xl font-bold text-on-surface">Registrasi Akun Otoritas</h3>
                <button 
                  onClick={() => { setIsOpenModal(false); setShowPassword(false); }} 
                  className="text-outline hover:text-on-surface p-1.5 rounded-lg border border-surface-container cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              {/* Modal Form Content */}
              <form onSubmit={handleSubmit} className="space-y-5">
                
                {/* Username dengan Validasi Wajib @smkn4pyk.com */}
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
                    onChange={(e) => setFormData({...formData, username: e.target.value})}
                    className="w-full px-4 py-3 border border-surface-container-high rounded-xl text-base bg-white text-on-surface placeholder:text-outline/50 focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all duration-200 font-medium shadow-sm"
                  />
                </div>

                {/* Password dengan Fitur Intip/Lihat */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-outline uppercase tracking-wider flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5" /> Password
                  </label>
                  <div className="relative group">
                    <input 
                      type={showPassword ? "text" : "password"} 
                      required
                      placeholder="••••••••" 
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
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
                      value={formData.role}
                      onChange={(e) => setFormData({...formData, role: e.target.value})}
                      className="w-full px-4 py-3 border border-surface-container-high rounded-xl text-base bg-white text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all duration-200 font-bold shadow-sm appearance-none cursor-pointer"
                    >
                      <option value="kabeng">Kepala Bengkel (Kabeng)</option>
                      <option value="kaprog">Kepala Prodi (Kaprog)</option>
                      <option value="sapras">Sarana Prasarana (Sapras)</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-outline">
                      <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                    </div>
                  </div>
                </div>

                {/* Afiliasi Jurusan */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-outline uppercase tracking-wider flex items-center gap-1.5">
                    <Network className="w-3.5 h-3.5" /> Afiliasi Jurusan
                  </label>
                  <div className="relative">
                    <select 
                      disabled={formData.role === 'sapras'}
                      value={formData.role === 'sapras' ? 'all' : formData.jurusan}
                      onChange={(e) => setFormData({...formData, jurusan: e.target.value})}
                      className="w-full px-4 py-3 border border-surface-container-high rounded-xl text-base bg-white text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 transition-all duration-200 font-bold shadow-sm appearance-none cursor-pointer disabled:bg-surface-low disabled:text-outline disabled:cursor-not-allowed"
                    >
                      {dummyJurusan.map((jurus, i) => (
                        <option key={i} value={jurus.toLowerCase()}>{jurus}</option>
                      ))}
                      <option value="all">Semua Jurusan (Khusus Sapras)</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-outline">
                      <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/></svg>
                    </div>
                  </div>
                </div>

                {/* Modal Footer Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t border-surface-container">
                  <button 
                    type="button"
                    onClick={() => { setIsOpenModal(false); setShowPassword(false); }} 
                    className="px-5 py-2.5 text-base font-bold text-on-surface-variant hover:bg-surface-low rounded-xl transition-colors cursor-pointer"
                  >
                    Batal
                  </button>
                  <button 
                    type="submit"
                    className="px-6 py-2.5 text-base font-bold text-white bg-primary hover:bg-primary-container active:scale-[0.98] transition-all rounded-xl shadow-sm cursor-pointer"
                  >
                    Simpan Akun
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