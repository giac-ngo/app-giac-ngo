// client/src/components/admin/SpaceOwnerBilling.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { User, SpaceOwnerData } from '../../types';
import { apiService } from '../../services/apiService';
import { useToast } from '../ToastProvider';


const translations = {
    vi: {
        title: 'Ví Space',
        loading: 'Đang tải dữ liệu...',
        fetchError: 'Không thể tải dữ liệu ví của bạn.',
        totalEarnings: 'Tổng Doanh thu',
        merits: 'Merits',
        payoutAccount: 'Tài khoản Thanh toán',
        stripeAccountId: 'Stripe Account ID',
        stripeAccountIdDesc: 'ID tài khoản Stripe của bạn để nhận thanh toán.',
        save: 'Lưu',
        saving: 'Đang lưu...',
        saveSuccess: 'Đã cập nhật Stripe Account ID!',
        saveError: 'Lưu thất bại: {message}',
        withdrawal: 'Rút tiền',
        amountToWithdraw: 'Số Merit muốn rút',
        requestWithdrawal: 'Gửi yêu cầu',
        requesting: 'Đang gửi...',
        requestSuccess: 'Yêu cầu rút tiền đã được gửi!',
        requestError: 'Yêu cầu thất bại: {message}',
        revenueHistory: 'Lịch sử Doanh thu',
        date: 'Ngày',
        fromUser: 'Từ Người dùng',
        amount: 'Số tiền',
        type: 'Loại',
        space: 'Không gian',
        withdrawalHistory: 'Lịch sử Rút tiền',
        status: 'Trạng thái',
        noRevenue: 'Chưa có doanh thu nào.',
        noWithdrawals: 'Chưa có yêu cầu rút tiền nào.',
    },
    en: {
        title: 'Space Wallet',
        loading: 'Loading data...',
        fetchError: 'Could not load your wallet data.',
        totalEarnings: 'Total Earnings',
        merits: 'Merits',
        payoutAccount: 'Payout Account',
        stripeAccountId: 'Stripe Account ID',
        stripeAccountIdDesc: 'Your Stripe Account ID for receiving payments.',
        save: 'Save',
        saving: 'Saving...',
        saveSuccess: 'Stripe Account ID updated!',
        saveError: 'Save failed: {message}',
        withdrawal: 'Withdrawal',
        amountToWithdraw: 'Amount of Merits to withdraw',
        requestWithdrawal: 'Request Withdrawal',
        requesting: 'Requesting...',
        requestSuccess: 'Withdrawal request sent!',
        requestError: 'Request failed: {message}',
        revenueHistory: 'Revenue History',
        date: 'Date',
        fromUser: 'From User',
        amount: 'Amount',
        type: 'Type',
        space: 'Space',
        withdrawalHistory: 'Withdrawal History',
        status: 'Status',
        noRevenue: 'No revenue yet.',
        noWithdrawals: 'No withdrawal requests yet.',
    }
};

export const SpaceOwnerBilling: React.FC<{ user: User; onUserUpdate: (data: Partial<User>) => void; language: 'vi' | 'en' }> = ({ user, onUserUpdate, language }) => {
    const t = translations[language];
    const { showToast } = useToast();
    const [data, setData] = useState<SpaceOwnerData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [stripeAccountId, setStripeAccountId] = useState(user.stripeAccountId || '');
    const [withdrawalAmount, setWithdrawalAmount] = useState<number | ''>('');
    const [isSavingStripe, setIsSavingStripe] = useState(false);
    const [isRequesting, setIsRequesting] = useState(false);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const result = await apiService.getMySpaceOwnerData();
            setData(result);
            setStripeAccountId(result.stripeAccountId || '');
        } catch (error) {
            showToast(t.fetchError, 'error');
        } finally {
            setIsLoading(false);
        }
    }, [showToast, t.fetchError]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleSaveStripeId = async () => {
        setIsSavingStripe(true);
        try {
            const updatedUser = await apiService.updateUser({ id: user.id, stripeAccountId });
            onUserUpdate(updatedUser);
            showToast(t.saveSuccess, 'success');
        } catch (error: any) {
            showToast(t.saveError.replace('{message}', error.message), 'error');
        } finally {
            setIsSavingStripe(false);
        }
    };
    
    const handleRequestWithdrawal = async () => {
        if (!withdrawalAmount || withdrawalAmount <= 0) return;
        setIsRequesting(true);
        try {
            await apiService.createWithdrawalRequest(user.id as number, withdrawalAmount);
            showToast(t.requestSuccess, 'success');
            setWithdrawalAmount('');
            fetchData(); // Refresh data after request
        } catch (error: any) {
             showToast(t.requestError.replace('{message}', error.message), 'error');
        } finally {
            setIsRequesting(false);
        }
    };

    if (isLoading) return <div className="p-8 text-center">{t.loading}</div>;
    if (!data) return <div className="p-8 text-center">{t.fetchError}</div>;
    
    const getSpaceName = (spaceId?: number) => data.ownedSpaces.find(s => s.id === spaceId)?.name || 'N/A';

    return (
        <div className="p-8 space-y-8">
            <h1 className="text-3xl font-bold">{t.title}</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-1 bg-white shadow-md rounded-lg p-6">
                    <h2 className="text-lg font-medium text-text-light">{t.totalEarnings}</h2>
                    <p className="text-4xl font-bold text-primary mt-1">{data.totalEarnings.toLocaleString(language)} <span className="text-2xl">{t.merits}</span></p>
                </div>
                <div className="md:col-span-2 bg-white shadow-md rounded-lg p-6 space-y-4">
                    <h2 className="text-lg font-semibold">{t.payoutAccount}</h2>
                    <div>
                        <label className="block text-sm font-medium">{t.stripeAccountId}</label>
                        <div className="flex gap-2">
                            <input type="text" value={stripeAccountId} onChange={e => setStripeAccountId(e.target.value)} className="mt-1 w-full p-2 border rounded-md" />
                            <button onClick={handleSaveStripeId} disabled={isSavingStripe} className="px-4 py-2 bg-primary text-white rounded-md">{isSavingStripe ? t.saving : t.save}</button>
                        </div>
                        <p className="text-xs text-text-light mt-1">{t.stripeAccountIdDesc}</p>
                    </div>
                </div>
            </div>
            
             <div className="bg-white shadow-md rounded-lg p-6 space-y-4">
                <h2 className="text-lg font-semibold">{t.withdrawal}</h2>
                <div className="flex items-end gap-2">
                     <div className="flex-grow">
                        <label className="block text-sm font-medium">{t.amountToWithdraw}</label>
                        <input type="number" value={withdrawalAmount} onChange={e => setWithdrawalAmount(e.target.value === '' ? '' : Number(e.target.value))} className="mt-1 w-full p-2 border rounded-md" />
                    </div>
                    <button onClick={handleRequestWithdrawal} disabled={isRequesting || !withdrawalAmount} className="px-4 py-2 bg-primary text-white rounded-md h-10">{isRequesting ? t.requesting : t.requestWithdrawal}</button>
                </div>
            </div>

            <div className="space-y-8">
                <div>
                    <h2 className="text-2xl font-bold mb-4">{t.revenueHistory}</h2>
                    <div className="bg-white shadow-md rounded-lg overflow-x-auto">
                        <table className="min-w-full divide-y">
                            <thead className="bg-gray-50"><tr><th className="px-6 py-3 text-left text-xs font-medium uppercase">{t.date}</th><th className="px-6 py-3 text-left text-xs font-medium uppercase">{t.fromUser}</th><th className="px-6 py-3 text-left text-xs font-medium uppercase">{t.amount}</th><th className="px-6 py-3 text-left text-xs font-medium uppercase">{t.type}</th><th className="px-6 py-3 text-left text-xs font-medium uppercase">{t.space}</th></tr></thead>
                            <tbody className="bg-white divide-y">{data.revenueHistory.length === 0 ? (<tr><td colSpan={5} className="text-center py-4">{t.noRevenue}</td></tr>) : data.revenueHistory.map(tx => (<tr key={tx.id}><td className="px-6 py-4">{new Date(tx.timestamp).toLocaleString(language)}</td><td className="px-6 py-4">{tx.userName}</td><td className="px-6 py-4 font-semibold text-green-600">+{Math.abs(tx.merits)}</td><td className="px-6 py-4 capitalize">{tx.type}</td><td className="px-6 py-4">{getSpaceName(tx.destinationSpaceId)}</td></tr>))}</tbody>
                        </table>
                    </div>
                </div>
                 <div>
                    <h2 className="text-2xl font-bold mb-4">{t.withdrawalHistory}</h2>
                    <div className="bg-white shadow-md rounded-lg overflow-x-auto">
                         <table className="min-w-full divide-y">
                            <thead className="bg-gray-50"><tr><th className="px-6 py-3 text-left text-xs font-medium uppercase">{t.date}</th><th className="px-6 py-3 text-left text-xs font-medium uppercase">{t.amount}</th><th className="px-6 py-3 text-left text-xs font-medium uppercase">{t.status}</th></tr></thead>
                            <tbody className="bg-white divide-y">{data.withdrawalHistory.length === 0 ? (<tr><td colSpan={3} className="text-center py-4">{t.noWithdrawals}</td></tr>) : data.withdrawalHistory.map(req => (<tr key={req.id}><td className="px-6 py-4">{new Date(req.createdAt).toLocaleString(language)}</td><td className="px-6 py-4 font-semibold text-red-600">{req.amount}</td><td className="px-6 py-4 capitalize">{req.status}</td></tr>))}</tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};