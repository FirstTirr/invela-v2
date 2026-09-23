import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "Invela Control - Sistem Inventaris Laboratorium";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function OpenGraphImage() {
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
            "linear-gradient(135deg, #020617 0%, #0f172a 45%, #0e7490 100%)",
          fontFamily: "Inter, system-ui, sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 20,
          }}
        >
          <div
            style={{
              width: 92,
              height: 92,
              borderRadius: 24,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "rgba(255, 255, 255, 0.12)",
              border: "1px solid rgba(255, 255, 255, 0.18)",
              boxShadow: "0 20px 60px rgba(8, 145, 178, 0.35)",
              fontSize: 42,
              fontWeight: 800,
              letterSpacing: -2,
            }}
          >
            IC
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                fontSize: 34,
                fontWeight: 800,
                lineHeight: 1,
                letterSpacing: -1.5,
              }}
            >
              Invela Control
            </div>
            <div
              style={{
                marginTop: 10,
                fontSize: 18,
                color: "#bae6fd",
                letterSpacing: 2,
                textTransform: "uppercase",
              }}
            >
              Inventaris Laboratorium Sekolah
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div
            style={{
              maxWidth: 900,
              fontSize: 64,
              lineHeight: 1.02,
              fontWeight: 800,
              letterSpacing: -3,
            }}
          >
            Manajemen aset, peminjaman, dan laporan kerusakan dalam satu sistem.
          </div>
          <div
            style={{
              maxWidth: 820,
              fontSize: 28,
              lineHeight: 1.35,
              color: "#cbd5e1",
            }}
          >
            Dirancang untuk administrasi sekolah agar inventaris laboratorium tetap
            rapi, cepat dilacak, dan mudah diaudit.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: 18,
            fontSize: 22,
            fontWeight: 700,
          }}
        >
          {[
            "Inventaris terpusat",
            "Role-based access",
            "Riwayat perbaikan",
          ].map((item) => (
            <div
              key={item}
              style={{
                padding: "16px 22px",
                borderRadius: 999,
                background: "rgba(255, 255, 255, 0.1)",
                border: "1px solid rgba(255, 255, 255, 0.14)",
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