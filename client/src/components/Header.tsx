// client/src/components/Header.tsx

import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { User, SystemConfig } from '../types';
import { LoginIcon, SettingsIcon, LogoutIcon, ChevronDownIcon, FacebookIcon, InstagramIcon,  MenuIcon, XIcon, UserIcon, ThreadsIcon } from '../components/Icons';

interface HeaderProps {
    user: User | null;
    systemConfig: SystemConfig;
    language: 'vi' | 'en';
    setLanguage: (lang: 'vi' | 'en') => void;
    onLogout: () => void;
}

const translations = {
    vi: {
        ai: 'AI',
        space: 'Không gian',
        radio: 'Pháp thoại',
        library: 'Thư viện',
        price: 'Cúng dường tùy tâm',
        login: 'Đăng nhập',
        logout: 'Đăng xuất',
        practiceSpace: 'Không gian thực hành',
        adminPanel: 'Bảng quản trị',
        organization: 'Tổ chức',
        about: 'Giới thiệu',
        contact: 'Liên hệ',
        career: 'Tuyển dụng',
        terms: 'Điều khoản',
        privacy: 'Bảo mật',
        donation: 'Quyên góp',
        docs: 'Tài liệu',
        myAccount: 'Tài khoản của tôi',
    },
    en: {
        ai: 'AI',
        space: 'Space',
        radio: 'Dharma radio',
        library: 'Library',
        price: 'Donation',
        login: 'Login',
        logout: 'Logout',
        practiceSpace: 'Practice Space',
        adminPanel: 'Admin Panel',
        organization: 'Organization',
        about: 'About',
        contact: 'Contact',
        career: 'Career',
        terms: 'Terms',
        privacy: 'Privacy',
        donation: 'Donation',
        docs: 'Docs',
        myAccount: 'My Account',
    }
};

export const Header: React.FC<HeaderProps> = ({ user, systemConfig, language, setLanguage, onLogout }) => {
    const t = translations[language];
    const location = useLocation();
    const currentTheme = user?.template || systemConfig.template;
    const logoUrl = systemConfig.templateSettings[currentTheme].logoUrl;
    const hasAdminPermission = user?.permissions?.some(p => p !== 'user-billing');

    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isOrgSubMenuOpen, setIsOrgSubMenuOpen] = useState(false);

    const dropdownRef = useRef<HTMLDivElement>(null);
    const userMenuRef = useRef<HTMLDivElement>(null);
    const logoTimeoutRef = useRef<number | null>(null);
    const userMenuTimeoutRef = useRef<number | null>(null);
    
    useEffect(() => {
        if(isMobileMenuOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
        return () => {
            document.body.style.overflow = 'auto';
        }
    }, [isMobileMenuOpen]);

    const handleLogoEnter = () => {
        if (logoTimeoutRef.current) clearTimeout(logoTimeoutRef.current);
        setIsDropdownOpen(true);
    };
    const handleLogoLeave = () => {
        logoTimeoutRef.current = window.setTimeout(() => {
            setIsDropdownOpen(false);
        }, 300);
    };

    const handleUserMenuEnter = () => {
        if (userMenuTimeoutRef.current) clearTimeout(userMenuTimeoutRef.current);
        setIsUserMenuOpen(true);
    };
    const handleUserMenuLeave = () => {
        userMenuTimeoutRef.current = window.setTimeout(() => {
            setIsUserMenuOpen(false);
        }, 300);
    };
    
    const handleScrollClick = (event: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
        event.preventDefault();
        const element = document.getElementById(targetId);
        if (element) {
            element.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    };

    const handleMobileNavLinkClick = (href: string) => {
        setIsMobileMenuOpen(false);
        const element = document.getElementById(href.substring(1)); // remove #
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
        }
    }

    return (
        <header className="main-header">
            <div className="container">
                {/* Desktop View */}
                <div className="hidden lg:flex w-full justify-between items-center">
                    <div 
                        className="logo-container" 
                        ref={dropdownRef}
                        onMouseEnter={handleLogoEnter}
                        onMouseLeave={handleLogoLeave}
                    >
                        <Link to="/" className="logo-link">
                            <img src={logoUrl} alt="Logo" className="logo" />
                        </Link>
                        <button className="logo-toggle-button" tabIndex={-1}>
                            <ChevronDownIcon className="w-5 h-5" />
                        </button>
                        {isDropdownOpen && (
                            <div className="logo-dropdown">
                                <h3 className="logo-dropdown-title">{t.organization}</h3>
                                <ul>
                                    <li><Link to="/about" onClick={() => setIsDropdownOpen(false)}>{t.about}</Link></li>
                                    <li><Link to="/contact" onClick={() => setIsDropdownOpen(false)}>{t.contact}</Link></li>
                                    <li><Link to="/career" onClick={() => setIsDropdownOpen(false)}>{t.career}</Link></li>
                                    <li><Link to="/terms" onClick={() => setIsDropdownOpen(false)}>{t.terms}</Link></li>
                                    <li><Link to="/privacy" onClick={() => setIsDropdownOpen(false)}>{t.privacy}</Link></li>
                                    <li><Link to="/donation" onClick={() => setIsDropdownOpen(false)}>{t.donation}</Link></li>
                                    <li><a href="https://docs.giac.ngo/docs/manifesto" onClick={() => setIsDropdownOpen(false)}>{t.docs}</a></li>
                                </ul>
                                <hr />
                                <div className="logo-dropdown-socials">
                                    <a href="https://www.facebook.com/people/Giac-Ngo/61579805139150/" target="_blank" rel="noopener noreferrer"><FacebookIcon className="w-6 h-6" /></a>
                                    <a href="https://www.instagram.com/giacngo000/" target="_blank" rel="noopener noreferrer"><InstagramIcon className="w-6 h-6" /></a>
                                    <a href="https://www.threads.com/@giacngo000" target="_blank" rel="noopener noreferrer"><ThreadsIcon className="w-6 h-6" /></a>
                                </div>
                            </div>
                        )}
                    </div>
                    <nav className="main-nav">
                        <a href="#agents-section" onClick={(e) => handleScrollClick(e, 'agents-section')}>{t.ai}</a>
                        {/* <a href="#community-section" onClick={(e) => handleScrollClick(e, 'community-section')}>{t.space}</a> */}
                        <a href="#library-section" onClick={(e) => handleScrollClick(e, 'library-section')}>{t.library}</a>
                        <a href="#dharma-radio-section" onClick={(e) => handleScrollClick(e, 'dharma-radio-section')}>{t.radio}</a>
                        <a href="#pricing-section" onClick={(e) => handleScrollClick(e, 'pricing-section')}>{t.price}</a>
                    </nav>
                    <div className="header-actions">
                         <div className="user-menu-language-switcher">
                                            <div className="user-menu-language-switcher-pill">
                                                <button onClick={() => setLanguage('vi')} className={language === 'vi' ? 'active' : ''}>VIE</button>
                                                <button onClick={() => setLanguage('en')} className={language === 'en' ? 'active' : ''}>ENG</button>
                                            </div>
                                        </div>
                        {user ? (
                            <div 
                                className="relative" 
                                ref={userMenuRef}
                                onMouseEnter={handleUserMenuEnter}
                                onMouseLeave={handleUserMenuLeave}
                            >
                                <Link to="/giac-ngo/chat" title={t.practiceSpace}>
                                    <img src={user.avatarUrl} alt={user.name} className="w-8 h-8 rounded-full ring-2 ring-offset-2 ring-transparent hover:ring-primary transition-all" />
                                </Link>

                                {isUserMenuOpen && (
                                    <div className="user-menu-dropdown">
                                        <div className="user-menu-header">
                                            <p className="font-semibold">{user.name}</p>
                                            <p className="text-sm text-text-light">{user.email}</p>
                                        </div>
                                        <hr/>
                                        <Link to="/giac-ngo/chat" className="user-menu-item"><UserIcon className="w-5 h-5"/><span>{t.practiceSpace}</span></Link>
                                        {hasAdminPermission && (
                                            <Link to="/giac-ngo/admin" className="user-menu-item">
                                                <SettingsIcon className="w-5 h-5"/>
                                                <span>{t.adminPanel}</span>
                                            </Link>
                                        )}                                    
                                        <button onClick={onLogout} className="user-menu-item logout">
                                            <LogoutIcon className="w-5 h-5"/>
                                            <span>{t.logout}</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center gap-4">
                                <Link to="/login" state={{ from: location }} title={t.login} className="p-2 rounded-full hover:bg-background-light">
                                    <LoginIcon className="w-6 h-6 text-text-light hover:text-primary"/>
                                </Link>
                            </div>
                        )}
                    </div>
                </div>

                {/* Mobile View */}
                <div className="flex lg:hidden w-full justify-between items-center">
                    <Link to="/" className="logo-link">
                        <img src={logoUrl} alt="Logo" className="logo h-8" />
                    </Link>
                    <button onClick={() => setIsMobileMenuOpen(true)} className="p-2">
                        <MenuIcon className="w-6 h-6" />
                    </button>
                </div>
            </div>

            {/* Mobile Nav Panel */}
            <div className={`mobile-nav-panel ${isMobileMenuOpen ? 'is-open' : ''}`}>
                <div className="flex justify-end p-4">
                    <button onClick={() => setIsMobileMenuOpen(false)}><XIcon className="w-6 h-6" /></button>
                </div>
                <div className="flex-grow overflow-y-auto px-6 pb-6">
                    {user && (
                        <>
                            <div className="mobile-nav-user-info">
                                <img src={user.avatarUrl} alt={user.name} className="w-14 h-14 rounded-full" />
                                <div>
                                    <p className="font-bold text-lg">{user.name}</p>
                                    <p className="text-sm text-text-light">{user.email}</p>
                                </div>
                            </div>
                            <div className="mobile-nav-section-divider"></div>
                            <div className="mobile-nav-section">
                                <Link to="/giac-ngo/chat" onClick={() => setIsMobileMenuOpen(false)} className="mobile-nav-link"><UserIcon className="w-5 h-5" /><span>{t.practiceSpace}</span></Link>
                                {hasAdminPermission && <Link to="/giac-ngo/admin" onClick={() => setIsMobileMenuOpen(false)} className="mobile-nav-link"><SettingsIcon className="w-5 h-5" /><span>{t.adminPanel}</span></Link>}
                            </div>
                        </>
                    )}

                    {!user && (
                        <div className="mobile-nav-section">
                             <Link to="/login" state={{ from: location }} onClick={() => setIsMobileMenuOpen(false)} className="mobile-nav-link"><LoginIcon className="w-5 h-5" /><span>{t.login}</span></Link>
                        </div>
                    )}
                    
                    <div className="mobile-nav-section-divider"></div>
                    
                    <nav className="mobile-nav-section">
                           <div>
                            <button onClick={() => setIsOrgSubMenuOpen(!isOrgSubMenuOpen)} className="mobile-nav-link w-full justify-between">
                                {t.organization}
                                <ChevronDownIcon className={`w-5 h-5 transition-transform ${isOrgSubMenuOpen ? 'rotate-180' : ''}`} />
                            </button>
                            {isOrgSubMenuOpen && (
                                <div className="pl-6 pt-2 space-y-1">
                                    <Link to="/about" onClick={() => setIsMobileMenuOpen(false)} className="mobile-nav-sublink">{t.about}</Link>
                                    <Link to="/contact" onClick={() => setIsMobileMenuOpen(false)} className="mobile-nav-sublink">{t.contact}</Link>
                                    <Link to="/career" onClick={() => setIsMobileMenuOpen(false)} className="mobile-nav-sublink">{t.career}</Link>
                                    <Link to="/terms" onClick={() => setIsMobileMenuOpen(false)} className="mobile-nav-sublink">{t.terms}</Link>
                                    <Link to="/privacy" onClick={() => setIsMobileMenuOpen(false)} className="mobile-nav-sublink">{t.privacy}</Link>
                                    <Link to="/donation" onClick={() => setIsMobileMenuOpen(false)} className="mobile-nav-sublink">{t.donation}</Link>
                                    <a href="https://buddhist-agentic-network-bankericc.replit.app/docs/quick-start" onClick={() => setIsMobileMenuOpen(false)} className="mobile-nav-sublink">{t.docs}</a>
                                </div>
                            )}
                        </div>
                        <a href="#agents-section" onClick={(e) => { e.preventDefault(); handleMobileNavLinkClick('#agents-section'); }} className="mobile-nav-link">{t.ai}</a>
                        {/* <a href="#community-section" onClick={(e) => { e.preventDefault(); handleMobileNavLinkClick('#community-section'); }} className="mobile-nav-link">{t.space}</a> */}
                        <a href="#library-section" onClick={(e) => { e.preventDefault(); handleMobileNavLinkClick('#library-section'); }} className="mobile-nav-link">{t.library}</a>
                        <a href="#dharma-radio-section" onClick={(e) => { e.preventDefault(); handleMobileNavLinkClick('#dharma-radio-section'); }} className="mobile-nav-link">{t.radio}</a>
                        <a href="#pricing-section" onClick={(e) => { e.preventDefault(); handleMobileNavLinkClick('#pricing-section'); }} className="mobile-nav-link">{t.price}</a>                     
                    </nav>

                    <div className="mobile-nav-section-divider"></div>

                     <div className="mobile-nav-section">
                        {user && <button onClick={onLogout} className="mobile-nav-link text-accent-red"><LogoutIcon className="w-5 h-5"/><span>{t.logout}</span></button>}
                         <div className="user-menu-language-switcher">
                            <div className="user-menu-language-switcher-pill">
                                <button onClick={() => { setLanguage('vi'); setIsMobileMenuOpen(false); }} className={language === 'vi' ? 'active' : ''}>VIE</button>
                                <button onClick={() => { setLanguage('en'); setIsMobileMenuOpen(false); }} className={language === 'en' ? 'active' : ''}>ENG</button>
                            </div>
                        </div>                        
                     </div>
                </div>
            </div>
        </header>
    );
};