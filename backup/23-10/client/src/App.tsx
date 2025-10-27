

import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import { ChatPage } from './pages/ChatPage';
import AdminPage from './pages/AdminPage';
import PricingPage from './pages/PricingPage';
import { User, SystemConfig } from './types';
import { apiService } from './services/apiService';
import { ToastProvider } from './components/ToastProvider';

const ProtectedRoute: React.FC<{ user: User | null; children: React.ReactNode }> = ({ user, children }) => {
  const location = useLocation();
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return <>{children}</>;
};

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const savedUser = sessionStorage.getItem('user');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      return null;
    }
  });
  
  const [language, setLanguage] = useState<'vi' | 'en'>(() => {
    return (localStorage.getItem('language') as 'vi' | 'en') || 'vi';
  });

  const [systemConfig, setSystemConfig] = useState<SystemConfig | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);
  
  useEffect(() => {
    if (systemConfig?.template) {
      document.documentElement.setAttribute('data-theme', systemConfig.template);
    }
    return () => {
      document.documentElement.removeAttribute('data-theme');
    }
  }, [systemConfig?.template]);

  useEffect(() => {
    apiService.getSystemConfig()
        .then(config => {
            if (!config) {
                throw new Error("System configuration not found or is null.");
            }
            setSystemConfig(config);
        })
        .catch(err => {
            console.error("Failed to load system config", err);
            const message = err instanceof Error ? err.message : String(err);
            setError(`Could not load system configuration. Please try again later. (${message})`);
        })
        .finally(() => setIsLoading(false));
  }, []);
  
  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
    sessionStorage.setItem('user', JSON.stringify(loggedInUser));
  };

  const handleLogout = () => {
    setUser(null);
    sessionStorage.removeItem('user');
  };

  const handleGoToLogin = () => {
    window.location.hash = '#/login';
  };
  
  const handleSystemConfigUpdate = (newConfig: SystemConfig) => {
    setSystemConfig(newConfig);
  };

  const handleUserUpdate = (updatedData: Partial<User>) => {
    setUser(currentUser => {
        if (!currentUser) return null;
        const newUser = { ...currentUser, ...updatedData };
        sessionStorage.setItem('user', JSON.stringify(newUser));
        return newUser;
    });
  };
  
  if (isLoading) {
    return <div className="page-loader">Loading application...</div>;
  }
  
  if (error) {
     return <div className="page-loader text-accent-red">{error}</div>;
  }
  
  return (
      <ToastProvider>
        <div className="App">
          {systemConfig ? (
            <Routes>
              <Route path="/pricing" element={<PricingPage />} />
              
              <Route 
                path="/admin/*" 
                element={
                  <ProtectedRoute user={user}>
                    <AdminPage 
                      user={user as User} 
                      onLogout={handleLogout} 
                      language={language} 
                      setLanguage={setLanguage} 
                      systemConfig={systemConfig} 
                      onSystemConfigUpdate={handleSystemConfigUpdate} 
                      onUserUpdate={handleUserUpdate} 
                    />
                  </ProtectedRoute>
                } 
              />
              
              <Route 
                path="/login" 
                element={user ? <Navigate to="/" replace /> : <LoginPage onLogin={handleLogin} language={language} />} 
              />

              <Route 
                path="/register" 
                element={user ? <Navigate to="/" replace /> : <RegisterPage onRegister={handleLogin} language={language} />}
              />
              
              <Route 
                path="*" 
                element={
                  <ChatPage
                      user={user}
                      systemConfig={systemConfig}
                      onLogout={handleLogout}
                      onGoToLogin={handleGoToLogin}
                      language={language}
                      setLanguage={setLanguage}
                      onUserUpdate={handleUserUpdate}
                  />
                } 
              />
            </Routes>
          ) : (
            <div className="page-loader">Loading configuration...</div>
          )}
        </div>
      </ToastProvider>
  );
};

export default App;