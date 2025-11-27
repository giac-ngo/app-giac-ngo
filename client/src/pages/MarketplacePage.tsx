// client/src/pages/MarketplacePage.tsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User, AIConfig, SystemConfig } from '../types';
import { apiService } from '../services/apiService';
import { useToast } from '../components/ToastProvider';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';

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
        purchaseNotImplemented: "Chức năng mua AI chưa được cài đặt.",
        // Card translations
        owned: "Đã sở hữu",
        buyFor: "Mua với {cost} merits",
        insufficientMerits: "Không đủ merits",
        loginToBuy: "Đăng nhập để mua",
        free: "Miễn phí"
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
        purchaseNotImplemented: "AI purchasing feature is not yet implemented.",
        // Card translations
        owned: "Owned",
        buyFor: "Buy for {cost} merits",
        insufficientMerits: "Insufficient Merits",
        loginToBuy: "Login to Buy",
        free: "Free"
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
    const isFree = !ai.purchaseCost || ai.purchaseCost === 0;

    const name = language === 'en' && ai.nameEn ? ai.nameEn : ai.name;
    const description = language === 'en' && ai.descriptionEn ? ai.descriptionEn : ai.description;
    
    let button;
    if (isOwned) {
        button = <button disabled className="w-full bg-green-600 text-white py-2 rounded-md cursor-not-allowed">{t.owned}</button>;
    } else if (!user) {
        button = <Link to="/login" className="w-full block text-center bg-gray-500 text-white py-2 rounded-md hover:bg-gray-600">{t.loginToBuy}</Link>;
    } else if (isFree) {
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
                    <p className="text-2xl font-bold text-primary">{isFree ? t.free : `${ai.purchaseCost} merits`}</p>
                </div>
            </div>
            <p className="text-text-light flex-grow mb-4">{description}</p>
            {button}
        </div>
    );
};

interface MarketplacePageProps {
    user: User | null;
    onUserUpdate: (updatedData: Partial<User>) => void;
    language: 'vi' | 'en';
    setLanguage: (lang: 'vi' | 'en') => void;
    systemConfig: SystemConfig;
    onLogout: () => void;
}

export function MarketplacePage({ user, language, setLanguage, systemConfig, onLogout }: MarketplacePageProps) {
    const [publicAis, setPublicAis] = useState<AIConfig[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isPurchasing, setIsPurchasing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const t = translations[language];
    const { showToast } = useToast();

    useEffect(() => {
        setIsLoading(true);
        apiService.getAiConfigs(user)
            .then(data => setPublicAis((data || []).filter(ai => ai.isPublic)))
            .catch(() => setError(t.loadError))
            .finally(() => setIsLoading(false));
    }, [t.loadError, user]);

    const handlePurchase = async () => {
        if (!user) return;
        setIsPurchasing(true);
        try {
            showToast(t.purchaseNotImplemented, 'info');
        } catch (err: any) {
            showToast(t.purchaseError.replace('{message}', err.message), 'error');
        } finally {
            setIsPurchasing(false);
        }
    };

    return (
        <div className="bg-background-main min-h-screen">
            <Header user={user} systemConfig={systemConfig} language={language} setLanguage={setLanguage} onLogout={onLogout} />
            <div className="container py-12">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-text-main mb-4">{t.title}</h1>
                    <p className="text-lg text-text-light">{t.subtitle}</p>
                    {user && (
                        <p className="text-lg text-text-main mt-2 font-semibold">{t.balance}: <span className="text-primary">{user.merits ?? t.unlimited} merits</span></p>
                    )}
                </div>

                {isLoading && <div className="text-center mt-12">{t.loading}</div>}
                {error && <div className="text-center mt-12 text-accent-red">{error}</div>}

                {!isLoading && !error && (
                    <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
            <Footer language={language} />
        </div>
    );
}