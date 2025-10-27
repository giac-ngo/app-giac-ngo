import React, { useState, useEffect } from 'react';
import PricingCard from '../components/PricingCard';
import { PricingPlan, User } from '../types';
import { apiService } from '../services/apiService';
import { useToast } from '../components/ToastProvider';
import { LanguageIcon } from '../components/Icons';

const translations = {
    vi: {
        backToChat: "Về trang Chat",
        title: "Bảng giá",
        subtitle: "Chọn gói phù hợp với bạn.",
        balance: "Số dư của bạn",
        unlimited: "Không giới hạn",
        loading: "Đang tải...",
        loadError: "Không thể tải bảng giá. Vui lòng thử lại sau.",
        purchaseSuccess: "Mua gói thành công!",
        purchaseError: "Mua gói thất bại.",
        languageToggle: "English",
    },
    en: {
        backToChat: "Back to Chat",
        title: "Pricing",
        subtitle: "Choose the plan that's right for you.",
        balance: "Your balance",
        unlimited: "Unlimited",
        loading: "Loading...",
        loadError: "Could not load pricing plans. Please try again later.",
        purchaseSuccess: "Purchase successful!",
        purchaseError: "Purchase failed.",
        languageToggle: "Tiếng Việt",
    }
}


const PricingPage: React.FC = () => {
    const [plans, setPlans] = useState<PricingPlan[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isPurchasing, setIsPurchasing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [user, setUser] = useState<User | null>(() => {
        const savedUser = sessionStorage.getItem('user');
        return savedUser ? JSON.parse(savedUser) : null;
    });
    const [language, setLanguage] = useState<'vi' | 'en'>(() => (localStorage.getItem('language') as 'vi' | 'en') || 'vi');
    const t = translations[language];
    
    const { showToast } = useToast();

     useEffect(() => {
        localStorage.setItem('language', language);
    }, [language]);

    useEffect(() => {
        const fetchPlans = async () => {
            try {
                const fetchedPlans = await apiService.getPricingPlans();
                setPlans(fetchedPlans.filter(p => p.isActive));
            } catch (err) {
                setError(t.loadError);
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchPlans();
    }, [t.loadError]);
    
    const handleUserUpdate = (updatedUser: User) => {
        setUser(updatedUser);
        sessionStorage.setItem('user', JSON.stringify(updatedUser));
    };

    const handlePurchase = async (planId: number | string) => {
        if (!user) return;
        setIsPurchasing(true);
        try {
            const updatedUser = await apiService.purchaseSubscription(user.id as number, planId);
            handleUserUpdate(updatedUser);
            showToast(t.purchaseSuccess, 'success');
        } catch (err: any) {
            showToast(err.message || t.purchaseError, 'error');
        } finally {
            setIsPurchasing(false);
        }
    };

    return (
        <div className="p-8 bg-background-main min-h-screen relative">
            <div className="absolute top-8 right-8">
                <button onClick={() => setLanguage(l => l === 'vi' ? 'en' : 'vi')} className="flex items-center gap-2 p-2 rounded-lg hover:bg-background-light border border-text-main text-sm">
                    <LanguageIcon className="w-5 h-5"/>
                    <span>{t.languageToggle}</span>
                </button>
            </div>
            <div className="text-center">
                <a href="/#/" className="text-primary hover:underline mb-4 inline-block">&larr; {t.backToChat}</a>
                <h1 className="text-4xl font-bold text-text-main mb-4">{t.title}</h1>
                <p className="text-lg text-text-light">{t.subtitle}</p>
                 {user && (
                    <p className="text-lg text-text-main mt-2 font-semibold">{t.balance}: <span className="text-primary">{user.merits ?? t.unlimited} merits</span></p>
                )}
            </div>
            
            {isLoading && <div className="text-center mt-12">{t.loading}</div>}
            {error && <div className="text-center mt-12 text-accent-red">{error}</div>}

            {!isLoading && !error && (
                <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                    {plans.map((plan) => (
                        <PricingCard 
                            key={plan.id} 
                            plan={plan}
                            user={user}
                            onPurchase={handlePurchase}
                            isPurchasing={isPurchasing}
                            language={language}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default PricingPage;