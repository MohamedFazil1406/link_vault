import './CSS/header.css';

export default function Header({
  onAddLink, searchTerm, onSearchChange,
  showFilters, onToggleFilters, showFilterBtn,
  activeCollectionId, collections, onGoHome
}) {
  const activeCol = collections?.find(c => c.id === activeCollectionId);

  return (
    <div className="lv-header">
      {/* Breadcrumb */}
      <div className="lv-breadcrumb">
        {activeCol ? (
          <>
            <span className="lv-breadcrumb-root" onClick={onGoHome}>All links</span>
            <span className="lv-breadcrumb-sep">›</span>
            <span className="lv-breadcrumb-current">{activeCol.name}</span>
          </>
        ) : (
          <span className="lv-breadcrumb-current">All links</span>
        )}
      </div>

      {/* Search */}
      <div className="lv-search-wrap">
        <span className="lv-search-icon">
          <svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
        </span>
        <input
          className="lv-search"
          type="text"
          placeholder="Search links…"
          value={searchTerm}
          onChange={e => onSearchChange(e.target.value)}
        />
      </div>

      {/* Filter toggle */}
      {showFilterBtn && (
        <button
          className={`lv-header-btn ${showFilters ? 'active' : ''}`}
          onClick={onToggleFilters}
          title="Filters"
        >
          <svg viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 4h18M7 12h10M11 20h2"/></svg>
        </button>
      )}

      {/* Add link */}
      <button className="lv-add-btn" onClick={onAddLink}>
        <svg viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/></svg>
        <span>Add link</span>
      </button>
    </div>
  );
}
