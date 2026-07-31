"use client";

import React, { useState, useEffect } from 'react';
import PageAnimateWrapper from '@/components/page-animate-wrapper';
import { Plus, Network, GraduationCap, Tags, Server, ArrowRight } from 'lucide-react';
import { apiKelas, apiJurusan, apiKategori, apiLabor } from '@/lib/api';

export default function MasterInputPage() {
  const [activeTab, setActiveTab] = useState<'labor' | 'jurusan' | 'kelas' | 'category'>('labor');
  const [inputValue, setInputValue] = useState('');
  const [selectedJurusanId, setSelectedJurusanId] = useState<number | ''>('');
  const [jurusanList, setJurusanList] = useState<any[]>([]);
  const [loadingJurusan, setLoadingJurusan] = useState(false);
  const [loading, setLoading] = useState(false); 

  // Fetch data jurusan untuk dropdown (Digunakan pada tab labor & kelas)
  useEffect(() => {
    const fetchJurusan = async () => {
      try {
        setLoadingJurusan(true);
        const data = await apiJurusan.getAll();
        setJurusanList(data || []);
      } catch (err) {
        console.error('Gagal memuat data jurusan:', err);
      } finally {
        setLoadingJurusan(false);
      }
    };
    fetchJurusan();
  }, []);

  const tabsConfig = {
    labor: {
      label: 'Data Laboratorium',
      title: 'Registrasi Ruangan Labor Baru',
      description: 'Menambahkan entitas ruangan baru untuk memetakan distribusi PC dan alat praktikum.',
      placeholder: 'Nama Laboratorium (Contoh: Labor Komputer 1)',
      icon: Server,
      color: 'from-blue-500 to-cyan-500',
      badge: 'Infrastructure'
    },
    jurusan: {
      label: 'Data Program Keahlian',
      title: 'Registrasi Kompetensi Jurusan',
      description: 'Menambahkan singkatan jurusan resmi sebagai penanggung jawab klaster ruang labor.',
      placeholder: 'Singkatan Jurusan (Contoh: PPLG, DKV, TKJ)',
      icon: Network,
      color: 'from-purple-500 to-indigo-500',
      badge: 'Academic'
    },
    kelas: {
      label: 'Data Rombel Kelas',
      title: 'Registrasi Format Kelas Baru',
      description: 'Menyusun daftar rombongan belajar aktif untuk integrasi log pemakaian harian guru.',
      placeholder: 'Format Kelas (Contoh: XI PPLG 2)',
      icon: GraduationCap,
      color: 'from-emerald-500 to-teal-500',
      badge: 'Rombel'
    },
    category: {
      label: 'Kategori Logistik',
      title: 'Registrasi Pengelompokan Aset',
      description: 'Membuat kategori perlengkapan baru guna menyaring laporan kerusakan barang otomatis.',
      placeholder: 'Kategori Barang (Contoh: Perangkat Jaringan)',
      icon: Tags,
      color: 'from-amber-500 to-orange-500',
      badge: 'Inventory'
    }
  };

  const currentTab = tabsConfig[activeTab];
  const IconComponent = currentTab.icon;

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanValue = inputValue.trim();
    if (!cleanValue) return;

    // Validasi Relasi Jurusan jika tab labor atau kelas aktif
    if ((activeTab === 'labor' || activeTab === 'kelas') && !selectedJurusanId) {
      alert('Harap pilih Program Keahlian / Jurusan terlebih dahulu!');
      return;
    }

    try {
      setLoading(true);
      if (activeTab === 'labor') {
        // Sesuaikan parameter kirim objek ke backend jika labor memerlukan id_jurusan
        await apiLabor.create(cleanValue, Number(selectedJurusanId));
        alert(`Sukses! Ruang Laboratorium [${cleanValue}] berhasil disimpan ke database.`);
      } else if (activeTab === 'kelas') {
        await apiKelas.create(cleanValue, Number(selectedJurusanId));
        alert(`Sukses! Rombel Kelas [${cleanValue}] berhasil disimpan ke database.`);
      } else if (activeTab === 'jurusan') {
        await apiJurusan.create(cleanValue);
        alert(`Sukses! Kompetensi Jurusan [${cleanValue}] berhasil disimpan ke database.`);
      } else if (activeTab === 'category') {
        await apiKategori.create(cleanValue);
        alert(`Sukses! Kategori Logistik [${cleanValue}] berhasil disimpan ke database.`);
      }
      setInputValue('');
      setSelectedJurusanId('');
    } catch (err: any) {
      alert(`Gagal menyimpan data: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageAnimateWrapper>
      <div className="space-y-8 font-sans antialiased tracking-tight">
        
        {/* Header Section */}
        <div>
          <h1 className="text-3xl font-bold text-on-surface">Pusat Registrasi Data Master</h1>
          <p className="text-base text-on-surface-variant mt-2 font-medium">Modul pengisian data operasional dasar untuk sinkronisasi inventarisasi labor sekolah.</p>
        </div>

        {/* MAIN HUD LAYOUT */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* NAVIGASI SEBELAH KIRI */}
          <div className="lg:col-span-4 bg-white border border-surface-container-high rounded-2xl p-4 space-y-2 shadow-sm">
            <p className="px-3 pt-2 pb-3 text-xs font-bold text-outline tracking-widest uppercase">
              Pilih Kategori Master
            </p>
            
            {(Object.keys(tabsConfig) as Array<keyof typeof tabsConfig>).map((key) => {
              const tab = tabsConfig[key];
              const TabIcon = tab.icon;
              const isActive = activeTab === key;

              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => { setActiveTab(key); setInputValue(''); setSelectedJurusanId(''); }}
                  className={`w-full flex items-center justify-between p-4 rounded-xl text-base font-bold transition-all duration-200 group cursor-pointer ${
                    isActive
                      ? 'bg-secondary-container text-primary shadow-sm'
                      : 'text-on-surface-variant hover:bg-surface-low hover:text-on-surface'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <TabIcon className={`w-5 h-5 ${isActive ? 'text-primary' : 'text-outline group-hover:text-on-surface'}`} />
                    <span>{tab.label}</span>
                  </div>
                  <ArrowRight className={`w-4 h-4 opacity-0 -translate-x-2 transition-all duration-200 ${isActive ? 'opacity-100 translate-x-0 text-primary' : 'group-hover:opacity-50 group-hover:translate-x-0'}`} />
                </button>
              );
            })}
          </div>

          {/* DYNAMIC FORM WORKSPACE SEBELAH KANAN */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white border border-surface-container-high rounded-2xl shadow-md overflow-hidden transition-all duration-300">
              <div className={`h-2 bg-gradient-to-r ${currentTab.color}`} />
              
              <div className="p-8 space-y-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="inline-block px-3 py-1 rounded-md text-xs font-bold bg-surface-low text-outline border border-surface-container-high uppercase tracking-wider mb-2">
                      {currentTab.badge}
                    </div>
                    <h2 className="text-xl font-extrabold text-on-surface">{currentTab.title}</h2>
                    <p className="text-base text-on-surface-variant font-medium leading-relaxed">{currentTab.description}</p>
                  </div>
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${currentTab.color} flex items-center justify-center text-white shadow-md hidden sm:flex`}>
                    <IconComponent className="w-6 h-6" />
                  </div>
                </div>

                <form onSubmit={handleSave} className="space-y-6 pt-2">
                  
                  {/* Pilihan Jurusan khusus untuk Tab Laboratorium dan Rombel Kelas */}
                  {(activeTab === 'labor' || activeTab === 'kelas') && (
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-outline uppercase tracking-wider">Pilih Program Keahlian (Jurusan)</label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-outline">
                          <Network className="w-5 h-5" />
                        </div>
                        <select
                          required
                          disabled={loadingJurusan || loading}
                          value={selectedJurusanId}
                          onChange={(e) => setSelectedJurusanId(Number(e.target.value))}
                          className="w-full pl-12 pr-4 py-3.5 border border-surface-container-high rounded-xl text-base bg-white text-on-surface focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all duration-200 font-medium shadow-sm cursor-pointer disabled:opacity-60"
                        >
                          <option value="">{loadingJurusan ? 'Memuat data jurusan...' : '-- Pilih Jurusan Terkait --'}</option>
                          {jurusanList.map((j: any) => (
                            <option key={j.id} value={j.id}>
                              {j.jurusan || j.nama_jurusan}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-outline uppercase tracking-wider">Entri Karakter Data</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-outline group-focus-within:text-primary transition-colors">
                        <IconComponent className="w-5 h-5" />
                      </div>
                      <input
                        type="text"
                        required
                        disabled={loading}
                        placeholder={currentTab.placeholder}
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        className="w-full pl-12 pr-4 py-3.5 border border-surface-container-high rounded-xl text-base bg-white text-on-surface placeholder:text-outline/50 focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all duration-200 font-medium shadow-sm disabled:opacity-60"
                      />
                    </div>
                  </div>

                  {inputValue && (
                    <div className="p-4 bg-surface-low rounded-xl border border-surface-container flex items-center justify-between animate-in fade-in slide-in-from-top-2 duration-200">
                      <div>
                        <span className="text-xs font-bold text-outline uppercase tracking-wider block">Live Preview Database:</span>
                        <span className="text-base font-bold text-primary mt-0.5 block">{inputValue}</span>
                      </div>
                      <span className="text-xs font-mono text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded font-bold">Ready</span>
                    </div>
                  )}

                  <div className="pt-6 border-t border-surface-container flex justify-end gap-3">
                    <button
                      type="button"
                      disabled={loading}
                      onClick={() => { setInputValue(''); setSelectedJurusanId(''); }}
                      className="px-5 py-3 text-base font-bold text-on-surface-variant hover:bg-surface-low rounded-xl transition-colors cursor-pointer disabled:opacity-50"
                    >
                      Reset Form
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-6 py-3 text-base font-bold text-white bg-primary hover:bg-primary-container active:scale-[0.98] transition-all rounded-xl shadow-sm cursor-pointer flex items-center gap-2 disabled:opacity-50"
                    >
                      <Plus className="w-5 h-5" /> {loading ? 'Menyimpan...' : 'Simpan ke Master'}
                    </button>
                  </div>
                </form>

              </div>
            </div>
          </div>

        </div>
      </div>
    </PageAnimateWrapper>
  );
}