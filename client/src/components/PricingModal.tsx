import React, { useState, useEffect } from 'react';
import PricingCard from './PricingCard';
import { PricingPlan, User } from '../types';
import { apiService } from '../services/apiService';
import { useToast } from './ToastProvider';

interface PricingModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: User | null;
    onUserUpdate: (updatedData: Partial<User>) => void;
    language: 'vi' | 'en';
}

const translations = {
    vi: {
        title: "Bảng giá",
        subtitle: "Chọn gói phù hợp với bạn.",
        balance: "Số dư của bạn",
        unlimited: "Không giới hạn",
        loading: "Đang tải...",
        loadError: "Không thể tải bảng giá. Vui lòng thử lại sau.",
        purchaseSuccess: "Mua gói thành công!",
        purchaseError: "Mua gói thất bại.",
    },
    en: {
        title: "Pricing",
        subtitle: "Choose the plan that's right for you.",
        balance: "Your balance",
        unlimited: "Unlimited",
        loading: "Loading...",
        loadError: "Could not load pricing plans. Please try again later.",
        purchaseSuccess: "Purchase successful!",
        purchaseError: "Purchase failed.",
    }
}

const PricingModal: React.FC<PricingModalProps> = ({ isOpen, onClose, user, onUserUpdate, language }) => {
    const [plans, setPlans] = useState<PricingPlan[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isPurchasing, setIsPurchasing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { showToast } = useToast();
    const t = translations[language];

    useEffect(() => {
        if (isOpen) {
            setIsLoading(true);
            setError(null);
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
        }
    }, [isOpen, t.loadError]);

    const handlePurchase = async (planId: number | string) => {
        if (!user) return;
        setIsPurchasing(true);
        try {
            const updatedUser = await apiService.purchaseSubscription(user.id as number, planId);
            onUserUpdate(updatedUser);
            showToast(t.purchaseSuccess, 'success');
            onClose(); 
        } catch (err: any) {
            showToast(err.message || t.purchaseError, 'error');
        } finally {
            setIsPurchasing(false);
        }
    };
    
    if (!isOpen) {
        return null;
    }

    return (
        <>
            <div 
                className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4"
                onClick={onClose}
            >
                <div 
                    className="bg-background-main rounded-lg shadow-xl w-full max-w-5xl p-8 relative transform transition-all animate-fade-in-right"
                    onClick={(e) => e.stopPropagation()}
                >
                    <button 
                        onClick={onClose} 
                        className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                    </button>
                    
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
                        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
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
            </div>
        </>
    );
};

export default PricingModal;