
// client/src/components/admin/FilesAndDocuments.tsx
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { PencilIcon, TrashIcon, EyeIcon, PlusIcon, GenerateIcon, SpinnerIcon, BoldIcon, ItalicIcon, UnderlineIcon, ListOrderedIcon, ListIcon, AlignLeftIcon, AlignCenterIcon, AlignRightIcon, PaperclipIcon, SoundWaveIcon, SettingsIcon, ThumbsUpIcon, BookOpenIcon } from '../Icons';
import { useToast } from '../ToastProvider';
import { apiService } from '../../services/apiService';
import { Document, DocumentAuthor, DocumentType, DocumentTopic, Tag, User, ModelType, DocumentConfig, Space } from '../../types';

// Translations
const translations = {
    vi: {
        title: 'Tệp & Tài liệu',
        subtitle: 'Quản lý tài liệu, kinh sách và nội dung.',
        newDocument: 'Tạo tài liệu',
        configure: 'Cấu hình',
        // Table Headers
        stt: 'STT',
        titleHeader: 'Tiêu đề',
        summary: 'Tóm tắt',
        author: 'Tác giả',
        type: 'Loại',
        topic: 'Chủ đề',
        space: 'Không gian',
        tags: 'Thẻ',
        createdAt: 'Ngày tạo',
        thumbnail: 'Ảnh bìa',
        actions: 'Hành động',
        // Pagination
        showing: 'Hiển thị',
        to: 'tới',
        of: 'trên',
        prev: 'Trước',
        next: 'Sau',
        page: 'Trang',
        // Actions
        edit: 'Sửa',
        delete: 'Xóa',
        preview: 'Xem trước',
        // Dialog
        dialogEditTitle: 'Chỉnh sửa Tài liệu',
        dialogCreateTitle: 'Tạo Tài liệu mới',
        dialogContentLabel: 'Nội dung (VI)',
        dialogContentLabelEn: 'Nội dung (EN)',
        dialogContentPlaceholder: 'Nhập nội dung chi tiết...',
        uploadThumbnail: 'Tải lên ảnh bìa',
        changeImage: 'Đổi ảnh',
        uploadAudio: 'Tải lên âm thanh (VI)',
        uploadAudioEn: 'Tải lên âm thanh (EN)',
        save: 'Lưu thay đổi',
        saveAndContinue: 'Lưu & Nhập tiếp',
        saving: 'Đang lưu...',
        cancel: 'Hủy',
        titleEn: 'Tiêu đề (EN)',
        summaryEn: 'Tóm tắt (EN)',
        addTagPlaceholder: 'Thêm thẻ và nhấn Enter...',
        generate: 'Dịch tự động',
        generating: 'Đang dịch...',
        generateError: 'Dịch tự động thất bại.',
        generateInstruction: 'Một trong hai ô phải trống để dịch.',
        // Preview Dialog
        previewTitle: 'Xem trước tài liệu',
        close: 'Đóng',
        // Feedback
        loading: 'Đang tải tài liệu...',
        noDocuments: 'Không tìm thấy tài liệu nào khớp với bộ lọc.',
        fetchError: 'Không thể tải danh sách tài liệu.',
        saveSuccess: 'Lưu thông tin tài liệu thành công!',
        saveError: 'Lưu tài liệu thất bại: {message}',
        deleteConfirm: 'Bạn có chắc chắn muốn xóa tài liệu "{name}" không?',
        deleteSuccess: 'Xóa tài liệu thành công!',
        deleteError: 'Xóa tài liệu thất bại: {message}',
        errorThumbnailRequired: 'Vui lòng cung cấp ảnh bìa cho tài liệu.',
        // Category Management
        manageCategoryTitle: 'Quản lý {category}',
        addItem: 'Thêm mới',
        updateItem: 'Cập nhật',
        deleteItemConfirm: 'Bạn có chắc chắn muốn xóa "{name}" không?',
        deleteCategoryError: 'Xóa thất bại: {message}',
        filterAll: 'Tất cả',
        filterByTitle: 'Lọc theo tiêu đề...',
        filterByTopicName: 'Lọc theo tên chủ đề...',
        selectPlaceholder: '--Chọn--',
        globalSpace: 'Không gian chung',
        nameLabel: 'Tên (VI)',
        nameEnLabel: 'Tên (EN)',
        // Editor
        attachFile: 'Đính kèm tệp & trích xuất nội dung',
        extracting: 'Đang trích xuất nội dung...',
        extractError: 'Trích xuất nội dung thất bại: {message}',
        tabVi: 'Tiếng Việt',
        tabEn: 'English',
        generateAudio: 'Tạo Âm Thanh',
        generatingAudio: 'Đang tạo...',
        ttsError: 'Nội dung và cấu hình TTS không được để trống.',
        ttsSuccess: 'Tạo âm thanh thành công!',
        ttsFailure: 'Tạo âm thanh thất bại: {message}',
        // Document Config Modal
        configTitle: 'Cấu hình Dịch & Âm thanh',
        translationConfig: 'Cấu hình Dịch Thuật',
        ttsConfig: 'Cấu hình Text-to-Speech',
        translationProvider: 'Nhà cung cấp Dịch',
        translationModel: 'Model Dịch',
        ttsProvider: 'Nhà cung cấp TTS',
        ttsModel: 'Model TTS',
        ttsVoice: 'Giọng đọc',
        modelLoading: 'Đang tải model...',
        rating: 'Đánh giá',
        uploading: 'Đang tải lên...',
    },
    en: {
        title: 'Files & Documents',
        subtitle: 'Manage documents, scriptures, and content.',
        newDocument: 'New Document',
        configure: 'Configure',
        // Table Headers
        stt: 'No.',
        titleHeader: 'Title',
        summary: 'Summary',
        author: 'Author',
        type: 'Type',
        topic: 'Topic',
        space: 'Space',
        tags: 'Tags',
        createdAt: 'Created At',
        thumbnail: 'Thumbnail',
        actions: 'Actions',
        // Pagination
        showing: 'Showing',
        to: 'to',
        of: 'of',
        prev: 'Previous',
        next: 'Next',
        page: 'Page',
        // Actions
        edit: 'Edit',
        delete: 'Delete',
        preview: 'Preview',
        // Dialog
        dialogEditTitle: 'Edit Document',
        dialogCreateTitle: 'Create New Document',
        dialogContentLabel: 'Content (VI)',
        dialogContentLabelEn: 'Content (EN)',
        dialogContentPlaceholder: 'Enter detailed content...',
        uploadThumbnail: 'Upload Thumbnail',
        changeImage: 'Change Image',
        uploadAudio: 'Upload Audio (VI)',
        uploadAudioEn: 'Upload Audio (EN)',
        save: 'Save Changes',
        saveAndContinue: 'Save & Add New',
        saving: 'Saving...',
        cancel: 'Cancel',
        titleEn: 'Title (EN)',
        summaryEn: 'Summary (EN)',
        addTagPlaceholder: 'Add a tag and press Enter...',
        generate: 'Auto-translate',
        generating: 'Translating...',
        generateError: 'Auto-translation failed.',
        generateInstruction: 'One of the two fields must be empty to translate.',
        // Preview Dialog
        previewTitle: 'Document Preview',
        close: 'Close',
        // Feedback
        loading: 'Loading documents...',
        noDocuments: 'No documents found matching the filters.',
        fetchError: 'Failed to load documents.',
        saveSuccess: 'Document info saved successfully!',
        saveError: 'Failed to save document: {message}',
        deleteSuccess: 'Document deleted successfully!',
        deleteError: 'Failed to delete document: {message}',
        errorThumbnailRequired: 'Please upload a thumbnail for the document.',
        // Category Management
        manageCategoryTitle: 'Manage {category}',
        addItem: 'Add New',
        updateItem: 'Update',
        deleteItemConfirm: 'Are you sure you want to delete "{name}"?',
        deleteCategoryError: 'Delete failed: {message}',
        filterAll: 'All',
        filterByTitle: 'Filter by title...',
        filterByTopicName: 'Filter by topic name...',
        selectPlaceholder: '--Select--',
        globalSpace: 'Global Space',
        nameLabel: 'Name (VI)',
        nameEnLabel: 'Name (EN)',
        // Editor
        attachFile: 'Attach file & extract content',
        extracting: 'Extracting content...',
        extractError: 'Content extraction failed: {message}',
        tabVi: 'Vietnamese',
        tabEn: 'English',
        generateAudio: 'Generate Audio',
        generatingAudio: 'Generating...',
        ttsError: 'Content and TTS configuration must not be empty.',
        ttsSuccess: 'Audio generated successfully!',
        ttsFailure: 'Audio generation failed: {message}',
        // Document Config Modal
        configTitle: 'Translation & Audio Configuration',
        translationConfig: 'Translation Configuration',
        ttsConfig: 'Text-to-Speech Configuration',
        translationProvider: 'Translation Provider',
        translationModel: 'Translation Model',
        ttsProvider: 'TTS Provider',
        ttsModel: 'TTS Model',
        ttsVoice: 'Voice',
        modelLoading: 'Loading models...',
        rating: 'Rating',
        uploading: 'Uploading...',
    }
};

type Category = 'documentAuthor' | 'type' | 'documentTopic';
type Filters = {
    title: string;
    authorId: string;
    typeId: string;
    topicId: string;
    tagId: string;
    spaceId: string;
};

const GEMINI_TTS_VOICES = ['Kore', 'Puck', 'Charon', 'Fenrir', 'Zephyr'];
const GPT_TTS_MODELS = ['tts-1', 'tts-1-hd'];
const GPT_TTS_VOICES = ['alloy', 'echo', 'fable', 'nova', 'onyx', 'shimmer'];

// A helper function to strip HTML tags from a string
const stripHtml = (html: string) => {
    if (!html) return "";
    const tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
};

// Helper function to decode base64
const decode = (base64: string): Uint8Array => {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
};

// Helper function to convert raw PCM data to a WAV blob
function pcmToWav(pcmData: Uint8Array, numChannels: number, sampleRate: number, bitsPerSample: number): Blob {
    const dataSize = pcmData.length;
    const buffer = new ArrayBuffer(44 + dataSize);
    const view = new DataView(buffer);

    const writeString = (offset: number, str: string) => {
        for (let i = 0; i < str.length; i++) {
            view.setUint8(offset + i, str.charCodeAt(i));
        }
    };

    // RIFF header
    writeString(0, 'RIFF');
    view.setUint32(4, 36 + dataSize, true); // chunkSize
    writeString(8, 'WAVE');

    // fmt chunk
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true); // subchunk1Size (16 for PCM)
    view.setUint16(20, 1, true); // audioFormat (1 for PCM)
    view.setUint16(22, numChannels, true); // numChannels
    view.setUint32(24, sampleRate, true); // sampleRate
    const byteRate = sampleRate * numChannels * (bitsPerSample / 8);
    view.setUint32(28, byteRate, true); // byteRate
    const blockAlign = numChannels * (bitsPerSample / 8);
    view.setUint16(32, blockAlign, true); // blockAlign
    view.setUint16(34, bitsPerSample, true); // bitsPerSample

    // data chunk
    writeString(36, 'data');
    view.setUint32(40, dataSize, true); // subchunk2Size

    // Write PCM data from the Uint8Array
    for (let i = 0; i < dataSize; i++) {
        view.setUint8(44 + i, pcmData[i]);
    }

    return new Blob([view], { type: 'audio/wav' });
}


const TextEditor: React.FC<{
    initialHtml: string;
    onContentChange: (html: string) => void;
    placeholder: string;
    onFileExtract: (file: File) => void;
    isExtracting: boolean;
    language: 'vi' | 'en';
}> = ({ initialHtml, onContentChange, placeholder, onFileExtract, isExtracting, language }) => {
    const editorRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const t = translations[language];

    useEffect(() => {
        if (editorRef.current && editorRef.current.innerHTML !== initialHtml) {
            editorRef.current.innerHTML = initialHtml;
        }
    }, [initialHtml]);

    const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
        onContentChange(e.currentTarget.innerHTML);
    };

    const execCmd = (command: string) => {
        document.execCommand(command, false, undefined);
        editorRef.current?.focus();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            onFileExtract(e.target.files[0]);
        }
    };

    return (
        <div className="border border-border-color rounded-md">
            <div className="flex items-center gap-1 p-2 border-b border-border-color bg-background-light flex-wrap">
                <button type="button" onClick={() => execCmd('bold')} className="p-1.5 rounded hover:bg-gray-200"><BoldIcon className="w-4 h-4" /></button>
                <button type="button" onClick={() => execCmd('italic')} className="p-1.5 rounded hover:bg-gray-200"><ItalicIcon className="w-4 h-4" /></button>
                <button type="button" onClick={() => execCmd('underline')} className="p-1.5 rounded hover:bg-gray-200"><UnderlineIcon className="w-4 h-4" /></button>
                <button type="button" onClick={() => execCmd('insertOrderedList')} className="p-1.5 rounded hover:bg-gray-200"><ListOrderedIcon className="w-4 h-4" /></button>
                <button type="button" onClick={() => execCmd('insertUnorderedList')} className="p-1.5 rounded hover:bg-gray-200"><ListIcon className="w-4 h-4" /></button>
                <button type="button" onClick={() => execCmd('justifyLeft')} className="p-1.5 rounded hover:bg-gray-200"><AlignLeftIcon className="w-4 h-4" /></button>
                <button type="button" onClick={() => execCmd('justifyCenter')} className="p-1.5 rounded hover:bg-gray-200"><AlignCenterIcon className="w-4 h-4" /></button>
                <button type="button" onClick={() => execCmd('justifyRight')} className="p-1.5 rounded hover:bg-gray-200"><AlignRightIcon className="w-4 h-4" /></button>
                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                <button type="button" onClick={() => fileInputRef.current?.click()} disabled={isExtracting} className="ml-auto flex items-center gap-1 text-sm p-1.5 rounded hover:bg-gray-200 disabled:opacity-50">
                    {isExtracting ? <SpinnerIcon className="w-4 h-4 animate-spin" /> : <PaperclipIcon className="w-4 h-4" />}
                    {isExtracting ? t.extracting : t.attachFile}
                </button>
            </div>
            <div
                ref={editorRef}
                contentEditable={!isExtracting}
                onInput={handleInput}
                className="p-3 min-h-[200px] prose max-w-none focus:outline-none"
                dangerouslySetInnerHTML={{ __html: initialHtml }}
                data-placeholder={placeholder}
            />
        </div>
    );
};


interface DocumentConfigModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialConfig: DocumentConfig | null;
    onSaveSuccess: (newConfig: DocumentConfig) => void;
    language: 'vi' | 'en';
    user: User;
}

const DocumentConfigModal: React.FC<DocumentConfigModalProps> = ({ isOpen, onClose, initialConfig, onSaveSuccess, language, user }) => {
    const t = translations[language];
    const { showToast } = useToast();
    const [config, setConfig] = useState<Partial<DocumentConfig>>(initialConfig || {});
    const [isSaving, setIsSaving] = useState(false);

    const [translationModels, setTranslationModels] = useState<string[]>([]);
    const [ttsModels, setTtsModels] = useState<string[]>([]);
    const [isLoadingModels, setIsLoadingModels] = useState({ translation: false, tts: false });

    useEffect(() => {
        if (isOpen) {
            setConfig(initialConfig || {});
        }
    }, [isOpen, initialConfig]);

    const fetchModels = useCallback(async (provider: ModelType, modelType: 'translation' | 'tts') => {
        setIsLoadingModels(prev => ({ ...prev, [modelType]: true }));
        try {
            const models = await apiService.getAvailableModels(provider, user.id as number);
            if (modelType === 'translation') setTranslationModels(models);
            else setTtsModels(models);
        } catch (error) {
            showToast((error as Error).message, 'error');
        } finally {
            setIsLoadingModels(prev => ({ ...prev, [modelType]: false }));
        }
    }, [user.id, showToast]);

    useEffect(() => {
        if (config.translationProvider) {
            fetchModels(config.translationProvider, 'translation');
        }
    }, [config.translationProvider, fetchModels]);

    useEffect(() => {
        if (config.ttsProvider) {
            fetchModels(config.ttsProvider, 'tts');
        }
    }, [config.ttsProvider, fetchModels]);

    const handleConfigChange = (field: keyof DocumentConfig, value: any) => {
        const newConfig: Partial<DocumentConfig> = { ...config, [field]: value };
        if (field === 'ttsProvider' && value !== config.ttsProvider) {
            newConfig.ttsModel = '';
            newConfig.ttsVoice = '';
        }
        if (field === 'translationProvider' && value !== config.translationProvider) {
            newConfig.translationModel = '';
        }
        setConfig(newConfig);
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const updatedConfig = await apiService.updateDocumentConfig(config as DocumentConfig);
            onSaveSuccess(updatedConfig);
            showToast(t.saveSuccess, 'success');
            onClose();
        } catch (error: any) {
            showToast(t.saveError.replace('{message}', error.message), 'error');
        } finally {
            setIsSaving(false);
        }
    };

    const getTtsVoices = () => {
        if (config.ttsProvider === 'gemini') return GEMINI_TTS_VOICES;
        if (config.ttsProvider === 'gpt') return GPT_TTS_VOICES;
        return [];
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-background-panel rounded-lg shadow-xl w-full max-w-2xl" onClick={e => e.stopPropagation()}>
                <h2 className="text-xl font-bold p-4 border-b">{t.configTitle}</h2>
                <div className="p-6 space-y-6">
                    <div className="space-y-4 p-4 border rounded-md">
                        <h3 className="font-semibold">{t.translationConfig}</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium">{t.translationProvider}</label>
                                <select value={config.translationProvider || ''} onChange={e => handleConfigChange('translationProvider', e.target.value)} className="mt-1 w-full p-2 border rounded-md">
                                    <option value="gemini">Gemini</option>
                                    <option value="gpt">GPT (OpenAI)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium">{t.translationModel}</label>
                                {isLoadingModels.translation ? <p className="text-sm mt-1">{t.modelLoading}</p> :
                                    <select value={config.translationModel || ''} onChange={e => handleConfigChange('translationModel', e.target.value)} className="mt-1 w-full p-2 border rounded-md">
                                        {translationModels.map(m => <option key={m} value={m}>{m}</option>)}
                                    </select>}
                            </div>
                        </div>
                    </div>
                    <div className="space-y-4 p-4 border rounded-md">
                        <h3 className="font-semibold">{t.ttsConfig}</h3>
                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium">{t.ttsProvider}</label>
                                <select value={config.ttsProvider || ''} onChange={e => handleConfigChange('ttsProvider', e.target.value)} className="mt-1 w-full p-2 border rounded-md">
                                    <option value="gemini">Gemini</option>
                                    <option value="gpt">GPT (OpenAI)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium">{t.ttsModel}</label>
                                {isLoadingModels.tts ? <p className="text-sm mt-1">{t.modelLoading}</p> :
                                    <select value={config.ttsModel || ''} onChange={e => handleConfigChange('ttsModel', e.target.value)} className="mt-1 w-full p-2 border rounded-md">
                                        {config.ttsProvider === 'gpt' ? GPT_TTS_MODELS.map(m => <option key={m} value={m}>{m}</option>) : ttsModels.map(m => <option key={m} value={m}>{m}</option>)}
                                    </select>}
                            </div>
                            <div>
                                <label className="block text-sm font-medium">{t.ttsVoice}</label>
                                <select value={config.ttsVoice || ''} onChange={e => handleConfigChange('ttsVoice', e.target.value)} className="mt-1 w-full p-2 border rounded-md">
                                    {getTtsVoices().map(v => <option key={v} value={v}>{v}</option>)}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="p-4 border-t flex justify-end gap-2">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-md">{t.cancel}</button>
                    <button onClick={handleSave} disabled={isSaving} className="px-4 py-2 bg-primary text-white rounded-md">{isSaving ? t.saving : t.save}</button>
                </div>
            </div>
        </div>
    );
};


const CategoryManagerModal: React.FC<{
    category: {
        name: string;
        pluralName: string;
        items: (DocumentAuthor | DocumentType | DocumentTopic & { nameEn?: string })[];
        api: {
            create: (data: any) => Promise<any>;
            update: (id: number, data: any) => Promise<any>;
            delete: (id: number) => Promise<void>;
        };
    };
    isOpen: boolean;
    onClose: () => void;
    onUpdate: () => void;
    language: 'vi' | 'en';
    user: User;
    spaces: Space[];
    documentTypes: DocumentType[];
    documentAuthors: DocumentAuthor[];
    initialSpaceId?: string;
}> = ({ category, isOpen, onClose, onUpdate, language, user, spaces, documentTypes, documentAuthors, initialSpaceId }) => {
    const t = translations[language];
    const { showToast } = useToast();

    const isManagingTopics = category.name === 'Topic';
    const isSuperAdmin = user.permissions?.includes('roles');
    // Use initialSpaceId if provided, otherwise fallback to default logic
    const defaultSpaceId = initialSpaceId
        ? initialSpaceId
        : (isSuperAdmin ? '' : (spaces.find(s => s.userId === user.id)?.id || ''));

    const [newItem, setNewItem] = useState({ name: '', nameEn: '', spaceId: String(defaultSpaceId), typeId: '', authorId: '' });
    const [editingItem, setEditingItem] = useState<{ id: number; name: string; nameEn: string; spaceId: string; typeId?: string; authorId?: string } | null>(null);

    const [topicSearch, setTopicSearch] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 8;

    useEffect(() => {
        if (isOpen) {
            const initialTypeId = isManagingTopics && documentTypes.length > 0 ? documentTypes[0].id.toString() : '';
            const initialAuthorId = isManagingTopics && documentAuthors.length > 0 ? documentAuthors[0].id.toString() : '';
            // Re-calculate default space ID on open to ensure it captures latest props
            const currentDefaultSpaceId = initialSpaceId
                ? initialSpaceId
                : (isSuperAdmin ? '' : (spaces.find(s => s.userId === user.id)?.id || ''));

            setNewItem({ name: '', nameEn: '', spaceId: String(currentDefaultSpaceId), typeId: initialTypeId, authorId: initialAuthorId });
            setEditingItem(null);
            setTopicSearch('');
            setCurrentPage(1);
        }
    }, [isOpen, initialSpaceId, isSuperAdmin, spaces, user.id, documentTypes, documentAuthors, isManagingTopics]);

    const handleAddItem = async () => {
        if (!newItem.name.trim()) return;
        try {
            const payload: any = { name: newItem.name.trim(), nameEn: newItem.nameEn.trim() };
            payload.spaceId = newItem.spaceId ? Number(newItem.spaceId) : null;
            if (isManagingTopics) {
                if (!newItem.typeId) {
                    showToast('Please select a type for the new topic.', 'error');
                    return;
                }
                if (!newItem.authorId) {
                    showToast('Please select an author for the new topic.', 'error');
                    return;
                }
                payload.typeId = Number(newItem.typeId);
                payload.authorId = Number(newItem.authorId);
            }
            await category.api.create(payload);
            setNewItem(prev => ({ ...prev, name: '', nameEn: '' }));
            onUpdate();
        } catch (error: any) {
            showToast(error.message, 'error');
        }
    };

    const handleUpdateItem = async () => {
        if (!editingItem || !editingItem.name.trim()) {
            setEditingItem(null); return;
        }
        try {
            const payload: any = { name: editingItem.name.trim(), nameEn: editingItem.nameEn.trim() };
            payload.spaceId = editingItem.spaceId ? Number(editingItem.spaceId) : null;
            if (isManagingTopics) {
                if (editingItem.typeId !== undefined) payload.typeId = editingItem.typeId ? Number(editingItem.typeId) : null;
                if (editingItem.authorId !== undefined) payload.authorId = editingItem.authorId ? Number(editingItem.authorId) : null;
            }
            await category.api.update(editingItem.id, payload);
            setEditingItem(null);
            onUpdate();
        } catch (error: any) {
            showToast(error.message, 'error');
        }
    };

    const handleDeleteItem = async (item: { id: number; name: string }) => {
        if (window.confirm(t.deleteItemConfirm.replace('{name}', item.name))) {
            try {
                await category.api.delete(item.id);
                onUpdate();
            } catch (error: any) {
                showToast(t.deleteCategoryError.replace('{message}', error.message), 'error');
            }
        }
    };

    const filteredItems = useMemo(() => {
        let items = category.items;

        // Filter by Space Scope if initialSpaceId is provided
        if (initialSpaceId) {
            if (initialSpaceId === 'global') {
                items = items.filter(item => !item.spaceId);
            } else {
                // Filter ensuring we only show items for the specific space
                items = items.filter(item => String(item.spaceId) === initialSpaceId);
            }
        }

        if (!isManagingTopics || !topicSearch) {
            return items;
        }
        const searchLower = topicSearch.toLowerCase();
        return items.filter(item =>
            item.name.toLowerCase().includes(searchLower) ||
            ((item as any).nameEn || '').toLowerCase().includes(searchLower)
        );
    }, [category.items, topicSearch, isManagingTopics, initialSpaceId]);

    const totalPages = useMemo(() => {
        if (!isManagingTopics) return 1;
        return Math.ceil(filteredItems.length / ITEMS_PER_PAGE);
    }, [filteredItems, isManagingTopics]);

    const paginatedItems = useMemo(() => {
        if (!isManagingTopics) return filteredItems;
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredItems.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [filteredItems, currentPage, isManagingTopics]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-background-panel rounded-lg shadow-xl w-full max-w-4xl flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                <h2 className="text-xl font-bold p-4 border-b border-border-color">{t.manageCategoryTitle.replace('{category}', category.pluralName)}</h2>

                {isManagingTopics && (
                    <div className="p-4 border-b border-border-color">
                        <input
                            type="text"
                            placeholder={t.filterByTopicName}
                            value={topicSearch}
                            onChange={e => {
                                setTopicSearch(e.target.value);
                                setCurrentPage(1);
                            }}
                            className="p-2 border rounded-md w-full"
                        />
                    </div>
                )}

                <div className="p-4 overflow-y-auto space-y-2 flex-grow">
                    {paginatedItems.map(item => (
                        <div key={item.id} className="p-2 bg-background-light rounded-md">
                            {editingItem?.id === item.id ? (
                                <div className="flex items-center gap-2 flex-wrap">
                                    <input type="text" value={editingItem.name} onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })} className="p-1 border rounded-md flex-grow min-w-[100px]" autoFocus placeholder={t.nameLabel} />
                                    <input type="text" value={editingItem.nameEn} onChange={(e) => setEditingItem({ ...editingItem, nameEn: e.target.value })} className="p-1 border rounded-md flex-grow min-w-[100px]" placeholder={t.nameEnLabel} />
                                    {isSuperAdmin && (
                                        <select value={editingItem.spaceId} onChange={(e) => setEditingItem({ ...editingItem, spaceId: e.target.value })} className="p-1 border rounded-md text-xs w-28"><option value="">{t.globalSpace}</option>{spaces.map(s => <option key={s.id as number} value={s.id as number}>{s.name}</option>)}</select>
                                    )}
                                    {isManagingTopics && (
                                        <>
                                            <select value={editingItem.typeId} onChange={(e) => setEditingItem({ ...editingItem, typeId: e.target.value })} className="p-1 border rounded-md text-xs w-28"><option value="">-- {t.type} --</option>{documentTypes.map(type => <option key={type.id} value={type.id}>{type.name}</option>)}</select>
                                            <select value={editingItem.authorId} onChange={(e) => setEditingItem({ ...editingItem, authorId: e.target.value })} className="p-1 border rounded-md text-xs w-28"><option value="">-- {t.author} --</option>{documentAuthors.map(author => <option key={author.id} value={author.id}>{author.name}</option>)}</select>
                                        </>
                                    )}
                                    <button onClick={handleUpdateItem} className="px-3 py-1 bg-primary text-white text-sm rounded">{t.save}</button>
                                    <button onClick={() => setEditingItem(null)} className="px-3 py-1 bg-gray-200 text-sm rounded">{t.cancel}</button>
                                </div>
                            ) : (
                                <div className="flex items-center justify-between gap-2">
                                    <div className="flex flex-col">
                                        <span className="text-sm font-medium">{item.name} {(item as any).nameEn && ` / ${(item as any).nameEn}`}</span>
                                        <div className="flex items-center gap-2 text-xs text-text-light">
                                            <span>{spaces.find(s => s.id === item.spaceId)?.name || t.globalSpace}</span>
                                            {isManagingTopics && (item as DocumentTopic).typeId && <span>| {documentTypes.find(dt => dt.id === (item as DocumentTopic).typeId)?.name}</span>}
                                            {isManagingTopics && (item as DocumentTopic).authorId && <span>| {documentAuthors.find(da => da.id === (item as DocumentTopic).authorId)?.name}</span>}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        <button onClick={() => setEditingItem({ id: item.id, name: item.name, nameEn: (item as any).nameEn || '', spaceId: String(item.spaceId ?? ''), typeId: String((item as DocumentTopic).typeId ?? ''), authorId: String((item as DocumentTopic).authorId ?? '') })} className="p-1"><PencilIcon className="w-4 h-4 text-text-light hover:text-primary" /></button>
                                        <button onClick={() => handleDeleteItem(item)} className="p-1"><TrashIcon className="w-4 h-4 text-text-light hover:text-accent-red" /></button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>

                {isManagingTopics && totalPages > 1 && (
                    <div className="p-4 border-t border-border-color flex justify-between items-center flex-shrink-0">
                        <span className="text-sm text-text-light">{t.page} {currentPage} / {totalPages}</span>
                        <div className="flex gap-2">
                            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-1 text-sm border rounded-md disabled:opacity-50">{t.prev}</button>
                            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-3 py-1 text-sm border rounded-md disabled:opacity-50">{t.next}</button>
                        </div>
                    </div>
                )}

                <div className="p-4 border-t border-border-color space-y-2 flex-shrink-0">
                    <h3 className="font-semibold">{t.addItem}</h3>
                    <div className="flex items-center gap-2 flex-wrap">
                        <input type="text" value={newItem.name} onChange={(e) => setNewItem({ ...newItem, name: e.target.value })} placeholder={t.nameLabel} className="p-2 border rounded-md flex-grow" />
                        <input type="text" value={newItem.nameEn} onChange={(e) => setNewItem({ ...newItem, nameEn: e.target.value })} placeholder={t.nameEnLabel} className="p-2 border rounded-md flex-grow" />
                        {isSuperAdmin && (
                            <select value={newItem.spaceId} onChange={e => setNewItem({ ...newItem, spaceId: e.target.value })} className="p-2 border rounded-md text-sm"><option value="">{t.globalSpace}</option>{spaces.map(s => <option key={s.id as number} value={s.id as number}>{s.name}</option>)}</select>
                        )}
                        {isManagingTopics && (
                            <>
                                <select value={newItem.typeId} onChange={e => setNewItem({ ...newItem, typeId: e.target.value })} className="p-2 border rounded-md text-sm"><option value="">-- {t.type} --</option>{documentTypes.map(type => <option key={type.id} value={type.id}>{type.name}</option>)}</select>
                                <select value={newItem.authorId} onChange={e => setNewItem({ ...newItem, authorId: e.target.value })} className="p-2 border rounded-md text-sm"><option value="">-- {t.author} --</option>{documentAuthors.map(author => <option key={author.id} value={author.id}>{author.name}</option>)}</select>
                            </>
                        )}
                        <button onClick={handleAddItem} className="px-4 py-2 bg-primary text-text-on-primary rounded-md">{t.addItem}</button>
                    </div>
                </div>
            </div>
        </div>
    );
};


export const FilesAndDocuments: React.FC<{ language: 'vi' | 'en', user: User }> = ({ language, user }) => {
    const t = translations[language];
    const { showToast } = useToast();
    const [documents, setDocuments] = useState<Document[]>([]);
    const [totalDocuments, setTotalDocuments] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isPreviewOpen, setIsPreviewOpen] = useState(false);
    const [editingDocument, setEditingDocument] = useState<Partial<Document> | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    // Staged files for deferred upload
    const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
    const [audioFile, setAudioFile] = useState<File | null>(null);
    const [audioEnFile, setAudioEnFile] = useState<File | null>(null);

    // Category states
    const [documentAuthors, setDocumentAuthors] = useState<DocumentAuthor[]>([]);
    const [documentTypes, setDocumentTypes] = useState<DocumentType[]>([]);
    const [documentTopics, setDocumentTopics] = useState<DocumentTopic[]>([]);
    const [tags, setTags] = useState<Tag[]>([]);
    const [allSpaces, setAllSpaces] = useState<Space[]>([]);
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [managingCategory, setManagingCategory] = useState<Category | null>(null);
    const [tagInput, setTagInput] = useState('');

    // Global Config State
    const [documentConfig, setDocumentConfig] = useState<DocumentConfig | null>(null);
    const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);

    // State for translation and extraction
    const [translatingField, setTranslatingField] = useState<string | null>(null);
    const [extractingFor, setExtractingFor] = useState<'vi' | 'en' | null>(null);
    const [isGeneratingAudioFor, setIsGeneratingAudioFor] = useState<'vi' | 'en' | null>(null);

    // Filter states
    const [filters, setFilters] = useState<Filters>({ title: '', authorId: '', typeId: '', topicId: '', tagId: '', spaceId: '' });
    const debounceTimeout = useRef<number | null>(null);
    const [activeTab, setActiveTab] = useState<'vi' | 'en'>('vi');

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 10;

    const fileInputRefs = {
        thumbnail: useRef<HTMLInputElement>(null),
        audio: useRef<HTMLInputElement>(null),
        audio_en: useRef<HTMLInputElement>(null),
    };
    const titleInputRef = useRef<HTMLInputElement>(null);

    const manageableSpaces = useMemo(() => {
        if (user.permissions?.includes('roles')) {
            return allSpaces; // Admins can manage all spaces
        }
        return allSpaces.filter(space => space.userId === user.id);
    }, [allSpaces, user]);

    const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    const fetchInitialData = useCallback(async () => {
        try {
            const [tags, config, allSpacesData] = await Promise.all([
                apiService.getAllTags(),
                apiService.getDocumentConfig(),
                apiService.getSpaces()
            ]);
            setTags(tags || []);
            setDocumentConfig(config);
            setAllSpaces(allSpacesData || []);

            // Auto-select space for non-admins
            if (user && !user.permissions?.includes('roles')) {
                const userSpaces = (allSpacesData || []).filter(s => s.userId === user.id);
                if (userSpaces.length > 0) {
                    setFilters(prev => ({ ...prev, spaceId: String(userSpaces[0].id) }));
                }
            }
        } catch (error) {
            showToast(t.fetchError, 'error');
        }
    }, [showToast, t.fetchError, user]); // Added user dependency


    const fetchCategories = useCallback(async (spaceIdFilter: string) => {
        try {
            const spaceIdParam = spaceIdFilter === '' ? undefined : spaceIdFilter;
            const [authors, types, topics] = await Promise.all([
                apiService.getDocumentAuthors(spaceIdParam),
                apiService.getDocumentTypes(spaceIdParam),
                apiService.getDocumentTopics(spaceIdParam),
            ]);
            setDocumentAuthors(authors || []);
            setDocumentTypes(types || []);
            setDocumentTopics(topics || []);
        } catch (error) {
            showToast('Failed to load categories for filter.', 'error');
        }
    }, [showToast]);

    const fetchDocuments = useCallback(async (currentFilters: Filters, page: number) => {
        setIsLoading(true);
        try {
            const params = { ...currentFilters, page, limit: ITEMS_PER_PAGE };
            const docs = await apiService.getDocuments(params);
            setDocuments(docs.data || []);
            setTotalDocuments(docs.total || 0);
        } catch (error) {
            showToast(t.fetchError, 'error');
        } finally {
            setIsLoading(false);
        }
    }, [showToast, t.fetchError]);

    useEffect(() => {
        fetchInitialData();
    }, [fetchInitialData]);

    useEffect(() => {
        fetchCategories(filters.spaceId);
    }, [filters.spaceId, fetchCategories]);

    useEffect(() => {
        if (debounceTimeout.current) clearTimeout(debounceTimeout.current);
        debounceTimeout.current = window.setTimeout(() => {
            if (currentPage !== 1) {
                setCurrentPage(1);
            } else {
                fetchDocuments(filters, 1);
            }
        }, 300);
        return () => { if (debounceTimeout.current) clearTimeout(debounceTimeout.current); };
    }, [filters]); // Ensure fetchDocuments runs when filters change (including spaceId update)

    useEffect(() => {
        fetchDocuments(filters, currentPage);
    }, [currentPage, fetchDocuments]);

    const totalPages = Math.ceil(totalDocuments / ITEMS_PER_PAGE);

    const resetFormForNew = () => {
        const currentCategories = {
            authorId: editingDocument?.authorId,
            typeId: editingDocument?.typeId,
            topicId: editingDocument?.topicId,
            spaceId: filters.spaceId ? Number(filters.spaceId) : undefined,
        };

        setEditingDocument({
            id: 'new',
            title: '', titleEn: '', summary: '', summaryEn: '',
            content: '', contentEn: '', tags: [], thumbnailUrl: '',
            ...currentCategories
        });
        setThumbnailFile(null);
        setAudioFile(null);
        setAudioEnFile(null);
        setActiveTab('vi');
        setTagInput('');
        setTimeout(() => titleInputRef.current?.focus(), 0);
    };


    const openDialog = (doc: Partial<Document> | null) => {
        setEditingDocument(doc ? { ...doc } : {
            id: 'new',
            title: '', titleEn: '', summary: '', summaryEn: '',
            authorId: undefined, typeId: undefined, topicId: undefined,
            spaceId: filters.spaceId ? Number(filters.spaceId) : undefined,
            content: '', contentEn: '', tags: [], thumbnailUrl: '',
        });
        setThumbnailFile(null);
        setAudioFile(null);
        setAudioEnFile(null);
        setActiveTab('vi');
        setIsDialogOpen(true);
    };

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        if (!editingDocument) return;
        const { name, value } = e.target;
        setEditingDocument(prev => prev ? { ...prev, [name]: value } : null);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fieldName: 'thumbnailUrl' | 'audioUrl' | 'audioUrlEn') => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];

            if (fieldName === 'thumbnailUrl') {
                setThumbnailFile(file);
                const previewUrl = URL.createObjectURL(file);
                setEditingDocument(prev => prev ? { ...prev, thumbnailUrl: previewUrl } : null);
            } else { // It's an audio file
                if (fieldName === 'audioUrl') {
                    setAudioFile(file);
                } else if (fieldName === 'audioUrlEn') {
                    setAudioEnFile(file);
                }

                const audioUrl = URL.createObjectURL(file);
                const audioElement = new Audio(audioUrl);
                audioElement.addEventListener('loadedmetadata', () => {
                    setEditingDocument(prev => {
                        if (!prev) return null;
                        return { ...prev, duration: Math.round(audioElement.duration) };
                    });
                });

                setEditingDocument(prev => prev ? { ...prev, [fieldName]: audioUrl } : null);
            }
        }
    };

    const handleSave = async (andContinue = false) => {
        if (!editingDocument) return;
        if (!editingDocument.thumbnailUrl && !thumbnailFile) {
            showToast(t.errorThumbnailRequired, 'error');
            return;
        }

        setIsSaving(true);

        try {
            let payload = { ...editingDocument };

            // Helper function to upload a file
            const uploadFile = async (file: File, context: string, field: keyof Document) => {
                const formData = new FormData();
                formData.append('context', context);
                formData.append('spaceId', String(payload.spaceId || 'global'));
                formData.append('file', file);
                const res = await apiService.uploadFiles(formData);
                if (res.filePaths && res.filePaths[0]) {
                    (payload as any)[field] = res.filePaths[0];
                } else {
                    throw new Error(`Upload for ${field} failed.`);
                }
            };

            showToast(t.saving, 'info');

            if (thumbnailFile) await uploadFile(thumbnailFile, 'Document', 'thumbnailUrl');
            if (audioFile) await uploadFile(audioFile, 'Document', 'audioUrl');
            if (audioEnFile) await uploadFile(audioEnFile, 'Document', 'audioUrlEn');

            const finalPayload = { ...payload };
            finalPayload.authorId = finalPayload.authorId ? Number(finalPayload.authorId) : undefined;
            finalPayload.typeId = finalPayload.typeId ? Number(finalPayload.typeId) : undefined;
            finalPayload.topicId = finalPayload.topicId ? Number(finalPayload.topicId) : undefined;
            finalPayload.spaceId = finalPayload.spaceId ? Number(finalPayload.spaceId) : null;
            finalPayload.rating = finalPayload.rating ? Number(finalPayload.rating) : 0;

            if (finalPayload.id === 'new') {
                await apiService.createDocument(finalPayload);
                if (andContinue) {
                    resetFormForNew();
                } else {
                    setIsDialogOpen(false);
                }
            } else if (typeof finalPayload.id === 'number') {
                await apiService.updateDocument(finalPayload.id, finalPayload);
                setIsDialogOpen(false);
            }

            showToast(t.saveSuccess, 'success');
            fetchDocuments(filters, currentPage); // Re-fetch current page

            setThumbnailFile(null);
            setAudioFile(null);
            setAudioEnFile(null);
        } catch (error: any) {
            showToast(t.saveError.replace('{message}', error.message), 'error');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (doc: Document) => {
        if (typeof doc.id !== 'number') {
            showToast('Cannot delete an unsaved document.', 'error');
            return;
        }
        if (window.confirm(t.deleteItemConfirm.replace('{name}', doc.title))) {
            try {
                await apiService.deleteDocument(doc.id);
                showToast(t.deleteSuccess, 'success');
                fetchDocuments(filters, currentPage);
            } catch (error: any) {
                showToast(t.deleteError.replace('{message}', error.message), 'error');
            }
        }
    };

    const handleTranslate = async (field: 'title' | 'summary' | 'content', sourceLang: 'vi' | 'en', targetLang: 'vi' | 'en') => {
        if (!editingDocument || !documentConfig) return;

        const sourceField = sourceLang === 'en' ? `${field}En` as keyof Document : field;
        const targetField = targetLang === 'en' ? `${field}En` as keyof Document : field;

        const sourceText = String(editingDocument[sourceField] || '').trim();
        const targetText = String(editingDocument[targetField] || '').trim();

        if (!sourceText) {
            showToast(sourceLang === 'vi' ? 'Nội dung Tiếng Việt trống để dịch.' : 'English content is empty to translate from.', 'error');
            return;
        }

        if (targetText && !window.confirm(targetLang === 'vi' ? 'Nội dung Tiếng Việt hiện tại sẽ bị ghi đè. Bạn có muốn tiếp tục?' : 'Current English content will be overwritten. Do you want to continue?')) {
            return;
        }

        const contextPrompt = "Dịch với văn phong 'giác ngộ', sử dụng ngôn từ trang trọng, sâu sắc, phù hợp với các văn bản Phật giáo.";

        setTranslatingField(field);
        try {
            const { translatedText } = await apiService.translateText(
                documentConfig.translationProvider,
                documentConfig.translationModel,
                sourceText,
                targetLang,
                user.id as number,
                contextPrompt
            );
            setEditingDocument(prev => prev ? { ...prev, [targetField]: translatedText } : null);
        } catch (error: any) {
            showToast(t.generateError, 'error');
            console.error(error);
        } finally {
            setTranslatingField(null);
        }
    };

    const handleFileExtract = async (file: File, lang: 'vi' | 'en') => {
        setExtractingFor(lang);
        try {
            const { htmlContent } = await apiService.extractTextFromFile('gemini', 'gemini-2.5-pro', file, user.id as number);
            if (lang === 'vi') {
                handleFormChange({ target: { name: 'content', value: htmlContent } } as any);
            } else {
                handleFormChange({ target: { name: 'contentEn', value: htmlContent } } as any);
            }
        } catch (error: any) {
            showToast(t.extractError.replace('{message}', error.message), 'error');
        } finally {
            setExtractingFor(null);
        }
    };

    const handleGenerateAudio = async (lang: 'vi' | 'en') => {
        if (!editingDocument || !documentConfig || isGeneratingAudioFor) return;

        const htmlContent = (lang === 'vi' ? editingDocument.content : editingDocument.contentEn) || '';
        const text = stripHtml(htmlContent);
        const { ttsProvider, ttsModel, ttsVoice } = documentConfig;

        if (!text.trim() || !ttsProvider || !ttsModel || !ttsVoice) {
            showToast(t.ttsError, 'error');
            return;
        }

        setIsGeneratingAudioFor(lang);
        try {
            const { audioContent } = await apiService.generateTtsAudio(text, ttsProvider as ModelType, ttsModel, ttsVoice, lang, user.id as number);

            // Decode base64 PCM data
            const pcmData = decode(audioContent);

            const sampleRate = 24000; // Gemini TTS standard
            const bitsPerSample = 16;
            const numChannels = 1;

            // Create a proper WAV Blob
            const wavBlob = pcmToWav(pcmData, numChannels, sampleRate, bitsPerSample);
            const wavFile = new File([wavBlob], `generated_${lang}_${Date.now()}.wav`, { type: 'audio/wav' });

            // Calculate duration in seconds
            const byteRate = sampleRate * numChannels * (bitsPerSample / 8);
            const duration = pcmData.length / byteRate;

            // Update state
            const objectUrl = URL.createObjectURL(wavFile);

            if (lang === 'vi') {
                setAudioFile(wavFile);
                setEditingDocument(prev => prev ? { ...prev, audioUrl: objectUrl, duration: Math.round(duration) } : null);
            } else {
                setAudioEnFile(wavFile);
                setEditingDocument(prev => prev ? { ...prev, audioUrlEn: objectUrl, duration: Math.round(duration) } : null);
            }

            showToast(t.ttsSuccess, 'success');

        } catch (error: any) {
            showToast(t.ttsFailure.replace('{message}', error.message), 'error');
        } finally {
            setIsGeneratingAudioFor(null);
        }
    };

    const openPreview = (doc: Document) => { setEditingDocument(doc); setIsPreviewOpen(true); };
    const handleAddTag = () => { if (!editingDocument || !tagInput.trim()) return; const newTags = [...(editingDocument.tags || []), tagInput.trim()]; setEditingDocument(prev => prev ? { ...prev, tags: newTags } : null); setTagInput(''); };
    const handleRemoveTag = (tagToRemove: string) => { if (!editingDocument) return; const newTags = (editingDocument.tags || []).filter(t => t !== tagToRemove); setEditingDocument(prev => prev ? { ...prev, tags: newTags } : null); };
    const openCategoryManager = (category: Category) => { setManagingCategory(category); setIsCategoryModalOpen(true); };
    const handleCategoryUpdate = () => { fetchInitialData(); fetchCategories(filters.spaceId); };
    const categoryConfig = {
        documentAuthor: { name: 'Author', pluralName: t.author, items: documentAuthors, api: { create: apiService.createDocumentAuthor, update: apiService.updateDocumentAuthor, delete: apiService.deleteDocumentAuthor } },
        type: { name: 'Type', pluralName: t.type, items: documentTypes, api: { create: apiService.createDocumentType, update: apiService.updateDocumentType, delete: apiService.deleteDocumentType } },
        documentTopic: { name: 'Topic', pluralName: t.topic, items: documentTopics, api: { create: apiService.createDocumentTopic, update: apiService.updateDocumentTopic, delete: apiService.deleteDocumentTopic } },
    };

    return (
        <div className="p-6 h-full flex flex-col bg-background-panel">
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h1 className="text-2xl font-bold font-serif">{t.title}</h1>
                    <p className="text-text-light">{t.subtitle}</p>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={() => setIsConfigModalOpen(true)} className="px-4 py-2 bg-background-light border border-border-color text-text-main rounded-md flex items-center space-x-2 font-semibold hover:bg-gray-200">
                        <SettingsIcon className="w-5 h-5" />
                        <span>{t.configure}</span>
                    </button>
                    <button onClick={() => openDialog(null)} className="px-4 py-2 bg-primary text-text-on-primary rounded-md flex items-center space-x-2 font-semibold">
                        <PlusIcon className="w-5 h-5" />
                        <span>{t.newDocument}</span>
                    </button>
                </div>
            </div>
            {/* Filters Section */}
            <div className="mb-4 grid grid-cols-1 md:grid-cols-6 gap-4 p-4 border rounded-lg bg-background-light">
                <div><label className="text-sm font-medium text-text-light">{t.titleHeader}</label><input type="text" name="title" value={filters.title} onChange={handleFilterChange} placeholder={t.filterByTitle} className="p-2 border border-border-color rounded-md bg-background-panel text-sm w-full mt-1" /></div>
                <div><label className="text-sm font-medium text-text-light">{t.author}</label><div className="flex items-center gap-1 mt-1"><select name="authorId" value={filters.authorId} onChange={handleFilterChange} className="flex-grow p-2 border border-border-color rounded-md bg-background-panel text-sm w-full"><option value="">{t.filterAll}</option>{documentAuthors.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select>{(user.permissions?.includes('roles') || manageableSpaces.length > 0) && <button onClick={() => openCategoryManager('documentAuthor')} className="p-2 rounded-md hover:bg-gray-200"><PencilIcon className="w-4 h-4 text-text-light" /></button>}</div></div>
                <div><label className="text-sm font-medium text-text-light">{t.type}</label><div className="flex items-center gap-1 mt-1"><select name="typeId" value={filters.typeId} onChange={handleFilterChange} className="flex-grow p-2 border border-border-color rounded-md bg-background-panel text-sm w-full"><option value="">{t.filterAll}</option>{documentTypes.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select>{(user.permissions?.includes('roles') || manageableSpaces.length > 0) && <button onClick={() => openCategoryManager('type')} className="p-2 rounded-md hover:bg-gray-200"><PencilIcon className="w-4 h-4 text-text-light" /></button>}</div></div>
                <div><label className="text-sm font-medium text-text-light">{t.topic}</label><div className="flex items-center gap-1 mt-1"><select name="topicId" value={filters.topicId} onChange={handleFilterChange} className="flex-grow p-2 border border-border-color rounded-md bg-background-panel text-sm w-full"><option value="">{t.filterAll}</option>{documentTopics.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select>{(user.permissions?.includes('roles') || manageableSpaces.length > 0) && <button onClick={() => openCategoryManager('documentTopic')} className="p-2 rounded-md hover:bg-gray-200"><PencilIcon className="w-4 h-4 text-text-light" /></button>}</div></div>
                <div><label className="text-sm font-medium text-text-light">{t.space}</label><select name="spaceId" value={filters.spaceId} onChange={handleFilterChange} className="p-2 border border-border-color rounded-md bg-background-panel text-sm w-full mt-1"><option value="">{t.filterAll}</option>{user.permissions?.includes('roles') && <option value="global">{t.globalSpace}</option>}{manageableSpaces.map(item => <option key={item.id as number} value={item.id as number}>{item.name}</option>)}</select></div>
                <div><label className="text-sm font-medium text-text-light">{t.tags}</label><div className="flex items-center gap-1 mt-1"><select name="tagId" value={filters.tagId} onChange={handleFilterChange} className="flex-grow p-2 border border-border-color rounded-md bg-background-panel text-sm w-full"><option value="">{t.filterAll}</option>{tags.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select></div></div>
            </div>

            <div className="flex-1 overflow-auto border border-border-color rounded-lg shadow-sm">
                <table className="min-w-full divide-y divide-border-color">
                    <thead className="bg-background-light sticky top-0 z-10"><tr><th className="px-4 py-3 text-left text-xs font-semibold text-text-light uppercase tracking-wider">{t.stt}</th><th className="px-4 py-3 text-left text-xs font-semibold text-text-light uppercase tracking-wider">{t.thumbnail}</th><th className="px-4 py-3 text-left text-xs font-semibold text-text-light uppercase tracking-wider">{t.titleHeader}</th><th className="px-4 py-3 text-left text-xs font-semibold text-text-light uppercase tracking-wider">{t.summary}</th><th className="px-4 py-3 text-left text-xs font-semibold text-text-light uppercase tracking-wider">{t.author}</th><th className="px-4 py-3 text-left text-xs font-semibold text-text-light uppercase tracking-wider">{t.type}</th><th className="px-4 py-3 text-left text-xs font-semibold text-text-light uppercase tracking-wider">{t.topic}</th><th className="px-4 py-3 text-left text-xs font-semibold text-text-light uppercase tracking-wider">{t.space}</th><th className="px-4 py-3 text-left text-xs font-semibold text-text-light uppercase tracking-wider">{t.tags}</th><th className="px-4 py-3 text-left text-xs font-semibold text-text-light uppercase tracking-wider">{t.createdAt}</th><th className="px-4 py-3 text-right text-xs font-semibold text-text-light uppercase tracking-wider">{t.actions}</th></tr></thead>
                    <tbody className="bg-background-panel divide-y divide-border-color">
                        {isLoading ? (<tr><td colSpan={11} className="text-center p-4">{t.loading}</td></tr>) : documents.length === 0 ? (<tr><td colSpan={11} className="text-center p-4">{t.noDocuments}</td></tr>) : (
                            documents.map((doc, index) => (
                                <tr key={doc.id} className="hover:bg-background-light">
                                    <td className="px-4 py-3 text-sm text-text-light">{(currentPage - 1) * ITEMS_PER_PAGE + index + 1}</td>
                                    <td className="px-4 py-3">
                                        <div className="flex flex-col items-start">
                                            <div className="w-24 h-16 rounded-md bg-background-light flex items-center justify-center overflow-hidden border">
                                                {doc.thumbnailUrl ? (
                                                    <img src={doc.thumbnailUrl} alt="Thumbnail" className="w-full h-full object-cover" />
                                                ) : (
                                                    <BookOpenIcon className="w-8 h-8 text-text-light" />
                                                )}
                                            </div>
                                            <div className="flex items-center space-x-2 mt-1 text-xs text-text-light w-24 justify-around">
                                                <div className="flex items-center space-x-1">
                                                    <EyeIcon className="w-4 h-4" />
                                                    <span>{doc.views || 0}</span>
                                                </div>
                                                <div className="flex items-center space-x-1">
                                                    <ThumbsUpIcon className="w-4 h-4" />
                                                    <span>{doc.likes || 0}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 font-semibold text-text-main max-w-xs truncate" title={doc.title}>{doc.title}</td>
                                    <td className="px-4 py-3 text-sm text-text-light max-w-xs truncate" title={doc.summary}>{doc.summary || '-'}</td>
                                    <td className="px-4 py-3 text-sm">{doc.author}</td>
                                    <td className="px-4 py-3 text-sm">{doc.type}</td>
                                    <td className="px-4 py-3 text-sm">{doc.topic}</td>
                                    <td className="px-4 py-3 text-sm">{doc.spaceName || '-'}</td>
                                    <td className="px-4 py-3 text-sm max-w-[150px]"><div className="flex flex-wrap gap-1">{doc.tags?.map(tag => <span key={tag} className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">{tag}</span>)}</div></td>
                                    <td className="px-4 py-3 text-sm text-text-light">{new Date(doc.createdAt).toLocaleString(language === 'vi' ? 'vi-VN' : 'en-US', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                                    <td className="px-4 py-3 text-right text-sm space-x-2 whitespace-nowrap"><button onClick={() => openPreview(doc)} title={t.preview} className="p-2 rounded-full hover:bg-gray-200"><EyeIcon className="w-5 h-5 text-text-light" /></button><button onClick={() => openDialog(doc)} title={t.edit} className="p-2 rounded-full hover:bg-gray-200"><PencilIcon className="w-5 h-5 text-text-light" /></button><button onClick={() => handleDelete(doc)} title={t.delete} className="p-2 rounded-full hover:bg-gray-200"><TrashIcon className="w-5 h-5 text-accent-red" /></button></td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <div className="flex justify-between items-center mt-4">
                <p className="text-sm text-text-light">
                    {t.showing} {totalDocuments > 0 ? (currentPage - 1) * ITEMS_PER_PAGE + 1 : 0} {t.to} {Math.min(currentPage * ITEMS_PER_PAGE, totalDocuments)} {t.of} {totalDocuments}
                </p>
                <div className="flex space-x-1">
                    <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-1 text-sm border rounded-md disabled:opacity-50 disabled:cursor-not-allowed bg-white hover:bg-gray-50"
                    >
                        {t.prev}
                    </button>
                    <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages || totalPages === 0}
                        className="px-3 py-1 text-sm border rounded-md disabled:opacity-50 disabled:cursor-not-allowed bg-white hover:bg-gray-50"
                    >
                        {t.next}
                    </button>
                </div>
            </div>
            {isDialogOpen && editingDocument && (
                <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4" onClick={() => setIsDialogOpen(false)}>
                    <div className="bg-background-panel rounded-lg shadow-xl w-full max-w-6xl h-[95vh] flex flex-col" onClick={e => e.stopPropagation()}>
                        <h2 className="text-xl font-bold p-4 border-b">{editingDocument.id === 'new' ? t.dialogCreateTitle : t.dialogEditTitle}</h2>
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-start">
                                <div className="flex flex-col">
                                    <label className="block text-sm font-medium mb-1">{t.thumbnail}</label>
                                    <div className="w-full h-32 rounded-md border bg-gray-100 mb-2 flex items-center justify-center overflow-hidden">
                                        {editingDocument.thumbnailUrl ? (
                                            <img src={editingDocument.thumbnailUrl} alt="Thumbnail Preview" className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-xs text-text-light">{t.uploadThumbnail}</span>
                                        )}
                                    </div>
                                    <input type="file" ref={fileInputRefs.thumbnail} onChange={(e) => handleFileChange(e, 'thumbnailUrl')} className="hidden" accept="image/*" />
                                    <button type="button" onClick={() => fileInputRefs.thumbnail.current?.click()} disabled={isSaving} className="px-4 py-2 text-sm border rounded-md w-full">{isSaving ? t.saving : t.changeImage}</button>
                                </div>
                                <div className="space-y-4">
                                    <div><label className="block text-sm font-medium">{t.author}</label><div className="flex items-center gap-1 mt-1"><select name="authorId" value={editingDocument.authorId || ''} onChange={handleFormChange} className="flex-grow p-2 border rounded-md"><option value="">{t.selectPlaceholder}</option>{documentAuthors.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select></div></div>
                                    <div><label className="block text-sm font-medium">{t.type}</label><div className="flex items-center gap-1 mt-1"><select name="typeId" value={editingDocument.typeId || ''} onChange={handleFormChange} className="flex-grow p-2 border rounded-md"><option value="">{t.selectPlaceholder}</option>{documentTypes.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select></div></div>
                                    <div><label className="block text-sm font-medium">{t.topic}</label><div className="flex items-center gap-1 mt-1"><select name="topicId" value={editingDocument.topicId || ''} onChange={handleFormChange} className="flex-grow p-2 border rounded-md"><option value="">{t.selectPlaceholder}</option>{documentTopics.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}</select></div></div>
                                </div>
                                <div className="space-y-4">
                                    <div><label className="block text-sm font-medium">{t.space}</label><select name="spaceId" value={editingDocument.spaceId ?? ''} onChange={handleFormChange} className="mt-1 w-full p-2 border rounded-md"><option value="">{t.filterAll}</option>{manageableSpaces.map(item => <option key={item.id as number} value={item.id as number}>{item.name}</option>)}</select></div>
                                    <div><label className="block text-sm font-medium">{t.rating}</label><input type="number" step="0.1" name="rating" value={editingDocument.rating ?? ''} onChange={handleFormChange} className="mt-1 w-full p-2 border rounded-md" /></div>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium">{t.tags}</label>
                                <div className="flex items-center gap-2 mt-1"><input type="text" value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddTag(); } }} placeholder={t.addTagPlaceholder} className="flex-grow p-2 border rounded-md" /></div>
                                <div className="mt-2 flex flex-wrap gap-2">{(editingDocument.tags || []).map((tag, i) => (<span key={i} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-light text-primary-text">{tag}<button onClick={() => handleRemoveTag(tag)} className="ml-1.5 flex-shrink-0 text-primary hover:text-primary-hover">&times;</button></span>))}</div>
                            </div>

                            <div className="border-b border-gray-200"><nav className="-mb-px flex space-x-8" aria-label="Tabs"><button onClick={() => setActiveTab('vi')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'vi' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>{t.tabVi}</button><button onClick={() => setActiveTab('en')} className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${activeTab === 'en' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>{t.tabEn}</button></nav></div>
                            {activeTab === 'vi' && (<div className="space-y-4"><div><label className="block text-sm font-medium">{t.titleHeader}</label><div className="relative"><input ref={titleInputRef} type="text" value={editingDocument.title || ''} onChange={e => handleFormChange({ target: { name: 'title', value: e.target.value } } as any)} className="mt-1 w-full p-2 border rounded-md" /><button onClick={() => handleTranslate('title', 'en', 'vi')} disabled={translatingField === 'title'} className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 disabled:opacity-50">{translatingField === 'title' ? <SpinnerIcon className="w-4 h-4" /> : <GenerateIcon className="w-4 h-4" />}</button></div></div><div><label className="block text-sm font-medium">{t.summary}</label><div className="relative"><textarea value={editingDocument.summary || ''} onChange={e => handleFormChange({ target: { name: 'summary', value: e.target.value } } as any)} rows={3} className="mt-1 w-full p-2 border rounded-md"></textarea><button onClick={() => handleTranslate('summary', 'en', 'vi')} disabled={translatingField === 'summary'} className="absolute right-2 top-2 p-1.5 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 disabled:opacity-50">{translatingField === 'summary' ? <SpinnerIcon className="w-4 h-4" /> : <GenerateIcon className="w-4 h-4" />}</button></div></div><div><label className="block text-sm font-medium mb-1">{t.dialogContentLabel}</label><TextEditor initialHtml={editingDocument.content || ''} placeholder={t.dialogContentPlaceholder} onContentChange={html => handleFormChange({ target: { name: 'content', value: html } } as any)} onFileExtract={(file) => handleFileExtract(file, 'vi')} isExtracting={extractingFor === 'vi'} language={language} /></div><div className="pt-2"><label className="block text-sm font-medium mb-1">{t.uploadAudio}</label><div className="flex items-center gap-4"><input type="file" ref={fileInputRefs.audio} onChange={(e) => handleFileChange(e, 'audioUrl')} className="hidden" accept="audio/*" /><button type="button" onClick={() => fileInputRefs.audio.current?.click()} disabled={isSaving} className="px-4 py-2 text-sm border rounded-md">{isSaving ? t.saving : t.uploadAudio}</button>{editingDocument.audioUrl && <audio controls src={editingDocument.audioUrl} className="max-w-xs" />}<button onClick={() => handleGenerateAudio('vi')} disabled={isGeneratingAudioFor === 'vi' || !documentConfig} className="flex items-center gap-2 px-4 py-2 text-sm border rounded-md bg-green-50 text-green-700 hover:bg-green-100 disabled:opacity-50">{isGeneratingAudioFor === 'vi' ? <SpinnerIcon className="w-5 h-5" /> : <SoundWaveIcon className="w-5 h-5" />}<span>{isGeneratingAudioFor === 'vi' ? t.generatingAudio : t.generateAudio}</span></button></div></div></div>)}
                            {activeTab === 'en' && (<div className="space-y-4"><div><label className="block text-sm font-medium">{t.titleEn}</label><div className="relative"><input type="text" value={editingDocument.titleEn || ''} onChange={e => handleFormChange({ target: { name: 'titleEn', value: e.target.value } } as any)} className="mt-1 w-full p-2 border rounded-md" /><button onClick={() => handleTranslate('title', 'vi', 'en')} disabled={translatingField === 'title'} className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 disabled:opacity-50">{translatingField === 'title' ? <SpinnerIcon className="w-4 h-4" /> : <GenerateIcon className="w-4 h-4" />}</button></div></div><div><label className="block text-sm font-medium">{t.summaryEn}</label><div className="relative"><textarea value={editingDocument.summaryEn || ''} onChange={e => handleFormChange({ target: { name: 'summaryEn', value: e.target.value } } as any)} rows={3} className="mt-1 w-full p-2 border rounded-md"></textarea><button onClick={() => handleTranslate('summary', 'vi', 'en')} disabled={translatingField === 'summary'} className="absolute right-2 top-2 p-1.5 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 disabled:opacity-50">{translatingField === 'summary' ? <SpinnerIcon className="w-4 h-4" /> : <GenerateIcon className="w-4 h-4" />}</button></div></div><div><label className="block text-sm font-medium mb-1">{t.dialogContentLabelEn}</label><TextEditor initialHtml={editingDocument.contentEn || ''} placeholder={t.dialogContentPlaceholder} onContentChange={html => handleFormChange({ target: { name: 'contentEn', value: html } } as any)} onFileExtract={(file) => handleFileExtract(file, 'en')} isExtracting={extractingFor === 'en'} language={language} /></div><div className="pt-2"><label className="block text-sm font-medium mb-1">{t.uploadAudioEn}</label><div className="flex items-center gap-4"><input type="file" ref={fileInputRefs.audio_en} onChange={(e) => handleFileChange(e, 'audioUrlEn')} className="hidden" accept="audio/*" /><button type="button" onClick={() => fileInputRefs.audio_en.current?.click()} disabled={isSaving} className="px-4 py-2 text-sm border rounded-md">{isSaving ? t.saving : t.uploadAudioEn}</button>{editingDocument.audioUrlEn && <audio controls src={editingDocument.audioUrlEn} className="max-w-xs" />}<button onClick={() => handleGenerateAudio('en')} disabled={isGeneratingAudioFor === 'en' || !documentConfig} className="flex items-center gap-2 px-4 py-2 text-sm border rounded-md bg-green-50 text-green-700 hover:bg-green-100 disabled:opacity-50">{isGeneratingAudioFor === 'en' ? <SpinnerIcon className="w-5 h-5" /> : <SoundWaveIcon className="w-5 h-5" />}<span>{isGeneratingAudioFor === 'en' ? t.generatingAudio : t.generateAudio}</span></button></div></div></div>)}

                        </div>
                        <div className="p-4 border-t flex justify-end gap-2 flex-shrink-0">
                            <button onClick={() => setIsDialogOpen(false)} className="px-4 py-2 bg-gray-200 rounded-md">{t.cancel}</button>
                            {editingDocument.id === 'new' && (
                                <button onClick={() => handleSave(true)} disabled={isSaving} className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50">
                                    {isSaving ? t.saving : t.saveAndContinue}
                                </button>
                            )}
                            <button onClick={() => handleSave(false)} disabled={isSaving} className="px-4 py-2 bg-primary text-white rounded-md">{isSaving ? t.saving : t.save}</button>
                        </div>
                    </div>
                </div>
            )}
            {isPreviewOpen && editingDocument && (
                <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4" onClick={() => setIsPreviewOpen(false)}>
                    <div className="bg-background-panel rounded-lg shadow-xl w-full max-w-3xl h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
                        <h2 className="text-xl font-bold p-4 border-b">{t.previewTitle}</h2>
                        <div className="flex-1 overflow-y-auto p-6">
                            <h1 className="text-3xl font-bold font-serif mb-2">{editingDocument.title}</h1>
                            <p className="text-text-light mb-4">{t.author}: {editingDocument.author}</p>
                            <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: editingDocument.content || '' }}></div>
                        </div>
                        <div className="p-4 border-t text-right">
                            <button onClick={() => setIsPreviewOpen(false)} className="px-4 py-2 bg-primary text-white rounded-md">{t.close}</button>
                        </div>
                    </div>
                </div>
            )}
            {managingCategory && categoryConfig[managingCategory] && (
                <CategoryManagerModal
                    isOpen={isCategoryModalOpen}
                    onClose={() => setIsCategoryModalOpen(false)}
                    onUpdate={handleCategoryUpdate}
                    language={language}
                    category={categoryConfig[managingCategory]}
                    user={user}
                    spaces={manageableSpaces}
                    documentTypes={documentTypes}
                    documentAuthors={documentAuthors}
                    initialSpaceId={filters.spaceId}
                />
            )}
            <DocumentConfigModal
                isOpen={isConfigModalOpen}
                onClose={() => setIsConfigModalOpen(false)}
                initialConfig={documentConfig}
                onSaveSuccess={(newConfig) => setDocumentConfig(newConfig)}
                language={language}
                user={user}
            />
        </div>
    );
};
