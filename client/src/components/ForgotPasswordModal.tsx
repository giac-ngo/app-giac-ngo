// client/src/components/ForgotPasswordModal.tsx
import React, { useState } from 'react';
import { apiService } from '../services/apiService';
import { useToast } from './ToastProvider';

const translations = {
    vi: {
        title: 'Quên Mật khẩu',
        instructions: 'Nhập địa chỉ email của bạn và chúng tôi sẽ gửi cho bạn một liên kết để đặt lại mật khẩu.',
        emailLabel: 'Email',
        emailPlaceholder: 'you@example.com',
        sendButton: 'Gửi liên kết đặt lại',
        sendingButton: 'Đang gửi...',
        cancelButton: 'Hủy',
        successMessage: 'Nếu tài khoản tồn tại, một email đặt lại mật khẩu đã được gửi đi.',
        errorMessage: 'Đã xảy ra lỗi. Vui lòng thử lại.',
    },
    en: {
        title: 'Forgot Password',
        instructions: 'Enter your email address and we will send you a link to reset your password.',
        emailLabel: 'Email',
        emailPlaceholder: 'you@example.com',
        sendButton: 'Send Reset Link',
        sendingButton: 'Sending...',
        cancelButton: 'Cancel',
        successMessage: 'If an account exists, a password reset email has been sent.',
        errorMessage: 'An error occurred. Please try again.',
    }
};

interface ForgotPasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
    language: 'vi' | 'en';
}

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({ isOpen, onClose, language }) => {
    const t = translations[language];
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const { showToast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await apiService.forgotPassword(email, language);
            showToast(t.successMessage, 'success');
            onClose();
        } catch (err) {
            showToast(t.errorMessage, 'error');
        } finally {
            setLoading(false);
            setEmail('');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-background-panel rounded-lg shadow-xl w-full max-w-md p-6 relative transform transition-all animate-fade-in-right" onClick={e => e.stopPropagation()}>
                <h2 className="text-2xl font-bold text-text-main mb-2">{t.title}</h2>
                <p className="text-text-light mb-6">{t.instructions}</p>
                <form onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="reset-email" className="block text-sm font-medium text-text-main">
                            {t.emailLabel}
                        </label>
                        <input
                            id="reset-email"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder={t.emailPlaceholder}
                            className="login-input"
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
                            {loading ? t.sendingButton : t.sendButton}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
