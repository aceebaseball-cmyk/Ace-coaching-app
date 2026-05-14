import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";

class AceErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    console.error("ACE app crashed:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <main style={{ minHeight: "100vh", background: "#050505", color: "white", padding: "32px", fontFamily: "system-ui, sans-serif" }}>
          <div style={{ maxWidth: "900px", margin: "0 auto", border: "1px solid #7f1d1d", borderRadius: "24px", padding: "24px", background: "#09090b" }}>
            <h1 style={{ fontSize: "28px", fontWeight: 900, marginBottom: "12px" }}>ACE app hit a runtime error</h1>
            <p style={{ color: "#a1a1aa", marginBottom: "16px" }}>This fallback prevents a blank screen. Send this error text back so we can fix the exact component.</p>
            <pre style={{ whiteSpace: "pre-wrap", color: "#fca5a5", background: "#000", padding: "16px", borderRadius: "16px", overflowX: "auto" }}>
              {String(this.state.error?.message || this.state.error || "Unknown error")}
            </pre>
          </div>
        </main>
      );
    }

    return this.props.children;
  }
}

const rootElement = document.getElementById("root");

createRoot(rootElement).render(
  <AceErrorBoundary>
    <App />
  </AceErrorBoundary>
);
