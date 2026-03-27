import { useState, useEffect } from "react";
import './App.css'
// components import
import Header from './components/Header.jsx'
import FilterBar from './components/FilterBar.jsx';
import Sidebar from './components/sidebar.jsx'
import Linklist from './components/linklist.jsx'
import CollectionsPage from './components/collectionPage.jsx'
import AddLinkModal from './components/addlinkbtn.jsx'
import AddCollectionModal from './components/addcollectionbtn.jsx'  // FIX: was "AddCollectionModel" (wrong name, never matched the JSX usage)
import ShareTarget from './components/ShareTarget.jsx'
// api import
import { 
  getAllLinks, 
  addLink, 
  deleteLink, 
  updateLink,
  getAllCollections,
  addCollection,
  deleteCollection,
} from "./api.js";  // FIX: removed unused "updateCollection" import (ESLint error)

export default function App() {
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
  const [filterDate, setFilterDate] = useState(null); // "today" | "week" | "month" | null
  const [showFilters, setShowFilters] = useState(false);

  // Handle incoming shares from Android share sheet
  const handleIncomingShare = ({ url, name }) => {
    setEditingLink({ url, name, id: null });
    setShowLinkModal(true);
    // Clean the URL so refreshing doesn't re-trigger the share
    window.history.replaceState({}, "", "/");
  };

  // Load data from backend on mount
  useEffect(() => {
    async function loadData() {
      try {
        const [fetchedLinks, fetchedCollections] = await Promise.all([
          getAllLinks(),
          getAllCollections()
        ]);
        setLinks(fetchedLinks || []);
        setCollections(fetchedCollections || []);
      } catch (err) {
        console.error("Server is down!", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  // FIX: search now checks "name" not "title" — matches what the backend stores
  const filteredLinks = links.filter(link => {
  const nameToCheck = link.name || "";

  const matchesSearch = nameToCheck.toLowerCase().includes(searchTerm.toLowerCase());

  const matchesCollection = activeCollectionId
    ? link.collectionId === activeCollectionId
    : true;

  const matchesTag = filterTag
    ? link.tags?.includes(filterTag)
    : true;

  const matchesDomain = filterDomain
    ? link.tags?.includes(filterDomain)
    : true;

  const matchesDate = (() => {
    if (!filterDate || !link.created_at) return true;
    const linkDate = new Date(link.created_at);
    const now = new Date();
    if (filterDate === "today") {
      return linkDate.toDateString() === now.toDateString();
    }
    if (filterDate === "week") {
      const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
      return linkDate >= weekAgo;
    }
    if (filterDate === "month") {
      const monthAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);
      return linkDate >= monthAgo;
    }
    return true;
  })();

  return matchesSearch && matchesCollection && matchesTag && matchesDomain && matchesDate;
  });

  const addOrUpdateLinkHandler = async (linkData, colId, notes, tags, existingId) => {
  try {
    if (existingId) {
      const updated = await updateLink(existingId, { ...linkData, collectionId: colId, notes, tags });
      setLinks(links.map(l => l.id === existingId ? updated : l));
    } else {
      const newLink = await addLink({ ...linkData, collectionId: colId, notes, tags });
      setLinks([...links, newLink]);
    }
    setShowLinkModal(false);
    setEditingLink(null);
  } catch (err) {
    alert("Failed to save link. Is the server running?");
  }
  };

  const deleteLinkHandler = async (id) => {
    if (window.confirm("Are you sure you want to delete this link?")) {
      try {
        await deleteLink(id);
        setLinks(links.filter(l => l.id !== id));
      } catch (err) {
        alert("Failed to delete link. Is the server running?");
      }
    }
  };

  const addCollectionHandler = async (collectionData) => {
    try {
      const newCollection = await addCollection(collectionData);
      setCollections([...collections, newCollection]);
      setShowCollectionModal(false);
    } catch (err) {
      console.error("Failed to add collection", err);
      alert("Could not add collection. Is the server running?");
    }
  };

  // FIX: these two handlers were used in JSX but never defined — caused a crash on collections view
  const deleteCollectionHandler = async (id) => {
    if (window.confirm("Delete this collection?")) {
      try {
        await deleteCollection(id);
        setCollections(collections.filter(c => c.id !== id));
      } catch (err) {
        alert("Failed to delete collection. Is the server running?");
      }
    }
  };

  const editCollectionHandler = async (id, newName) => {
    console.log("Edit collection", id, newName);
  };

  const exportHandler = () => {
    const dataStr = JSON.stringify(links, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "link-vault-export.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="ls-app">
      {/* Handles /share-target?url=... from Android share sheet */}
      {window.location.pathname === "/share-target" && (
        <ShareTarget onShare={handleIncomingShare} />
      )}
      <Sidebar
        onGoHome={() => {
          setActiveCollectionId(null);
          setSearchTerm("");
          setView("home");
        }}
        onGoCollections={() => setView("collections")}  // FIX: sidebar "Collections" item now navigates correctly
        onAddCollection={() => setShowCollectionModal(true)}
        onSelectCollection={(id) => {
          setActiveCollectionId(id);
          setView("home");
        }}
        onExport={exportHandler}
      />

      <div className="ls-main">
        <Header
            onAddLink={() => setShowLinkModal(true)}
            onExport={exportHandler}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            showFilters={showFilters}
            onToggleFilters={() => setShowFilters(f => !f)}
            showFilterBtn={view === "home"}
          />

          {view === "home" && showFilters && (
            <FilterBar
              links={links}
              filterTag={filterTag}
              filterDomain={filterDomain}
              filterDate={filterDate}
              onFilterTag={setFilterTag}
              onFilterDomain={setFilterDomain}
              onFilterDate={setFilterDate}
              onClear={() => {
                setFilterTag(null);
                setFilterDomain(null);
                setFilterDate(null);
              }}
            />
          )}

        {loading ? (
          <div className="ls-loading-container">
            <div className="ls-spinner"></div>
          </div>
        ) : (
          <div className="ls-content">
            {view === "home" && (
              <Linklist
                links={filteredLinks}
                onEditLink={(link) => {
                  setEditingLink(link);
                  setShowLinkModal(true);
                }}
                onDeleteLink={(link) => deleteLinkHandler(link.id)}  // FIX: linklist passes the full link object, not just id
              />
            )}

            {view === "collections" && (  // FIX: removed redundant "!loading &&" check (already inside the else branch)
              <CollectionsPage
                collections={collections}
                links={links}
                onSelectCollection={(id) => { setActiveCollectionId(id); setView("home"); }}
                onDeleteCollection={deleteCollectionHandler}
                onEditCollection={editCollectionHandler}
              />
            )}
          </div>
        )}
      </div>

      {showLinkModal && (
        <AddLinkModal
        onClose={() => {
          setShowLinkModal(false);
          setEditingLink(null);
        }}
        onAdd={addOrUpdateLinkHandler}
        collections={collections}
        editingLink={editingLink}
        allTags={[...new Set(links.flatMap(l => l.tags || []))]}
      />
      )}

      {showCollectionModal && (
        <AddCollectionModal   // FIX: was "AddCollectionModal" in JSX but imported as "AddCollectionModel" — now both match
          onClose={() => setShowCollectionModal(false)}
          onAdd={addCollectionHandler}
        />
      )}
    </div>
  );
}
