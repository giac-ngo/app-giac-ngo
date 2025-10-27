import React, { useState, useEffect, useRef } from 'react';
import { AIConfig, Conversation, User, PricingPlan, SystemConfig } from '../types';
import { apiService } from '../services/apiService';
import { useToast } from './ToastProvider';
import { LanguageIcon, CryptoIcon, UserIcon, LogoutIcon, ChatBubbleIcon, LoginIcon } from './Icons';

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
    onOpenCoinPurchase: () => void;
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
        coinsLeft: "Số coin còn lại",
        subscriptionPlan: "Gói đăng ký",
        expiresOn: "Ngày hết hạn",
        changeLanguage: "English",
        adminPage: "Trang quản trị",
        logout: "Đăng xuất",
        unlimited: "Không giới hạn",
        noPlan: "Chưa đăng ký",
        loading: "Đang tải...",
        topUp: "Nạp Coin",
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
        coinsLeft: "Coins Left",
        subscriptionPlan: "Subscription Plan",
        expiresOn: "Expires On",
        changeLanguage: "Tiếng Việt",
        adminPage: "Admin Page",
        logout: "Logout",
        unlimited: "Unlimited",
        noPlan: "Not Subscribed",
        loading: "Loading...",
        topUp: "Top up",
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

const ConversationSidebar: React.FC<ConversationSidebarProps> = (props) => {
    const {
        user, aiConfigs, conversations, selectedConversationId, onSelectConversation,
        onNewConversation, onDeleteConversation, onGoToLogin, onLogout, language,
        setLanguage, systemConfig, isSidebarCollapsed, setIsSidebarCollapsed,
        isLoading, onGoToAdmin, onOpenCoinPurchase, viewMode, setViewMode
    } = props;

    const t = translations[language];
    const [pricingPlans, setPricingPlans] = useState<PricingPlan[]>([]);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const userMenuRef = useRef<HTMLDivElement>(null);
    const { showToast } = useToast();
    
    useEffect(() => {
        apiService.getPricingPlans().then(setPricingPlans).catch(console.error);
    }, []);
    
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
                setIsUserMenuOpen(false);
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

    return (
        <aside className={`conversation-sidebar ${isSidebarCollapsed ? 'conversation-sidebar-collapsed' : 'w-80'} bg-background-panel flex flex-col h-screen flex-shrink-0 border-r border-border-color`}>
            <header className="sidebar-header">
                {!isSidebarCollapsed && (
                    <a href="#/" className="logo-link">
                        <img src={systemConfig.templateSettings[systemConfig.template].logoUrl} alt="Logo" className="logo" />
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
                            <img src="/themes/giacngo/1.png" alt={t.chatMode} className="w-full h-full object-contain p-3" />
                        </button>
                        <button onClick={() => setViewMode('meditation')} className={`quick-action-btn ${viewMode === 'meditation' ? 'active' : ''}`} title={t.meditationMode}>
                            <img src="/themes/giacngo/2.png" alt={t.meditationMode} className="w-full h-full object-contain p-3" />
                        </button>
                        <button onClick={() => handleQuickAction(t.character)} className="quick-action-btn" title={t.character}>
                            <img src="/themes/giacngo/3.png" alt={t.character} className="w-full h-full object-contain p-3" />
                        </button>
                        <button onClick={() => handleQuickAction(t.context)} className="quick-action-btn" title={t.context}>
                            <img src="/themes/giacngo/4.png" alt={t.context} className="w-full h-full object-contain p-3" />
                        </button>
                    </div>
                    {viewMode === 'chat' && aiConfigs.length > 0 && (
                        <button onClick={() => onNewConversation(aiConfigs[0])} className="btn-new-chat">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                            <span className="btn-new-chat-text">{t.newChat}</span>
                        </button>
                    )}
                </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-6">
                {!isSidebarCollapsed && (
                    viewMode === 'chat' ? (
                        <div className="history-list-container">
                            <h3 className="text-xs font-semibold text-text-light uppercase tracking-wider mb-3 px-4">{t.recentChats}</h3>
                            {!user ? (
                                <div className="text-center py-4">
                                    <p className="text-sm text-text-light">{t.loginToSeeHistory}</p>
                                </div>
                            ) : isLoading ? (
                                <p className="text-center text-sm text-text-light py-4">{t.loading}</p>
                            ) : conversations.length === 0 ? (
                                <p className="text-center text-sm text-text-light py-4">{t.noRecentChats}</p>
                            ) : (
                                <div className="space-y-1">
                                    {conversations.map(conv => (
                                        <div key={conv.id} className={`group relative rounded-lg ${selectedConversationId === conv.id ? 'history-item-selected' : ''}`}>
                                            <button onClick={() => onSelectConversation(conv)} className="history-item">
                                                <ChatBubbleIcon className="w-5 h-5 text-text-light flex-shrink-0" />
                                                <div className="flex-1 overflow-hidden">
                                                    <p className="text-sm font-medium truncate">{conv.messages[0]?.text || 'New Conversation'}</p>
                                                    <p className="text-xs mt-1">{new Date(conv.startTime).toLocaleString()}</p>
                                                </div>
                                            </button>
                                            <button onClick={(e) => { e.stopPropagation(); onDeleteConversation(conv.id); }} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full text-text-light hover:bg-accent-red hover:text-white opacity-0 group-hover:opacity-100 transition-opacity" title={t.delete}>
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="p-4">
                            <h3 className="text-lg font-bold mb-2 text-text-main">{t.meditationTitle}</h3>
                            <p className="text-sm text-text-light leading-relaxed">{t.meditationDesc}</p>
                        </div>
                    )
                )}
            </div>

            <footer className="sidebar-footer">
                {user ? (
                    isSidebarCollapsed ? (
                        <div ref={userMenuRef}>
                            <button onClick={() => setIsUserMenuOpen(prev => !prev)} className="w-full flex justify-center">
                                <img src={user.avatarUrl} alt={user.name} className="w-10 h-10 rounded-full" />
                            </button>
                            {isUserMenuOpen && (
                                <div className="absolute bottom-4 left-full ml-2 w-56 bg-background-panel border border-border-color rounded-lg shadow-lg p-2 z-20">
                                    <div className="px-2 py-1.5 border-b border-border-color">
                                        <p className="font-semibold truncate text-sm text-text-main">{user.name}</p>
                                        <p className="text-xs text-text-light truncate">{user.email}</p>
                                    </div>
                                    <div className="py-1">
                                        <button onClick={() => { onOpenCoinPurchase(); setIsUserMenuOpen(false); }} className="w-full text-left flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-background-light">
                                            <CryptoIcon className="w-5 h-5"/>
                                            <span>{t.topUp}</span>
                                        </button>
                                        {(user.isAdmin || user.permissions?.includes("ai")) && 
                                            <button onClick={() => { onGoToAdmin(); setIsUserMenuOpen(false); }} className="w-full text-left flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-background-light">
                                                <UserIcon className="w-5 h-5"/>
                                                <span>{t.adminPage}</span>
                                            </button>
                                        }
                                        <button onClick={() => { setLanguage(language === 'vi' ? 'en' : 'vi'); setIsUserMenuOpen(false); }} className="w-full text-left flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-background-light">
                                            <LanguageIcon className="w-5 h-5"/>
                                            <span>{t.changeLanguage}</span>
                                        </button>
                                    </div>
                                    <div className="pt-1 border-t border-border-color">
                                        <button onClick={() => { onLogout(); setIsUserMenuOpen(false); }} className="w-full text-left flex items-center gap-3 px-3 py-2 text-sm rounded-md hover:bg-background-light text-accent-red">
                                            <LogoutIcon className="w-5 h-5"/>
                                            <span>{t.logout}</span>
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="user-info-card">
                            <div className="user-info-header">
                                <img src={user.avatarUrl} alt={user.name} />
                                <div className="user-info-details">
                                    <p className="font-semibold truncate">{user.name}</p>
                                </div>
                            </div>
                             <div className="user-info-stats">
                                <div>
                                    <p>{t.coinsLeft}</p>
                                    <span>{user.coins === null ? t.unlimited : user.coins}</span>
                                </div>
                                <div>
                                    <p>{t.subscriptionPlan}</p>
                                    <span>{currentPlanName}</span>
                                </div>
                                <div>
                                    <p>{t.expiresOn}</p>
                                    <span>{formattedExpiresAt}</span>
                                </div>
                            </div>
                            <div className="user-info-actions">
                                <button onClick={onOpenCoinPurchase} className="btn-cta">
                                    <CryptoIcon className="w-5 h-5"/>
                                    <span>{t.topUp}</span>
                                </button>
                                <div className="grid grid-cols-2 gap-2">
                                    <button onClick={() => setLanguage(language === 'vi' ? 'en' : 'vi')} className="btn-secondary">
                                        <LanguageIcon className="w-5 h-5"/>
                                        <span>{t.changeLanguage}</span>
                                    </button>
                                    {(user.isAdmin || user.permissions?.includes("ai")) && 
                                        <button onClick={onGoToAdmin} className="btn-secondary">
                                            <UserIcon className="w-5 h-5"/>
                                            <span>{t.adminPage}</span>
                                        </button>
                                    }
                                </div>
                                 <button onClick={onLogout} className="btn-logout">
                                    <LogoutIcon className="w-5 h-5"/>
                                    <span>{t.logout}</span>
                                </button>
                            </div>
                        </div>
                    )
                ) : (
                     isSidebarCollapsed ? (
                        <button onClick={onGoToLogin} className="w-full py-2.5 flex justify-center items-center text-primary hover:bg-primary-light rounded-md">
                           <LoginIcon className="w-6 h-6"/>
                        </button>
                   ) : (
                        <button onClick={onGoToLogin} className="btn-new-chat w-full">{t.login}</button>
                   )
                )}
            </footer>
        </aside>
    );
};

export default ConversationSidebar;