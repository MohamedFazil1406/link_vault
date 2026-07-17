import { useState } from 'react';

export default function BulkTagModal({ isOpen, onClose, onApply, existingTags }) {
  const [newTag, setNewTag] = useState('');

  if (!isOpen) return null;

  const handleApply = () => {
    if (newTag.trim()) {
      onApply(newTag.trim());
      setNewTag('');
    }
  };

  return (
    <div className="lv-overlay" onClick={onClose}>
      <div className="lv-modal" onClick={e => e.stopPropagation()}>
        <div className="lv-modal-header">
          <h3 className="lv-modal-title">Add Tag to Selected</h3>
          <button className="lv-modal-close" onClick={onClose}>
            <svg viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/></svg>
          </button>
        </div>
        <div className="lv-modal-body">
          <label className="lv-field-label">Tag Name</label>
          <input 
            className="lv-input" 
            placeholder="e.g., javascript, design" 
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleApply()}
            autoFocus
          />
          {existingTags && existingTags.length > 0 && (
            <div className="lv-tag-suggestions" style={{ marginTop: '8px' }}>
              {existingTags.slice(0, 10).map(tag => (
                <button 
                  key={tag} 
                  className="lv-tag-suggestion"
                  onClick={() => setNewTag(tag)}
                  type="button"
                >
                  {tag}
                </button>
              ))}
            </div>
          )}
        </div>
        <div className="lv-modal-footer">
          <button className="lv-btn-primary" onClick={handleApply} type="button">Add Tag</button>
          <button className="lv-btn-secondary" onClick={onClose} type="button">Cancel</button>
        </div>
      </div>
    </div>
  );
}