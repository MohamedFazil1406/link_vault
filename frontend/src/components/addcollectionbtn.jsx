import { useState } from 'react';
import './CSS/links.css';

export default function AddCollectionModal({ onClose, onAdd }) {
  const [name, setName] = useState('');

  const handleSubmit = () => {
    if (!name.trim()) return;
    onAdd({ name: name.trim() });
  };

  return (
    <div className="lv-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="lv-modal">
        <div className="lv-modal-header">
          <span className="lv-modal-title">New collection</span>
          <button className="lv-modal-close" onClick={onClose}>
            <svg viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>

        <div className="lv-modal-body">
          <div>
            <div className="lv-field-label">Name</div>
            <input
              className="lv-input"
              placeholder="e.g. Design inspiration"
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSubmit()}
              autoFocus
            />
          </div>
        </div>

        <div className="lv-modal-footer">
          <button className="lv-btn-primary" onClick={handleSubmit}>Create collection</button>
          <button className="lv-btn-secondary" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
