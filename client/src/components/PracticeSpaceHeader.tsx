// client/src/components/PracticeSpaceHeader.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { AIConfig } from '../types';
// FIX: Imported missing MenuIcon and XIcon components.
import { ChevronDownIcon, ChevronLeftIcon, MenuIcon, XIcon } from './Icons';
import { ViewMode } from '../types';


interface PracticeSpaceHeaderProps {
    language: 'vi' | 'en';
    t: any; // Translations object
    currentAiConfig: AIConfig | null;
    aiConfigs: AIConfig[];
    isMobileMenuOpen: boolean;
    setIsMobileMenuOpen: (isOpen: boolean) => void;
    isAiSelectorOpen: boolean;
    setIsAiSelectorOpen: (isOpen: boolean) => void;
    aiSelectorRef: React.RefObject<HTMLDivElement>;
    handleSelectAi: (ai: AIConfig) => void;
    setIsMarketplaceModalOpen: (isOpen: boolean) => void;
    setViewMode: (mode: ViewMode) => void;
    viewMode: ViewMode;
}

export const PracticeSpaceHeader: React.FC<PracticeSpaceHeaderProps> = ({
    language,
    t,
    currentAiConfig,
    aiConfigs,
    isMobileMenuOpen,
    setIsMobileMenuOpen,
    isAiSelectorOpen,
    setIsAiSelectorOpen,
    aiSelectorRef,
    handleSelectAi,
    setIsMarketplaceModalOpen,
    setViewMode,
}) => {
    return (
        <header className="chat-main-header">
            <div className="header-content-wrapper">
                <div className="header-left-group">
                    {/* HIDDEN FOR NOW: Mobile Menu Toggle */}
                    {false && (
                        <button className="mobile-menu-toggle" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                            {isMobileMenuOpen ? <XIcon className="w-6 h-6" /> : <MenuIcon className="w-6 h-6" />}
                        </button>
                    )}
                    <Link to="/" className="back-link-desktop flex items-center gap-3 text-text-light hover:text-text-main">
                        <ChevronLeftIcon className="w-6 h-6" />
                    </Link>
                </div>
                
                {/* HIDDEN FOR NOW: Center Navigation */}
                {false && (
                    <nav className={`header-center-group ${isMobileMenuOpen ? 'is-open' : ''}`}>                    
                        <button onClick={() => { setViewMode('about'); setIsMobileMenuOpen(false); }} className="header-nav-item">{t.sutra}</button>
                        <button onClick={() => { setViewMode('community'); setIsMobileMenuOpen(false); }} className="header-nav-item">{t.community}</button>
                        <button onClick={() => { setViewMode('library'); setIsMobileMenuOpen(false); }} className="header-nav-item">{t.library}</button>
                        <button onClick={() => { setIsMobileMenuOpen(false); }} className="header-nav-item opacity-50 cursor-not-allowed" title={t.comingSoon}>{t.donation}</button>
                    </nav>
                )}

                <div className="header-right-group">
                    <div ref={aiSelectorRef} className="relative">
                        {currentAiConfig ? (
                            <button onClick={() => setIsAiSelectorOpen(!isAiSelectorOpen)} aria-expanded={isAiSelectorOpen} className="ai-selector-button">
                                <img src={currentAiConfig.avatarUrl} alt={currentAiConfig.name} className="ai-selector-avatar" />
                                <span className="ai-selector-name">{language === 'en' && currentAiConfig.nameEn ? currentAiConfig.nameEn : currentAiConfig.name}</span>
                                <ChevronDownIcon className={`chevron ${isAiSelectorOpen ? 'rotate-180' : ''}`} />
                            </button>
                        ) : (
                             <div className="ai-selector-button is-loading">
                                <div className="ai-selector-avatar skeleton-placeholder" />
                                <span className="ai-selector-name skeleton-placeholder" />
                            </div>
                        )}
                        {isAiSelectorOpen && (
                            <div className="ai-selector-dropdown">
                                <p className="px-3 py-2 text-xs font-semibold text-text-light uppercase">{t.aiListTitle}</p>
                                {aiConfigs.map(ai => (
                                    <button key={ai.id} onClick={() => handleSelectAi(ai)} className={`w-full text-left flex items-center gap-3 p-2 rounded-md ${ai.id === currentAiConfig?.id ? 'bg-primary-light' : 'hover:bg-background-light'}`}>
                                        <img src={ai.avatarUrl} alt={ai.name} className="w-8 h-8 rounded-full" />
                                        <div>
                                            <p className="font-semibold text-sm">{(language === 'en' && ai.nameEn) ? ai.nameEn : ai.name}</p>
                                            <p className="text-xs text-text-light">{(language === 'en' && ai.descriptionEn) ? ai.descriptionEn : ai.description}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    <button onClick={() => setIsMarketplaceModalOpen(true)} className="marketplace-button">
                        {t.marketplace}
                    </button>
                </div>
            </div>
        </header>
    );
};