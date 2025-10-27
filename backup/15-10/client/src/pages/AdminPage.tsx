import React, { useState } from 'react';
import { User, SystemConfig } from '../types';
import AiManagement from '../components/admin/AiManagement';
import UserManagement from '../components/admin/UserManagement';
import ConversationManagement from '../components/admin/ConversationManagement';
import Settings from '../components/admin/Settings';
import PricingManagement from '../components/admin/PricingManagement';
import BillingManagement from '../components/admin/BillingManagement';
import TemplateManagement from '../components/admin/TemplateManagement';
import FineTuneManagement from '../components/admin/FineTuneManagement';
import UserBillingManagement from '../components/user/UserBillingManagement';
import { AiIcon, UserIcon, SettingsIcon, ConversationIcon, PricingIcon, BillingIcon, TemplateIcon, FineTuneIcon, CryptoIcon } from '../components/Icons';

const translations = {
    vi: {
        aiManagement: 'Quản lý AI',
        userManagement: 'Quản lý Người dùng',
        templateManagement: 'Giao diện',
        fineTuneManagement: 'Fine-tune Dữ liệu',
        settings: 'Cài đặt',
        conversationManagement: 'Quản lý Hội thoại',
        pricingManagement: 'Quản lý Giá',
        manualBilling: 'Thanh toán thủ công',
        toChatPage: 'Về trang Chat',
        logout: 'Đăng xuất',
        language: 'Ngôn ngữ',
        transactionsAndTopUp: 'Giao dịch & Nạp Coin',
    },
    en: {
        aiManagement: 'AI Management',
        userManagement: 'User Management',
        templateManagement: 'Appearance',
        fineTuneManagement: 'Fine-tune Data',
        settings: 'Settings',
        conversationManagement: 'Conversation Management',
        pricingManagement: 'Pricing Management',
        manualBilling: 'Manual Billing',
        toChatPage: 'Back to Chat',
        logout: 'Logout',
        language: 'Language',
        transactionsAndTopUp: 'Transactions & Top-up',
    }
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

type AdminTab = 'ai' | 'users' | 'settings' | 'conversations' | 'pricing' | 'manual-billing' | 'templates' | 'finetune' | 'user-billing';

const AdminPage: React.FC<AdminPageProps> = ({ user, onLogout, language, setLanguage, systemConfig, onSystemConfigUpdate, onUserUpdate }) => {
  const [activeTab, setActiveTab] = useState<AdminTab>(user.isAdmin ? 'ai' : 'user-billing');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const t = translations[language];

  const renderContent = () => {
    if (!systemConfig) return null; // Or a loading state

    switch (activeTab) {
      // User-specific tab
      case 'user-billing':
        return <UserBillingManagement user={user} language={language} onUserUpdate={onUserUpdate} />;
      
      // Admin-only tabs
      case 'ai':
        return <AiManagement language={language} user={user} />;
      case 'users':
        return <UserManagement user={user} language={language}/>;
      case 'conversations':
        return <ConversationManagement user={user} language={language}/>;
      case 'pricing':
        return <PricingManagement user={user} language={language}/>;
      case 'manual-billing':
        return <BillingManagement user={user} language={language} onUserUpdate={onUserUpdate} />;
      case 'templates':
        return <TemplateManagement language={language} systemConfig={systemConfig} onSystemConfigUpdate={onSystemConfigUpdate} />;
      case 'finetune':
        return <FineTuneManagement language={language} />;
      case 'settings':
        return <Settings user={user} language={language} systemConfig={systemConfig} onSystemConfigUpdate={onSystemConfigUpdate} />;
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

  return (
    <div className="flex h-screen bg-background-light">
      <aside className={`bg-background-panel border-r border-border-color flex flex-col transition-all duration-300 ${isSidebarCollapsed ? 'w-20' : 'w-72'}`}>
        <div className="h-[73px] flex items-center justify-center relative border-b border-border-color px-4">
            {!isSidebarCollapsed && systemConfig && (
                <a href="#/" className="flex items-center">
                    <img src={systemConfig.templateSettings[systemConfig.template].logoUrl} alt="Logo" className="h-12" />
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
            {user.isAdmin ? (
                <>
                    <NavItem tab="ai" label={t.aiManagement} icon={<AiIcon />} />
                    <NavItem tab="users" label={t.userManagement} icon={<UserIcon />} />
                    <NavItem tab="conversations" label={t.conversationManagement} icon={<ConversationIcon />} />
                    <NavItem tab="pricing" label={t.pricingManagement} icon={<PricingIcon />} />
                    <NavItem tab="user-billing" label={t.transactionsAndTopUp} icon={<CryptoIcon />} />
                    <NavItem tab="manual-billing" label={t.manualBilling} icon={<BillingIcon />} />
                    <NavItem tab="templates" label={t.templateManagement} icon={<TemplateIcon />} />
                    <NavItem tab="finetune" label={t.fineTuneManagement} icon={<FineTuneIcon />} />
                    <NavItem tab="settings" label={t.settings} icon={<SettingsIcon />} />
                </>
            ) : (
                <NavItem tab="user-billing" label={t.transactionsAndTopUp} icon={<CryptoIcon />} />
            )}
        </nav>
        
        <div className="mt-auto p-4 border-t border-border-color">
            {!isSidebarCollapsed && (
                <div className="space-y-3">
                    <div>
                        <label className="block text-xs text-center text-text-light mb-1">{t.language}</label>
                        <div className="flex items-center justify-center space-x-1 bg-background-light p-1 rounded-lg">
                            <button
                                onClick={() => setLanguage('vi')}
                                className={`w-full py-1 text-sm font-semibold rounded-md transition-colors ${
                                    language === 'vi' ? 'bg-background-panel text-primary shadow-sm' : 'text-text-light'
                                }`}
                            >
                                VI
                            </button>
                            <button
                                onClick={() => setLanguage('en')}
                                className={`w-full py-1 text-sm font-semibold rounded-md transition-colors ${
                                    language === 'en' ? 'bg-background-panel text-primary shadow-sm' : 'text-text-light'
                                }`}
                            >
                                EN
                            </button>
                        </div>
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