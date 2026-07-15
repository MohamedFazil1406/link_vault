import { useState, useEffect } from "react";
import './App.css';
import Header from './components/Header.jsx';
import FilterBar from './components/FilterBar.jsx';
import Sidebar from './components/sidebar.jsx';
import Linklist from './components/linklist.jsx';
import CollectionsPage from './components/collectionPage.jsx';
import AddLinkModal from './components/addlinkbtn.jsx';
import AddCollectionModal from './components/addcollectionbtn.jsx';
import ShareTarget from './components/ShareTarget.jsx';
import LoadingSkeleton from './components/Skeleton.jsx';
import BulkTagModal from './components/BulkTagModal.jsx';
import { BulkActionsBar } from './components/BulkActionsBar.jsx';
import {
  getAllLinks, addLink, deleteLink, updateLink,
  getAllCollections, addCollection, deleteCollection,
  bulkDeleteLinks, bulkArchiveLinks, bulkTagLinks
} from "./api.js";

export default function App() {
  if (window.location.pathname === "/share-target") return null;

  const [dark, setDark] = useState(() => localStorage.getItem('lv-theme') === 'dark');
  const [collections, setCollections] = useState([]);
  const [links, setLinks] = useState([]);
  const [activeCollectionId, setActiveCollectionId] = useState(null);
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [showCollectionModal, setShowCollectionModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingLink, setEditingLink] = useState(null);
  const [view, setView] = useState("home");
  const [loading, setLoading] = useState(true);
  const [filterTag, setFilterTag] = useState(null);
  const [filterDomain, setFilterDomain] = useState(null);
  const [filterDate, setFilterDate] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('newest');
  const [showArchived, setShowArchived] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [showBulkTagModal, setShowBulkTagModal] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
    localStorage.setItem('lv-theme', dark ? 'dark' : 'light');
  }, [dark]);

  useEffect(() => {
    async function load() {
      try {
        const [l, c] = await Promise.all([getAllLinks(), getAllCollections()]);
        setLinks(l || []);
        setCollections(c || []);
      } catch (e) {
        console.error("API Fetch Error:", e);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filteredLinks = links.filter(link => {
    const matchesSearch = (link.name || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCollection = activeCollectionId ? link.collectionId === activeCollectionId : true;
    const matchesTag = filterTag ? link.tags?.includes(filterTag) : true;
    const matchesDomain = filterDomain ? link.tags?.includes(filterDomain) : true;
    const matchesDate = (() => {
      if (!filterDate || !link.created_at) return true;
      const d = new Date(link.created_at), now = new Date();
      if (filterDate === "today") return d.toDateString() === now.toDateString();
      if (filterDate === "week") return d >= new Date(now - 7 * 86400000);
      if (filterDate === "month") return d >= new Date(now - 30 * 86400000);
      return true;
    })();
    // Only show if it's NOT archived, OR if the user explicitly turned on "showArchived"
    const isVisible = showArchived ? true : !link.archived;
    return matchesSearch && matchesCollection && matchesTag && matchesDomain && matchesDate && isVisible;
  });

  const sortedLinks = [...filteredLinks].sort((a, b) => {
    if (sortBy === 'newest') return new Date(b.created_at || 0) - new Date(a.created_at || 0);
    if (sortBy === 'oldest') return new Date(a.created_at || 0) - new Date(b.created_at || 0);
    if (sortBy === 'az') return (a.name || '').localeCompare(b.name || '');
    if (sortBy === 'za') return (b.name || '').localeCompare(a.name || '');
    return 0;
  });

  const saveLink = async (linkData, colId, notes, tags, existingId) => {
    try {
      if (existingId) {
        const updated = await updateLink(existingId, { ...linkData, collectionId: colId, notes, tags });
        setLinks(links.map(l => l.id === existingId ? updated : l));
      } else {
        const newLink = await addLink({ ...linkData, collectionId: colId, notes, tags });
        if (newLink.duplicate) { alert("Already in your vault!"); return; }
        setLinks([...links, newLink]);
      }
      setShowLinkModal(false);
      setEditingLink(null);
    } catch (e) {
      console.error(e);
      alert("Failed to save link.");
    }
  };

  const deleteLink_ = async (id) => {
    if (!window.confirm("Delete this link?")) return;
    try {
      await deleteLink(id);
      setLinks(links.filter(l => l.id !== id));
    } catch (e) {
      console.error(e);
      alert("Failed to delete.");
    }
  };

  const saveCollection = async (data) => {
    try {
      const c = await addCollection(data);
      setCollections([...collections, c]);
      setShowCollectionModal(false);
    } catch (e) {
      console.error(e);
      alert("Failed to create collection.");
    }
  };

  const deleteCollection_ = async (id) => {
    if (!window.confirm("Delete this collection?")) return;
    try {
      await deleteCollection(id);
      setCollections(collections.filter(c => c.id !== id));
    } catch (e) {
      console.error(e);
      alert("Failed to delete.");
    }
  };

  const exportData = () => {
    const blob = new Blob([JSON.stringify(links, null, 2)], { type: "application/json" });
    const a = Object.assign(document.createElement("a"), { href: URL.createObjectURL(blob), download: "linvault-export.json" });
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const goHome = () => {
    setActiveCollectionId(null);
    setSearchTerm("");
    setView("home");
  };

  const toggleSelection = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const clearSelection = () => setSelectedIds(new Set());

  const handleBulkDelete = async () => {
    if (!window.confirm(`Delete ${selectedIds.size} selected links?`)) return;
    try {
      const idsArray = Array.from(selectedIds);
      await bulkDeleteLinks(idsArray);
      setLinks(prev => prev.filter(l => !selectedIds.has(l.id)));
      clearSelection();
    } catch (e) {
      console.error(e);
      alert("Failed to delete selected links.");
    }
  };

  const handleBulkArchive = async () => {
    try {
      const idsArray = Array.from(selectedIds);
      const selectedLinks = links.filter(l => selectedIds.has(l.id));
      
      // If ALL selected links are already archived, we want to restore them (false)
      // Otherwise, we archive them (true)
      const allArchived = selectedLinks.length > 0 && selectedLinks.every(l => l.archived);
      const newArchivedState = !allArchived; 

      await bulkArchiveLinks(idsArray, newArchivedState);
      setLinks(prev => prev.map(l => selectedIds.has(l.id) ? { ...l, archived: newArchivedState } : l));
      clearSelection();
      alert(allArchived ? "Selected links restored!" : "Selected links archived.");
    } catch (e) {
      console.error(e);
      alert("Failed to update archive status.");
    }
  };

  const handleBulkTagApply = async (tag) => {
    try {
      const idsArray = Array.from(selectedIds);
      await bulkTagLinks(idsArray, tag);
      setLinks(prev => prev.map(l => {
        if (selectedIds.has(l.id)) {
          const newTags = l.tags ? [...new Set([...l.tags, tag])] : [tag];
          return { ...l, tags: newTags };
        }
        return l;
      }));
      clearSelection();
    } catch (e) {
      console.error(e);
      alert("Failed to add tag to selected links.");
    }
  };

  // ✅ FIX: Define these right before the return statement so they are in scope
  const selectedLinks = links.filter(l => selectedIds.has(l.id));
  const isArchived = selectedLinks.length > 0 && selectedLinks.every(l => l.archived);

  return (
    <div className="app-container">
      <Sidebar
        onViewChange={setView}
        onAddCollection={() => setShowCollectionModal(true)}
        onExport={exportData}
        dark={dark}
        onToggleDark={() => setDark(d => !d)}
        collections={collections}
        activeCollectionId={activeCollectionId}
        onSelectCollection={(id) => { setActiveCollectionId(id); setView("home"); }}
      />
      <div className="main-content">
        <Header 
          onAddLink={() => setShowLinkModal(true)}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          showFilters={showFilters}
          onToggleFilters={() => setShowFilters(f => !f)}
          showFilterBtn={view === "home"}
          activeCollectionId={activeCollectionId}
          collections={collections}
          onGoHome={goHome}
          sortBy={sortBy}
          onSortChange={setSortBy}
          showSortBtn={view === "home"}
        /> 
        <button 
          onClick={() => setShowArchived(!showArchived)} 
          className={`lv-btn-secondary ${showArchived ? 'active' : ''}`}
          style={{ marginLeft: '10px', opacity: showArchived ? 1 : 0.7, marginBottom: '10px' }}
        >
          {showArchived ? "Hide Archived" : "Show Archived"}
        </button>
        {view === "home" && showFilters && (
          <FilterBar 
            links={links}
            filterTag={filterTag}
            filterDomain={filterDomain}
            filterDate={filterDate}
            onFilterTag={setFilterTag}
            onFilterDomain={setFilterDomain}
            onFilterDate={setFilterDate}
            onClear={() => { setFilterTag(null); setFilterDomain(null); setFilterDate(null); }}
          />
        )}
        <div className="lv-content">
          {loading ? (
            <LoadingSkeleton />
          ) : view === "home" ? (
            <Linklist
              links={sortedLinks}
              onEditLink={(link) => { setEditingLink(link); setShowLinkModal(true); }}
              onDeleteLink={(link) => deleteLink_(link.id)}
              selectedIds={selectedIds}
              onToggleSelect={toggleSelection}
            />
          ) : (
            <CollectionsPage
              collections={collections}
              links={links}
              onSelectCollection={(id) => { setActiveCollectionId(id); setView("home"); }}
              onDeleteCollection={deleteCollection_}
            />
          )}
        </div>
      </div>
      {showLinkModal && (
        <AddLinkModal 
          onClose={() => { setShowLinkModal(false); setEditingLink(null); }}
          onAdd={saveLink}
          collections={collections}
          editingLink={editingLink}
          allTags={[...new Set(links.flatMap(l => l.tags || []))]}
        />
      )}
      {showCollectionModal && (
        <AddCollectionModal 
          onClose={() => setShowCollectionModal(false)}
          onAdd={saveCollection}
        />
      )}
      <BulkActionsBar
        selectedCount={selectedIds.size}
        onDelete={handleBulkDelete}
        onTag={() => setShowBulkTagModal(true)}
        onArchive={handleBulkArchive}
        onClearSelection={clearSelection}
        isArchived={isArchived}
      />
      {showBulkTagModal && (
        <BulkTagModal 
          isOpen={showBulkTagModal}
          onClose={() => setShowBulkTagModal(false)}
          onApply={handleBulkTagApply}
          existingTags={[...new Set(links.flatMap(l => l.tags || []))]}
        />
      )}
    </div>
  );
}