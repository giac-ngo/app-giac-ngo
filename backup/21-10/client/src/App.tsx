import React, { useState, useEffect } from 'react';
import LoginPage from './pages/LoginPage';
// FIX: Changed to a named import to resolve module export issue.
import { ChatPage } from './pages/ChatPage';
import AdminPage from './pages/AdminPage';
import PricingPage from './pages/PricingPage';
import { User, SystemConfig } from './types';
import { apiService } from './services/apiService';
import { ToastProvider } from './components/ToastProvider';

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

  const [hash, setHash] = useState(window.location.hash);

  useEffect(() => {
    const handleHashChange = () => {
      setHash(window.location.hash);
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);
  

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
            setError("Could not load system configuration. Please try again later.");
        })
        .finally(() => setIsLoading(false));
  }, []);
  
  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
    sessionStorage.setItem('user', JSON.stringify(loggedInUser));
    window.location.hash = '#/';
  };

  const handleLogout = () => {
    setUser(null);
    sessionStorage.removeItem('user');
    window.location.hash = '#/login';
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
  
  const renderPage = () => {
      if (hash.startsWith('#/pricing')) {
          return <PricingPage />;
      }
      
      if (user && hash.startsWith('#/admin')) {
          return <AdminPage user={user} onLogout={handleLogout} language={language} setLanguage={setLanguage} systemConfig={systemConfig} onSystemConfigUpdate={handleSystemConfigUpdate} onUserUpdate={handleUserUpdate} />;
      }

      if (hash.startsWith('#/login')) {
          if (user) {
              window.location.hash = '#/';
              return null;
          }
          return <LoginPage onLogin={handleLogin} language={language} />;
      }
      
      if (systemConfig) {
        return <ChatPage
            user={user}
            systemConfig={systemConfig}
            onLogout={handleLogout}
            onGoToLogin={handleGoToLogin}
            language={language}
            setLanguage={setLanguage}
            onUserUpdate={handleUserUpdate}
        />
      }
      
      return null;
  };
  
  return (
      <ToastProvider>
        <div className="App">
          {renderPage()}
        </div>
      </ToastProvider>
  );
};

export default App;
