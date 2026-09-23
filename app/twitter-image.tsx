import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "Invela Control - Sistem Inventaris Laboratorium";
export const size = {
  width: 1200,
  height: 675,
};
export const contentType = "image/png";

export default function TwitterImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 64,
          color: "#f8fafc",
          background:
            "radial-gradient(circle at top left, rgba(34, 211, 238, 0.22), transparent 35%), linear-gradient(135deg, #020617 0%, #0f172a 48%, #1d4ed8 100%)",
          fontFamily: "Inter, system-ui, sans-serif",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", gap: 32 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div
              style={{
                width: 88,
                height: 88,
                borderRadius: 24,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "rgba(255, 255, 255, 0.12)",
                border: "1px solid rgba(255, 255, 255, 0.18)",
                fontSize: 40,
                fontWeight: 800,
                letterSpacing: -2,
              }}
            >
              IC
            </div>
            <div style={{ fontSize: 28, fontWeight: 700, color: "#bae6fd" }}>
              Invela Control
            </div>
          </div>

          <div
            style={{
              alignSelf: "flex-start",
              padding: "14px 18px",
              borderRadius: 999,
              background: "rgba(255, 255, 255, 0.1)",
              border: "1px solid rgba(255, 255, 255, 0.14)",
              fontSize: 20,
              fontWeight: 700,
            }}
          >
            Inventaris Terpusat
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div
            style={{
              maxWidth: 920,
              fontSize: 58,
              lineHeight: 1.04,
              fontWeight: 800,
              letterSpacing: -2.5,
            }}
          >
            Sistem inventaris laboratorium yang rapi, cepat, dan mudah diaudit.
          </div>
          <div
            style={{
              maxWidth: 860,
              fontSize: 26,
              lineHeight: 1.4,
              color: "#cbd5e1",
            }}
          >
            Kelola aset, peminjaman, laporan kerusakan, dan riwayat perbaikan dalam
            satu dashboard sekolah yang terstruktur.
          </div>
        </div>

        <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
          {[
            "Dashboard inventaris",
            "Peminjaman cepat",
            "Monitoring kerusakan",
          ].map((item) => (
            <div
              key={item}
              style={{
                padding: "14px 18px",
                borderRadius: 999,
                background: "rgba(255, 255, 255, 0.1)",
                border: "1px solid rgba(255, 255, 255, 0.14)",
                fontSize: 20,
                fontWeight: 700,
              }}
            >
              {item}
            </div>
          ))}
        </div>
      </div>
    ),
    size,
  );
}