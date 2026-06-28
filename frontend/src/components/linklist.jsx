import './CSS/linklist.css';

function getFavicon(url) {
  try { return new URL(url).hostname.replace('www.', '')[0].toUpperCase(); }
  catch { return '?'; }
}

export default function Linklist({ links, onEditLink, onDeleteLink }) {
  if (links.length === 0) {
    return (
      <div className="lv-empty">
        <div className="lv-empty-icon">
          <svg viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"/></svg>
        </div>
        <h3>No links yet</h3>
        <p>Hit "Add link" to save your first one</p>
      </div>
    );
  }

  return (
    <div className="lv-list">
      {links.map(link => {
        const displayTags = (link.tags || []).filter(t => !t.includes('.'));
        return (
          <div key={link.id} className="lv-link">
            <div className="lv-link-top">
              <div className="lv-favicon">{getFavicon(link.url)}</div>

              <a href={link.url} target="_blank" rel="noreferrer" className="lv-link-name">
                {link.name}
              </a>

              {displayTags.length > 0 && (
                <div className="lv-link-tags">
                  {displayTags.slice(0, 3).map(t => (
                    <span key={t} className="lv-tag">{t}</span>
                  ))}
                </div>
              )}

              <div className="lv-link-actions">
                <button className="lv-action-btn edit" onClick={() => onEditLink(link)} title="Edit">
                  <svg viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
                </button>
                <button className="lv-action-btn del" onClick={() => onDeleteLink(link)} title="Delete">
                  <svg viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                </button>
              </div>
            </div>

            {link.notes && (
              <div className="lv-link-notes">{link.notes}</div>
            )}
          </div>
        );
      })}
    </div>
  );
}
