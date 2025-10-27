import React, { useState, useEffect } from 'react';
import CryptoPaymentModal from '../CryptoPaymentModal';
import { User, Transaction } from '../../types';
import { apiService } from '../../services/apiService';

interface BillingManagementProps {
    user: User;
    language: 'vi' | 'en';
    onUserUpdate: (updatedData: Partial<User>) => void;
}

const translations = {
    vi: {
        historyTitle: 'Lịch sử Giao dịch',
        loading: 'Đang tải lịch sử...',
        user: 'Người dùng',
        admin: 'Admin',
        coins: 'Số Coins',
        type: 'Loại',
        date: 'Thời gian',
        noTransactions: 'Không có giao dịch nào.',
        typeManual: 'Thủ công',
        typeSubscription: 'Gói tháng',
        typeCrypto: 'Crypto',
        topUpCrypto: 'Nạp Coin bằng Crypto',
    },
    en: {
        historyTitle: 'Transaction History',
        loading: 'Loading history...',
        user: 'User',
        admin: 'Admin',
        coins: 'Coins',
        type: 'Type',
        date: 'Date',
        noTransactions: 'No transactions found.',
        typeManual: 'Manual',
        typeSubscription: 'Subscription',
        typeCrypto: 'Crypto',
        topUpCrypto: 'Top-up with Crypto',
    }
}

const TransactionHistory: React.FC<{ language: 'vi' | 'en' }> = ({ language }) => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const t = translations[language];

    useEffect(() => {
        const fetchTransactions = async () => {
            setIsLoading(true);
            try {
                const data = await apiService.getAllTransactions();
                setTransactions(data);
            } catch (error) {
                console.error("Failed to fetch transactions", error);
                alert("Could not load transaction history.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchTransactions();
    }, []);

    const getTypeLabel = (type: string) => {
        switch (type) {
            case 'manual': return t.typeManual;
            case 'subscription': return t.typeSubscription;
            case 'crypto': return t.typeCrypto;
            default: return type;
        }
    };

    if (isLoading) {
        return <div className="p-8 text-center">{t.loading}</div>;
    }

    return (
        <div className="p-8">
            <h2 className="text-2xl font-bold mb-6">{t.historyTitle}</h2>
            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t.date}</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t.user}</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t.coins}</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t.type}</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t.admin}</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {transactions.map(tx => (
                            <tr key={tx.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{new Date(tx.timestamp).toLocaleString(language)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{tx.userName}</td>
                                <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${tx.coins >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {tx.coins >= 0 ? `+${tx.coins}` : tx.coins}
                                </td>
                                 <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                        ${tx.type === 'crypto' ? 'bg-yellow-100 text-yellow-800' : 
                                          tx.type === 'subscription' ? 'bg-blue-100 text-blue-800' : 
                                          'bg-gray-100 text-gray-800'}`}>
                                      {getTypeLabel(tx.type)}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{tx.adminName || 'System'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {transactions.length === 0 && <p className="text-center py-4 text-gray-500">{t.noTransactions}</p>}
            </div>
        </div>
    );
};


const BillingManagement: React.FC<BillingManagementProps> = ({ user, language, onUserUpdate }) => {
    const [refreshKey, setRefreshKey] = useState(0);
    const [isCoinPurchaseModalOpen, setIsCoinPurchaseModalOpen] = useState(false);
    const t = translations[language];

    const handleTransactionSuccess = () => {
        setRefreshKey(prevKey => prevKey + 1);
    };

    return (
        <div>                  
            <TransactionHistory language={language} key={refreshKey} />

            <CryptoPaymentModal 
                isOpen={isCoinPurchaseModalOpen}
                onClose={() => setIsCoinPurchaseModalOpen(false)}
                user={user}
                onPaymentSuccess={onUserUpdate}
            />
        </div>
    );
};

export default BillingManagement;