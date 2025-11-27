// client/src/components/user/ChangePasswordModal.tsx
import React, { useState } from 'react';
import { User } from '../../types';
import { apiService } from '../../services/apiService';
import { useToast } from '../ToastProvider';

const translations = {
    vi: {
        title: 'Đổi Mật khẩu',
        currentPasswordLabel: 'Mật khẩu hiện tại',
        newPasswordLabel: 'Mật khẩu mới',
        confirmNewPasswordLabel: 'Xác nhận mật khẩu mới',
        changeButton: 'Đổi Mật khẩu',
        changingButton: 'Đang xử lý...',
        cancelButton: 'Hủy',
        passwordMismatch: 'Mật khẩu xác nhận không khớp.',
        changeSuccess: 'Đổi mật khẩu thành công!',
        changeError: 'Đổi mật khẩu thất bại: {message}',
        forgotPassword: 'Quên mật khẩu?',
    },
    en: {
        title: 'Change Password',
        currentPasswordLabel: 'Current Password',
        newPasswordLabel: 'New Password',
        confirmNewPasswordLabel: 'Confirm New Password',
        changeButton: 'Change Password',
        changingButton: 'Processing...',
        cancelButton: 'Cancel',
        passwordMismatch: 'Passwords do not match.',
        changeSuccess: 'Password changed successfully!',
        changeError: 'Failed to change password: {message}',
        forgotPassword: 'Forgot password?',
    }
};

interface ChangePasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: User;
    language: 'vi' | 'en';
    onOpenForgotPassword: () => void;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ isOpen, onClose, user, language, onOpenForgotPassword }) => {
    const t = translations[language];
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { showToast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
            showToast(t.passwordMismatch, 'error');
            return;
        }
        setLoading(true);
        try {
            await apiService.changePassword(user.id as number, oldPassword, newPassword);
            showToast(t.changeSuccess, 'success');
            onClose();
        } catch (err) {
            showToast(t.changeError.replace('{message}', (err as Error).message), 'error');
        } finally {
            setLoading(false);
            setOldPassword('');
            setNewPassword('');
            setConfirmPassword('');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-background-panel rounded-lg shadow-xl w-full max-w-md p-6 relative transform transition-all animate-fade-in-right" onClick={e => e.stopPropagation()}>
                <h2 className="text-2xl font-bold text-text-main mb-4">{t.title}</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <div className="flex justify-between items-baseline">
                            <label className="block text-sm font-medium text-text-main">{t.currentPasswordLabel}</label>
                            <button type="button" onClick={onOpenForgotPassword} className="text-xs text-primary hover:underline">{t.forgotPassword}</button>
                        </div>
                        <input
                            type="password"
                            required
                            value={oldPassword}
                            onChange={(e) => setOldPassword(e.target.value)}
                            className="login-input mt-1"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-text-main">{t.newPasswordLabel}</label>
                        <input
                            type="password"
                            required
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            className="login-input mt-1"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-text-main">{t.confirmNewPasswordLabel}</label>
                        <input
                            type="password"
                            required
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            className="login-input mt-1"
                        />
                    </div>
                    <div className="mt-6 flex justify-end space-x-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-text-main bg-background-light border border-border-color rounded-md hover:bg-border-color">
                            {t.cancelButton}
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 bg-primary text-text-on-primary text-sm font-medium rounded-md hover:bg-primary-hover disabled:opacity-50"
                        >
                            {loading ? t.changingButton : t.changeButton}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
