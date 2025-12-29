// client/src/components/home/LibrarySection.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Document } from '../../types';
import { BookOpenIcon, EyeIcon, ThumbsUpIcon } from '../Icons';

const translations = {
    vi: {
        title: "Thư Viện Pháp",
        subtitle: "Khám phá kinh điển, kệ, và các câu chuyện truyền cảm hứng",
        viewMore: "Xem thêm",
        by: "Bởi",
    },
    en: {
        title: "Dharma Library",
        subtitle: "Explore scriptures, verses, and inspiring stories",
        viewMore: "View More",
        by: "By",
    },
};

export const LibrarySectionSkeleton = () => (
    <div className="library-grid">
        {[...Array(4)].map((_, i) => (
            <div key={i} className="library-card">
                <div className="library-card-thumb skeleton"></div>
                <div className="library-card-content">
                    <div className="skeleton" style={{ height: '1.25rem', borderRadius: '4px', marginBottom: '0.5rem' }}></div>
                    <div className="skeleton" style={{ height: '0.875rem', width: '60%', borderRadius: '4px' }}></div>
                    <div className="library-card-stats" style={{ marginTop: 'auto' }}>
                        <div className="skeleton" style={{ width: '3rem', height: '1rem', borderRadius: '4px' }}></div>
                    </div>
                </div>
            </div>
        ))}
    </div>
);

interface LibrarySectionProps {
    recommended: { topKe: Document[], topTruyen: Document[] };
    language: 'vi' | 'en';
}

export const LibrarySection: React.FC<LibrarySectionProps> = ({ recommended, language }) => {
    const t = translations[language];
    const documents = [...(recommended.topKe || []), ...(recommended.topTruyen || [])]
        .sort((a, b) => (b.views || 0) - (a.views || 0))
        .slice(0, 4);
    
    return (
        <section id="library-section" className="homepage-section library-teaser-section">
            <div className="container">
                <h2 className="section-title">{t.title}</h2>
                <p className="section-subtitle">{t.subtitle}</p>
                
                <div className="library-grid">
                    {documents.map(doc => (
                        <Link to={`/${doc.spaceSlug || 'giac-ngo'}/library/${doc.id}`} key={doc.id} className="library-card">
                            <div className="library-card-thumb">
                                {doc.thumbnailUrl ? <img src={doc.thumbnailUrl} alt={doc.title} loading="lazy" /> : <BookOpenIcon />}
                            </div>
                            <div className="library-card-content">
                                <h3 className="library-card-title">{language === 'en' && doc.titleEn ? doc.titleEn : doc.title}</h3>
                                <p className="library-card-author">{t.by} {language === 'en' && doc.authorEn ? doc.authorEn : doc.author}</p>
                                <div className="library-card-stats">
                                    <span><EyeIcon />{doc.views || 0}</span>
                                    <span><ThumbsUpIcon className="icon-heart" />{doc.likes || 0}</span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
                
                {documents.length > 0 && <div className="view-more"><Link to="/giac-ngo/library">{t.viewMore}</Link></div>}
            </div>
        </section>
    );
};
