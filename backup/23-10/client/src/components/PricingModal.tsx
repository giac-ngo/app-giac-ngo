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
}

const PricingModal: React.FC<PricingModalProps> = ({ isOpen, onClose, user, onUserUpdate }) => {
    const [plans, setPlans] = useState<PricingPlan[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isPurchasing, setIsPurchasing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const { showToast } = useToast();

    useEffect(() => {
        if (isOpen) {
            setIsLoading(true);
            setError(null);
            const fetchPlans = async () => {
                try {
                    const fetchedPlans = await apiService.getPricingPlans();
                    setPlans(fetchedPlans.filter(p => p.isActive));
                } catch (err) {
                    setError('Không thể tải bảng giá. Vui lòng thử lại sau.');
                    console.error(err);
                } finally {
                    setIsLoading(false);
                }
            };
            fetchPlans();
        }
    }, [isOpen]);

    const handlePurchase = async (planId: number | string) => {
        if (!user) return;
        setIsPurchasing(true);
        try {
            const updatedUser = await apiService.purchaseSubscription(user.id as number, planId);
            onUserUpdate(updatedUser);
            showToast('Mua gói thành công!', 'success');
            onClose(); 
        } catch (err: any) {
            showToast(err.message || 'Mua gói thất bại.', 'error');
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
                        <h1 className="text-4xl font-bold text-text-main mb-4">Bảng giá</h1>
                        <p className="text-lg text-text-light">Chọn gói phù hợp với bạn.</p>
                        {user && (
                            <p className="text-lg text-text-main mt-2 font-semibold">Số dư của bạn: <span className="text-primary">{user.coins ?? 'Không giới hạn'} coins</span></p>
                        )}
                    </div>
                    
                    {isLoading && <div className="text-center mt-12">Đang tải...</div>}
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
