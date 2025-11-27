
// client/src/layouts/DocsLayout.tsx
import { useState } from "react";
import { Link, Outlet } from "react-router-dom";
import { DocsNav } from "@/components/DocsNav";
import { TracingBeam } from "@/components/TracingBeam";
import { DownloadIcon, ShareIcon, Menu } from "lucide-react";

interface DocsLayoutProps {
  language: 'vi' | 'en';
  setLanguage: (lang: 'vi' | 'en') => void;
}

export function DocsLayout({ language, setLanguage }: DocsLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="docs-layout-wrapper docs-layout-container">
        <header className="header">
            <div className="header-content">
            <div className="header-left">
                <button className="menu-btn" onClick={() => setSidebarOpen(true)} aria-label="Toggle menu">
                    <Menu className="w-5 h-5" />
                </button>
                <Link to="/" className="logo-container" style={{ textDecoration: 'none' }}>
                    <img 
                        src="https://app.giac.ngo/uploads/trainingFiles-1760925528911-497608075.png" 
                        alt="Giác Ngộ Logo" 
                        className="logo-image"
                    />
                    <h1 className="header-title">
                        {language === 'vi' 
                            ? "Mạng xã hội Tác tử cho sự Tỉnh thức Chung" 
                            : "An Agentic Social Network for Collective Awakening"}
                    </h1>
                </Link>
            </div>
            <div className="header-actions">
                <button className="btn">
                    <DownloadIcon className="w-4 h-4" />
                    <span>{language === 'vi' ? 'Xuất PDF' : 'Export PDF'}</span>
                </button>
                <button className="btn btn-primary">
                    <ShareIcon className="w-4 h-4" />
                    <span>{language === 'vi' ? 'Chia sẻ' : 'Share'}</span>
                </button>
            </div>
            </div>
        </header>

        <div className="overlay" id="overlay" onClick={() => setSidebarOpen(false)} style={{display: sidebarOpen ? 'block' : 'none'}}></div>
        
        <div className="layout">
            <aside className={`sidebar ${sidebarOpen ? 'open' : ''}`} id="sidebar">
                <DocsNav 
                    onLinkClick={() => setSidebarOpen(false)} 
                    language={language}
                    setLanguage={setLanguage}
                />
            </aside>
            <main className="main-content">
                <TracingBeam>
                    <div className="content-wrapper">
                        <Outlet context={{ language }} />
                    </div>
                </TracingBeam>
            </main>
        </div>
    </div>
  );
}
