import { Trash2, Tag, Archive, X, CheckSquare, RotateCcw } from "lucide-react";

export function BulkActionsBar({
  selectedCount,
  onDelete,
  onTag,
  onArchive,
  onClearSelection,
  isArchived = false,
}) {
  if (selectedCount === 0) return null;

  return (
    <div className="bulk-actions-bar">
      <div className="bulk-count">
        <CheckSquare className="bulk-icon" />
        <span>{selectedCount} selected</span>
      </div>
      
      <div className="bulk-divider" />
      
      <div className="bulk-buttons">
        <button onClick={onTag} className="bulk-btn" title="Add tag to selected">
          <Tag className="bulk-btn-icon" />
          <span>Tag</span>
        </button>
        
        <button onClick={onArchive} className="bulk-btn" title={isArchived ? "Restore selected" : "Archive selected"}>
          {isArchived ? <RotateCcw className="bulk-btn-icon" /> : <Archive className="bulk-btn-icon" />}
          <span>{isArchived ? "Restore" : "Archive"}</span>
        </button>
        
        <button onClick={onDelete} className="bulk-btn bulk-btn-danger" title="Delete selected">
          <Trash2 className="bulk-btn-icon" />
          <span>Delete</span>
        </button>
      </div>
      
      <div className="bulk-divider" />
      
      <button onClick={onClearSelection} className="bulk-close-btn" title="Clear selection">
        <X className="bulk-close-icon" />
      </button>
    </div>
  );
}