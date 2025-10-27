import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { apiService } from '../services/apiService';
import { useToast } from './ToastProvider';
import { UsdtIcon, UsdcIcon, EthIcon } from './Icons';

type CryptoCurrency = 'USDT' | 'USDC' | 'ETH';

const translations = {
    vi: {
        title: "Nạp Merit bằng Crypto",
        amountLabel: "Số merit muốn nạp",
        amountPlaceholder: "VD: 100",
        equivalent: "Tương đương: {amount}đ",
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
        creationError: "Không thể tạo giao dịch crypto.",
        addressCopied: "Đã sao chép địa chỉ ví!",
        paymentSuccess: "Thanh toán thành công! Đã cộng {amount} merits vào tài khoản.",
        confirmationError: "Xác nhận thanh toán thất bại.",
    },
    en: {
        title: "Top up Merits with Crypto",
        amountLabel: "Amount of merits to top up",
        amountPlaceholder: "E.g., 100",
        equivalent: "Equivalent to: {amount} VND",
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
        creationError: "Could not create crypto transaction.",
        addressCopied: "Wallet address copied!",
        paymentSuccess: "Payment successful! {amount} merits have been added to your account.",
        confirmationError: "Payment confirmation failed.",
    }
};

interface CryptoMeritPaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: User | null;
    onPaymentSuccess: (updatedUser: User) => void;
    language: 'vi' | 'en';
}

const CryptoMeritPaymentModal: React.FC<CryptoMeritPaymentModalProps> = ({ isOpen, onClose, user, onPaymentSuccess, language }) => {
    const t = translations[language];
    const [meritAmount, setMeritAmount] = useState<number | ''>('');
    const [selectedCrypto, setSelectedCrypto] = useState<CryptoCurrency>('USDT');
    const [paymentDetails, setPaymentDetails] = useState<{ address: string, amount: string, txId: string } | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isConfirming, setIsConfirming] = useState(false);
    const { showToast } = useToast();

    useEffect(() => {
        if (!isOpen) {
            setMeritAmount('');
            setPaymentDetails(null);
            setIsLoading(false);
            setIsConfirming(false);
        }
    }, [isOpen]);

    const handleInitiatePayment = async () => {
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
    
    const handleConfirmPayment = async () => {
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

    if (!isOpen || !user) return null;

    const CryptoButton = ({ type, icon }: { type: CryptoCurrency, icon: React.ReactNode }) => (
        <button
            onClick={() => setSelectedCrypto(type)}
            className={`flex-1 p-3 border-2 rounded-lg flex items-center justify-center space-x-2 transition-colors ${selectedCrypto === type ? 'border-primary bg-primary-light' : 'border-border-color hover:bg-background-light'}`}
        >
            {icon}
            <span className="font-semibold">{type}</span>
        </button>
    );

    const renderStepOne = () => (
        <>
            <div className="space-y-4">
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
                    />
                    {Number(meritAmount) > 0 && <p className="text-sm text-text-light mt-1">{t.equivalent.replace('{amount}', (Number(meritAmount) * 1000).toLocaleString(language))}</p>}
                </div>

                <p className="text-sm font-medium">{t.selectCurrency}</p>
                <div className="flex space-x-3">
                    <CryptoButton type="USDT" icon={<UsdtIcon className="w-6 h-6" />} />
                    <CryptoButton type="USDC" icon={<UsdcIcon className="w-6 h-6" />} />
                    <CryptoButton type="ETH" icon={<EthIcon className="w-6 h-6" />} />
                </div>
            </div>
            <div className="mt-6">
                <button
                    onClick={handleInitiatePayment}
                    disabled={isLoading || !meritAmount || Number(meritAmount) <= 0}
                    className="w-full py-3 bg-primary text-text-on-primary rounded-md font-semibold hover:bg-primary-hover disabled:bg-gray-400 disabled:cursor-wait"
                >
                    {isLoading ? t.creatingTransaction : t.createTransaction}
                </button>
                <button onClick={onClose} className="w-full py-2 mt-2 text-sm text-text-light hover:text-text-main">{t.cancel}</button>
            </div>
        </>
    );

    const renderStepTwo = () => (
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
                    onClick={handleConfirmPayment}
                    disabled={isConfirming}
                    className="w-full py-3 bg-primary text-text-on-primary rounded-md font-semibold hover:bg-primary-hover disabled:bg-gray-400 disabled:cursor-wait"
                >
                    {isConfirming ? t.confirmingPayment : t.iHavePaid}
                </button>
                 <button onClick={() => setPaymentDetails(null)} className="w-full py-2 mt-2 text-sm text-text-light hover:text-text-main">{t.goBack}</button>
            </div>
        </>
    );

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-[60] flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-background-panel rounded-lg shadow-xl w-full max-w-md p-6 relative transform transition-all animate-fade-in-right" onClick={(e) => e.stopPropagation()}>
                <h2 className="text-2xl font-bold text-center mb-4">{t.title}</h2>
                {!paymentDetails ? renderStepOne() : renderStepTwo()}
            </div>
        </div>
    );
};

export default CryptoMeritPaymentModal;