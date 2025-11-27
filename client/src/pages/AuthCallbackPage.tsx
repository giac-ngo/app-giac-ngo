// client/src/pages/AuthCallbackPage.tsx
import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { User } from '../types';
import { useToast } from '../components/ToastProvider';

interface AuthCallbackPageProps {
    onLogin: (userData: User) => void;
}

export const AuthCallbackPage: React.FC<AuthCallbackPageProps> = ({ onLogin }) => {
    const { search } = useLocation();
    const searchParams = new URLSearchParams(search);
    const navigate = useNavigate();
    const { showToast } = useToast();

    useEffect(() => {
        const userParam = searchParams.get('user');
        const errorParam = searchParams.get('error');

        if (errorParam) {
            let errorMessage = 'Authentication failed. Please try again.';
            if (errorParam === 'account_disabled') {
                errorMessage = 'Your account has been disabled. Please contact support.';
            }
            showToast(errorMessage, 'error');
            navigate('/login', { replace: true });
            return;
        }

        if (userParam) {
            try {
                const userJson = atob(userParam);
                const userData: User = JSON.parse(userJson);
                onLogin(userData);
                const redirectPath = sessionStorage.getItem('redirectPath') || '/';
                sessionStorage.removeItem('redirectPath');
                navigate(redirectPath, { replace: true });
            } catch (e) {
                console.error("Failed to parse user data from callback:", e);
                showToast('Failed to process login. Please try again.', 'error');
                navigate('/login', { replace: true });
            }
        } else {
            showToast('Invalid authentication callback.', 'error');
            navigate('/login', { replace: true });
        }

    }, [searchParams, navigate, onLogin, showToast]);

    return (
        <div className="page-loader">
            Signing you in...
        </div>
    );
};
