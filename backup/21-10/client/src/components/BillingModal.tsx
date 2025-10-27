// client/src/components/BillingModal.tsx
import React, { useState, useEffect } from 'react';
import { User, Transaction } from '../types';
import { apiService } from '../services/apiService';
import { useToast } from './ToastProvider';
import CryptoPaymentModal from './CryptoPaymentModal';

interface BillingModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: User;
    onUserUpdate: (updatedData: Partial<User>) => void;
    language: 'vi' | 'en';
}

const translations = {
    vi: {
        title: 'Nạp Coin & Giao dịch',
        historyTab: 'Lịch sử Giao dịch',
        topUpTab: 'Nạp Coin',
        loading: 'Đang tải...',
        noTransactions: 'Bạn chưa có giao dịch nào.',
        topUpButton: 'Nạp Coin bằng Crypto',
        // History table headers
        date: 'Thời gian',
        coins: 'Số Coins',
        type: 'Loại',
        admin: 'Admin',
        // Transaction types
        typeManual: 'Thủ công',
        typeSubscription: 'Gói tháng',
        typeCrypto: 'Crypto',
    },
    en: {
        title: 'Top-up & Transactions',
        historyTab: 'Transaction History',
        topUpTab: 'Top-up Coins',
        loading: 'Loading...',
        noTransactions: 'You have no transactions yet.',
        topUpButton: 'Top-up with Crypto',
        // History table headers
        date: 'Date',
        coins: 'Coins',
        type: 'Type',
        admin: 'Admin',
        // Transaction types
        typeManual: 'Manual',
        typeSubscription: 'Subscription',
        typeCrypto: 'Crypto',
    }
};

const UserTransactionHistory: React.FC<{ user: User, language: 'vi' | 'en' }> = ({ user, language }) => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const t = translations[language];

    useEffect(() => {
        const fetchHistory = async () => {
            setIsLoading(true);
            try {
                const data = await apiService.getTransactionsForUser(user.id as number);
                setTransactions(data);
            } catch (error) {
                console.error("Failed to fetch user transaction history", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchHistory();
    }, [user.id]);
    
    const getTypeLabel = (type: string) => {
        switch (type) {
            case 'manual': return t.typeManual;
            case 'subscription': return t.typeSubscription;
            case 'crypto': return t.typeCrypto;
            default: return type;
        }
    };

    if (isLoading) return <p className="text-center p-4">{t.loading}</p>;

    return (
        <div className="overflow-x-auto">
            {transactions.length === 0 ? (
                <p className="text-center p-4 text-text-light">{t.noTransactions}</p>
            ) : (
                <table className="min-w-full divide-y divide-border-color">
                    <thead className="bg-background-light">
                        <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-text-light uppercase">{t.date}</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-text-light uppercase">{t.coins}</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-text-light uppercase">{t.type}</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-text-light uppercase">{t.admin}</th>
                        </tr>
                    </thead>
                    <tbody className="bg-background-panel divide-y divide-border-color">
                        {transactions.map(tx => (
                            <tr key={tx.id}>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-text-main">{new Date(tx.timestamp).toLocaleString(language)}</td>
                                <td className={`px-4 py-3 whitespace-nowrap text-sm font-semibold ${tx.coins >= 0 ? 'text-green-600' : 'text-red-600'}`}>{tx.coins >= 0 ? `+${tx.coins}` : tx.coins}</td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm"><span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${tx.type === 'crypto' ? 'bg-yellow-100 text-yellow-800' : tx.type === 'subscription' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>{getTypeLabel(tx.type)}</span></td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-text-light">{tx.adminName || 'System'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
};

const BillingModal: React.FC<BillingModalProps> = ({ isOpen, onClose, user, onUserUpdate, language }) => {
    const [activeTab, setActiveTab] = useState<'history' | 'topup'>('history');
    const [isCryptoModalOpen, setIsCryptoModalOpen] = useState(false);
    const t = translations[language];
    
    useEffect(() => {
        if (isOpen) {
            setActiveTab('history'); // Reset to history tab when opened
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handlePaymentSuccess = (updatedUser: User) => {
        onUserUpdate(updatedUser);
        setIsCryptoModalOpen(false); // Close crypto modal on success
    };

    return (
        <>
            <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4" onClick={onClose}>
                <div className="bg-background-panel rounded-lg shadow-xl w-full max-w-2xl relative transform transition-all animate-fade-in-right" onClick={(e) => e.stopPropagation()}>
                    <div className="p-6 border-b border-border-color">
                        <h2 className="text-2xl font-bold text-center">{t.title}</h2>
                        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">&times;</button>
                    </div>
                    
                    <div className="border-b border-border-color">
                        <nav className="flex justify-center -mb-px">
                            <button onClick={() => setActiveTab('history')} className={`py-3 px-6 font-medium text-sm border-b-2 ${activeTab === 'history' ? 'border-primary text-primary' : 'border-transparent text-text-light hover:text-primary'}`}>{t.historyTab}</button>
                            <button onClick={() => setActiveTab('topup')} className={`py-3 px-6 font-medium text-sm border-b-2 ${activeTab === 'topup' ? 'border-primary text-primary' : 'border-transparent text-text-light hover:text-primary'}`}>{t.topUpTab}</button>
                        </nav>
                    </div>

                    <div className="p-6 min-h-[300px] max-h-[60vh] overflow-y-auto">
                        {activeTab === 'history' && <UserTransactionHistory user={user} language={language} />}
                        {activeTab === 'topup' && (
                            <div className="flex flex-col items-center justify-center h-full p-8">
                                <p className="text-lg text-text-main mb-2">Số dư hiện tại của bạn:</p>
                                <p className="text-4xl font-bold text-primary mb-8">{user.coins ?? 'Không giới hạn'} Coins</p>
                                <button
                                    onClick={() => setIsCryptoModalOpen(true)}
                                    className="w-full max-w-xs py-3 bg-primary text-text-on-primary rounded-md font-semibold hover:bg-primary-hover"
                                >
                                    {t.topUpButton}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            {/* Crypto Modal is rendered outside but controlled from here */}
            <CryptoPaymentModal
                isOpen={isCryptoModalOpen}
                onClose={() => setIsCryptoModalOpen(false)}
                user={user}
                onPaymentSuccess={handlePaymentSuccess}
            />
        </>
    );
};

export default BillingModal;