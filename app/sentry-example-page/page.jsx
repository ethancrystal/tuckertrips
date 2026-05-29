"use client";

import * as Sentry from "@sentry/nextjs";

export default function SentryExamplePage() {
  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      gap: "1rem",
      fontFamily: "system-ui, sans-serif",
      backgroundColor: "#f9fafb",
    }}>
      <h1 style={{ fontSize: "1.5rem", fontWeight: "bold" }}>Sentry Test Page</h1>
      <p style={{ color: "#6b7280" }}>Click the button to send a test error to Sentry.</p>
      <button
        onClick={() => {
          Sentry.captureException(new Error("Sentry test error from Tucker Trips — setup verification"));
          alert("Test error sent to Sentry! Check your Sentry dashboard.");
        }}
        style={{
          padding: "0.75rem 2rem",
          backgroundColor: "#dc2626",
          color: "white",
          border: "none",
          borderRadius: "0.5rem",
          cursor: "pointer",
          fontSize: "1rem",
          fontWeight: "600",
        }}
      >
        Send Test Error
      </button>
    </div>
  );
}
