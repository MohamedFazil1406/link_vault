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
<<<<<<< HEAD
<<<<<<< HEAD

// --- MERGED IMPORTS: Keep both Skeleton and Bulk components ---
import LoadingSkeleton from './components/Skeleton.jsx';
=======
>>>>>>> pr-21
=======
>>>>>>> pr-21
import BulkTagModal from './components/BulkTagModal.jsx';
import { BulkActionsBar } from './components/BulkActionsBar';

import {
  getAllLinks, addLink, deleteLink, updateLink,
  getAllCollections, addCollection, deleteCollection,
<<<<<<< HEAD
<<<<<<< HEAD
  bulkDeleteLinks, bulkArchiveLinks, bulkTagLinks // Bulk API functions
=======
  bulkDeleteLinks, bulkArchiveLinks, bulkTagLinks // <-- ADD THIS
>>>>>>> pr-21
=======
  bulkDeleteLinks, bulkArchiveLinks, bulkTagLinks // <-- ADD THIS
>>>>>>> pr-21
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
  
  // Filters
  const [filterTag, setFilterTag] = useState(null);
  const [filterDomain, setFilterDomain] = useState(null);
  const [filterDate, setFilterDate] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  
<<<<<<< HEAD
<<<<<<< HEAD
  // Sorting (from HEAD)
  const [sortBy, setSortBy] = useState('newest');

  // Bulk Selection State (from PR-21)
=======
  // Bulk Selection State
>>>>>>> pr-21
=======
  // Bulk Selection State
>>>>>>> pr-21
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
<<<<<<< HEAD
<<<<<<< HEAD
=======
        // NOTE: If you see the "<!doctype" error, it means your backend is returning 
        // an HTML error page (like 404/500) instead of JSON. Check your backend server!
>>>>>>> pr-21
=======
        // NOTE: If you see the "<!doctype" error, it means your backend is returning 
        // an HTML error page (like 404/500) instead of JSON. Check your backend server!
>>>>>>> pr-21
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // 1. Filter links
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
    return matchesSearch && matchesCollection && matchesTag && matchesDomain && matchesDate;
  });

  // 2. Sort filtered links (from HEAD)
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

<<<<<<< HEAD
<<<<<<< HEAD
  // --- Bulk Action Handlers ---
=======
    // --- Bulk Action Handlers ---
>>>>>>> pr-21
=======
    // --- Bulk Action Handlers ---
>>>>>>> pr-21
  const toggleSelection = (id) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const clearSelection = () => setSelectedIds(new Set());

<<<<<<< HEAD
<<<<<<< HEAD
=======
  // bulk delete
>>>>>>> pr-21
=======
  // bulk delete
>>>>>>> pr-21
  const handleBulkDelete = async () => {
    if (!window.confirm(`Delete ${selectedIds.size} selected links?`)) return;
    try {
      const idsArray = Array.from(selectedIds);
      await bulkDeleteLinks(idsArray);
<<<<<<< HEAD
<<<<<<< HEAD
=======
      
      // Update local state instantly
>>>>>>> pr-21
=======
      
      // Update local state instantly
>>>>>>> pr-21
      setLinks(prev => prev.filter(l => !selectedIds.has(l.id)));
      clearSelection();
    } catch (e) {
      console.error(e);
      alert("Failed to delete selected links.");
    }
  };

<<<<<<< HEAD
<<<<<<< HEAD
=======
  // bulk archive
>>>>>>> pr-21
=======
  // bulk archive
>>>>>>> pr-21
  const handleBulkArchive = async () => {
    try {
      const idsArray = Array.from(selectedIds);
      await bulkArchiveLinks(idsArray, true);
<<<<<<< HEAD
<<<<<<< HEAD
=======
      
      // Update local state instantly
>>>>>>> pr-21
=======
      
      // Update local state instantly
>>>>>>> pr-21
      setLinks(prev => prev.map(l => selectedIds.has(l.id) ? { ...l, archived: true } : l));
      clearSelection();
      alert("Selected links archived.");
    } catch (e) {
      console.error(e);
      alert("Failed to archive selected links.");
    }
  };

<<<<<<< HEAD
<<<<<<< HEAD
=======
  // bulk tag apply
>>>>>>> pr-21
=======
  // bulk tag apply
>>>>>>> pr-21
  const handleBulkTagApply = async (tag) => {
    try {
      const idsArray = Array.from(selectedIds);
      await bulkTagLinks(idsArray, tag);
<<<<<<< HEAD
<<<<<<< HEAD
=======
      
      // Update local state instantly (add tag to existing tags, avoid duplicates)
>>>>>>> pr-21
=======
      
      // Update local state instantly (add tag to existing tags, avoid duplicates)
>>>>>>> pr-21
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
<<<<<<< HEAD
<<<<<<< HEAD
          // --- MERGED: Keep sorting props from HEAD ---
          sortBy={sortBy}
          onSortChange={setSortBy}
          showSortBtn={view === "home"}
=======
>>>>>>> pr-21
=======
>>>>>>> pr-21
        /> 

        {view === "home" && showFilters && (
          <FilterBar 
<<<<<<< HEAD
<<<<<<< HEAD
            links={links}
=======
            links={links} /* <-- THIS FIXES THE flatMap ERROR */
>>>>>>> pr-21
=======
            links={links} /* <-- THIS FIXES THE flatMap ERROR */
>>>>>>> pr-21
            filterTag={filterTag}
            filterDomain={filterDomain}
            filterDate={filterDate}
            onFilterTag={setFilterTag}
            onFilterDomain={setFilterDomain}
            onFilterDate={setFilterDate}
            onClear={() => { setFilterTag(null); setFilterDomain(null); setFilterDate(null); }}
          />
        )}

<<<<<<< HEAD
<<<<<<< HEAD
        {/* --- MERGED: Use LoadingSkeleton from HEAD, but add bulk props from PR-21 --- */}
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
=======
=======
>>>>>>> pr-21
        {loading ? (
          <div className="lv-empty"><p>Loading...</p></div>
        ) : view === "home" ? (
          <Linklist 
            links={filteredLinks}
            onEditLink={(link) => { setEditingLink(link); setShowLinkModal(true); }}
            onDeleteLink={(link) => deleteLink_(link.id)}
            selectedIds={selectedIds}
            onToggleSelect={toggleSelection}
          />
        ) : (
          <CollectionsPage 
            collections={collections}
            onSelectCollection={(id) => { setActiveCollectionId(id); setView("home"); }}
            onDeleteCollection={deleteCollection_}
          />
        )}
<<<<<<< HEAD
>>>>>>> pr-21
=======
>>>>>>> pr-21
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

<<<<<<< HEAD
<<<<<<< HEAD
      {/* --- Bulk Actions UI --- */}
=======
>>>>>>> pr-21
=======
>>>>>>> pr-21
      <BulkActionsBar
        selectedCount={selectedIds.size}
        onDelete={handleBulkDelete}
        onTag={() => setShowBulkTagModal(true)}
        onArchive={handleBulkArchive}
        onClearSelection={clearSelection}
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