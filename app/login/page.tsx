"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Lock, User, ArrowRight, ArrowLeft, ShieldCheck, Loader2 } from 'lucide-react';
import PageAnimateWrapper from '@/components/page-animate-wrapper';
import { apiAuth } from '@/lib/api';
import { motion } from 'framer-motion';

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // State untuk mengontrol animasi gerbang terbuka (Login Sukses ATAU Kembali ke Beranda)
  const [isSuccess, setIsSuccess] = useState(false);
  const [exitMessage, setExitMessage] = useState('Membuka Sesi...');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    username: '',
    password: '',
    rememberMe: false
  });

  // Prefetch rute beranda sejak awal agar perpindahan cepat
  useEffect(() => {
    router.prefetch('/');
  }, [router]);

  // FUNGSI KEMBALI KE BERANDA DENGAN ANIMASI GERBANG
  const handleBackToHome = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isLoading || isSuccess) return;

    setExitMessage('Kembali ke Beranda...');
    setIsSuccess(true); // Memicu animasi gerbang terbuka

    setTimeout(() => {
      router.push('/');
    }, 500);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await apiAuth.login({
        username: formData.username,
        password: formData.password,
      });

      const user = response.data.user;
      const roleLower = user.role ? user.role.toLowerCase() : '';

      // 1. Simpan Token dan Cookie Sesi
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(user));

      if (user.jurusan) {
        localStorage.setItem('user_jurusan', user.jurusan);
      }
      if (user.jurusan_id !== undefined && user.jurusan_id !== null) {
        localStorage.setItem('user_jurusan_id', user.jurusan_id.toString());
      } else {
        localStorage.removeItem('user_jurusan_id');
      }

      document.cookie = `token=${response.data.token}; path=/; SameSite=Lax`;
      document.cookie = `user_role=${roleLower}; path=/; SameSite=Lax`;

      if (user.jurusan) {
        document.cookie = `user_jurusan=${encodeURIComponent(user.jurusan)}; path=/; SameSite=Lax`;
      }

      if (user.jurusan_id !== undefined && user.jurusan_id !== null) {
        document.cookie = `user_jurusan_id=${user.jurusan_id}; path=/; SameSite=Lax`;
      } else {
        document.cookie = `user_jurusan_id=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax`;
      }

      // 2. Tentukan Rute Tujuan & Prefetch Rute Tersebut
      const targetPath = ['admin', 'kabeng', 'kaprog', 'sapras', 'guru'].includes(roleLower)
        ? `/${roleLower}`
        : '/login';

      router.prefetch(targetPath);

      // 3. Tampilkan status loading akhir sebelum animasi gerbang
      setIsLoading(false);
      
      setTimeout(() => {
        setExitMessage(`Memuat Dashboard ${user.username || formData.username}...`);
        setIsSuccess(true); // Mulai animasi gerbang terbuka

        setTimeout(() => {
          router.push(targetPath);
        }, 500);
      }, 100);

    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Terjadi kesalahan saat masuk ke sistem.";
      setErrorMessage(message);
      setIsLoading(false);
    }
  };

  return (
    <PageAnimateWrapper>
      <div className="min-h-screen w-full bg-surface-bright font-sans antialiased tracking-tight select-none overflow-hidden relative">
        
        {/* BACKGROUND LAYER PREVIEW (Mencegah Layar Putih Blank saat Gerbang Terbuka) */}
        <div className={`absolute inset-0 z-0 transition-opacity duration-300 ${isSuccess ? 'opacity-100' : 'opacity-0'}`}>
          <div className="w-full h-full bg-slate-50 flex items-center justify-center p-8">
            <div className="flex flex-col items-center gap-3 text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-sm font-semibold tracking-wide uppercase">{exitMessage}</p>
            </div>
          </div>
        </div>

        {/* CONTAINER UTAMA GERBANG */}
        <div className="relative z-10 min-h-screen w-full flex">
          
          {/* GERBANG KIRI: BRANDING & KATA-KATA */}
          <motion.div 
            initial={{ x: 0 }}
            animate={{ x: isSuccess ? '-100%' : 0 }}
            transition={{ duration: 0.75, ease: [0.77, 0, 0.175, 1] }}
            className="hidden lg:flex lg:w-[45%] bg-gradient-to-br from-primary via-primary/95 to-primary-container p-12 flex-col justify-between relative overflow-hidden shadow-2xl"
          >
            <div className="absolute top-[-20%] right-[-20%] w-[500px] h-[500px] rounded-full bg-white/5 blur-3xl pointer-events-none" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[350px] h-[350px] rounded-full bg-secondary/10 blur-2xl pointer-events-none" />

            <div className="flex items-center justify-between z-10">
              <div className="flex items-center gap-2 text-white/90">
                <ShieldCheck className="w-5 h-5 text-white animate-pulse" />
                <span className="text-xs font-bold tracking-widest uppercase">TeFa RPL BCS</span>
              </div>
            </div>

            <div className="space-y-4 relative z-10">
              <h2 className="text-4xl font-extrabold text-white leading-tight">
                Sistem Manajemen & <br />
                Kontrol Inventaris Labor.
              </h2>
              <p className="text-sm text-white/70 font-medium max-w-md leading-relaxed">
                Pantau pemakaian fasilitas, laporkan kendala teknis, dan kelola aset laboratorium sekolah secara real-time dalam satu platform terintegrasi.
              </p>
            </div>

            <div className="text-xs text-white/50 font-medium">
              &copy; {new Date().getFullYear()} Invela Control. All rights reserved.
            </div>
          </motion.div>

          {/* GERBANG KANAN: FORM LOGIN UTAMA */}
          <motion.div 
            initial={{ x: 0 }}
            animate={{ x: isSuccess ? '100%' : 0 }}
            transition={{ duration: 0.75, ease: [0.77, 0, 0.175, 1] }}
            className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 md:p-20 bg-white relative shadow-2xl"
          >
            {/* TOMBOL KEMBALI KE LANDING PAGE (DENGAN ANIMASI GERBANG) */}
            <button
              type="button"
              onClick={handleBackToHome}
              disabled={isLoading || isSuccess}
              className="absolute top-6 left-6 lg:left-8 flex items-center gap-2 text-xs font-bold text-outline hover:text-primary transition-colors py-2 px-3 rounded-xl hover:bg-slate-100 cursor-pointer disabled:opacity-50"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Kembali ke Beranda</span>
            </button>

            <div className="w-full max-w-[420px] space-y-8 mt-8 lg:mt-0">
              
              {/* LOGO DI ATAS FORM LOGIN */}
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-primary to-primary-container flex items-center justify-center text-white font-black text-xl shadow-md shadow-primary/20 ring-4 ring-primary/5">
                  IC
                </div>
                <div>
                  <h1 className="text-2xl font-black tracking-tight text-on-surface uppercase">
                    INVELA<span className="text-primary">CONTROL</span>
                  </h1>
                  <p className="text-xs font-semibold text-outline tracking-wider uppercase mt-0.5">
                    Sign in to your dashboard
                  </p>
                </div>
              </div>

              {/* ALERT ERROR JIKA GAGAL LOGIN */}
              {errorMessage && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium rounded-xl text-center animate-shake">
                  {errorMessage}
                </div>
              )}

              {/* FORMULIR LOGIN */}
              <form onSubmit={handleSubmit} className="space-y-5">
                
                {/* Input Username / NIP */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-outline uppercase tracking-wider">Username / NIP</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-outline group-focus-within:text-primary transition-colors">
                      <User className="w-4 h-4" />
                    </div>
                    <input 
                      type="text" 
                      required
                      disabled={isLoading || isSuccess}
                      placeholder="Masukkan username anda..."
                      value={formData.username}
                      onChange={(e) => setFormData({...formData, username: e.target.value})}
                      className="w-full pl-10 pr-4 py-3 border border-surface-container-high rounded-xl text-sm bg-white text-on-surface placeholder:text-outline/50 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all duration-200 font-medium shadow-sm disabled:opacity-50"
                    />
                  </div>
                </div>

                {/* Input Password */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-outline uppercase tracking-wider">Password</label>
                  </div>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-outline group-focus-within:text-primary transition-colors">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input 
                      type={showPassword ? "text" : "password"} 
                      required
                      disabled={isLoading || isSuccess}
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      className="w-full pl-10 pr-10 py-3 border border-surface-container-high rounded-xl text-sm bg-white text-on-surface placeholder:text-outline/40 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all duration-200 font-medium shadow-sm disabled:opacity-50"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-outline hover:text-on-surface transition-colors cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember Me Checkbox */}
                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input 
                      type="checkbox"
                      disabled={isLoading || isSuccess}
                      checked={formData.rememberMe}
                      onChange={(e) => setFormData({...formData, rememberMe: e.target.checked})}
                      className="w-4 h-4 rounded border-surface-container-high text-primary focus:ring-primary/30 cursor-pointer accent-primary" 
                    />
                    <span className="text-xs text-on-surface-variant font-medium select-none group-hover:text-on-surface transition-colors">
                      Ingat sesi saya
                    </span>
                  </label>
                </div>

                {/* Button Login */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isLoading || isSuccess}
                    className="w-full py-3 px-4 text-sm font-bold text-white bg-primary hover:bg-primary/95 active:scale-[0.98] transition-all duration-200 shadow-md shadow-primary/10 rounded-xl cursor-pointer flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isLoading || isSuccess ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        {isSuccess ? 'Membuka Sesi...' : 'Memproses...'}
                      </>
                    ) : (
                      <>
                        Masuk ke Akun 
                        <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                      </>
                    )}
                  </button>
                </div>

              </form>

            </div>
          </motion.div>

        </div>
      </div>
    </PageAnimateWrapper>
  );
}