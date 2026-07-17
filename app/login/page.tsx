"use client";

import React, { useState } from 'react';
import { Eye, EyeOff, Lock, User, ArrowRight, ShieldCheck } from 'lucide-react';
import PageAnimateWrapper from '@/components/page-animate-wrapper';

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    rememberMe: false
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Mencoba masuk sebagai: ${formData.username}`);
  };

  return (
    <PageAnimateWrapper>
      <div className="min-h-screen w-full flex bg-surface-bright font-sans antialiased tracking-tight select-none">
        
        {/* ================= SISI KIRI: BRANDING & KATA-KATA (HIDDEN DI HP) ================= */}
        <div className="hidden lg:flex lg:w-[45%] bg-gradient-to-br from-primary via-primary/95 to-primary-container p-12 flex-col justify-between relative overflow-hidden">
          
          {/* Efek Cahaya Dekoratif di Background */}
          <div className="absolute top-[-20%] right-[-20%] w-[500px] h-[500px] rounded-full bg-white/5 blur-3xl pointer-events-none" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[350px] h-[350px] rounded-full bg-secondary/10 blur-2xl pointer-events-none" />

          {/* Top Info */}
          <div className="flex items-center gap-2 text-white/90">
            <ShieldCheck className="w-5 h-5 text-white animate-pulse" />
            <span className="text-xs font-bold tracking-widest uppercase">SMKN 4 Payakumbuh</span>
          </div>

          {/* Tagline Utama */}
          <div className="space-y-4 relative z-10">
            <h2 className="text-4xl font-extrabold text-white leading-tight">
              Sistem Manajemen & <br />
              Kontrol Inventaris Labor.
            </h2>
            <p className="text-sm text-white/70 font-medium max-w-md leading-relaxed">
              Pantau pemakaian fasilitas, laporkan kendala teknis, dan kelola aset laboratorium sekolah secara real-time dalam satu platform terintegrasi.
            </p>
          </div>

          {/* Footer Sisi Kiri */}
          <div className="text-xs text-white/50 font-medium">
            &copy; {new Date().getFullYear()} Invela Control. All rights reserved.
          </div>
        </div>

        {/* ================= SISI KANAN: FORM LOGIN UTAMA ================= */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 md:p-20 bg-white">
          
          <div className="w-full max-w-[420px] space-y-8">
            
            {/* LOGO DI ATAS FORM LOGIN */}
            <div className="flex flex-col items-center text-center space-y-3">
              {/* Box Logo Premium */}
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-primary to-primary-container flex items-center justify-center text-white font-black text-xl shadow-md shadow-primary/20 ring-4 ring-primary/5">
                IC
              </div>
              {/* Teks Brand */}
              <div>
                <h1 className="text-2xl font-black tracking-tight text-on-surface uppercase">
                  INVELA<span className="text-primary">CONTROL</span>
                </h1>
                <p className="text-xs font-semibold text-outline tracking-wider uppercase mt-0.5">
                  Sign in to your dashboard
                </p>
              </div>
            </div>

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
                    placeholder="Masukkan username anda..."
                    value={formData.username}
                    onChange={(e) => setFormData({...formData, username: e.target.value})}
                    className="w-full pl-10 pr-4 py-3 border border-surface-container-high rounded-xl text-sm bg-white text-on-surface placeholder:text-outline/50 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all duration-200 font-medium shadow-sm"
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
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                    className="w-full pl-10 pr-10 py-3 border border-surface-container-high rounded-xl text-sm bg-white text-on-surface placeholder:text-outline/40 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all duration-200 font-medium shadow-sm"
                  />
                  {/* Toggle Show/Hide Password */}
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
                  className="w-full py-3 px-4 text-sm font-bold text-white bg-primary hover:bg-primary/95 active:scale-[0.98] transition-all duration-200 shadow-md shadow-primary/10 rounded-xl cursor-pointer flex items-center justify-center gap-2 group"
                >
                  Masuk ke Akun 
                  <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
                </button>
              </div>

            </form>

          </div>

        </div>

      </div>
    </PageAnimateWrapper>
  );
}