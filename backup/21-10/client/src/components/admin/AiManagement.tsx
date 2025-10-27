import React, { useState, useRef, useEffect } from 'react';
import { AIConfig, Message, User, SystemConfig } from '../../types';
import { apiService } from '../../services/apiService';
import { useToast } from '../ToastProvider';
import { CopyIcon } from '../Icons';

declare global {
    interface Window {
        SpeechRecognition: any;
        webkitSpeechRecognition: any;
    }
}


const translations = {
    vi: {
        aiList: 'Danh sách AI',
        newAi: 'AI Mới',
        loading: 'Đang tải cấu hình AI...',
        configuration: 'Cấu hình',
        changeAvatar: 'Đổi Avatar',
        aiName: 'Tên AI',
        aiDescription: 'Mô tả AI',
        provider: 'Nhà cung cấp (Provider)',
        modelSelection: 'Chọn Model',
        loadingModels: 'Đang tải model...',
        selectModel: 'Vui lòng chọn model',
        modelLoadError: 'Lỗi: Không thể tải model',
        addKeyForProvider: 'Vui lòng thêm API key cho {provider} trong Cài đặt.',
        tags: 'Thẻ (Tags)',
        addTagPlaceholder: 'Nhập thẻ mới...',
        addTag: 'Thêm',
        suggestedQuestions: 'Câu hỏi gợi ý',
        addSuggestedQuestionPlaceholder: 'Nhập câu hỏi mới...',
        trainingContent: 'Nội dung huấn luyện (System Prompt)',
        additionalTrainingContent: 'Nội dung huấn luyện thêm',
        attachedFiles: 'File huấn luyện đính kèm',
        attachFile: 'Đính kèm file',
        delete: 'Xóa',
        save: 'Lưu thay đổi',
        saving: 'Đang lưu...',
        testChat: 'Khung chat thử nghiệm',
        chatPlaceholder: 'Chat với AI...',
        selectOrCreate: 'Chọn một AI để xem chi tiết hoặc tạo AI mới.',
        publicAi: 'Công khai AI này',
        publicAiDescription: 'Nếu bật, AI này sẽ hiển thị cho tất cả người dùng.',
        owner: 'Sở hữu',
        readOnly: 'Bạn chỉ có thể xem AI này vì nó không thuộc sở hữu của bạn.',
        confirmDeleteTitle: 'Xác nhận xóa AI',
        confirmDeleteBody: 'Bạn có chắc chắn muốn xóa "{name}" không? Hành động này không thể hoàn tác.',
        cancel: 'Hủy',
        uploading: 'Đang tải lên...',
        micNotSupported: 'Trình duyệt không hỗ trợ nhận dạng giọng nói.',
        startRecording: 'Bắt đầu ghi âm',
        stopRecording: 'Dừng ghi âm',
        suggestedQuestionsLimit: 'Bạn đã đạt giới hạn 4 câu hỏi gợi ý.',
        accountExpiredTitle: 'Tài khoản của bạn đã hết coin.',
        accountExpiredBodyTestChat: 'Vui lòng nạp thêm coin để sử dụng khung chat thử nghiệm.',
        saveSuccess: 'Lưu thay đổi thành công!',
        saveError: 'Lưu thất bại: {message}',
        deleteSuccess: 'Xóa AI thành công!',
        deleteError: 'Xóa thất bại: {message}',
        uploadError: 'Tải file thất bại.',
        trialAllowed: 'Cho phép dùng thử',
        trialAllowedDesc: 'Người dùng có gói Dùng thử có thể thấy AI này.',
        requiresSub: 'Yêu cầu gói',
        requiresSubDesc: 'Chỉ người dùng có gói trả phí mới thấy AI này.',
        noFiles: 'Không có file đính kèm.',
        public: 'Công khai',
        planTrial: 'Dùng thử',
        planPaid: 'Trả phí',
        planFree: 'Miễn phí',
        addToTraining: 'Thêm vào Huấn luyện',
        addedToTraining: 'Đã thêm vào dữ liệu huấn luyện. Nhấn "Lưu thay đổi" để cập nhật AI.',
        apiEndpoint: 'API Endpoint',
        apiEndpointDesc: 'Sử dụng thông tin này để gọi AI từ một ứng dụng khác qua API.',
        method: 'Phương thức',
        endpointUrl: 'URL Endpoint',
        headers: 'Headers',
        bodyPayload: 'Body Payload (JSON)',
        copy: 'Sao chép',
        copied: 'Đã sao chép!',
    },
    en: {
        aiList: 'AI List',
        newAi: 'New AI',
        loading: 'Loading AI configurations...',
        configuration: 'Configuration',
        changeAvatar: 'Change Avatar',
        aiName: 'AI Name',
        aiDescription: 'AI Description',
        provider: 'Provider',
        modelSelection: 'Model Selection',
        loadingModels: 'Loading models...',
        selectModel: 'Please select a model',
        modelLoadError: 'Error: Could not load models',
        addKeyForProvider: 'Please add an API key for {provider} in Settings.',
        tags: 'Tags',
        addTagPlaceholder: 'Enter new tag...',
        addTag: 'Add',
        suggestedQuestions: 'Suggested Questions',
        addSuggestedQuestionPlaceholder: 'Enter new question...',
        trainingContent: 'Training Content (System Prompt)',
        additionalTrainingContent: 'Additional Training Content',
        attachedFiles: 'Attached training files',
        attachFile: 'Attach files',
        delete: 'Delete',
        save: 'Save Changes',
        saving: 'Saving...',
        testChat: 'Test Chat Window',
        chatPlaceholder: 'Chat with AI...',
        selectOrCreate: 'Select an AI to see details or create a new one.',
        publicAi: 'Make this AI Public',
        publicAiDescription: 'If enabled, this AI will be visible to all users.',
        owner: 'Owner',
        readOnly: 'You can only view this AI as you do not own it.',
        confirmDeleteTitle: 'Confirm AI Deletion',
        confirmDeleteBody: 'Are you sure you want to delete "{name}"? This action cannot be undone.',
        cancel: 'Cancel',
        uploading: 'Uploading...',
        micNotSupported: 'Browser does not support speech recognition.',
        startRecording: 'Start recording',
        stopRecording: 'Stop recording',
        suggestedQuestionsLimit: 'You have reached the limit of 4 suggested questions.',
        accountExpiredTitle: 'You are out of coins.',
        accountExpiredBodyTestChat: 'Please top up to use the test chat window.',
        saveSuccess: 'Changes saved successfully!',
        saveError: 'Save failed: {message}',
        deleteSuccess: 'AI deleted successfully!',
        deleteError: 'Delete failed: {message}',
        uploadError: 'File upload failed.',
        trialAllowed: 'Allow for trial',
        trialAllowedDesc: 'Users on a Trial plan can see this AI.',
        requiresSub: 'Requires Subscription',
        requiresSubDesc: 'Only users with a paid plan can see this AI.',
        noFiles: 'No files attached.',
        public: 'Public',
        planTrial: 'Trial',
        planPaid: 'Paid',
        planFree: 'Free',
        addToTraining: 'Add to Training',
        addedToTraining: 'Added to training data. Press "Save Changes" to update the AI.',
        apiEndpoint: 'API Endpoint',
        apiEndpointDesc: 'Use this information to call the AI from another application via API.',
        method: 'Method',
        endpointUrl: 'Endpoint URL',
        headers: 'Headers',
        bodyPayload: 'Body Payload (JSON)',
        copy: 'Copy',
        copied: 'Copied!',
    }
};


const AiManagement: React.FC<{ language: 'vi' | 'en', user: User }> = ({ language, user }) => {
    const [aiList, setAiList] = useState<AIConfig[]>([]);
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [systemConfig, setSystemConfig] = useState<SystemConfig | null>(null);
    const [selectedAi, setSelectedAi] = useState<AIConfig | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [tagInput, setTagInput] = useState('');
    const [suggestedQuestionInput, setSuggestedQuestionInput] = useState('');

    const [availableModels, setAvailableModels] = useState<string[]>([]);
    const [isModelsLoading, setIsModelsLoading] = useState(false);
    const [modelsError, setModelsError] = useState<string | null>(null);

    const [isRecording, setIsRecording] = useState(false);
    const recognitionRef = useRef<any>(null);
    const textBeforeRecording = useRef('');

    const avatarInputRef = useRef<HTMLInputElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { showToast } = useToast();
    const t = translations[language];
    const isOwner = selectedAi?.ownerId === user.id;
    const canEdit = user.isAdmin || isOwner;
    const canAddSuggestedQuestion = canEdit && selectedAi != null && selectedAi.suggestedQuestions.length < 4;
    
    const hasActiveSubscription = user?.subscriptionExpiresAt ? new Date(user.subscriptionExpiresAt) > new Date() : false;
    const isUserAccountExpired = user ? (user.coins !== null && user.coins <= 0 && !hasActiveSubscription) : false;

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Admins see all AIs, regular users see only their own.
                const [configs, users, sysConfig] = await Promise.all([
                    apiService.getManageableAiConfigs(user),
                    apiService.getAllUsers(),
                    apiService.getSystemConfig()
                ]);

                setAiList(configs);
                setAllUsers(users);
                setSystemConfig(sysConfig);
                if (configs.length > 0) {
                    setSelectedAi(configs[0]);
                }
            } catch (error) {
                console.error("Lỗi khi tải dữ liệu:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [user]);

    useEffect(() => {
        if (!selectedAi) return;

        const provider = selectedAi.modelType;
        setModelsError(null);
        setIsModelsLoading(false);
        setAvailableModels([]);

        if (provider === 'gemini') {
            setAvailableModels(['gemini-2.5-flash', 'gemini-2.5-pro']);
        } else if (provider === 'grok') {
            setAvailableModels(['grok-1-mock']);
        } else if (provider === 'gpt') {
            const fetchGptModels = async () => {
                const hasUserKey = !!user.apiKeys?.gpt;
                const hasSystemKey = !!systemConfig?.systemKeys?.gpt;

                if (!hasUserKey && !hasSystemKey) {
                    setModelsError(t.addKeyForProvider.replace('{provider}', 'GPT'));
                    if (selectedAi.modelName !== '') setSelectedAi(prev => prev ? { ...prev, modelName: '' } : null);
                    return;
                }

                setIsModelsLoading(true);
                try {
                    if (typeof user.id !== 'number') throw new Error("Invalid user ID.");
                    const models = await apiService.getAvailableModels('gpt', user.id);
                    setAvailableModels(models);
                } catch (error: any) {
                    setModelsError(error.message || t.modelLoadError);
                } finally {
                    setIsModelsLoading(false);
                }
            };
            fetchGptModels();
        }
    }, [selectedAi?.id, selectedAi?.modelType, user.apiKeys, systemConfig, language, user.id]);

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


    const handleSelectAi = (ai: AIConfig) => {
        setSelectedAi(ai);
        setMessages([]);
    };

    const handleAddNewAi = () => {
        const newAi: AIConfig = {
            id: `ai-${Date.now()}`,
            name: t.newAi,
            description: "",
            trainingContent: "",
            additionalTrainingContent: "",
            suggestedQuestions: [],
            tags: [],
            modelType: 'gemini',
            modelName: 'gemini-2.5-flash',
            ownerId: user.id as number,
            isPublic: false,
            trainingFileUrls: [],
            isTrialAllowed: false,
            requiresSubscription: false,
        };
        setAiList([...aiList, newAi]);
        setSelectedAi(newAi);
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        if (!selectedAi || !canEdit) return;
        const { name, value, type } = e.target;
        const isCheckbox = type === 'checkbox';
        const checkedValue = (e.target as HTMLInputElement).checked;
        const updatedValue = isCheckbox ? checkedValue : value;

        const updatedAi = { ...selectedAi, [name]: updatedValue };
        if (name === 'modelType') updatedAi.modelName = '';
        setSelectedAi(updatedAi);
    };

    const handleSaveChanges = async () => {
        if (!selectedAi || !canEdit) return;
        setIsSaving(true);
        try {
            let savedAi;
            const isNew = typeof selectedAi.id === 'string' && selectedAi.id.startsWith('ai-');
            if (isNew) {
                const { id, ...payload } = selectedAi;
                savedAi = await apiService.createAiConfig(payload);
            } else {
                savedAi = await apiService.updateAiConfig(selectedAi);
            }

            setAiList(prevList => {
                const list = isNew ? [...prevList.filter(ai => ai.id !== selectedAi.id), savedAi] : prevList.map(ai => ai.id === savedAi.id ? savedAi : ai);
                return list;
            });
            setSelectedAi(savedAi);
            showToast(t.saveSuccess);
        } catch (error) {
            showToast(t.saveError.replace('{message}', (error as Error).message), 'error');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteAi = async () => {
        if (!selectedAi || !canEdit || typeof selectedAi.id !== 'number') return;
        if (window.confirm(t.confirmDeleteBody.replace('{name}', selectedAi.name))) {
            try {
                await apiService.deleteAiConfig(selectedAi.id);
                const newList = aiList.filter(ai => ai.id !== selectedAi.id);
                setAiList(newList);
                setSelectedAi(newList.length > 0 ? newList[0] : null);
                showToast(t.deleteSuccess);
            } catch (error) {
                showToast(t.deleteError.replace('{message}', (error as Error).message), 'error');
            }
        }
    };

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedAi || isUserAccountExpired) return;
        const userMessage: Message = { id: `msg-${Date.now()}`, text: newMessage, sender: 'user', timestamp: Date.now() };
        const updatedMessages = [...messages, userMessage];
        setMessages(updatedMessages);
        setNewMessage('');
        setIsTyping(true);
        let streamBuffer = '';
        const aiMessageId = `ai-${Date.now()}`;
        setMessages(prev => [...prev, { id: aiMessageId, text: '', sender: 'ai', timestamp: Date.now() }]);
        await apiService.sendMessageStream(selectedAi, updatedMessages, user, null, {
            onChunk: (chunk) => {
                streamBuffer += chunk;
                setMessages(prev => prev.map(msg => msg.id === aiMessageId ? { ...msg, text: streamBuffer } : msg));
            },
            onEnd: () => setIsTyping(false),
            onError: (errorMsg) => {
                setMessages(prev => prev.map(msg => msg.id === aiMessageId ? { ...msg, text: `Lỗi: ${errorMsg}` } : msg));
                setIsTyping(false);
            }
        });
    };

    const handleAddToTraining = (aiMessageIndex: number) => {
        if (aiMessageIndex > 0 && messages[aiMessageIndex - 1].sender === 'user') {
            const question = messages[aiMessageIndex - 1].text;
            const answer = messages[aiMessageIndex].text;
            const trainingText = `\n\nHỏi: ${question}\nĐáp: ${answer}`;
            
            setSelectedAi(prev => {
                if (!prev) return null;
                return {
                    ...prev,
                    additionalTrainingContent: (prev.additionalTrainingContent || '') + trainingText
                };
            });
            
            showToast(t.addedToTraining, 'info');
        }
    };

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0] && selectedAi && canEdit) {
            const reader = new FileReader();
            reader.onloadend = () => setSelectedAi(prev => prev ? { ...prev, avatarUrl: reader.result as string } : null);
            reader.readAsDataURL(e.target.files[0]);
        }
    };
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || !selectedAi || !canEdit) return;
        const formData = new FormData();
        // FIX: The original Array.from().forEach() was causing a type inference issue.
        // A standard for-loop ensures that `file` is correctly typed as a File object.
        for (let i = 0; i < e.target.files.length; i++) {
            const file = e.target.files.item(i);
            if (file) {
                 formData.append('trainingFiles', file);
            }
        }
        setIsUploading(true);
        try {
            const { filePaths } = await apiService.uploadFiles(formData);
            setSelectedAi(prev => prev ? { ...prev, trainingFileUrls: [...(prev.trainingFileUrls || []), ...filePaths] } : null);
        } catch (error) { showToast(t.uploadError, 'error'); } finally { setIsUploading(false); }
    };
    const handleRemoveFile = (url: string) => setSelectedAi(prev => prev ? { ...prev, trainingFileUrls: prev.trainingFileUrls?.filter(u => u !== url) } : null);
    const handleAddTag = () => { if (!selectedAi || !canEdit || !tagInput.trim()) return; setSelectedAi(prev => prev ? { ...prev, tags: [...prev.tags, tagInput.trim()] } : null); setTagInput(''); };
    const handleRemoveTag = (tag: string) => setSelectedAi(prev => prev ? { ...prev, tags: prev.tags.filter(t => t !== tag) } : null);
    const handleAddSuggestedQuestion = () => { if (!canAddSuggestedQuestion || !suggestedQuestionInput.trim() || !selectedAi) return; setSelectedAi(prev => prev ? { ...prev, suggestedQuestions: [...prev.suggestedQuestions, suggestedQuestionInput.trim()] } : null); setSuggestedQuestionInput(''); };
    const handleRemoveSuggestedQuestion = (q: string) => setSelectedAi(prev => prev ? { ...prev, suggestedQuestions: prev.suggestedQuestions.filter(sq => sq !== q) } : null);
    const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => { if (e.key === 'Enter') { e.preventDefault(); handleAddTag(); } };
    const handleSuggestedQuestionInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => { if (e.key === 'Enter') { e.preventDefault(); handleAddSuggestedQuestion(); } };
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
    const getOwnerName = (ownerId: number) => allUsers.find(u => u.id === ownerId)?.name || 'Không rõ';

    const inputClasses = "mt-1 block w-full px-3 py-2 bg-background-panel border border-border-color rounded-md shadow-sm focus:ring-primary focus:border-primary disabled:bg-background-light h-10";
    const textareaClasses = "mt-1 block w-full px-3 py-2 bg-background-panel border border-border-color rounded-md shadow-sm disabled:bg-background-light";


    if (isLoading) return <div className="flex items-center justify-center h-full">{t.loading}</div>

    return (
        <div className="flex h-full">
            <div className="w-80 bg-background-panel border-r border-border-color flex flex-col">
                <div className="p-4 border-b flex justify-between items-center h-[73px]">
                    <h2 className="text-lg font-semibold">{t.aiList}</h2>
                    <button onClick={handleAddNewAi} className="px-3 py-1.5 text-sm font-medium text-text-on-primary bg-primary rounded-md hover:bg-primary-hover">+</button>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {aiList.sort((a, b) => a.name.localeCompare(b.name)).map(ai => (
                        <div key={ai.id} onClick={() => handleSelectAi(ai)} className={`flex items-start p-3 cursor-pointer hover:bg-background-light border-b border-border-color ${selectedAi?.id === ai.id ? 'bg-primary-light' : ''}`}>
                            <img src={ai.avatarUrl || 'https://i.pravatar.cc/150?u=' + ai.id} alt={ai.name} className="w-10 h-10 rounded-full mr-3 flex-shrink-0" />
                            <div className="flex-grow overflow-hidden">
                                <p className="font-semibold truncate">{ai.name}</p>
                                <div className="flex flex-wrap items-center gap-1.5 mt-1">
                                    {ai.isPublic && <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">{t.public}</span>}
                                    {ai.isTrialAllowed && <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">{t.planTrial}</span>}
                                    {ai.requiresSubscription && <span className="text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">{t.planPaid}</span>}
                                    {!ai.isTrialAllowed && !ai.requiresSubscription && <span className="text-xs bg-gray-100 text-gray-800 px-2 py-0.5 rounded-full">{t.planFree}</span>}
                                    {ai.tags && ai.tags.map(tag => (
                                        <span key={tag} className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">{tag}</span>
                                    ))}
                                </div>
                                {user.isAdmin && <p className="text-xs text-gray-400 mt-1.5 truncate">{t.owner}: {getOwnerName(ai.ownerId)}</p>}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {selectedAi ? (
                <div className="flex-1 flex">
                    <div className="w-3/5 p-6 border-r border-border-color overflow-y-auto relative flex flex-col">
                        {!canEdit && <div className="absolute inset-0 bg-white/70 backdrop-blur-sm z-10 flex items-center justify-center"><p className="p-4 bg-yellow-100 text-yellow-800 rounded-lg border border-yellow-200">{t.readOnly}</p></div>}
                        <div className="flex-grow space-y-4">
                            <div className="flex items-start space-x-6 pb-4 border-b border-border-color">
                                <div className="flex-shrink-0 flex flex-col items-center space-y-2">
                                    <img src={selectedAi.avatarUrl || 'https://i.pravatar.cc/150?u=' + selectedAi.id} alt="Avatar" className="w-24 h-24 rounded-full object-cover bg-background-light" />
                                    <button onClick={() => avatarInputRef.current?.click()} disabled={!canEdit} className="px-4 py-2 text-sm font-medium text-text-main bg-background-panel border border-border-color rounded-md shadow-sm hover:bg-background-light disabled:opacity-50">{t.changeAvatar}</button>
                                    <input type="file" ref={avatarInputRef} onChange={handleAvatarChange} className="hidden" accept="image/*" />
                                </div>
                                <div className="flex-grow space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-text-main">{t.aiName}</label>
                                        <input type="text" name="name" value={selectedAi.name} onChange={handleInputChange} disabled={!canEdit} className={inputClasses} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-text-main">{t.aiDescription}</label>
                                        <input name="description" value={selectedAi.description || ''} onChange={handleInputChange} disabled={!canEdit} className={inputClasses} />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-text-main">{t.provider}</label>
                                    <select name="modelType" value={selectedAi.modelType} onChange={handleInputChange} disabled={!canEdit} className={inputClasses}>
                                        <option value="gemini">Gemini</option><option value="gpt">GPT</option><option value="grok">Grok</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-text-main">{t.modelSelection}</label>
                                    <select name="modelName" value={selectedAi.modelName || ''} onChange={handleInputChange} disabled={!canEdit || isModelsLoading || !!modelsError} className={inputClasses}>
                                        {isModelsLoading ? <option>{t.loadingModels}</option> : modelsError ? <option>{modelsError}</option> : <> <option value="">{t.selectModel}</option> {availableModels.map(model => <option key={model} value={model}>{model}</option>)}</>}
                                    </select>
                                    {modelsError && <p className="text-xs text-accent-red mt-1">{modelsError}</p>}
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-main">{t.trainingContent}</label>
                                <textarea name="trainingContent" value={selectedAi.trainingContent} onChange={handleInputChange} disabled={!canEdit} rows={8} className={textareaClasses} />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-text-main">{t.additionalTrainingContent}</label>
                                <textarea name="additionalTrainingContent" value={selectedAi.additionalTrainingContent || ''} onChange={handleInputChange} disabled={!canEdit} rows={4} className={textareaClasses} />
                            </div>
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-text-main">{t.suggestedQuestions}</label>
                                    <div className="mt-1 flex rounded-md shadow-sm">
                                        <input type="text" value={suggestedQuestionInput} onChange={(e) => setSuggestedQuestionInput(e.target.value)} onKeyDown={handleSuggestedQuestionInputKeyDown} placeholder={t.addSuggestedQuestionPlaceholder} disabled={!canAddSuggestedQuestion} className="flex-1 block w-full min-w-0 rounded-none rounded-l-md px-3 py-2 bg-background-panel border-border-color focus:ring-primary focus:border-primary disabled:bg-background-light" />
                                        <button type="button" onClick={handleAddSuggestedQuestion} disabled={!canAddSuggestedQuestion} className="-ml-px relative inline-flex items-center space-x-2 px-4 py-2 border border-border-color text-sm font-medium rounded-r-md text-text-main bg-background-light hover:bg-background-light/80 disabled:bg-gray-200">{t.addTag}</button>
                                    </div>
                                    {!canAddSuggestedQuestion && <p className="text-xs text-accent-red mt-1">{t.suggestedQuestionsLimit}</p>}
                                    <div className="mt-2 space-y-2">
                                        {selectedAi.suggestedQuestions.map((q, i) => (
                                            <div key={i} className="flex items-center text-sm">
                                                <p className="flex-1 p-2 bg-background-light rounded-md text-text-main">{q}</p>
                                                {canEdit && <button onClick={() => handleRemoveSuggestedQuestion(q)} className="ml-2 text-text-light hover:text-accent-red">&times;</button>}
                                            </div>
                                        ))}
                                    </div>
                                    <br></br>
                                     <div className="">
                                    <div className="border border-border-color rounded-lg p-3 h-full flex flex-col">
                                        <div className="flex justify-between items-center mb-2 flex-shrink-0">
                                            <label className="block text-sm font-medium text-text-main">{t.attachedFiles}</label>
                                            <input type="file" ref={fileInputRef} onChange={handleFileChange} multiple className="hidden" />
                                            <button type="button" onClick={() => fileInputRef.current?.click()} disabled={isUploading || !canEdit} className="p-1.5 rounded-md hover:bg-background-light text-text-light transition-colors disabled:opacity-50" title={t.attachFile}>
                                                {isUploading ? (
                                                    <div className="w-5 h-5 border-2 border-dashed rounded-full animate-spin border-primary"></div>
                                                ) : (
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                                    </svg>
                                                )}
                                            </button>
                                        </div>
                                        <div className="flex-grow min-h-0 overflow-y-auto space-y-2 pr-1">
                                            {selectedAi.trainingFileUrls && selectedAi.trainingFileUrls.length > 0 ? (
                                                selectedAi.trainingFileUrls.map((url, i) => (
                                                    <div key={i} className="flex justify-between items-center bg-background-light p-2 rounded-md text-sm">
                                                        <a href={url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline truncate flex-1" title={url.split('/').pop()}>
                                                            {url.split('/').pop()}
                                                        </a>
                                                        {canEdit && <button onClick={() => handleRemoveFile(url)} className="ml-2 text-accent-red hover:text-accent-red-hover flex-shrink-0 text-lg leading-none">&times;</button>}
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="flex items-center justify-center h-full">
                                                    <p className="text-xs text-center text-text-light">{t.noFiles}</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-text-main">{t.tags}</label>
                                    <div className="mt-1 flex rounded-md shadow-sm">
                                        <input type="text" value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={handleTagInputKeyDown} placeholder={t.addTagPlaceholder} className="flex-1 block w-full min-w-0 rounded-none rounded-l-md px-3 py-2 bg-background-panel border-border-color focus:ring-primary focus:border-primary" disabled={!canEdit} />
                                        <button type="button" onClick={handleAddTag} disabled={!canEdit} className="-ml-px relative inline-flex items-center space-x-2 px-4 py-2 border border-border-color text-sm font-medium rounded-r-md text-text-main bg-background-light hover:bg-background-light/80 disabled:bg-gray-200">{t.addTag}</button>
                                    </div>
                                    <div className="mt-2 flex flex-wrap gap-2">
                                        {selectedAi.tags.map((tag, i) => (
                                            <span key={i} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-light text-primary-text">
                                                {tag}
                                                {canEdit && <button onClick={() => handleRemoveTag(tag)} className="ml-1.5 flex-shrink-0 text-primary hover:text-primary-hover"> &times; </button>}
                                            </span>
                                        ))}
                                    </div>
                                    <br></br>
                                    <div>
                                        <label className="flex items-center"><input type="checkbox" name="isTrialAllowed" checked={selectedAi.isTrialAllowed} onChange={handleInputChange} disabled={!canEdit} className="w-4 h-4 text-primary bg-background-panel border-border-color rounded focus:ring-primary" /><span className="ml-3 text-sm font-medium text-text-main">{t.trialAllowed}</span></label>
                                        <p className="text-xs text-text-light ml-7">{t.trialAllowedDesc}</p>
                                    </div>
                                    <br></br>
                                    <div>
                                        <label className="flex items-center"><input type="checkbox" name="requiresSubscription" checked={selectedAi.requiresSubscription} onChange={handleInputChange} disabled={!canEdit} className="w-4 h-4 text-primary bg-background-panel border-border-color rounded focus:ring-primary" /><span className="ml-3 text-sm font-medium text-text-main">{t.requiresSub}</span></label>
                                        <p className="text-xs text-text-light ml-7">{t.requiresSubDesc}</p>
                                    </div>
                                    <br></br>
                                    <div>
                                        {user.isAdmin && (
                                            <div className="mb-4">
                                                <label className="flex items-center"><input type="checkbox" name="isPublic" checked={selectedAi.isPublic} onChange={handleInputChange} className="w-4 h-4 text-primary bg-background-panel border-border-color rounded focus:ring-primary" /><span className="ml-3 text-sm font-medium text-text-main">{t.publicAi}</span></label>
                                                <p className="text-xs text-text-light ml-7">{t.publicAiDescription}</p>
                                            </div>
                                        )}
                                    </div>                                  
                                     <div className="flex justify-end space-x-3">
                                            <button onClick={handleDeleteAi} disabled={!canEdit || isSaving || typeof selectedAi.id !== 'number'} className="px-4 py-2 text-sm font-medium text-text-on-primary bg-accent-red rounded-md hover:bg-accent-red-hover disabled:opacity-50">{t.delete}</button>
                                            <button onClick={handleSaveChanges} disabled={!canEdit || isSaving} className="px-4 py-2 text-sm font-medium text-text-on-primary bg-primary rounded-md hover:bg-primary-hover disabled:opacity-50">{isSaving ? t.saving : t.save}</button>
                                        </div>
                                </div>
                            </div>                          
                        </div>
                    </div>
                    <div className="w-2/5 flex flex-col bg-background-light h-full">
                        <h3 className="p-4 border-b border-border-color font-semibold text-center h-[73px] flex items-center justify-center flex-shrink-0">{t.testChat}</h3>
                        <div className="flex-1 flex flex-col overflow-hidden">
                            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                                {messages.map((msg, index) => (
                                    <div key={msg.id} className={`group flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                                        <div className={`max-w-md px-4 py-2 rounded-xl ${msg.sender === 'user' ? 'bg-primary text-text-on-primary' : 'bg-background-panel shadow-sm'}`}>
                                            {msg.text}
                                        </div>
                                        {msg.sender === 'ai' && canEdit && (
                                            <button 
                                                onClick={() => handleAddToTraining(index)}
                                                title={t.addToTraining}
                                                className="mt-1.5 px-2 py-1 text-xs bg-gray-200 text-gray-600 rounded-md hover:bg-primary hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                {t.addToTraining}
                                            </button>
                                        )}
                                    </div>
                                ))}
                                {isTyping && <div className="flex justify-start"><div className="px-4 py-2 rounded-xl bg-background-panel shadow-sm typing-indicator"><span></span><span></span><span></span></div></div>}
                            </div>
                            <div className="flex-shrink-0 bg-background-panel border-t border-border-color">
                                <div className="p-4">
                                    {isUserAccountExpired ? (
                                        <div className="text-center p-4 bg-red-50 border border-red-200 rounded-lg"><p className="text-sm text-red-700">{t.accountExpiredBodyTestChat}</p></div>
                                    ) : (
                                        <form onSubmit={handleSendMessage} className="flex items-center space-x-2">
                                            <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder={t.chatPlaceholder} className="flex-1 w-full px-4 py-2 bg-white border border-border-color rounded-full" />
                                            <button type="button" onClick={handleToggleRecording} className={`p-2 text-text-light rounded-full hover:bg-background-light ${isRecording ? 'text-accent-red' : ''}`} title={isRecording ? t.stopRecording : t.startRecording}>
                                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 14c1.66 0 2.99-1.34 2.99-3L15 5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3zm5.3-3c0 3-2.54 5.1-5.3 5.1S6.7 14 6.7 11H5c0 3.41 2.72 6.23 6 6.72V21h2v-3.28c3.28-.49 6-3.31 6-6.72h-1.7z" /></svg>
                                            </button>
                                            <button type="submit" className="p-2 bg-primary text-text-on-primary rounded-full hover:bg-primary-hover disabled:opacity-50">
                                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" /></svg>
                                            </button>
                                        </form>
                                    )}
                                </div>
                                {selectedAi && typeof selectedAi.id === 'number' && (
                                    <div className="p-4 border-t border-border-color">
                                        <h4 className="font-semibold text-text-main">{t.apiEndpoint}</h4>
                                        <p className="text-xs text-text-light mb-4">{t.apiEndpointDesc}</p>
                                        <div className="space-y-3 text-sm">
                                            <div>
                                                <label className="font-medium text-xs uppercase text-text-light">{t.method}</label>
                                                <div className="mt-1 p-2 bg-background-light rounded font-mono text-xs border border-border-color">POST</div>
                                            </div>
                                            <div>
                                                <label className="font-medium text-xs uppercase text-text-light">{t.endpointUrl}</label>
                                                <div className="mt-1 flex items-center">
                                                    <input 
                                                        readOnly 
                                                        value={`${window.location.origin}/api/chat/stream`} 
                                                        className="flex-1 w-full p-2 bg-background-light rounded-l font-mono text-xs border border-r-0 border-border-color focus:outline-none" 
                                                    />
                                                    <button 
                                                        onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/api/chat/stream`); showToast(t.copied, 'info'); }}
                                                        className="p-2 bg-gray-200 hover:bg-gray-300 rounded-r border border-l-0 border-border-color"
                                                        title={t.copy}
                                                    >
                                                        <CopyIcon className="w-4 h-4 text-gray-600" />
                                                    </button>
                                                </div>
                                            </div>
                                            <div>
                                                <label className="font-medium text-xs uppercase text-text-light">{t.headers}</label>
                                                <pre className="mt-1 p-2 bg-background-light rounded font-mono text-xs overflow-x-auto border border-border-color">
                                                    <code>{'Content-Type: application/json'}</code>
                                                </pre>
                                            </div>
                                            <div>
                                                <label className="font-medium text-xs uppercase text-text-light">{t.bodyPayload}</label>
                                                <pre className="mt-1 p-2 bg-background-light rounded font-mono text-xs overflow-x-auto border border-border-color">
                                                    <code>
{`{
  "aiConfigId": ${selectedAi.id},
  "messages": [
    { "sender": "user", "text": "Your message here..." }
  ]
}`}
                                                    </code>
                                                </pre>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                </div>
            ) : (
                <div className="flex-1 flex items-center justify-center text-text-light"><p>{t.selectOrCreate}</p></div>
            )}
        </div>
    );
};

export default AiManagement;