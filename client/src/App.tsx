
import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { PracticeSpacePage } from './pages/PracticeSpacePage';
import AdminPage from './pages/AdminPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { AuthCallbackPage } from './pages/AuthCallbackPage';
import { HomePage } from './pages/HomePage';
import { SpaceDetailPage } from './pages/SpaceDetailPage';
import DocumentDetailPage from './pages/DocumentDetailPage';
import { User, SystemConfig } from './types';
import { apiService } from './services/apiService';
import { ToastProvider } from './components/ToastProvider';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import PrivacyPage from './pages/PrivacyPage';
import TermsPage from './pages/TermsPage';
import CareerPage from './pages/CareerPage';
import { DonationPage } from './pages/DonationPage';
import { DocsLayout } from './layouts/DocsLayout';
import Manifesto from './pages/docs/Manifesto';
import MandalaMerit from './pages/docs/MandalaMerit';
import MeritTokenomics from './pages/docs/MeritTokenomics';
import PathOfUnraveling from './pages/docs/PathOfUnraveling';
import TechStack from './pages/docs/TechStack';
import Overview from './pages/docs/Overview';
import AgentModels from './pages/docs/AgentModels';
import QuickStart from './pages/docs/QuickStart';
import TokenPricing from './pages/docs/TokenPricing';


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
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Global fix for hash-based routing
    if (location.hash.startsWith('#/')) {
      const path = location.hash.substring(1); // remove the '#'
      navigate(path, { replace: true });
    }
  }, [location, navigate]);


  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);
  
  useEffect(() => {
    if (!systemConfig) return;
    const themeToApply = user?.template || systemConfig.template || 'w5g';
    document.documentElement.setAttribute('data-theme', themeToApply);
    
    const favicon = document.querySelector<HTMLLinkElement>('link[rel="icon"]');
    if (favicon && systemConfig) {
        favicon.href = systemConfig.templateSettings[themeToApply].logoUrl;
    }

  }, [user, systemConfig]);

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
    navigate('/login');
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
  
  const handleGoToLogin = () => {
    navigate('/login');
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
              {/* Static & Auth Routes */}
              <Route path="/about" element={<AboutPage language={language} />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/terms" element={<TermsPage />} />
              <Route path="/career" element={<CareerPage />} />
              <Route path="/donation" element={<DonationPage user={user} onUserUpdate={handleUserUpdate} />} />
              <Route path="/login" element={user ? <Navigate to="/" replace /> : <LoginPage onLogin={handleLogin} language={language} />} />
              <Route path="/register" element={user ? <Navigate to="/" replace /> : <RegisterPage onRegister={handleLogin} language={language} />} />
              <Route path="/reset-password" element={<ResetPasswordPage language={language} />} />
              <Route path="/auth/callback" element={<AuthCallbackPage onLogin={handleLogin} />} />

              {/* Docs Routes - Nested structure for Outlet */}
              <Route path="/docs" element={<DocsLayout language={language} setLanguage={setLanguage} />}>
                <Route index element={<Navigate to="manifesto" replace />} />
                <Route path="manifesto" element={<Manifesto />} />
                <Route path="mandala-merit" element={<MandalaMerit />} />
                <Route path="merit-tokenomics" element={<MeritTokenomics />} />
                <Route path="path-of-unraveling" element={<PathOfUnraveling />} />
                <Route path="tech-stack" element={<TechStack />} />
                <Route path="overview" element={<Overview />} />
                <Route path="models" element={<AgentModels />} />
                <Route path="quick-start" element={<QuickStart />} />
                <Route path="pricing" element={<TokenPricing />} />
              </Route>

              {/* Admin Route (must be before dynamic slug routes) */}
              <Route path="/:spaceSlug/admin/:section?" element={
                <ProtectedRoute user={user}>
                  {user && <AdminPage 
                    user={user} 
                    onLogout={handleLogout} 
                    language={language} 
                    setLanguage={setLanguage} 
                    systemConfig={systemConfig} 
                    onSystemConfigUpdate={handleSystemConfigUpdate} 
                    onUserUpdate={handleUserUpdate} 
                  />}
                </ProtectedRoute>
              } />

              {/* Content Routes */}
              <Route path="/:spaceSlug/library/:id" element={<DocumentDetailPage user={user} />} />
              
              {/* Dynamic Slug-based Routes (Order is important) */}
              <Route path="/:spaceSlug/:view" element={
                 <ProtectedRoute user={user}>
                    {user && <PracticeSpacePage
                        user={user}
                        systemConfig={systemConfig}
                        onLogout={handleLogout}
                        onGoToLogin={handleGoToLogin}
                        language={language}
                        setLanguage={setLanguage}
                        onUserUpdate={handleUserUpdate}
                    />}
                </ProtectedRoute>
              } />
              <Route path="/:spaceSlug" element={
                  <SpaceDetailPage user={user} onUserUpdate={handleUserUpdate} />
              } />

              {/* Home and Fallback */}
              <Route path="/" element={<HomePage user={user} language={language} setLanguage={setLanguage} systemConfig={systemConfig} onLogout={handleLogout} onUserUpdate={handleUserUpdate} />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          ) : (
            <div className="page-loader">Loading configuration...</div>
          )}
        </div>
      </ToastProvider>
  );
};

export default App;
