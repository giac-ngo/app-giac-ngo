import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { apiService } from '../services/apiService';
import { useToast } from './ToastProvider';
import { UsdtIcon, UsdcIcon, EthIcon } from './Icons';

type CryptoCurrency = 'USDT' | 'USDC' | 'ETH';

interface CryptoPaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: User | null;
    onPaymentSuccess: (updatedUser: User) => void;
}

const CryptoPaymentModal: React.FC<CryptoPaymentModalProps> = ({ isOpen, onClose, user, onPaymentSuccess }) => {
    const [coinAmount, setCoinAmount] = useState<number | ''>('');
    const [selectedCrypto, setSelectedCrypto] = useState<CryptoCurrency>('USDT');
    const [paymentDetails, setPaymentDetails] = useState<{ address: string, amount: string, txId: string } | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isConfirming, setIsConfirming] = useState(false);
    const { showToast } = useToast();

    useEffect(() => {
        if (!isOpen) {
            setCoinAmount('');
            setPaymentDetails(null);
            setIsLoading(false);
            setIsConfirming(false);
        }
    }, [isOpen]);

    const handleInitiatePayment = async () => {
        if (!user || !coinAmount || Number(coinAmount) <= 0) {
            showToast('Vui lòng nhập số coin hợp lệ.', 'error');
            return;
        }
        setIsLoading(true);
        setPaymentDetails(null);
        try {
            const details = await apiService.initiateCoinPurchase(user.id as number, coinAmount, selectedCrypto);
            setPaymentDetails({ address: details.paymentAddress, amount: details.amount, txId: details.transactionId });
        } catch (error: any) {
            showToast(error.message || 'Không thể tạo giao dịch crypto.', 'error');
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
            showToast(`Thanh toán thành công! Đã cộng ${coinAmount} coins vào tài khoản.`, 'success');
            onPaymentSuccess(updatedUser);
            onClose();
        } catch(error: any) {
            showToast(error.message || 'Xác nhận thanh toán thất bại.', 'error');
        } finally {
            setIsConfirming(false);
        }
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        showToast('Đã sao chép địa chỉ ví!', 'info');
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
                    <label htmlFor="coinAmount" className="block text-sm font-medium text-text-main mb-1">Số coin muốn nạp</label>
                    <input
                        type="number"
                        id="coinAmount"
                        value={coinAmount}
                        onChange={(e) => setCoinAmount(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                        placeholder="VD: 100"
                        min="1"
                        className="w-full px-3 py-2 border border-border-color rounded-md shadow-sm focus:ring-primary focus:border-primary"
                    />
                    {Number(coinAmount) > 0 && <p className="text-sm text-text-light mt-1">Tương đương: {(Number(coinAmount) * 1000).toLocaleString('vi-VN')}đ</p>}
                </div>

                <p className="text-sm font-medium">Chọn loại tiền tệ thanh toán:</p>
                <div className="flex space-x-3">
                    <CryptoButton type="USDT" icon={<UsdtIcon className="w-6 h-6" />} />
                    <CryptoButton type="USDC" icon={<UsdcIcon className="w-6 h-6" />} />
                    <CryptoButton type="ETH" icon={<EthIcon className="w-6 h-6" />} />
                </div>
            </div>
            <div className="mt-6">
                <button
                    onClick={handleInitiatePayment}
                    disabled={isLoading || !coinAmount || Number(coinAmount) <= 0}
                    className="w-full py-3 bg-primary text-text-on-primary rounded-md font-semibold hover:bg-primary-hover disabled:bg-gray-400 disabled:cursor-wait"
                >
                    {isLoading ? 'Đang tạo giao dịch...' : 'Tạo giao dịch'}
                </button>
                <button onClick={onClose} className="w-full py-2 mt-2 text-sm text-text-light hover:text-text-main">Hủy</button>
            </div>
        </>
    );

    const renderStepTwo = () => (
        <>
            <div className="space-y-4 pt-4">
                <div className="bg-background-light rounded-lg p-4 text-center">
                    <p className="text-sm text-text-light">Vui lòng gửi chính xác</p>
                    <p className="text-2xl font-bold text-primary">{paymentDetails!.amount} {selectedCrypto}</p>
                </div>
                <div className="bg-background-light rounded-lg p-4 space-y-2">
                    <label className="text-sm font-medium text-text-light">Tới địa chỉ ví:</label>
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
                    {isConfirming ? 'Đang xác thực giao dịch...' : 'Tôi đã thanh toán'}
                </button>
                 <button onClick={() => setPaymentDetails(null)} className="w-full py-2 mt-2 text-sm text-text-light hover:text-text-main">Quay lại</button>
            </div>
        </>
    );

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-[60] flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-background-panel rounded-lg shadow-xl w-full max-w-md p-6 relative transform transition-all animate-fade-in-right" onClick={(e) => e.stopPropagation()}>
                <h2 className="text-2xl font-bold text-center mb-4">Nạp Coin bằng Crypto</h2>
                {!paymentDetails ? renderStepOne() : renderStepTwo()}
            </div>
        </div>
    );
};

export default CryptoPaymentModal;
