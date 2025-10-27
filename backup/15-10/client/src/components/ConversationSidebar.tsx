// client/src/components/ConversationSidebar.tsx
import React, { useState, useEffect } from 'react';
import { Conversation, User, SystemConfig } from '../types';
import { apiService } from '../services/apiService';

interface ConversationSidebarProps {
    user: User | null;
    systemConfig: SystemConfig;
    conversations: Conversation[];
    selectedConversationId: number | null;
    onSelectConversation: (conversation: Conversation) => void;
    onNewConversation: () => void;
    onDeleteConversation: (id: number) => void;
    onLogout: () => void;
    onGoToLogin: () => void;
    onGoToAdmin: () => void;
    language: 'vi' | 'en';
    setLanguage: (lang: 'vi' | 'en') => void;
    isCollapsed: boolean;
    onToggleCollapse: () => void;
    isLoading: boolean;
}

const translations = {
    vi: {
        conversations: 'Các cuộc hội thoại',
        newChat: 'Trò chuyện mới',
        login: 'Đăng nhập',
        pricing: 'Bảng giá',
        adminPage: 'Trang quản lý',
        logout: 'Đăng xuất',
        confirmDelete: 'Bạn có chắc muốn xoá cuộc hội thoại này?',
        unlimited: 'Không giới hạn',
        coins: 'coins',
        noSubscription: 'Chưa có gói',
        expiresOn: 'Hết hạn:',
        topUp: 'Giao dịch & Nạp Coin',
    },
    en: {
        conversations: 'Conversations',
        newChat: 'New Chat',
        login: 'Login',
        pricing: 'Pricing',
        adminPage: 'Management Page',
        logout: 'Logout',
        confirmDelete: 'Are you sure you want to delete this conversation?',
        unlimited: 'Unlimited',
        coins: 'coins',
        noSubscription: 'No Subscription',
        expiresOn: 'Expires:',
        topUp: 'Transactions & Top-up',
    }
};

const UserInfo: React.FC<{ user: User, isCollapsed: boolean, language: 'vi'|'en' }> = ({ user, isCollapsed, language }) => {
    const [planName, setPlanName] = useState('');
    const t = translations[language];

    useEffect(() => {
        if (user.subscriptionPlanId) {
            apiService.getPricingPlans().then(plans => {
                const currentPlan = plans.find(p => p.id === user.subscriptionPlanId);
                if (currentPlan) {
                    setPlanName(currentPlan.planName);
                }
            });
        } else {
            setPlanName(t.noSubscription);
        }
    }, [user.subscriptionPlanId, language]);
    
    const expiryDate = user.subscriptionExpiresAt ? new Date(user.subscriptionExpiresAt).toLocaleDateString(language) : '';

    return (
        <div className="ml-3 flex-1 overflow-hidden">
            <p className="font-semibold truncate">{user.name}</p>
            <p className="text-xs text-text-light truncate" title={`${planName} - ${t.expiresOn} ${expiryDate}`}>
                {planName} {expiryDate && `(${t.expiresOn} ${expiryDate})`}
            </p>
             <p className="text-sm text-text-light font-medium">{user.coins == null ? t.unlimited : `${user.coins} ${t.coins}`}</p>
        </div>
    )
}

const SkeletonLoader: React.FC<{isCollapsed: boolean}> = ({ isCollapsed }) => (
    <div className="p-2 space-y-2 animate-pulse">
        {[...Array(5)].map((_, i) => (
            <div key={i} className={`w-full flex items-center p-2 rounded-md ${isCollapsed ? 'justify-center' : ''}`}>
                <div className={`h-4 bg-gray-200 rounded ${isCollapsed ? 'w-5' : 'w-full'}`}></div>
            </div>
        ))}
    </div>
);


const ConversationSidebar: React.FC<ConversationSidebarProps> = (props) => {
    const {
        user, systemConfig, conversations, selectedConversationId,
        onSelectConversation, onNewConversation, onDeleteConversation,
        onLogout, onGoToLogin, onGoToAdmin, language, setLanguage, isCollapsed, onToggleCollapse,
        isLoading
    } = props;
    const t = translations[language];

    const handleDelete = (e: React.MouseEvent, id: number) => {
        e.stopPropagation();
        if (window.confirm(t.confirmDelete)) {
            onDeleteConversation(id);
        }
    };

    return (
        <div className={`flex flex-col h-full bg-background-panel text-text-main border-r border-border-color transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-80'}`}>
            <div className="p-4 flex items-center border-b border-border-color h-[73px]">
                {!isCollapsed && (
                    <div className="flex-1 flex justify-center">
                        <img src={systemConfig.templateSettings[systemConfig.template].logoUrl} alt="Logo" className="h-12 max-w-full" />
                    </div>
                )}
                 <button onClick={onToggleCollapse} className={`p-2 rounded-md hover:bg-background-light ${isCollapsed ? 'mx-auto' : ''}`} title={isCollapsed ? 'Mở rộng' : 'Thu gọn'}>
                     <svg className={`w-6 h-6 text-gray-500 transition-transform duration-300 ${isCollapsed ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path></svg>
                </button>
            </div>

             <div className="p-2 border-b border-border-color">
                 <button onClick={onNewConversation} className={`w-full flex items-center p-2 rounded-md text-sm font-medium hover:bg-background-light ${isCollapsed ? 'justify-center' : ''}`}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
                    {!isCollapsed && <span className="ml-3">{t.newChat}</span>}
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-2">
                {isLoading ? <SkeletonLoader isCollapsed={isCollapsed} /> : (
                    user && conversations.length > 0 && (
                        <div className="mt-4">
                            {!isCollapsed && <h3 className="px-2 py-1 text-sm font-semibold text-text-light">{t.conversations}</h3>}
                            <div className="space-y-1">
                                {conversations.map(conv => (
                                    <button key={conv.id} onClick={() => onSelectConversation(conv)} className={`w-full text-left flex items-center p-2 rounded-md group ${selectedConversationId === conv.id ? 'bg-primary-light text-primary-text' : 'hover:bg-background-light'} ${isCollapsed ? 'justify-center' : ''}`} title={!isCollapsed ? '' : (conv.messages[0]?.text || 'New Conversation')}>
                                        {!isCollapsed && <p className="flex-1 text-sm truncate">{conv.messages[0]?.text || 'New Conversation'}</p>}
                                        {isCollapsed && <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>}
                                        {!isCollapsed && <span onClick={(e) => handleDelete(e, conv.id)} className="ml-2 text-text-light opacity-0 group-hover:opacity-100 hover:text-accent-red">&times;</span>}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )
                )}
            </div>

            <div className="p-4 border-t border-border-color space-y-2">
                {user && !isCollapsed && (
                     <a href="#/admin" className={`w-full flex items-center justify-center p-2 rounded-md text-sm font-medium text-text-on-primary bg-primary hover:bg-primary-hover`}>
                        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20"><path d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" /></svg>
                        {t.topUp}
                    </a>
                )}
                {user ? (
                    <div className="flex items-center">
                         <img src={user.avatarUrl} alt={user.name} className={`w-10 h-10 rounded-full flex-shrink-0 ${isCollapsed ? 'mx-auto' : ''}`} />
                        {!isCollapsed && <UserInfo user={user} isCollapsed={isCollapsed} language={language}/>}
                        {!isCollapsed && (
                             <div className="relative group">
                                <button className="p-2 rounded-md hover:bg-background-light">
                                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z"></path></svg>
                                </button>
                                <div className="absolute bottom-full right-0 mb-2 w-48 bg-background-panel rounded-md shadow-lg py-1 ring-1 ring-black ring-opacity-5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10">
                                    <a href="#/admin" className="block px-4 py-2 text-sm text-text-main hover:bg-background-light">{t.adminPage}</a>
                                    <button onClick={onLogout} className="w-full text-left block px-4 py-2 text-sm text-text-main hover:bg-background-light">{t.logout}</button>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                     <button onClick={onGoToLogin} className={`w-full px-4 py-2 text-sm font-medium text-text-on-primary bg-primary rounded-md hover:bg-primary-hover ${isCollapsed ? 'p-2' : ''}`}>
                         {isCollapsed ? <svg className="w-6 h-6 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" /></svg> : t.login}
                    </button>
                )}
            </div>
        </div>
    );
};

export default ConversationSidebar;