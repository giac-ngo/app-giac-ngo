// client/src/pages/PracticeSpacePage.tsx
import React, { useState, useEffect, useRef, useLayoutEffect, useCallback, lazy, Suspense } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { User, Message, AIConfig, SystemConfig, Conversation, ViewMode, LibraryFilters, Space } from '../types';
import { apiService } from '../services/apiService';
import { ConversationSidebar } from '../components/ConversationSidebar';
import { MessageContextMenu } from '../components/MessageContextMenu';
import { useToast } from '../components/ToastProvider';
import { CopyIcon, SpeakerWaveIcon, ThumbsUpIcon, ThumbsDownIcon, PaperclipIcon, MicIcon, SpinnerIcon, HeartIcon, XIcon } from '../components/Icons';
import { MeritPaymentModal } from '../components/MeritPaymentModal';
import { MarketplaceModal } from '../components/MarketplaceModal';
import { PracticeSpaceHeader } from '../components/PracticeSpaceHeader';

// Lazy load components for code splitting
const MeditationTimer = lazy(() => import('../components/MeditationTimer').then(module => ({ default: module.MeditationTimer })));
const LibraryView = lazy(() => import('../components/LibraryView').then(module => ({ default: module.LibraryView })));
const DharmaTalksView = lazy(() => import('../components/DharmaTalksView').then(module => ({ default: module.DharmaTalksView })));


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
        contactAdminForAccess: "Vui lòng liên hệ quản trị viên để kích hoạt AI này.",
        genericError: "Xin lỗi, đã có lỗi xảy ra.",
        toAdminPage: "Quản trị viên",
        login: "Đăng nhập",
        language: "Ngôn ngữ",
        languageToggle: "English",
        aiListTitle: "Danh sách AI",
        guestLimitReached: "Hết lượt chat miễn phí. Vui lòng đăng nhập để tiếp tục.",
        userLimitReached: "Bạn đã hết merit. Vui lòng nạp thêm để tiếp tục.",
        purchaseNeeded: "AI này cần được mua để sử dụng.",
        pricing: "Bảng giá",
        marketplace: "AI Marketplace",
        micNotSupported: 'Trình duyệt không hỗ trợ nhận dạng giọng nói.',
        micAccessDenied: 'Quyền truy cập micro đã bị từ chối. Vui lòng cho phép trong cài đặt trình duyệt.',
        micNotFound: 'Không tìm thấy micro trên thiết bị của bạn.',
        messageCopied: 'Đã sao chép tin nhắn!',
        remainingMerits: 'Số merits còn lại:',
        unlimited: 'Không giới hạn',
        speaking: 'Đang nói...',
        like: 'Thích',
        dislike: 'Không thích',
        copy: 'Sao chép',
        speak: 'Nghe',
        download: 'Tải xuống',
        share: 'Chia sẻ',
        newChat: 'Trò chuyện mới',
        openSidebar: 'Mở sidebar',
        conversationDeleted: 'Đã xóa hội thoại.',
        deleteConversationError: 'Xóa hội thoại thất bại.',
        comment: 'Phản hồi',
        commentNotImplemented: 'Chức năng phản hồi chưa được cài đặt.',
        liveChatConnecting: 'Đang kết nối...',
        liveChatConnected: 'Đang trò chuyện trực tiếp...',
        liveChatError: 'Lỗi trò chuyện trực tiếp: {message}',
        liveChatEnded: 'Kết thúc trò chuyện trực tiếp.',
        liveChatSubscriptionNeeded: 'Bạn cần đăng nhập để dùng tính năng này.',
        liveChatApiKeyMissing: 'Khóa API Gemini cá nhân của bạn chưa được thiết lập trong Cài đặt.',
        liveChatTooltip: 'Yêu cầu đăng nhập',
        translationError: 'Không thể dịch nội dung AI.',        
        sutra: "Giới thiệu",
        library: "Thư viện",
        uploadingFile: 'Đang tải file lên...',
        uploadSuccess: 'Tải file lên thành công!',
        uploadError: 'Tải file thất bại.',
        loadingOlderMessages: 'Đang tải tin nhắn cũ...',
        feedbackError: 'Lưu phản hồi thất bại.',
        aiThought: 'AI đang suy nghĩ...',
        comingSoon: 'Sắp có',
        listening: 'Đang nghe...',
        community: 'Tin tức',
        donation: 'Cúng dường',
        switchToSpace: 'Chuyển sang không gian: {spaceName}',
        loadingAi: 'Đang tải AI...',
        loginToChat: 'Vui lòng đăng nhập để xem và bắt đầu cuộc trò chuyện.',
        offeringNudgeTitle: 'Cúng Dường Tam Bảo',
        offeringNudgeSubtitle: 'Lan tỏa chánh pháp',
        offeringNudgeButton: 'Ủng hộ',
    },
    en: {
        loadError: "Sorry, the necessary data could not be loaded. Please try again later.",
        logout: "Logout",
        inputPlaceholder: "Enter your message...",
        contactAdminForAccess: "Please contact an administrator to activate this AI.",
        genericError: "Sorry, an error occurred.",
        toAdminPage: "Admin",
        login: "Login",
        language: "Language",
        languageToggle: "Tiếng Việt",
        aiListTitle: "AI List",
        guestLimitReached: "Free chat limit reached. Please login to continue.",
        userLimitReached: "You are out of merits. Please top up to continue.",
        purchaseNeeded: "This AI must be purchased to use.",
        pricing: "Pricing",
        marketplace: "AI Marketplace",
        micNotSupported: 'Browser does not support speech recognition.',
        micAccessDenied: 'Microphone access was denied. Please allow access in your browser settings.',
        micNotFound: 'No microphone was found on your device.',
        messageCopied: 'Message copied!',
        remainingMerits: 'Remaining merits:',
        unlimited: 'Unlimited',
        speaking: 'Speaking...',
        like: 'Like',
        dislike: 'Dislike',
        copy: 'Copy',
        speak: 'Speak',
        download: 'Download',
        share: 'Share',
        newChat: 'New Chat',
        openSidebar: 'Open sidebar',
        conversationDeleted: 'Conversation deleted.',
        deleteConversationError: 'Failed to delete conversation.',
        comment: 'Feedback',
        commentNotImplemented: 'Feedback feature is not implemented yet.',
        liveChatConnecting: 'Connecting live chat...',
        liveChatConnected: 'Live chat active...',
        liveChatError: 'Live chat error: {message}',
        liveChatEnded: 'Live chat ended.',
        liveChatSubscriptionNeeded: 'You need to be logged in to use this feature.',
        liveChatApiKeyMissing: 'Your personal Gemini API key is not set in Settings.',
        liveChatTooltip: 'Requires login',
        translationError: 'Could not translate AI content.',        
        sutra: "Sutra",
        library: "Library",
        uploadingFile: 'Uploading file...',
        uploadSuccess: 'File uploaded successfully!',
        uploadError: 'File upload failed.',
        loadingOlderMessages: 'Loading older messages...',
        feedbackError: 'Failed to save feedback.',
        aiThought: 'AI is thinking...',
        comingSoon: 'Coming Soon',
        listening: 'Listening...',
        community: 'Community ',
        donation: 'Donation',
        switchToSpace: 'Switching to space: {spaceName}',
        loadingAi: 'Loading AI...',
        loginToChat: 'Please log in to see and start conversations.',
        offeringNudgeTitle: 'Offering to the Triple Gem',
        offeringNudgeSubtitle: 'Spread the Dharma',
        offeringNudgeButton: 'Support',
    }
};

const GUEST_CONVERSATION_KEY = 'guestConversation';
const GUEST_MESSAGE_COUNT_KEY = 'guestMessageCount';
const INITIAL_MESSAGES_COUNT = 14;
const MESSAGE_BATCH_SIZE = 10;

export const PracticeSpacePage: React.FC<{
  user: User | null;
  systemConfig: SystemConfig;
  onLogout: () => void;
  onGoToLogin: () => void;
  language: 'vi' | 'en';
  setLanguage: (lang: 'vi' | 'en') => void;
  onUserUpdate: (updatedData: Partial<User>) => void;
}> = ({ user, systemConfig, onLogout, onGoToLogin, language, setLanguage, onUserUpdate }) => {
  const { spaceSlug, view } = useParams<{ spaceSlug: string; view?: ViewMode }>();
  const [currentSpace, setCurrentSpace] = useState<Space | null>(null);
  const [allMessages, setAllMessages] = useState<Message[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  
  // UI States
  const [isTyping, setIsTyping] = useState(false);
  const [isAiThinking, setIsAiThinking] = useState(false);
  
  const [isRecording, setIsRecording] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | number | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [fileAttachment, setFileAttachment] = useState<{ name: string; url: string } | null>(null);
  const [guestMessageCount, setGuestMessageCount] = useState<number>(() => {
        const stored = localStorage.getItem(GUEST_MESSAGE_COUNT_KEY);
        return stored ? parseInt(stored, 10) : 0;
  });
  
  const [allAiConfigs, setAllAiConfigs] = useState<AIConfig[]>([]);
  const [allSpaces, setAllSpaces] = useState<Space[]>([]);
  
  const [conversationUpdateTrigger, setConversationUpdateTrigger] = useState(0);
  const [currentAiConfig, setCurrentAiConfig] = useState<AIConfig | null>(null);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [feedbackStatus, setFeedbackStatus] = useState<{ [messageId: string]: 'liked' | 'disliked' | null }>({});
  
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  
  const [contextMenu, setContextMenu] = useState<{ message: Message; position: { x: number, y: number } } | null>(null);
  const [isMeritPurchaseModalOpen, setIsMeritPurchaseModalOpen] = useState(false);
  const [showOfferingNudge, setShowOfferingNudge] = useState(false);
  const [isMarketplaceModalOpen, setIsMarketplaceModalOpen] = useState(false);
  const [promptPurchaseAiId, setPromptPurchaseAiId] = useState<string | null>(null);
  const [isAiSelectorOpen, setIsAiSelectorOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const [libraryFilters, setLibraryFilters] = useState<LibraryFilters>(() => {
    try {
        const savedFilters = sessionStorage.getItem('libraryFilters');
        if (savedFilters) {
            return JSON.parse(savedFilters);
        }
    } catch (e) {
        console.error("Failed to parse library filters from sessionStorage", e);
    }
    return {};
  });

  const navigate = useNavigate();
  const t = translations[language];
  const { showToast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const aiSelectorRef = useRef<HTMLDivElement>(null);
  const textBeforeRecording = useRef('');
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const prevScrollHeightRef = useRef<number>(0);
  const initialQuerySent = useRef(false);
  
  const streamBufferRef = useRef<string>('');

  const liveSessionPromiseRef = useRef<Promise<any> | null>(null);
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);

  const viewMode = view || 'chat';

  useEffect(() => {
    if (viewMode === 'library' || viewMode === 'dharmatalks') {
        setShowOfferingNudge(true);
        // Force-close the modal if the user navigates away from chat while it's open
        setIsMeritPurchaseModalOpen(false); 
    } else {
        setShowOfferingNudge(false);
    }
  }, [viewMode]);

  const isGuestLimitReached = !user && guestMessageCount >= (systemConfig.guestMessageLimit || 5);
  const isUserMeritsDepleted = user ? (user.merits !== null && user.merits <= 0 && !!currentAiConfig?.meritCost && currentAiConfig.meritCost > 0) : false;
  const isOwned = user && currentAiConfig && user.ownedAis?.some(ai => ai.aiConfigId === currentAiConfig.id);
  const isGranted = user && currentAiConfig && user.grantedAiConfigIds?.includes(currentAiConfig.id as number);
  
  const needsPurchase = user ? (!!currentAiConfig?.purchaseCost && currentAiConfig.purchaseCost > 0 && !isOwned) : false;
  const needsContactAccess = !!(currentAiConfig?.isContactForAccess && (!user || !isGranted));

  const isChatDisabled = !currentAiConfig || isTyping || isGuestLimitReached || isUserMeritsDepleted || needsPurchase || (needsContactAccess && !user);

  useEffect(() => {
      if (isGuestLimitReached) {
          showToast(t.guestLimitReached, 'error');
      }
  }, [isGuestLimitReached, showToast, t.guestLimitReached]);
  
  const setViewMode = (mode: ViewMode) => {
    if (spaceSlug) {
      navigate(`/${spaceSlug}/${mode}`);
    }
  };
  
  const onGoToAdmin = () => navigate(`/${spaceSlug}/admin`);

    const handleSelectConversation = useCallback((conv: Conversation) => {
        if (isTyping) return;
        setConversationId(conv.id);
        const fullHistory = conv.messages || [];
        setAllMessages(fullHistory);
        setMessages(fullHistory.slice(-INITIAL_MESSAGES_COUNT));
        const newAiConfig = allAiConfigs.find(c => c.id === conv.aiConfigId);
        if (newAiConfig) {
            setCurrentAiConfig(newAiConfig);
            localStorage.setItem('lastSelectedAiId', String(newAiConfig.id));
        }
        initialQuerySent.current = true;
        setTimeout(() => {
            if (chatContainerRef.current) {
                chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
            }
        }, 0);
    }, [allAiConfigs, isTyping]);

    const handleNewConversation = useCallback((aiConfig: AIConfig) => {
        if (isTyping) return;
        setConversationId(null);
        setAllMessages([]);
        setMessages([]);
        setCurrentAiConfig(aiConfig);
        localStorage.setItem('lastSelectedAiId', String(aiConfig.id));
        initialQuerySent.current = false;
        if (!user) {
            localStorage.removeItem(GUEST_CONVERSATION_KEY);
        }
    }, [isTyping, user]);

    const handleDeleteConversation = useCallback(async (id: number) => {
        if (!user) return;
        try {
            await apiService.deleteConversation(id);
            if(currentAiConfig) handleNewConversation(currentAiConfig);
            showToast(t.conversationDeleted, 'success');
            setConversationUpdateTrigger(c => c + 1); // Trigger sidebar refresh
        } catch (error) {
            showToast(t.deleteConversationError, 'error');
        }
    }, [user, showToast, t.conversationDeleted, t.deleteConversationError, handleNewConversation, currentAiConfig]);

    const handleSelectAi = (ai: AIConfig) => {
        if (ai.id === currentAiConfig?.id) {
            setIsAiSelectorOpen(false);
            return;
        }

        if (ai.spaceId !== currentAiConfig?.spaceId) {
            const newSpace = allSpaces.find(s => s.id === ai.spaceId);
            if (newSpace) {
                showToast(t.switchToSpace.replace('{spaceName}', newSpace.name), 'info');
                localStorage.setItem('lastSelectedAiId', String(ai.id));
                navigate(`/${newSpace.slug}/chat`);
            } else {
                handleNewConversation(ai);
            }
        } else {
            handleNewConversation(ai);
        }
        setIsAiSelectorOpen(false);
    };

    useEffect(() => {
        const promptedId = localStorage.getItem('promptPurchaseAiId');
        if (promptedId) {
            setPromptPurchaseAiId(promptedId);
            setIsMarketplaceModalOpen(true);
            localStorage.removeItem('promptPurchaseAiId');
        }
    }, []);


  useEffect(() => {
    if (!isLoadingMore) {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping, isLoadingMore]);

  useLayoutEffect(() => {
    if (isLoadingMore) {
        const container = chatContainerRef.current;
        if (container) {
            container.scrollTop = container.scrollHeight - prevScrollHeightRef.current;
        }
        setIsLoadingMore(false);
    }
  }, [messages, isLoadingMore]);
  
  useEffect(() => {
    return () => {
        if (window.speechSynthesis) window.speechSynthesis.cancel();
    }
  }, []);

  useEffect(() => {
    return () => {
        if (liveSessionPromiseRef.current) {
            liveSessionPromiseRef.current.then(session => session.close());
            liveSessionPromiseRef.current = null;
        }
        inputAudioContextRef.current?.close();
        outputAudioContextRef.current?.close();
    };
}, []);

    useEffect(() => {
        const checkScreenSize = () => {
            setIsSidebarCollapsed(window.innerWidth < 1024);
        };
        checkScreenSize();
        window.addEventListener('resize', checkScreenSize);
        return () => window.removeEventListener('resize', checkScreenSize);
    }, []);


  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (aiSelectorRef.current && !aiSelectorRef.current.contains(event.target as Node)) {
            setIsAiSelectorOpen(false);
        }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
        document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (!user) {
      try {
        const saved = localStorage.getItem(GUEST_CONVERSATION_KEY);
        const parsed = saved ? JSON.parse(saved) : null;
        const fullHistory = parsed?.messages || [];
        setAllMessages(fullHistory);
        setMessages(fullHistory.slice(-INITIAL_MESSAGES_COUNT));
      } catch {
        localStorage.removeItem(GUEST_CONVERSATION_KEY);
        setAllMessages([]);
        setMessages([]);
      }
    }
  }, [user?.id]);

    useEffect(() => {
        if (!spaceSlug) {
            navigate('/');
            return;
        }

        const fetchAllData = async () => {
            try {
                const [spaceData, allSpacesData] = await Promise.all([
                    apiService.getSpaceBySlug(spaceSlug),
                    apiService.getSpaces()
                ]);

                setCurrentSpace(spaceData);
                setAllSpaces(allSpacesData || []);
                
                if (!spaceData || typeof spaceData.id !== 'number') {
                    showToast('Space not found.', 'error');
                    navigate('/');
                    return;
                }

                const spaceSpecificAIs = await apiService.getAiConfigsBySpaceId(spaceData.id);
                setAllAiConfigs(spaceSpecificAIs || []);

                let initialAi: AIConfig | undefined;
                const lastSelectedId = localStorage.getItem('lastSelectedAiId');

                if (lastSelectedId) {
                    initialAi = spaceSpecificAIs.find(c => String(c.id) === lastSelectedId);
                }
                if (!initialAi) initialAi = spaceSpecificAIs.find(ai => ai.name === 'Giác Ngộ');
                if (!initialAi) initialAi = spaceSpecificAIs.find(ai => ai.id == 7);
                if (!initialAi) initialAi = spaceSpecificAIs[0];
                
                if (initialAi) {
                    setCurrentAiConfig(initialAi);
                } else {
                    setCurrentAiConfig(null);
                }

            } catch (error) {
                console.error("Error loading practice space data:", error);
                showToast(t.loadError, 'error');
                navigate('/');
            }
        };
        
        fetchAllData();
        if (window.speechSynthesis) window.speechSynthesis.cancel();
    }, [spaceSlug, navigate, showToast, t.loadError]);

    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) return;

        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = language === 'vi' ? 'vi-VN' : 'en-US';

        let finalTranscript = '';

        recognition.onstart = () => {
            finalTranscript = textBeforeRecording.current;
        };
        
        recognition.onresult = (event: any) => {
            let interimTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    finalTranscript += event.results[i][0].transcript;
                } else {
                    interimTranscript += event.results[i][0].transcript;
                }
            }
            setNewMessage(finalTranscript + interimTranscript);
        };
        
        recognition.onend = () => {
            setIsRecording(false);
            textBeforeRecording.current = finalTranscript;
        };
        
        recognition.onerror = (event: any) => {
            console.error('Speech recognition error:', event.error);
            setIsRecording(false);
        };

        recognitionRef.current = recognition;
        
        return () => {
            recognition.stop();
        };
    }, [language]);

  useEffect(() => {
      if (!user && currentAiConfig && allMessages.length > 0 && allMessages.some(m => m.sender === 'user')) {
          localStorage.setItem(GUEST_CONVERSATION_KEY, JSON.stringify({ aiConfigId: currentAiConfig.id, messages: allMessages }));
      }
  }, [allMessages, user, currentAiConfig]);
  
  useEffect(() => {
    const initialFeedback: { [messageId: string]: 'liked' | 'disliked' | null } = {};
    for (const msg of allMessages) {
      if (msg.id && msg.feedback) {
        initialFeedback[String(msg.id)] = msg.feedback;
      }
    }
    setFeedbackStatus(initialFeedback);
  }, [allMessages]);

  const handleSendMessage = useCallback(async (e?: React.FormEvent, overrideOptions?: { text?: string; messagesHistory?: Message[] }) => {
    e?.preventDefault();
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    setSpeakingMessageId(null);
    
    const textToSend = overrideOptions?.text ?? newMessage.trim();
    const historyToSend = overrideOptions?.messagesHistory ?? allMessages;

    if ((!textToSend && !imagePreview && !fileAttachment) || !currentAiConfig) return;

    const isInitialQuery = overrideOptions?.messagesHistory?.length === 0;
    
    if (isChatDisabled && !isInitialQuery) {
        if(isGuestLimitReached) showToast(t.guestLimitReached, 'error');
        if(isUserMeritsDepleted) showToast(t.userLimitReached, 'error');
        if(needsPurchase) showToast(t.purchaseNeeded, 'error');
        if(needsContactAccess) showToast(t.contactAdminForAccess, 'error');
        return;
    }
    
    const userMessage: Message = { id: `msg-${Date.now()}`, text: textToSend, sender: 'user', timestamp: Date.now(), imageUrl: imagePreview || undefined, fileAttachment: fileAttachment || undefined };
    
    // Nudge for merit purchase every 10 user messages, only in chat view
    if (viewMode === 'chat') {
        const userMsgCount = allMessages.filter(m => m.sender === 'user').length + 1;
        if (user && userMsgCount > 0 && userMsgCount % 10 === 0) {
            setIsMeritPurchaseModalOpen(true);
        }
    }

    setAllMessages(prev => [...prev, userMessage]);
    setMessages(prev => [...prev, userMessage]);

    setNewMessage('');
    setImagePreview(null);
    setFileAttachment(null);
    textareaRef.current?.focus();
    
    setIsTyping(true);
    setIsAiThinking(true); 
    streamBufferRef.current = '';

    const aiMessageId = `ai-${Date.now()}`;
    
    try {
      await apiService.sendMessageStream(currentAiConfig, [...historyToSend, userMessage], user, conversationId, {
          onChunk: (chunk) => {
              streamBufferRef.current += chunk;
              const fullBuffer = streamBufferRef.current;
              const visibleText = fullBuffer;
              const hasVisibleContent = visibleText.trim().length > 0;

              if (hasVisibleContent) {
                  setIsAiThinking(false);
                  setIsTyping(false);
                  const updateStreamingMessage = (msgs: Message[]) => {
                      const alreadyExists = msgs.some(m => m.id === aiMessageId);
                      if (alreadyExists) {
                          return msgs.map(m => m.id === aiMessageId ? { ...m, text: visibleText.trimStart() } : m);
                      }
                      const newMessage: Message = { id: aiMessageId, text: visibleText.trimStart(), sender: 'ai', timestamp: Date.now() };
                      return [...msgs, newMessage];
                  };
                  setAllMessages(prev => updateStreamingMessage(prev));
                  setMessages(prev => updateStreamingMessage(prev));
              }
          },
          onEnd: (newConversationId, updatedUser, finalMessage) => {
              setIsTyping(false);
              setIsAiThinking(false);
              if (newConversationId && !conversationId) {
                  setConversationId(newConversationId);
                  setConversationUpdateTrigger(c => c + 1); // Trigger sidebar refresh for new conversation
              }
              if (!user) {
                  const newCount = guestMessageCount + 1;
                  setGuestMessageCount(newCount);
                  localStorage.setItem(GUEST_MESSAGE_COUNT_KEY, String(newCount));
              }

              if (updatedUser) {
                  onUserUpdate(updatedUser);
              }
              
              if (finalMessage) {
                  const updateOrAddMessage = (msgs: Message[]) => {
                      const exists = msgs.some(m => m.id === aiMessageId);
                      if (exists) {
                          return msgs.map(msg => msg.id === aiMessageId ? { ...msg, text: finalMessage.text, thought: finalMessage.thought || undefined } : msg );
                      } else {
                          const newMessage: Message = { id: aiMessageId, text: finalMessage.text, sender: 'ai', timestamp: Date.now(), thought: finalMessage.thought || undefined };
                          return [...msgs, newMessage];
                      }
                  };
                  setAllMessages(prev => updateOrAddMessage(prev));
                  setMessages(prev => updateOrAddMessage(prev));
              }
          },
          onError: (error) => {
               setIsTyping(false);
               setIsAiThinking(false);
               let displayError = t.genericError + `: ${error}`;
               const errorMsg: Message = { id: `ai-err-${Date.now()}`, text: displayError, sender: 'ai', timestamp: Date.now() };
               setAllMessages(prev => [...prev, errorMsg]);
               setMessages(prev => [...prev, errorMsg]);
          }
      }, false, language, aiMessageId, guestMessageCount);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        setIsTyping(false);
        setIsAiThinking(false);
        const errorMsg: Message = { id: `ai-err-${Date.now()}`, text: t.genericError + `: ${errorMessage}`, sender: 'ai', timestamp: Date.now() };
        setAllMessages(prev => [...prev, errorMsg]);
        setMessages(prev => [...prev, errorMsg]);
    }
  }, [allMessages, conversationId, currentAiConfig, fileAttachment, imagePreview, isChatDisabled, isGuestLimitReached, isUserMeritsDepleted, language, needsPurchase, newMessage, onUserUpdate, showToast, t, user, needsContactAccess, guestMessageCount, viewMode]);

  useEffect(() => {
    const initialQuery = localStorage.getItem('initialQuery');
    if (initialQuery && currentAiConfig && !initialQuerySent.current) {
        initialQuerySent.current = true;
        localStorage.removeItem('initialQuery');
        handleSendMessage(undefined, { text: initialQuery, messagesHistory: [] });
    }
  }, [currentAiConfig, handleSendMessage]);
  
  const handleTextareaKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage(e as any);
    }
  };
    
    const handleToggleRecording = () => {
        const recognition = recognitionRef.current;
        if (!recognition) {
            showToast(t.micNotSupported, 'error');
            return;
        }
        if (isRecording) {
            recognition.stop();
        } else {
            textBeforeRecording.current = newMessage;
            recognition.start();
        }
        setIsRecording(!isRecording);
    };
    
    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setImagePreview(null);
        setFileAttachment(null);
        
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onloadend = () => setImagePreview(reader.result as string);
            reader.readAsDataURL(file);
        } else {
             const formData = new FormData();
            formData.append('trainingFiles', file); 
            showToast(t.uploadingFile, 'info');
            try {
                const response = await apiService.uploadFiles(formData);
                if (response.filePaths && response.filePaths.length > 0) {
                    setFileAttachment({ name: file.name, url: response.filePaths[0] });
                    showToast(t.uploadSuccess, 'success');
                }
            } catch (err) {
                showToast(t.uploadError, 'error');
            }
        }
        if (fileInputRef.current) fileInputRef.current.value = "";
    };
    
    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        showToast(t.messageCopied, 'info');
    };
    
    const handleSpeak = (text: string, msgId: string | number) => {
        if (speakingMessageId === msgId) {
            window.speechSynthesis.cancel();
            setSpeakingMessageId(null);
            return;
        }
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = language === 'vi' ? 'vi-VN' : 'en-US';
        utterance.onend = () => setSpeakingMessageId(null);
        setSpeakingMessageId(msgId);
        window.speechSynthesis.speak(utterance);
    };

    const handleFeedback = async (msgId: string | number, newFeedback: 'liked' | 'disliked') => {
       if (!conversationId) return;
        const currentFeedback = feedbackStatus[String(msgId)];
        const finalFeedback = currentFeedback === newFeedback ? null : newFeedback;

        setFeedbackStatus(prev => ({ ...prev, [String(msgId)]: finalFeedback }));

        try {
            await apiService.setMessageFeedback(conversationId, msgId, finalFeedback);
            const updateFeedbackInMessages = (msgs: Message[]) => msgs.map(m => m.id === msgId ? { ...m, feedback: finalFeedback } : m);
            setAllMessages(prev => updateFeedbackInMessages(prev));
            setMessages(prev => updateFeedbackInMessages(prev));
        } catch (error) {
            setFeedbackStatus(prev => ({ ...prev, [String(msgId)]: currentFeedback }));
            showToast(t.feedbackError, 'error');
        }
    };

    const handleScroll = () => {
        const container = chatContainerRef.current;
        if (container && container.scrollTop === 0 && !isLoadingMore) {
            if (messages.length < allMessages.length) {
                setIsLoadingMore(true);
                prevScrollHeightRef.current = container.scrollHeight;
    
                setTimeout(() => {
                    const newCount = messages.length + MESSAGE_BATCH_SIZE;
                    setMessages(allMessages.slice(-newCount));
                }, 300);
            }
        }
    };
    
    let placeholder = t.inputPlaceholder;
    if (!currentAiConfig) placeholder = t.loadingAi;
    else if (isGuestLimitReached) placeholder = t.guestLimitReached;
    else if (isUserMeritsDepleted) placeholder = t.userLimitReached;
    else if (needsPurchase) placeholder = t.purchaseNeeded;
    else if (needsContactAccess) placeholder = t.contactAdminForAccess;
    else if (isRecording) placeholder = t.listening;

  return (
    <div className="practice-space-page">
      <ConversationSidebar
        user={user}
        aiConfigs={allAiConfigs}
        currentAiConfig={currentAiConfig}
        selectedConversationId={conversationId}
        conversationUpdateTrigger={conversationUpdateTrigger}
        onSelectConversation={handleSelectConversation}
        onNewConversation={handleNewConversation}
        onDeleteConversation={handleDeleteConversation}
        onGoToLogin={onGoToLogin}
        onGoToAdmin={onGoToAdmin}
        onLogout={onLogout}
        language={language}
        setLanguage={setLanguage}
        systemConfig={systemConfig}
        isSidebarCollapsed={isSidebarCollapsed}
        setIsSidebarCollapsed={setIsSidebarCollapsed}
        onOpenMeritPurchase={() => setIsMeritPurchaseModalOpen(true)}
        viewMode={viewMode}
        libraryFilters={libraryFilters}
        onSetLibraryFilters={setLibraryFilters}
        spaceSlug={spaceSlug}
        currentSpace={currentSpace}
      />
      <main className={`main-content ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <PracticeSpaceHeader
            language={language}
            t={t}
            currentAiConfig={currentAiConfig}
            aiConfigs={allAiConfigs}
            isAiSelectorOpen={isAiSelectorOpen}
            setIsAiSelectorOpen={setIsAiSelectorOpen}
            aiSelectorRef={aiSelectorRef}
            handleSelectAi={handleSelectAi}
            setIsMarketplaceModalOpen={setIsMarketplaceModalOpen}
            setViewMode={setViewMode}
            viewMode={viewMode}
            isMobileMenuOpen={isMobileMenuOpen}
            setIsMobileMenuOpen={setIsMobileMenuOpen}
        />

        <div className="main-view-wrapper">
          <Suspense fallback={<div className="flex-grow flex items-center justify-center"><SpinnerIcon className="w-8 h-8 animate-spin text-primary" /></div>}>
            {viewMode === 'chat' ? (
                <div className="chat-view-container">
                    <div ref={chatContainerRef} onScroll={handleScroll} className="chat-messages-container">
                        {allMessages.length === 0 && !isTyping && !isAiThinking && currentAiConfig ? (
                            <div className="welcome-screen-ai">
                                {currentAiConfig.avatarUrl && <img src={currentAiConfig.avatarUrl} alt={currentAiConfig.name} className="welcome-ai-avatar" />}
                                <h1 className="welcome-ai-name">
                                    {language === 'en' && currentAiConfig.nameEn ? currentAiConfig.nameEn : currentAiConfig.name}
                                </h1>
                                <p className="welcome-ai-description">
                                    {language === 'en' && currentAiConfig.descriptionEn ? currentAiConfig.descriptionEn : currentAiConfig.description}
                                </p>
                                {(() => {
                                    const suggestions = (language === 'en' && currentAiConfig.suggestedQuestionsEn?.length) 
                                        ? currentAiConfig.suggestedQuestionsEn 
                                        : currentAiConfig.suggestedQuestions;

                                    if (!suggestions || suggestions.length === 0) {
                                        return null;
                                    }

                                    return (
                                        <div className="welcome-ai-suggestions">
                                            {suggestions.slice(0, 4).map((q, i) => (
                                                <button
                                                    key={i}
                                                    onClick={() => handleSendMessage(undefined, { text: q, messagesHistory: [] })}
                                                    className="welcome-ai-prompt-card"
                                                >
                                                    <span>{q}</span>
                                                    <div className="prompt-arrow">&rarr;</div>
                                                </button>
                                            ))}
                                        </div>
                                    );
                                })()}
                            </div>
                        ) : (
                           <div className="chat-messages-list">
                                {isLoadingMore && <div className="text-center text-xs text-gray-500 p-2">{t.loadingOlderMessages}</div>}
                                {messages.map((msg, index) => (
                                    <div key={msg.id || index} className={`chat-message-row ${msg.sender === 'user' ? 'user' : 'ai'}`}>
                                        <div className="chat-message-content group">
                                            <div className={`chat-message-bubble ${msg.sender}`}>
                                                <div className="markdown-content"><ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.text}</ReactMarkdown></div>
                                                {msg.imageUrl && <img src={msg.imageUrl} alt="Uploaded content" className="mt-2 rounded-lg max-w-full h-auto" />}
                                            </div>
                                            {msg.sender === 'ai' && !isTyping && !isAiThinking && msg.id && (
                                                <div className="chat-message-toolbar">
                                                    <button onClick={() => handleFeedback(msg.id!, 'liked')} title={t.like} className={`p-1.5 rounded-full hover:bg-background-light ${feedbackStatus[String(msg.id!)] === 'liked' ? 'text-primary' : 'text-text-light'}`}><ThumbsUpIcon className="w-4 h-4"/></button>
                                                    <button onClick={() => handleFeedback(msg.id!, 'disliked')} title={t.dislike} className={`p-1.5 rounded-full hover:bg-background-light ${feedbackStatus[String(msg.id!)] === 'disliked' ? 'text-accent-red' : 'text-text-light'}`}><ThumbsDownIcon className="w-4 h-4"/></button>
                                                    <button onClick={() => handleCopy(msg.text)} title={t.copy} className="p-1.5 rounded-full hover:bg-background-light text-text-light"><CopyIcon className="w-4 h-4"/></button>
                                                    <button onClick={() => handleSpeak(msg.text, msg.id!)} title={t.speak} className={`p-1.5 rounded-full hover:bg-background-light ${speakingMessageId === msg.id ? 'text-primary' : 'text-text-light'}`}><SpeakerWaveIcon className="w-4 h-4"/></button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                {(isAiThinking || isTyping) && (
                                    <div className="chat-message-row ai">
                                        <div className="chat-message-content">
                                            <div className="chat-message-bubble ai">
                                                <div className="typing-indicator">
                                                    <span></span>
                                                    <span></span>
                                                    <span></span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>
                        )}
                    </div>
                    <div className="chat-input-area">
                        <form onSubmit={handleSendMessage} className="relative">
                             {imagePreview && ( <div className="absolute bottom-full mb-2 left-2 p-1 bg-white rounded-lg shadow-md"><img src={imagePreview} alt="Preview" className="w-16 h-16 object-cover rounded" /><button type="button" onClick={() => setImagePreview(null)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6">&times;</button></div>)}
                             {fileAttachment && ( <div className="absolute bottom-full mb-2 left-2 p-2 bg-white rounded-lg shadow-md flex items-center gap-2"><PaperclipIcon className="w-5 h-5 text-gray-500"/><span className="text-sm text-gray-700">{fileAttachment.name}</span><button type="button" onClick={() => setFileAttachment(null)} className="text-red-500 hover:text-red-700">&times;</button></div>)}
                            <div className="chat-input-wrapper">
                                <button type="button" onClick={() => setIsMeritPurchaseModalOpen(true)} disabled={!user} className="chat-input-icon-btn" title={t.donation}>
                                    <HeartIcon className="w-5 h-5" />
                                </button>
                                <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" accept="image/*,.doc,.docx,.pdf,.txt" />
                                <button type="button" onClick={() => fileInputRef.current?.click()} disabled={isChatDisabled} className="chat-input-icon-btn">
                                    <PaperclipIcon className="w-5 h-5" />
                                </button>
                                <textarea ref={textareaRef} value={newMessage} onChange={(e) => setNewMessage(e.target.value)} onKeyDown={handleTextareaKeyDown} placeholder={placeholder} disabled={isChatDisabled} rows={1} className="chat-input-field" />
                                <button type="button" onClick={handleToggleRecording} disabled={isChatDisabled} className={`chat-input-icon-btn ${isRecording ? 'text-accent-red' : ''}`}>
                                    <MicIcon className="w-5 h-5" />
                                </button>
                                <button type="submit" disabled={isChatDisabled || (!newMessage.trim() && !imagePreview && !fileAttachment)} className="chat-send-btn">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            ) : viewMode === 'meditationtimer' ? <MeditationTimer language={language} />
              : viewMode === 'library' ? <LibraryView filters={libraryFilters} onFiltersChange={setLibraryFilters} language={language} spaceId={typeof currentSpace?.id === 'number' ? currentSpace.id : null} spaceSlug={spaceSlug} />
              : viewMode === 'dharmatalks' ? <DharmaTalksView language={language} spaceId={typeof currentSpace?.id === 'number' ? currentSpace.id : null} />
              : <div className="flex items-center justify-center h-full text-text-light">{t.comingSoon}</div>
            }
          </Suspense>
        </div>
      </main>
      
        {showOfferingNudge && (
            <div className="fixed bottom-6 right-6 z-50 bg-[#fefcf5] rounded-xl shadow-2xl p-4 w-72 border border-primary/20 animate-fade-in-right">
                <button onClick={() => setShowOfferingNudge(false)} className="absolute top-2.5 right-2.5 text-text-light hover:text-text-main">
                    <XIcon className="w-5 h-5" />
                </button>
                <div className="flex items-start gap-4">
                    <div className="p-2 bg-red-100/50 rounded-full mt-1 flex-shrink-0 border border-primary/10">
                        <HeartIcon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                        <h4 className="font-bold text-text-main pr-4 text-base font-serif">{t.offeringNudgeTitle}</h4>
                        <p className="text-sm text-text-light mt-1 font-sans">{t.offeringNudgeSubtitle}</p>
                    </div>
                </div>
                <button 
                    onClick={() => {
                        setShowOfferingNudge(false);
                        setIsMeritPurchaseModalOpen(true);
                    }}
                    className="w-full mt-4 bg-primary text-text-on-primary py-2 rounded-lg font-semibold hover:bg-primary-hover flex items-center justify-center gap-2 text-base"
                >                    
                    <span>{t.offeringNudgeButton}</span>
                </button>
            </div>
        )}

        {isMeritPurchaseModalOpen && (
            <MeritPaymentModal
                isOpen={isMeritPurchaseModalOpen}
                onClose={() => setIsMeritPurchaseModalOpen(false)}
                user={user}
                onPaymentSuccess={onUserUpdate}
                language={language}
                showIncenseOption={true}
            />
        )}
        {isMarketplaceModalOpen && (
             <MarketplaceModal
                isOpen={isMarketplaceModalOpen}
                onClose={() => setIsMarketplaceModalOpen(false)}
                user={user}
                onUserUpdate={onUserUpdate}
                language={language}
                prioritizedAiId={promptPurchaseAiId}
            />
        )}
        {contextMenu && (
            <MessageContextMenu
                message={contextMenu.message}
                position={contextMenu.position}
                onClose={() => setContextMenu(null)}
                onCopy={handleCopy}
                onDeleteForMe={(id) => setMessages(msgs => msgs.filter(m => m.id !== id))}
                language={language}
            />
        )}
    </div>
  );
};