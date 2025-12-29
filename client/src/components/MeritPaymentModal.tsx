// client/src/components/MeritPaymentModal.tsx
import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { apiService } from '../services/apiService';
import { useToast } from './ToastProvider';
import { XIcon, HeartIcon } from './Icons';

const translations = {
    vi: {
        defaultTitle: "Cúng Dường Tuỳ Tâm",
        subtitle: "Nếu những chia sẻ trên đã gieo vào lòng bạn một hạt mầm an lạc, và bạn mong muốn lan tỏa những giá trị này để chạm đến nhiều cuộc đời hơn, bạn có thể hoan hỷ tùy tâm cúng dường tại:",
        custom: "Tuỳ tâm",
        customSub: "CUSTOM",
        incense: "Bó nhang",
        incenseSub: "INCENSE",
        selected: "ĐÃ CHỌN",
        complete: "Hoàn tất cúng dường",
        redirecting: "Đang chuyển hướng...",
        footerText: "Tiền cúng dường được dùng để duy trì hệ thống và hỗ trợ các hoạt động thiện nguyện của cộng đồng Phật giáo.",
        errorAmount: "Vui lòng nhập số tiền hợp lệ.",
        errorGeneric: "Có lỗi xảy ra, vui lòng thử lại.",
        customPlaceholder: "Nhập số tiền ($)",
        loginRequired: "Vui lòng đăng nhập để cúng dường.",
        offeringFor: "Hạng mục: ",
        messageLabel: "Lời nhắn (tùy chọn)",
        messagePlaceholder: "Gửi lời chúc, hồi hướng công đức,...",
        contactUs: "Liên hệ chúng tôi tại info@giac.ngo",
    },
    en: {
        defaultTitle: "Custom Offering",
        subtitle: "If the sharing above has planted a seed of peace in your life, and you wish to help spread this message to touch more lives, you are welcome to offer your support here:",
        custom: "Custom",
        customSub: "CUSTOM",
        incense: "Incense",
        incenseSub: "INCENSE",
        selected: "SELECTED",
        complete: "Complete Offering",
        redirecting: "Redirecting...",
        footerText: "Offerings are used to maintain the system and support charitable activities of the Buddhist community.",
        errorAmount: "Please enter a valid amount.",
        errorGeneric: "An error occurred, please try again.",
        customPlaceholder: "Enter amount ($)",
        loginRequired: "Please login to make an offering.",
        offeringFor: "Category: ",
        messageLabel: "Message (optional)",
        messagePlaceholder: "Send good wishes, dedicate merit,...",
        contactUs: "Contact us at info@giac.ngo",
    }
};

interface MeritPaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: User | null;
    onPaymentSuccess: (updatedUser: User) => void;
    language: 'vi' | 'en';
    initialTab?: 'crypto' | 'stripe';
    // Props for contextualization
    offeringTitle?: string;
    suggestedAmount?: number;
    // New prop to trigger the specific "Practice Space" UI
    showIncenseOption?: boolean; 
}

export const MeritPaymentModal: React.FC<MeritPaymentModalProps> = ({ 
    isOpen, 
    onClose, 
    user, 
    language,
    offeringTitle,
    suggestedAmount,
    showIncenseOption = false // Default to false (HomePage behavior)
}) => {
    const t = translations[language];
    const { showToast } = useToast();
    const [customAmount, setCustomAmount] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');
    
    // 'custom' or 'incense' selection state for Practice Space mode
    const [selection, setSelection] = useState<'incense' | 'custom'>('custom');

    useEffect(() => {
        if (isOpen) {
            setMessage('');
            // Logic for HomePage (Plans)
            if (suggestedAmount && !showIncenseOption) {
                setCustomAmount(suggestedAmount.toString());
                setSelection('custom');
            } 
            // Logic for Practice Space (Reset to Custom default)
            else if (showIncenseOption) {
                setSelection('custom');
                setCustomAmount('');
            }
             else {
                setCustomAmount('');
            }
        }
    }, [isOpen, suggestedAmount, showIncenseOption]);

    const handleSelectOption = (option: 'incense' | 'custom') => {
        setSelection(option);
        if (option === 'incense') {
            setCustomAmount('3');
        } else {
            setCustomAmount('');
        }
    };

    if (!isOpen) return null;

    const handlePayment = async () => {
        if (!user) {
            showToast(t.loginRequired, 'error');
            return;
        }
        
        let amount = parseFloat(customAmount);

        if (isNaN(amount) || amount <= 0) {
            showToast(t.errorAmount, 'error');
            return;
        }

        setIsLoading(true);
        try {
            const { url } = await apiService.createCheckoutSession(amount, user.id as number, message);
            
            if (url) {
                window.location.href = url;
            } else {
                throw new Error("No checkout URL returned");
            }
        } catch (error: any) {
            console.error(error);
            showToast(error.message || t.errorGeneric, 'error');
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4 animate-fade-in">
            <div 
                className="bg-[#e8d9b9] rounded-[24px] shadow-2xl w-full max-w-[420px] relative overflow-hidden flex flex-col border-4 border-[#e8d9b9]"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close Button */}
                <button 
                    onClick={onClose}
                    className="absolute top-4 right-4 text-[#8c7b75] hover:text-[#5d4a3a] transition-colors z-10"
                >
                    <XIcon className="w-6 h-6" />
                </button>

                {/* Header Section */}
                <div className="pt-8 pb-4 px-6 text-center bg-[#e8d9b9]">
                    <h2 className="text-3xl font-bold text-[#991b1b] mb-2">
                        {(!showIncenseOption && offeringTitle) ? offeringTitle : t.defaultTitle}
                    </h2>
                    {(!showIncenseOption && offeringTitle) && (
                         <p className="text-xs font-bold text-[#991b1b] uppercase tracking-widest mb-3 opacity-80">
                            {t.offeringFor}{offeringTitle}
                        </p>
                    )}
                    <p className="text-[#6D605A] text-sm italic leading-relaxed px-2">
                        {t.subtitle}
                    </p>
                </div>

                {/* Body Section */}
                <div className="px-6 py-6 bg-[#f2eadb]">
                    
                    {/* Practice Space Mode: Show Two Cards */}
                    {showIncenseOption && (
                        <div className="grid grid-cols-2 gap-4 mb-6">
                            {/* Incense Card */}
                            <button 
                                onClick={() => handleSelectOption('incense')}
                                className={`relative flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-200 bg-white shadow-sm ${selection === 'incense' ? 'border-[#991b1b] ring-1 ring-[#991b1b] bg-[#fffbf0]' : 'border-transparent hover:border-[#dcd5bc]'}`}
                            >
                                {selection === 'incense' && (
                                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#991b1b] text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm tracking-wider font-sans">
                                        {t.selected}
                                    </span>
                                )}
                                <div className="text-4xl mb-2">🎋</div>
                                <h3 className="text-[#1f2937] font-bold text-lg">{t.incense}</h3>
                                <p className="text-[#8c7b75] text-[10px] font-bold uppercase tracking-widest mb-1 font-sans">{t.incenseSub}</p>
                                <p className="text-[#991b1b] font-bold text-xl font-sans">$3</p>
                            </button>

                            {/* Custom Card */}
                            <button 
                                onClick={() => handleSelectOption('custom')}
                                className={`relative flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-200 bg-white shadow-sm ${selection === 'custom' ? 'border-[#991b1b] ring-1 ring-[#991b1b] bg-[#fffbf0]' : 'border-transparent hover:border-[#dcd5bc]'}`}
                            >
                                {selection === 'custom' && (
                                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#991b1b] text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm tracking-wider font-sans">
                                        {t.selected}
                                    </span>
                                )}
                                <div className="text-4xl mb-2">🙏</div>
                                <h3 className="text-[#1f2937] font-bold text-lg">{t.custom}</h3>
                                <p className="text-[#8c7b75] text-[10px] font-bold uppercase tracking-widest mb-1 font-sans">{t.customSub}</p>
                                <p className="text-[#991b1b] font-bold text-xl font-sans">--</p>
                            </button>
                        </div>
                    )}

                    {/* Container for inputs, styled for homepage mode */}
                    <div className={!showIncenseOption ? 'bg-[#fffbf0] border-2 border-[#991b1b] rounded-xl p-6 shadow-sm' : ''}>
                        {/* Amount Input Section */}
                        {(selection === 'custom' || !showIncenseOption) && (
                            <div className="relative w-full animate-fade-in">
                                {!showIncenseOption && (
                                    <div className="flex flex-col items-center justify-center mb-4">
                                        <div className="text-5xl mb-2 filter drop-shadow-sm">🙏</div>
                                        <h3 className="text-[#1f2937] font-bold text-xl font-serif">{t.custom}</h3>
                                    </div>
                                )}
                                <div className="relative w-full">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <span className="text-[#991b1b] font-bold text-xl">$</span>
                                    </div>
                                    <input 
                                        type="number" 
                                        value={customAmount}
                                        onChange={(e) => setCustomAmount(e.target.value)}
                                        placeholder={t.customPlaceholder}
                                        className="w-full bg-white border border-[#dcd5bc] rounded-xl pl-8 pr-4 py-3 text-center text-[#991b1b] font-bold text-2xl placeholder-[#d1d5db] focus:outline-none focus:border-[#991b1b] focus:ring-1 focus:ring-[#991b1b] font-sans shadow-inner transition-all"
                                        autoFocus={selection === 'custom'}
                                        min="1"
                                    />
                                </div>
                            </div>
                        )}
                        
                        {/* Message Input Section */}
                        <div className={`relative w-full animate-fade-in ${(selection === 'custom' || !showIncenseOption) ? 'mt-4' : ''}`}>
                            <label htmlFor="offering-message" className="text-xs font-bold text-[#8c7b75] uppercase tracking-wider font-sans mb-1 block">{t.messageLabel}</label>
                            <textarea
                                id="offering-message"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder={t.messagePlaceholder}
                                className="w-full bg-white border border-[#dcd5bc] rounded-xl px-4 py-3 text-sm text-[#4B3226] placeholder-[#d1d5db] focus:outline-none focus:border-[#991b1b] focus:ring-1 focus:ring-[#991b1b] font-sans shadow-inner transition-all"
                                rows={2}
                                maxLength={500}
                            />
                        </div>
                    </div>
                </div>


                {/* Footer / Action Section */}
                <div className="p-6 bg-[#e8d9b9]">
                    <button
                        onClick={handlePayment}
                        disabled={isLoading}
                        className="w-full bg-[#991b1b] hover:bg-[#7f1d1d] text-[#fefce8] font-bold font-sans py-3.5 px-6 rounded-full shadow-lg transition-all transform active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 border-t border-white/10"
                    >
                        {isLoading ? (
                            <>
                                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                                {t.redirecting}
                            </>
                        ) : (
                            t.complete
                        )}
                    </button>

                    <div className="mt-6 flex items-start gap-3 px-1 opacity-80">
                        <HeartIcon className="w-5 h-5 text-[#991b1b] flex-shrink-0 mt-0.5" />
                        <p className="text-xs text-[#6D605A] leading-snug font-sans">
                            {t.footerText}
                        </p>
                    </div>
                     <p className="text-center text-xs text-[#6D605A] mt-4 font-sans">
                        {t.contactUs}
                    </p>
                </div>
            </div>
        </div>
    );
};