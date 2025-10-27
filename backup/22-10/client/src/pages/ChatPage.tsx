import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { User, Message, AIConfig, SystemConfig, Conversation } from '../types';
import { apiService } from '../services/apiService';
import ConversationSidebar from '../components/ConversationSidebar';
import MessageContextMenu from '../components/MessageContextMenu';
import PricingModal from '../components/PricingModal';
import { useToast } from '../components/ToastProvider';
import { ChevronDownIcon, SpeakerWaveIcon, ThumbsUpIcon, ThumbsDownIcon, ChevronDoubleRightIcon, SoundWaveIcon, CommentIcon, DownloadIcon, CopyIcon } from '../components/Icons';
import CryptoPaymentModal from '../components/CryptoPaymentModal';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { MeditationTimer } from '../components/MeditationTimer';


// Define the Blob type locally as it's not exported in the current SDK version
interface Blob {
    mimeType: string;
    data: string;
}

// --- Các hàm hỗ trợ giải mã/mã hóa âm thanh ---
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function createBlob(data: Float32Array): Blob {
  const l = data.length;
  const int16 = new Int16Array(l);
  for (let i = 0; i < l; i++) {
    int16[i] = data[i] * 32768;
  }
  return {
    data: encode(new Uint8Array(int16.buffer)),
    mimeType: 'audio/pcm;rate=16000',
  };
}


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
        upgrade: "Nâng cấp",
        micNotSupported: 'Trình duyệt không hỗ trợ nhận dạng giọng nói.',
        micAccessDenied: 'Quyền truy cập micro đã bị từ chối. Vui lòng cho phép trong cài đặt trình duyệt.',
        micNotFound: 'Không tìm thấy micro trên thiết bị của bạn.',
        geminiKeyMissing: 'API key cho Gemini chưa được cấu hình. Vui lòng liên hệ quản trị viên.',
        liveChatError: 'Không thể bắt đầu trò chuyện trực tiếp: {message}',
        messageCopied: 'Đã sao chép tin nhắn!',
        remainingCoins: 'Số coins còn lại:',
        unlimited: 'Không giới hạn',
        speaking: 'Đang nói...',
        like: 'Thích',
        dislike: 'Không thích',
        copy: 'Sao chép',
        speak: 'Nghe',
        download: 'Tải xuống',
        newChat: 'Trò chuyện mới',
        openSidebar: 'Mở sidebar',
        conversationDeleted: 'Đã xóa hội thoại.',
        deleteConversationError: 'Xóa hội thoại thất bại.',
        liveChat: 'Trò chuyện trực tiếp',
        liveChatConnecting: 'Đang kết nối...',
        liveChatActive: 'Đang trò chuyện trực tiếp...',
        comment: 'Bình luận',
        commentNotImplemented: 'Chức năng bình luận chưa được cài đặt.',
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
        upgrade: "Upgrade",
        micNotSupported: 'Browser does not support speech recognition.',
        micAccessDenied: 'Microphone access was denied. Please allow access in your browser settings.',
        micNotFound: 'No microphone was found on your device.',
        geminiKeyMissing: 'Gemini API key is not configured. Please contact an administrator.',
        liveChatError: 'Could not start live chat: {message}',
        messageCopied: 'Message copied!',
        remainingCoins: 'Remaining coins:',
        unlimited: 'Unlimited',
        speaking: 'Speaking...',
        like: 'Like',
        dislike: 'Dislike',
        copy: 'Copy',
        speak: 'Speak',
        download: 'Download',
        newChat: 'New Chat',
        openSidebar: 'Open sidebar',
        conversationDeleted: 'Conversation deleted.',
        deleteConversationError: 'Failed to delete conversation.',
        liveChat: 'Live Chat',
        liveChatConnecting: 'Connecting...',
        liveChatActive: 'Live chat active...',
        comment: 'Comment',
        commentNotImplemented: 'Comment feature is not implemented yet.',
    }
};

const GUEST_CONVERSATION_KEY = 'guestConversation';

export const ChatPage: React.FC<{
  user: User | null;
  systemConfig: SystemConfig;
  onLogout: () => void;
  onGoToLogin: () => void;
  language: 'vi' | 'en';
  setLanguage: (lang: 'vi' | 'en') => void;
  onUserUpdate: (updatedData: Partial<User>) => void;
}> = ({ user, systemConfig, onLogout, onGoToLogin, language, setLanguage, onUserUpdate }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState<string | number | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const [aiConfigs, setAiConfigs] = useState<AIConfig[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentAiConfig, setCurrentAiConfig] = useState<AIConfig | null>(null);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const [feedbackStatus, setFeedbackStatus] = useState<{ [messageId: string]: 'liked' | 'disliked' }>({});
  
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  
  const [contextMenu, setContextMenu] = useState<{ message: Message; position: { x: number, y: number } } | null>(null);
  const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
  const [isCoinPurchaseModalOpen, setIsCoinPurchaseModalOpen] = useState(false);
  const [isAiSelectorOpen, setIsAiSelectorOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'chat' | 'meditation'>('chat');

  // --- State và Ref cho Live Chat ---
  const [isLiveActive, setIsLiveActive] = useState(false);
  const [isLiveConnecting, setIsLiveConnecting] = useState(false);
  const liveSessionPromise = useRef<Promise<any> | null>(null);
  const inputAudioContext = useRef<AudioContext | null>(null);
  const outputAudioContext = useRef<AudioContext | null>(null);
  const microphoneStream = useRef<MediaStream | null>(null);
  const scriptProcessorNode = useRef<ScriptProcessorNode | null>(null);
  const outputAudioSources = useRef(new Set<AudioBufferSourceNode>());
  let nextStartTime = 0;


  const t = translations[language];
  const { showToast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const aiSelectorRef = useRef<HTMLDivElement>(null);
  const textBeforeRecording = useRef('');

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);
  
  useEffect(() => {
    return () => {
        if (window.speechSynthesis) window.speechSynthesis.cancel();
    }
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
        setMessages(parsed?.messages || []);
      } catch {
        localStorage.removeItem(GUEST_CONVERSATION_KEY);
        setMessages([]);
      }
    }
  }, [user]);

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
}, [user, language]);

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
      if (!user && currentAiConfig && messages.length > 0 && messages.some(m => m.sender === 'user')) {
          localStorage.setItem(GUEST_CONVERSATION_KEY, JSON.stringify({ aiConfigId: currentAiConfig.id, messages: messages }));
      }
  }, [messages, user, currentAiConfig]);
  
  const handleSelectAi = (ai: AIConfig) => {
    if (!user && currentAiConfig?.id !== ai.id) localStorage.removeItem(GUEST_CONVERSATION_KEY);
    setCurrentAiConfig(ai);
    setConversationId(null);
    setMessages([]);
    localStorage.setItem('lastSelectedAiId', String(ai.id));
  };

  const handleSelectConversation = (conv: Conversation) => {
      const relatedAi = aiConfigs.find(ai => ai.id === conv.aiConfigId);
      if (relatedAi) {
          setCurrentAiConfig(relatedAi);
          setConversationId(conv.id);
          setMessages(conv.messages);
          localStorage.setItem('lastSelectedAiId', String(relatedAi.id));
      }
  };

  const handleNewConversation = (aiConfig: AIConfig) => {
      if (!user) localStorage.removeItem(GUEST_CONVERSATION_KEY);
      handleSelectAi(aiConfig);
  };

  const handleDeleteConversation = async (id: number) => {
      try {
          await apiService.deleteConversation(id);
          const updatedConversations = conversations.filter(c => c.id !== id);
          setConversations(updatedConversations);
          if (conversationId === id) {
              setConversationId(null);
              setMessages([]);
          }
          showToast(t.conversationDeleted, 'info');
      } catch (err) {
          showToast(t.deleteConversationError, 'error');
          console.error("Lỗi khi xóa hội thoại:", err);
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
  
  const handleSendMessage = async (e?: React.FormEvent, overrideOptions?: { text?: string; messagesHistory?: Message[] }) => {
    e?.preventDefault();
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    setSpeakingMessageId(null);
    
    const textToSend = overrideOptions?.text ?? newMessage.trim();
    const historyToSend = overrideOptions?.messagesHistory ?? messages;

    if ((!textToSend && !imagePreview) || !currentAiConfig) return;

    if (isChatDisabled) {
        if(isGuestLimitReached) showToast(t.guestLimitReached, 'error');
        if(isUserCoinsDepleted) showToast(t.userLimitReached, 'error');
        if(needsSubscription) showToast(t.subscriptionNeeded, 'error');
        return;
    }
    
    //const isNewConversation = !conversationId && (!user || conversations.find(c => c.id === conversationId) === undefined);

    const userMessage: Message = { id: `msg-${Date.now()}`, text: textToSend, sender: 'user', timestamp: Date.now(), imageUrl: imagePreview || undefined };
    const updatedMessages = [...historyToSend, userMessage];
    
    setMessages(updatedMessages);
    setNewMessage('');
    setImagePreview(null);
    setIsTyping(true);

    let streamBuffer = '';
    const aiMessageId = `ai-${Date.now()}`;
    setMessages(prev => [...prev, { id: aiMessageId, text: '', sender: 'ai', timestamp: Date.now() }]);
    
    await apiService.sendMessageStream(currentAiConfig, updatedMessages, user, conversationId, {
        onChunk: (chunk) => {
            streamBuffer += chunk;
            setMessages(prev => prev.map(msg => msg.id === aiMessageId ? { ...msg, text: streamBuffer } : msg));
        },
        onEnd: (_newConversationId, _fullResponse) => setIsTyping(false),
        onError: (error) => {
             setMessages(prev => prev.map(msg => msg.id === aiMessageId ? { ...msg, text: t.genericError + `: ${error}` } : msg));
             setIsTyping(false);
        }
    });
  };

    const handleTextareaKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
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

  // --- Chức năng Live Chat ---
    const stopLiveChat = async () => {
        if (liveSessionPromise.current) {
            try {
                const session = await liveSessionPromise.current;
                session.close();
            } catch (e) {
                console.error("Error closing live session:", e);
            } finally {
                liveSessionPromise.current = null;
            }
        }

        microphoneStream.current?.getTracks().forEach(track => track.stop());
        microphoneStream.current = null;

        if (scriptProcessorNode.current) {
            scriptProcessorNode.current.disconnect();
            scriptProcessorNode.current = null;
        }
        
        inputAudioContext.current?.close().catch(console.error);
        outputAudioContext.current?.close().catch(console.error);

        outputAudioSources.current.forEach(source => source.stop());
        outputAudioSources.current.clear();

        setIsLiveActive(false);
        setIsLiveConnecting(false);
    };

    const handleToggleLiveChat = async () => {
        if (isLiveActive || isLiveConnecting) {
            await stopLiveChat();
            return;
        }

        if (!currentAiConfig) return;

        const getGeminiApiKey = () => {
            if (user && user.apiKeys?.gemini) {
                return user.apiKeys.gemini;
            }
            if (systemConfig && systemConfig.systemKeys?.gemini) {
                return systemConfig.systemKeys.gemini;
            }
            return null;
        };

        setIsLiveConnecting(true);

        let stream: MediaStream | null = null;
        try {
            stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            microphoneStream.current = stream;
        } catch (error: any) {
            console.error('Failed to get user media:', error);
            let errorMessage = t.genericError;
            if (error.name === 'NotAllowedError') {
                errorMessage = t.micAccessDenied;
            } else if (error.name === 'NotFoundError') {
                errorMessage = t.micNotFound;
            }
            showToast(errorMessage, 'error');
            setIsLiveConnecting(false);
            return;
        }

        try {
            const apiKey = getGeminiApiKey();
            if (!apiKey) {
                throw new Error(t.geminiKeyMissing);
            }

            const ai = new GoogleGenAI({ apiKey });

            inputAudioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
            outputAudioContext.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            nextStartTime = 0;

            liveSessionPromise.current = ai.live.connect({
                model: 'gemini-2.5-flash-native-audio-preview-09-2025',
                callbacks: {
                    onopen: () => {
                        const source = inputAudioContext.current!.createMediaStreamSource(stream!);
                        const processor = inputAudioContext.current!.createScriptProcessor(4096, 1, 1);
                        scriptProcessorNode.current = processor;

                        processor.onaudioprocess = (audioProcessingEvent) => {
                            const inputData = audioProcessingEvent.inputBuffer.getChannelData(0);
                            const pcmBlob = createBlob(inputData);
                            liveSessionPromise.current?.then((session) => {
                                session.sendRealtimeInput({ media: pcmBlob });
                            }).catch(e => console.error("Error sending realtime input:", e));
                        };
                        source.connect(processor);
                        processor.connect(inputAudioContext.current!.destination);
                        setIsLiveConnecting(false);
                        setIsLiveActive(true);
                    },
                    onmessage: async (message: LiveServerMessage) => {
                        const parts = message.serverContent?.modelTurn?.parts;
                        const base64Audio = parts?.[0]?.inlineData?.data;
                        if (!base64Audio) return;
                        try {
                            const ctx = outputAudioContext.current;
                            if (!ctx) return;
                            nextStartTime = Math.max(nextStartTime, ctx.currentTime);
                            const audioBuffer = await decodeAudioData(decode(base64Audio), ctx, 24000, 1);
                            const source = ctx.createBufferSource();
                            source.buffer = audioBuffer;
                            source.connect(ctx.destination);
                            
                            source.addEventListener('ended', () => {
                                outputAudioSources.current.delete(source);
                            });

                            source.start(nextStartTime);
                            nextStartTime += audioBuffer.duration;
                            outputAudioSources.current.add(source);
                        } catch (e) {
                            console.error("Error processing audio message:", e);
                        }
                        if (message.serverContent?.interrupted) {
                             outputAudioSources.current.forEach(source => source.stop());
                             outputAudioSources.current.clear();
                             nextStartTime = 0;
                        }
                    },
                    onerror: (e: ErrorEvent) => {
                        console.error('Live session error:', e);
                        showToast(`Live Chat Error: ${e.message}`, 'error');
                        stopLiveChat();
                    },
                    onclose: () => {
                        stopLiveChat();
                    },
                },
                config: {
                    responseModalities: [Modality.AUDIO],
                    systemInstruction: currentAiConfig.trainingContent,
                },
            });
        } catch (error: any) {
            console.error('Failed to connect to Gemini Live:', error);
            showToast(t.liveChatError.replace('{message}', error.message), 'error');
            stream?.getTracks().forEach(track => track.stop());
            microphoneStream.current = null;
            setIsLiveConnecting(false);
        }
    };


  const handleMessageContextMenu = (e: React.MouseEvent, msg: Message) => { e.preventDefault(); if(msg.id) setContextMenu({ message: msg, position: { x: e.clientX, y: e.clientY } }); };
  const handleCloseContextMenu = () => setContextMenu(null);
  const handleDeleteMessage = async (msgId: string | number) => { if (!conversationId) return; const updated = messages.filter(m => m.id !== msgId); setMessages(updated); try { await apiService.updateConversationMessages(conversationId, updated); } catch (error) { setMessages(messages); } };

  const handleFeedback = (messageId: string | number, feedback: 'liked' | 'disliked') =>
    setFeedbackStatus(prev => {
      const key = String(messageId);
      const current = prev[key];
      if (current === feedback) {
        const { [key]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [key]: feedback };
    });
  const handleCopy = (text: string) => { navigator.clipboard.writeText(text); showToast(t.messageCopied, 'info'); };
  const handleSpeak = (text: string, messageId: string | number) => {
      if (!window.speechSynthesis) return;
      if (speechSynthesis.speaking) {
          speechSynthesis.cancel();
          if (speakingMessageId === messageId) {
              setSpeakingMessageId(null);
              return;
          }
      }
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language === 'vi' ? 'vi-VN' : 'en-US';
      utterance.onstart = () => setSpeakingMessageId(messageId);
      utterance.onend = () => setSpeakingMessageId(null);
      utterance.onerror = () => setSpeakingMessageId(null);
      speechSynthesis.speak(utterance);
  };
  const handleDownload = (text: string, messageId: string | number) => {
      const blob = new Blob([text], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `conversation-${messageId}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
  };
  
  const userMessagesCount = messages.filter(m => m.sender === 'user').length;
  const isGuestLimitReached = !user && userMessagesCount >= systemConfig.guestMessageLimit;
  const hasActiveSubscription = user?.subscriptionExpiresAt ? new Date(user.subscriptionExpiresAt) > new Date() : false;
  const isUserCoinsDepleted = !!user && user.coins !== null && user.coins <= 0 && !hasActiveSubscription;
  const needsSubscription = currentAiConfig?.requiresSubscription && !hasActiveSubscription;
  const isChatDisabled = isGuestLimitReached || isUserCoinsDepleted || needsSubscription || isLiveActive;

  let placeholderText = t.inputPlaceholder;
  if (isGuestLimitReached) placeholderText = t.guestLimitReached;
  if (isUserCoinsDepleted) placeholderText = t.userLimitReached;
  if (needsSubscription) placeholderText = t.subscriptionNeeded;
  if (isRecording) placeholderText = 'Đang nghe...';
  if (isLiveConnecting) placeholderText = t.liveChatConnecting;
  if (isLiveActive) placeholderText = t.liveChatActive;
  
  return (
    <div className={`chat-layout-container ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
      <ConversationSidebar 
        user={user} 
        systemConfig={systemConfig} 
        conversations={conversations} 
        aiConfigs={aiConfigs} 
        selectedConversationId={conversationId} 
        onSelectConversation={handleSelectConversation} 
        onNewConversation={handleNewConversation} 
        onDeleteConversation={handleDeleteConversation} 
        onLogout={onLogout} 
        onGoToLogin={onGoToLogin} 
        onGoToAdmin={() => window.location.hash = '#/admin'} 
        language={language} 
        setLanguage={setLanguage} 
        isLoading={isLoadingConversations} 
        onOpenCoinPurchase={() => setIsCoinPurchaseModalOpen(true)} 
        isSidebarCollapsed={isSidebarCollapsed}
        setIsSidebarCollapsed={setIsSidebarCollapsed}
        viewMode={viewMode}
        setViewMode={setViewMode}
      />
      
        <main className="chat-content-area">
            {viewMode === 'chat' ? (
                <>
                    <header className="chat-main-header relative z-20">
                        {/* Empty div to push content to the right */}
                        <div></div>

                        <div className="flex items-center gap-4">
                            <div className="relative" ref={aiSelectorRef}>
                                <button onClick={() => setIsAiSelectorOpen(prev => !prev)} className="flex items-center gap-3 p-1.5 rounded-md hover:bg-background-light">
                                    {currentAiConfig?.avatarUrl && <img src={currentAiConfig.avatarUrl} alt={currentAiConfig.name} className="w-8 h-8 rounded-full object-cover"/>}
                                    <span className="font-semibold">{currentAiConfig?.name || '...'}</span>
                                    <ChevronDownIcon className={`w-5 h-5 text-text-light transition-transform ${isAiSelectorOpen ? 'rotate-180' : ''}`}/>
                                </button>
                                {isAiSelectorOpen && (
                                    <div className="absolute top-full right-0 mt-2 w-72 bg-background-panel border border-border-color rounded-lg shadow-lg z-10">
                                        <ul className="p-2 max-h-80 overflow-y-auto">
                                            {aiConfigs.map(ai => (
                                                <li key={ai.id}>
                                                    <button
                                                        onClick={() => {
                                                            handleSelectAi(ai);
                                                            setIsAiSelectorOpen(false);
                                                        }}
                                                        className="w-full text-left p-3 flex items-center gap-3 rounded-md hover:bg-background-light"
                                                    >
                                                        <img src={ai.avatarUrl || `https://i.pravatar.cc/150?u=${ai.id}`} alt={ai.name} className="w-8 h-8 rounded-full"/>
                                                        <p className="font-semibold text-sm">{ai.name}</p>
                                                    </button>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>

                            <button onClick={() => setIsPricingModalOpen(true)} className="bg-primary text-text-on-primary font-semibold text-sm py-1.5 px-5 rounded-md hover:bg-primary-hover transition-colors">{t.upgrade}</button>
                        </div>
                    </header>

                    <div className="chat-messages-container" onClick={handleCloseContextMenu}>
                        <div className="chat-background-decoration"></div>
                        {messages.length === 0 && currentAiConfig ? (
                        <div className="flex flex-col items-center justify-center h-full text-center px-4 relative z-10">
                            <img 
                                src={currentAiConfig.avatarUrl || `https://i.pravatar.cc/150?u=${currentAiConfig.id}`} 
                                alt={currentAiConfig.name} 
                                className="w-28 h-28 rounded-full object-cover mb-4"
                            />
                            <h2 className="text-3xl font-bold text-text-main">{currentAiConfig.name}</h2>
                            <p className="mt-2 text-lg text-text-light max-w-xl">{currentAiConfig.description}</p>
                            
                            {currentAiConfig.suggestedQuestions && currentAiConfig.suggestedQuestions.length > 0 && (
                                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-2xl">
                                    {currentAiConfig.suggestedQuestions.map((q, i) => (
                                        <button 
                                            key={i} 
                                            onClick={() => handleSendMessage(undefined, { text: q })}
                                            className="welcome-prompt-card group"
                                        >
                                            <span className="flex-1">{q}</span>
                                            <ChevronDoubleRightIcon className="w-4 h-4 text-text-light transition-transform group-hover:translate-x-1" />
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                        ) : (
                        <div className="chat-messages-list">
                            {messages.map((msg, index) => (
                            <div key={msg.id || index} className={`chat-message-row ${msg.sender}`} onContextMenu={(e) => handleMessageContextMenu(e, msg)}>
                                <div className="chat-message-content">
                                    <div className={`chat-message-bubble ${msg.sender}`}>
                                        {msg.sender === 'ai' && currentAiConfig && (
                                            <div className="ai-message-sender">
                                                <img src={currentAiConfig.avatarUrl} alt={currentAiConfig.name} className="w-6 h-6 rounded-full object-cover" />
                                                <span>{currentAiConfig.name}</span>
                                            </div>
                                        )}
                                        {msg.imageUrl && <img src={msg.imageUrl} alt="Uploaded content" className="rounded-md max-w-full h-auto mb-2"/>}
                                        {isTyping && msg.sender === 'ai' && index === messages.length - 1 && !msg.text 
                                            ? (<div className="typing-indicator"><span></span><span></span><span></span></div>) 
                                            : (<div className="markdown-content"><ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.text}</ReactMarkdown></div>)
                                        }
                                    </div>
                                    {msg.sender === 'ai' && msg.id && msg.text && (!isTyping || index < messages.length - 1) && (
                                        <div className="chat-message-toolbar">
                                            <div className="flex items-center gap-1">
                                                <button onClick={() => handleFeedback(msg.id!, 'liked')} title={t.like} className={`p-1.5 rounded-full text-text-light hover:bg-background-light hover:text-text-main ${feedbackStatus[msg.id!] === 'liked' ? 'text-primary' : ''}`}>
                                                    <ThumbsUpIcon className="w-4 h-4"/>
                                                </button>
                                                <button onClick={() => handleFeedback(msg.id!, 'disliked')} title={t.dislike} className={`p-1.5 rounded-full text-text-light hover:bg-background-light hover:text-text-main ${feedbackStatus[msg.id!] === 'disliked' ? 'text-accent-red' : ''}`}>
                                                    <ThumbsDownIcon className="w-4 h-4"/>
                                                </button>
                                                <button onClick={() => showToast(t.commentNotImplemented, 'info')} title={t.comment} className="p-1.5 rounded-full text-text-light hover:bg-background-light hover:text-text-main">
                                                    <CommentIcon className="w-4 h-4"/>
                                                </button>
                                                <button onClick={() => handleSpeak(msg.text, msg.id!)} title={t.speak} className={`p-1.5 rounded-full text-text-light hover:bg-background-light hover:text-text-main ${speakingMessageId === msg.id! ? 'text-primary animate-pulse' : ''}`}>
                                                    <SpeakerWaveIcon className="w-4 h-4"/>
                                                </button>
                                                <button onClick={() => handleCopy(msg.text)} title={t.copy} className="p-1.5 rounded-full text-text-light hover:bg-background-light hover:text-text-main">
                                                    <CopyIcon className="w-4 h-4"/>
                                                </button>
                                                <button onClick={() => handleDownload(msg.text, msg.id!)} title={t.download} className="p-1.5 rounded-full text-text-light hover:bg-background-light hover:text-text-main">
                                                    <DownloadIcon className="w-4 h-4"/>
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>
                        )}
                    </div>

                    <div className="chat-input-area">
                        <div className="max-w-4xl mx-auto space-y-2">
                            {user && user.coins !== null && (
                                <p className="text-sm text-text-light text-center">{t.remainingCoins} {user.coins}</p>
                            )}
                            <form onSubmit={handleSendMessage} className="relative">
                                {imagePreview && (
                                    <div className="image-preview-container">
                                        <img src={imagePreview} alt="Preview" className="image-preview-thumb" />
                                        <button type="button" onClick={() => setImagePreview(null)} className="image-preview-remove-btn">&times;</button>
                                    </div>
                                )}
                                <div className="chat-input-wrapper">
                                    <button onClick={() => imageInputRef.current?.click()} type="button" disabled={isChatDisabled} className="chat-input-icon-btn"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"></path></svg></button>
                                    <textarea 
                                        ref={textareaRef}
                                        value={newMessage} 
                                        onChange={(e) => setNewMessage(e.target.value)} 
                                        onKeyDown={handleTextareaKeyDown}
                                        placeholder={placeholderText} 
                                        disabled={isChatDisabled} 
                                        className="chat-input-field"
                                        rows={1}
                                        />
                                    <button onClick={handleToggleRecording} type="button" disabled={isChatDisabled} className={`chat-input-icon-btn ${isRecording ? 'text-accent-red' : ''}`}><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" x2="12" y1="19" y2="22"></line></svg></button>
                                    <button onClick={handleToggleLiveChat} type="button" title={t.liveChat} disabled={isChatDisabled && !isLiveActive} className={`chat-input-icon-btn chat-live-btn ${isLiveActive ? 'text-accent-red animate-pulse' : ''}`}><SoundWaveIcon className="w-6 h-6"/></button>
                                    <button type="submit" disabled={isTyping || (!newMessage.trim() && !imagePreview) || isChatDisabled} className="chat-send-btn"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z"></path></svg></button>
                                </div>
                            </form>
                            <input ref={imageInputRef} type="file" className="hidden" accept="image/*" onChange={handleImageSelect}/>
                        </div>
                    </div>
                </>
            ) : (
                <MeditationTimer language={language} />
            )}
        </main>
        {contextMenu && <MessageContextMenu message={contextMenu.message} position={contextMenu.position} onClose={handleCloseContextMenu} onCopy={handleCopy} onDeleteForMe={handleDeleteMessage} language={language} />}
        <PricingModal isOpen={isPricingModalOpen} onClose={() => setIsPricingModalOpen(false)} user={user} onUserUpdate={onUserUpdate} />
        {user && <CryptoPaymentModal isOpen={isCoinPurchaseModalOpen} onClose={() => setIsCoinPurchaseModalOpen(false)} user={user} onPaymentSuccess={onUserUpdate} />}
    </div>
  );
};