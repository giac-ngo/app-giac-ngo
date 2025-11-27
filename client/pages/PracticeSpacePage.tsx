// client/src/pages/PracticeSpacePage.tsx
import React, { useState, useEffect, useRef, useLayoutEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { User, Message, AIConfig, SystemConfig, Conversation } from '../types';
import { apiService } from '../services/apiService';
import { ConversationSidebar } from '../components/ConversationSidebar';
import { MessageContextMenu } from '../components/MessageContextMenu';
import { useToast } from '../components/ToastProvider';
// FIX: Import MicIcon
import { ChevronDownIcon, CopyIcon, SpeakerWaveIcon, ThumbsUpIcon, ThumbsDownIcon, ChevronDoubleRightIcon, CommentIcon, DownloadIcon, SoundWaveIcon, ShareIcon, PaperclipIcon, PricingIcon, WandIcon, SpinnerIcon, ChevronLeftIcon, MicIcon } from '../components/Icons';
import { MeritPaymentModal } from '../components/MeritPaymentModal';
import { MarketplaceModal } from '../components/MarketplaceModal';
import { MeditationTimer } from '../components/MeditationTimer';
import { connectLiveSession, createBlob, decode, decodeAudioData } from '../services/geminiService';
import { LiveServerMessage } from '@google/genai';
import { LibraryView } from '../components/LibraryView';
import { DharmaTalksView } from '../components/DharmaTalksView';


declare global {
    interface Window {
        SpeechRecognition: any;
        webkitSpeechRecognition: any;
    }
}

type ViewMode = 'chat' | 'meditation' | 'community' | 'dharma_talks' | 'library' | 'about';

const translations = {
    vi: {
        loadError: "Xin lỗi, không thể tải dữ liệu cần thiết. Vui lòng thử lại sau.",
        logout: "Đăng xuất",
        inputPlaceholder: "Nhập tin nhắn của bạn...",
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
        home: "Trang chủ",
        about: "Giới thiệu",
        library: "Thư viện",
        uploadingFile: 'Đang tải file lên...',
        uploadSuccess: 'Tải file lên thành công!',
        uploadError: 'Tải file thất bại.',
        loadingOlderMessages: 'Đang tải tin nhắn cũ...',
        feedbackError: 'Lưu phản hồi thất bại.',
        aiThought: 'Suy nghĩ của AI',
        comingSoon: 'Sắp có',
    },
    en: {
        loadError: "Sorry, the necessary data could not be loaded. Please try again later.",
        logout: "Logout",
        inputPlaceholder: "Enter your message...",
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
        home: "Home",
        about: "About",
        library: "Library",
        uploadingFile: 'Uploading file...',
        uploadSuccess: 'File uploaded successfully!',
        uploadError: 'File upload failed.',
        loadingOlderMessages: 'Loading older messages...',
        feedbackError: 'Failed to save feedback.',
        aiThought: 'AI Thought',
        comingSoon: 'Coming Soon',
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
// FIX: Restore original logic of showing 14 messages initially.
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
  const [allMessages, setAllMessages] = useState<Message[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isLiveChatting, setIsLiveChatting] = useState(false);
  const [liveChatStatus, setLiveChatStatus] = useState<'idle' | 'connecting' | 'connected' | 'error'>('idle');
  const [speakingMessageId, setSpeakingMessageId] = useState<string | number | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [fileAttachment, setFileAttachment] = useState<{ name: string; url: string } | null>(null);
  
  const [aiConfigs, setAiConfigs] = useState<AIConfig[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentAiConfig, setCurrentAiConfig] = useState<AIConfig | null>(null);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [feedbackStatus, setFeedbackStatus] = useState<{ [messageId: string]: 'liked' | 'disliked' }>({});
  
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  
  const [contextMenu, setContextMenu] = useState<{ message: Message; position: { x: number, y: number } } | null>(null);
  const [isMeritPurchaseModalOpen, setIsMeritPurchaseModalOpen] = useState(false);
  const [isMarketplaceModalOpen, setIsMarketplaceModalOpen] = useState(false);
  const [isAiSelectorOpen, setIsAiSelectorOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    const initialMode = localStorage.getItem('initialViewMode');
    localStorage.removeItem('initialViewMode'); // Clear it after reading
    return (initialMode as ViewMode) || 'chat';
  });

  // Library states
  const [libraryFilters, setLibraryFilters] = useState<{ type?: string; author?: string; topic?: string; search?: string; }>({});

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
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const mediaStreamSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const audioSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  let nextStartTime = 0;

  const isGuestLimitReached = !user && allMessages.filter(m => m.sender === 'user').length >= systemConfig.guestMessageLimit;
  const isUserMeritsDepleted = user?.merits !== null && (user?.merits ?? 0) <= 0 && !!currentAiConfig?.meritCost && currentAiConfig.meritCost > 0;
  const isOwned = user && currentAiConfig && user.ownedAiConfigIds?.includes(currentAiConfig.id as number);
  const needsPurchase = !!currentAiConfig?.purchaseCost && currentAiConfig.purchaseCost > 0 && !isOwned;
  const isChatDisabled = isTyping || isGuestLimitReached || isUserMeritsDepleted || needsPurchase;

    const handleSelectConversation = useCallback((conv: Conversation) => {
        if (isTyping) return;
        setConversationId(conv.id);
        const fullHistory = conv.messages || [];
        setAllMessages(fullHistory);
        setMessages(fullHistory.slice(-INITIAL_MESSAGES_COUNT));
        const newAiConfig = aiConfigs.find(c => c.id === conv.aiConfigId);
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
    }, [aiConfigs, isTyping]);

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
    const fetchAndSetConfigs = async () => {
        try {
            const configs = await apiService.getAiConfigs(user);
            setAiConfigs(configs);

            if (configs.length === 0) {
                setCurrentAiConfig(null);
                return;
            }

            let initialAi: AIConfig | undefined;
            const lastSelectedId = localStorage.getItem('lastSelectedAiId');

            if (lastSelectedId) {
                initialAi = configs.find(c => String(c.id) === lastSelectedId);
            }

            if (!initialAi && !user) {
                const savedGuestConvo = localStorage.getItem(GUEST_CONVERSATION_KEY);
                const parsed = savedGuestConvo ? JSON.parse(savedGuestConvo) : null;
                if (parsed?.aiConfigId) {
                    initialAi = configs.find(c => c.id === parsed.aiConfigId);
                }
            }
            
            if (!initialAi) {
                initialAi = configs[0];
            }

            setCurrentAiConfig(initialAi);

        } catch (error) {
            console.error("Lỗi khi tải dữ liệu khởi tạo:", error);
            if (messages.length === 0) {
                setMessages([{ id: 'ai-error', text: t.loadError, sender: 'ai', timestamp: Date.now() }]);
            }
        }
    };
    fetchAndSetConfigs();
    if (window.speechSynthesis) window.speechSynthesis.cancel();
}, [user]);

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
    const initialFeedback: { [messageId: string]: 'liked' | 'disliked' } = {};
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
        return;
    }
    
    const isNewConversation = !conversationId && (!user || conversations.find(c => c.id === conversationId) === undefined);

    const userMessage: Message = { id: `msg-${Date.now()}`, text: textToSend, sender: 'user', timestamp: Date.now(), imageUrl: imagePreview || undefined, fileAttachment: fileAttachment || undefined };
    const updatedAllMessages = [...historyToSend, userMessage];
    
    const aiMessageId = `ai-${Date.now()}`;
    const newAiMessage: Message = { id: aiMessageId, text: '', sender: 'ai', timestamp: Date.now() };

    setAllMessages(prev => [...prev, userMessage, newAiMessage]);
    setMessages(prev => [...prev, userMessage, newAiMessage]);

    setNewMessage('');
    setImagePreview(null);
    setFileAttachment(null);
    setIsTyping(true);

    let streamBuffer = '';
    
    try {
      await apiService.sendMessageStream(currentAiConfig, updatedAllMessages, user, conversationId, {
          onChunk: (chunk) => {
              streamBuffer += chunk;
              const textForDisplay = streamBuffer.replace(/<thought>[\s\S]*?<\/thought>/, '').trimStart();
              const updateMessage = (msgs: Message[]) => msgs.map(msg => msg.id === aiMessageId ? { ...msg, text: textForDisplay } : msg);
              setAllMessages(prev => updateMessage(prev));
              setMessages(prev => updateMessage(prev));
          },
          onEnd: (newConversationId, updatedUser, finalMessage) => {
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
              setIsTyping(false);
          },
          onError: (error) => {
               const updateMessage = (msgs: Message[]) => msgs.map(msg => msg.id === aiMessageId ? { ...msg, text: t.genericError + `: ${error}` } : msg);
               setAllMessages(prev => updateMessage(prev));
               setMessages(prev => updateMessage(prev));
               setIsTyping(false);
          }
      }, false, language, aiMessageId);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        const updateMessage = (msgs: Message[]) => msgs.map(msg => msg.id === aiMessageId ? { ...msg, text: t.genericError + `: ${errorMessage}` } : msg);
        setAllMessages(prev => updateMessage(prev));
        setMessages(prev => updateMessage(prev));
        setIsTyping(false);
    }
  }, [allMessages, conversationId, currentAiConfig, fileAttachment, imagePreview, isChatDisabled, isGuestLimitReached, isUserMeritsDepleted, language, needsPurchase, newMessage, onUserUpdate, showToast, t.genericError, t.guestLimitReached, t.purchaseNeeded, t.userLimitReached, user, conversations]);

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

  const handleSelectAi = (ai: AIConfig) => {
    if (ai.id !== currentAiConfig?.id) {
        handleNewConversation(ai);
    }
    setIsAiSelectorOpen(false);
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
        // ... (implementation for text-to-speech)
    };

    const handleFeedback = async (msgId: string | number, newFeedback: 'liked' | 'disliked') => {
       // ... (implementation for feedback)
    };

    const handleScroll = () => {
        // ... (implementation for infinite scroll)
    };
    
    const currentTheme = user?.template || systemConfig.template;

  return (
    <div className="practice-space-page">
      <ConversationSidebar
        user={user}
        aiConfigs={aiConfigs}
        conversations={conversations}
        currentAiConfig={currentAiConfig}
        selectedConversationId={conversationId}
        onSelectConversation={handleSelectConversation}
        onNewConversation={handleNewConversation}
        onDeleteConversation={handleDeleteConversation}
        onGoToLogin={onGoToLogin}
        onGoToAdmin={() => navigate('/admin')}
        onLogout={onLogout}
        language={language}
        setLanguage={setLanguage}
        systemConfig={systemConfig}
        isSidebarCollapsed={isSidebarCollapsed}
        setIsSidebarCollapsed={setIsSidebarCollapsed}
        isLoading={isLoadingConversations}
        onOpenMeritPurchase={() => setIsMeritPurchaseModalOpen(true)}
        viewMode={viewMode}
        setViewMode={setViewMode}
        onSetLibraryFilters={setLibraryFilters}
      />
      <main className={`main-content ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <header className="chat-main-header">
            <div className="header-content-wrapper">
                <div className="header-left-group">
                    <Link to="/" className="flex items-center gap-3 text-text-light hover:text-text-main">
                        <ChevronLeftIcon className="w-6 h-6" />
                    </Link>
                </div>
                <nav className="header-center-group">
                    <Link to="/" className="header-nav-item">{t.home}</Link>
                    <a href="/#" className="header-nav-item">{t.about}</a>
                    <Link to="/app" onClick={() => setViewMode('library')} className="header-nav-item">{t.library}</Link>
                </nav>
                <div className="header-right-group">
                    <div ref={aiSelectorRef} className="relative">
                        {currentAiConfig ? (
                            <button onClick={() => setIsAiSelectorOpen(!isAiSelectorOpen)} aria-expanded={isAiSelectorOpen} className="ai-selector-button">
                                <img src={currentAiConfig.avatarUrl} alt={currentAiConfig.name} className="ai-selector-avatar" />
                                <span className="ai-selector-name">{language === 'en' && currentAiConfig.nameEn ? currentAiConfig.nameEn : currentAiConfig.name}</span>
                                <ChevronDownIcon className={`chevron ${isAiSelectorOpen ? 'rotate-180' : ''}`} />
                            </button>
                        ) : (
                             <div className="ai-selector-button is-loading">
                                <div className="ai-selector-avatar skeleton-placeholder" />
                                <span className="ai-selector-name skeleton-placeholder" />
                            </div>
                        )}
                        {isAiSelectorOpen && (
                            <div className="ai-selector-dropdown">
                                <p className="px-3 py-2 text-xs font-semibold text-text-light uppercase">{t.aiListTitle}</p>
                                {aiConfigs.map(ai => (
                                    <button key={ai.id} onClick={() => handleSelectAi(ai)} className={`w-full text-left flex items-center gap-3 p-2 rounded-md ${ai.id === currentAiConfig?.id ? 'bg-primary-light' : 'hover:bg-background-light'}`}>
                                        <img src={ai.avatarUrl} alt={ai.name} className="w-8 h-8 rounded-full" />
                                        <div>
                                            <p className="font-semibold text-sm">{(language === 'en' && ai.nameEn) ? ai.nameEn : ai.name}</p>
                                            <p className="text-xs text-text-light">{(language === 'en' && ai.descriptionEn) ? ai.descriptionEn : ai.description}</p>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                    <button onClick={() => setIsMarketplaceModalOpen(true)} className="marketplace-button">
                        <WandIcon className="w-5 h-5"/>
                        <span>{t.marketplace}</span>
                    </button>
                </div>
            </div>
        </header>

        <div className="main-view-wrapper">
            {viewMode === 'chat' && (
                <div className="chat-view-container">
                    <div ref={chatContainerRef} onScroll={handleScroll} className="chat-messages-container">
                        {/* FIX: Check allMessages length to correctly show welcome screen for new conversations */}
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
                        {imagePreview && ( <div className="image-preview-container"><img src={imagePreview} alt="Preview" className="image-preview-thumb" /><button type="button" onClick={() => setImagePreview(null)} className="image-preview-remove-btn">&times;</button></div>)}
                        {fileAttachment && ( <div className="image-preview-container"><div className="file-preview-thumb"><PaperclipIcon className="w-8 h-8 text-text-light" /><span className="text-xs text-text-light truncate">{fileAttachment.name}</span></div><button type="button" onClick={() => setFileAttachment(null)} className="image-preview-remove-btn">&times;</button></div>)}
                        <form onSubmit={handleSendMessage} className="relative">
                            <div className="chat-input-wrapper">
                                <input ref={fileInputRef} type="file" className="hidden" accept="image/*,.doc,.docx,.pdf" onChange={handleFileSelect}/>
                                <button onClick={() => fileInputRef.current?.click()} type="button" disabled={isChatDisabled} className="chat-input-icon-btn"><PaperclipIcon className="w-5 h-5"/></button>
                                <textarea ref={textareaRef} value={newMessage} onChange={(e) => setNewMessage(e.target.value)} onKeyDown={handleTextareaKeyDown} placeholder={t.inputPlaceholder} disabled={isChatDisabled} className="chat-input-field" rows={1}/>
                                <button onClick={handleToggleRecording} type="button" disabled={isChatDisabled} className={`chat-input-icon-btn ${isRecording ? 'text-accent-red' : ''}`}><MicIcon className="w-5 h-5"/></button>
                                <button type="button" onClick={() => {}} disabled={isChatDisabled} className="chat-input-icon-btn"><SoundWaveIcon className="w-5 h-5"/></button>
                                <button type="submit" disabled={isChatDisabled || (!newMessage.trim() && !imagePreview && !fileAttachment)} className="chat-send-btn"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11Z"></path></svg></button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {viewMode === 'meditation' && (
                <div className="meditation-view-container">
                    <MeditationTimer language={language} />
                </div>
            )}
            {viewMode === 'library' && (
                <LibraryView 
                    filters={libraryFilters} 
                    language={language}
                    spaceId={currentAiConfig?.spaceId}
                />
            )}
            {viewMode === 'dharma_talks' && (
                 <DharmaTalksView language={language} />
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