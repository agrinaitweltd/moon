"use client";

import { useEffect, useState } from "react";

interface FriendlyPage {
  route: string;
  name: string;
}

interface ImageItem {
  number: number;
  filename: string;
  pages: string[];
  alt: string;
  fileExists: boolean;
  friendlyPages: FriendlyPage[];
}

export default function PhotoGuidePage() {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [search, setSearch] = useState("");
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchManifest = async () => {
    try {
      const res = await fetch("/api/images/manifest");
      const data = await res.json();
      setImages(data);
      setLastRefresh(new Date());
    } catch (err) {
      console.error("Failed to fetch manifest:", err);
    }
  };

  useEffect(() => {
    fetchManifest();
    setLoading(false);

    const interval = setInterval(fetchManifest, 3000);
    return () => clearInterval(interval);
  }, []);

  const filtered = images.filter(
    (img) =>
      img.number.toString().includes(search) ||
      img.alt.toLowerCase().includes(search.toLowerCase()) ||
      img.friendlyPages.some((p) =>
        p.name.toLowerCase().includes(search.toLowerCase())
      )
  );

  const missing = images.filter((img) => !img.fileExists).length;
  const total = images.length;

  return (
    <div style={{ minHeight: "100vh", background: "#f5f5f5", padding: "2rem" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <h1 style={{ color: "#1a1a1a", marginBottom: "0.5rem" }}>
          Photo Asset Guide
        </h1>
        <p style={{ color: "#666", marginBottom: "2rem" }}>
          {total} images tracked • {missing} missing files
          {lastRefresh && (
            <>
              {" "}
              • Last synced: {lastRefresh.toLocaleTimeString()}
            </>
          )}
        </p>

        <div
          style={{
            marginBottom: "2rem",
            display: "flex",
            gap: "1rem",
            alignItems: "center",
          }}
        >
          <input
            type="text"
            placeholder="Search by number, page name, or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              flex: 1,
              padding: "0.75rem",
              borderRadius: "6px",
              border: "1px solid #ddd",
              fontSize: "14px",
            }}
          />
          <button
            onClick={fetchManifest}
            style={{
              padding: "0.75rem 1.5rem",
              background: "#0066cc",
              color: "white",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontSize: "14px",
            }}
          >
            Refresh
          </button>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(350px, 1fr))",
            gap: "1rem",
          }}
        >
          {filtered.map((img) => (
            <div
              key={img.number}
              style={{
                background: "white",
                borderRadius: "8px",
                padding: "1.5rem",
                border: `2px solid ${img.fileExists ? "#4CAF50" : "#ff9800"}`,
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "1rem",
                }}
              >
                <h3 style={{ margin: 0, color: "#1a1a1a", fontSize: "18px" }}>
                  Image #{img.number}
                </h3>
                <span
                  style={{
                    fontSize: "20px",
                    color: img.fileExists ? "#4CAF50" : "#ff9800",
                  }}
                >
                  {img.fileExists ? "✓" : "⚠"}
                </span>
              </div>

              <div
                style={{
                  fontSize: "12px",
                  color: "#999",
                  marginBottom: "1rem",
                  fontFamily: "monospace",
                }}
              >
                {img.filename} {!img.fileExists && "— FILE NOT FOUND"}
              </div>

              <div
                style={{
                  marginBottom: "1rem",
                  fontSize: "13px",
                  color: "#666",
                  lineHeight: "1.4",
                }}
              >
                <strong>Photo description:</strong>
                <div style={{ marginTop: "0.25rem", fontStyle: "italic" }}>
                  {img.alt || "(no description)"}
                </div>
              </div>

              <div
                style={{
                  fontSize: "13px",
                  color: "#333",
                  lineHeight: "1.6",
                }}
              >
                <strong>Appears on:</strong>
                <div style={{ marginTop: "0.5rem" }}>
                  {img.friendlyPages.length === 0 ? (
                    <span style={{ color: "#999" }}>No pages</span>
                  ) : (
                    img.friendlyPages.map((page, idx) => (
                      <div key={idx} style={{ marginBottom: "0.25rem" }}>
                        • <strong>{page.name}</strong>{" "}
                        <span style={{ color: "#999", fontSize: "11px" }}>
                          ({page.route})
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {!img.fileExists && (
                <div
                  style={{
                    marginTop: "1rem",
                    padding: "0.75rem",
                    background: "#fff3cd",
                    borderRadius: "4px",
                    fontSize: "12px",
                    color: "#856404",
                    border: "1px solid #ffeaa7",
                  }}
                >
                  ⚠ File missing. Upload <strong>{img.filename}</strong> to
                  public/assets/ to restore this image across all pages.
                </div>
              )}

              {img.fileExists && (
                <div
                  style={{
                    marginTop: "1rem",
                    padding: "0.75rem",
                    background: "#e8f5e9",
                    borderRadius: "4px",
                    fontSize: "12px",
                    color: "#2e7d32",
                    border: "1px solid #81c784",
                  }}
                >
                  ✓ File ready. Update this image by replacing public/assets/
                  {img.filename}
                </div>
              )}
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: "3rem",
              color: "#999",
              fontSize: "16px",
            }}
          >
            No images match "{search}"
          </div>
        )}
      </div>
    </div>
  );
}
