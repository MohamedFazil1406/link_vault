import { useState } from "react";
import { Trash2, Tag, Archive, X, CheckSquare } from "lucide-react";

interface BulkActionsBarProps {
  selectedCount: number;
  onDelete: () => void;
  onTag: () => void;
  onArchive: () => void;
  onClearSelection: () => void;
}

export function BulkActionsBar({
  selectedCount,
  onDelete,
  onTag,
  onArchive,
  onClearSelection,
}: BulkActionsBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-4 py-3 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-2 text-sm font-medium text-gray-900 dark:text-gray-100">
        <CheckSquare className="h-4 w-4 text-indigo-500" />
        {selectedCount} selected
      </div>

      <div className="h-4 w-px bg-gray-200 dark:bg-gray-700" />

      <div className="flex items-center gap-1">
        <button
          onClick={onTag}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          title="Add tag to selected"
        >
          <Tag className="h-3.5 w-3.5" />
          Tag
        </button>
        <button
          onClick={onArchive}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          title="Archive selected"
        >
          <Archive className="h-3.5 w-3.5" />
          Archive
        </button>
        <button
          onClick={onDelete}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
          title="Delete selected"
        >
          <Trash2 className="h-3.5 w-3.5" />
          Delete
        </button>
      </div>

      <div className="h-4 w-px bg-gray-200 dark:bg-gray-700" />

      <button
        onClick={onClearSelection}
        className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        aria-label="Clear selection"
      >
        <X className="h-4 w-4 text-gray-400" />
      </button>
    </div>
  );
}
