// client/src/components/admin/ManualCoinTopUp.tsx
import React, { useState, useEffect } from 'react';
import { User } from '../../types';
import { apiService } from '../../services/apiService';
import { useToast } from '../ToastProvider';

interface ManualCoinTopUpProps {
    adminUser: User;
    language: 'vi' | 'en';
    onTransactionSuccess: (updatedUser: User) => void;
}

const translations = {
    vi: {
        title: 'Nạp tiền thủ công',
        loading: 'Đang tải...',
        selectUserLabel: 'Chọn người dùng để nạp',
        selectUserPlaceholder: '-- Chọn một người dùng --',
        amountLabel: 'Số coin cần nạp',
        amountPlaceholder: 'Nhập số dương để cộng, số âm để trừ',
        submitButton: 'Xác nhận nạp',
        submittingButton: 'Đang xử lý...',
        feedback: {
            loadError: 'Không thể tải danh sách người dùng.',
            missingInfo: 'Vui lòng chọn người dùng và nhập số coin.',
            invalidData: 'Dữ liệu không hợp lệ.',
            success: 'Nạp thành công {amount} coin cho {name}. Số dư mới: {balance}.',
            failure: 'Nạp thất bại: {message}',
        }
    },
    en: {
        title: 'Manual Coin Top-Up',
        loading: 'Loading...',
        selectUserLabel: 'Select user to top-up',
        selectUserPlaceholder: '-- Select a user --',
        amountLabel: 'Amount of coins to add',
        amountPlaceholder: 'Positive to add, negative to subtract',
        submitButton: 'Confirm Top-Up',
        submittingButton: 'Processing...',
        feedback: {
            loadError: 'Could not load user list.',
            missingInfo: 'Please select a user and enter an amount.',
            invalidData: 'Invalid data.',
            success: 'Successfully added {amount} coins for {name}. New balance: {balance}.',
            failure: 'Top-up failed: {message}',
        }
    }
};

const ManualCoinTopUp: React.FC<ManualCoinTopUpProps> = ({ adminUser, language, onTransactionSuccess }) => {
    const [users, setUsers] = useState<User[]>([]);
    const [selectedUserId, setSelectedUserId] = useState<string>('');
    const [amount, setAmount] = useState<string>('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { showToast } = useToast();
    const t = translations[language];

    useEffect(() => {
        const fetchUsers = async () => {
            setIsLoading(true);
            try {
                const allUsers = await apiService.getAllUsers();
                setUsers(allUsers.filter(u => !u.isAdmin)); // Admins cannot top up other admins
            } catch (error) {
                showToast(t.feedback.loadError, 'error');
            } finally {
                setIsLoading(false);
            }
        };
        fetchUsers();
    }, [language, showToast, t.feedback.loadError]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedUserId || !amount) {
            showToast(t.feedback.missingInfo, 'error');
            return;
        }

        const userId = parseInt(selectedUserId, 10);
        const coinAmount = parseInt(amount, 10);

        if (isNaN(userId) || isNaN(coinAmount)) {
            showToast(t.feedback.invalidData, 'error');
            return;
        }
        
        setIsSubmitting(true);
        try {
            const updatedUser = await apiService.addCoinsManually(userId, coinAmount, adminUser.id as number);
            const successMessage = t.feedback.success
                .replace('{amount}', String(coinAmount))
                .replace('{name}', updatedUser.name)
                .replace('{balance}', String(updatedUser.coins));
            showToast(successMessage);
            onTransactionSuccess(updatedUser);
            setAmount('');
            setSelectedUserId('');
        } catch (error: any) {
             const failureMessage = t.feedback.failure.replace('{message}', error.message);
            showToast(failureMessage, 'error');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return <div className="p-8 text-center">{t.loading}</div>;
    }

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold mb-6">{t.title}</h1>
            <div className="bg-background-panel shadow-md rounded-lg p-6 max-w-md mx-auto">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label htmlFor="user-select" className="block text-sm font-medium text-text-secondary">
                            {t.selectUserLabel}
                        </label>
                        <select
                            id="user-select"
                            value={selectedUserId}
                            onChange={e => setSelectedUserId(e.target.value)}
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-border-color focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
                        >
                            <option value="">{t.selectUserPlaceholder}</option>
                            {users.map(user => (
                                <option key={user.id} value={user.id}>
                                    {user.name} ({user.email})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label htmlFor="amount" className="block text-sm font-medium text-text-secondary">
                            {t.amountLabel}
                        </label>
                        <input
                            type="number"
                            id="amount"
                            value={amount}
                            onChange={e => setAmount(e.target.value)}
                            placeholder={t.amountPlaceholder}
                            className="mt-1 block w-full px-3 py-2 border border-border-color rounded-md shadow-sm focus:ring-primary focus:border-primary"
                        />
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-text-on-primary bg-primary hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
                        >
                            {isSubmitting ? t.submittingButton : t.submitButton}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ManualCoinTopUp;