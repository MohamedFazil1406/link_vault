import { useState, useEffect } from 'react';
import './CSS/links.css';

export default function AddLinkModal({ onClose, onAdd, collections, editingLink, allTags }) {
  const [url, setUrl]         = useState('');
  const [name, setName]       = useState('');
  const [notes, setNotes]     = useState('');
  const [colId, setColId]     = useState('');
  const [tags, setTags]       = useState([]);
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    if (editingLink) {
      setUrl(editingLink.url || '');
      setName(editingLink.name || '');
      setNotes(editingLink.notes || '');
      setColId(editingLink.collectionId ? String(editingLink.collectionId) : '');
      setTags(editingLink.tags?.filter(t => !t.includes('.')) || []);
    }
  }, [editingLink]);

  const addTag = () => {
    const t = tagInput.trim().toLowerCase();
    if (t && !tags.includes(t)) setTags([...tags, t]);
    setTagInput('');
  };

  const removeTag = (t) => setTags(tags.filter(x => x !== t));

  const suggestions = (allTags || [])
    .filter(t => !t.includes('.') && !tags.includes(t))
    .slice(0, 8);

  const handleSubmit = () => {
    if (!url.trim()) return;
    onAdd(
      { url: url.trim(), name: name.trim() || url.trim() },
      colId ? Number(colId) : null,
      notes.trim(),
      tags,
      editingLink?.id || null
    );
  };

  return (
    <div className="lv-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="lv-modal">
        <div className="lv-modal-header">
          <span className="lv-modal-title">{editingLink?.id ? 'Edit link' : 'Add link'}</span>
          <button className="lv-modal-close" onClick={onClose}>
            <svg viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>

        <div className="lv-modal-body">
          <div>
            <div className="lv-field-label">URL</div>
            <input className="lv-input" placeholder="https://…" value={url} onChange={e => setUrl(e.target.value)} autoFocus />
          </div>

          <div>
            <div className="lv-field-label">Name</div>
            <input className="lv-input" placeholder="Give it a name…" value={name} onChange={e => setName(e.target.value)} />
          </div>

          <div>
            <div className="lv-field-label">Collection</div>
            <select className="lv-select" value={colId} onChange={e => setColId(e.target.value)}>
              <option value="">Unsorted</option>
              {collections.map(c => (
                <option key={c.id} value={String(c.id)}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <div className="lv-field-label">Notes</div>
            <textarea className="lv-textarea" placeholder="Optional notes…" value={notes} onChange={e => setNotes(e.target.value)} />
          </div>

          <div>
            <div className="lv-field-label">Tags</div>
            <div className="lv-tag-row">
              <input
                className="lv-tag-input"
                placeholder="Add a tag…"
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addTag())}
              />
              <button className="lv-tag-add" onClick={addTag}>+</button>
            </div>

            {suggestions.length > 0 && (
              <div className="lv-tag-suggestions" style={{ marginTop: 6 }}>
                {suggestions.map(t => (
                  <button key={t} className="lv-tag-suggestion" onClick={() => setTags([...tags, t])}>{t}</button>
                ))}
              </div>
            )}

            {tags.length > 0 && (
              <div className="lv-tag-pills" style={{ marginTop: 8 }}>
                {tags.map(t => (
                  <span key={t} className="lv-tag-pill">
                    {t}
                    <button className="lv-tag-remove" onClick={() => removeTag(t)}>×</button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="lv-modal-footer">
          <button className="lv-btn-primary" onClick={handleSubmit}>
            {editingLink?.id ? 'Save changes' : 'Save link'}
          </button>
          <button className="lv-btn-secondary" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
