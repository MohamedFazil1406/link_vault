import './CSS/collectionpage.css';

export default function CollectionsPage({ collections, links, onSelectCollection, onDeleteCollection }) {
  if (collections.length === 0) {
    return (
      <div className="lv-collections-grid">
        <div className="lv-col-empty">
          <p>No collections yet. Create one from the sidebar.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="lv-collections-grid">
      {collections.map(col => {
        const count = links.filter(l => l.collectionId === col.id).length;
        return (
          <div key={col.id} className="lv-col-card" onClick={() => onSelectCollection(col.id)}>
            <div className="lv-col-icon">
              <svg viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/></svg>
            </div>
            <div className="lv-col-name">{col.name}</div>
            <div className="lv-col-count">{count} link{count !== 1 ? 's' : ''}</div>

            <div className="lv-col-actions">
              <button
                className="lv-col-action-btn"
                title="Delete collection"
                onClick={e => { e.stopPropagation(); onDeleteCollection(col.id); }}
              >
                <svg viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
