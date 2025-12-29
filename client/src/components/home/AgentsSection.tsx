// client/src/components/home/AgentsSection.tsx
import React from 'react';
import { AIConfig, Space, User } from '../../types';
import { useToast } from '../ToastProvider';
import { apiService } from '../../services/apiService';
import { useNavigate } from 'react-router-dom';
import { UsersIcon, StarIcon } from '../Icons';

const translations = {
    vi: {
        title: "Khám Phá Các AI Agent Phật Giáo",
        subtitle: "Được đào tạo từ kinh điển và giáo lý của các thiền viện uy tín",
        explore: "Trò chuyện",
        owned: "Đã sở hữu",
        free: "Miễn phí",
        buyFor: "Mua với {cost} merits",
        insufficient: "Không đủ merit",
        loginToBuy: "Đăng nhập để mua",
        viewMore: "Xem thêm",
        purchasing: "Đang xử lý...",
        purchaseSuccess: "Mua AI thành công!",
        purchaseError: "Mua thất bại: {message}",
        claimSuccess: "Sở hữu AI miễn phí thành công!",
        claimError: "Không thể sở hữu: {message}",
        contactForAccess: "Liên hệ để truy cập",
    },
    en: {
        title: "Explore Buddhist AI Agents",
        subtitle: "Trained on scriptures and teachings from reputable monasteries",
        explore: "Explore",
        owned: "Owned",
        free: "Free",
        buyFor: "Buy for {cost} merits",
        insufficient: "Insufficient Merits",
        loginToBuy: "Login to Buy",
        viewMore: "View More",
        purchasing: "Processing...",
        purchaseSuccess: "AI purchased successfully!",
        purchaseError: "Purchase failed: {message}",
        claimSuccess: "Free AI claimed successfully!",
        claimError: "Claim failed: {message}",
        contactForAccess: "Contact for Access",
    },
};

export const AgentsGridSkeleton = () => (
    <div className="agents-grid">
        {[...Array(3)].map((_, i) => (
            <div key={i} className="skeleton-card agent-card">
                <div className="skeleton card-image-top"></div>
                <div className="card-body">
                    <div className="skeleton skeleton-title"></div>
                    <div className="skeleton skeleton-text"></div>
                    <div className="skeleton skeleton-text short"></div>
                    <div className="skeleton skeleton-button"></div>
                </div>
            </div>
        ))}
    </div>
);

interface AgentsSectionProps {
    aiConfigs: AIConfig[];
    spaces: Space[];
    user: User | null;
    onUserUpdate: (updatedData: Partial<User>) => void;
    language: 'vi' | 'en';
}

export const AgentsSection: React.FC<AgentsSectionProps> = ({ aiConfigs, spaces, user, onUserUpdate, language }) => {
    const t = translations[language];
    const { showToast } = useToast();
    const navigate = useNavigate();
    const [purchasingId, setPurchasingId] = React.useState<string | number | null>(null);

    const handleSelectAi = (ai: AIConfig) => {
        const spaceSlug = spaces.find(s => s.id === ai.spaceId)?.slug || 'giac-ngo';
        localStorage.setItem('lastSelectedAiId', String(ai.id));
        navigate(`/${spaceSlug}/chat`);
    };
    
    const handlePurchase = async (e: React.MouseEvent, ai: AIConfig) => {
        e.stopPropagation();
        if (!user || typeof ai.id !== 'number' || !ai.purchaseCost) return;
        
        setPurchasingId(ai.id);
        try {
            const { updatedUser } = await apiService.purchaseAi(ai.id, user.id as number);
            onUserUpdate(updatedUser);
            showToast(t.purchaseSuccess, 'success');
        } catch (error: any) {
            showToast(t.purchaseError.replace('{message}', error.message), 'error');
        } finally {
            setPurchasingId(null);
        }
    };
    
    const handleClaim = async (e: React.MouseEvent, ai: AIConfig) => {
        e.stopPropagation();
        if (!user || typeof ai.id !== 'number') return;
        
        setPurchasingId(ai.id);
        try {
            const { updatedUser } = await apiService.claimFreeAi(ai.id, user.id as number);
            onUserUpdate(updatedUser);
            showToast(t.claimSuccess, 'success');
        } catch (error: any) {
            showToast(t.claimError.replace('{message}', error.message), 'error');
        } finally {
            setPurchasingId(null);
        }
    };

    return (
        <section id="agents-section" className="homepage-section agents-section">
            <div className="container">
                <h2 className="section-title">{t.title}</h2>
                <p className="section-subtitle">{t.subtitle}</p>
                <div className="agents-grid">
                    {aiConfigs.slice(0, 3).map(ai => {
                        const space = spaces.find(s => s.id === ai.spaceId);
                        const isOwned = user?.ownedAis?.some(owned => owned.aiConfigId === ai.id);
                        
                        let buttonContent: React.ReactNode;
                        if (isOwned) {
                            buttonContent = <button onClick={() => handleSelectAi(ai)} className="explore-button">{t.explore}</button>;
                        } else if (ai.isContactForAccess) {
                            buttonContent = <button disabled className="explore-button opacity-70 cursor-not-allowed">{t.contactForAccess}</button>;
                        } else if (!ai.purchaseCost) {
                             buttonContent = <button onClick={(e) => handleClaim(e, ai)} className="explore-button">{purchasingId === ai.id ? t.purchasing : t.free}</button>;
                        } else if (!user) {
                            buttonContent = <button onClick={(e) => { e.stopPropagation(); navigate('/login'); }} className="explore-button">{t.loginToBuy}</button>;
                        } else if (user.merits === null || user.merits >= ai.purchaseCost) {
                            buttonContent = <button onClick={(e) => handlePurchase(e, ai)} className="explore-button">{purchasingId === ai.id ? t.purchasing : t.buyFor.replace('{cost}', String(ai.purchaseCost))}</button>;
                        } else {
                            buttonContent = <button disabled className="explore-button opacity-70 cursor-not-allowed">{t.insufficient}</button>;
                        }

                        return (
                            <div key={ai.id} className="agent-card">
                                <div className="card-image-top"><img src={ai.avatarUrl} alt={ai.name} /></div>
                                <div className="card-body">
                                    <h3 className="agent-name">{language === 'en' && ai.nameEn ? ai.nameEn : ai.name}</h3>
                                    <p className="agent-subtitle">{language === 'en' && ai.descriptionEn ? ai.descriptionEn : ai.description}</p>
                                    <hr className="agent-divider" />
                                    <div className="agent-meta">
                                        <span className="model-tag">{ai.modelName}</span>
                                        <span className="space-name">{space?.name || 'Giác Ngộ'}</span>
                                    </div>
                                    <div className="agent-stats">
                                        <div><UsersIcon className="w-4 h-4"/><span>{ai.views || 0}</span></div>
                                        <div><StarIcon className="w-4 h-4"/><span>{ai.rating || 0}</span></div>
                                    </div>
                                    <div className="agent-price">
                                        {ai.isOnSale && ai.oldPurchaseCost && <span className="line-through">{ai.oldPurchaseCost}</span>}
                                        {ai.purchaseCost ? `${ai.purchaseCost} merits` : ''}
                                    </div>
                                    {buttonContent}
                                </div>
                            </div>
                        );
                    })}
                </div>
                {aiConfigs.length > 3 && <div className="view-more"><button onClick={() => navigate('/marketplace')}>{t.viewMore}</button></div>}
            </div>
        </section>
    );
};
