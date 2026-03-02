import { ImageResponse } from "next/og";
import { getLocationForShare } from "@/lib/get-location";

export const alt = "Hello from location";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OgImage() {
  const { location, user } = await getLocationForShare();

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "row",
        padding: 64,
        gap: 64,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#29424A",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <img
        src={
          process.env.NEXT_PUBLIC_BASE_URL
            ? `${process.env.NEXT_PUBLIC_BASE_URL}/android-chrome-512x512.png`
            : process.env.AVATAR_URL
        }
        alt="Logo"
        style={{
          width: 448,
          height: 448,
          display: "flex",
          borderRadius: "10rem",
        }}
      />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 32,
          flex: 1,
          alignItems: "center",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            maxWidth: 900,
            gap: 4,
          }}
        >
          <span style={{ fontSize: 32, fontWeight: 700, color: "#DDD" }}>
            {user.name} is in
          </span>
          <span style={{ fontSize: 48, fontWeight: 600, color: "#FFF" }}>
            {location.location} {location.flag}
          </span>
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 48,
            marginTop: 16,
            color: "#FFF",
          }}
        >
          {location.hello} 👋
        </div>
      </div>
    </div>,
    { ...size },
  );
}
