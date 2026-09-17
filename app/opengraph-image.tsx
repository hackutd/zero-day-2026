import { ImageResponse } from "next/og";

import { SITE_TITLE } from "@/lib/site";

export const alt = SITE_TITLE;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "72px",
        color: "#ffffff",
        background:
          "radial-gradient(ellipse at 20% 0%, rgba(255, 46, 230, 0.35), transparent 55%), radial-gradient(ellipse at 90% 100%, rgba(70, 40, 200, 0.45), transparent 55%), #05040a",
      }}
    >
      <div
        style={{
          display: "flex",
          fontSize: 30,
          fontWeight: 500,
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          color: "#ff8af0",
        }}
      >
        HackUTD 2026
      </div>
      <div style={{ display: "flex", flexDirection: "column" }}>
        <div
          style={{
            display: "flex",
            fontSize: 132,
            fontWeight: 800,
            lineHeight: 1,
            letterSpacing: "-0.02em",
            textShadow: "0 0 40px rgba(255, 46, 230, 0.6)",
          }}
        >
          Zero Day
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 28,
            fontSize: 40,
            fontWeight: 400,
            color: "#d8d4e6",
          }}
        >
          North America&apos;s largest 24-hour university hackathon
        </div>
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 28,
          color: "#a39fb5",
        }}
      >
        <span>November 7-8, 2026</span>
        <span>The University of Texas at Dallas</span>
      </div>
    </div>,
    size,
  );
}
