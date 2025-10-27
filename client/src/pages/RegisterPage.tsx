// client/src/pages/RegisterPage.tsx
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useToast } from '../components/ToastProvider';
import { apiService } from '../services/apiService';
import { User } from '../types';
import { GoogleIcon, FacebookIcon } from '../components/Icons';

const translations = {
    vi: {
        backToHome: 'Quay về trang chủ',
        title: 'Tạo tài khoản của bạn',
        fullNameLabel: 'Họ và tên',
        fullNamePlaceholder: 'Nhập họ và tên của bạn',
        emailLabel: 'Email',
        emailPlaceholder: 'Nhập email của bạn',
        passwordLabel: 'Mật khẩu',
        passwordPlaceholder: 'Tạo mật khẩu',
        confirmPasswordLabel: 'Xác nhận Mật khẩu',
        confirmPasswordPlaceholder: 'Xác nhận mật khẩu của bạn',
        createAccountButton: 'Tạo tài khoản',
        creatingAccountButton: 'Đang tạo tài khoản...',
        continueWith: 'Hoặc tiếp tục với',
        haveAccount: 'Đã có tài khoản?',
        signIn: 'Đăng nhập',
        terms: 'Bằng cách tiếp tục, bạn đồng ý với Điều khoản Dịch vụ và Chính sách Bảo mật của chúng tôi.',
        passwordMismatch: 'Mật khẩu xác nhận không khớp.',
    },
    en: {
        backToHome: 'Back to Home',
        title: 'Create your account',
        fullNameLabel: 'Full Name',
        fullNamePlaceholder: 'Enter your full name',
        emailLabel: 'Email',
        emailPlaceholder: 'Enter your email',
        passwordLabel: 'Password',
        passwordPlaceholder: 'Create a password',
        confirmPasswordLabel: 'Confirm Password',
        confirmPasswordPlaceholder: 'Confirm your password',
        createAccountButton: 'Create account',
        creatingAccountButton: 'Creating account...',
        continueWith: 'Or continue with',
        haveAccount: 'Already have an account?',
        signIn: 'Sign in',
        terms: 'By continuing, you agree to our Terms of Service and Privacy Policy.',
        passwordMismatch: 'Passwords do not match.',
    }
};

interface RegisterPageProps {
    onRegister: (userData: User) => void;
    language: 'vi' | 'en';
}

const RegisterPage: React.FC<RegisterPageProps> = ({ onRegister, language }) => {
    const t = translations[language];
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const { showToast } = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            showToast(t.passwordMismatch, 'error');
            return;
        }
        setLoading(true);
        try {
            const userData = await apiService.register({ name, email, password });
            onRegister(userData);
            navigate('/', { replace: true });
        } catch (err) {
            showToast((err as Error).message, 'error');
        } finally {
            setLoading(false);
        }
    };
    
    const SocialButton: React.FC<{ icon: React.ReactNode, label: string }> = ({ icon, label }) => (
      <button className="social-login-btn">
        {icon}
        <span>{label}</span>
      </button>
    );


    return (
        <div className="login-page-grid">
            <div className="login-form-container">
                <div className="w-full max-w-md">
                    <Link to="/" className="text-sm text-text-main hover:underline mb-8 block">&larr; {t.backToHome}</Link>
                    
                    <h1 className="text-3xl font-serif font-bold mb-8 text-primary">{t.title}</h1>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="fullName" className="block text-sm font-medium text-text-main">{t.fullNameLabel}</label>
                            <input
                                id="fullName"
                                type="text"
                                required
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder={t.fullNamePlaceholder}
                                className="auth-input-white"
                            />
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-text-main">{t.emailLabel}</label>
                            <input
                                id="email"
                                type="email"
                                autoComplete="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder={t.emailPlaceholder}
                                className="auth-input-white"
                            />
                        </div>
                        <div>
                            <label htmlFor="password"  className="block text-sm font-medium text-text-main">{t.passwordLabel}</label>
                            <input
                                id="password"
                                type="password"
                                autoComplete="new-password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder={t.passwordPlaceholder}
                                className="auth-input-white"
                            />
                        </div>
                         <div>
                            <label htmlFor="confirmPassword"  className="block text-sm font-medium text-text-main">{t.confirmPasswordLabel}</label>
                            <input
                                id="confirmPassword"
                                type="password"
                                autoComplete="new-password"
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder={t.confirmPasswordPlaceholder}
                                className="auth-input-white"
                            />
                        </div>
                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-primary text-text-on-primary py-2.5 px-4 rounded-md font-semibold hover:bg-primary-hover disabled:opacity-50"
                            >
                                {loading ? t.creatingAccountButton : t.createAccountButton}
                            </button>
                        </div>
                    </form>

                    <div className="login-divider">
                        <span/>
                        <span className="text-xs text-text-light">{t.continueWith}</span>
                        <span/>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                        <SocialButton icon={<GoogleIcon />} label="Google" />
                        <SocialButton icon={<FacebookIcon />} label="Facebook" />
                    </div>

                    <p className="mt-8 text-center text-sm text-text-light">
                        {t.haveAccount} <Link to="/login" className="font-semibold text-primary hover:underline">{t.signIn}</Link>
                    </p>

                    <p className="mt-8 text-center text-xs text-gray-400">
                        {t.terms}
                    </p>
                </div>
            </div>
            <div className="login-logo-container">
                <img src="/themes/giacngo/giac-ngo-login.png" alt="Giác Ngộ AI Logo" className="w-full h-full object-contain" />
            </div>
        </div>
    );
};

export default RegisterPage;