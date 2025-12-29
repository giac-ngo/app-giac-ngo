// client/src/components/home/CommunitySection.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Space } from '../../types';
import { MapPinIcon, UsersIcon, StarIcon } from '../Icons';

const translations = {
    vi: {
        title: "Khám Phá Không Gian Tu Tập",
        subtitle: "Tìm kiếm các ngôi chùa, thiền viện, và trung tâm tu tập trên toàn thế giới",
        viewMore: "Xem thêm",
    },
    en: {
        title: "Discover Practice Spaces",
        subtitle: "Find temples, monasteries, and practice centers around the world",
        viewMore: "View More",
    },
};

export const CommunityGridSkeleton = () => (
     <div className="community-grid">
        {[...Array(4)].map((_, i) => (
            <div key={i} className="skeleton-card community-card-home">
                 <div className="skeleton card-top" style={{height: '140px'}}></div>
                 <div className="card-bottom" style={{paddingTop: '1rem'}}>
                    <div className="skeleton skeleton-title small" style={{width: '60%', margin: '0 auto 0.5rem'}}></div>
                    <div className="skeleton skeleton-text" style={{margin: '0.25rem auto'}}></div>
                 </div>
            </div>
        ))}
    </div>
);

interface CommunitySectionProps {
    spaces: Space[];
    language: 'vi' | 'en';
}

export const CommunitySection: React.FC<CommunitySectionProps> = ({ spaces, language }) => {
    const t = translations[language];

    return (
        <section id="community-section" className="homepage-section community-section">
            <div className="container">
                <h2 className="section-title">{t.title}</h2>
                <p className="section-subtitle">{t.subtitle}</p>
                
                <div className="community-grid">
                    {spaces.slice(0, 4).map(space => (
                        <Link to={`/${space.slug}`} key={space.id} className="community-card-home">
                            <div className="card-top">
                                {space.spaceSort && <span className="card-rank">{space.spaceSort}</span>}
                                {space.status && <span className="card-status">{language === 'en' && space.statusEn ? space.statusEn : space.status}</span>}
                                <div className="card-icon-wrapper" style={{ backgroundColor: space.spaceColor || '#ccc' }}>
                                    <div className="card-icon-compact">
                                        <span className="card-icon-emoji">{space.spaceTypeIcon || '⛩️'}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="card-bottom">
                                <h3 className="card-title">{language === 'en' && space.nameEn ? space.nameEn : space.name}</h3>
                                <p className="card-desc">{language === 'en' && space.descriptionEn ? space.descriptionEn : space.description}</p>
                                <div className="card-meta">
                                    <span><MapPinIcon className="w-4 h-4"/>{language === 'en' && space.locationTextEn ? space.locationTextEn : space.locationText}</span>
                                    <span><UsersIcon className="w-4 h-4"/>{space.membersCount || 0}</span>
                                    <span><StarIcon className="w-4 h-4"/>{space.rating || 0}</span>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
                
                {spaces.length > 4 && <div className="view-more"><button>{t.viewMore}</button></div>}
            </div>
        </section>
    );
};
