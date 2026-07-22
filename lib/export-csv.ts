export function exportToCSV<T extends Record<string, any>>(
  data: T[],
  filename: string,
  headersMap: Record<keyof T, string>
) {
  if (!data || data.length === 0) {
    alert("Tidak ada data untuk diexport!");
    return;
  }

  const keys = Object.keys(headersMap) as Array<keyof T>;

  // 1. Baris Header CSV
  const headerRow = keys.map((key) => `"${headersMap[key]}"`).join(",");

  // 2. Baris Data CSV
  const dataRows = data.map((item) => {
    return keys
      .map((key) => {
        const val = item[key] !== undefined && item[key] !== null ? item[key] : "";
        // Escape tanda petik jika ada karakter khusus/koma
        const escaped = String(val).replace(/"/g, '""');
        return `"${escaped}"`;
      })
      .join(",");
  });

  // Combine dengan BOM (\uFEFF) agar Microsoft Excel bisa membaca karakter UTF-8 dengan rapi
  const csvContent = "\uFEFF" + [headerRow, ...dataRows].join("\n");

  // 3. Trigger Download File di Browser
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}_${new Date().toISOString().split("T")[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}