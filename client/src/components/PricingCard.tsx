import React from 'react';
import { PricingPlan, User } from '../types';
import { useToast } from './ToastProvider';

interface PricingCardProps {
    plan: PricingPlan;
    user: User | null;
    onPurchase: (planId: number | string) => void;
    isPurchasing: boolean;
    language: 'vi' | 'en';
}

const translations = {
  vi: { choosePlan: 'Chọn Gói', currentPlan: 'Gói Hiện tại', switchPlan: 'Chuyển Gói', processing: 'Đang xử lý...', loginPrompt: 'Vui lòng đăng nhập để mua gói.', insufficientMerits: 'Bạn không đủ merit để mua gói này.' },
  en: { choosePlan: 'Choose Plan', currentPlan: 'Current Plan', switchPlan: 'Switch Plan', processing: 'Processing...', loginPrompt: 'Please log in to purchase a plan.', insufficientMerits: 'You do not have enough merits for this plan.' }
};

const PricingCard: React.FC<PricingCardProps> = ({ plan, user, onPurchase, isPurchasing, language }) => {
    const { showToast } = useToast();
    const t = translations[language];

    const handleChoosePlan = () => {
        if (!user) {
            showToast(t.loginPrompt, 'error');
            return;
        }
        if (user.merits === null || user.merits >= plan.meritCost) {
            onPurchase(plan.id);
        } else {
            showToast(t.insufficientMerits, 'error');
        }
    };
    
    const canAfford = user ? (user.merits === null || user.merits >= plan.meritCost) : false;
    const isCurrentPlan = user?.subscriptionPlanId === plan.id;

    let buttonText = t.choosePlan;
    if (isCurrentPlan) buttonText = t.currentPlan;
    else if (user?.subscriptionPlanId) buttonText = t.switchPlan;

    const planName = language === 'en' && plan.planNameEn ? plan.planNameEn : plan.planName;
    const price = language === 'en' && plan.priceEn ? plan.priceEn : plan.price;
    
    const features = (language === 'en' && Array.isArray(plan.featuresEn))
        ? plan.featuresEn
        : (language === 'vi' && Array.isArray(plan.features))
            ? plan.features
            : [];

    return (
        <div className={`border rounded-lg p-6 shadow-lg bg-background-panel flex flex-col ${isCurrentPlan ? 'border-primary ring-2 ring-primary' : 'border-border-color'}`}>
            <h2 className="text-2xl font-bold text-text-main">{planName}</h2>
            <p className="text-3xl font-bold my-4 text-primary">{price}</p>
            <ul className="space-y-2 text-text-light flex-grow">
                {features.map((feature, index) => (
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
                    {isPurchasing ? t.processing : buttonText}
                </button>                
            </div>
        </div>
    );
};

export default PricingCard;