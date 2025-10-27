// client/src/pages/LoginPage.tsx
import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useToast } from '../components/ToastProvider';
import { apiService } from '../services/apiService';
import { User } from '../types';
import { GoogleIcon, FacebookIcon } from '../components/Icons';


const translations = {
    vi: {
        backToHome: 'Quay về trang chủ',
        title: 'Đăng nhập vào tài khoản của bạn',
        emailLabel: 'Email',
        passwordLabel: 'Mật khẩu',
        forgotPassword: 'Quên mật khẩu?',
        signInButton: 'Đăng nhập',
        signingInButton: 'Đang đăng nhập...',
        continueWith: 'Hoặc tiếp tục với',
        noAccount: 'Chưa có tài khoản?',
        signUp: 'Đăng ký',
        terms: 'Bằng cách tiếp tục, bạn đồng ý với các Điều khoản Dịch vụ và Chính sách Bảo mật của chúng tôi.'
    },
    en: {
        backToHome: 'Back to Home',
        title: 'Sign in to your account',
        emailLabel: 'Email',
        passwordLabel: 'Password',
        forgotPassword: 'Forgot password?',
        signInButton: 'Sign in',
        signingInButton: 'Signing in...',
        continueWith: 'Or continue with',
        noAccount: 'Don\'t have an account?',
        signUp: 'Sign up',
        terms: 'By continuing, you agree to our Terms of Service and Privacy Policy.'
    }
};

interface LoginPageProps {
    onLogin: (userData: User) => void;
    language: 'vi' | 'en';
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin, language }) => {
  const t = translations[language];
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();

  const from = (location.state as any)?.from?.pathname || '/admin';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const userData = await apiService.login(email, password);
      onLogin(userData);
      navigate(from, { replace: true });
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
                <label htmlFor="email" className="block text-sm font-medium text-text-main">
                  {t.emailLabel}
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="login-input"
                />
              </div>

              <div>
                <div className="flex items-center justify-between">
                  <label htmlFor="password"  className="block text-sm font-medium text-text-main">
                    {t.passwordLabel}
                  </label>
                   <Link to="#" className="text-sm text-primary hover:underline">{t.forgotPassword}</Link>
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="login-input"
                />
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary text-text-on-primary py-2.5 px-4 rounded-md font-semibold hover:bg-primary-hover disabled:opacity-50"
                >
                  {loading ? t.signingInButton : t.signInButton}
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
            {t.noAccount} <Link to="/register" className="font-semibold text-primary hover:underline">{t.signUp}</Link>
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

export default LoginPage;