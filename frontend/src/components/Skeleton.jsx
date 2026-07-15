import './CSS/skeleton.css';

export default function LoadingSkeleton() {
  return (
    <div className="lv-skeleton-list">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="lv-skeleton-link">
          <div className="lv-skeleton-top">
            <div className="lv-skeleton-favicon" />
            <div className="lv-skeleton-name" />
            <div className="lv-skeleton-tags">
              <div className="lv-skeleton-tag" />
              <div className="lv-skeleton-tag" />
            </div>
            <div className="lv-skeleton-actions">
              <div className="lv-skeleton-btn" />
              <div className="lv-skeleton-btn" />
              <div className="lv-skeleton-btn" />
            </div>
          </div>
          <div className="lv-skeleton-notes" />
        </div>
      ))}
    </div>
  );
}
