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
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #111111, #0A0A0A)",
          borderRadius: "22%",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Orbital ring */}
        <div
          style={{
            position: "absolute",
            width: 22,
            height: 22,
            borderRadius: "50%",
            border: "0.8px solid rgba(255, 255, 255, 0.3)",
            top: 5,
            left: 5,
            display: "flex",
          }}
        />

        {/* Hexagonal core outline */}
        <div
          style={{
            width: 14,
            height: 14,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative",
          }}
        >
          {/* Central eye / AI core */}
          <div
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 0 4px rgba(255,255,255,0.3)",
            }}
          >
            <div
              style={{
                width: 3,
                height: 3,
                borderRadius: "50%",
                background: "#0C0C0C",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  width: 1.2,
                  height: 1.2,
                  borderRadius: "50%",
                  background: "white",
                  display: "flex",
                }}
              />
            </div>
          </div>
        </div>

        {/* Agent node - Top */}
        <div
          style={{
            position: "absolute",
            top: 2,
            left: 13,
            width: 5,
            height: 5,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.9)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: 2.2,
              height: 2.2,
              borderRadius: "50%",
              background: "#0C0C0C",
              display: "flex",
            }}
          />
        </div>

        {/* Agent node - Bottom Right */}
        <div
          style={{
            position: "absolute",
            bottom: 3,
            right: 2,
            width: 5,
            height: 5,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.9)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: 2.2,
              height: 2.2,
              borderRadius: "50%",
              background: "#0C0C0C",
              display: "flex",
            }}
          />
        </div>

        {/* Agent node - Bottom Left */}
        <div
          style={{
            position: "absolute",
            bottom: 3,
            left: 2,
            width: 5,
            height: 5,
            borderRadius: "50%",
            background: "rgba(255,255,255,0.9)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: 2.2,
              height: 2.2,
              borderRadius: "50%",
              background: "#0C0C0C",
              display: "flex",
            }}
          />
        </div>

        {/* Connection lines (visual accent bars) */}
        <div
          style={{
            position: "absolute",
            top: 7,
            left: 15,
            width: 0.7,
            height: 6,
            background: "rgba(255,255,255,0.3)",
            display: "flex",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 7,
            right: 7,
            width: 6,
            height: 0.7,
            background: "rgba(255,255,255,0.25)",
            display: "flex",
            transform: "rotate(35deg)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 7,
            left: 5,
            width: 6,
            height: 0.7,
            background: "rgba(255,255,255,0.25)",
            display: "flex",
            transform: "rotate(-35deg)",
          }}
        />
      </div>
    ),
    {
      ...size,
    }
  );
}
