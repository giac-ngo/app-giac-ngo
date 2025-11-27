// client/src/pages/PracticeSpacePage.tsx
import React, { useState, useEffect, useRef, useLayoutEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { User, Message, AIConfig, SystemConfig, Conversation, ViewMode, LibraryFilters, Space } from '../types';
import { apiService } from '../services/apiService';
import { ConversationSidebar } from '../components/ConversationSidebar';
import { MessageContextMenu } from '../components/MessageContextMenu';
import { useToast } from '../components/ToastProvider';
import { CopyIcon, SpeakerWaveIcon, ThumbsUpIcon, ThumbsDownIcon, ChevronDoubleRightIcon, SoundWaveIcon, PaperclipIcon, MicIcon, InfoIcon } from '../components/Icons';
import { MeritPaymentModal } from '../components/MeritPaymentModal';
import { MarketplaceModal } from '../components/MarketplaceModal';
import { MeditationTimer } from '../components/MeditationTimer';
import { LibraryView } from '../components/LibraryView';
import { DharmaTalksView } from '../components/DharmaTalksView';
import { PracticeSpaceHeader } from '../components/PracticeSpaceHeader';


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
        guestLimitReached: "Bạn đã hết lượt nhắn tin cho khách. Vui lòng đăng nhập.",
        userLimitReached: "Bạn đã hết merit. Vui lòng nạp thêm để tiếp tục.",
        purchaseNeeded: "AI này cần được mua để sử dụng.",
        pricing: "Bảng giá",
        marketplace: "Marketplace AI",
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
        aiThought: 'Suy nghĩ của AI',
        comingSoon: 'Sắp có',
        listening: 'Đang nghe...',
        community: 'Tin tức',
        donation: 'Cúng dường',
        switchToSpace: 'Chuyển sang không gian: {spaceName}',
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
        guestLimitReached: "You have reached the message limit for guests. Please log in.",
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
        aiThought: 'AI Thought',
        comingSoon: 'Coming Soon',
        listening: 'Listening...',
        community: 'Community ',
        donation: 'Donation',
        switchToSpace: 'Switching to space: {spaceName}',
    }
};

const normalizePostgresArray = (value: any): string[] => {
    if (Array.isArray(value)) {
        return value;
    }
    if (typeof value === 'string' && value.startsWith('{') && value.endsWith('}')) {
        const content = value.substring(1, value.length - 1);
        if (!content) return [];
        // Improved parsing for strings containing commas and quotes
        return content.match(/("([^"]|\\")*"|[^,]+)/g)?.map(item =>
            item.replace(/^"|"$/g, '').replace(/\\"/g, '"')
        ) || [];
    }
    return [];
};


const GUEST_CONVERSATION_KEY = 'guestConversation';
const INITIAL_MESSAGES_COUNT = 14;
const MESSAGE_BATCH_SIZE = 10;

export const PracticeSpacePage: React.FC<{
  user: User;
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
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | number | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [fileAttachment, setFileAttachment] = useState<{ name: string; url: string } | null>(null);
  
  const [allAiConfigs, setAllAiConfigs] = useState<AIConfig[]>([]);
  const [allSpaces, setAllSpaces] = useState<Space[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentAiConfig, setCurrentAiConfig] = useState<AIConfig | null>(null);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [feedbackStatus, setFeedbackStatus] = useState<{ [messageId: string]: 'liked' | 'disliked' | null }>({});
  
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  
  const [contextMenu, setContextMenu] = useState<{ message: Message; position: { x: number, y: number } } | null>(null);
  const [isMeritPurchaseModalOpen, setIsMeritPurchaseModalOpen] = useState(false);
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


  // Refs for Live Chat
  const liveSessionPromiseRef = useRef<Promise<any> | null>(null);
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);

  const isGuestLimitReached = !user && allMessages.filter(m => m.sender === 'user').length >= systemConfig.guestMessageLimit;
  const isUserMeritsDepleted = user?.merits !== null && (user?.merits ?? 0) <= 0 && !!currentAiConfig?.meritCost && currentAiConfig.meritCost > 0;
  const isOwned = user && currentAiConfig && user.ownedAis?.some(ai => ai.aiConfigId === currentAiConfig.id);
  const isGranted = user && currentAiConfig && user.grantedAiConfigIds?.includes(currentAiConfig.id as number);
  const needsPurchase = !!currentAiConfig?.purchaseCost && currentAiConfig.purchaseCost > 0 && !isOwned;
  const needsContactAccess = currentAiConfig?.isContactForAccess && user && !isGranted;

  const isChatDisabled = isTyping || isGuestLimitReached || isUserMeritsDepleted || needsPurchase || needsContactAccess;

  const viewMode = view || 'chat';
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
            const newConversations = conversations.filter(c => c.id !== id);
            setConversations(newConversations);
            showToast(t.conversationDeleted, 'success');
            if (conversationId === id) {
                if (newConversations.length > 0) {
                    handleSelectConversation(newConversations[0]);
                } else if (currentAiConfig) {
                    handleNewConversation(currentAiConfig);
                }
            }
        } catch (error) {
            showToast(t.deleteConversationError, 'error');
        }
    }, [user, conversationId, conversations, showToast, t.conversationDeleted, t.deleteConversationError, handleSelectConversation, handleNewConversation, currentAiConfig]);

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
                // Fallback if space isn't found, just switch locally
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
        // Cleanup function to close live session if component unmounts
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
    if (user) {
      setAllMessages([]);
      setMessages([]);
      setConversationId(null);
      setIsLoadingConversations(true);
      apiService.getConversations(user)
        .then(setConversations)
        .finally(() => setIsLoadingConversations(false));
    } else {
      setConversations([]);
      setIsLoadingConversations(false);
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
                const [spaceData, allUserAIs, allSpacesData] = await Promise.all([
                    apiService.getSpaceBySlug(spaceSlug),
                    apiService.getAiConfigs(user),
                    apiService.getSpaces()
                ]);

                setCurrentSpace(spaceData);
                setAllAiConfigs(allUserAIs);
                setAllSpaces(allSpacesData);

                if (!spaceData || typeof spaceData.id !== 'number') {
                    showToast('Space not found.', 'error');
                    navigate('/');
                    return;
                }

                const spaceSpecificAIs = allUserAIs.filter(ai => ai.spaceId === spaceData.id);

                let initialAi: AIConfig | undefined;
                const lastSelectedId = localStorage.getItem('lastSelectedAiId');

                if (lastSelectedId) {
                    initialAi = spaceSpecificAIs.find(c => String(c.id) === lastSelectedId);
                }
                
                if (!initialAi) {
                    initialAi = spaceSpecificAIs[0];
                }
                
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
    }, [spaceSlug, navigate, showToast, t.loadError, user]);

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

    if (isChatDisabled) {
        if(isGuestLimitReached) showToast(t.guestLimitReached, 'error');
        if(isUserMeritsDepleted) showToast(t.userLimitReached, 'error');
        if(needsPurchase) showToast(t.purchaseNeeded, 'error');
        if(needsContactAccess) showToast(t.contactAdminForAccess, 'error');
        return;
    }
    
    const isNewConversation = !conversationId && (!user || conversations.find(c => c.id === conversationId) === undefined);

    const userMessage: Message = { id: `msg-${Date.now()}`, text: textToSend, sender: 'user', timestamp: Date.now(), imageUrl: imagePreview || undefined, fileAttachment: fileAttachment || undefined };
    
    setAllMessages(prev => [...prev, userMessage]);
    setMessages(prev => [...prev, userMessage]);

    setNewMessage('');
    setImagePreview(null);
    setFileAttachment(null);
    setIsTyping(true);

    let streamBuffer = '';
    const aiMessageId = `ai-${Date.now()}`;
    
    try {
      await apiService.sendMessageStream(currentAiConfig, [...historyToSend, userMessage], user, conversationId, {
          onChunk: (chunk) => {
              const isFirstChunk = !allMessages.some(msg => msg.id === aiMessageId);
              if (isFirstChunk) {
                setIsTyping(false);
              }

              streamBuffer += chunk;
              const textForDisplay = streamBuffer.replace(/<thought>[\s\S]*?<\/thought>/, '').trimStart();

              setAllMessages(prev => {
                  const alreadyExists = prev.some(m => m.id === aiMessageId);
                  if (alreadyExists) {
                      return prev.map(m => m.id === aiMessageId ? { ...m, text: textForDisplay } : m);
                  }
                  return [...prev, { id: aiMessageId, text: textForDisplay, sender: 'ai', timestamp: Date.now() }];
              });
              setMessages(prev => {
                  const alreadyExists = prev.some(m => m.id === aiMessageId);
                  if (alreadyExists) {
                      return prev.map(m => m.id === aiMessageId ? { ...m, text: textForDisplay } : m);
                  }
                  return [...prev, { id: aiMessageId, text: textForDisplay, sender: 'ai', timestamp: Date.now() }];
              });
          },
          onEnd: (newConversationId, updatedUser, finalMessage) => {
              setIsTyping(false);
              if (newConversationId) {
                  setConversationId(newConversationId);
              }
              if (isNewConversation && user) {
                  apiService.getConversations(user).then(setConversations);
              }
              if (updatedUser) {
                  onUserUpdate(updatedUser);
              }
               if (finalMessage) {
                  const updateFinalMessage = (msgs: Message[]) => msgs.map(msg => 
                      msg.id === aiMessageId 
                      ? { ...msg, text: finalMessage.text, thought: finalMessage.thought || undefined } 
                      : msg
                  );
                  setAllMessages(prev => updateFinalMessage(prev));
                  setMessages(prev => updateFinalMessage(prev));
              }
          },
          onError: (error) => {
               setIsTyping(false);
               const errorMsg = { id: `ai-err-${Date.now()}`, text: t.genericError + `: ${error}`, sender: 'ai', timestamp: Date.now() } as Message;
               setAllMessages(prev => [...prev, errorMsg]);
               setMessages(prev => [...prev, errorMsg]);
          }
      }, false, language, aiMessageId);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        setIsTyping(false);
        const errorMsg = { id: `ai-err-${Date.now()}`, text: t.genericError + `: ${errorMessage}`, sender: 'ai', timestamp: Date.now() } as Message;
        setAllMessages(prev => [...prev, errorMsg]);
        setMessages(prev => [...prev, errorMsg]);
    }
  }, [allMessages, conversationId, currentAiConfig, fileAttachment, imagePreview, isChatDisabled, isGuestLimitReached, isUserMeritsDepleted, language, needsPurchase, newMessage, onUserUpdate, showToast, t, user, conversations, needsContactAccess]);

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
    if (isGuestLimitReached) {
        placeholder = t.guestLimitReached;
    } else if (isUserMeritsDepleted) {
        placeholder = t.userLimitReached;
    } else if (needsPurchase) {
        placeholder = t.purchaseNeeded;
    } else if (needsContactAccess) {
        placeholder = t.contactAdminForAccess;
    } else if (isRecording) {
        placeholder = t.listening;
    }

  const spaceSpecificConversations = conversations.filter(c => c.aiConfigId === currentAiConfig?.id);

  return (
    <div className="practice-space-page">
      <ConversationSidebar
        user={user}
        aiConfigs={allAiConfigs.filter(ai => ai.spaceId === currentSpace?.id)}
        conversations={spaceSpecificConversations}
        currentAiConfig={currentAiConfig}
        selectedConversationId={conversationId}
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
        isLoading={isLoadingConversations}
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
            isMobileMenuOpen={isMobileMenuOpen}
            setIsMobileMenuOpen={setIsMobileMenuOpen}
            isAiSelectorOpen={isAiSelectorOpen}
            setIsAiSelectorOpen={setIsAiSelectorOpen}
            aiSelectorRef={aiSelectorRef}
            handleSelectAi={handleSelectAi}
            setIsMarketplaceModalOpen={setIsMarketplaceModalOpen}
            setViewMode={setViewMode}
        />

        <div className="main-view-wrapper">
            {viewMode === 'chat' && (
                <div className="chat-view-container">
                    <div ref={chatContainerRef} onScroll={handleScroll} className="chat-messages-container">
                        {allMessages.length === 0 && !isTyping && currentAiConfig ? (
                            <div className="welcome-screen-ai">
                                <img src={currentAiConfig.avatarUrl} alt={currentAiConfig.name} className="welcome-ai-avatar" />
                                <h2 className="welcome-ai-name">{language === 'en' && currentAiConfig.nameEn ? currentAiConfig.nameEn : currentAiConfig.name}</h2>
                                <p className="welcome-ai-description">{language === 'en' && currentAiConfig.descriptionEn ? currentAiConfig.descriptionEn : currentAiConfig.description}</p>
                                <div className="welcome-ai-suggestions">
                                    {normalizePostgresArray(language === 'en' && currentAiConfig.suggestedQuestionsEn ? currentAiConfig.suggestedQuestionsEn : currentAiConfig.suggestedQuestions).slice(0, 4).map((q, i) => (
                                        <button key={i} onClick={() => { setNewMessage(q); handleSendMessage(undefined, {text: q}); }} className="welcome-ai-prompt-card">
                                            {q}
                                            <ChevronDoubleRightIcon className="prompt-arrow" />
                                        </button>
                                    ))}
                                </div>
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
                                            {msg.sender === 'ai' && !isTyping && (
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
                                {isTyping && (
                                    <div className="chat-message-row ai">
                                        <div className="chat-message-content">
                                            <div className="chat-message-bubble ai"><div className="typing-indicator"><span></span><span></span><span></span></div></div>
                                        </div>
                                    </div>
                                )}
                                <div ref={messagesEndRef} />
                            </div>
                        )}
                    </div>
                    <div className="chat-input-area">
                        {needsContactAccess && (
                             <div className="text-xs text-center text-yellow-700 bg-yellow-50 border border-yellow-200 rounded-md p-2 mb-2 flex items-center justify-center gap-2">
                                <InfoIcon className="w-4 h-4" />
                                {t.contactAdminForAccess}
                            </div>
                        )}
                        {imagePreview && ( <div className="image-preview-container"><img src={imagePreview} alt="Preview" className="image-preview-thumb" /><button type="button" onClick={() => setImagePreview(null)} className="image-preview-remove-btn">&times;</button></div>)}
                        {fileAttachment && ( <div className="image-preview-container"><div className="file-preview-thumb"><PaperclipIcon className="w-8 h-8 text-text-light" /><span className="text-xs text-text-light truncate">{fileAttachment.name}</span></div><button type="button" onClick={() => setFileAttachment(null)} className="image-preview-remove-btn">&times;</button></div>)}
                        <form onSubmit={handleSendMessage} className="relative">
                            <div className="chat-input-wrapper">
                                <input ref={fileInputRef} type="file" className="hidden" accept="image/*,.doc,.docx,.pdf" onChange={handleFileSelect}/>
                                <button onClick={() => fileInputRef.current?.click()} type="button" disabled={isChatDisabled} className="chat-input-icon-btn"><PaperclipIcon className="w-5 h-5"/></button>
                                <textarea ref={textareaRef} value={newMessage} onChange={(e) => setNewMessage(e.target.value)} onKeyDown={handleTextareaKeyDown} placeholder={placeholder} disabled={isChatDisabled} className="chat-input-field" rows={1}/>
                                <button onClick={handleToggleRecording} type="button" disabled={isChatDisabled} className={`chat-input-icon-btn ${isRecording ? 'text-accent-red' : ''}`}><MicIcon className="w-5 h-5"/></button>
                                <button type="button" onClick={() => {}} disabled={isChatDisabled} className="chat-input-icon-btn"><SoundWaveIcon className="w-5 h-5"/></button>
                                <button type="submit" disabled={isChatDisabled || (!newMessage.trim() && !imagePreview && !fileAttachment)} className="chat-send-btn"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11Z"></path></svg></button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {viewMode === 'meditationtimer' && (
                <div className="meditation-view-container">
                    <MeditationTimer language={language} />
                </div>
            )}
            {viewMode === 'library' && (
                <LibraryView 
                    filters={libraryFilters} 
                    onFiltersChange={setLibraryFilters}
                    language={language}
                    spaceId={typeof currentSpace?.id === 'number' ? currentSpace.id : null}
                    spaceSlug={spaceSlug}
                />
            )}
            {viewMode === 'dharmatalks' && (
                // FIX: Pass a valid number or null to the spaceId prop to avoid type errors.
                 <DharmaTalksView language={language} spaceId={typeof currentSpace?.id === 'number' ? currentSpace.id : null} />
            )}
            {(viewMode === 'community' || viewMode === 'about') && (
                 <div className="flex items-center justify-center h-full text-text-light">{t.comingSoon}</div>
            )}
        </div>
      </main>
      
        {isMeritPurchaseModalOpen && (
            <MeritPaymentModal
                isOpen={isMeritPurchaseModalOpen}
                onClose={() => setIsMeritPurchaseModalOpen(false)}
                user={user}
                onPaymentSuccess={onUserUpdate}
                language={language}
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