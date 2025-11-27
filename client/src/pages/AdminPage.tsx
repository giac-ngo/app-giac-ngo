

import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { User, SystemConfig } from '../types';
import { Dashboard } from '../components/admin/Dashboard';
import { AiManagement } from '../components/admin/AiManagement';
import { UserManagement } from '../components/admin/UserManagement';
import { ConversationManagement } from '../components/admin/ConversationManagement';
import { Settings } from '../components/admin/Settings';
import { PricingManagement } from '../components/admin/PricingManagement';
import { BillingManagement } from '../components/admin/BillingManagement';
import { TemplateManagement } from '../components/admin/TemplateManagement';
import { FineTuneManagement } from '../components/admin/FineTuneManagement';
import { UserBillingManagement } from '../components/admin/UserBillingManagement';
import { RoleManagement } from '../components/admin/RoleManagement';
import { ForgotPasswordModal } from '../components/ForgotPasswordModal';
import { ChangePasswordModal } from '../components/user/ChangePasswordModal';
import { DocumentTextIcon, DashboardIcon, AiIcon, UserIcon, SettingsIcon, ConversationIcon, PricingIcon, BillingIcon, TemplateIcon, FineTuneIcon, CryptoIcon, RoleIcon, ChatBubbleIcon, MapPinIcon, RadioIcon } from '../components/Icons';
import { FilesAndDocuments } from '../components/admin/FilesAndDocuments';
import { CommentManagement } from '../components/admin/CommentManagement';
import { SpaceManagement } from '../components/admin/SpaceManagement';
import { DharmaTalksManagement } from '../components/admin/DharmaTalksManagement';
import { SpaceOwnerBilling } from '../components/admin/SpaceOwnerBilling';


const translations = {
    vi: {
        dashboard: 'Dashboard',
        aiManagement: 'Quản lý AI',
        userManagement: 'Quản lý Người dùng',
        roleManagement: 'Phân quyền',
        commentManagement: 'Quản lý Bình luận',
        filesAndDocuments: 'Tệp & Tài liệu',
        spaceManagement: 'Quản lý Không gian',
        dharmaTalkManagement: 'Quản lý Pháp Thoại',
        templateManagement: 'Giao diện',
        fineTuneManagement: 'Fine-tune Dữ liệu',
        settings: 'Cài đặt',
        conversationManagement: 'Quản lý Hội thoại',
        pricingManagement: 'Quản lý Giá',
        manualBilling: 'Giao dịch & Rút tiền',
        toAppPage: 'Về không gian thực hành',
        logout: 'Đăng xuất',
        language: 'English',
        transactionsAndTopUp: 'Ví Merit',
        spaceBilling: 'Ví Space',
        changePassword: 'Đổi mật khẩu',
    },
    en: {
        dashboard: 'Dashboard',
        aiManagement: 'AI Management',
        userManagement: 'User Management',
        roleManagement: 'Permissions',
        commentManagement: 'Comment Management',
        filesAndDocuments: 'Files & Documents',
        spaceManagement: 'Space Management',
        dharmaTalkManagement: 'Dharma Talk Management',
        templateManagement: 'Appearance',
        fineTuneManagement: 'Fine-tune Data',
        settings: 'Settings',
        conversationManagement: 'Conversation',
        pricingManagement: 'Pricing Management',
        manualBilling: 'Transactions & Withdrawals',
        toAppPage: 'Back to Practice Space',
        logout: 'Logout',
        language: 'Tiếng Việt',
        transactionsAndTopUp: 'Merit Wallet',
        spaceBilling: 'Space Wallet',
        changePassword: 'Change Password',
    }
};

type AdminTab = 'dashboard' | 'ai' | 'users' | 'roles' | 'settings' | 'conversations' | 'pricing' | 'manual-billing' | 'templates' | 'finetune' | 'user-billing' | 'files' | 'comments' | 'spaces' | 'dharma-talks' | 'space-billing';

const getFirstAllowedTab = (user: User): AdminTab => {
    // A super admin (who can manage roles) defaults to dashboard
    if (user.permissions?.includes('roles')) return 'dashboard';
    const allowedTabs: AdminTab[] = [
        'user-billing', 'space-billing', 'dashboard', 'ai', 'users', 'conversations', 'pricing', 'manual-billing', 
        'templates', 'finetune', 'settings', 'roles', 'files', 'comments', 'spaces', 'dharma-talks'
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
  const { section, spaceSlug } = useParams<{ section?: AdminTab, spaceSlug?: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<AdminTab>(section || getFirstAllowedTab(user));
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  const [isForgotPasswordModalOpen, setIsForgotPasswordModalOpen] = useState(false);
  const t = translations[language];
  

  useEffect(() => {
    const effectiveSpaceSlug = spaceSlug || 'giac-ngo';
    const newTab = section || getFirstAllowedTab(user);
    const isPermitted = user.permissions?.includes(newTab);

    if (isPermitted) {
      setActiveTab(newTab);
    } else {
      const firstAllowed = getFirstAllowedTab(user);
      setActiveTab(firstAllowed);
      navigate(`/${effectiveSpaceSlug}/admin/${firstAllowed}`, { replace: true });
    }
  }, [section, user, navigate, spaceSlug]);


  const renderContent = () => {
    if (!systemConfig) return null;

    const currentTabAllowed = user.permissions?.includes(activeTab);
    if (!currentTabAllowed) {
        return <div className="p-8">Bạn không có quyền truy cập vào mục này.</div>;
    }

    switch (activeTab) {
      case 'dashboard':
        return <Dashboard language={language} />;
      case 'files':
        return <FilesAndDocuments language={language} user={user} />;
      case 'spaces':
        return <SpaceManagement language={language} user={user} />;
      case 'dharma-talks':
        return <DharmaTalksManagement language={language} />;
      case 'user-billing':
        return <UserBillingManagement user={user} language={language} onUserUpdate={onUserUpdate} />;
      case 'space-billing':
        return <SpaceOwnerBilling user={user} onUserUpdate={onUserUpdate} language={language} />;
      case 'ai':
        return <AiManagement language={language} user={user} />;
      case 'users':
        return <UserManagement user={user} language={language} onUserUpdate={onUserUpdate}/>;
      case 'roles':
        return <RoleManagement language={language} />;
      case 'comments':
        return <CommentManagement language={language} />;
      case 'conversations':
        return <ConversationManagement user={user} language={language}/>;
      case 'pricing':
        return <PricingManagement user={user} language={language}/>;
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
        onClick={() => navigate(`/${spaceSlug || 'giac-ngo'}/admin/${tab}`)}
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
  
  const hasPermission = (tab: AdminTab) => user.permissions?.includes(tab);
  const effectiveSpaceSlug = spaceSlug || 'giac-ngo';

  return (
    <div className="admin-page-container flex h-screen overflow-hidden bg-background-light">
      <aside className={`bg-background-panel border-r border-border-color flex flex-col transition-all duration-300 ${isSidebarCollapsed ? 'w-20' : 'w-64'}`}>
        <div className="h-[73px] flex items-center justify-center relative border-b border-border-color px-4 flex-shrink-0">
            {!isSidebarCollapsed && systemConfig && (
                <Link to="/" className="flex items-center">
                    <img src={systemConfig.templateSettings[user.template || systemConfig.template].logoUrl} alt="Logo" className="h-12" />
                </Link>
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
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {hasPermission('dashboard') && <NavItem tab="dashboard" label={t.dashboard} icon={<DashboardIcon />} />}
            {hasPermission('files') && <NavItem tab="files" label={t.filesAndDocuments} icon={<DocumentTextIcon />} />}
            {hasPermission('spaces') && <NavItem tab="spaces" label={t.spaceManagement} icon={<MapPinIcon />} />}
            {hasPermission('dharma-talks') && <NavItem tab="dharma-talks" label={t.dharmaTalkManagement} icon={<RadioIcon />} />}
            {hasPermission('comments') && <NavItem tab="comments" label={t.commentManagement} icon={<ChatBubbleIcon />} />}            
            {hasPermission('ai') && <NavItem tab="ai" label={t.aiManagement} icon={<AiIcon />} />}
            {hasPermission('conversations') && <NavItem tab="conversations" label={t.conversationManagement} icon={<ConversationIcon />} />}
            {hasPermission('finetune') && <NavItem tab="finetune" label={t.fineTuneManagement} icon={<FineTuneIcon />} />}          
            {hasPermission('pricing') && <NavItem tab="pricing" label={t.pricingManagement} icon={<PricingIcon />} />}
            {hasPermission('user-billing') && <NavItem tab="user-billing" label={t.transactionsAndTopUp} icon={<BillingIcon />} />}
            {hasPermission('space-billing') && <NavItem tab="space-billing" label={t.spaceBilling} icon={<BillingIcon />} />}
            {hasPermission('manual-billing') && <NavItem tab="manual-billing" label={t.manualBilling} icon={<CryptoIcon />} />}
            {hasPermission('users') && <NavItem tab="users" label={t.userManagement} icon={<UserIcon />} />}
            {hasPermission('roles') && <NavItem tab="roles" label={t.roleManagement} icon={<RoleIcon />} />}
            {hasPermission('templates') && <NavItem tab="templates" label={t.templateManagement} icon={<TemplateIcon />} />}            
            {hasPermission('settings') && <NavItem tab="settings" label={t.settings} icon={<SettingsIcon />} />}
        </nav>
        
        <div className="p-4 border-t border-border-color flex-shrink-0">
             {isSidebarCollapsed ? (
                <div className="flex justify-center">
                    <button onClick={() => setIsSidebarCollapsed(false)} title={user.name}>
                        <img src={user.avatarUrl} alt={user.name} className="w-10 h-10 rounded-full" />
                    </button>
                </div>
            ) : (
                <div className="space-y-3">
                    <div className="w-full p-2 text-sm font-medium text-text-main border border-border-color rounded-md">
                        <div className="flex items-center">
                            <img src={user.avatarUrl} alt={user.name} className="w-10 h-10 rounded-full mr-3" />
                            <div className="overflow-hidden">
                                <p className="font-semibold truncate text-sm">{user.name}</p>
                                <p className="text-xs text-text-light truncate">{user.email}</p>
                                <button
                                    onClick={() => setIsChangePasswordModalOpen(true)}
                                    className="text-xs text-primary hover:underline mt-1 text-left p-0 bg-transparent border-none cursor-pointer"
                                >
                                    {t.changePassword}
                                </button>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={() => setLanguage(language === 'vi' ? 'en' : 'vi')}
                        className="w-full flex items-center justify-center space-x-2 px-4 py-2 text-sm font-medium text-text-main border border-border-color rounded-md hover:bg-background-light"
                    >
                        <SettingsIcon className="w-5 h-5"/>
                        <span>{language === 'vi' ? 'English' : 'Tiếng Việt'}</span>
                    </button>

                    <Link to={`/${effectiveSpaceSlug}/chat`} className="block w-full text-center px-4 py-2 text-sm font-medium text-text-main border border-border-color rounded-md hover:bg-background-light">
                        {t.toAppPage}
                    </Link>
                    <button onClick={onLogout} className="w-full px-4 py-2 text-sm font-medium text-text-on-primary bg-accent-red rounded-md hover:bg-accent-red-hover">
                        {t.logout}
                    </button>
                </div>
            )}
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden bg-background-panel">
        {renderContent()}
      </main>

       {systemConfig && (
        <>
            <ChangePasswordModal 
                isOpen={isChangePasswordModalOpen}
                onClose={() => setIsChangePasswordModalOpen(false)}
                user={user}
                language={language}
                onOpenForgotPassword={() => {
                    setIsChangePasswordModalOpen(false);
                    setIsForgotPasswordModalOpen(true);
                }}
            />
            <ForgotPasswordModal
                isOpen={isForgotPasswordModalOpen}
                onClose={() => setIsForgotPasswordModalOpen(false)}
                language={language}
            />
        </>
    )}
    </div>
  );
};

export default AdminPage;