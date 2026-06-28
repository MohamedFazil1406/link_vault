// Rendered when opened via Android share sheet — standalone save sheet
import { useState, useEffect } from "react";
import { addLink, getAllCollections } from "../api.js";
import './CSS/links.css';

export default function ShareTarget() {
  const [url, setUrl]               = useState("");
  const [name, setName]             = useState("");
  const [notes, setNotes]           = useState("");
  const [collectionId, setCollectionId] = useState("");
  const [collections, setCollections]   = useState([]);
  const [status, setStatus]         = useState("idle"); // idle | saving | saved | duplicate | error

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setUrl(params.get("url") || params.get("text") || "");
    setName(params.get("title") || "");
    getAllCollections().then(setCollections).catch(() => {});
  }, []);

  const handleSave = async () => {
    if (!url) return;
    setStatus("saving");
    try {
      const result = await addLink({ url, name: name || url, notes, collectionId: collectionId ? parseInt(collectionId) : null });
      if (result.duplicate) { setStatus("duplicate"); return; }
      setStatus("saved");
      setTimeout(() => window.history.length > 1 ? window.history.back() : window.close(), 900);
    } catch { setStatus("error"); }
  };

  const handleCancel = () => window.history.length > 1 ? window.history.back() : window.close();

  const btnLabel = { saving: "Saving…", saved: "Saved ✓", duplicate: "Already saved", error: "Try again", idle: "Save link" }[status];
  const btnBg    = status === "saved" ? "#22c55e" : status === "duplicate" ? "var(--amber)" : "var(--amber)";

  return (
    <div className="lv-overlay" style={{ alignItems: "flex-end", paddingBottom: 0 }}>
      <div className="lv-modal" style={{ borderRadius: "20px 20px 0 0", maxWidth: "100%", paddingBottom: "env(safe-area-inset-bottom, 16px)" }}>
        {/* Handle */}
        <div style={{ width: 36, height: 4, background: "var(--border-2)", borderRadius: 2, margin: "14px auto 0" }} />

        <div className="lv-modal-header" style={{ paddingTop: 14 }}>
          <span className="lv-modal-title">Save to LinVault</span>
        </div>

        <div className="lv-modal-body">
          <input className="lv-input" value={name} onChange={e => setName(e.target.value)} placeholder="Name (optional)" />
          <input className="lv-input" value={url}  onChange={e => setUrl(e.target.value)}  placeholder="URL" />
          <textarea className="lv-textarea" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Notes (optional)" />
          <select className="lv-select" value={collectionId} onChange={e => setCollectionId(e.target.value)}>
            <option value="">Unsorted</option>
            {collections.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          {status === "error"     && <p style={{ color: "#ef4444", fontSize: "0.8rem" }}>Failed to save. Check your connection.</p>}
          {status === "duplicate" && <p style={{ color: "var(--amber)", fontSize: "0.8rem" }}>⚠️ Already in your vault!</p>}
        </div>

        <div className="lv-modal-footer">
          <button className="lv-btn-primary" onClick={handleSave} disabled={status === "saving" || status === "saved"} style={{ background: btnBg }}>
            {btnLabel}
          </button>
          <button className="lv-btn-secondary" onClick={handleCancel}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
