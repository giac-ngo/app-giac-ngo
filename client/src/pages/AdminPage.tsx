


import React, { useState, useEffect } from 'react';
import { User, SystemConfig } from '../types';
import Dashboard from '../components/admin/Dashboard';
import AiManagement from '../components/admin/AiManagement';
import UserManagement from '../components/admin/UserManagement';
import ConversationManagement from '../components/admin/ConversationManagement';
import Settings from '../components/admin/Settings';
import PricingManagement from '../components/admin/PricingManagement';
import BillingManagement from '../components/admin/BillingManagement';
import TemplateManagement from '../components/admin/TemplateManagement';
import FineTuneManagement from '../components/admin/FineTuneManagement';
import UserBillingManagement from '../components/user/UserBillingManagement';
import RoleManagement from '../components/admin/RoleManagement';
import { DashboardIcon, AiIcon, UserIcon, SettingsIcon, ConversationIcon, PricingIcon, BillingIcon, TemplateIcon, FineTuneIcon, CryptoIcon, RoleIcon } from '../components/Icons';


const translations = {
    vi: {
        dashboard: 'Dashboard',
        aiManagement: 'Quản lý AI',
        userManagement: 'Quản lý Người dùng',
        roleManagement: 'Quyền', // New translation
        templateManagement: 'Giao diện',
        fineTuneManagement: 'Fine-tune Dữ liệu',
        settings: 'Cài đặt',
        conversationManagement: 'Quản lý Hội thoại',
        pricingManagement: 'Quản lý Giá',
        manualBilling: 'Nạp Merit thủ công',
        toChatPage: 'Về trang Chat',
        logout: 'Đăng xuất',
        language: 'English',
        transactionsAndTopUp: 'Giao dịch & Nạp Merit',
    },
    en: {
        dashboard: 'Dashboard',
        aiManagement: 'AI Management',
        userManagement: 'User Management',
        roleManagement: 'Permissions', // New translation
        templateManagement: 'Appearance',
        fineTuneManagement: 'Fine-tune Data',
        settings: 'Settings',
        conversationManagement: 'Conversation',
        pricingManagement: 'Pricing Management',
        manualBilling: 'Manual Top-Up',
        toChatPage: 'Back to Chat',
        logout: 'Logout',
        language: 'Tiếng Việt',
        transactionsAndTopUp: 'Merit Top-up',
    }
};

type AdminTab = 'dashboard' | 'ai' | 'users' | 'roles' | 'settings' | 'conversations' | 'pricing' | 'manual-billing' | 'templates' | 'finetune' | 'user-billing';

const getFirstAllowedTab = (user: User): AdminTab => {
    if (user.isAdmin) return 'dashboard'; // Super admin defaults to dashboard
    const allowedTabs: AdminTab[] = [
        'user-billing', 'dashboard', 'ai', 'users', 'conversations', 'pricing', 'manual-billing', 
        'templates', 'finetune', 'settings'
    ];
    // A regular user's first tab should always be their own billing page.
    return allowedTabs.find(tab => user.permissions?.includes(tab)) || 'user-billing';
};

interface AdminPageProps {
  user: User;
  onLogout: () => void;
  language: 'vi' | 'en';
  setLanguage: (lang: 'vi' | 'en') => void;
  systemConfig: SystemConfig | null;
  onSystemConfigUpdate: (newConfig: SystemConfig) => void;
  onUserUpdate: (updatedData: Partial<User>) => void;
}

const AdminPage: React.FC<AdminPageProps> = ({ user, onLogout, language, setLanguage, systemConfig, onSystemConfigUpdate, onUserUpdate }) => {
  const [activeTab, setActiveTab] = useState<AdminTab>(() => {
    const hashParts = window.location.hash.split('/');
    const tabFromHash = hashParts.length > 2 ? (hashParts[2] as AdminTab) : undefined;
    
    const allPossibleTabs: AdminTab[] = ['dashboard', 'ai', 'users', 'roles', 'settings', 'conversations', 'pricing', 'manual-billing', 'templates', 'finetune', 'user-billing'];

    if (tabFromHash && allPossibleTabs.includes(tabFromHash)) {
        const isPermitted = user.isAdmin || user.permissions?.includes(tabFromHash);
        if (isPermitted) {
            return tabFromHash;
        }
    }
    
    return getFirstAllowedTab(user);
  });
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const t = translations[language];
  

  useEffect(() => {
    const isCurrentTabAllowed = user.isAdmin || user.permissions?.includes(activeTab);
    if (!isCurrentTabAllowed) {
        setActiveTab(getFirstAllowedTab(user));
    }
  }, [user, activeTab]);
  
  useEffect(() => {
    window.location.hash = `#/admin/${activeTab}`;
  }, [activeTab]);


  const renderContent = () => {
    if (!systemConfig) return null;

    const currentTabAllowed = user.isAdmin || user.permissions?.includes(activeTab);
    if (!currentTabAllowed) {
        return <div className="p-8">Bạn không có quyền truy cập vào mục này.</div>;
    }

    switch (activeTab) {
      case 'dashboard':
        return <Dashboard language={language} />;
      case 'user-billing':
        return <UserBillingManagement user={user} language={language} onUserUpdate={onUserUpdate} />;
      case 'ai':
        return <AiManagement language={language} user={user} />;
      case 'users':
        return <UserManagement user={user} language={language} onUserUpdate={onUserUpdate}/>;
      case 'roles':
        return user.isAdmin ? <RoleManagement language={language} /> : null;
      case 'conversations':
        return <ConversationManagement user={user} language={language}/>;
      case 'pricing':
        return <PricingManagement language={language}/>;
      case 'manual-billing':
        return <BillingManagement user={user} language={language} onUserUpdate={onUserUpdate} />;
      case 'templates':
        return <TemplateManagement language={language} systemConfig={systemConfig} onSystemConfigUpdate={onSystemConfigUpdate} user={user} onUserUpdate={onUserUpdate} />;
      case 'finetune':
        return <FineTuneManagement language={language} />;
      case 'settings':
        return <Settings user={user} language={language} systemConfig={systemConfig} onSystemConfigUpdate={onSystemConfigUpdate} onUserUpdate={onUserUpdate} />;
      default:
        return null;
    }
  };
  
  const NavItem: React.FC<{tab: AdminTab; label: string; icon: React.ReactElement<{ className?: string }>}> = ({ tab, label, icon }) => (
    <button
        onClick={() => setActiveTab(tab)}
        className={`w-full flex items-center p-3 rounded-lg text-sm font-medium transition-colors ${
            activeTab === tab
                ? 'bg-primary-light text-primary'
                : 'text-text-light hover:bg-background-light'
        } ${isSidebarCollapsed ? 'justify-center' : ''}`}
    >
        {React.cloneElement(icon, { className: 'w-6 h-6' })}
        {!isSidebarCollapsed && <span className="ml-4">{label}</span>}
    </button>
  );
  
  const hasPermission = (tab: AdminTab) => user.isAdmin || user.permissions?.includes(tab);

  return (
    <div className="admin-page-container flex h-screen bg-background-light">
      <aside className={`bg-background-panel border-r border-border-color flex flex-col transition-all duration-300 ${isSidebarCollapsed ? 'w-20' : 'w-64'}`}>
        <div className="h-[73px] flex items-center justify-center relative border-b border-border-color px-4">
            {!isSidebarCollapsed && systemConfig && (
                <a href="#/" className="flex items-center">
                    <img src={systemConfig.templateSettings[user.template || systemConfig.template].logoUrl} alt="Logo" className="h-12" />
                </a>
            )}
            <button 
                onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
                className={`p-2 rounded-md hover:bg-background-light text-text-light transition-transform duration-300 ${isSidebarCollapsed ? 'rotate-180' : 'absolute right-4'}`}
            >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
            </button>
        </div>
        <nav className="flex-1 p-4 space-y-2">
            {hasPermission('dashboard') && <NavItem tab="dashboard" label={t.dashboard} icon={<DashboardIcon />} />}
            {hasPermission('user-billing') && <NavItem tab="user-billing" label={t.transactionsAndTopUp} icon={<BillingIcon />} />}
            
            {(user.isAdmin || (user.permissions && user.permissions.length > 1 && user.permissions.some(p => p !== 'user-billing'))) && <hr className="my-2 border-border-color" />}
            
            {hasPermission('ai') && <NavItem tab="ai" label={t.aiManagement} icon={<AiIcon />} />}
            {hasPermission('users') && <NavItem tab="users" label={t.userManagement} icon={<UserIcon />} />}
            {user.isAdmin && <NavItem tab="roles" label={t.roleManagement} icon={<RoleIcon />} />}
            {hasPermission('conversations') && <NavItem tab="conversations" label={t.conversationManagement} icon={<ConversationIcon />} />}
            {hasPermission('pricing') && <NavItem tab="pricing" label={t.pricingManagement} icon={<PricingIcon />} />}
            {hasPermission('manual-billing') && <NavItem tab="manual-billing" label={t.manualBilling} icon={<CryptoIcon />} />}
            {hasPermission('templates') && <NavItem tab="templates" label={t.templateManagement} icon={<TemplateIcon />} />}
            {hasPermission('finetune') && <NavItem tab="finetune" label={t.fineTuneManagement} icon={<FineTuneIcon />} />}
            {hasPermission('settings') && <NavItem tab="settings" label={t.settings} icon={<SettingsIcon />} />}
        </nav>
        
        <div className="mt-auto p-4 border-t border-border-color">
             {isSidebarCollapsed ? (
                <div className="flex justify-center">
                    <button onClick={() => setIsSidebarCollapsed(false)} title={user.name}>
                        <img src={user.avatarUrl} alt={user.name} className="w-10 h-10 rounded-full" />
                    </button>
                </div>
            ) : (
                <div className="space-y-3">
                    <div className="w-full flex items-center justify-center space-x-2 px-4 py-2 text-sm font-medium text-text-main border border-border-color rounded-md hover:bg-background-light">
                        <div className="flex items-center">
                            <img src={user.avatarUrl} alt={user.name} className="w-10 h-10 rounded-full mr-3" />
                            <div className="overflow-hidden">
                                <p className="font-semibold truncate text-sm">{user.name}</p>
                                <p className="text-xs text-text-light truncate">{user.email}</p>
                            </div>
                        </div>
                    </div>

                    <div>                        
                        <button
                            onClick={() => setLanguage(language === 'vi' ? 'en' : 'vi')}
                            className="w-full flex items-center justify-center space-x-2 px-4 py-2 text-sm font-medium text-text-main border border-border-color rounded-md hover:bg-background-light"
                        >
                            <SettingsIcon className="w-5 h-5" />
                            <span>{language === 'vi' ? 'English' : 'Tiếng Việt'}</span>
                        </button>
                    </div>
                    <a href="#/" className="block w-full text-center px-4 py-2 text-sm font-medium text-text-main border border-border-color rounded-md hover:bg-background-light">
                        {t.toChatPage}
                    </a>
                    <button onClick={onLogout} className="w-full px-4 py-2 text-sm font-medium text-text-on-primary bg-accent-red rounded-md hover:bg-accent-red-hover">
                        {t.logout}
                    </button>
                </div>
            )}
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        {renderContent()}
      </main>
    </div>
  );
};

export default AdminPage;