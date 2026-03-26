// Root not-found.tsx — rendered when no locale layout is available.
// Must include <html> and <body> since the root layout returns bare children.
import Link from "next/link";

export default function RootNotFound() {
  return (
    <html lang="en">
      <body style={{ margin: 0, background: "#F6F8FF", fontFamily: "system-ui, sans-serif" }}>
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "4rem 1rem",
          }}
        >
          <div
            style={{
              fontSize: "8rem",
              fontWeight: 900,
              lineHeight: 1,
              marginBottom: "0.5rem",
              background: "linear-gradient(135deg,#6366F1,#8B5CF6,#22C55E)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            404
          </div>
          <div style={{ fontSize: "1.5rem", fontWeight: 700, color: "#0F172A", marginBottom: "0.5rem" }}>
            Page not found
          </div>
          <p style={{ color: "#64748B", textAlign: "center", maxWidth: "28rem", marginBottom: "2rem" }}>
            The page you are looking for doesn&apos;t exist or may have moved.
          </p>
          <Link
            href="/"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.75rem 1.5rem",
              borderRadius: "0.75rem",
              color: "#fff",
              fontWeight: 600,
              fontSize: "0.875rem",
              background: "linear-gradient(135deg,#6366F1,#8B5CF6)",
              textDecoration: "none",
            }}
          >
            ← Back to eWheelz
          </Link>
        </div>
      </body>
    </html>
  );
}
