import { ImageResponse } from "next/og";

// Route segment config
export const runtime = "edge";

// Image metadata
export const alt = "ResAgent Logo";
export const size = {
  width: 32,
  height: 32,
};
export const contentType = "image/png";

// Image generation
export default function Icon() {
  return new ImageResponse(
    (
      // ImageResponse inheritance rule: flexbox is default
      <div
        style={{
          fontSize: 20,
          background: "#0C0C0C",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "15%",
          color: "white",
          border: "1px solid rgba(255, 255, 255, 0.1)",
        }}
      >
        <div
          style={{
            display: "flex",
            width: 16,
            height: 16,
            border: "2px solid white",
            borderRadius: "2px",
            transform: "rotate(45deg)",
            position: "relative",
          }}
        >
          <div
            style={{
              position: "absolute",
              width: 4,
              height: 4,
              background: "white",
              borderRadius: "50%",
              top: -2,
              left: -2,
            }}
          />
          <div
            style={{
              position: "absolute",
              width: 4,
              height: 4,
              background: "white",
              borderRadius: "50%",
              bottom: -2,
              right: -2,
            }}
          />
          <div
            style={{
              position: "absolute",
              width: 4,
              height: 4,
              background: "white",
              borderRadius: "50%",
              top: -2,
              right: -2,
            }}
          />
          <div
            style={{
              position: "absolute",
              width: 4,
              height: 4,
              background: "white",
              borderRadius: "50%",
              bottom: -2,
              left: -2,
            }}
          />
        </div>
      </div>
    ),
    // ImageResponse options
    {
      ...size,
    }
  );
}
