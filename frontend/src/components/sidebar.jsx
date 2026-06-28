import { useState } from 'react';
import './CSS/sidebar.css';

const HomeIcon = () => (
  <svg viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0h6" /></svg>
);
const CollectionsIcon = () => (
  <svg viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>
);
const PlusIcon = () => (
  <svg viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
);
const ExportIcon = () => (
  <svg viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M8 12l4 4 4-4M12 4v12" /></svg>
);
const MoonIcon = () => (
  <svg viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" /></svg>
);

export default function Sidebar({
  onGoHome, onGoCollections, onAddCollection, onExport,
  dark, onToggleDark, collections = [], activeCollectionId, onSelectCollection
}) {
  const [view, setView] = useState('home');

  const goHome = () => { setView('home'); onGoHome(); };
  const goCollections = () => { setView('collections'); onGoCollections(); };

  return (
    <div className="sidebar">
      {/* Logo */}
      <div className="sidebar-logo">
        <div className="sidebar-logo-mark">LV</div>
        <span className="sidebar-logo-name">LinVault</span>
      </div>

      {/* Nav */}
      <div className={`dock-item ${view === 'home' ? 'active' : ''}`} onClick={goHome}>
        <span className="dock-icon"><HomeIcon /></span>
        <span className="dock-label">Home</span>
      </div>

      <div className={`dock-item ${view === 'collections' ? 'active' : ''}`} onClick={goCollections}>
        <span className="dock-icon"><CollectionsIcon /></span>
        <span className="dock-label">Collections</span>
      </div>

      <div className="dock-item dock-add" onClick={onAddCollection}>
        <span className="dock-icon"><PlusIcon /></span>
        <span className="dock-label">New Collection</span>
      </div>

      <div className="sidebar-divider" />

      <div className="dock-item" onClick={onExport}>
        <span className="dock-icon"><ExportIcon /></span>
        <span className="dock-label">Export</span>
      </div>

      {/* Bottom */}
      <div className="sidebar-bottom">
        <div className="dark-toggle" onClick={onToggleDark}>
          <div className="dock-icon"><MoonIcon /></div>
          <div className={`dark-toggle-track ${dark ? 'on' : ''}`}>
            <div className="dark-toggle-thumb" />
          </div>
        </div>
      </div>
    </div>
  );
}
