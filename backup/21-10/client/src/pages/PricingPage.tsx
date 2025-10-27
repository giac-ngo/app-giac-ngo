import React, { useState, useEffect } from 'react';
import PricingCard from '../components/PricingCard';
import { PricingPlan, User } from '../types';
import { apiService } from '../services/apiService';
import { useToast } from '../components/ToastProvider';

const PricingPage: React.FC = () => {
    const [plans, setPlans] = useState<PricingPlan[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isPurchasing, setIsPurchasing] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [user, setUser] = useState<User | null>(() => {
        const savedUser = sessionStorage.getItem('user');
        return savedUser ? JSON.parse(savedUser) : null;
    });
    
    const { showToast } = useToast();

    useEffect(() => {
        const fetchPlans = async () => {
            try {
                const fetchedPlans = await apiService.getPricingPlans();
                setPlans(fetchedPlans.filter(p => p.isActive));
            } catch (err) {
                setError('Could not load pricing plans. Please try again later.');
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchPlans();
    }, []);
    
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
            showToast('Mua gói thành công!', 'success');
        } catch (err: any) {
            showToast(err.message || 'Mua gói thất bại.', 'error');
        } finally {
            setIsPurchasing(false);
        }
    };

    return (
        <div className="p-8 bg-background-main min-h-screen">
            <div className="text-center">
                <a href="/#/" className="text-primary hover:underline mb-4 inline-block">&larr; Về trang Chat</a>
                <h1 className="text-4xl font-bold text-text-main mb-4">Bảng giá</h1>
                <p className="text-lg text-text-light">Chọn gói phù hợp với bạn.</p>
                 {user && (
                    <p className="text-lg text-text-main mt-2 font-semibold">Số dư của bạn: <span className="text-primary">{user.coins ?? 'Không giới hạn'} coins</span></p>
                )}
            </div>
            
            {isLoading && <div className="text-center mt-12">Đang tải...</div>}
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
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default PricingPage;