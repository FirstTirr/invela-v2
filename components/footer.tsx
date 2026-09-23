import Link from "next/link";
import Image from "next/image";
import { Mail } from "lucide-react";
import Wm from "./wm";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-200 mt-24 pt-12 pb-6 px-4 md:px-24 border-t border-slate-800">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:justify-between gap-12 md:gap-8">
        
        {/* About & Branding Section */}
        <div className="flex flex-col gap-4 md:w-1/3">
          <div className="flex items-center gap-3">
            <div className="relative h-12 w-12 rounded-full overflow-hidden border border-blue-500">
              <Image
                src="/logoRounded.png"
                alt="Logo Inventaris Labor"
                fill
                sizes="48px"
                className="object-contain"
              />
            </div>
            <span className="text-2xl font-bold text-white tracking-wide">
              Inventaris Labor
            </span>
          </div>
          <p className="text-gray-400 text-sm max-w-xs leading-relaxed">
            Website ini dibuat untuk mempermudah proses inventarisasi laboratorium di sekolah. Dengan fitur-fitur yang lengkap, pengguna dapat dengan mudah mengelola dan melacak inventaris laboratorium mereka.
          </p>
          <div className="flex gap-3 mt-2">
            <a
              href="https://instagram.com/rpl_centerofexcellent"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg bg-gray-800 hover:bg-blue-600 hover:text-white text-gray-400 transition-all"
              aria-label="Instagram"
            >
              <svg
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
                className="w-5 h-5"
              >
                <rect width="20" height="20" x="2" y="2" rx="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
              </svg>
            </a>
            <a 
              href="#" 
              className="p-2 rounded-lg bg-gray-800 hover:bg-blue-600 hover:text-white text-gray-400 transition-all" 
              aria-label="Facebook"
            >
              <svg
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
                className="w-5 h-5"
              >
                <path d="M18 2h-3a4 4 0 0 0-4 4v3H7v4h4v8h4v-8h3l1-4h-4V6a1 1 0 0 1 1-1h3z" />
              </svg>
            </a>
            <a 
              href="#" 
              className="p-2 rounded-lg bg-gray-800 hover:bg-blue-600 hover:text-white text-gray-400 transition-all" 
              aria-label="YouTube"
            >
              <svg
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
                className="w-5 h-5"
              >
                <path d="M22.54 6.42A2.78 2.78 0 0 0 20.7 4.6C19.13 4 12 4 12 4s-7.13 0-8.7.6A2.78 2.78 0 0 0 1.46 6.42 29.94 29.94 0 0 0 1 12a29.94 29.94 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.3 19.4c1.57.6 8.7.6 8.7.6s7.13 0 8.7-.6a2.78 2.78 0 0 0 1.84-1.82A29.94 29.94 0 0 0 23 12a29.94 29.94 0 0 0-.46-5.58z" />
                <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" />
              </svg>
            </a>
          </div>
          <div>
            <p className="text-sm text-gray-400">&copy; powered by TeFa RPL BCS</p>
          </div>
        </div>

        {/* Quick Navigation Section */}
        <div className="flex flex-col gap-2 md:w-1/3">
          <span className="text-lg font-semibold text-white mb-2">
            Navigasi Cepat
          </span>
          <a href="#tentang" className="hover:text-blue-400 text-gray-300 text-sm transition-colors">
            Tentang
          </a>
          <a href="#fitur" className="hover:text-blue-400 text-gray-300 text-sm transition-colors">
            Fitur
          </a>
          <a href="#cara-kerja" className="hover:text-blue-400 text-gray-300 text-sm transition-colors">
            Cara Kerja
          </a>
          <a href="#akses" className="hover:text-blue-400 text-gray-300 text-sm transition-colors">
            Akses
          </a>
        </div>

        {/* Contact Section */}
        <div className="flex flex-col gap-3 md:w-1/3">
          <span className="text-lg font-semibold text-white mb-1">Kontak</span>
          <span className="text-gray-300 font-medium text-sm">TeFa RPL BCS</span>
          <p className="text-gray-400 text-sm leading-relaxed">
            QJM2+7C7, Jl. Muchtar Latief, Padang Sikabu, Kec. Lamposi Tigo Nagori, Kota Payakumbuh, Sumatera Barat 26219
          </p>
          
          {/* Direct Email Link */}
          <a
            href="mailto:centerofexcellent33@gmail.com"
            className="inline-flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors group mt-1"
          >
            <Mail className="w-4 h-4 text-blue-400 group-hover:scale-110 transition-transform" />
            <span className="underline underline-offset-4 decoration-blue-500/50 group-hover:decoration-blue-400">
              centerofexcellent33@gmail.com
            </span>
          </a>
        </div>

      </div>
      <Wm />
    </footer>
  );
}