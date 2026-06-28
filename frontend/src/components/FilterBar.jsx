import './CSS/filterbar.css';

export default function FilterBar({
  links, filterTag, filterDomain, filterDate,
  onFilterTag, onFilterDomain, onFilterDate, onClear
}) {
  const domains = [...new Set(links.flatMap(l => l.tags || []).filter(t => t.includes('.')))];
  const tags    = [...new Set(links.flatMap(l => l.tags || []).filter(t => !t.includes('.')))];
  const active  = filterTag || filterDomain || filterDate;

  return (
    <div className="lv-filterbar">
      {/* Date */}
      <div className="fb-group">
        <span className="fb-label">Date</span>
        {['today','week','month'].map(d => (
          <button key={d} className={`fb-chip ${filterDate === d ? 'on' : ''}`}
            onClick={() => onFilterDate(filterDate === d ? null : d)}>{d}</button>
        ))}
      </div>

      {domains.length > 0 && <div className="fb-sep" />}

      {domains.length > 0 && (
        <div className="fb-group">
          <span className="fb-label">Site</span>
          {domains.map(d => (
            <button key={d} className={`fb-chip ${filterDomain === d ? 'on' : ''}`}
              onClick={() => onFilterDomain(filterDomain === d ? null : d)}>{d}</button>
          ))}
        </div>
      )}

      {tags.length > 0 && <div className="fb-sep" />}

      {tags.length > 0 && (
        <div className="fb-group">
          <span className="fb-label">Tag</span>
          {tags.map(t => (
            <button key={t} className={`fb-chip ${filterTag === t ? 'on' : ''}`}
              onClick={() => onFilterTag(filterTag === t ? null : t)}>{t}</button>
          ))}
        </div>
      )}

      {active && <button className="fb-clear" onClick={onClear}>Clear ×</button>}
    </div>
  );
}
