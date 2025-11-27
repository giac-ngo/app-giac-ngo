// client/src/components/admin/BillingManagement.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { User, Transaction, WithdrawalRequest } from '../../types';
import { apiService } from '../../services/apiService';
import { useToast } from '../ToastProvider';

interface BillingManagementProps {
    user: User;
    language: 'vi' | 'en';
    onUserUpdate: (updatedData: Partial<User>) => void;
}

const translations = {
    vi: {
        historyTitle: 'Lịch sử Giao dịch Chung',
        withdrawalTitle: 'Yêu cầu Rút tiền',
        loading: 'Đang tải...',
        user: 'Người dùng',
        admin: 'Admin',
        merits: 'Số Merits',
        type: 'Loại',
        date: 'Thời gian',
        status: 'Trạng thái',
        actions: 'Hành động',
        approve: 'Duyệt',
        reject: 'Từ chối',
        noTransactions: 'Không có giao dịch nào.',
        noWithdrawals: 'Không có yêu cầu rút tiền nào.',
        typeManual: 'Thủ công',
        typeSubscription: 'Gói tháng',
        typeCrypto: 'Crypto',
        typeStripe: 'Stripe',
        typeOffering: 'Cúng dường',
        typeWithdrawal: 'Rút tiền',
        approveSuccess: 'Đã duyệt yêu cầu rút tiền.',
        approveError: 'Duyệt yêu cầu thất bại.',
        rejectSuccess: 'Đã từ chối yêu cầu.',
        rejectError: 'Từ chối yêu cầu thất bại.',
    },
    en: {
        historyTitle: 'Global Transaction History',
        withdrawalTitle: 'Withdrawal Requests',
        loading: 'Loading...',
        user: 'User',
        admin: 'Admin',
        merits: 'Merits',
        type: 'Type',
        date: 'Date',
        status: 'Status',
        actions: 'Actions',
        approve: 'Approve',
        reject: 'Reject',
        noTransactions: 'No transactions found.',
        noWithdrawals: 'No withdrawal requests.',
        typeManual: 'Manual',
        typeSubscription: 'Subscription',
        typeCrypto: 'Crypto',
        typeStripe: 'Stripe',
        typeOffering: 'Offering',
        typeWithdrawal: 'Withdrawal',
        approveSuccess: 'Withdrawal request approved.',
        approveError: 'Failed to approve request.',
        rejectSuccess: 'Withdrawal request rejected.',
        rejectError: 'Failed to reject request.',
    }
}

const TransactionHistory: React.FC<{ language: 'vi' | 'en', refreshKey: number }> = ({ language, refreshKey }) => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const t = translations[language];

    const fetchTransactions = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await apiService.getAllTransactions();
            setTransactions(data);
        } catch (error) {
            console.error("Failed to fetch transactions", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTransactions();
    }, [refreshKey, fetchTransactions]);

    const getTypeLabel = (type: string) => {
        switch (type) {
            case 'manual': return t.typeManual;
            case 'subscription': return t.typeSubscription;
            case 'crypto': return t.typeCrypto;
            case 'stripe': return t.typeStripe;
            case 'offering': return t.typeOffering;
            case 'withdrawal': return t.typeWithdrawal;
            default: return type;
        }
    };

    if (isLoading) {
        return <div className="p-8 text-center">{t.loading}</div>;
    }

    return (
        <div className="bg-background-panel shadow-md rounded-lg overflow-hidden">
            <h2 className="text-2xl font-bold p-6">{t.historyTitle}</h2>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-border-color">
                    <thead className="bg-background-light">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-text-light uppercase tracking-wider">{t.date}</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-text-light uppercase tracking-wider">{t.user}</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-text-light uppercase tracking-wider">{t.merits}</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-text-light uppercase tracking-wider">{t.type}</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-text-light uppercase tracking-wider">{t.admin}</th>
                        </tr>
                    </thead>
                    <tbody className="bg-background-panel divide-y divide-border-color">
                        {transactions.map(tx => (
                            <tr key={tx.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">{new Date(tx.timestamp).toLocaleString(language)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-text-main">{tx.userName}</td>
                                <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${tx.merits >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {tx.merits >= 0 ? `+${tx.merits}` : tx.merits}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary capitalize">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                        ${tx.type === 'crypto' || tx.type === 'stripe' ? 'bg-yellow-100 text-yellow-800' : 
                                        tx.type === 'subscription' ? 'bg-blue-100 text-blue-800' : 
                                        tx.type === 'offering' ? 'bg-purple-100 text-purple-800' : 
                                        tx.type === 'withdrawal' ? 'bg-red-100 text-red-800' : 
                                        'bg-gray-100 text-gray-800'}`}>
                                    {getTypeLabel(tx.type)}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">{tx.adminName || 'System'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
             {transactions.length === 0 && <p className="text-center py-4 text-text-light">{t.noTransactions}</p>}
        </div>
    );
};

const WithdrawalRequests: React.FC<{ language: 'vi' | 'en', onUpdate: () => void }> = ({ language, onUpdate }) => {
    const [requests, setRequests] = useState<WithdrawalRequest[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const { showToast } = useToast();
    const t = translations[language];

    const fetchRequests = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await apiService.getWithdrawalRequests();
            setRequests(data);
        } catch (error) {
            console.error("Failed to fetch withdrawal requests", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchRequests();
    }, [fetchRequests]);

    const handleAction = async (id: number, action: 'approve' | 'reject') => {
        try {
            await apiService.processWithdrawalRequest(id, action);
            showToast(action === 'approve' ? t.approveSuccess : t.rejectSuccess, 'success');
            onUpdate(); // Trigger refresh in parent
            fetchRequests(); // Re-fetch its own list
        } catch (error: any) {
            showToast(action === 'approve' ? t.approveError : t.rejectError, 'error');
        }
    };
    
    if (isLoading) return <div className="p-8 text-center">{t.loading}</div>;

     return (
        <div className="bg-background-panel shadow-md rounded-lg overflow-hidden">
            <h2 className="text-2xl font-bold p-6">{t.withdrawalTitle}</h2>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-border-color">
                    <thead className="bg-background-light">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-text-light uppercase tracking-wider">{t.date}</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-text-light uppercase tracking-wider">{t.user}</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-text-light uppercase tracking-wider">{t.merits}</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-text-light uppercase tracking-wider">{t.status}</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-text-light uppercase tracking-wider">{t.actions}</th>
                        </tr>
                    </thead>
                    <tbody className="bg-background-panel divide-y divide-border-color">
                        {requests.map(req => (
                            <tr key={req.id}>
                                <td className="px-6 py-4">{new Date(req.createdAt).toLocaleString(language)}</td>
                                <td className="px-6 py-4 font-medium">{req.userName}</td>
                                <td className="px-6 py-4 font-semibold text-red-600">{req.amount}</td>
                                <td className="px-6 py-4">{req.status}</td>
                                <td className="px-6 py-4 text-right space-x-2">
                                    {req.status === 'pending' && (
                                        <>
                                            <button onClick={() => handleAction(req.id, 'approve')} className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700">{t.approve}</button>
                                            <button onClick={() => handleAction(req.id, 'reject')} className="px-3 py-1 text-sm bg-yellow-600 text-white rounded hover:bg-yellow-700">{t.reject}</button>
                                        </>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {requests.length === 0 && <p className="text-center py-4 text-text-light">{t.noWithdrawals}</p>}
        </div>
    );
};


export const BillingManagement: React.FC<BillingManagementProps> = ({ language }) => {
    const [refreshKey, setRefreshKey] = useState(0);

    const handleUpdate = () => {
        setRefreshKey(prev => prev + 1);
    };

    return (
        <div className="p-8 space-y-8">
             <WithdrawalRequests language={language} onUpdate={handleUpdate} />
             <TransactionHistory language={language} refreshKey={refreshKey} />
        </div>
    );
};