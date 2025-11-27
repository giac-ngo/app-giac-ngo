import React, { useState, useRef, useEffect, useCallback, useMemo, useLayoutEffect } from 'react';
import { AIConfig, Message, User, TrainingDataSource, KoiiTask, Conversation, Document, Tag, Space } from '../../types';
import { apiService } from '../../services/apiService';
import { useToast } from '../ToastProvider';
import { ExpandIcon, PaperclipIcon, BrainwaveIcon, KoiiIcon, TrashIcon, InfoIcon, BookOpenIcon } from '../Icons';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { normalizePostgresArray } from '../../utils/arrayUtils';

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
        aiName: 'Tên AI (VI)',
        aiNameEn: 'Tên AI (EN)',
        aiDescription: 'Mô tả AI (VI)',
        aiDescriptionEn: 'Mô tả AI (EN)',
        provider: 'Nhà cung cấp (Provider)',
        modelSelection: 'Chọn Model',
        loadingModels: 'Đang tải model...',
        selectModel: 'Vui lòng chọn model',
        modelLoadError: 'Lỗi: Không thể tải model',
        addKeyForProvider: 'Vui lòng thêm API key cho {provider} trong Cài đặt.',
        tags: 'Thẻ (Tags)',
        addTagPlaceholder: 'Nhập thẻ mới...',
        addTag: 'Thêm',
        suggestedQuestions: 'Câu hỏi gợi ý (VI)',
        suggestedQuestionsEn: 'Câu hỏi gợi ý (EN)',
        addSuggestedQuestionPlaceholder: 'Mỗi câu trên một dòng (tối đa 4)...',
        trainingContent: 'Nội dung huấn luyện (System Prompt)',
        additionalTrainingContent: 'Dữ liệu huấn luyện Q&A',
        attachedFiles: 'File huấn luyện đính kèm',
        attachFile: 'Đính kèm file',
        delete: 'Xóa',
        save: 'Lưu',
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
        suggestedQuestionsLimit: 'Bạn chỉ có thể nhập tối đa 4 câu hỏi gợi ý.',
        accountExpiredTitle: 'Tài khoản của bạn đã hết merit.',
        accountExpiredBodyTestChat: 'Vui lòng nạp thêm merit để sử dụng khung chat thử nghiệm.',
        saveSuccess: 'Lưu thay đổi thành công!',
        saveError: 'Lưu thất bại: {message}',
        errorAiNameRequired: 'Tên AI không được để trống.',
        errorSpaceRequired: 'Vui lòng chọn một Không gian cho AI.',
        errorAvatarRequired: 'Vui lòng tải lên một ảnh đại diện.',
        deleteSuccess: 'Xóa AI thành công!',
        deleteError: 'Xóa thất bại: {message}',
        deleteTrainingDataSuccess: 'Đã xóa dữ liệu huấn luyện.',
        deleteTrainingDataError: 'Xóa dữ liệu huấn luyện thất bại: {message}',
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
        addedToTraining: 'Đã thêm vào dữ liệu huấn luyện!',
        untrainPair: 'Hủy huấn luyện cặp này',
        trainingPair: 'Đang xử lý...',
        trainRequestFailed: 'Thêm cặp Hỏi-Đáp thất bại: {error}',
        untrainSuccess: 'Đã hủy huấn luyện cặp Hỏi-Đáp.',
        untrainError: 'Hủy huấn luyện thất bại: {error}',
        apiEndpoint: 'API Endpoint',
        apiEndpointDesc: 'Sử dụng thông tin này để gọi AI từ một ứng dụng khác qua API.',
        method: 'Phương thức',
        endpointUrl: 'URL Endpoint',
        headers: 'Headers',
        bodyPayload: 'Body Payload (JSON)',
        copy: 'Sao chép',
        copied: 'Đã sao chép!',
        noQA: 'Chưa có dữ liệu Q&A. Sử dụng khung chat thử nghiệm và nhấn "Thêm vào Huấn luyện" để tạo dữ liệu.',
        question: 'Hỏi',
        answer: 'Đáp',
        qaDataFor: 'Dữ liệu Q&A cho',
        close: 'Đóng',
        fineTunedModelId: 'ID Model đã Fine-tune',
        fineTuningJobs: 'Các tác vụ Fine-tuning',
        loadingJobs: 'Đang tải tác vụ...',
        noJobs: 'Không có tác vụ fine-tuning nào cho AI này.',
        startFineTune: 'Bắt đầu Tác vụ Fine-tune Mới',
        startFineTuneSuccess: 'Đã bắt đầu tác vụ fine-tuning!',
        startFineTuneError: 'Bắt đầu tác vụ thất bại: {message}',
        useThisModel: 'Sử dụng model này',
        modelSetSuccess: 'Đã đặt ID model. Vui lòng Lưu thay đổi để áp dụng.',
        pendingUpload: 'Chờ tải lên',
        expand: 'Mở rộng',
        shrink: 'Thu nhỏ',
        syncWithVectorDb: 'Đồng bộ với Vector DB',
        syncing: 'Đang đồng bộ...',
        syncQueued: 'Đã đưa vào hàng đợi đồng bộ.',
        syncComplete: 'Đồng bộ hoàn tất!',
        nothingToSync: 'Không có dữ liệu mới để đồng bộ.',
        submitToKoii: 'Gửi đến Koii để Huấn luyện',
        koiiStatus: 'Trạng thái tác vụ Koii',
        koiiStatusIdle: 'Chưa có tác vụ nào',
        koiiStatusPending: 'Đang chờ xử lý',
        koiiStatusProcessing: 'Đang xử lý',
        koiiStatusCompleted: 'Hoàn thành',
        koiiStatusFailed: 'Thất bại',
        lastUpdate: 'Cập nhật lần cuối',
        trainingDataSources: 'Nguồn dữ liệu huấn luyện',
        filterByStatus: 'Lọc trạng thái',
        statusAll: 'Tất cả',
        statusIndexed: 'Đã index',
        statusNotIndexed: 'Chưa index',
        loadingOlderMessages: 'Đang tải tin nhắn cũ...',
        aiSummary: 'Tóm tắt bởi AI:',
        generateSummary: 'Tạo tóm tắt',
        generatingSummary: 'Đang tạo...',
        generateSummarySuccess: 'Tạo tóm tắt thành công!',
        generateSummaryError: 'Tạo tóm tắt thất bại: {message}',
        summarizeAllFiles: 'Tóm tắt tất cả',
        summarizingAll: 'Đang tóm tắt...',
        noFilesToSummarize: 'Không có file nào cần tóm tắt.',
        manageTrainingFiles: 'Quản lý File Huấn luyện',
        largeFileWarning: 'Tệp này chưa được tóm tắt. Lập chỉ mục toàn bộ nội dung có thể tốn nhiều tài nguyên và có thể gặp giới hạn. Bạn nên tạo bản tóm tắt.',
        unsavedChangesTitle: 'Thay đổi chưa được lưu',
        unsavedChangesBody: 'Bạn có thay đổi chưa lưu. Bạn có chắc muốn hủy bỏ chúng không?',
        aiThought: 'Suy nghĩ của AI',
        loadingTestHistory: 'Đang tải lịch sử thử nghiệm...',
        noTestHistory: 'Không có lịch sử thử nghiệm. Bắt đầu chat để tạo dữ liệu.',
        tokenEstimation: 'Ước tính Token (~1 token / 4 chars)',
        tokenEstimationPlaceholder: 'Nhập tin nhắn để tính token.',
        systemPrompt: 'System Prompt',
        trainingDataQA: 'Dữ liệu Huấn luyện Q&A',
        fileSummary: 'Tóm tắt Tệp',
        documentSummary: 'Tóm tắt Tài liệu',
        ragContext: 'Ngữ cảnh RAG (Tìm kiếm Backend)',
        history: 'Lịch sử Chat',
        currentUserMessage: 'Tin nhắn hiện tại',
        total: 'Tổng cộng',
        maxOutputTokensLabel: 'Max Output Tokens',
        maxOutputTokensDesc: 'Giới hạn số token tối đa cho câu trả lời để tránh lỗi rate limit.',
        thinkingBudgetLabel: 'Thinking Budget',
        thinkingBudgetDesc: 'Số token dành cho Gemini "suy nghĩ". Bắt buộc nếu có Max Tokens.',
        selectFromLibrary: 'Chọn từ Thư viện',
        linkedDocuments: 'Tài liệu đã liên kết',
        unlinkSuccess: 'Đã hủy liên kết tài liệu.',
        unlinkError: 'Hủy liên kết thất bại: {message}',
        selectDocuments: {
            title: 'Chọn Tài liệu từ Thư viện',
            description: 'Chọn các tài liệu bạn muốn liên kết với AI này. Các tài liệu đã được tóm tắt sẽ cung cấp ngữ cảnh tốt nhất.',
            addSelected: 'Thêm các tài liệu đã chọn',
            adding: 'Đang thêm...',
            noDocsAvailable: 'Không có tài liệu nào để liên kết. Vui lòng tải lên tài liệu trong mục "Tệp & Tài liệu" trước.',
            searchPlaceholder: 'Tìm tài liệu...',
            cancel: 'Hủy',
        },
        space: 'Không gian',
        tabConfiguration: 'Cấu Hình',
        tabTraining: 'Huấn luyện',
        tabTagsAndSuggestions: 'Tag & Gợi ý',
    },
    en: {
        aiList: 'AI List',
        newAi: 'New AI',
        loading: 'Loading AI configurations...',
        configuration: 'Configuration',
        changeAvatar: 'Change Avatar',
        aiName: 'AI Name (VI)',
        aiNameEn: 'AI Name (EN)',
        aiDescription: 'AI Description (VI)',
        aiDescriptionEn: 'AI Description (EN)',
        provider: 'Provider',
        modelSelection: 'Model Selection',
        loadingModels: 'Loading models...',
        selectModel: 'Please select a model',
        modelLoadError: 'Error: Could not load models',
        addKeyForProvider: 'Please add an API key for {provider} in Settings.',
        tags: 'Tags',
        addTagPlaceholder: 'Enter new tag...',
        addTag: 'Add',
        suggestedQuestions: 'Suggested Questions (VI)',
        suggestedQuestionsEn: 'Suggested Questions (EN)',
        addSuggestedQuestionPlaceholder: 'One per line (max 4)...',
        trainingContent: 'Training Content (System Prompt)',
        additionalTrainingContent: 'Q&A Training Data',
        attachedFiles: 'Attached Training Files',
        attachFile: 'Attach File',
        delete: 'Delete',
        save: 'Save',
        saving: 'Saving...',
        testChat: 'Test Chat Window',
        chatPlaceholder: 'Chat with the AI...',
        selectOrCreate: 'Select an AI to see details or create a new one.',
        publicAi: 'Make this AI public',
        publicAiDescription: 'If enabled, this AI will be visible to all users.',
        owner: 'Owner',
        readOnly: 'You can only view this AI as you are not the owner.',
        confirmDeleteTitle: 'Confirm AI Deletion',
        confirmDeleteBody: 'Are you sure you want to delete "{name}"? This action cannot be undone.',
        cancel: 'Cancel',
        uploading: 'Uploading...',
        micNotSupported: 'Browser does not support speech recognition.',
        startRecording: 'Start Recording',
        stopRecording: 'Stop Recording',
        suggestedQuestionsLimit: 'You can only enter a maximum of 4 suggested questions.',
        accountExpiredTitle: 'Your account has run out of merits.',
        accountExpiredBodyTestChat: 'Please top up your merits to use the test chat.',
        saveSuccess: 'Changes saved successfully!',
        saveError: 'Save failed: {message}',
        errorAiNameRequired: 'AI name cannot be empty.',
        errorSpaceRequired: 'Please select a Space for the AI.',
        errorAvatarRequired: 'Please upload an avatar.',
        deleteSuccess: 'AI deleted successfully!',
        deleteError: 'Delete failed: {message}',
        deleteTrainingDataSuccess: 'Training data deleted.',
        deleteTrainingDataError: 'Failed to delete training data: {message}',
        uploadError: 'File upload failed.',
        trialAllowed: 'Allow Trial',
        trialAllowedDesc: 'Users on the Trial plan can see this AI.',
        requiresSub: 'Requires Subscription',
        requiresSubDesc: 'Only users with a paid plan can see this AI.',
        noFiles: 'No files attached.',
        public: 'Public',
        planTrial: 'Trial',
        planPaid: 'Paid',
        planFree: 'Free',
        addToTraining: 'Add to Training',
        addedToTraining: 'Added to training data!',
        untrainPair: 'Untrain this pair',
        trainingPair: 'Processing...',
        trainRequestFailed: 'Failed to add Q&A pair: {error}',
        untrainSuccess: 'Untrained Q&A pair successfully.',
        untrainError: 'Untrain failed: {error}',
        apiEndpoint: 'API Endpoint',
        apiEndpointDesc: 'Use this info to call the AI from another application via API.',
        method: 'Method',
        endpointUrl: 'Endpoint URL',
        headers: 'Headers',
        bodyPayload: 'Body Payload (JSON)',
        copy: 'Copy',
        copied: 'Copied!',
        noQA: 'No Q&A data yet. Use the test chat and click "Add to Training" to create data.',
        question: 'Question',
        answer: 'Answer',
        qaDataFor: 'Q&A Data for',
        close: 'Close',
        fineTunedModelId: 'Fine-tuned Model ID',
        fineTuningJobs: 'Fine-tuning Jobs',
        loadingJobs: 'Loading jobs...',
        noJobs: 'No fine-tuning jobs for this AI.',
        startFineTune: 'Start New Fine-tune Job',
        startFineTuneSuccess: 'Fine-tuning job started!',
        startFineTuneError: 'Failed to start job: {message}',
        useThisModel: 'Use this model',
        modelSetSuccess: 'Model ID set. Please Save Changes to apply.',
        pendingUpload: 'Pending upload',
        expand: 'Expand',
        shrink: 'Shrink',
        syncWithVectorDb: 'Sync with Vector DB',
        syncing: 'Syncing...',
        syncQueued: 'Sync has been queued.',
        syncComplete: 'Sync complete!',
        nothingToSync: 'No new data to sync.',
        submitToKoii: 'Submit to Koii for Training',
        koiiStatus: 'Koii Task Status',
        koiiStatusIdle: 'No tasks yet',
        koiiStatusPending: 'Pending',
        koiiStatusProcessing: 'Processing',
        koiiStatusCompleted: 'Completed',
        koiiStatusFailed: 'Failed',
        lastUpdate: 'Last Updated',
        trainingDataSources: 'Training Data Sources',
        filterByStatus: 'Filter by status',
        statusAll: 'All',
        statusIndexed: 'Indexed',
        statusNotIndexed: 'Not Indexed',
        loadingOlderMessages: 'Loading older messages...',
        aiSummary: 'AI Summary:',
        generateSummary: 'Generate Summary',
        generatingSummary: 'Generating...',
        generateSummarySuccess: 'Summary generated successfully!',
        generateSummaryError: 'Failed to generate summary: {message}',
        summarizeAllFiles: 'Summarize All',
        summarizingAll: 'Summarizing...',
        noFilesToSummarize: 'No files need summarizing.',
        manageTrainingFiles: 'Manage Training Files',
        largeFileWarning: 'This file has not been summarized. Indexing the full content may be resource-intensive and hit limits. It is recommended to generate a summary.',
        unsavedChangesTitle: 'Unsaved Changes',
        unsavedChangesBody: 'You have unsaved changes. Are you sure you want to discard them?',
        aiThought: 'AI Thought',
        loadingTestHistory: 'Loading test history...',
        noTestHistory: 'No test history. Start chatting to create data.',
        tokenEstimation: 'Token Estimation (~1 token / 4 chars)',
        tokenEstimationPlaceholder: 'Type a message to calculate tokens.',
        systemPrompt: 'System Prompt',
        trainingDataQA: 'Q&A Training Data',
        fileSummary: 'File Summaries',
        documentSummary: 'Document Summaries',
        ragContext: 'RAG Context (Backend Search)',
        history: 'Chat History',
        currentUserMessage: 'Current Message',
        total: 'Total',
        maxOutputTokensLabel: 'Max Output Tokens',
        maxOutputTokensDesc: 'Limit the maximum number of tokens for the response to avoid rate limit errors.',
        thinkingBudgetLabel: 'Thinking Budget',
        thinkingBudgetDesc: 'Number of tokens for Gemini to "think". Required if Max Tokens is set.',
        selectFromLibrary: 'Select from Library',
        linkedDocuments: 'Linked Documents',
        unlinkSuccess: 'Unlinked document successfully.',
        unlinkError: 'Failed to unlink document: {message}',
        selectDocuments: {
            title: 'Select Documents from Library',
            description: 'Choose documents you want to link to this AI. Summarized documents will provide the best context.',
            addSelected: 'Add Selected Documents',
            adding: 'Adding...',
            noDocsAvailable: 'No documents available to link. Please upload documents in the "Files & Documents" section first.',
            searchPlaceholder: 'Search documents...',
            cancel: 'Cancel',
        },
        space: 'Space',
        tabConfiguration: 'Configuration',
        tabTraining: 'Training',
        tabTagsAndSuggestions: 'Tags & Suggestions',
    }
};

const INITIAL_MESSAGES_COUNT = 10;
const MESSAGE_BATCH_SIZE = 10;

const KoiiTaskStatusDisplay: React.FC<{ status: KoiiTask | null, language: 'vi' | 'en' }> = ({ status, language }) => {
    const t = translations[language];
    const getStatusInfo = () => {
        if (!status) {
            return { text: t.koiiStatusIdle, color: 'text-gray-500', icon: <div className="w-3 h-3 bg-gray-400 rounded-full"></div> };
        }
        switch (status.status) {
            case 'pending':
                return { text: t.koiiStatusPending, color: 'text-yellow-600', icon: <div className="w-3 h-3 bg-yellow-400 rounded-full animate-pulse"></div> };
            case 'processing':
                return { text: t.koiiStatusProcessing, color: 'text-blue-600', icon: <div className="w-3 h-3 border-2 border-dashed rounded-full animate-spin border-blue-500"></div> };
            case 'completed':
                return { text: t.koiiStatusCompleted, color: 'text-green-600', icon: <div className="w-3 h-3 bg-green-500 rounded-full"></div> };
            case 'failed':
                return { text: t.koiiStatusFailed, color: 'text-red-600', icon: <div className="w-3 h-3 bg-red-500 rounded-full"></div> };
            default:
                return { text: t.koiiStatusIdle, color: 'text-gray-500', icon: <div className="w-3 h-3 bg-gray-400 rounded-full"></div> };
        }
    };

    const { text, color, icon } = getStatusInfo();
    const lastUpdate = status ? new Date(status.updatedAt).toLocaleString(language === 'vi' ? 'vi-VN' : 'en-US') : 'N/A';

    return (
        <div>
            <label className="block text-sm font-medium text-text-main">{t.koiiStatus}</label>
            <div className="mt-1 flex items-center gap-4 p-3 border border-border-color rounded-lg bg-background-light">
                <KoiiIcon className="w-8 h-8 text-gray-400 flex-shrink-0" />
                <div className="flex-grow">
                    <div className="flex items-center gap-2">
                        {icon}
                        <span className={`font-semibold text-sm ${color}`}>{text}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{t.lastUpdate}: {lastUpdate}</p>
                     {status?.status === 'failed' && <p className="text-xs text-red-500 mt-1 truncate" title={status.errorMessage}>Error: {status.errorMessage}</p>}
                </div>
            </div>
        </div>
    );
}

// New Modal Component for Training Data
const TrainingDataModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    title: string;
    data: TrainingDataSource[];
    stagedFiles?: File[];
    onDelete: (id: number | "new") => void;
    deletingIds: Set<number>;
    isFormDisabled: boolean;
    language: 'vi' | 'en';
    type: 'qa' | 'file';
    getStatusIcon: (item: TrainingDataSource) => React.ReactNode;
    onFileChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onRemoveStagedFile?: (index: number) => void;
    isUploading?: boolean;
    summarizingId?: number | null;
    onSummarize?: (id: number) => void;
    onSummarizeAll?: () => void;
    isSummarizingAll?: boolean;
    filesNeedingSummaryCount?: number;
}> = (props) => {
    const { isOpen, onClose, title, data, stagedFiles, onDelete, deletingIds, isFormDisabled, language, type, getStatusIcon, onFileChange, onRemoveStagedFile, isUploading, summarizingId, onSummarize, onSummarizeAll, isSummarizingAll, filesNeedingSummaryCount } = props;
    const t = translations[language];
    const modalFileInputRef = useRef<HTMLInputElement>(null);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-background-panel rounded-lg shadow-xl w-full max-w-5xl flex flex-col h-[90vh]" onClick={(e) => e.stopPropagation()}>
                <div className="p-4 border-b border-border-color flex-shrink-0 flex justify-between items-center">
                    <h2 className="text-xl font-bold">{title}</h2>
                    {type === 'file' && onFileChange && (
                         <div className="flex items-center space-x-2">
                            <button
                                type="button"
                                onClick={onSummarizeAll}
                                disabled={isFormDisabled || isSummarizingAll || (filesNeedingSummaryCount ?? 0) === 0}
                                className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-text-main bg-background-panel border border-border-color rounded-md shadow-sm hover:bg-background-light disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSummarizingAll ? t.summarizingAll : `${t.summarizeAllFiles} (${filesNeedingSummaryCount})`}
                            </button>
                            <input type="file" ref={modalFileInputRef} onChange={onFileChange} className="hidden" />
                            <button type="button" onClick={() => modalFileInputRef.current?.click()} disabled={isUploading || isFormDisabled} className="px-3 py-2 text-sm font-medium text-text-on-primary bg-primary rounded-md hover:bg-primary-hover disabled:opacity-50">
                                {isUploading ? t.uploading : t.attachFile}
                            </button>
                        </div>
                    )}
                </div>
                <div className="flex-grow p-4 overflow-y-auto space-y-3">
                    {data.length === 0 && (!stagedFiles || stagedFiles.length === 0) && (
                         <div className="flex items-center justify-center h-full text-center text-sm text-text-light">{type === 'qa' ? t.noQA : t.noFiles}</div>
                    )}
                    {stagedFiles?.map((file, index) => (
                        <div key={`staged-${index}`} className="flex justify-between items-center bg-blue-50 border border-blue-200 px-3 py-2 rounded-lg text-sm">
                            <span className="text-blue-800 truncate" title={file.name}>{file.name}</span>
                            <div className='flex items-center'>
                                <span className="text-xs text-blue-600 mr-2">{t.pendingUpload}</span>
                                {onRemoveStagedFile && <button onClick={() => onRemoveStagedFile(index)} className="text-blue-700 hover:text-accent-red-hover flex-shrink-0 text-lg leading-none">&times;</button>}
                            </div>
                        </div>
                    ))}
                    {data.map(item => (
                        <div key={item.id} className="group relative p-3 bg-background-light rounded-lg text-sm border border-border-color">
                           <div className="flex items-start gap-3">
                                <div className="mt-1.5 flex-shrink-0">{getStatusIcon(item)}</div>
                                <div className="flex-1">
                                    {type === 'qa' && (
                                        <>
                                            <p className="mb-1"><strong className="font-semibold text-primary-text">{t.question}:</strong> {item.question}</p>
                                            <p><strong className="font-semibold text-primary-text">{t.answer}:</strong> {item.answer}</p>
                                            {item.thought && (
                                                <div className="mt-2 text-xs text-gray-600 border-t border-gray-200 pt-2 italic">
                                                    <p className="font-semibold text-gray-700">{t.aiThought}:</p>
                                                    <p className="whitespace-pre-wrap">{item.thought}</p>
                                                </div>
                                            )}
                                        </>
                                    )}
                                    {type === 'file' && (
                                         <div className="flex items-center gap-2">
                                            <a href={item.fileUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-semibold" title={item.fileName}>{item.fileName}</a>
                                            {!item.summary && (
                                                <div className="text-yellow-500 cursor-help" title={t.largeFileWarning}>
                                                    <InfoIcon className="w-4 h-4" />
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                                {!isFormDisabled && <button onClick={() => onDelete(item.id)} disabled={typeof item.id === 'number' && deletingIds.has(item.id)} className="absolute top-2 right-2 p-1 rounded-full bg-gray-300 text-white opacity-0 group-hover:opacity-100 hover:bg-accent-red disabled:opacity-50"><TrashIcon className="w-4 h-4" /></button>}
                           </div>
                             {type === 'file' && item.summary ? (
                                <div className="mt-2 pt-2 border-t border-border-color w-full">
                                    <p className="text-xs font-semibold text-text-light mb-1">{t.aiSummary}</p>
                                    <p className="text-xs text-gray-600 italic">
                                        {item.summary}
                                    </p>
                                </div>
                            ) : type === 'file' && typeof item.id === 'number' && !isFormDisabled && onSummarize && (
                                <div className="mt-2 pt-2 border-t border-border-color w-full">
                                    <button
                                        onClick={() => onSummarize(item.id as number)}
                                        disabled={summarizingId === item.id}
                                        className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 disabled:opacity-50 disabled:cursor-wait"
                                    >
                                        {summarizingId === item.id ? t.generatingSummary : t.generateSummary}
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
                <div className="p-4 border-t border-border-color text-right">
                    <button onClick={onClose} className="px-5 py-2 text-sm font-medium text-text-on-primary bg-primary rounded-md hover:bg-primary-hover">{t.close}</button>
                </div>
            </div>
        </div>
    );
};

const SelectDocumentModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onAdd: (documents: Document[]) => void;
    aiConfigId: number;
    language: 'vi' | 'en';
    existingLinkedDocIds: number[];
}> = ({ isOpen, onClose, onAdd, aiConfigId, language, existingLinkedDocIds }) => {
    const t = translations[language].selectDocuments;
    const { showToast } = useToast();
    const [allDocuments, setAllDocuments] = useState<Document[]>([]);
    const [allTags, setAllTags] = useState<Tag[]>([]);
    const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());
    const [selectedDocIds, setSelectedDocIds] = useState<Set<number>>(new Set());
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        if (isOpen) {
            setIsLoading(true);
            Promise.all([
                apiService.getDocuments(),
                apiService.getAllTags()
            ])
            .then(([docs, tags]) => {
               setAllDocuments(docs.data || []);
                setAllTags(tags || []);
            })
            .catch(() => showToast('Failed to fetch library data', 'error'))
            .finally(() => setIsLoading(false));
        } else {
            // Reset state when closed
            setSelectedDocIds(new Set());
            setSelectedTags(new Set());
            setSearchTerm('');
        }
    }, [isOpen, showToast]);

    const handleToggleSelection = (docId: number) => {
        setSelectedDocIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(docId)) {
                newSet.delete(docId);
            } else {
                newSet.add(docId);
            }
            return newSet;
        });
    };
    
     const handleToggleTag = (tagName: string) => {
        setSelectedTags(prev => {
            const newSet = new Set(prev);
            if (newSet.has(tagName)) {
                newSet.delete(tagName);
            } else {
                newSet.add(tagName);
            }
            return newSet;
        });
    };

    const handleSave = async () => {
        if (selectedDocIds.size === 0) {
            onClose();
            return;
        }
        setIsSaving(true);
        try {
            const selectedDocs = allDocuments.filter(doc => selectedDocIds.has(doc.id as number));
            await apiService.linkDocumentsToAi(aiConfigId, Array.from(selectedDocIds));
            onAdd(selectedDocs);
            onClose();
        } catch (error: any) {
            showToast(error.message || 'Failed to link documents', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    const availableDocuments = useMemo(() => {
        return allDocuments
            .filter(doc => !existingLinkedDocIds.includes(doc.id as number))
            .filter(doc => 
                (doc.title || '').toLowerCase().includes(searchTerm.toLowerCase())
            )
            .filter(doc => {
                if (selectedTags.size === 0) return true;
                return Array.from(selectedTags).every(tag => (doc.tags || []).includes(tag));
            });
    }, [allDocuments, existingLinkedDocIds, searchTerm, selectedTags]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-background-panel rounded-lg shadow-xl w-full max-w-4xl flex flex-col h-[90vh]" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-border-color">
                    <h2 className="text-xl font-bold">{t.title}</h2>
                    <p className="text-sm text-text-light mt-1">{t.description}</p>
                </div>
                <div className="p-4 border-b border-border-color">
                     <input
                        type="text"
                        placeholder={t.searchPlaceholder}
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full p-2 border border-border-color rounded-md"
                    />
                    <div className="mt-2 flex flex-wrap gap-2">
                        {allTags.map(tag => (
                            <button 
                                key={tag.id}
                                onClick={() => handleToggleTag(tag.name)}
                                className={`px-3 py-1 text-xs font-medium rounded-full border transition-colors ${
                                    selectedTags.has(tag.name) 
                                    ? 'bg-primary text-white border-primary' 
                                    : 'bg-background-light border-border-color hover:bg-gray-200'
                                }`}
                            >
                                {tag.name}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="flex-grow p-4 pt-0 overflow-y-auto">
                    {isLoading ? (
                        <p className="text-center text-text-light mt-8">Loading...</p>
                    ) : availableDocuments.length === 0 ? (
                        <p className="text-center text-text-light mt-8">{t.noDocsAvailable}</p>
                    ) : (
                        <div className="space-y-2">
                            {availableDocuments.map(doc => (
                                <label key={doc.id} className="flex items-center p-3 space-x-3 bg-background-light rounded-md border border-border-color cursor-pointer hover:border-primary has-[:checked]:bg-primary-light has-[:checked]:border-primary transition-colors">
                                    <input
                                        type="checkbox"
                                        checked={selectedDocIds.has(doc.id as number)}
                                        onChange={() => handleToggleSelection(doc.id as number)}
                                        className="h-5 w-5 rounded text-primary focus:ring-primary border-gray-300"
                                    />
                                    <div className="flex-1 overflow-hidden">
                                        <p className="font-semibold text-text-main truncate" title={doc.title}>{doc.title}</p>
                                        <p className="text-sm text-text-light truncate" title={doc.summary || doc.title}>{doc.summary || doc.title || 'No summary'}</p>
                                    </div>
                                    <div className="flex-shrink-0 flex flex-wrap gap-1 max-w-[40%] justify-end">
                                        {(doc.tags || []).map(tag => (
                                            <span key={tag} className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">{tag}</span>
                                        ))}
                                    </div>
                                </label>
                            ))}
                        </div>
                    )}
                </div>
                <div className="p-4 border-t border-border-color text-right space-x-2">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-md font-semibold">{t.cancel}</button>
                    <button onClick={handleSave} disabled={isSaving || selectedDocIds.size === 0} className="px-4 py-2 bg-primary text-text-on-primary rounded-md font-semibold disabled:opacity-50">
                        {isSaving ? t.adding : `${t.addSelected} (${selectedDocIds.size})`}
                    </button>
                </div>
            </div>
        </div>
    );
};


export const AiManagement: React.FC<{ language: 'vi' | 'en', user: User }> = ({ language, user }) => {
    const [aiList, setAiList] = useState<AIConfig[]>([]);
    const [allUsers, setAllUsers] = useState<User[]>([]);
    const [allSpaces, setAllSpaces] = useState<Space[]>([]);
    const [selectedAi, setSelectedAi] = useState<AIConfig | null>(null);
    const [pristineAi, setPristineAi] = useState<AIConfig | null>(null); // For checking unsaved changes
    const [trainingData, setTrainingData] = useState<TrainingDataSource[]>([]);
    const [activeTab, setActiveTab] = useState<'configuration' | 'training' | 'tags'>('configuration');
    
    // Chat states
    const [allMessages, setAllMessages] = useState<Message[]>([]);
    const [displayedMessages, setDisplayedMessages] = useState<Message[]>([]);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [isChatHistoryLoading, setIsChatHistoryLoading] = useState(false);
    const [newMessage, setNewMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [estimatedChars, setEstimatedChars] = useState<Record<string, number> | null>(null);

    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [tagInput, setTagInput] = useState('');
    const [isQaModalOpen, setIsQaModalOpen] = useState(false);
    const [isTrainingDataModalOpen, setIsTrainingDataModalOpen] = useState(false);
    const [isDocModalOpen, setIsDocModalOpen] = useState(false);
    const [stagedFiles, setStagedFiles] = useState<File[]>([]);
    const [testConversationId, setTestConversationId] = useState<number | null>(null);
    const [isChatExpanded, setIsChatExpanded] = useState(false);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [fileAttachment, setFileAttachment] = useState<{ name: string; url: string } | null>(null);

    const [isDeleteConfirmModalOpen, setIsDeleteConfirmModalOpen] = useState(false);
    const [aiToDelete, setAiToDelete] = useState<AIConfig | null>(null);
    const [deletingIds, setDeletingIds] = useState<Set<number>>(new Set());
    const [summarizingId, setSummarizingId] = useState<number | null>(null);
    const [isSummarizingAll, setIsSummarizingAll] = useState(false);
    
    const [koiiTaskStatus, setKoiiTaskStatus] = useState<KoiiTask | null>(null);
    const [isSubmittingToKoii, setIsSubmittingToKoii] = useState(false);
    const [trainingPairIndex, setTrainingPairIndex] = useState<number | null>(null);
    const [trainedPairs, setTrainedPairs] = useState<Set<string>>(new Set());


    const [availableModels, setAvailableModels] = useState<string[]>([]);
    const [isModelsLoading, setIsModelsLoading] = useState(false);
    const [modelsError, setModelsError] = useState<string | null>(null);

    const [isRecording, setIsRecording] = useState(false);
    const recognitionRef = useRef<any>(null);
    const textBeforeRecording = useRef('');

    const avatarInputRef = useRef<HTMLInputElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const testChatFileInputRef = useRef<HTMLInputElement>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const pollingIntervalRef = useRef<number | null>(null);
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const prevScrollHeightRef = useRef<number>(0);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const [trainingFilter, setTrainingFilter] = useState<'all' | 'indexed' | 'not_indexed'>('all');

    const { showToast } = useToast();
    const t = translations[language];

    // --- Derived State ---
    const isOwner = selectedAi?.ownerId === user.id;
    const canEdit = user.permissions?.includes('roles') || isOwner;
    const isApiKeyMissing = !!selectedAi && !user.apiKeys?.[selectedAi.modelType];
    const isFormDisabled = !canEdit || isApiKeyMissing;

    const filesNeedingSummaryCount = useMemo(() => {
        return trainingData.filter(d => d.type === 'file' && !d.summary && typeof d.id === 'number').length;
    }, [trainingData]);

    const manageableSpaces = useMemo(() => {
        if (user.permissions?.includes('roles')) {
            return allSpaces; // Admins can manage all spaces
        }
        return allSpaces.filter(space => space.userId === user.id);
    }, [allSpaces, user]);
    
    const isFormDirty = useCallback(() => {
        if (!selectedAi || !pristineAi) return false;
        if (stagedFiles.length > 0) return true;
        
        // Deep compare the two AI config states
        const normalizedPristine = { ...pristineAi, suggestedQuestions: normalizePostgresArray(pristineAi.suggestedQuestions), suggestedQuestionsEn: normalizePostgresArray(pristineAi.suggestedQuestionsEn) };
        const normalizedSelected = { ...selectedAi, suggestedQuestions: normalizePostgresArray(selectedAi.suggestedQuestions), suggestedQuestionsEn: normalizePostgresArray(selectedAi.suggestedQuestionsEn) };
        
        return JSON.stringify(normalizedPristine) !== JSON.stringify(normalizedSelected);
    }, [selectedAi, pristineAi, stagedFiles]);


    useEffect(() => {
        if (!isLoadingMore) {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
    }, [displayedMessages, isTyping, isLoadingMore]);

    useLayoutEffect(() => {
        if (isLoadingMore) {
            const container = chatContainerRef.current;
            if (container) {
                container.scrollTop = container.scrollHeight - prevScrollHeightRef.current;
            }
            setIsLoadingMore(false);
        }
    }, [displayedMessages, isLoadingMore]);

    const stopPolling = () => {
        if (pollingIntervalRef.current) {
            clearInterval(pollingIntervalRef.current);
            pollingIntervalRef.current = null;
        }
    };
    
    // Polling logic for Koii task status
    useEffect(() => {
        stopPolling();

        const pollStatus = async () => {
            if (!selectedAi || typeof selectedAi.id !== 'number') return;
            try {
                const status = await apiService.getKoiiTaskStatus(selectedAi.id);
                setKoiiTaskStatus(status);
                if (status?.status === 'completed' || status?.status === 'failed') {
                    stopPolling();
                }
            } catch (error) {
                console.error('Polling for Koii task status failed:', error);
                // We don't show toast here as it's a background task. 
                // The API service now handles 404s gracefully.
            }
        };

        if (selectedAi && typeof selectedAi.id === 'number') {
            pollStatus(); // Initial poll
            pollingIntervalRef.current = window.setInterval(pollStatus, 5000); // Poll every 5 seconds
        }

        return () => stopPolling();
    }, [selectedAi?.id]);

    
    useEffect(() => {
        const fetchData = async () => {
            try {
                const [configs, users, spaces] = await Promise.all([
                    apiService.getManageableAiConfigs(user),
                    apiService.getSpaceOwners(),
                    apiService.getSpaces(),
                ]);

                setAiList(configs || []);
                setAllUsers(users || []);
                setAllSpaces(spaces || []);

                if (configs && configs.length > 0) {
                    const firstAi = configs[0];
                    setSelectedAi(firstAi);
                    setPristineAi(firstAi);
                } else {
                    setSelectedAi(null);
                    setPristineAi(null);
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
        const fetchTrainingDataForCurrentAI = async () => {
            if (selectedAi && typeof selectedAi.id === 'number') {
                try {
                    const data = await apiService.getTrainingDataForAI(selectedAi.id);
                    setTrainingData(data || []);
                    const qaData = data.filter((d: any) => d.type === 'qa');
                    const existingPairs = new Set<string>(qaData.map((d: any) => `${d.question?.trim() || ''}|||${d.answer?.trim() || ''}`));
                    setTrainedPairs(existingPairs);
                } catch (error) {
                    console.error("Failed to fetch training data", error);
                    setTrainingData([]);
                    setTrainedPairs(new Set());
                }
            } else {
                setTrainingData([]);
                setTrainedPairs(new Set());
            }
        };
    
        const fetchConversations = () => {
            setIsChatHistoryLoading(true);
            setAllMessages([]);
            setDisplayedMessages([]);
            setTestConversationId(null);
            if (selectedAi && typeof selectedAi.id === 'number') {
                apiService.getTestConversationsForAI(selectedAi.id,Number(user.id))
                    .then((conversations: Conversation[]) => {
                        let fullHistory: Message[] = [];
                        let latestConversationId: number | null = null;
                        if (conversations && conversations.length > 0) {
                            // Merge all test conversations into a single chronological timeline
                            fullHistory = conversations.flatMap(c => c.messages);
                            fullHistory.sort((a, b) => a.timestamp - b.timestamp);
                            
                            // The `testConversationId` should be the ID of the most recent conversation
                            // so that new messages are appended to it.
                            const latestConversation = conversations.sort((a,b) => b.startTime - a.startTime)[0];
                            if (latestConversation) {
                                latestConversationId = latestConversation.id;
                            }
                        }
                        
                        setTestConversationId(latestConversationId);
                        setAllMessages(fullHistory);
                        setDisplayedMessages(fullHistory.slice(-INITIAL_MESSAGES_COUNT));
                        
                        setTimeout(() => {
                            const container = chatContainerRef.current;
                            if (container) container.scrollTop = container.scrollHeight;
                        }, 0);
                    })
                    .catch(error => {
                        console.error("Failed to fetch test chat history", error);
                        showToast('Could not load test chat history.', 'error');
                    })
                    .finally(() => {
                        setIsChatHistoryLoading(false);
                    });
            } else {
                 setIsChatHistoryLoading(false);
            }
        };
        
        fetchTrainingDataForCurrentAI();
        fetchConversations();
    }, [selectedAi?.id, user.id, showToast]);


    useEffect(() => {
        if (!selectedAi) return;

        const provider = selectedAi.modelType;
        setModelsError(null);
        setIsModelsLoading(false);
        setAvailableModels([]);

        const userApiKey = user.apiKeys?.[provider];
        if (!userApiKey) {
            setModelsError(t.addKeyForProvider.replace('{provider}', provider.toUpperCase()));
            if (selectedAi.modelName !== '') {
                setSelectedAi(prev => prev ? { ...prev, modelName: '' } : null);
            }
            return;
        }

        if (provider === 'gemini') {
            setAvailableModels(['gemini-2.5-flash', 'gemini-2.5-pro']);
        } else if (provider === 'grok') {
            setAvailableModels(['grok-1-mock']);
        } else if (provider === 'gpt') {
            const fetchGptModels = async () => {
                setIsModelsLoading(true);
                try {
                    if (typeof user.id !== 'number') throw new Error("Invalid user ID.");
                    const models = await apiService.getAvailableModels('gpt', user.id);
                    setAvailableModels(models);
                    if (selectedAi.modelName && !models.includes(selectedAi.modelName)) {
                         setSelectedAi(prev => prev ? { ...prev, modelName: '' } : null);
                    }
                } catch (error: any) {
                    setModelsError(error.message || t.modelLoadError);
                } finally {
                    setIsModelsLoading(false);
                }
            };
            fetchGptModels();
        }
    }, [selectedAi?.id, selectedAi?.modelType, user.apiKeys, language, user.id, t.addKeyForProvider, t.modelLoadError]);

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
    
    // Client-side token calculation
    useEffect(() => {
        if (!selectedAi) {
            setEstimatedChars(null);
            return;
        }

        const systemChars = selectedAi.trainingContent?.length || 0;
        
        const qaChars = trainingData
            .filter(d => d.type === 'qa')
            .reduce((acc, d) => acc + (d.question?.length || 0) + (d.answer?.length || 0), 0);

        const fileChars = trainingData
            .filter(d => d.type === 'file')
            .reduce((acc, d) => acc + (d.summary?.length || 0), 0); // Use summary length

        const documentChars = trainingData
            .filter(d => d.type === 'document')
            .reduce((acc, d) => acc + (d.summary?.length || 0), 0); // Use summary length

        const recentHistory = allMessages.slice(-8);
        const historyChars = recentHistory.reduce((acc, msg) => acc + (msg.text?.length || 0), 0);

        const currentMessageChars = newMessage.length;

        const totalChars = systemChars + qaChars + fileChars + documentChars + historyChars + currentMessageChars;

        setEstimatedChars({
            system: systemChars,
            qa: qaChars,
            file: fileChars,
            document: documentChars,
            history: historyChars,
            currentMessage: currentMessageChars,
            total: totalChars,
        });
        
    }, [newMessage, selectedAi, trainingData, allMessages]);


    const handleScroll = () => {
        const container = chatContainerRef.current;
        if (container && container.scrollTop === 0 && !isLoadingMore) {
            if (displayedMessages.length < allMessages.length) {
                setIsLoadingMore(true);
                prevScrollHeightRef.current = container.scrollHeight;
    
                // Use a timeout to give the UI time to show the loading indicator
                setTimeout(() => {
                    const newCount = displayedMessages.length + MESSAGE_BATCH_SIZE;
                    setDisplayedMessages(allMessages.slice(-newCount));
                }, 300);
            }
        }
    };
    
    const handleNavigationAttempt = (action: () => void) => {
        if (isFormDirty()) {
            if (window.confirm(t.unsavedChangesBody)) {
                action();
            }
        } else {
            action();
        }
    };

    const handleSelectAi = (ai: AIConfig) => {
        handleNavigationAttempt(() => {
            setSelectedAi(ai);
            setPristineAi(ai);
            setStagedFiles([]);
        });
    };

    const handleAddNewAi = () => {
        handleNavigationAttempt(() => {
            if (!user.apiKeys?.gemini) {
                showToast(t.addKeyForProvider.replace('{provider}', 'GEMINI'), 'error');
                return;
            }
    
            const newAi: AIConfig = {
                id: `new-${Date.now()}`,
                name: t.newAi,
                nameEn: 'New AI',
                description: "",
                descriptionEn: "",
                avatarUrl: "",
                trainingContent: "",
                suggestedQuestions: [],
                suggestedQuestionsEn: [],
                tags: [],
                modelType: 'gemini',
                modelName: 'gemini-2.5-flash',
                ownerId: user.id as number,
                isPublic: false,
                isTrialAllowed: false,
                requiresSubscription: false,
                maxOutputTokens: 8000,
                thinkingBudget: 2000,
                spaceId: (manageableSpaces[0]?.id as number) || null,
            };
            setAiList([...aiList, newAi]);
            setSelectedAi(newAi);
            setPristineAi(newAi);
            setTrainingData([]);
            setStagedFiles([]);
        });
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        if (!selectedAi || isFormDisabled) return;
        const { name, value, type } = e.target;
        
        let processedValue: any = value;

        if (type === 'checkbox') {
            processedValue = (e.target as HTMLInputElement).checked;
        } else if (type === 'number') {
            processedValue = value === '' ? undefined : parseInt(value, 10);
            if (isNaN(processedValue)) processedValue = undefined;
        } else if (name === 'suggestedQuestions' || name === 'suggestedQuestionsEn') {
            const questions = value.split('\n');
            if (questions.length > 4) {
                showToast(t.suggestedQuestionsLimit, 'error');
                return; 
            }
            processedValue = questions.filter(q => q.trim() !== '');
        } else if (name === 'spaceId') {
            processedValue = value === '' ? null : parseInt(value, 10);
        }
    
        const updatedAi = { ...selectedAi, [name]: processedValue };
        if (name === 'modelType') {
            updatedAi.modelName = '';
        }
        
        setSelectedAi(updatedAi);
    };

    const handleSaveChanges = async () => {
        if (!selectedAi || isFormDisabled) return;

        if (!selectedAi.name || selectedAi.name.trim() === '') {
            showToast(t.errorAiNameRequired, 'error');
            return;
        }
        if (!selectedAi.spaceId) {
            showToast(t.errorSpaceRequired, 'error');
            return;
        }
        if (!selectedAi.avatarUrl) {
            showToast(t.errorAvatarRequired, 'error');
            return;
        }

        setIsSaving(true);
        try {
            const isNew = typeof selectedAi.id === 'string' && selectedAi.id.startsWith('new-');
    
            let savedAi: AIConfig;
            if (isNew) {
                const { id, ...payload } = selectedAi;
                savedAi = await apiService.createAiConfig(payload);
            } else {
                savedAi = await apiService.updateAiConfig(selectedAi as AIConfig);
            }
    
            let newSources: TrainingDataSource[] = [];
            if (stagedFiles.length > 0) {
                if (typeof savedAi.id === 'string') {
                    throw new Error("Cannot upload files: AI config ID is not a number after saving.");
                }
                setIsUploading(true);
                const uploadPromises = stagedFiles.map(file => {
                    const formData = new FormData();
                    formData.append('file', file);
                    formData.append('type', 'file');
                    return apiService.createTrainingDataSourceForAI(savedAi.id as number, formData);
                });
                newSources = await Promise.all(uploadPromises);
                setIsUploading(false);
            }
    
            if (isNew && allMessages.some(m => m.sender === 'user')) {
                try {
                    await apiService.createConversation(savedAi.id, allMessages, user);
                } catch (convError) {
                    console.error("Could not save test conversation", convError);
                    showToast("AI saved, but failed to save the test conversation.", 'error');
                }
            }
    
            setStagedFiles([]);
            setTrainingData(prev => [...prev, ...newSources]);
            setAiList(prevList => prevList.map(ai => ai.id === selectedAi.id ? savedAi : ai));
            setSelectedAi(savedAi);
            setPristineAi(savedAi);
            
            if (isNew) {
                setAllMessages([]);
                setDisplayedMessages([]);
                setTestConversationId(null);
            }
    
            showToast(t.saveSuccess);
        } catch (error) {
            console.error("Lỗi khi lưu AI:", error);
            showToast(t.saveError.replace('{message}', (error as Error).message), 'error');
        } finally {
            setIsSaving(false);
            setIsUploading(false);
        }
    };

    const handleInitiateDelete = () => {
        if (!selectedAi || isFormDisabled || typeof selectedAi.id !== 'number') return;
        setAiToDelete(selectedAi);
        setIsDeleteConfirmModalOpen(true);
    };
    
    const handleConfirmDelete = async () => {
        if (!aiToDelete || typeof aiToDelete.id !== 'number') return;
    
        try {
            await apiService.deleteAiConfig(aiToDelete.id);
            const newList = aiList.filter(ai => ai.id !== aiToDelete.id);
            setAiList(newList);
            if (selectedAi?.id === aiToDelete.id) {
                const nextAi = newList.length > 0 ? newList[0] : null;
                setSelectedAi(nextAi);
                setPristineAi(nextAi);
            }
            showToast(t.deleteSuccess);
        } catch (error) {
            showToast(t.deleteError.replace('{message}', (error as Error).message), 'error');
        } finally {
            setIsDeleteConfirmModalOpen(false);
            setAiToDelete(null);
        }
    };

    const handleTestChatFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
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
            formData.append('trainingFiles', file); // The endpoint expects this key
            try {
                showToast(t.uploading, 'info');
                const response = await apiService.uploadFiles(formData);
                if (response.filePaths && response.filePaths.length > 0) {
                    setFileAttachment({ name: file.name, url: response.filePaths[0] });
                }
            } catch (err) {
                showToast(t.uploadError, 'error');
                console.error(err);
            }
        }
        if (testChatFileInputRef.current) testChatFileInputRef.current.value = "";
    };

    const handleSendMessage = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if ((!newMessage.trim() && !imagePreview && !fileAttachment) || !selectedAi) return;
        
        const userMessage: Message = { id: `msg-${Date.now()}`, text: newMessage, sender: 'user', timestamp: Date.now(), imageUrl: imagePreview || undefined, fileAttachment: fileAttachment || undefined };
        const updatedAllMessages = [...allMessages, userMessage];
        
        const aiMessageId = `ai-${Date.now()}`;
        const newAiMessage: Message = { id: aiMessageId, text: '', sender: 'ai', timestamp: Date.now() };

        setAllMessages(prev => [...prev, userMessage, newAiMessage]);
        setDisplayedMessages(prev => [...prev, userMessage, newAiMessage]);
        
        setNewMessage('');
        setImagePreview(null);
        setFileAttachment(null);
        setIsTyping(true);
        
        let streamBuffer = '';
        
        await apiService.sendMessageStream(selectedAi, updatedAllMessages, user, testConversationId, {
            onChunk: (chunk: string) => {
                streamBuffer += chunk;
                const thoughtMatch = streamBuffer.match(/<thought>([\s\S]*?)<\/thought>/);
                const currentThought = thoughtMatch ? thoughtMatch[1].trim() : '';
                const textWithoutThought = streamBuffer.replace(/<thought>[\s\S]*?<\/thought>/, '').trimStart();

                const updateMessage = (messages: Message[]) => messages.map(msg => 
                    msg.id === aiMessageId 
                    ? { ...msg, text: textWithoutThought, thought: currentThought } 
                    : msg
                );
                setAllMessages(prev => updateMessage(prev));
                setDisplayedMessages(prev => updateMessage(prev));
            },
            onEnd: (newConversationId, _updatedUser, finalMessage) => {
                setIsTyping(false);
                if (newConversationId && testConversationId === null) {
                    setTestConversationId(newConversationId);
                }
                
                if (finalMessage) {
                    const updateFinalMessage = (messages: Message[]) => messages.map(msg => 
                        msg.id === aiMessageId 
                        ? { ...msg, text: finalMessage.text, thought: finalMessage.thought || undefined } 
                        : msg
                    );
                    setAllMessages(prev => updateFinalMessage(prev));
                    setDisplayedMessages(prev => updateFinalMessage(prev));
                }
            },
            onError: (errorMsg: string) => {
                 const updateMessage = (messages: Message[]) => messages.map(msg => msg.id === aiMessageId ? { ...msg, text: `Lỗi: ${errorMsg}` } : msg);
                setAllMessages(prev => updateMessage(prev));
                setDisplayedMessages(prev => updateMessage(prev));
                setIsTyping(false);
            }
        }, true, language, aiMessageId);
    };

    const handleTextareaKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage(e as any);
        }
    };

    const handleToggleTrainPair = async (aiMessage: Message) => {
        if (!selectedAi || typeof selectedAi.id !== 'number' || trainingPairIndex !== null) return;
    
        const msgId = aiMessage.id;
        const actualIndex = allMessages.findIndex(m => m.id === msgId);
        
        if (actualIndex < 1 || allMessages[actualIndex - 1].sender !== 'user') return;
    
        const question = allMessages[actualIndex - 1].text.trim();
        const answer = aiMessage.text.trim();
        const thought = aiMessage.thought;
        const pairKey = `${question}|||${answer}`;
        const isAlreadyTrained = trainedPairs.has(pairKey);
    
        setTrainingPairIndex(actualIndex);
    
        if (isAlreadyTrained) {
            try {
                await apiService.deleteTrainingQaDataSource(Number(selectedAi.id), question, answer);
                showToast(t.untrainSuccess, 'success');
                setTrainedPairs(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(pairKey);
                    return newSet;
                });
            } catch (error: any) {
                showToast(t.untrainError.replace('{error}', error.message), 'error');
            }
        } else {
            try {
                const newSource = await apiService.createTrainingQaDataSource(Number(selectedAi.id), question, answer, thought);
                setTrainingData(prev => [newSource, ...prev]);
                setTrainedPairs(prev => new Set(prev).add(pairKey));
                showToast(t.addedToTraining, 'success');
            } catch (error: any) {
                showToast(t.trainRequestFailed.replace('{error}', (error as Error).message), 'error');
            }
        }
    
        setTrainingPairIndex(null);
    };

    const handleGenerateSummary = async (sourceId: number) => {
        if (summarizingId) return;
        setSummarizingId(sourceId);
        try {
            const updatedSource = await apiService.generateSummaryForDataSource(sourceId);
            setTrainingData(prevData =>
                prevData.map(d => d.id === sourceId ? updatedSource : d)
            );
            showToast(t.generateSummarySuccess, 'success');
        } catch (error) {
            showToast(t.generateSummaryError.replace('{message}', (error as Error).message), 'error');
        } finally {
            setSummarizingId(null);
        }
    };

    const handleSummarizeAll = async () => {
        if (!selectedAi || isSummarizingAll || isFormDisabled) return;

        const filesToSummarize = trainingData.filter(
            d => d.type === 'file' && !d.summary && typeof d.id === 'number'
        );
    
        if (filesToSummarize.length === 0) {
            showToast(t.noFilesToSummarize, 'info');
            return;
        }
    
        setIsSummarizingAll(true);
        showToast(`Bắt đầu tóm tắt ${filesToSummarize.length} file...`, 'info');
    
        let successCount = 0;
        let failureCount = 0;
        const newTrainingData = [...trainingData];
    
        for (const file of filesToSummarize) {
            try {
                setSummarizingId(file.id as number);
                const updatedSource = await apiService.generateSummaryForDataSource(file.id as number);
                
                const index = newTrainingData.findIndex(d => d.id === file.id);
                if (index !== -1) {
                    newTrainingData[index] = updatedSource;
                }
                successCount++;
            } catch (error) {
                failureCount++;
                showToast(t.generateSummaryError.replace('{message}', `cho file ${file.fileName}`), 'error');
                console.error(`Failed to summarize file ${file.fileName} (ID: ${file.id}):`, error);
            } finally {
                setSummarizingId(null);
            }
        }

        setTrainingData(newTrainingData);
    
        if (failureCount > 0) {
            showToast(`Hoàn tất! Tóm tắt thành công ${successCount} file, thất bại ${failureCount} file.`, 'error');
        } else {
            showToast(`Tóm tắt thành công ${successCount} file!`, 'success');
        }
    
        setIsSummarizingAll(false);
    };

    const handleDeleteTrainingData = async (id: number | 'new') => {
        if (typeof id !== 'number') return;

        if (deletingIds.has(id)) {
            return;
        }
    
        setDeletingIds(prev => new Set(prev).add(id));
        try {
            await apiService.deleteTrainingDataSource(id);
            setTrainingData(prev => prev.filter(d => d.id !== id));
            showToast(t.deleteTrainingDataSuccess, 'info');
        } catch (error) {
            const message = (error instanceof Error) ? error.message : String(error);
            showToast(t.deleteTrainingDataError.replace('{message}', message), 'error');
        } finally {
            setDeletingIds(prev => {
                const newSet = new Set(prev);
                newSet.delete(id);
                return newSet;
            });
        }
    };
    
    const handleDeleteLinkedDocument = async (documentId: number) => {
        if (!selectedAi || typeof selectedAi.id !== 'number' || typeof documentId !== 'number') return;
        
        const internalId = -documentId; // Linked docs have negative IDs in local state
        setDeletingIds(prev => new Set(prev).add(internalId));
        try {
            await apiService.unlinkDocumentFromAi(selectedAi.id, documentId);
            setTrainingData(prev => prev.filter(d => d.documentId !== documentId));
            showToast(t.unlinkSuccess, 'info');
        } catch (error) {
            const message = (error instanceof Error) ? error.message : String(error);
            showToast(t.unlinkError.replace('{message}', message), 'error');
        } finally {
            setDeletingIds(prev => {
                const newSet = new Set(prev);
                newSet.delete(internalId);
                return newSet;
            });
        }
    };

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0] && selectedAi && !isFormDisabled) {
            const reader = new FileReader();
            reader.onloadend = () => setSelectedAi(prev => prev ? { ...prev, avatarUrl: reader.result as string } : null);
            reader.readAsDataURL(e.target.files[0]);
        }
    };
    
    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || !selectedAi || isFormDisabled) return;
        const file = e.target.files[0];
        if (!file) return;

        if (typeof selectedAi.id === 'string' && selectedAi.id.startsWith('new-')) {
            setStagedFiles(prev => [...prev, file]);
            if (fileInputRef.current) fileInputRef.current.value = "";
            return;
        }

        if (typeof selectedAi.id !== 'number') return;

        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', 'file');

        setIsUploading(true);
        try {
            const newDataSource = await apiService.createTrainingDataSourceForAI(selectedAi.id, formData);
            setTrainingData(prev => [newDataSource, ...prev]);
        } catch (error) { 
            showToast(t.uploadError, 'error'); 
        } finally { 
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const handleSubmitToKoii = useCallback(async () => {
        if (!selectedAi || typeof selectedAi.id !== 'number') return;
        
        setIsSubmittingToKoii(true);
        try {
            await apiService.submitKoiiTask(selectedAi.id);
            showToast(t.syncQueued, 'info');
            setKoiiTaskStatus({ status: 'pending', updatedAt: new Date().toISOString() });
            
            stopPolling();
            pollingIntervalRef.current = window.setInterval(async () => {
                try {
                    const status = await apiService.getKoiiTaskStatus(selectedAi.id as number);
                    setKoiiTaskStatus(status);
                    if (status?.status === 'completed' || status?.status === 'failed') {
                        stopPolling();
                    }
                } catch (pollError) {
                    console.error("Polling error in submit callback:", pollError);
                    stopPolling();
                }
            }, 5000);

        } catch (error) {
            showToast(`Error submitting task: ${(error as Error).message}`, 'error');
        } finally {
            setIsSubmittingToKoii(false);
        }
    }, [selectedAi, showToast, t.syncQueued]);
    
    const handleRemoveStagedFile = (indexToRemove: number) => {
        setStagedFiles(prev => prev.filter((_, index) => index !== indexToRemove));
    };

    const handleAddTag = () => { if (!selectedAi || isFormDisabled || !tagInput.trim()) return; setSelectedAi(prev => prev ? { ...prev, tags: [...prev.tags, tagInput.trim()] } : null); setTagInput(''); };
    const handleRemoveTag = (tag: string) => setSelectedAi(prev => prev ? { ...prev, tags: prev.tags.filter(t => t !== tag) } : null);
    
    const handleTagInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => { if (e.key === 'Enter') { e.preventDefault(); handleAddTag(); } };
    
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
    const getOwnerName = (ownerId?: number) => allUsers.find(u => u.id === ownerId)?.name || 'Không rõ';

    const getStatusIcon = (item: TrainingDataSource) => {
        if (item.isIndexed) {
            return <div className="w-2.5 h-2.5 bg-green-500 rounded-full flex-shrink-0" title="Indexed"></div>;
        }
        return <div className="w-2.5 h-2.5 bg-gray-300 rounded-full flex-shrink-0" title="Not Indexed"></div>;
    }

    const inputClasses = "mt-1 block w-full px-3 py-2 bg-background-panel border border-border-color rounded-md shadow-sm focus:ring-primary focus:border-primary disabled:bg-background-light disabled:cursor-not-allowed h-10";
    const textareaClasses = "mt-1 block w-full px-3 py-2 bg-background-panel border border-border-color rounded-md shadow-sm disabled:bg-background-light disabled:cursor-not-allowed";

    const filteredTrainingData = useMemo(() => {
        const data = trainingData || [];
        switch (trainingFilter) {
            case 'indexed':
                return data.filter(d => d.isIndexed);
            case 'not_indexed':
                return data.filter(d => !d.isIndexed);
            case 'all':
            default:
                return data;
        }
    }, [trainingData, trainingFilter]);

    const qaTrainingData = useMemo(() => filteredTrainingData.filter(d => d.type === 'qa'), [filteredTrainingData]);
    const fileTrainingData = useMemo(() => filteredTrainingData.filter(d => d.type === 'file'), [filteredTrainingData]);
    const documentTrainingData = useMemo(() => trainingData.filter(d => d.type === 'document'), [trainingData]);

    let placeholderText = t.chatPlaceholder;
    if (user.merits !== null && user.merits <= 0) {
        placeholderText = t.accountExpiredBodyTestChat;
    }
    if (isRecording) placeholderText = 'Đang nghe...';


    if (isLoading) {
        return <div className="flex items-center justify-center h-full">{t.loading}</div>;
    }

    return (
        <div className="flex h-full">
            <div className="w-64 border-r border-border-color flex flex-col">
                <div className="p-4 border-b flex justify-between items-center h-[73px]">
                    <h2 className="text-lg font-semibold">{t.aiList}</h2>
                    <button onClick={handleAddNewAi} className="px-3 py-1.5 text-sm font-medium text-text-on-primary bg-primary rounded-md hover:bg-primary-hover">+</button>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {aiList.sort((a, b) => a.name.localeCompare(b.name)).map(ai => (
                        <div key={ai.id} onClick={() => handleSelectAi(ai)} className={`flex items-start p-3 cursor-pointer hover:bg-background-light border-b border-border-color ${selectedAi?.id === ai.id ? 'bg-primary-light' : ''}`}>
                            <img src={ai.avatarUrl} alt={ai.name} className="w-10 h-10 rounded-full mr-3 flex-shrink-0 object-cover" />
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
                                {user.permissions?.includes('roles') && <p className="text-xs text-gray-400 mt-1.5 truncate">{t.owner}: {getOwnerName(ai.ownerId)}</p>}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {selectedAi ? (
                <div className="flex-1 flex overflow-hidden">
                    <div className={`border-r border-border-color relative flex flex-col h-full transition-all duration-300 ease-in-out ${isChatExpanded ? 'w-1/3' : 'w-3/5'}`}>
                        {isApiKeyMissing && <div className="absolute inset-0 bg-white/70 backdrop-blur-sm z-10 flex items-center justify-center"><p className="p-4 bg-yellow-100 text-yellow-800 rounded-lg border border-yellow-200">{t.addKeyForProvider.replace('{provider}', selectedAi.modelType.toUpperCase())}</p></div>}
                        {(!canEdit && !isApiKeyMissing) && <div className="absolute inset-0 bg-white/70 backdrop-blur-sm z-10 flex items-center justify-center"><p className="p-4 bg-yellow-100 text-yellow-800 rounded-lg border border-yellow-200">{t.readOnly}</p></div>}
                        
                        <div className="flex-grow overflow-y-auto p-6">
                            {/* Identity Section */}
                            <div className="flex items-start space-x-6">
                                <div className="flex-shrink-0 flex flex-col items-center space-y-2">
                                    {selectedAi.avatarUrl ? (
                                        <img src={selectedAi.avatarUrl} alt="Avatar" className="w-24 h-24 rounded-full object-cover bg-background-light" />
                                    ) : (
                                        <div className="w-24 h-24 rounded-full bg-background-light border-2 border-dashed border-border-color flex items-center justify-center text-text-light text-center text-xs p-2">
                                            {t.changeAvatar}
                                        </div>
                                    )}
                                    <button onClick={() => avatarInputRef.current?.click()} disabled={isFormDisabled} className="px-4 py-2 text-sm font-medium text-text-main bg-background-panel border border-border-color rounded-md shadow-sm hover:bg-background-light disabled:opacity-50 disabled:cursor-not-allowed">{t.changeAvatar}</button>
                                    <input type="file" ref={avatarInputRef} onChange={handleAvatarChange} className="hidden" accept="image/*" />
                                </div>
                                <div className="flex-grow space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-text-main">{t.aiName}</label>
                                            <input type="text" name="name" value={selectedAi.name} onChange={handleInputChange} disabled={isFormDisabled} className={inputClasses} />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-text-main">{t.aiNameEn}</label>
                                            <input type="text" name="nameEn" value={selectedAi.nameEn || ''} onChange={handleInputChange} disabled={isFormDisabled} className={inputClasses} />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-text-main">{t.aiDescription}</label>
                                            <textarea name="description" value={selectedAi.description || ''} onChange={handleInputChange} disabled={isFormDisabled} rows={3} className={textareaClasses} />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-text-main">{t.aiDescriptionEn}</label>
                                            <textarea name="descriptionEn" value={selectedAi.descriptionEn || ''} onChange={handleInputChange} disabled={isFormDisabled} rows={3} className={textareaClasses} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="border-b border-border-color my-6">
                                <nav className="-mb-px flex space-x-6">
                                    <button onClick={() => setActiveTab('configuration')} className={`py-3 px-1 font-semibold border-b-2 ${activeTab === 'configuration' ? 'border-primary text-primary' : 'border-transparent text-text-light hover:text-text-main'}`}>{t.tabConfiguration}</button>
                                    <button onClick={() => setActiveTab('training')} className={`py-3 px-1 font-semibold border-b-2 ${activeTab === 'training' ? 'border-primary text-primary' : 'border-transparent text-text-light hover:text-text-main'}`}>{t.tabTraining}</button>
                                    <button onClick={() => setActiveTab('tags')} className={`py-3 px-1 font-semibold border-b-2 ${activeTab === 'tags' ? 'border-primary text-primary' : 'border-transparent text-text-light hover:text-text-main'}`}>{t.tabTagsAndSuggestions}</button>
                                </nav>
                            </div>

                            {activeTab === 'configuration' && (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-text-main">{t.provider}</label>
                                            <select name="modelType" value={selectedAi.modelType} onChange={handleInputChange} disabled={isFormDisabled} className={inputClasses}>
                                                <option value="gemini">Gemini</option><option value="gpt">GPT</option><option value="grok">Grok</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-text-main">{t.modelSelection}</label>
                                            <select name="modelName" value={selectedAi.modelName || ''} onChange={handleInputChange} disabled={isFormDisabled || isModelsLoading || !!modelsError} className={inputClasses}>
                                                {isModelsLoading ? <option>{t.loadingModels}</option> : modelsError ? <option>{modelsError}</option> : <> <option value="">{t.selectModel}</option> {availableModels.map(model => <option key={model} value={model}>{model}</option>)}</>}
                                            </select>
                                            {modelsError && !isModelsLoading && <p className="text-xs text-accent-red mt-1">{modelsError}</p>}
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-text-main">{t.space}</label>
                                            <select name="spaceId" value={selectedAi.spaceId ?? ''} onChange={handleInputChange} disabled={isFormDisabled} className={inputClasses}>
                                                <option value="">-- No Space --</option>
                                                {manageableSpaces.map(space => (
                                                    <option key={space.id as number} value={space.id as number}>{space.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        {(selectedAi.modelType === 'gemini' || selectedAi.modelType === 'gpt') && (
                                            <>
                                                <div>
                                                    <label className="block text-sm font-medium text-text-main">{t.maxOutputTokensLabel}</label>
                                                    <input type="number" name="maxOutputTokens" value={selectedAi.maxOutputTokens ?? ''} onChange={handleInputChange} disabled={isFormDisabled} className={inputClasses} placeholder="e.g. 4096"/>
                                                    <p className="text-xs text-text-light mt-1">{t.maxOutputTokensDesc}</p>
                                                </div>
                                                {selectedAi.modelType === 'gemini' && (
                                                    <div>
                                                        <label className="block text-sm font-medium text-text-main">{t.thinkingBudgetLabel}</label>
                                                        <input type="number" name="thinkingBudget" value={selectedAi.thinkingBudget ?? ''} onChange={handleInputChange} disabled={isFormDisabled} className={inputClasses} placeholder="e.g. 2000"/>
                                                        <p className="text-xs text-text-light mt-1">{t.thinkingBudgetDesc}</p>
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-text-main">{t.trainingContent}</label>
                                        <textarea name="trainingContent" value={selectedAi.trainingContent} onChange={handleInputChange} disabled={isFormDisabled} rows={8} className={textareaClasses} />
                                    </div>
                                </div>
                            )}

                            {activeTab === 'training' && (
                                <div className="space-y-6">
                                    <div className="flex justify-between items-center">
                                        <h3 className="text-md font-semibold text-text-main">{t.trainingDataSources}</h3>
                                        <div className="flex items-center space-x-2">
                                            <button type="button" onClick={() => setIsDocModalOpen(true)} disabled={isFormDisabled || typeof selectedAi.id !== 'number'} className="flex items-center gap-1.5 px-2 py-1 text-xs font-medium text-text-main bg-background-panel border border-border-color rounded-md shadow-sm hover:bg-background-light disabled:opacity-50"><BookOpenIcon className="w-4 h-4" /><span>{t.selectFromLibrary}</span></button>
                                            <span className="text-xs text-text-light">{t.filterByStatus}:</span>
                                            <button onClick={() => setTrainingFilter('all')} className={`px-2 py-0.5 rounded-full ${trainingFilter === 'all' ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>{t.statusAll}</button>
                                            <button onClick={() => setTrainingFilter('indexed')} className={`px-2 py-0.5 rounded-full ${trainingFilter === 'indexed' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>{t.statusIndexed}</button>
                                            <button onClick={() => setTrainingFilter('not_indexed')} className={`px-2 py-0.5 rounded-full ${trainingFilter === 'not_indexed' ? 'bg-yellow-500 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}>{t.statusNotIndexed}</button>
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex items-center justify-between"><label className="block text-sm font-medium text-text-main">{t.additionalTrainingContent}</label><button onClick={() => setIsQaModalOpen(true)} title={t.expand} className="p-1 text-text-light hover:text-primary"><ExpandIcon className="w-4 h-4" /></button></div>
                                        <div className="mt-1 block w-full p-2 bg-background-panel border border-border-color rounded-md shadow-sm h-48 overflow-y-auto space-y-2">
                                            {qaTrainingData.length > 0 ? ( qaTrainingData.map(item => (<div key={item.id} className="group relative p-2 bg-background-light rounded-md text-sm flex items-start gap-2"><div className="mt-1.5">{getStatusIcon(item)}</div><div className="flex-1"><p><strong className="font-semibold text-primary-text">{t.question}:</strong> {item.question}</p><p><strong className="font-semibold text-primary-text">{t.answer}:</strong> {item.answer}</p>{item.thought && (<div className="mt-2 text-xs text-gray-600 border-t border-gray-200 pt-1 italic"><strong>{t.aiThought}:</strong> {item.thought}</div>)}</div>{!isFormDisabled && <button onClick={() => handleDeleteTrainingData(item.id)} disabled={typeof item.id === 'number' && deletingIds.has(item.id)} className="absolute top-1 right-1 p-0.5 rounded-full bg-gray-300 text-white opacity-0 group-hover:opacity-100 hover:bg-accent-red disabled:opacity-50">&times;</button>}</div>))) : (<div className="flex items-center justify-center h-full text-center text-xs text-text-light">{t.noQA}</div>)}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="flex justify-between items-center mb-1"><label className="block text-sm font-medium text-text-main">{t.attachedFiles}</label><div className="flex items-center space-x-2"><button type="button" onClick={handleSummarizeAll} disabled={isFormDisabled || isSummarizingAll || filesNeedingSummaryCount === 0} className="flex items-center gap-1.5 px-2 py-1 text-xs font-medium text-text-main bg-background-panel border border-border-color rounded-md shadow-sm hover:bg-background-light disabled:opacity-50 disabled:cursor-not-allowed" title={t.summarizeAllFiles}>{isSummarizingAll ? (<><div className="w-3 h-3 border-2 border-dashed rounded-full animate-spin border-primary"></div><span>{t.summarizingAll}</span></>) : (<><BrainwaveIcon className="w-4 h-4" /><span>{`${t.summarizeAllFiles} (${filesNeedingSummaryCount})`}</span></>)}</button><input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" /><button type="button" onClick={() => fileInputRef.current?.click()} disabled={isUploading || isFormDisabled} className="p-1.5 rounded-md hover:bg-background-light text-text-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed" title={t.attachFile}>{isUploading ? <div className="w-5 h-5 border-2 border-dashed rounded-full animate-spin border-primary"></div> : <PaperclipIcon className="w-5 h-5" />}</button><button onClick={() => setIsTrainingDataModalOpen(true)} title={t.expand} className="p-1 text-text-light hover:text-primary"><ExpandIcon className="w-4 h-4" /></button></div></div>
                                        <div className="border border-border-color rounded-lg p-2 h-40 flex flex-col mt-1">
                                            <div className="flex-grow min-h-0 overflow-y-auto space-y-1 pr-1">
                                                {stagedFiles.map((file, index) => (<div key={index} className="flex justify-between items-center bg-blue-50 border border-blue-200 px-2 py-1 rounded-md text-sm"><span className="text-blue-800 truncate" title={file.name}>{file.name}</span><div className='flex items-center'><span className="text-xs text-blue-600 mr-2">{t.pendingUpload}</span><button onClick={() => handleRemoveStagedFile(index)} className="text-blue-700 hover:text-accent-red-hover flex-shrink-0 text-lg leading-none">&times;</button></div></div>))}
                                                {fileTrainingData.map((item) => (<div key={item.id} className="flex flex-col items-start bg-background-light px-2 py-2 rounded-md text-sm group"><div className="flex justify-between items-center w-full"><div className="flex items-center gap-2 flex-1 overflow-hidden">{getStatusIcon(item)}<a href={item.fileUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline truncate font-medium" title={item.fileName}>{item.fileName}</a>{!item.summary && (<div className="text-yellow-500 cursor-help" title={t.largeFileWarning}><InfoIcon className="w-4 h-4" /></div>)}</div>{!isFormDisabled && (<button onClick={() => handleDeleteTrainingData(item.id)} disabled={typeof item.id === 'number' && deletingIds.has(item.id)} className="ml-2 text-text-light hover:text-accent-red flex-shrink-0 leading-none disabled:opacity-50 opacity-0 group-hover:opacity-100 transition-opacity" title={t.delete}><TrashIcon className="w-4 h-4" /></button>)}</div>{item.summary ? (<div className="mt-2 pt-2 border-t border-border-color w-full"><p className="text-xs font-semibold text-text-light mb-1">{t.aiSummary}</p><p className="text-xs text-gray-600 italic">{item.summary.length > 100 ? `${item.summary.substring(0, 100)}...` : item.summary}</p></div>) : (typeof item.id === 'number' && !isFormDisabled && (<div className="mt-2 pt-2 border-t border-border-color w-full"><button onClick={() => handleGenerateSummary(item.id as number)} disabled={summarizingId === item.id} className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 disabled:opacity-50 disabled:cursor-wait">{summarizingId === item.id ? t.generatingSummary : t.generateSummary}</button></div>))}</div>))}
                                                {fileTrainingData.length === 0 && stagedFiles.length === 0 && <div className="flex items-center justify-center h-full"><p className="text-xs text-center text-text-light">{t.noFiles}</p></div>}
                                            </div>
                                        </div>
                                    </div>
                                     {documentTrainingData.length > 0 && (
                                        <div>
                                            <label className="block text-sm font-medium text-text-main">{t.linkedDocuments}</label>
                                            <div className="border border-border-color rounded-lg p-2 h-40 flex flex-col mt-1">
                                                <div className="flex-grow min-h-0 overflow-y-auto space-y-1 pr-1">
                                                    {documentTrainingData.map(item => (
                                                        <div key={`doc-${item.documentId}`} className="flex justify-between items-center bg-green-50 px-2 py-1 rounded-md text-sm group">
                                                            <div className="flex items-center gap-2 flex-1 overflow-hidden">
                                                                <BookOpenIcon className="w-4 h-4 text-green-700 flex-shrink-0"/>
                                                                <span className="text-green-800 truncate font-medium" title={item.documentName}>{item.documentName}</span>
                                                            </div>
                                                            {!isFormDisabled && (
                                                                <button 
                                                                    onClick={() => handleDeleteLinkedDocument(item.documentId!)} 
                                                                    disabled={deletingIds.has(-item.documentId!)}
                                                                    className="ml-2 text-text-light hover:text-accent-red flex-shrink-0 leading-none disabled:opacity-50 opacity-0 group-hover:opacity-100 transition-opacity"
                                                                    title={t.delete}
                                                                >
                                                                    <TrashIcon className="w-4 h-4" />
                                                                </button>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                             {activeTab === 'tags' && (
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-text-main">{t.suggestedQuestions}</label>
                                            <textarea name="suggestedQuestions" value={normalizePostgresArray(selectedAi.suggestedQuestions).join('\n')} onChange={handleInputChange} disabled={isFormDisabled} rows={4} className={textareaClasses} placeholder={t.addSuggestedQuestionPlaceholder} />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-text-main">{t.suggestedQuestionsEn}</label>
                                            <textarea name="suggestedQuestionsEn" value={normalizePostgresArray(selectedAi.suggestedQuestionsEn).join('\n')} onChange={handleInputChange} disabled={isFormDisabled} rows={4} className={textareaClasses} placeholder={t.addSuggestedQuestionPlaceholder} />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-text-main">{t.tags}</label>
                                        <div className="mt-1 flex rounded-md shadow-sm">
                                            <input type="text" value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={handleTagInputKeyDown} placeholder={t.addTagPlaceholder} className="flex-1 block w-full min-w-0 rounded-none rounded-l-md px-3 py-2 bg-background-panel border-border-color focus:ring-primary focus:border-primary disabled:bg-gray-100" disabled={isFormDisabled} />
                                            <button type="button" onClick={handleAddTag} disabled={isFormDisabled} className="-ml-px relative inline-flex items-center space-x-2 px-4 py-2 border border-border-color text-sm font-medium rounded-r-md text-text-main bg-background-light hover:bg-background-light/80 disabled:bg-gray-200 disabled:cursor-not-allowed">{t.addTag}</button>
                                        </div>
                                        <div className="mt-2 flex flex-wrap gap-2">
                                            {selectedAi.tags.map((tag, i) => (
                                                <span key={i} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-light text-primary-text">
                                                    {tag}
                                                    {!isFormDisabled && <button onClick={() => handleRemoveTag(tag)} className="ml-1.5 flex-shrink-0 text-primary hover:text-primary-hover"> &times; </button>}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                        </div>

                         <div className="flex-shrink-0 p-4 border-t border-border-color bg-background-content space-y-4">
                            <div className="flex flex-col lg:flex-row gap-6">
                                <div className="lg:w-1/2">
                                    <KoiiTaskStatusDisplay status={koiiTaskStatus} language={language} />
                                </div>
                                <div className="lg:w-1/2">
                                    {estimatedChars && (
                                        <div className="text-sm p-3 border rounded-lg text-text-main h-full" style={{ backgroundColor: '#f5f1e6', borderColor: '#dcd5bc' }}>
                                            <p className="font-bold mb-1 text-base">{t.tokenEstimation}</p>
                                            <div className="space-y-1 mt-2 text-xs">
                                                <div className="flex justify-between"><span>{t.systemPrompt}:</span><span className="font-mono">~{estimatedChars.system.toLocaleString(language)}</span></div>
                                                <div className="flex justify-between"><span>{t.trainingDataQA}:</span><span className="font-mono">~{estimatedChars.qa.toLocaleString(language)}</span></div>
                                                <div className="flex justify-between"><span>{t.fileSummary}:</span><span className="font-mono">~{estimatedChars.file.toLocaleString(language)}</span></div>
                                                <div className="flex justify-between"><span>{t.documentSummary}:</span><span className="font-mono">~{estimatedChars.document.toLocaleString(language)}</span></div>
                                                <div className="flex justify-between"><span>{t.history}:</span><span className="font-mono">~{estimatedChars.history.toLocaleString(language)}</span></div>
                                                <div className="flex justify-between"><span>{t.currentUserMessage}:</span><span className="font-mono">~{estimatedChars.currentMessage.toLocaleString(language)}</span></div>
                                                <p className="text-gray-400 italic text-center text-[10px] my-1">{t.ragContext}</p>
                                                <div className="border-t my-1" style={{ borderColor: 'rgba(220, 213, 188, 0.6)' }}></div>
                                                <div className="flex justify-between font-bold text-sm"><span>{t.total}:</span><span className="font-mono">~{Math.ceil(estimatedChars.total / 4).toLocaleString(language)}</span></div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="flex justify-between items-center">
                                <div className="space-y-2">
                                     <div>
                                        <label className="flex items-center"><input type="checkbox" name="isTrialAllowed" checked={selectedAi.isTrialAllowed} onChange={handleInputChange} disabled={isFormDisabled} className="w-4 h-4 text-primary bg-background-panel border-border-color rounded focus:ring-primary disabled:cursor-not-allowed" /><span className="ml-3 text-sm font-medium text-text-main">{t.trialAllowed}</span></label>
                                        <p className="text-xs text-text-light ml-7">{t.trialAllowedDesc}</p>
                                    </div>
                                    {user.permissions?.includes('roles') && (
                                        <div>
                                            <label className="flex items-center"><input type="checkbox" name="isPublic" checked={selectedAi.isPublic} onChange={handleInputChange} disabled={isFormDisabled || !user.permissions.includes('roles')} className="w-4 h-4 text-primary bg-background-panel border-border-color rounded focus:ring-primary disabled:cursor-not-allowed" /><span className="ml-3 text-sm font-medium text-text-main">{t.publicAi}</span></label>
                                            <p className="text-xs text-text-light ml-7">{t.publicAiDescription}</p>
                                        </div>
                                    )}
                                </div>
                                <div className="flex items-center space-x-3">
                                    <button onClick={handleSubmitToKoii} disabled={isSubmittingToKoii || ['pending', 'processing'].includes(koiiTaskStatus?.status || '') || isFormDisabled || isFormDirty()}
                                            className="flex items-center gap-2 px-4 py-2 text-sm font-medium border rounded-md disabled:opacity-50"
                                            title={isFormDirty() ? t.unsavedChangesBody : undefined}>
                                        <KoiiIcon className="w-5 h-5"/>
                                        {isSubmittingToKoii ? t.syncing : t.submitToKoii}
                                    </button>
                                    {canEdit && typeof selectedAi.id === 'number' && (
                                        <button onClick={handleInitiateDelete} disabled={isFormDisabled} className="px-4 py-2 text-sm font-medium text-text-on-primary bg-accent-red rounded-md hover:bg-accent-red-hover disabled:opacity-50">{t.delete}</button>
                                    )}
                                    <button onClick={handleSaveChanges} disabled={isSaving || isFormDisabled || !isFormDirty()} className="px-6 py-2 text-sm font-medium text-text-on-primary bg-primary rounded-md hover:bg-primary-hover disabled:opacity-50">
                                        {isSaving ? t.saving : t.save}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Test Chat Window */}
                    <div className={`relative flex flex-col transition-all duration-300 ease-in-out ${isChatExpanded ? 'w-2/3' : 'w-2/5'}`}>
                        <div className="flex-shrink-0 flex items-center justify-between p-4 border-b border-l border-border-color">
                            <h3 className="text-lg font-semibold">{t.testChat}</h3>
                            <button onClick={() => setIsChatExpanded(!isChatExpanded)} title={isChatExpanded ? t.shrink : t.expand}>
                                <ExpandIcon className="w-5 h-5" />
                            </button>
                        </div>

                        <div ref={chatContainerRef} onScroll={handleScroll} className="flex-grow overflow-y-auto p-4 bg-background-light relative">
                            {isChatHistoryLoading ? (
                                <p className="text-center text-sm text-gray-500">{t.loadingTestHistory}</p>
                            ) : allMessages.length === 0 ? (
                                <p className="text-center text-sm text-gray-500">{t.noTestHistory}</p>
                            ) : (
                                <div className="space-y-4">
                                    {isLoadingMore && <div className="text-center text-xs text-gray-500 p-2">{t.loadingOlderMessages}</div>}
                                    {displayedMessages.map((msg, index) => {
                                        const allMessagesIndex = allMessages.length - displayedMessages.length + index;
                                        const questionMessage = allMessages[allMessagesIndex - 1];
                                        const pairKey = (msg.sender === 'ai' && questionMessage?.sender === 'user') ? `${questionMessage.text.trim()}|||${msg.text.trim()}` : null;
                                        const isAlreadyTrained = pairKey ? trainedPairs.has(pairKey) : false;

                                        return (
                                        <div key={msg.id || index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`p-3 rounded-lg max-w-lg ${msg.sender === 'user' ? 'bg-primary text-white' : 'bg-white shadow-sm'}`}>
                                                <div className="markdown-content whitespace-pre-wrap"><ReactMarkdown remarkPlugins={[remarkGfm]}>{msg.text}</ReactMarkdown></div>
                                                {msg.sender === 'ai' && msg.thought && (
                                                    <details className="mt-2 text-xs">
                                                        <summary className="cursor-pointer font-semibold">{t.aiThought}</summary>
                                                        <pre className="mt-1 p-2 bg-gray-100 rounded text-gray-600 whitespace-pre-wrap font-sans">{msg.thought}</pre>
                                                    </details>
                                                )}
                                                {msg.sender === 'ai' && pairKey && (
                                                     <div className="mt-2 text-right">
                                                         <button 
                                                             onClick={() => handleToggleTrainPair(msg)}
                                                             disabled={trainingPairIndex !== null}
                                                             className={`px-2 py-1 text-xs rounded ${isAlreadyTrained ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}
                                                         >
                                                             {trainingPairIndex === allMessagesIndex ? t.trainingPair : isAlreadyTrained ? t.untrainPair : t.addToTraining}
                                                         </button>
                                                     </div>
                                                )}
                                            </div>
                                        </div>
                                    )})}
                                    {isTyping && <div className="flex justify-start"><div className="p-3 rounded-lg bg-white shadow-sm"><div className="typing-indicator"><span></span><span></span><span></span></div></div></div>}
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>
                        
                         <div className="flex-shrink-0 p-4 border-t border-l border-border-color bg-background-panel">
                            <form onSubmit={handleSendMessage} className="relative">
                                {imagePreview && ( <div className="image-preview-container"><img src={imagePreview} alt="Preview" className="image-preview-thumb" /><button type="button" onClick={() => setImagePreview(null)} className="image-preview-remove-btn">&times;</button></div>)}
                                {fileAttachment && ( <div className="image-preview-container"><div className="file-preview-thumb"><PaperclipIcon className="w-8 h-8 text-text-light" /><span className="text-xs text-text-light truncate">{fileAttachment.name}</span></div><button type="button" onClick={() => setFileAttachment(null)} className="image-preview-remove-btn">&times;</button></div>)}
                                <div className="chat-input-wrapper">
                                    <button onClick={() => testChatFileInputRef.current?.click()} type="button" disabled={isFormDisabled} className="chat-input-icon-btn"><PaperclipIcon className="w-5 h-5"/></button>
                                    <textarea ref={textareaRef} value={newMessage} onChange={(e) => setNewMessage(e.target.value)} onKeyDown={handleTextareaKeyDown} placeholder={placeholderText} disabled={isFormDisabled || isTyping} className="chat-input-field" rows={1}/>
                                    <button onClick={handleToggleRecording} type="button" disabled={isFormDisabled} className={`chat-input-icon-btn ${isRecording ? 'text-accent-red' : ''}`}><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" x2="12" y1="19" y2="22"></line></svg></button>
                                    <button type="submit" disabled={isTyping || (!newMessage.trim() && !imagePreview && !fileAttachment) || isFormDisabled} className="chat-send-btn"><svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.496.496 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11Z"></path></svg></button>
                                </div>
                            </form>
                            <input ref={testChatFileInputRef} type="file" className="hidden" accept="image/*,.doc,.docx,.pdf" onChange={handleTestChatFileSelect}/>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="flex-1 flex items-center justify-center text-text-light">{t.selectOrCreate}</div>
            )}

            {/* Modals */}
            {selectedAi && (
                <>
                    <TrainingDataModal 
                        isOpen={isQaModalOpen}
                        onClose={() => setIsQaModalOpen(false)}
                        title={`${t.qaDataFor} ${selectedAi.name}`}
                        data={qaTrainingData}
                        onDelete={handleDeleteTrainingData}
                        deletingIds={deletingIds}
                        isFormDisabled={isFormDisabled}
                        language={language}
                        type="qa"
                        getStatusIcon={getStatusIcon}
                    />
                    <TrainingDataModal 
                        isOpen={isTrainingDataModalOpen}
                        onClose={() => setIsTrainingDataModalOpen(false)}
                        title={t.manageTrainingFiles}
                        data={fileTrainingData}
                        stagedFiles={stagedFiles}
                        onDelete={handleDeleteTrainingData}
                        onRemoveStagedFile={handleRemoveStagedFile}
                        onFileChange={handleFileChange}
                        isUploading={isUploading}
                        deletingIds={deletingIds}
                        isFormDisabled={isFormDisabled}
                        language={language}
                        type="file"
                        getStatusIcon={getStatusIcon}
                        onSummarize={handleGenerateSummary}
                        summarizingId={summarizingId}
                        onSummarizeAll={handleSummarizeAll}
                        isSummarizingAll={isSummarizingAll}
                        filesNeedingSummaryCount={filesNeedingSummaryCount}
                    />
                     <SelectDocumentModal
                        isOpen={isDocModalOpen}
                        onClose={() => setIsDocModalOpen(false)}
                        onAdd={(newDocs) => {
                            const newTrainingSources = newDocs.map(d => ({
                                id: -(d.id as number), // Use negative ID for local state to avoid conflicts
                                aiConfigId: selectedAi.id,
                                type: 'document',
                                documentId: d.id as number,
                                documentName: d.title,
                                createdAt: d.createdAt,
                            } as TrainingDataSource));
                            setTrainingData(prev => [...prev, ...newTrainingSources]);
                        }}
                        aiConfigId={selectedAi.id as number}
                        language={language}
                        existingLinkedDocIds={documentTrainingData.map(d => d.documentId!)}
                    />
                </>
            )}

            {isDeleteConfirmModalOpen && aiToDelete && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={() => setIsDeleteConfirmModalOpen(false)}>
                    <div className="bg-background-panel rounded-lg shadow-xl w-full max-w-md p-6" onClick={e => e.stopPropagation()}>
                        <h2 className="text-xl font-bold">{t.confirmDeleteTitle}</h2>
                        <p className="mt-2">{t.confirmDeleteBody.replace('{name}', aiToDelete.name)}</p>
                        <div className="mt-6 flex justify-end space-x-2">
                            <button onClick={() => setIsDeleteConfirmModalOpen(false)} className="px-4 py-2 bg-gray-200 rounded-md">{t.cancel}</button>
                            <button onClick={handleConfirmDelete} className="px-4 py-2 bg-accent-red text-white rounded-md">{t.delete}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};