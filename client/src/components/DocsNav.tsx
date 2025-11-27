// client/src/components/DocsNav.tsx
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ChevronDown, BookOpen, Coins, Server, Bot } from "lucide-react";

interface NavItem {
  id: string;
  title: string;
  icon: React.ReactNode;
  children: { id: string; title: string; href: string }[];
}

interface DocsNavProps {
  onLinkClick?: () => void;
  language: 'vi' | 'en';
  setLanguage: (lang: 'vi' | 'en') => void;
}

const translations = {
    vi: {
        searchPlaceholder: "Tìm kiếm tài liệu...",
        manifesto: {
            title: "Tuyên ngôn",
            children: [
                { title: "Tóm tắt", href: "/docs/manifesto#abstract" },
                { title: "1. Căn bệnh thời đại số", href: "/docs/manifesto#section-1" },
                { title: "2. Công đức & Phước đức", href: "/docs/manifesto#section-2" },
                { title: "3. Bối cảnh hiện tại", href: "/docs/manifesto#section-3" },
                { title: "4. Kiến trúc Công nghệ", href: "/docs/manifesto#section-4" },
                { title: "5. Kinh tế học Thiêng liêng", href: "/docs/manifesto#section-5" },
                { title: "6. Lộ trình", href: "/docs/manifesto#section-6" },
                { title: "7. Kết luận", href: "/docs/manifesto#section-7" },
            ]
        },
        economy: {
            title: "Kinh tế Công đức",
            children: [
                { title: "Mandala Công đức", href: "/docs/mandala-merit" },
                { title: "Tokenomics", href: "/docs/merit-tokenomics" },
                { title: "Con đường Tháo gỡ", href: "/docs/path-of-unraveling" },
            ]
        },
        tech: {
            title: "Công nghệ",
            children: [
                { title: "Tầm nhìn & Sứ mệnh", href: "/docs/tech-stack#vision" },
                { title: "Tính toán Tập thể", href: "/docs/tech-stack#compute" },
                { title: "Sổ cái Mandala", href: "/docs/tech-stack#ledger" },
                { title: "Giao thức Công đức", href: "/docs/tech-stack#protocol" },
                { title: "Các thành phần cơ bản", href: "/docs/tech-stack#primitives" },
                { title: "Quyền riêng tư", href: "/docs/tech-stack#privacy" },
            ]
        },
        agents: {
            title: "AI Agents",
            children: [
                { title: "Tổng quan", href: "/docs/overview" },
                { title: "Các mô hình Agent", href: "/docs/models" },
                { title: "Bắt đầu nhanh", href: "/docs/quick-start" },
                { title: "Bảng giá Token", href: "/docs/pricing" },
                { title: "Tải tài liệu", href: "/docs/download" },
            ]
        },
        version: "Phiên bản",
        language: "Ngôn ngữ"
    },
    en: {
        searchPlaceholder: "Search documentation...",
        manifesto: {
            title: "The Manifesto",
            children: [
                { title: "Abstract", href: "/docs/manifesto#abstract" },
                { title: "1. The Sickness of the Digital Age", href: "/docs/manifesto#section-1" },
                { title: "2. Merit vs. Worldly Blessing", href: "/docs/manifesto#section-2" },
                { title: "3. Prior Landscape", href: "/docs/manifesto#section-3" },
                { title: "4. Architecture of Awakened Technology", href: "/docs/manifesto#section-4" },
                { title: "5. Sacred Economics", href: "/docs/manifesto#section-5" },
                { title: "6. Roadmap", href: "/docs/manifesto#section-6" },
                { title: "7. Conclusion & Epilogue", href: "/docs/manifesto#section-7" },
            ]
        },
        economy: {
            title: "Merit Economy",
            children: [
                { title: "The Mandala of Merit", href: "/docs/mandala-merit" },
                { title: "Merit Tokenomics", href: "/docs/merit-tokenomics" },
                { title: "Path of Unraveling", href: "/docs/path-of-unraveling" },
            ]
        },
        tech: {
            title: "Tech Stack",
            children: [
                { title: "Vision & Mission", href: "/docs/tech-stack#vision" },
                { title: "Collective Compute Mandala", href: "/docs/tech-stack#compute" },
                { title: "The Mandala Ledger", href: "/docs/tech-stack#ledger" },
                { title: "Merit Attribution Protocol", href: "/docs/tech-stack#protocol" },
                { title: "Universal Primitives", href: "/docs/tech-stack#primitives" },
                { title: "Privacy by Dharma", href: "/docs/tech-stack#privacy" },
            ]
        },
        agents: {
            title: "Agents",
            children: [
                { title: "Overview", href: "/docs/overview" },
                { title: "Agent Models", href: "/docs/models" },
                { title: "Quick Start", href: "/docs/quick-start" },
                { title: "Token Pricing", href: "/docs/pricing" },
                { title: "Download Documentation", href: "/docs/download" },
            ]
        },
        version: "Version",
        language: "Language"
    }
};

export function DocsNav({ onLinkClick, language }: DocsNavProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(["the-manifesto", "agents"])
  );
  
  const t = translations[language];

  const navigation: NavItem[] = [
    {
      id: "the-manifesto",
      title: t.manifesto.title,
      icon: <BookOpen className="nav-icon" />,
      children: t.manifesto.children.map((child, index) => ({
          id: `manifesto-${index}`,
          title: child.title,
          href: child.href
      }))
    },
    {
      id: "merit-economy",
      title: t.economy.title,
      icon: <Coins className="nav-icon" />,
      children: t.economy.children.map((child, index) => ({
          id: `economy-${index}`,
          title: child.title,
          href: child.href
      }))
    },
    {
      id: "tech-stack",
      title: t.tech.title,
      icon: <Server className="nav-icon" />,
      children: t.tech.children.map((child, index) => ({
          id: `tech-${index}`,
          title: child.title,
          href: child.href
      }))
    },
    {
      id: "agents",
      title: t.agents.title,
      icon: <Bot className="nav-icon" />,
      children: t.agents.children.map((child, index) => ({
          id: `agents-${index}`,
          title: child.title,
          href: child.href
      }))
    },
  ];

  const toggleSection = (id: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const isActive = (href: string) => {
    const currentPath = location.pathname;
    const currentHash = location.hash;
    const [linkPath, linkHash] = href.split('#');

    // Base path must match
    if (currentPath !== linkPath) return false;

    // If the link has a hash (e.g., #abstract)
    if (linkHash) {
        // If current URL also has a hash, they must match exactly
        if (currentHash) return currentHash === `#${linkHash}`;
        
        // If current URL has NO hash (just loaded the page), 
        // highlight the first section/abstract if it's the default view
        if (!currentHash && linkHash === 'abstract') return true;
        if (!currentHash && linkHash === 'vision') return true;
        
        return false;
    }

    // If link has no hash, exact match (and ensure no hash is active on current URL)
    return !currentHash;
  };

  const handleNavClick = (href: string) => {
    navigate(href);
    onLinkClick?.();
  };

  const filteredNavigation = navigation
    .map((section) => ({
      ...section,
      children: section.children.filter((child) =>
        child.title.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    }))
    .filter((section) => section.children.length > 0 || !searchQuery);

  return (
    <>
      {/* Search */}
      <div className="sidebar-search">
        <input
          type="text"
          className="search-input"
          placeholder={t.searchPlaceholder}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Navigation */}
      <nav>
        {filteredNavigation.map((section) => (
          <div
            key={section.id}
            className={`nav-section ${expandedSections.has(section.id) ? "expanded" : ""}`}
          >
            <div
              className="nav-section-header"
              onClick={() => toggleSection(section.id)}
            >
              <div className="nav-section-header-left">
                {section.icon}
                <span>{section.title}</span>
              </div>
              <ChevronDown className="chevron" />
            </div>
            <div className="nav-children">
              {section.children.map((child) => (
                <button
                  key={child.id}
                  onClick={() => handleNavClick(child.href)}
                  className={`nav-link ${isActive(child.href) ? "active" : ""}`}
                >
                  {child.title}
                </button>
              ))}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer & Language Toggle */}
      <div className="sidebar-footer">
        <div className="flex items-center justify-between mb-4">
             <strong>{t.version} 2025.1</strong>            
        </div>
      </div>
    </>
  );
}