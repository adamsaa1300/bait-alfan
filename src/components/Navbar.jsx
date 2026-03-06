import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../hooks/useCart";
import { IconCart, IconSearch, IconTag, IconX } from "./Icons";
import "./Navbar.css";

const IcInstall = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
    <polyline points="7 10 12 15 17 10"/>
    <line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
);

export default function Navbar({ onSearch }) {
  const { count, setOpen } = useCart();
  const [q, setQ] = useState("");
  const [installPrompt, setInstallPrompt] = useState(null);
  const [showInstall, setShowInstall] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
      setShowInstall(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === "accepted") setShowInstall(false);
  };

  const handleSearch = (val) => { setQ(val); onSearch?.(val); };
  const clearSearch  = () => { setQ(""); onSearch?.(""); };

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-logo">بيت الفن</Link>

        <form className="navbar-search" onSubmit={e => e.preventDefault()}>
          <IconSearch size={15} color="var(--gray-400)" />
          <input type="text" placeholder="ابحثي عن منتج..." value={q} onChange={e => handleSearch(e.target.value)} />
          {q && <button type="button" className="search-clear-btn" onClick={clearSearch}><IconX size={13}/></button>}
        </form>

        <div className="navbar-actions">
          {showInstall && (
            <button className="nav-install-btn" onClick={handleInstall} title="ثبتي التطبيق">
              <IcInstall />
              <span className="nav-install-text">ثبتي التطبيق</span>
            </button>
          )}
          <Link to="/campaigns" className="nav-campaigns-btn" title="الحملات">
            <span className="nav-campaigns-icon">✦</span>
            <span className="nav-campaigns-text">الحملات</span>
          </Link>
          <Link to="/sale" className="nav-icon-btn sale-link" title="العروض"><IconTag size={18} /></Link>
          <button className="nav-icon-btn" onClick={() => setOpen(true)} title="السلة">
            <IconCart size={18} />
            {count > 0 && <span className="nav-badge nav-badge-pink">{count}</span>}
          </button>
        </div>
      </div>
    </header>
  );
}