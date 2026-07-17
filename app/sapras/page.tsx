import React from 'react';
import PageAnimateWrapper from '@/components/page-animate-wrapper';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function SaprasDashboard() {
  return (
    <PageAnimateWrapper>
      <div className="space-y-8 font-sans antialiased tracking-tight">
        <div>
          <h1 className="text-3xl font-bold text-on-surface">Sapras Executive Dashboard</h1>
          <p className="text-base text-on-surface-variant mt-2 font-medium">Panel pemantauan seluruh sarana, prasarana, dan anggaran perbaikan logistik sekolah.</p>
        </div>
        
        <Card className="border border-surface-container-high max-w-xl shadow-sm rounded-xl">
          <CardHeader className="p-6 pb-2">
            <CardTitle className="text-sm font-bold text-outline tracking-wider uppercase">Total Dana Perbaikan Terpakai (All Labor)</CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-0 space-y-4">
            <p className="text-5xl font-extrabold text-primary tabular-nums">Rp 150.000</p>
            <div className="text-base font-medium text-on-surface-variant bg-surface-low p-4 rounded-lg border border-surface-container leading-relaxed">
              Notifikasi Sistem: Seluruh pengajuan perbaikan yang valid dari Kaprog dan Mekanik Bengkel telah direkam secara berkala.
            </div>
          </CardContent>
        </Card>
      </div>
    </PageAnimateWrapper>
  );
}