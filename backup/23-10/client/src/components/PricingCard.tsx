import React from 'react';
import { PricingPlan, User } from '../types';
import { useToast } from './ToastProvider';

interface PricingCardProps {
    plan: PricingPlan;
    user: User | null;
    onPurchase: (planId: number | string) => void;
    isPurchasing: boolean;
}

const PricingCard: React.FC<PricingCardProps> = ({ plan, user, onPurchase, isPurchasing }) => {
    const { showToast } = useToast();

    const handleChoosePlan = () => {
        if (!user) {
            showToast('Vui lòng đăng nhập để mua gói.', 'error');
            return;
        }
        if (user.coins === null || user.coins >= plan.coinCost) {
            onPurchase(plan.id);
        } else {
            showToast('Bạn không đủ coin để mua gói này.', 'error');
        }
    };
    
    const canAfford = user ? (user.coins === null || user.coins >= plan.coinCost) : false;
    const isCurrentPlan = user?.subscriptionPlanId === plan.id;

    let buttonText = 'Chọn Gói';
    if (isCurrentPlan) buttonText = 'Gói Hiện tại';
    else if (user?.subscriptionPlanId) buttonText = 'Chuyển Gói';

    return (
        <div className={`border rounded-lg p-6 shadow-lg bg-background-panel flex flex-col ${isCurrentPlan ? 'border-primary ring-2 ring-primary' : 'border-border-color'}`}>
            <h2 className="text-2xl font-bold text-text-main">{plan.planName}</h2>
            <p className="text-3xl font-bold my-4 text-primary">{plan.price}</p>
            <ul className="space-y-2 text-text-light flex-grow">
                {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                        <svg className="w-5 h-5 mr-2 text-green-500 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                        <span>{feature}</span>
                    </li>
                ))}
            </ul>
            <div className="mt-8 w-full space-y-2">
                <button 
                    onClick={handleChoosePlan}
                    disabled={!user || !canAfford || isCurrentPlan || isPurchasing}
                    className="w-full bg-primary text-text-on-primary py-2 rounded-md hover:bg-primary-hover transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                    {isPurchasing ? 'Đang xử lý...' : buttonText}
                </button>                
            </div>
        </div>
    );
};

export default PricingCard;