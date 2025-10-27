import React, { useState, useEffect, useRef } from 'react';
import { AIConfig, Conversation, User, PricingPlan, SystemConfig } from '../types';
import { apiService } from '../services/apiService';
import { useToast } from './ToastProvider';
import { LanguageIcon, CryptoIcon,  LogoutIcon, ChatBubbleIcon, LoginIcon, PlusIcon } from './Icons';

interface ConversationSidebarProps {
    user: User | null;
    aiConfigs: AIConfig[];
    conversations: Conversation[];
    selectedConversationId: number | null;
    onSelectConversation: (conv: Conversation) => void;
    onNewConversation: (aiConfig: AIConfig) => void;
    onDeleteConversation: (id: number) => void;
    onGoToLogin: () => void;
    onGoToAdmin: () => void;
    onLogout: () => void;
    language: 'vi' | 'en';
    setLanguage: (lang: 'vi' | 'en') => void;
    systemConfig: SystemConfig;
    isSidebarCollapsed: boolean;
    setIsSidebarCollapsed: (collapsed: boolean) => void;
    isLoading: boolean;
    onOpenMeritPurchase: () => void;
    viewMode: 'chat' | 'meditation';
    setViewMode: (mode: 'chat' | 'meditation') => void;
}

const translations = {
    vi: {
        newChat: "Trò chuyện mới",
        startWith: "Bắt đầu với",
        recentChats: "Cuộc trò chuyện gần đây",
        loginToSeeHistory: "Đăng nhập để xem lịch sử.",
        noRecentChats: "Không có cuộc trò chuyện nào.",
        delete: "Xóa",
        login: "Đăng nhập",
        meritsLeft: "Số merit còn lại",
        subscriptionPlan: "Gói đăng ký",
        expiresOn: "Ngày hết hạn",
        changeLanguage: "English",
        adminPage: "Trang quản trị",
        logout: "Đăng xuất",
        unlimited: "Không giới hạn",
        noPlan: "Chưa đăng ký",
        loading: "Đang tải...",
        topUp: "Nạp Merit",
        featureNotImplemented: 'Chức năng "{feature}" chưa được cài đặt.',
        info: 'Thông tin',
        activity: 'Hoạt động',
        character: 'Mạng xã hội',
        context: 'Radio',
        chatMode: 'Trò chuyện',
        meditationMode: 'Thiền',
        meditationTitle: 'Thiền Định',
        meditationDesc: 'Tĩnh tâm là khoảng lặng cần thiết để tâm trí được nghỉ ngơi, tái tạo năng lượng và tìm thấy sự bình an từ bên trong. Hãy dành 30 phút để ngồi yên, tập trung vào hơi thở và để mọi suy nghĩ trôi qua nhẹ nhàng.',
    },
    en: {
        newChat: "New Conversation",
        startWith: "Start with",
        recentChats: "Recent Chats",
        loginToSeeHistory: "Login to see history.",
        noRecentChats: "No recent chats.",
        delete: "Delete",
        login: "Login",
        meritsLeft: "Merits Left",
        subscriptionPlan: "Subscription Plan",
        expiresOn: "Expires On",
        changeLanguage: "Tiếng Việt",
        adminPage: "Admin Page",
        logout: "Logout",
        unlimited: "Unlimited",
        noPlan: "Not Subscribed",
        loading: "Loading...",
        topUp: "Top up Merits",
        featureNotImplemented: 'Feature "{feature}" is not implemented yet.',
        info: 'Info',
        activity: 'Activity',
        character: 'Social feed',
        context: 'Radio',
        chatMode: 'Chat',
        meditationMode: 'Meditation',
        meditationTitle: 'Meditation',
        meditationDesc: 'Meditation is a necessary pause for the mind to rest, regenerate energy, and find inner peace. Take 30 minutes to sit still, focus on your breath, and let all thoughts pass gently.',
    }
};

// FIX: Export the component to make it available for import.
export const ConversationSidebar: React.FC<ConversationSidebarProps> = (props) => {
    const {
        user, aiConfigs, conversations, selectedConversationId, onSelectConversation,
        onNewConversation, onDeleteConversation, onGoToLogin, onLogout, language,
        setLanguage, systemConfig, isSidebarCollapsed, setIsSidebarCollapsed,
        isLoading, onGoToAdmin, onOpenMeritPurchase, viewMode, setViewMode
    } = props;

    const t = translations[language];
    const [pricingPlans, setPricingPlans] = useState<PricingPlan[]>([]);
    const [isNewChatOpen, setIsNewChatOpen] = useState(false);
    const newChatRef = useRef<HTMLDivElement>(null);
    const userMenuRef = useRef<HTMLDivElement>(null);
    const { showToast } = useToast();
    
    useEffect(() => {
        apiService.getPricingPlans().then(setPricingPlans).catch(console.error);
    }, []);
    
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (newChatRef.current && !newChatRef.current.contains(event.target as Node)) {
                setIsNewChatOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleQuickAction = (featureName: string) => {
        showToast(t.featureNotImplemented.replace('{feature}', featureName), 'info');
    };

    const currentPlanName = user?.subscriptionPlanId 
        ? pricingPlans.find(p => p.id === user.subscriptionPlanId)?.planName || 'Unknown Plan'
        : t.noPlan;
        
    const formattedExpiresAt = user?.subscriptionExpiresAt
        ? new Date(user.subscriptionExpiresAt).toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-US')
        : '-';
        
    const hasAdminPermission = user?.isAdmin || user?.permissions?.some(p => p !== 'user-billing');
    
    const currentTheme = user?.template || systemConfig.template;

    return (
        <aside className={`conversation-sidebar ${isSidebarCollapsed ? 'conversation-sidebar-collapsed' : 'w-80'} bg-background-panel flex flex-col h-full flex-shrink-0 border-r border-border-color`}>
            <header className="sidebar-header">
                 {!isSidebarCollapsed && (
                    <a href="#/" className="logo-link">
                        <img src={systemConfig.templateSettings[currentTheme].logoUrl} alt="Logo" className="logo" />
                    </a>
                )}
                <button 
                    onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
                    className="sidebar-toggle-btn"
                >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                    </svg>
                </button>
            </header>

            <div className="flex-shrink-0">
                <div className="quick-actions-container">
                    <div className="quick-actions-grid">
                        <button onClick={() => setViewMode('chat')} className={`quick-action-btn ${viewMode === 'chat' ? 'active' : ''}`} title={t.chatMode}>
                            <img src="/themes/giacngo/2.png" alt={t.chatMode} className="w-full h-full object-contain p-3" />
                        </button>
                        <button onClick={() => setViewMode('meditation')} className={`quick-action-btn ${viewMode === 'meditation' ? 'active' : ''}`} title={t.meditationMode}>
                            <img src="/themes/giacngo/5.png" alt={t.meditationMode} className="w-full h-full object-contain p-3" />
                        </button>
                        <button onClick={() => handleQuickAction(t.character)} className="quick-action-btn" title={t.character}>
                            <img src="/themes/giacngo/3.png" alt={t.character} className="w-full h-full object-contain p-3" />
                        </button>
                        <button onClick={() => handleQuickAction(t.context)} className="quick-action-btn" title={t.context}>
                            <img src="/themes/giacngo/4.png" alt={t.context} className="w-full h-full object-contain p-3" />
                        </button>
                    </div>
                </div>
            </div>
            
            <div className="flex-grow overflow-y-auto">
                {viewMode === 'chat' ? (
                    <>
                        <div className="px-3 pt-3">
                            {isSidebarCollapsed ? (
                                <button
                                    onClick={() => {
                                        if (aiConfigs.length > 0) {
                                            onNewConversation(aiConfigs[0]);
                                        }
                                    }}
                                    className="btn-new-chat justify-center"
                                    title={t.newChat}
                                >
                                    <PlusIcon className="w-6 h-6" />
                                </button>
                            ) : (
                                <div className="relative" ref={newChatRef}>
                                    <button onClick={() => setIsNewChatOpen(prev => !prev)} className="btn-new-chat">
                                        <span className="btn-new-chat-text">{t.newChat}</span>
                                    </button>
                                    {isNewChatOpen && (
                                        <div className="absolute bottom-full left-0 mb-2 w-full bg-background-panel border border-border-color rounded-lg shadow-lg z-10">
                                            <p className="p-2 text-xs text-text-light">{t.startWith}:</p>
                                            <ul className="p-2 max-h-60 overflow-y-auto">
                                                {aiConfigs.map(ai => (
                                                    <li key={ai.id}>
                                                        <button onClick={() => { onNewConversation(ai); setIsNewChatOpen(false); }} className="w-full text-left p-2 flex items-center gap-2 rounded-md hover:bg-background-light">
                                                            <img src={ai.avatarUrl} alt={ai.name} className="w-7 h-7 rounded-full" />
                                                            <p className="text-sm font-semibold">{ai.name}</p>
                                                        </button>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {!isSidebarCollapsed && (
                            <div className="px-3 py-2 space-y-1">
                                <h3 className="px-2 py-2 text-sm font-semibold text-text-light">{t.recentChats}</h3>
                                {user ? (
                                    isLoading ? <p className="text-center text-sm text-text-light p-4">{t.loading}</p> :
                                    conversations.length === 0 ? <p className="text-center text-sm text-text-light p-4">{t.noRecentChats}</p> :
                                    <ul className="space-y-1">
                                        {conversations.map(conv => (
                                            <li key={conv.id} className="relative group">
                                                <button
                                                    onClick={() => onSelectConversation(conv)}
                                                    className={`w-full text-left p-2 flex items-start gap-3 rounded-md transition-colors ${
                                                        selectedConversationId === conv.id ? 'bg-primary-light' : 'hover:bg-background-light'
                                                    }`}
                                                >
                                                    <ChatBubbleIcon className="w-4 h-4 mt-1 flex-shrink-0 text-text-light" />
                                                    <div className="flex-1 overflow-hidden">
                                                        <p className="text-sm font-semibold truncate text-text-main">{conv.messages[0]?.text || '...'}</p>
                                                        <p className="text-xs text-text-light">{new Date(conv.startTime).toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-US')}</p>
                                                    </div>
                                                </button>
                                                <button onClick={() => onDeleteConversation(conv.id)} title={t.delete} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full text-text-light hover:bg-red-100 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <p className="text-center text-sm text-text-light p-4">{t.loginToSeeHistory}</p>
                                )}
                            </div>
                        )}
                    </>
                ) : (
                    !isSidebarCollapsed && (
                        <div className="p-4">
                            <h3 className="font-semibold text-lg mb-2">{t.meditationTitle}</h3>
                            <p className="text-sm text-text-light">{t.meditationDesc}</p>
                        </div>
                    )
                )}
            </div>

            <footer className="sidebar-footer">
                {isSidebarCollapsed ? (
                    <div className="flex justify-center items-center py-2">
                        {user ? (
                            <button onClick={() => setIsSidebarCollapsed(false)} className="p-0 border-0 bg-transparent rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background-panel focus:ring-primary">
                                <img src={user.avatarUrl} alt={user.name} className="w-10 h-10 rounded-full cursor-pointer" title={user.name} />
                            </button>
                        ) : (
                            <button onClick={onGoToLogin} className="p-2 text-text-light hover:bg-background-light rounded-full" title={t.login}>
                                <LoginIcon className="w-7 h-7" />
                            </button>
                        )}
                    </div>
                ) : (
                     <div ref={userMenuRef}>
                        {user ? (
                            <div className="user-info-card">
                                <div className="user-info-header">
                                    <img src={user.avatarUrl} alt={user.name} />
                                    <div className="user-info-details overflow-hidden">
                                        <p className="font-semibold truncate">{user.name}</p>
                                        <p className="text-xs text-text-light truncate">{user.email}</p>
                                    </div>
                                </div>
                                <div className="user-info-stats">
                                    <div><span>{user.merits ?? t.unlimited}</span>{t.meritsLeft}</div>
                                    <div><span className="truncate">{currentPlanName}</span>{t.subscriptionPlan}</div>
                                    <div><span>{formattedExpiresAt}</span>{t.expiresOn}</div>
                                </div>
                                <div className="user-info-actions">
                                    <button onClick={onOpenMeritPurchase} className="btn-cta">
                                        <CryptoIcon className="w-4 h-4" /> {t.topUp}
                                    </button>
                                    <div className="grid grid-cols-2 gap-2">
                                        <button onClick={() => setLanguage(language === 'vi' ? 'en' : 'vi')} className="btn-secondary">
                                            <LanguageIcon className="w-4 h-4" />
                                            {t.changeLanguage}
                                        </button>
                                        {hasAdminPermission && (
                                            <button onClick={onGoToAdmin} className="btn-secondary">{t.adminPage}</button>
                                        )}
                                    </div>
                                    <button onClick={onLogout} className="btn-logout">
                                        <LogoutIcon className="w-4 h-4" />
                                        {t.logout}
                                    </button>
                                </div>
                            </div>
                        ) : (
                           <div className="space-y-2">
                               <button onClick={() => setLanguage(language === 'vi' ? 'en' : 'vi')} className="w-full flex items-center justify-center space-x-2 p-3 text-sm font-medium text-text-main bg-background-light rounded-lg hover:bg-border-color">
                                   <LanguageIcon className="w-5 h-5" />
                                   <span>{t.changeLanguage}</span>
                               </button>
                               <button onClick={onGoToLogin} className="w-full flex items-center justify-center space-x-2 p-3 text-sm font-medium text-text-on-primary bg-primary rounded-lg hover:bg-primary-hover">
                                   <LoginIcon className="w-5 h-5" />
                                   <span>{t.login}</span>
                               </button>
                           </div>
                        )}
                    </div>
                )}
            </footer>
        </aside>
    );
};
