// client/src/components/MarketplaceModal.tsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User, AIConfig } from '../types';
import { apiService } from '../services/apiService';
import { useToast } from './ToastProvider';

const translations = {
    vi: {
        title: "Marketplace AI",
        subtitle: "Khám phá và sở hữu các AI Agent độc đáo từ cộng đồng.",
        balance: "Số dư của bạn",
        unlimited: "Không giới hạn",
        loading: "Đang tải...",
        loadError: "Không thể tải danh sách AI. Vui lòng thử lại sau.",
        purchaseSuccess: "Mua AI thành công!",
        purchaseError: "Mua AI thất bại: {message}",
        owned: "Đã sở hữu",
        buyFor: "Mua với {cost} merits",
        insufficientMerits: "Không đủ merits",
        loginToBuy: "Đăng nhập để mua",
        free: "Miễn phí",
        merits: 'merits',
        perRequest: '/yêu cầu',
    },
    en: {
        title: "AI Marketplace",
        subtitle: "Discover and own unique AI Agents from the community.",
        balance: "Your balance",
        unlimited: "Unlimited",
        loading: "Loading...",
        loadError: "Could not load AI list. Please try again later.",
        purchaseSuccess: "AI purchased successfully!",
        purchaseError: "Failed to purchase AI: {message}",
        owned: "Owned",
        buyFor: "Buy for {cost} merits",
        insufficientMerits: "Insufficient Merits",
        loginToBuy: "Login to Buy",
        free: "Free",
        merits: 'merits',
        perRequest: '/request',
    }
};

interface AgentPurchaseCardProps {
    ai: AIConfig;
    user: User | null;
    onPurchase: (aiId: number | string) => void;
    isPurchasing: boolean;
    language: 'vi' | 'en';
}

function AgentPurchaseCard({ ai, user, onPurchase, isPurchasing, language }: AgentPurchaseCardProps) {
    const t = translations[language];
    const isOwned = user?.ownedAis?.some(owned => owned.aiConfigId === ai.id);
    const canAfford = user ? (user.merits === null || user.merits >= (ai.purchaseCost || 0)) : false;
    const isFreeToOwn = !ai.purchaseCost || ai.purchaseCost === 0;

    const name = language === 'en' && ai.nameEn ? ai.nameEn : ai.name;
    const description = language === 'en' && ai.descriptionEn ? ai.descriptionEn : ai.description;
    
    let priceDisplay;
    if (isFreeToOwn) {
        if (ai.meritCost && ai.meritCost > 0) {
            priceDisplay = <p className="text-2xl font-bold text-primary">{ai.meritCost} {t.merits}<span className="text-base font-normal text-text-light">{t.perRequest}</span></p>;
        } else {
            priceDisplay = <p className="text-2xl font-bold text-primary">{t.free}</p>;
        }
    } else {
        if (ai.isOnSale && ai.oldPurchaseCost) {
            priceDisplay = (
                <p className="text-2xl font-bold text-primary">
                    <span className="text-lg line-through text-text-light mr-2">{ai.oldPurchaseCost}</span>
                    {ai.purchaseCost} {t.merits}
                </p>
            );
        } else {
            priceDisplay = <p className="text-2xl font-bold text-primary">{ai.purchaseCost} {t.merits}</p>;
        }
    }

    let button;
    if (isOwned) {
        button = <button disabled className="w-full bg-green-600 text-white py-2 rounded-md cursor-not-allowed">{t.owned}</button>;
    } else if (!user) {
        button = <Link to="/login" className="w-full block text-center bg-gray-500 text-white py-2 rounded-md hover:bg-gray-600">{t.loginToBuy}</Link>;
    } else if (isFreeToOwn) {
        button = <button disabled className="w-full bg-blue-500 text-white py-2 rounded-md">{t.free}</button>;
    } else if (!canAfford) {
        button = <button disabled className="w-full bg-gray-400 text-white py-2 rounded-md cursor-not-allowed">{t.insufficientMerits}</button>;
    } else {
        button = (
            <button
                onClick={() => onPurchase(ai.id)}
                disabled={isPurchasing}
                className="w-full bg-primary text-text-on-primary py-2 rounded-md hover:bg-primary-hover transition-colors disabled:opacity-50"
            >
                {isPurchasing ? '...' : t.buyFor.replace('{cost}', String(ai.purchaseCost))}
            </button>
        );
    }

    return (
        <div className={`border rounded-lg p-6 shadow-lg bg-background-panel flex flex-col ${isOwned ? 'border-green-500' : 'border-border-color'}`}>
            <div className="flex items-center gap-4 mb-4">
                <img src={ai.avatarUrl} alt={name} className="w-16 h-16 rounded-full" />
                <div>
                    <h2 className="text-xl font-bold text-text-main">{name}</h2>
                    {priceDisplay}
                </div>
            </div>
            <p className="text-text-light flex-grow mb-4">{description}</p>
            {button}
        </div>
    );
};

interface MarketplaceModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: User | null;
    onUserUpdate: (updatedData: Partial<User>) => void;
    language: 'vi' | 'en';
    prioritizedAiId?: string | null;
}

export function MarketplaceModal({ isOpen, onClose, user, onUserUpdate, language, prioritizedAiId }: MarketplaceModalProps) {
    const [publicAis, setPublicAis] = useState<AIConfig[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isPurchasing, setIsPurchasing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const t = translations[language];
    const { showToast } = useToast();

    useEffect(() => {
        if (isOpen) {
            setIsLoading(true);
            setError(null);
            apiService.getAiConfigs(user)
                .then(data => {
                    const allPublicAis = (data || []).filter(ai => ai.isPublic);
                    if (prioritizedAiId) {
                        allPublicAis.sort((a, b) => {
                            if (String(a.id) === prioritizedAiId) return -1;
                            if (String(b.id) === prioritizedAiId) return 1;
                            return 0;
                        });
                    }
                    setPublicAis(allPublicAis);
                })
                .catch(() => setError(t.loadError))
                .finally(() => setIsLoading(false));
        }
    }, [isOpen, t.loadError, user, prioritizedAiId]);

    const handlePurchase = async (aiId: number | string) => {
        if (!user) return;
        setIsPurchasing(true);
        try {
            const { updatedUser } = await apiService.purchaseAi(aiId, user.id as number);
            onUserUpdate(updatedUser);
            showToast(t.purchaseSuccess, 'success');
        } catch (err: any) {
            showToast(t.purchaseError.replace('{message}', err.message), 'error');
        } finally {
            setIsPurchasing(false);
        }
    };
    
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-background-panel rounded-lg shadow-xl w-full max-w-5xl p-6 relative transform transition-all animate-fade-in-right max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 text-text-light hover:text-text-main text-3xl leading-none">&times;</button>
                <div className="text-center flex-shrink-0">
                    <h2 className="text-3xl font-bold text-text-main">{t.title}</h2>
                    <p className="mt-2 text-text-light">{t.subtitle}</p>
                     {user && (
                        <p className="text-lg text-text-main mt-2 font-semibold">{t.balance}: <span className="text-primary">{user.merits ?? t.unlimited} merits</span></p>
                    )}
                </div>
                <div className="mt-8 flex-grow overflow-y-auto">
                    {isLoading && <div className="text-center my-8">{t.loading}</div>}
                    {error && <div className="text-center my-8 text-accent-red">{error}</div>}
                    {!isLoading && !error && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {publicAis.map(ai => (
                                <AgentPurchaseCard
                                    key={ai.id}
                                    ai={ai}
                                    user={user}
                                    onPurchase={handlePurchase}
                                    isPurchasing={isPurchasing}
                                    language={language}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}