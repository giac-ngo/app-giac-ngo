
// client/src/components/PricingModal.tsx
import React, { useState, useEffect } from 'react';
import { PricingCard } from './PricingCard';
import { PricingPlan, User, AIConfig } from '../types';
import { apiService } from '../services/apiService';
import { useToast } from './ToastProvider';

const translations = {
    vi: {
        title: "Nâng cấp Gói của bạn",
        subtitle: "Chọn gói phù hợp để tiếp tục trải nghiệm không giới hạn.",
        loading: "Đang tải...",
        loadError: "Không thể tải bảng giá. Vui lòng thử lại sau.",
        purchaseSuccess: "Mua gói thành công!",
        purchaseError: "Mua gói thất bại.",
        close: "Đóng",
    },
    en: {
        title: "Upgrade Your Plan",
        subtitle: "Choose the right plan to continue your unlimited experience.",
        loading: "Loading...",
        loadError: "Could not load pricing plans. Please try again later.",
        purchaseSuccess: "Purchase successful!",
        purchaseError: "Purchase failed.",
        close: "Close",
    }
};

interface PricingModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: User | null;
    onUserUpdate: (updatedData: Partial<User>) => void;
    language: 'vi' | 'en';
}

export const PricingModal: React.FC<PricingModalProps> = ({ isOpen, onClose, user, onUserUpdate, language }) => {
    const [plans, setPlans] = useState<PricingPlan[]>([]);
    const [aiConfigs, setAiConfigs] = useState<AIConfig[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isPurchasing, setIsPurchasing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const t = translations[language];
    const { showToast } = useToast();

    useEffect(() => {
        if (isOpen) {
            setIsLoading(true);
            setError(null);
            Promise.all([
                apiService.getPricingPlans(),
                apiService.getAiConfigs(user)
            ])
                .then(([fetchedPlans, fetchedAis]) => {
                    const correctedPlans = fetchedPlans.map(plan => ({
                        ...plan,
                        aiConfigIds: Array.isArray(plan.aiConfigIds) ? plan.aiConfigIds.map(Number) : [],
                    }));
                    setPlans(correctedPlans.filter(p => p.isActive));
                    setAiConfigs(fetchedAis);
                })
                .catch(err => {
                    setError(t.loadError);
                    console.error(err);
                })
                .finally(() => setIsLoading(false));
        }
    }, [isOpen, t.loadError, user]);

    const handlePurchase = async (planId: number | string) => {
        if (!user) return;
        setIsPurchasing(true);
        try {
            const updatedUser = await apiService.purchaseSubscription(user.id as number, planId);
            onUserUpdate(updatedUser);
            showToast(t.purchaseSuccess, 'success');
            onClose(); // Close modal on success
        } catch (err: any) {
            showToast(err.message || t.purchaseError, 'error');
        } finally {
            setIsPurchasing(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-background-panel rounded-lg shadow-xl w-full max-w-7xl p-6 relative transform transition-all animate-fade-in-right max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <button onClick={onClose} className="absolute top-4 right-4 text-text-light hover:text-text-main text-3xl leading-none">&times;</button>
                <div className="text-center">
                    <h2 className="text-3xl font-bold text-text-main">{t.title}</h2>
                    <p className="mt-2 text-text-light">{t.subtitle}</p>
                </div>
                {isLoading && <div className="text-center my-8">{t.loading}</div>}
                {error && <div className="text-center my-8 text-accent-red">{error}</div>}
                {!isLoading && !error && (
                    <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {plans.map(plan => (
                            <PricingCard
                                key={plan.id}
                                plan={plan}
                                user={user}
                                onPurchase={handlePurchase}
                                isPurchasing={isPurchasing}
                                language={language}
                                allAis={aiConfigs}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
