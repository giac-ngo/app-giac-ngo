// client/src/components/MeritPaymentModal.tsx
import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { apiService } from '../services/apiService';
import { useToast } from './ToastProvider';
import { UsdtIcon, UsdcIcon, EthIcon } from './Icons';

type CryptoCurrency = 'USDT' | 'USDC' | 'ETH';
type PaymentMethod = 'crypto' | 'stripe';

const translations = {
    vi: {
        title: "Nạp Merit",
        cryptoTab: "Crypto",
        stripeTab: "Thẻ Tín Dụng (Stripe)",
        amountLabel: "Số merit muốn nạp",
        amountPlaceholder: "VD: 100",
        equivalentVND: "Tương đương: {amount}đ",
        selectCurrency: "Chọn loại tiền tệ thanh toán:",
        createTransaction: "Tạo giao dịch",
        creatingTransaction: "Đang tạo giao dịch...",
        cancel: "Hủy",
        sendExactAmount: "Vui lòng gửi chính xác",
        toWalletAddress: "Tới địa chỉ ví:",
        iHavePaid: "Tôi đã thanh toán",
        confirmingPayment: "Đang xác thực giao dịch...",
        goBack: "Quay lại",
        invalidAmountError: "Vui lòng nhập số merit hợp lệ.",
        creationError: "Không thể tạo giao dịch.",
        addressCopied: "Đã sao chép địa chỉ ví!",
        paymentSuccess: "Thanh toán thành công! Đã cộng {amount} merits vào tài khoản.",
        confirmationError: "Xác nhận thanh toán thất bại.",
        stripePayButton: "Thanh toán",
        stripePayingButton: "Đang xử lý...",
        stripePaymentProcessing: "Đang xử lý thanh toán an toàn qua Stripe...",
        stripePaymentNote: "Đây là quy trình mô phỏng. Trong thực tế, bạn sẽ được chuyển đến trang thanh toán của Stripe.",
    },
    en: {
        title: "Top up Merits",
        cryptoTab: "Crypto",
        stripeTab: "Credit Card (Stripe)",
        amountLabel: "Amount of merits to top up",
        amountPlaceholder: "E.g., 100",
        equivalentVND: "Equivalent to: {amount} VND",
        selectCurrency: "Select payment currency:",
        createTransaction: "Create Transaction",
        creatingTransaction: "Creating transaction...",
        cancel: "Cancel",
        sendExactAmount: "Please send the exact amount",
        toWalletAddress: "To wallet address:",
        iHavePaid: "I have paid",
        confirmingPayment: "Confirming transaction...",
        goBack: "Go Back",
        invalidAmountError: "Please enter a valid merit amount.",
        creationError: "Could not create transaction.",
        addressCopied: "Wallet address copied!",
        paymentSuccess: "Payment successful! {amount} merits have been added to your account.",
        confirmationError: "Payment confirmation failed.",
        stripePayButton: "Pay",
        stripePayingButton: "Processing...",
        stripePaymentProcessing: "Processing secure payment via Stripe...",
        stripePaymentNote: "This is a simulated flow. In a real application, you would be redirected to Stripe's payment form.",
    }
};

interface MeritPaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: User | null;
    onPaymentSuccess: (updatedUser: User) => void;
    language: 'vi' | 'en';
    initialTab?: PaymentMethod;
}

export const MeritPaymentModal: React.FC<MeritPaymentModalProps> = ({ isOpen, onClose, user, onPaymentSuccess, language, initialTab = 'crypto' }) => {
    const t = translations[language];
    const [activeTab, setActiveTab] = useState<PaymentMethod>(initialTab);
    const [meritAmount, setMeritAmount] = useState<number | ''>('');
    const [isLoading, setIsLoading] = useState(false);
    const { showToast } = useToast();

    // Crypto State
    const [selectedCrypto, setSelectedCrypto] = useState<CryptoCurrency>('USDT');
    const [paymentDetails, setPaymentDetails] = useState<{ address: string, amount: string, txId: string } | null>(null);
    const [isConfirming, setIsConfirming] = useState(false);

    // Stripe State
    const [paymentStep, setPaymentStep] = useState<'input' | 'processing'>('input');

    useEffect(() => {
        if (isOpen) {
            setActiveTab(initialTab);
        } else {
            // Reset state on close
            setMeritAmount('');
            setPaymentDetails(null);
            setIsLoading(false);
            setIsConfirming(false);
            setPaymentStep('input');
        }
    }, [isOpen, initialTab]);
    
    // --- CRYPTO LOGIC ---
    const handleInitiateCryptoPayment = async () => {
        if (!user || !meritAmount || Number(meritAmount) <= 0) {
            showToast(t.invalidAmountError, 'error');
            return;
        }
        setIsLoading(true);
        setPaymentDetails(null);
        try {
            const details = await apiService.initiateMeritPurchase(user.id as number, meritAmount, selectedCrypto);
            setPaymentDetails({ address: details.paymentAddress, amount: details.amount, txId: details.transactionId });
        } catch (error: any) {
            showToast(error.message || t.creationError, 'error');
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleConfirmCryptoPayment = async () => {
        if (!user || !paymentDetails) return;
        setIsConfirming(true);
        try {
            await new Promise(resolve => setTimeout(resolve, 2000));
            const updatedUser = await apiService.confirmCryptoPayment(user.id as number, paymentDetails.txId);
            showToast(t.paymentSuccess.replace('{amount}', String(meritAmount)), 'success');
            onPaymentSuccess(updatedUser);
            onClose();
        } catch(error: any) {
            showToast(error.message || t.confirmationError, 'error');
        } finally {
            setIsConfirming(false);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        showToast(t.addressCopied, 'info');
    };
    
     // --- STRIPE LOGIC ---
    const handleStripePayment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !meritAmount || Number(meritAmount) <= 0) {
            showToast(t.invalidAmountError, 'error');
            return;
        }
        setIsLoading(true);
        
        try {
            const { clientSecret, paymentIntentId } = await apiService.initiateStripePurchase(user.id as number, meritAmount);
            if (!clientSecret || !paymentIntentId) throw new Error("Invalid response from server.");

            setPaymentStep('processing');
            await new Promise(resolve => setTimeout(resolve, 3000));

            const updatedUser = await apiService.confirmStripePayment(paymentIntentId);
            
            showToast(t.paymentSuccess.replace('{amount}', String(meritAmount)), 'success');
            onPaymentSuccess(updatedUser);
            onClose();

        } catch (error: any) {
            showToast(error.message || t.creationError, 'error');
            setPaymentStep('input');
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen || !user) return null;

    const CryptoButton = ({ type, icon }: { type: CryptoCurrency, icon: React.ReactNode }) => (
        <button
            type="button"
            onClick={() => setSelectedCrypto(type)}
            className={`flex-1 p-3 border-2 rounded-lg flex items-center justify-center space-x-2 transition-colors ${selectedCrypto === type ? 'border-primary bg-primary-light' : 'border-border-color hover:bg-background-light'}`}
        >
            {icon}
            <span className="font-semibold">{type}</span>
        </button>
    );
    
    const renderCryptoContent = () => {
        if (paymentDetails) {
            return (
                 <>
                    <div className="space-y-4 pt-4">
                        <div className="bg-background-light rounded-lg p-4 text-center">
                            <p className="text-sm text-text-light">{t.sendExactAmount}</p>
                            <p className="text-2xl font-bold text-primary">{paymentDetails!.amount} {selectedCrypto}</p>
                        </div>
                        <div className="bg-background-light rounded-lg p-4 space-y-2">
                            <label className="text-sm font-medium text-text-light">{t.toWalletAddress}</label>
                            <div className="flex items-center bg-white border border-border-color rounded-md p-2">
                                <input type="text" readOnly value={paymentDetails!.address} className="text-sm text-text-main flex-1 bg-transparent outline-none truncate"/>
                                <button onClick={() => copyToClipboard(paymentDetails!.address)} className="ml-2 p-1.5 rounded hover:bg-background-light">
                                    <svg className="w-4 h-4 text-text-light" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                                </button>
                            </div>
                        </div>
                        <div className="flex justify-center">
                            <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${paymentDetails!.address}`} alt="QR Code" className="border-4 border-white rounded-lg shadow-md" />
                        </div>
                    </div>
                    <div className="mt-6">
                        <button
                            onClick={handleConfirmCryptoPayment}
                            disabled={isConfirming}
                            className="w-full py-3 bg-primary text-text-on-primary rounded-md font-semibold hover:bg-primary-hover disabled:bg-gray-400 disabled:cursor-wait"
                        >
                            {isConfirming ? t.confirmingPayment : t.iHavePaid}
                        </button>
                         <button onClick={() => setPaymentDetails(null)} className="w-full py-2 mt-2 text-sm text-text-light hover:text-text-main">{t.goBack}</button>
                    </div>
                </>
            );
        }
        return (
             <>
                <div className="space-y-4">
                    <p className="text-sm font-medium">{t.selectCurrency}</p>
                    <div className="flex space-x-3">
                        <CryptoButton type="USDT" icon={<UsdtIcon className="w-6 h-6" />} />
                        <CryptoButton type="USDC" icon={<UsdcIcon className="w-6 h-6" />} />
                        <CryptoButton type="ETH" icon={<EthIcon className="w-6 h-6" />} />
                    </div>
                </div>
                <div className="mt-6">
                    <button
                        onClick={handleInitiateCryptoPayment}
                        disabled={isLoading || !meritAmount || Number(meritAmount) <= 0}
                        className="w-full py-3 bg-primary text-text-on-primary rounded-md font-semibold hover:bg-primary-hover disabled:bg-gray-400 disabled:cursor-wait"
                    >
                        {isLoading ? t.creatingTransaction : t.createTransaction}
                    </button>
                </div>
            </>
        );
    };

    const renderStripeContent = () => {
        if (paymentStep === 'processing') {
            return (
                <div className="text-center py-8">
                    <div className="w-12 h-12 border-4 border-dashed rounded-full animate-spin border-primary mx-auto"></div>
                    <p className="mt-4 font-semibold">{t.stripePaymentProcessing}</p>
                    <p className="text-xs text-text-light mt-2">{t.stripePaymentNote}</p>
                </div>
            );
        }
        return (
            <form onSubmit={handleStripePayment} className="mt-6">
                <button
                    type="submit"
                    disabled={isLoading || !meritAmount || Number(meritAmount) <= 0}
                    className="w-full py-3 bg-primary text-text-on-primary rounded-md font-semibold hover:bg-primary-hover disabled:bg-gray-400 disabled:cursor-wait"
                >
                    {isLoading ? t.stripePayingButton : t.stripePayButton}
                </button>
            </form>
        );
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-[60] flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-background-panel rounded-lg shadow-xl w-full max-w-md p-6 relative transform transition-all animate-fade-in-right" onClick={(e) => e.stopPropagation()}>
                <h2 className="text-2xl font-bold text-center mb-4">{t.title}</h2>

                <div className="border-b border-border-color">
                    <nav className="-mb-px flex space-x-6">
                        <button onClick={() => setActiveTab('crypto')} className={`py-3 px-1 font-medium border-b-2 ${activeTab === 'crypto' ? 'border-primary text-primary' : 'border-transparent text-text-light hover:text-text-main'}`}>{t.cryptoTab}</button>
                        <button onClick={() => setActiveTab('stripe')} className={`py-3 px-1 font-medium border-b-2 ${activeTab === 'stripe' ? 'border-primary text-primary' : 'border-transparent text-text-light hover:text-text-main'}`}>{t.stripeTab}</button>
                    </nav>
                </div>

                <div className="mt-6">
                     <div>
                        <label htmlFor="meritAmount" className="block text-sm font-medium text-text-main mb-1">{t.amountLabel}</label>
                        <input
                            type="number"
                            id="meritAmount"
                            value={meritAmount}
                            onChange={(e) => setMeritAmount(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                            placeholder={t.amountPlaceholder}
                            min="1"
                            className="w-full px-3 py-2 border border-border-color rounded-md shadow-sm focus:ring-primary focus:border-primary"
                            disabled={paymentDetails !== null || paymentStep === 'processing'}
                        />
                        {Number(meritAmount) > 0 && <p className="text-sm text-text-light mt-1">{t.equivalentVND.replace('{amount}', (Number(meritAmount) * 1000).toLocaleString(language))}</p>}
                    </div>
                </div>

                {activeTab === 'crypto' && renderCryptoContent()}
                {activeTab === 'stripe' && renderStripeContent()}
                
                <button onClick={onClose} className="w-full py-2 mt-2 text-sm text-text-light hover:text-text-main">{t.cancel}</button>
            </div>
        </div>
    );
};