

import React from 'react';
import { Link } from 'react-router-dom';

interface FooterProps {
    language: 'vi' | 'en';
}

const translations = {
    vi: {
        ai: 'AI',
        space: 'Không gian',
        library: 'Thư viện',
        radio: 'Radio',
        price: 'Cúng dường tùy tâm',
        initiative: 'Giác Ngộ Initiative',
        copyright: '© 2025 Giác Ngộ',
    },
    en: {
        ai: 'AI',
        space: 'Space',
        library: 'Library',
        radio: 'Radio',
        price: 'Donation',
        initiative: 'Giác Ngộ Initiative',
        copyright: '© 2025 Giác Ngộ',
    }
};

export const Footer: React.FC<FooterProps> = ({ language }) => {
    const t = translations[language];
    
    const handleScrollClick = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
        e.preventDefault();
        const element = document.getElementById(targetId);
        if (element) {
            element.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    };

    return (
        <footer className="main-footer">
            <div className="container">
                <div className="footer-initiative">
                    <Link to="/">{t.initiative}</Link>
                </div>
                <nav className="footer-nav">
                    <a href="#agents-section" onClick={(e) => handleScrollClick(e, 'agents-section')}>{t.ai}</a>
                    {/* <a href="#community-section" onClick={(e) => handleScrollClick(e, 'community-section')}>{t.space}</a> */}
                    <a href="#library-section" onClick={(e) => handleScrollClick(e, 'library-section')}>{t.library}</a>
                    <a href="#dharma-radio-section" onClick={(e) => handleScrollClick(e, 'dharma-radio-section')}>{t.radio}</a>
                    <a href="#pricing-section" onClick={(e) => handleScrollClick(e, 'pricing-section')}>{t.price}</a>                    
                </nav>
                <div className="footer-copyright">
                    {t.copyright}
                </div>
            </div>
        </footer>
    );
};