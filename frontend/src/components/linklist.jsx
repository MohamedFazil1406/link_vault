<<<<<<< HEAD
import { useState } from 'react';
import './CSS/linklist.css';
=======
import "./CSS/linklist.css";
>>>>>>> 9cc936f (feat: add scheduled link health checker)

function getFavicon(url) {
  try {
    return new URL(url).hostname.replace("www.", "")[0].toUpperCase();
  } catch {
    return "?";
  }
}

function StatusIcon({ link }) {
  if (link.status === "broken") {
    return (
      <span
        className="lv-link-status broken"
        title={`Broken (${link.status_code ?? "Unknown"})`}
      >
        ❌
      </span>
    );
  }

  if (link.status === "redirected") {
    return (
      <span
        className="lv-link-status redirected"
        title={`Redirects to ${link.redirect_url || "another URL"}`}
      >
        ⚠️
      </span>
    );
  }

  return null;
}

function CopyButton({ url }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = url;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    }
  };

  return (
    <button
      className={`lv-action-btn copy${copied ? ' copied' : ''}`}
      onClick={handleCopy}
      title={copied ? 'Copied!' : 'Copy URL'}
    >
      {copied ? (
        <svg viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
      ) : (
        <svg viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/></svg>
      )}
    </button>
  );
}

export default function Linklist({ links, onEditLink, onDeleteLink }) {
  if (links.length === 0) {
    return (
      <div className="lv-empty">
        <div className="lv-empty-icon">
          <svg viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
            />
          </svg>
        </div>

        <h3>No links yet</h3>
        <p>Hit "Add link" to save your first one</p>
      </div>
    );
  }

  return (
    <div className="lv-list">
      {links.map((link) => {
        const displayTags = (link.tags || []).filter((t) => !t.includes("."));

        return (
          <div key={link.id} className="lv-link">
            <div className="lv-link-top">
              <div className="lv-favicon">{getFavicon(link.url)}</div>

              <div className="lv-link-title">
                <a
                  href={link.url}
                  target="_blank"
                  rel="noreferrer"
                  className="lv-link-name"
                >
                  {link.name}
                </a>

                <StatusIcon link={link} />
              </div>

              {displayTags.length > 0 && (
                <div className="lv-link-tags">
                  {displayTags.slice(0, 3).map((tag) => (
                    <span key={tag} className="lv-tag">
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              <div className="lv-link-actions">
<<<<<<< HEAD
                <CopyButton url={link.url} />
                <button className="lv-action-btn edit" onClick={() => onEditLink(link)} title="Edit">
                  <svg viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
=======
                <button
                  className="lv-action-btn edit"
                  onClick={() => onEditLink(link)}
                  title="Edit"
                >
                  <svg viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                    />
                  </svg>
>>>>>>> 9cc936f (feat: add scheduled link health checker)
                </button>

                <button
                  className="lv-action-btn del"
                  onClick={() => onDeleteLink(link)}
                  title="Delete"
                >
                  <svg viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                </button>
              </div>
            </div>

            {link.notes && <div className="lv-link-notes">{link.notes}</div>}
          </div>
        );
      })}
    </div>
  );
}
