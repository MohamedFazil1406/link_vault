// src/components/ShareTarget.jsx
// When opened via share sheet, renders a standalone save modal
// instead of the full app — feels more like a native share popup.

import { useState, useEffect } from "react";
import { addLink, getAllCollections } from "../api.js";
import './CSS/links.css';

export default function ShareTarget() {
  const [url, setUrl] = useState("");
  const [name, setName] = useState("");
  const [notes, setNotes] = useState("");
  const [collectionId, setCollectionId] = useState("");
  const [collections, setCollections] = useState([]);
  const [status, setStatus] = useState("idle"); // idle | saving | saved | error

  useEffect(() => {
    // Read shared URL from query params
    const params = new URLSearchParams(window.location.search);
    const sharedUrl = params.get("url") || params.get("text") || "";
    const sharedTitle = params.get("title") || "";
    setUrl(sharedUrl);
    setName(sharedTitle);

    // Load collections
    getAllCollections()
      .then(setCollections)
      .catch(() => {}); // non-critical
  }, []);

  const handleSave = async () => {
    if (!url) return;
    setStatus("saving");
    try {
      await addLink({
        url,
        name: name || url,
        notes,
        collectionId: collectionId ? parseInt(collectionId) : null,
      });
      setStatus("saved");
      // Go back to whatever app they were using
      setTimeout(() => {
        if (window.history.length > 1) {
          window.history.back();
        } else {
          window.close();
        }
      }, 900);
    } catch (e) {
      setStatus("error");
    }
  };

  const handleCancel = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.close();
    }
  };

  return (
    <div className="modal-overlay" style={{ alignItems: "flex-end", paddingBottom: 0 }}>
      <div className="modal" style={{
        borderRadius: "24px 24px 0 0",
        maxWidth: "100%",
        width: "100%",
        paddingBottom: "env(safe-area-inset-bottom, 16px)"
      }}>

        {/* Handle bar */}
        <div style={{
          width: 40, height: 4,
          background: "#e2e8f0",
          borderRadius: 2,
          margin: "16px auto 0"
        }} />

        {/* Header */}
        <div className="modal-header">
          <div className="modal-icon">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
          </div>
          <h3 className="modal-title">Save to Link Vault</h3>
          <p className="modal-subtitle">Organise your favourite resources easily.</p>
        </div>

        {/* Body */}
        <div className="modal-body">
          <input
            className="modal-input"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Title (optional)"
          />
          <input
            className="modal-input"
            value={url}
            onChange={e => setUrl(e.target.value)}
            placeholder="URL"
          />
          <textarea
            className="modal-textarea"
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Notes (optional)"
          />
          <select
            className="modal-select"
            value={collectionId}
            onChange={e => setCollectionId(e.target.value)}
          >
            <option value="">No collection</option>
            {collections.map(col => (
              <option key={col.id} value={col.id}>{col.name}</option>
            ))}
          </select>

          {status === "error" && (
            <p style={{ color: "#ef4444", fontSize: "0.8rem", margin: 0 }}>
              Failed to save. Check your connection.
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button
            className="btn-primary"
            onClick={handleSave}
            disabled={status === "saving" || status === "saved"}
            style={{
              background: status === "saved" ? "#22c55e" : undefined,
              transition: "background 0.2s"
            }}
          >
            {status === "saving" ? "Saving..." : status === "saved" ? "Saved ✓" : "Save Link"}
          </button>
          <button className="btn-secondary" onClick={handleCancel}>
            Cancel
          </button>
        </div>

      </div>
    </div>
  );
}
