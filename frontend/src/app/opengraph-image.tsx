import { ImageResponse } from "next/og";

export const alt = "InsightNest: live data analytics and product management courses";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: 80, background: "#101c2f", color: "#ffffff" }}>
      <div style={{ fontSize: 34, fontWeight: 700, color: "#8596ff" }}>InsightNest</div>
      <div style={{ marginTop: 28, fontSize: 72, fontWeight: 700, lineHeight: 1.1 }}>Live Data Analytics and Product Management Courses</div>
      <div style={{ marginTop: 32, fontSize: 34, color: "#d7e3fd" }}>Taught live on weekends, with real projects and career support</div>
    </div>,
    size
  );
}
