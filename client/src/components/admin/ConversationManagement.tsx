// client/src/components/admin/ConversationManagement.tsx
import React, { useState, useEffect } from 'react';
import { Conversation, AIConfig, User } from '../../types';
import { apiService } from '../../services/apiService';
import { useToast } from '../ToastProvider';

const ITEMS_PER_PAGE = 10;

interface ConversationManagementProps {
  user: User;
  language: 'vi' | 'en';
}

const translations = {
    vi: {
        title: 'Quản lý Hội thoại Người dùng',
        loading: 'Đang tải danh sách hội thoại...',
        user: 'Người dùng',
        startContent: 'Nội dung bắt đầu',
        date: 'Ngày',
        action: 'Hành động',
        viewAndTrain: 'Duyệt & Huấn luyện',
        showing: 'Hiển thị',
        to: 'tới',
        of: 'trên',
        prev: 'Trước',
        next: 'Sau',
        noConversations: 'Không có hội thoại nào.',
        trainAiTitle: 'Huấn luyện AI',
        conversationContent: 'Nội dung hội thoại:',
        selectAiToTrain: 'Chọn AI để huấn luyện (sẽ tạo các cặp Hỏi/Đáp từ cuộc hội thoại này):',
        trainRequestSent: 'Đã gửi yêu cầu huấn luyện thành công cho AI: {name} với {count} cặp Q&A.',
        trainRequestFailed: 'Gửi yêu cầu huấn luyện thất bại: {error}',
        cancel: 'Hủy',
        training: 'Đang huấn luyện...',
    },
    en: {
        title: 'User Conversation Management',
        loading: 'Loading conversations...',
        user: 'User',
        startContent: 'Starting Content',
        date: 'Date',
        action: 'Action',
        viewAndTrain: 'View & Train',
        showing: 'Showing',
        to: 'to',
        of: 'of',
        prev: 'Previous',
        next: 'Next',
        noConversations: 'No conversations found.',
        trainAiTitle: 'Train AI',
        conversationContent: 'Conversation Content:',
        selectAiToTrain: 'Select AI to train (will create Q&A pairs from this conversation):',
        trainRequestSent: 'Training request successfully sent for AI: {name} with {count} Q&A pairs.',
        trainRequestFailed: 'Failed to send training request: {error}',
        cancel: 'Cancel',
        training: 'Training...',
    }
}

const ConversationManagement: React.FC<ConversationManagementProps> = ({ user, language }) => {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [aiConfigs, setAiConfigs] = useState<AIConfig[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isTraining, setIsTraining] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
    const { showToast } = useToast();
    const t = translations[language];

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const [convos, ais] = await Promise.all([
                    apiService.getAllConversations(user),
                    apiService.getManageableAiConfigs(user) // Fetch only manageable AIs
                ]);
                setConversations(convos);
                setAiConfigs(ais);
            } catch (error) {
                console.error("Lỗi khi tải dữ liệu:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [user]);

    const totalPages = Math.ceil(conversations.length / ITEMS_PER_PAGE);
    const paginatedConversations = conversations.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    const handleOpenModal = (conv: Conversation) => {
        setSelectedConversation(conv);
        setIsModalOpen(true);
    };

    const handleTrain = async (aiId: string | number) => {
        if (!selectedConversation) return;

        setIsTraining(true);
        try {
            const messages = selectedConversation.messages;
            let trainingCount = 0;
            const promises = [];

            for (let i = 0; i < messages.length - 1; i++) {
                if (messages[i].sender === 'user' && messages[i+1].sender === 'ai') {
                    promises.push(apiService.createTrainingQaDataSource(Number(aiId), messages[i].text, messages[i+1].text));
                    trainingCount++;
                }
            }
            
            await Promise.all(promises);

            const aiName = aiConfigs.find(a => a.id === aiId)?.name || '';
            showToast(t.trainRequestSent.replace('{name}', aiName).replace('{count}', String(trainingCount)), 'success');
            setIsModalOpen(false);
            setSelectedConversation(null);
        } catch (error: any) {
            console.error("Lỗi khi huấn luyện AI:", error);
            showToast(t.trainRequestFailed.replace('{error}', error.message), 'error');
        } finally {
            setIsTraining(false);
        }
    };

    const renderPagination = () => (
        <div className="flex justify-between items-center mt-6">
            <p className="text-sm text-text-light">
                {t.showing} {conversations.length > 0 ? ((currentPage - 1) * ITEMS_PER_PAGE) + 1 : 0} {t.to} {Math.min(currentPage * ITEMS_PER_PAGE, conversations.length)} {t.of} {conversations.length}
            </p>
            <div className="flex space-x-1">
                <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 py-1 text-sm border rounded-md disabled:opacity-50">{t.prev}</button>
                <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages || totalPages === 0} className="px-3 py-1 text-sm border rounded-md disabled:opacity-50">{t.next}</button>
            </div>
        </div>
    );

    if (isLoading) {
        return <div className="p-8 text-center">{t.loading}</div>
    }

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold mb-6">{t.title}</h1>
            <div className="bg-background-panel shadow-md rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-border-color">
                    <thead className="bg-background-light">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-text-light uppercase tracking-wider">{t.user}</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-text-light uppercase tracking-wider">{t.startContent}</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-text-light uppercase tracking-wider">{t.date}</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-text-light uppercase tracking-wider">{t.action}</th>
                        </tr>
                    </thead>
                    <tbody className="bg-background-panel divide-y divide-border-color">
                        {paginatedConversations.map(conv => (
                            <tr key={conv.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-text-main">{conv.userName}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-text-light max-w-sm truncate">{conv.messages[0]?.text || ''}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-text-light">{new Date(conv.startTime).toLocaleString()}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button onClick={() => handleOpenModal(conv)} className="text-primary hover:text-primary-hover">{t.viewAndTrain}</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {conversations.length === 0 && <p className="text-center py-4 text-text-light">{t.noConversations}</p>}
            </div>
            {renderPagination()}
            
            {isModalOpen && selectedConversation && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
                    <div className="bg-background-panel rounded-lg shadow-xl w-full max-w-lg p-6">
                        <h2 className="text-xl font-bold mb-4">{t.trainAiTitle}</h2>
                        <div className="mb-4 p-4 bg-background-light rounded-md max-h-60 overflow-y-auto">
                            <h4 className="font-semibold mb-2">{t.conversationContent}</h4>
                            {selectedConversation.messages.map((msg, index) => (
                                <p key={msg.id || index} className={`text-sm mb-1 ${msg.sender === 'user' ? 'text-blue-600' : 'text-green-600'}`}>
                                    <strong>{msg.sender === 'user' ? 'User' : 'AI'}:</strong> {msg.text}
                                </p>
                            ))}
                        </div>
                        <div className="mb-6">
                            <label className="block text-sm font-medium text-text-main mb-2">{t.selectAiToTrain}</label>
                             <div className="space-y-2">
                                {aiConfigs.map(ai => (
                                    <button key={ai.id} onClick={() => handleTrain(ai.id)} disabled={isTraining} className="w-full text-left p-3 border rounded-md hover:bg-background-hover disabled:bg-gray-200 disabled:cursor-not-allowed">
                                        {isTraining ? t.training : ai.name}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="text-right">
                            <button onClick={() => setIsModalOpen(false)} disabled={isTraining} className="px-4 py-2 text-sm font-medium text-text-main bg-background-light rounded-md hover:bg-background-hover disabled:opacity-50">{t.cancel}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ConversationManagement;