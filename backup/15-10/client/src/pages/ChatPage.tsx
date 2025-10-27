import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { User, Message, AIConfig, SystemConfig, Conversation } from '../types';
import { apiService } from '../services/apiService';
import ConversationSidebar from '../components/ConversationSidebar';
import MessageContextMenu from '../components/MessageContextMenu';
import PricingModal from '../components/PricingModal';
import { useToast } from '../components/ToastProvider';
import { SpeakerOnIcon, SpeakerOffIcon } from '../components/Icons';

declare global {
    interface Window {
        SpeechRecognition: any;
        webkitSpeechRecognition: any;
    }
}

const translations = {
    vi: {
        loadError: "Xin lỗi, không thể tải dữ liệu cần thiết. Vui lòng thử lại sau.",
        logout: "Đăng xuất",
        inputPlaceholder: "Nhập tin nhắn của bạn...",
        genericError: "Xin lỗi, đã có lỗi xảy ra.",
        toAdminPage: "Quản trị viên",
        login: "Đăng nhập",
        language: "Ngôn ngữ",
        aiListTitle: "Danh sách AI",
        guestLimitReached: "Bạn đã hết lượt nhắn tin cho khách. Vui lòng đăng nhập.",
        userLimitReached: "Bạn đã hết coin. Vui lòng nạp thêm để tiếp tục.",
        subscriptionNeeded: "AI này yêu cầu gói thuê bao. Vui lòng mua gói để sử dụng.",
        pricing: "Bảng giá",
        micNotSupported: 'Trình duyệt không hỗ trợ nhận dạng giọng nói.',
        messageCopied: 'Đã sao chép tin nhắn!',
        remainingMessages: 'Số tin nhắn còn lại:',
        remainingCoins: 'Số coins còn lại:',
        unlimited: 'Không giới hạn',
        autoPlayOn: 'Tự động phát câu trả lời (Bật)',
        autoPlayOff: 'Tự động phát câu trả lời (Tắt)',
        speaking: 'Đang nói...',
    },
    en: {
        loadError: "Sorry, the necessary data could not be loaded. Please try again later.",
        logout: "Logout",
        inputPlaceholder: "Enter your message...",
        genericError: "Sorry, an error occurred.",
        toAdminPage: "Admin",
        login: "Login",
        language: "Language",
        aiListTitle: "AI List",
        guestLimitReached: "You have reached the message limit for guests. Please log in.",
        userLimitReached: "You are out of coins. Please top up to continue.",
        subscriptionNeeded: "This AI requires a subscription. Please purchase a plan to use it.",
        pricing: "Pricing",
        micNotSupported: 'Browser does not support speech recognition.',
        messageCopied: 'Message copied!',
        remainingMessages: 'Remaining messages:',
        remainingCoins: 'Remaining coins:',
        unlimited: 'Unlimited',
        autoPlayOn: 'Auto-play responses (On)',
        autoPlayOff: 'Auto-play responses (Off)',
        speaking: 'Speaking...',
    }
};

const GUEST_CONVERSATION_KEY = 'guestConversation';

const ChatPage: React.FC<{
  user: User | null;
  systemConfig: SystemConfig;
  onLogout: () => void;
  onGoToLogin: () => void;
  language: 'vi' | 'en';
  setLanguage: (lang: 'vi' | 'en') => void;
  onUserUpdate: (updatedData: Partial<User>) => void;
}> = ({ user, systemConfig, onLogout, onGoToLogin, language, setLanguage, onUserUpdate }) => {
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const [aiConfigs, setAiConfigs] = useState<AIConfig[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentAiConfig, setCurrentAiConfig] = useState<AIConfig | null>(null);
  const [conversationId, setConversationId] = useState<number | null>(null);
  
  const [messages, setMessages] = useState<Message[]>(() => {
    if (user) return [];
    try {
        const saved = localStorage.getItem(GUEST_CONVERSATION_KEY);
        if (saved) {
            const parsed = JSON.parse(saved);
            if (Array.isArray(parsed.messages) && parsed.messages.length > 0) return parsed.messages;
        }
    } catch { localStorage.removeItem(GUEST_CONVERSATION_KEY); }
    return [];
  });

  const [isAiDropdownOpen, setIsAiDropdownOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isLoadingConversations, setIsLoadingConversations] = useState(false);
  
  const [contextMenu, setContextMenu] = useState<{ message: Message; position: { x: number, y: number } } | null>(null);
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
  const [isAutoPlaybackEnabled, setIsAutoPlaybackEnabled] = useState(false);

  const t = translations[language];
  const { showToast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const aiDropdownRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (aiDropdownRef.current && !aiDropdownRef.current.contains(event.target as Node)) setIsAiDropdownOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    // Cleanup speech synthesis on component unmount or language change
    return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        if (window.speechSynthesis) window.speechSynthesis.cancel();
    }
  }, []);

  // Effect to handle user login/logout and associated state resets
  useEffect(() => {
    if (user) {
      setMessages([]);
      setConversationId(null);
      setIsLoadingConversations(true);
      apiService.getConversations(user)
        .then(setConversations)
        .finally(() => setIsLoadingConversations(false));
    } else {
      setConversations([]);
      try {
        const saved = localStorage.getItem(GUEST_CONVERSATION_KEY);
        const parsed = saved ? JSON.parse(saved) : null;
        setMessages(parsed?.messages || []);
      } catch {
        localStorage.removeItem(GUEST_CONVERSATION_KEY);
        setMessages([]);
      }
    }
  }, [user?.id]);

  // Effect to fetch AI configs when user or language changes, and select an initial AI
  useEffect(() => {
    const fetchAndSetConfigs = async () => {
      try {
        const configs = await apiService.getAiConfigs(user);
        setAiConfigs(configs);

        const isCurrentAiStillVisible = configs.some(c => c.id === currentAiConfig?.id);
        
        if (configs.length > 0 && (!currentAiConfig || !isCurrentAiStillVisible)) {
          let initialAi = configs[0];
          if (!user) {
            const saved = localStorage.getItem(GUEST_CONVERSATION_KEY);
            const parsed = saved ? JSON.parse(saved) : null;
            if (parsed?.aiConfigId) {
              const savedAi = configs.find(c => c.id === parsed.aiConfigId);
              if (savedAi) initialAi = savedAi;
            }
          }
          setCurrentAiConfig(initialAi);
        } else if (configs.length === 0) {
          setCurrentAiConfig(null);
        }
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu khởi tạo:", error);
        if (messages.length === 0) {
            setMessages([{ id: 'ai-error', text: t.loadError, sender: 'ai', timestamp: Date.now() }]);
        }
      }
    };

    fetchAndSetConfigs();
    if (window.speechSynthesis) window.speechSynthesis.cancel();
  }, [user, language]);

  useEffect(() => {
      if (!user && currentAiConfig && messages.length > 0 && messages.some(m => m.sender === 'user')) {
          localStorage.setItem(GUEST_CONVERSATION_KEY, JSON.stringify({ aiConfigId: currentAiConfig.id, messages: messages }));
      }
  }, [messages, user, currentAiConfig]);
  
  const handleSelectAi = (ai: AIConfig) => {
    if (!user && currentAiConfig?.id !== ai.id) localStorage.removeItem(GUEST_CONVERSATION_KEY);
    setCurrentAiConfig(ai);
    setConversationId(null);
    setMessages([]);
  };

  const handleSelectConversation = (conv: Conversation) => {
      const relatedAi = aiConfigs.find(ai => ai.id === conv.aiConfigId);
      if (relatedAi) {
          setCurrentAiConfig(relatedAi);
          setConversationId(conv.id);
          setMessages(conv.messages);
      }
  };

  const handleNewConversation = () => {
      if (currentAiConfig) {
          if (!user) localStorage.removeItem(GUEST_CONVERSATION_KEY);
          handleSelectAi(currentAiConfig);
      }
  };

  const handleDeleteConversation = async (id: number) => {
      try {
          await apiService.deleteConversation(id);
          const updatedConversations = conversations.filter(c => c.id !== id);
          setConversations(updatedConversations);
          if (conversationId === id) handleNewConversation();
      } catch (error) {
          console.error("Lỗi khi xóa hội thoại:", error);
      }
  };
  
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onloadend = () => setImagePreview(reader.result as string);
        reader.readAsDataURL(file);
    }
    if (imageInputRef.current) imageInputRef.current.value = "";
  };

  const handleSendMessage = async (e?: React.FormEvent, textOverride?: string) => {
    e?.preventDefault();
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    setIsSpeaking(false);
    
    const textToSend = textOverride ?? newMessage.trim();
    if ((!textToSend && !imagePreview) || !currentAiConfig || isChatDisabled) return;
    
    const isNewConversation = !conversationId;
    const userMessage: Message = { id: `msg-${Date.now()}`, text: textToSend, sender: 'user', timestamp: Date.now(), imageUrl: textOverride ? undefined : (imagePreview || undefined) };
    const updatedMessages = [...messages, userMessage];
    
    setMessages(updatedMessages);
    setNewMessage('');
    if (!textOverride) setImagePreview(null);
    setIsTyping(true);

    let streamBuffer = '';
    const aiMessageId = `ai-${Date.now()}`;
    setMessages(prev => [...prev, { id: aiMessageId, text: '', sender: 'ai', timestamp: Date.now() }]);
    
    await apiService.sendMessageStream(currentAiConfig, updatedMessages, user, conversationId, {
        onChunk: (chunk) => {
            streamBuffer += chunk;
            setMessages(prev => prev.map(msg => msg.id === aiMessageId ? { ...msg, text: streamBuffer } : msg));
        },
        onEnd: (newConversationId, newCoinCount, fullResponse) => {
            setConversationId(newConversationId);
            if (user && newCoinCount !== undefined) onUserUpdate({ coins: newCoinCount });
            if (isNewConversation && user) {
                apiService.getConversations(user).then(setConversations);
            }
            setIsTyping(false);
            if (isAutoPlaybackEnabled && fullResponse && window.speechSynthesis) {
                const utterance = new SpeechSynthesisUtterance(fullResponse);
                utterance.lang = language === 'vi' ? 'vi-VN' : 'en-US';
                utterance.onstart = () => setIsSpeaking(true);
                utterance.onend = () => setIsSpeaking(false);
                utterance.onerror = () => setIsSpeaking(false);
                window.speechSynthesis.speak(utterance);
            }
        },
        onError: (error) => {
             setMessages(prev => prev.map(msg => msg.id === aiMessageId ? { ...msg, text: t.genericError + `: ${error}` } : msg));
             setIsTyping(false);
        }
    });
  };
  
  const handleSuggestedQuestionClick = (q: string) => handleSendMessage(undefined, q);
  
  const handleToggleRecording = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        showToast(t.micNotSupported, 'error');
        return;
    }

    if (isRecording) {
        recognitionRef.current?.stop();
        setIsRecording(false);
    } else {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.lang = language === 'vi' ? 'vi-VN' : 'en-US';
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = true;

        recognitionRef.current.onresult = (event: any) => {
            const transcript = Array.from(event.results)
                .map((result: any) => result[0])
                .map((result: any) => result.transcript)
                .join('');
            setNewMessage(transcript);
        };
        
        recognitionRef.current.onend = () => {
            setIsRecording(false);
            // Use a slight delay to ensure the final transcript is set before sending
            setTimeout(() => {
                if (newMessage.trim()) {
                   handleSendMessage();
                }
            }, 100);
        };

        recognitionRef.current.onerror = (event: any) => {
            console.error('Speech recognition error:', event.error);
            setIsRecording(false);
        };

        recognitionRef.current.start();
        setIsRecording(true);
    }
  };

  const handleMessageContextMenu = (e: React.MouseEvent, msg: Message) => { e.preventDefault(); setContextMenu({ message: msg, position: { x: e.clientX, y: e.clientY } }); };
  const handleCloseContextMenu = () => setContextMenu(null);
  const handleCopyMessage = (text: string) => { navigator.clipboard.writeText(text); showToast(t.messageCopied, 'info'); };
  const handleDeleteMessage = async (msgId: string | number) => { if (!conversationId) return; const updated = messages.filter(m => m.id !== msgId); setMessages(updated); try { await apiService.updateConversationMessages(conversationId, updated); } catch (error) { setMessages(messages); } };

  const userMessagesCount = messages.filter(m => m.sender === 'user').length;
  const isGuestLimitReached = !user && userMessagesCount >= systemConfig.guestMessageLimit;
  const hasActiveSubscription = user?.subscriptionExpiresAt ? new Date(user.subscriptionExpiresAt) > new Date() : false;
  const isUserCoinsDepleted = !!user && user.coins !== null && user.coins <= 0 && !hasActiveSubscription;
  const needsSubscription = currentAiConfig?.requiresSubscription && !hasActiveSubscription;
  const isChatDisabled = isGuestLimitReached || isUserCoinsDepleted || needsSubscription;
  const remainingMessages = Math.max(0, systemConfig.guestMessageLimit - userMessagesCount);

  let placeholderText = t.inputPlaceholder;
  if (isGuestLimitReached) placeholderText = t.guestLimitReached;
  if (isUserCoinsDepleted) placeholderText = t.userLimitReached;
  if (needsSubscription) placeholderText = t.subscriptionNeeded;
  if (isRecording) placeholderText = 'Đang nghe...';

  return (
    <div className="flex h-screen w-full bg-white">
      <ConversationSidebar user={user} systemConfig={systemConfig} conversations={conversations} selectedConversationId={conversationId} onSelectConversation={handleSelectConversation} onNewConversation={handleNewConversation} onDeleteConversation={handleDeleteConversation} onLogout={onLogout} onGoToLogin={onGoToLogin} onGoToAdmin={() => window.location.hash = '#/admin'} language={language} setLanguage={setLanguage} isCollapsed={isSidebarCollapsed} onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)} isLoading={isLoadingConversations} />
      <div className="flex-1 flex flex-col bg-background-light">
          <header className="flex items-center justify-between p-4 bg-background-panel h-[73px] flex-shrink-0 border-b border-border-color">
             <div className="relative" ref={aiDropdownRef}>
                {currentAiConfig ? (
                    <button onClick={() => setIsAiDropdownOpen(!isAiDropdownOpen)} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-background-light transition-colors w-72">
                        <img src={currentAiConfig.avatarUrl || 'https://i.pravatar.cc/150?u=default'} alt={currentAiConfig.name} className="w-10 h-10 rounded-full" />
                        <div className="flex-1 text-left"><h1 className="text-base font-bold text-text-main truncate">{currentAiConfig.name}</h1><p className={`text-xs ${isSpeaking ? 'text-primary' : 'text-text-light'}`}>{isSpeaking ? t.speaking : ' '}</p></div>
                         <svg className={`w-5 h-5 text-text-light transition-transform ${isAiDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                    </button>
                ) : <div className="w-72 h-14" />}
                {isAiDropdownOpen && (
                    <div className="absolute top-full mt-1 w-72 bg-background-panel rounded-lg shadow-xl border z-20 py-1">
                        {aiConfigs.map(ai => <button key={ai.id} onClick={() => { handleSelectAi(ai); setIsAiDropdownOpen(false); }} className="w-full text-left flex items-center p-3 hover:bg-background-light transition-colors"><img src={ai.avatarUrl || `https://i.pravatar.cc/150?u=${ai.id}`} alt={ai.name} className="w-8 h-8 rounded-full mr-3" /><span className="flex-1 truncate">{ai.name}</span>{currentAiConfig?.id === ai.id && <svg className="w-5 h-5 text-primary" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>}</button>)}
                    </div>
                )}
            </div>
            <div className="flex items-center space-x-4">
                 <button onClick={() => setIsAutoPlaybackEnabled(!isAutoPlaybackEnabled)} title={isAutoPlaybackEnabled ? t.autoPlayOn : t.autoPlayOff} className="p-2 rounded-full hover:bg-background-light">
                    {isAutoPlaybackEnabled ? <SpeakerOnIcon className="w-6 h-6 text-primary" /> : <SpeakerOffIcon className="w-6 h-6 text-text-light" />}
                </button>
                {user && <button onClick={() => setIsPricingModalOpen(true)} className="px-4 py-2 text-sm font-medium text-text-on-primary bg-primary rounded-md hover:bg-primary-hover">{t.pricing}</button>}
                {!user && <button onClick={onGoToLogin} className="text-sm font-medium text-text-light hover:text-primary transition-colors">{t.login}</button>}
                <div className="flex items-center justify-center space-x-1 bg-background-light p-1 rounded-lg">
                    <button onClick={() => setLanguage('vi')} className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors ${language === 'vi' ? 'bg-background-panel text-primary shadow-sm' : 'text-text-light'}`}>VI</button>
                    <button onClick={() => setLanguage('en')} className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors ${language === 'en' ? 'bg-background-panel text-primary shadow-sm' : 'text-text-light'}`}>EN</button>
                </div>
            </div>
        </header>

        <div className={`flex-1 ${isSidebarCollapsed ? 'px-8' : 'px-4 sm:px-6 md:px-10 lg:px-20'} py-6 overflow-y-auto transition-all duration-300`}>
          {messages.length === 0 && currentAiConfig ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-4">
                <img src={currentAiConfig.avatarUrl || 'https://i.pravatar.cc/150?u=default'} alt={currentAiConfig.name} className="w-24 h-24 rounded-full mb-4 object-cover" />
                <h2 className="text-2xl font-bold text-text-main">{currentAiConfig.name}</h2>
                <p className="mt-2 text-text-light max-w-md">{currentAiConfig.description}</p>
                {currentAiConfig.suggestedQuestions && currentAiConfig.suggestedQuestions.length > 0 && (
                    <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-lg">
                      {currentAiConfig.suggestedQuestions.map((q, i) => <button key={i} onClick={() => handleSuggestedQuestionClick(q)} className="p-3 bg-background-panel shadow-sm rounded-lg text-sm text-text-main hover:bg-background-light hover:shadow-md transition-all duration-200 text-left transform hover:-translate-y-px">{q}</button>)}
                    </div>
                )}
            </div>
          ) : (
            <div className={`${isSidebarCollapsed ? 'max-w-none' : 'max-w-4xl'} mx-auto space-y-6`}>
              {messages.map((msg, index) => (
                <div key={msg.id || index} className={`flex w-full items-start gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`} onContextMenu={(e) => msg.id && handleMessageContextMenu(e, msg)}>
                    {msg.sender === 'ai' && <img src={currentAiConfig?.avatarUrl || 'https://i.pravatar.cc/150?u=ai'} alt="Avatar" className="w-8 h-8 rounded-full flex-shrink-0 mt-1" />}
                    <div className={`flex flex-col max-w-[80%] ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                          <p className="font-bold text-sm mb-1 text-text-main">{msg.sender === 'ai' ? currentAiConfig?.name : (user?.name || 'Bạn')}</p>
                          <div className={`px-4 py-2.5 rounded-lg ${msg.sender === 'user' ? 'bg-primary text-text-on-primary' : 'bg-background-panel text-text-main border border-border-color'}`}>
                            {msg.imageUrl && <img src={msg.imageUrl} alt="Uploaded content" className="max-w-xs rounded-lg mb-2"/>}
                            {isTyping && msg.sender === 'ai' && index === messages.length - 1 && !msg.text 
                                ? (<div className="typing-indicator"><span></span><span></span><span></span></div>) 
                                : (<div className="markdown-content"><ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.text}</ReactMarkdown></div>)
                            }
                          </div>
                    </div>
                    {msg.sender === 'user' && <img src={user?.avatarUrl || 'https://i.pravatar.cc/150?u=user'} alt="Avatar" className="w-8 h-8 rounded-full flex-shrink-0 mt-1" />}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        <div className={` ${isSidebarCollapsed ? 'px-8' : 'px-4 sm:px-6 md:px-10 lg:px-20'} py-4 bg-transparent transition-all duration-300`}>
            <div className={`${isSidebarCollapsed ? 'max-w-none' : 'max-w-4xl'} mx-auto`}>
                 {imagePreview && <div className="relative inline-block mb-2"><img src={imagePreview} alt="Preview" className="max-h-24 rounded-lg border p-1 bg-background-panel"/><button onClick={() => setImagePreview(null)} className="absolute -top-2 -right-2 bg-gray-700 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">&times;</button></div>}
                 {!user && <div className="text-center text-sm text-text-light mb-2">{t.remainingMessages} {remainingMessages} / {systemConfig.guestMessageLimit}</div>}
                 {user && <div className="text-center text-sm text-text-light mb-2">{user.coins === null ? t.unlimited : `${t.remainingCoins} ${user.coins}`}</div>}
                 <form onSubmit={handleSendMessage} className="flex items-center space-x-2 bg-background-panel p-2 rounded-full shadow-md ring-1 ring-inset ring-border-color focus-within:ring-2 focus-within:ring-primary transition-all duration-200">
                    <input type="file" ref={imageInputRef} onChange={handleImageSelect} accept="image/*" className="hidden" />
                    <button type="button" onClick={() => imageInputRef.current?.click()} disabled={isChatDisabled} className="p-2 rounded-full transition-colors text-text-light hover:bg-background-light disabled:opacity-50" title="Attach file"><svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg></button>
                    <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder={placeholderText} disabled={isChatDisabled} className="flex-1 w-full px-2 py-2 bg-transparent focus:outline-none disabled:bg-background-light disabled:cursor-not-allowed" />
                    <button type="button" onClick={handleToggleRecording} disabled={isChatDisabled} className={`p-2 rounded-full transition-colors text-text-light hover:bg-background-light ${isRecording ? 'text-accent-red animate-pulse' : ''} disabled:opacity-50`} title={isRecording ? 'Stop' : 'Record'}><svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.49 6-3.31 6-6.72h-1.7z"/></svg></button>
                    <button type="submit" disabled={isTyping || (!newMessage.trim() && !imagePreview) || isChatDisabled} className="p-3 bg-primary text-text-on-primary rounded-full hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg></button>
                </form>
            </div>
        </div>
        {contextMenu && <MessageContextMenu message={contextMenu.message} position={contextMenu.position} onClose={handleCloseContextMenu} onCopy={handleCopyMessage} onDeleteForMe={handleDeleteMessage} language={language} />}
        <PricingModal isOpen={isPricingModalOpen} onClose={() => setIsPricingModalOpen(false)} user={user} onUserUpdate={onUserUpdate} />
    </div>
    </div>
  );
};

export default ChatPage;