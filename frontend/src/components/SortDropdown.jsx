import { useState, useRef, useEffect } from 'react';
import './CSS/sortdropdown.css';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest first' },
  { value: 'oldest', label: 'Oldest first' },
  { value: 'name-asc', label: 'Name A → Z' },
  { value: 'name-desc', label: 'Name Z → A' },
];

export default function SortDropdown({ sortBy, onSortChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const activeOption = SORT_OPTIONS.find(o => o.value === sortBy);
  const isDefault = !sortBy || sortBy === 'newest';

  return (
    <div className="lv-sort" ref={ref}>
      <button
        className={`lv-sort-btn ${!isDefault ? 'active' : ''}`}
        onClick={() => setOpen(o => !o)}
        title="Sort links"
      >
        <svg viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 7h6M3 12h10M3 17h14"/></svg>
      </button>

      {open && (
        <div className="lv-sort-dropdown">
          <div className="lv-sort-label">Sort by</div>
          {SORT_OPTIONS.map(opt => (
            <button
              key={opt.value}
              className={`lv-sort-option ${sortBy === opt.value ? 'selected' : ''}`}
              onClick={() => {
                onSortChange(opt.value);
                setOpen(false);
              }}
            >
              {opt.label}
              {sortBy === opt.value && (
                <svg viewBox="0 0 24 24" className="lv-sort-check"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
