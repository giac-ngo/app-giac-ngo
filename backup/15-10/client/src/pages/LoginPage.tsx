import React, { useState } from 'react';
import { User } from '../types';
import { apiService } from '../services/apiService';

interface LoginPageProps {
  onLogin: (user: User) => void;
  language: 'vi' | 'en';
}

const translations = {
    vi: {
        welcomeBack: 'Chào mừng trở lại',
        createAccount: 'Tạo tài khoản',
        forTesting: 'Để thử nghiệm:',
        admin: 'Admin',
        userActive: 'User (còn hạn)',
        userExpired: 'User (hết hạn)',
        socialLoginNotImplemented: 'Chức năng đăng nhập với {provider} chưa được cài đặt.',
        fillEmailPassword: "Vui lòng điền đầy đủ email và mật khẩu.",
        registerNotSupported: "Chức năng đăng ký chưa được hỗ trợ. Vui lòng đăng nhập.",
        genericError: 'Đã xảy ra lỗi. Vui lòng thử lại.',
        or: 'Hoặc',
        nameLabel: 'Họ và tên',
        emailLabel: 'Email',
        passwordLabel: 'Mật khẩu',
        processing: 'Đang xử lý...',
        registerButton: 'Đăng ký',
        loginButton: 'Đăng nhập',
        alreadyHaveAccount: 'Đã có tài khoản?',
        noAccount: 'Chưa có tài khoản?',
        loginNow: 'Đăng nhập ngay',
        createAccountLink: 'Tạo tài khoản',
    },
    en: {
        welcomeBack: 'Welcome Back',
        createAccount: 'Create Account',
        forTesting: 'For testing:',
        admin: 'Admin',
        userActive: 'User (active)',
        userExpired: 'User (expired)',
        socialLoginNotImplemented: 'Login with {provider} is not implemented yet.',
        fillEmailPassword: "Please enter both email and password.",
        registerNotSupported: "Registration is not supported. Please log in.",
        genericError: 'An error occurred. Please try again.',
        or: 'Or',
        nameLabel: 'Full Name',
        emailLabel: 'Email',
        passwordLabel: 'Password',
        processing: 'Processing...',
        registerButton: 'Register',
        loginButton: 'Login',
        alreadyHaveAccount: 'Already have an account?',
        noAccount: 'Don\'t have an account?',
        loginNow: 'Login now',
        createAccountLink: 'Create an account',
    }
};


const LoginPage: React.FC<LoginPageProps> = ({ onLogin, language }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const t = translations[language];

  const handleSocialLogin = (provider: 'google' | 'facebook') => {
    setError(t.socialLoginNotImplemented.replace('{provider}', provider));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
        setError(t.fillEmailPassword);
        return;
    }
    
    if(isRegister) {
        setError(t.registerNotSupported);
        return;
    }

    setIsLoading(true);
    try {
        const user = await apiService.login(email, password);
        onLogin(user);
    } catch (err: any) {
        setError(err.message || t.genericError);
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background-light">
      <div className="w-full max-w-md p-8 space-y-6 bg-background-panel rounded-lg shadow-xl">
        <h1 className="text-3xl font-bold text-center text-text-main">
          {isRegister ? t.createAccount : t.welcomeBack}
        </h1>
        <div className="text-center text-text-light text-sm p-3 bg-background-light rounded-md">
            <p className="font-semibold">{t.forTesting}</p>
            <ul className="list-disc list-inside text-left mt-1">
                <li>{t.admin}: <code className="text-xs">admin</code> / <code className="text-xs">password</code></li>
                <li>{t.userActive}: <code className="text-xs">user@example.com</code> / <code className="text-xs">password</code></li>
                <li>{t.userExpired}: <code className="text-xs">expired</code> / <code className="text-xs">password</code></li>
            </ul>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <button onClick={() => handleSocialLogin('google')} className="flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-text-main bg-background-panel border border-border-color rounded-md shadow-sm hover:bg-background-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary">
            <svg className="w-5 h-5 mr-2" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"></path><path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"></path><path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.222 0-9.618-3.67-11.074-8.588l-6.522 5.025C9.505 39.556 16.227 44 24 44z"></path><path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C42.021 35.596 44 30.138 44 24c0-1.341-.138-2.65-.389-3.917z"></path></svg>
            Google
          </button>
           <button onClick={() => handleSocialLogin('facebook')} className="flex items-center justify-center w-full px-4 py-2 text-sm font-medium text-white bg-[#1877F2] border border-transparent rounded-md shadow-sm hover:bg-[#166eab] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#1877F2]">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 24 24"><path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878V14.89h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"></path></svg>
            Facebook
          </button>
        </div>

        <div className="flex items-center justify-between">
          <span className="w-1/5 border-b border-border-color"></span>
          <span className="text-xs text-center text-text-light uppercase">{t.or}</span>
          <span className="w-1/5 border-b border-border-color"></span>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {isRegister && (
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-text-main">{t.nameLabel}</label>
              <input id="name" name="name" type="text" value={name} onChange={e => setName(e.target.value)} className="w-full px-3 py-2 mt-1 border border-border-color rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" />
            </div>
          )}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-text-main">{t.emailLabel}</label>
            <input id="email" name="email" type="text" required value={email} onChange={e => setEmail(e.target.value)} className="w-full px-3 py-2 mt-1 border border-border-color rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-text-main">{t.passwordLabel}</label>
            <input id="password" name="password" type="password" required value={password} onChange={e => setPassword(e.target.value)} className="w-full px-3 py-2 mt-1 border border-border-color rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary" />
          </div>
          
          {error && <p className="text-sm text-center text-accent-red">{error}</p>}

          <button type="submit" disabled={isLoading} className="w-full flex justify-center px-4 py-2 text-sm font-medium text-text-on-primary bg-primary border border-transparent rounded-md shadow-sm hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-70">
            {isLoading ? t.processing : (isRegister ? t.registerButton : t.loginButton)}
          </button>
        </form>

        <p className="text-sm text-center text-text-light">
          {isRegister ? t.alreadyHaveAccount : t.noAccount}
          <button onClick={() => { setIsRegister(!isRegister); setError(''); }} className="ml-1 font-medium text-primary hover:text-primary-hover">
            {isRegister ? t.loginNow : t.createAccountLink}
          </button>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;