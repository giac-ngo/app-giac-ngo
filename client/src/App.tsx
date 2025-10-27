


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
  const location = useLocation();

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);
  
  useEffect(() => {
    // Prioritize user's template setting, then system default, finally fallback to 'w5g'
    const themeToApply = user?.template || systemConfig?.template || 'w5g';
    document.documentElement.setAttribute('data-theme', themeToApply);

    // --- Dynamically load the PUBLIC theme CSS ---
    const themeUrl = `/themes/${themeToApply}/theme.css`;
    let themeLink = document.getElementById('theme-stylesheet') as HTMLLinkElement;
    if (!themeLink) {
        themeLink = document.createElement('link');
        themeLink.id = 'theme-stylesheet';
        themeLink.rel = 'stylesheet';
        document.head.appendChild(themeLink);
    }
    const fullThemeUrl = new URL(themeUrl, window.location.origin).href;
    if (themeLink.href !== fullThemeUrl) {
      themeLink.href = themeUrl;
    }
    
    // --- Dynamically load the ADMIN theme CSS ---
    const isAdminRoute = location.pathname.startsWith('/admin');
    const adminThemeUrl = `/themes/${themeToApply}/admin.css`;
    let adminThemeLink = document.getElementById('admin-theme-stylesheet') as HTMLLinkElement;

    if (isAdminRoute) {
        if (!adminThemeLink) {
            adminThemeLink = document.createElement('link');
            adminThemeLink.id = 'admin-theme-stylesheet';
            adminThemeLink.rel = 'stylesheet';
            document.head.appendChild(adminThemeLink);
        }
        const fullAdminUrl = new URL(adminThemeUrl, window.location.origin).href;
        if (adminThemeLink.href !== fullAdminUrl) {
            adminThemeLink.href = adminThemeUrl;
        }
    } else {
        if (adminThemeLink) {
            adminThemeLink.remove();
        }
    }
    
    // --- Dynamically update the favicon ---
    const favicon = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
    if (favicon && systemConfig) {
        favicon.href = systemConfig.templateSettings[themeToApply].logoUrl;
    }

  }, [user, systemConfig, location.pathname]);

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