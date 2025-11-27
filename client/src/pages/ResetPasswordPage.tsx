
// client/src/pages/ResetPasswordPage.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useToast } from '../components/ToastProvider';
import { apiService } from '../services/apiService';

const translations = {
    vi: {
        title: 'Đặt lại Mật khẩu',
        newPasswordLabel: 'Mật khẩu mới',
        confirmPasswordLabel: 'Xác nhận Mật khẩu mới',
        resetButton: 'Đặt lại Mật khẩu',
        resettingButton: 'Đang xử lý...',
        passwordMismatch: 'Mật khẩu xác nhận không khớp.',
        tokenInvalid: 'Token đặt lại mật khẩu không hợp lệ hoặc đã hết hạn. Vui lòng thử lại.',
        resetSuccess: 'Mật khẩu đã được đặt lại thành công! Bạn có thể đăng nhập ngay bây giờ.',
        backToLogin: 'Quay lại trang Đăng nhập',
        noToken: 'Không tìm thấy token đặt lại mật khẩu.'
    },
    en: {
        title: 'Reset Password',
        newPasswordLabel: 'New Password',
        confirmPasswordLabel: 'Confirm New Password',
        resetButton: 'Reset Password',
        resettingButton: 'Processing...',
        passwordMismatch: 'Passwords do not match.',
        tokenInvalid: 'Password reset token is invalid or has expired. Please try again.',
        resetSuccess: 'Password has been reset successfully! You can now log in.',
        backToLogin: 'Back to Login',
        noToken: 'Password reset token not found.'
    }
};

interface ResetPasswordPageProps {
    language: 'vi' | 'en';
}

export const ResetPasswordPage: React.FC<ResetPasswordPageProps> = ({ language }) => {
    const t = translations[language];
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { search } = useLocation();
    const token = new URLSearchParams(search).get('token');
    
    const navigate = useNavigate();
    const { showToast } = useToast();

    useEffect(() => {
        if (!token) {
            showToast(t.noToken, 'error');
        }
    }, [token, showToast, t.noToken]);


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!token) {
            showToast(t.noToken, 'error');
            return;
        }
        if (password !== confirmPassword) {
            showToast(t.passwordMismatch, 'error');
            return;
        }
        setLoading(true);
        try {
            await apiService.resetPassword(token, password);
            showToast(t.resetSuccess, 'success');
            navigate('/login');
        } catch (err) {
            showToast((err as Error).message || t.tokenInvalid, 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="login-page-grid">
            <div className="login-form-container">
                <div className="w-full max-w-md">
                     <h1 className="text-3xl font-serif font-bold mb-8 text-primary">{t.title}</h1>

                    {token ? (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label htmlFor="password"  className="block text-sm font-medium text-text-main">
                                {t.newPasswordLabel}
                                </label>
                                <input
                                id="password"
                                name="password"
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="Enter your new password"
                                className="login-input"
                                />
                            </div>
                            <div>
                                <label htmlFor="confirmPassword"  className="block text-sm font-medium text-text-main">
                                {t.confirmPasswordLabel}
                                </label>
                                <input
                                id="confirmPassword"
                                name="confirmPassword"
                                type="password"
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Confirm your new password"
                                className="login-input"
                                />
                            </div>
                            <div>
                                <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-primary text-text-on-primary py-2.5 px-4 rounded-md font-semibold hover:bg-primary-hover disabled:opacity-50"
                                >
                                {loading ? t.resettingButton : t.resetButton}
                                </button>
                            </div>
                        </form>
                    ) : (
                        <p className="text-accent-red">{t.noToken}</p>
                    )}
                    <p className="mt-8 text-center text-sm text-text-light">
                        <Link to="/login" className="font-semibold text-primary hover:underline">{t.backToLogin}</Link>
                    </p>
                </div>
            </div>
             <div className="login-logo-container">
                <img src="/themes/giacngo/giac-ngo-login.png" alt="Giác Ngộ AI Logo" className="w-full h-full object-contain" />
            </div>
        </div>
    );
};
