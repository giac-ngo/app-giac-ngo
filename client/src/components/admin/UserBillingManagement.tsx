import React, { useState, useEffect } from 'react';
import { User, Transaction } from '../../types';
import { apiService } from '../../services/apiService';
import { MeritPaymentModal } from '../MeritPaymentModal';


// Translations
const translations = {
    vi: {
        title: "Quản lý Giao dịch & Nạp Merit",
        balanceTitle: "Số dư hiện tại",
        unlimited: "Không giới hạn",
        merits: "Merits",
        topUpCryptoButton: "Nạp bằng Crypto",
        topUpStripeButton: "Nạp qua Stripe",
        historyTitle: "Lịch sử Giao dịch của bạn",
        loading: 'Đang tải...',
        noTransactions: 'Bạn chưa có giao dịch nào.',
        date: 'Thời gian',
        meritsColumn: 'Số Merits',
        type: 'Loại',
        admin: 'Admin',
        typeManual: 'Thủ công',
        typeSubscription: 'Gói tháng',
        typeCrypto: 'Crypto',
        typeStripe: 'Stripe',
    },
    en: {
        title: "Transactions & Merit Top-up",
        balanceTitle: "Current Balance",
        unlimited: "Unlimited",
        merits: "Merits",
        topUpCryptoButton: "Top-up with Crypto",
        topUpStripeButton: "Top-up with Stripe",
        historyTitle: "Your Transaction History",
        loading: 'Loading...',
        noTransactions: 'You have no transactions yet.',
        date: 'Date',
        meritsColumn: 'Merits',
        type: 'Type',
        admin: 'Admin',
        typeManual: 'Manual',
        typeSubscription: 'Subscription',
        typeCrypto: 'Crypto',
        typeStripe: 'Stripe',
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
                if (typeof user.id === 'number') {
                    const data = await apiService.getTransactionsForUser(user.id);
                    setTransactions(data);
                }
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
            case 'stripe': return t.typeStripe;
            default: return type;
        }
    };
    
    if (isLoading) return <div className="text-center p-4 bg-white shadow-md rounded-lg">{t.loading}</div>;

    return (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-border-color">
                    <thead className="bg-background-light">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-text-light uppercase">{t.date}</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-text-light uppercase">{t.meritsColumn}</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-text-light uppercase">{t.type}</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-text-light uppercase">{t.admin}</th>
                        </tr>
                    </thead>
                    <tbody className="bg-background-panel divide-y divide-border-color">
                        {transactions.length === 0 ? (
                            <tr><td colSpan={4} className="text-center py-4 text-text-light">{t.noTransactions}</td></tr>
                        ) : (
                            transactions.map(tx => (
                                <tr key={tx.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-main">{new Date(tx.timestamp).toLocaleString(language)}</td>
                                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${tx.merits >= 0 ? 'text-green-600' : 'text-red-600'}`}>{tx.merits >= 0 ? `+${tx.merits}` : tx.merits}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm"><span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${tx.type === 'crypto' ? 'bg-yellow-100 text-yellow-800' : tx.type === 'stripe' ? 'bg-indigo-100 text-indigo-800' : tx.type === 'subscription' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>{getTypeLabel(tx.type)}</span></td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-light">{tx.adminName || 'System'}</td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

interface UserBillingManagementProps {
    user: User;
    language: 'vi' | 'en';
    onUserUpdate: (data: Partial<User>) => void;
}

export const UserBillingManagement: React.FC<UserBillingManagementProps> = ({ user, language, onUserUpdate }) => {
    const [meritModal, setMeritModal] = useState<{isOpen: boolean; initialTab: 'crypto' | 'stripe'}>({ isOpen: false, initialTab: 'crypto' });
    const t = translations[language];

    const handlePaymentSuccess = (updatedUser: User) => {
        onUserUpdate(updatedUser);
        setMeritModal({ isOpen: false, initialTab: 'crypto' });
    };

    // This logic is safer and handles cases where `user.merits` might be undefined or null.
    const meritsDisplay = typeof user.merits === 'number'
        ? `${user.merits.toLocaleString(language)} ${t.merits}`
        : t.unlimited;

    return (
        <div className="p-8 space-y-8">
            <h1 className="text-3xl font-bold text-text-main">{t.title}</h1>
            
            <div className="bg-white shadow-md rounded-lg p-6 flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h2 className="text-lg font-medium text-text-light">{t.balanceTitle}</h2>
                    <p className="text-4xl font-bold text-primary mt-1">
                        {meritsDisplay}
                    </p>
                </div>
                <div className="flex items-center space-x-3">
                    <button
                        onClick={() => setMeritModal({ isOpen: true, initialTab: 'stripe' })}
                        className="px-5 py-3 bg-indigo-600 text-white rounded-md font-semibold hover:bg-indigo-700 transition-colors flex items-center space-x-2"
                    >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M14 11.22V22h8V11.22A5.993 5.993 0 0017 9c-1.85 0-3.5 .84-4.63 2.17L14 11.22zM2 12.78V2h8v10.78A5.993 5.993 0 0015 15c1.85 0 3.5-.84 4.63-2.17L18 12.78V2h4v10.78c-1.17 1.45-2.99 2.4-5 2.4s-3.83-.95-5-2.4V22H2V12.78z" /></svg>
                        <span>{t.topUpStripeButton}</span>
                    </button>
                    <button
                        onClick={() => setMeritModal({ isOpen: true, initialTab: 'crypto' })}
                        className="px-5 py-3 bg-primary text-text-on-primary rounded-md font-semibold hover:bg-primary-hover transition-colors flex items-center space-x-2"
                    >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" /></svg>
                        <span>{t.topUpCryptoButton}</span>
                    </button>
                </div>
            </div>

            <div>
                <h2 className="text-2xl font-bold mb-4 text-text-main">{t.historyTitle}</h2>
                <UserTransactionHistory user={user} language={language} />
            </div>

            <MeritPaymentModal
                isOpen={meritModal.isOpen}
                onClose={() => setMeritModal({ ...meritModal, isOpen: false })}
                initialTab={meritModal.initialTab}
                user={user}
                onPaymentSuccess={handlePaymentSuccess}
                language={language}
            />
        </div>
    );
};