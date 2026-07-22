// lib/utils-asset.ts

/**
 * Meng-increment kode asset berdasarkan index offset.
 * Contoh: incrementKodeAsset("rpl-001", 1) => "rpl-002"
 * Contoh: incrementKodeAsset("AST-099", 1) => "AST-100"
 */
export function incrementKodeAsset(baseCode: string, step: number): string {
  // Regex untuk memisahkan bagian teks (prefix) dan angka paling akhir (suffix)
  const match = baseCode.match(/^(.*?)(0*(\d+))$/);

  if (!match) {
    // Jika tidak ada angka di akhir kode, sertakan suffix nomor
    return `${baseCode}-${step + 1}`;
  }

  const prefix = match[1];      // misal "rpl-"
  const fullNumStr = match[2];  // misal "001"
  const numValue = parseInt(match[3], 10); // misal 1
  
  const targetNum = numValue + step;
  // Pertahankan jumlah digit angka (padding zero)
  const paddedNum = String(targetNum).padStart(fullNumStr.length, '0');

  return `${prefix}${paddedNum}`;
}