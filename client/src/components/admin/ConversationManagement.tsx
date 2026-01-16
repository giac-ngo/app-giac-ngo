// client/src/components/admin/ConversationManagement.tsx
import React, { useState, useEffect, useMemo } from 'react';
import { Conversation, AIConfig, User, Space } from '../../types';
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
        conversationContent: 'Nội dung hội thoại',
        trainPair: 'Huấn luyện cặp này',
        trainingPair: 'Đang huấn luyện...',
        trainedPair: 'Đã huấn luyện',
        untrainPair: 'Hủy huấn luyện cặp này',
        untrainingPair: 'Đang hủy...',
        trainedBadge: 'Đã huấn luyện',
        trainRequestSent: 'Đã thêm cặp Hỏi-Đáp vào dữ liệu huấn luyện cho AI: {name}.',
        trainRequestFailed: 'Thêm cặp Hỏi-Đáp thất bại: {error}',
        untrainSuccess: 'Đã hủy huấn luyện cặp Hỏi-Đáp.',
        untrainError: 'Hủy huấn luyện thất bại: {error}',
        cancel: 'Đóng',
        aiName: 'Tên AI',
        addToSocialFeed: 'Thêm vào Social Feed',
        socialFeedNotImplemented: 'Tính năng "Thêm vào Social Feed" chưa được cài đặt.',
        filterByUser: 'Lọc theo người dùng',
        filterByAi: 'Lọc theo AI',
        allUsers: 'Tất cả người dùng',
        allAis: 'Tất cả AI',
        checkTrainedError: 'Không thể kiểm tra các cặp đã huấn luyện.',
        aiThought: 'Suy nghĩ của AI',
        editableAnswer: 'Câu trả lời của AI (có thể chỉnh sửa)',
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
        conversationContent: 'Conversation Content',
        trainPair: 'Train this pair',
        trainingPair: 'Training...',
        trainedPair: 'Trained',
        untrainPair: 'Untrain this pair',
        untrainingPair: 'Untraining...',
        trainedBadge: 'Trained',
        trainRequestSent: 'Added Q&A pair to training data for AI: {name}.',
        trainRequestFailed: 'Failed to add Q&A pair: {error}',
        untrainSuccess: 'Removed Q&A pair from training data.',
        untrainError: 'Failed to untrain Q&A pair: {error}',
        cancel: 'Close',
        aiName: 'AI Name',
        addToSocialFeed: 'Add to Social Feed',
        socialFeedNotImplemented: 'Feature "Add to Social Feed" is not implemented yet.',
        filterByUser: 'Filter by user',
        filterByAi: 'Filter by AI',
        allUsers: 'All Users',
        allAis: 'All AIs',
        checkTrainedError: 'Could not check for already trained pairs.',
        aiThought: 'AI Thought',
        editableAnswer: 'AI Answer (Editable)',
    }
};


export const ConversationManagement: React.FC<ConversationManagementProps> = ({ user, language }) => {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [aiConfigs, setAiConfigs] = useState<AIConfig[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
    const [userFilter, setUserFilter] = useState<string>('');
    const [aiFilter, setAiFilter] = useState<string>('');
    const [spaceIdFilter, setSpaceIdFilter] = useState<string>(() => {
        if (user.permissions?.includes('roles')) return ''; // Admin sees all by default
        return '';
    });
    const [allSpaces, setAllSpaces] = useState<Space[]>([]);
    const { showToast } = useToast();
    const t = translations[language];

    const [trainingPairIndex, setTrainingPairIndex] = useState<number | null>(null);
    const [successfullyTrainedIndices, setSuccessfullyTrainedIndices] = useState<Set<number>>(new Set());
    const [trainedPairsMap, setTrainedPairsMap] = useState<Map<number, Set<string>>>(new Map());
    const [editableAnswers, setEditableAnswers] = useState<Record<number, string>>({});

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const [convos, ais, spaces] = await Promise.all([
                    apiService.getAllConversations(user),
                    apiService.getManageableAiConfigs(user),
                    apiService.getSpaces()
                ]);
                setConversations(convos);
                setAiConfigs(ais);
                setAllSpaces(spaces || []);

                // Set default space for regular users
                if (!user.permissions?.includes('roles') && spaces && spaces.length > 0) {
                    const userSpace = spaces.find(s => s.userId === user.id);
                    if (userSpace) {
                        setSpaceIdFilter(String(userSpace.id));
                    }
                }

                const newTrainedPairsMap = new Map<number, Set<string>>();
                const trainingDataPromises = ais
                    .filter(ai => typeof ai.id === 'number')
                    .map(async (ai) => {
                        try {
                            const trainingData = await apiService.getTrainingDataForAI(ai.id as number);
                            const qaData = trainingData.filter(d => d.type === 'qa');
                            const existingPairs = new Set(qaData.map(d => `${d.question?.trim() || ''}|||${d.answer?.trim() || ''}`));
                            if (existingPairs.size > 0) {
                                newTrainedPairsMap.set(ai.id as number, existingPairs);
                            }
                        } catch (e) {
                            console.error(`Could not fetch training data for AI ${ai.id}`, e);
                        }
                    });

                await Promise.all(trainingDataPromises);
                setTrainedPairsMap(newTrainedPairsMap);

            } catch (error) {
                console.error("Lỗi khi tải dữ liệu:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [user]);

    const uniqueUsers = useMemo(() => Array.from(new Set(conversations.map(c => c.userName))).sort(), [conversations]);
    const uniqueAis = useMemo(() => Array.from(new Set(conversations.map(c => c.aiName).filter(Boolean) as string[])).sort(), [conversations]);

    const manageableSpaces = useMemo(() => {
        if (user.permissions?.includes('roles')) {
            return allSpaces; // Admins can see all spaces
        }
        return allSpaces.filter(space => space.userId === user.id);
    }, [allSpaces, user]);

    const filteredConversations = useMemo(() => {
        return conversations.filter(conv => {
            const userMatch = !userFilter || conv.userName === userFilter;
            const aiMatch = !aiFilter || conv.aiName === aiFilter;

            // Space filter: filter by AI's space
            let spaceMatch = true;
            if (spaceIdFilter) {
                const aiConfig = aiConfigs.find(ai => ai.id === conv.aiConfigId);
                spaceMatch = aiConfig ? String(aiConfig.spaceId) === spaceIdFilter : false;
            }

            return userMatch && aiMatch && spaceMatch;
        });
    }, [conversations, userFilter, aiFilter, spaceIdFilter, aiConfigs]);

    const totalPages = Math.ceil(filteredConversations.length / ITEMS_PER_PAGE);
    const paginatedConversations = filteredConversations.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    const handleOpenModal = async (conv: Conversation) => {
        setSelectedConversation(conv);
        setTrainingPairIndex(null);

        // Initialize editable answers state for the modal
        const initialAnswers: Record<number, string> = {};
        conv.messages.forEach((msg, index) => {
            if (msg.sender === 'ai') {
                initialAnswers[index] = msg.text;
            }
        });
        setEditableAnswers(initialAnswers);

        if (conv.aiConfigId) {
            try {
                const trainedPairs = trainedPairsMap.get(conv.aiConfigId as number);
                const trainedIndices = new Set<number>();

                if (trainedPairs) {
                    conv.messages.forEach((msg, index) => {
                        if (msg.sender === 'ai' && index > 0 && conv.messages[index - 1].sender === 'user') {
                            const question = conv.messages[index - 1].text.trim();
                            const answer = msg.text.trim();
                            const pairKey = `${question}|||${answer}`;
                            if (trainedPairs.has(pairKey)) {
                                trainedIndices.add(index);
                            }
                        }
                    });
                }
                setSuccessfullyTrainedIndices(trainedIndices);

            } catch (error) {
                console.error("Failed to check training status from map", error);
                showToast(t.checkTrainedError, 'error');
                setSuccessfullyTrainedIndices(new Set());
            }
        } else {
            setSuccessfullyTrainedIndices(new Set());
        }

        setIsModalOpen(true);
    };

    const handleToggleTrainPair = async (conversation: Conversation, aiMessageIndex: number) => {
        if (!conversation || typeof conversation.aiConfigId !== 'number' || trainingPairIndex !== null) return;

        const aiToTrain = aiConfigs.find(ai => ai.id === conversation.aiConfigId);
        if (!aiToTrain) {
            showToast(`Không tìm thấy AI '${conversation.aiName || ''}' để huấn luyện.`, 'error');
            return;
        }

        const question = conversation.messages[aiMessageIndex - 1]?.text?.trim();
        const thought = conversation.messages[aiMessageIndex]?.thought;

        if (!question) return;

        const isAlreadyTrained = successfullyTrainedIndices.has(aiMessageIndex);

        setTrainingPairIndex(aiMessageIndex);

        if (isAlreadyTrained) {
            const originalAnswer = conversation.messages[aiMessageIndex]?.text?.trim();
            if (originalAnswer === undefined) { setTrainingPairIndex(null); return; }

            try {
                await apiService.deleteTrainingQaDataSource(Number(aiToTrain.id), question, originalAnswer);
                showToast(t.untrainSuccess, 'success');

                const newTrainedIndices = new Set(successfullyTrainedIndices);
                newTrainedIndices.delete(aiMessageIndex);
                setSuccessfullyTrainedIndices(newTrainedIndices);

                setTrainedPairsMap(prevMap => {
                    const newMap = new Map(prevMap);
                    const pairsForAi = new Set<string>(newMap.get(aiToTrain.id as number) || []);
                    pairsForAi.delete(`${question}|||${originalAnswer}`);
                    newMap.set(aiToTrain.id as number, pairsForAi);
                    return newMap;
                });

                if (newTrainedIndices.size === 0) {
                    await apiService.updateConversationTrainingStatus(conversation.id, false);
                    setConversations(prevConvos =>
                        prevConvos.map(c =>
                            c.id === conversation.id ? { ...c, isTrained: false } : c
                        )
                    );
                }
            } catch (error: any) {
                showToast(t.untrainError.replace('{error}', error.message), 'error');
            } finally {
                setTrainingPairIndex(null);
            }

        } else {
            const editedAnswer = editableAnswers[aiMessageIndex]?.trim();
            if (editedAnswer === undefined) { setTrainingPairIndex(null); return; }

            try {
                await apiService.createTrainingQaDataSource(Number(aiToTrain.id), question, editedAnswer, thought);
                showToast(t.trainRequestSent.replace('{name}', aiToTrain.name), 'success');

                await apiService.updateConversationTrainingStatus(conversation.id, true);

                setConversations(prevConvos =>
                    prevConvos.map(c =>
                        c.id === conversation.id ? { ...c, isTrained: true } : c
                    )
                );

                setSuccessfullyTrainedIndices(prev => new Set(prev).add(aiMessageIndex));

                setTrainedPairsMap(prevMap => {
                    const newMap = new Map(prevMap);
                    const pairsForAi = new Set<string>(newMap.get(aiToTrain.id as number) || []);
                    pairsForAi.add(`${question}|||${editedAnswer}`); // Use edited answer
                    newMap.set(aiToTrain.id as number, pairsForAi);
                    return newMap;
                });
            } catch (error: any) {
                showToast(t.trainRequestFailed.replace('{error}', error.message), 'error');
            } finally {
                setTrainingPairIndex(null);
            }
        }
    };

    const handleAddToSocialFeed = () => {
        showToast(t.socialFeedNotImplemented, 'info');
    };

    const renderPagination = () => (
        <div className="flex justify-between items-center mt-6">
            <p className="text-sm text-text-light">
                {t.showing} {filteredConversations.length > 0 ? ((currentPage - 1) * ITEMS_PER_PAGE) + 1 : 0} {t.to} {Math.min(currentPage * ITEMS_PER_PAGE, filteredConversations.length)} {t.of} {filteredConversations.length}
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

            <div className="flex space-x-4 mb-4">
                <div>
                    <label htmlFor="user-filter" className="block text-sm font-medium text-text-light">{t.filterByUser}</label>
                    <select id="user-filter" value={userFilter} onChange={e => setUserFilter(e.target.value)} className="mt-1 block w-full p-2 border border-border-color rounded-md focus:ring-primary focus:border-primary">
                        <option value="">{t.allUsers}</option>
                        {uniqueUsers.map(name => <option key={name} value={name}>{name}</option>)}
                    </select>
                </div>
                <div>
                    <label htmlFor="ai-filter" className="block text-sm font-medium text-text-light">{t.filterByAi}</label>
                    <select id="ai-filter" value={aiFilter} onChange={e => setAiFilter(e.target.value)} className="mt-1 block w-full p-2 border border-border-color rounded-md focus:ring-primary focus:border-primary">
                        <option value="">{t.allAis}</option>
                        {uniqueAis.map(name => <option key={name} value={name}>{name}</option>)}
                    </select>
                </div>
                {manageableSpaces.length > 0 && (
                    <div>
                        <label htmlFor="space-filter" className="block text-sm font-medium text-text-light">Lọc theo Không gian</label>
                        <select
                            id="space-filter"
                            value={spaceIdFilter}
                            onChange={e => setSpaceIdFilter(e.target.value)}
                            className="mt-1 block w-full p-2 border border-border-color rounded-md focus:ring-primary focus:border-primary"
                        >
                            {user.permissions?.includes('roles') && <option value="">Tất cả không gian</option>}
                            {manageableSpaces.map(space => (
                                <option key={space.id} value={space.id}>{space.name}</option>
                            ))}
                        </select>
                    </div>
                )}
            </div>

            <div className="bg-background-panel shadow-md rounded-lg overflow-hidden">
                <table className="min-w-full divide-y divide-border-color">
                    <thead className="bg-background-light">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-text-light uppercase tracking-wider">{t.user}</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-text-light uppercase tracking-wider">{t.startContent}</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-text-light uppercase tracking-wider">{t.aiName}</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-text-light uppercase tracking-wider">{t.date}</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-text-light uppercase tracking-wider">{t.action}</th>
                        </tr>
                    </thead>
                    <tbody className="bg-background-panel divide-y divide-border-color">
                        {paginatedConversations.map(conv => (
                            <tr key={conv.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-text-main">{conv.userName}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-text-light max-w-sm truncate">{conv.messages[0]?.text || ''}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-text-main">
                                    {conv.aiName}
                                    {conv.isTrained && (
                                        <span className="ml-2 px-2 py-0.5 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                            {t.trainedBadge}
                                        </span>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-text-light">{new Date(conv.startTime).toLocaleString()}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-4">
                                    <button onClick={() => handleOpenModal(conv)} className="text-primary hover:text-primary-hover">{t.viewAndTrain}</button>
                                    <button onClick={handleAddToSocialFeed} className="text-indigo-600 hover:text-indigo-800">{t.addToSocialFeed}</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredConversations.length === 0 && <p className="text-center py-4 text-text-light">{t.noConversations}</p>}
            </div>
            {renderPagination()}

            {isModalOpen && selectedConversation && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={() => setIsModalOpen(false)}>
                    <div className="bg-background-panel rounded-lg shadow-xl w-full max-w-3xl flex flex-col h-[80vh]" onClick={e => e.stopPropagation()}>
                        <h2 className="text-xl font-bold p-6 border-b border-border-color flex-shrink-0">{t.conversationContent}</h2>
                        <div className="flex-grow p-6 overflow-y-auto">
                            {selectedConversation.messages.map((msg, index) => {
                                const isTrainablePair = msg.sender === 'ai' && index > 0 && selectedConversation.messages[index - 1].sender === 'user';
                                const isTrained = successfullyTrainedIndices.has(index);
                                const isTraining = trainingPairIndex === index;
                                const buttonText = isTraining
                                    ? (isTrained ? t.untrainingPair : t.trainingPair)
                                    : (isTrained ? t.untrainPair : t.trainPair);

                                return (
                                    <div key={msg.id || index} className="group mb-4">
                                        {msg.sender === 'user' ? (
                                            <div className="p-3 rounded-lg bg-blue-50">
                                                <p className="text-sm text-blue-800">
                                                    <strong className="font-semibold">User:</strong> {msg.text}
                                                </p>
                                            </div>
                                        ) : (
                                            <div className="bg-green-50 p-3 rounded-lg">
                                                <label className="block text-xs font-semibold text-green-900 mb-1">{t.editableAnswer}</label>
                                                <textarea
                                                    value={editableAnswers[index] || ''}
                                                    onChange={(e) => setEditableAnswers(prev => ({ ...prev, [index]: e.target.value }))}
                                                    className="w-full p-2 border rounded-md bg-white text-sm text-green-900 focus:ring-primary focus:border-primary"
                                                    rows={Math.max(4, (editableAnswers[index] || '').split('\n').length)}
                                                />
                                            </div>
                                        )}

                                        {msg.sender === 'ai' && msg.thought && (
                                            <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-md text-xs text-yellow-800">
                                                <p className="font-semibold">{t.aiThought}:</p>
                                                <p className="italic whitespace-pre-wrap">{msg.thought}</p>
                                            </div>
                                        )}
                                        {isTrainablePair && (
                                            <div className="text-right -mt-2">
                                                <button
                                                    onClick={() => handleToggleTrainPair(selectedConversation, index)}
                                                    disabled={isTraining}
                                                    className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${isTrained
                                                            ? 'bg-red-100 text-red-700 hover:bg-red-200 opacity-100 group-hover:opacity-100'
                                                            : isTraining
                                                                ? 'bg-yellow-100 text-yellow-700 cursor-wait'
                                                                : 'bg-gray-200 text-gray-700 hover:bg-primary-light hover:text-primary opacity-0 group-hover:opacity-100'
                                                        }`}
                                                >
                                                    {buttonText}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                        <div className="text-right space-x-3 p-6 border-t border-border-color flex-shrink-0">
                            <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 text-sm font-medium text-text-main bg-background-light rounded-md hover:bg-border-color">{t.cancel}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};