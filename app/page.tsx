"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function RootPage() {
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        const role = user?.role?.toLowerCase();
        if (role) {
          router.replace(`/${role}`);
          return;
        }
      } catch (e) {
        console.error(e);
      }
    }
    router.replace('/login');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-sm font-bold text-neutral-500 animate-pulse">
        Mengarahkan ke dashboard...
      </div>
    </div>
  );
}