// client/src/components/admin/PricingManagement.tsx
import React, { useState, useEffect } from 'react';
import { AIConfig, User } from '../../types';
import { apiService } from '../../services/apiService';
import { useToast } from '../ToastProvider';
import { normalizePostgresArray } from '../../utils/arrayUtils';
import { TrashIcon } from '../Icons';

interface PricingManagementProps {
    language: 'vi' | 'en';
    user: User;
}

const translations = {
    vi: {
        title: 'Quản lý Giá & Truy cập AI',
        loading: 'Đang tải danh sách AI...',
        aiName: 'Tên AI',
        currentPrice: 'Giá bán (Merits)',
        oldPrice: 'Giá cũ (nếu giảm giá)',
        requestsGranted: 'Số lần request',
        onSale: 'Đang giảm giá?',
        contactForAccess: 'Yêu cầu liên hệ?',
        accessManagement: 'Quản lý Truy cập',
        manage: 'Quản lý',
        save: 'Lưu',
        saving: 'Đang lưu...',
        saveSuccess: 'Cập nhật giá thành công!',
        saveError: 'Lưu thất bại: {message}',
        fetchError: 'Không thể tải danh sách AI.',
        accessModal: {
            title: 'Quản lý truy cập cho "{name}"',
            currentUsers: 'Người dùng hiện tại có quyền truy cập:',
            noUsers: 'Chưa có người dùng nào được cấp quyền.',
            addUser: 'Thêm người dùng mới',
            emailPlaceholder: 'Nhập email người dùng...',
            add: 'Thêm',
            saveChanges: 'Lưu thay đổi',
            saving: 'Đang lưu...',
            close: 'Đóng',
            fetchUsersError: 'Không thể tải danh sách người dùng.',
            updateUsersError: 'Cập nhật danh sách thất bại.',
            updateUsersSuccess: 'Cập nhật danh sách truy cập thành công!',
            remove: 'Xóa',
            emailNotFound: 'Không tìm thấy người dùng với email này.',
        },
    },
    en: {
        title: 'AI Pricing & Access Management',
        loading: 'Loading AI list...',
        aiName: 'AI Name',
        currentPrice: 'Purchase Cost (Merits)',
        oldPrice: 'Old Price (for discount)',
        requestsGranted: 'Requests Granted',
        onSale: 'On Sale?',
        contactForAccess: 'Require Contact?',
        accessManagement: 'Access Management',
        manage: 'Manage',
        save: 'Save',
        saving: 'Saving...',
        saveSuccess: 'Pricing updated successfully!',
        saveError: 'Save failed: {message}',
        fetchError: 'Could not load AI list.',
        accessModal: {
            title: 'Manage Access for "{name}"',
            currentUsers: 'Current users with access:',
            noUsers: 'No users have been granted access yet.',
            addUser: 'Add New User',
            emailPlaceholder: 'Enter user email...',
            add: 'Add',
            saveChanges: 'Save Changes',
            saving: 'Saving...',
            close: 'Close',
            fetchUsersError: 'Could not load user list.',
            updateUsersError: 'Failed to update user list.',
            updateUsersSuccess: 'Access list updated successfully!',
            remove: 'Remove',
            emailNotFound: 'User with this email not found.',
        },
    }
};

const AccessManagementModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    ai: AIConfig;
    language: 'vi' | 'en';
}> = ({ isOpen, onClose, ai, language }) => {
    const t = translations[language].accessModal;
    const { showToast } = useToast();
    const [usersWithAccess, setUsersWithAccess] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [newEmail, setNewEmail] = useState('');

    useEffect(() => {
        if (isOpen) {
            setIsLoading(true);
            apiService.getAiAccessList(ai.id)
                .then(setUsersWithAccess)
                .catch(() => showToast(t.fetchUsersError, 'error'))
                .finally(() => setIsLoading(false));
        }
    }, [isOpen, ai.id, showToast, t.fetchUsersError]);

    const handleAddEmail = () => {
        if (!newEmail.trim() || usersWithAccess.some(u => u.email === newEmail.trim())) {
            return;
        }
        // For now, we add a placeholder. The backend will validate if the user exists.
        const placeholderUser: User = { id: Date.now(), name: 'New User', email: newEmail.trim(), avatarUrl: '', isActive: true, merits: 0, requestsRemaining: 0 };
        setUsersWithAccess(prev => [...prev, placeholderUser]);
        setNewEmail('');
    };

    const handleRemoveUser = (userId: number | string) => {
        setUsersWithAccess(prev => prev.filter(u => u.id !== userId));
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const emails = usersWithAccess.map(u => u.email);
            await apiService.updateAiAccessList(ai.id, emails);
            showToast(t.updateUsersSuccess, 'success');
            onClose();
        } catch (error: any) {
            showToast(t.updateUsersError, 'error');
        } finally {
            setIsSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-background-panel rounded-lg shadow-xl w-full max-w-2xl flex flex-col max-h-[80vh]" onClick={e => e.stopPropagation()}>
                <h2 className="text-xl font-bold p-4 border-b">{t.title.replace('{name}', ai.name)}</h2>
                <div className="p-4 overflow-y-auto space-y-4">
                    <h3 className="font-semibold">{t.currentUsers}</h3>
                    {isLoading ? <p>{translations[language].loading}</p> : usersWithAccess.length === 0 ? <p className="text-sm text-text-light">{t.noUsers}</p> : (
                        <div className="space-y-2">
                            {usersWithAccess.map(user => (
                                <div key={user.id} className="flex items-center justify-between bg-background-light p-2 rounded-md">
                                    <div className="flex items-center gap-2">
                                        <img src={user.avatarUrl} alt={user.name} className="w-8 h-8 rounded-full" />
                                        <div>
                                            <p className="font-medium text-sm">{user.name}</p>
                                            <p className="text-xs text-text-light">{user.email}</p>
                                        </div>
                                    </div>
                                    <button onClick={() => handleRemoveUser(user.id)} className="p-1 text-accent-red hover:bg-red-100 rounded-full"><TrashIcon className="w-4 h-4"/></button>
                                </div>
                            ))}
                        </div>
                    )}
                    <div className="pt-4 border-t">
                         <h3 className="font-semibold mb-2">{t.addUser}</h3>
                         <div className="flex items-center gap-2">
                            <input type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} placeholder={t.emailPlaceholder} className="flex-grow p-2 border rounded-md" />
                            <button onClick={handleAddEmail} className="px-4 py-2 bg-primary text-text-on-primary rounded-md">{t.add}</button>
                        </div>
                    </div>
                </div>
                <div className="p-4 border-t text-right space-x-2">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-md">{t.close}</button>
                    <button onClick={handleSave} disabled={isSaving} className="px-4 py-2 bg-primary text-text-on-primary rounded-md">{isSaving ? t.saving : t.saveChanges}</button>
                </div>
            </div>
        </div>
    );
};

export const PricingManagement: React.FC<PricingManagementProps> = ({ language, user }) => {
    const t = translations[language];
    const [aiList, setAiList] = useState<AIConfig[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState<string | number | null>(null);
    const [editedData, setEditedData] = useState<Record<string | number, Partial<AIConfig>>>({});
    const { showToast } = useToast();
    const [isAccessModalOpen, setIsAccessModalOpen] = useState(false);
    const [managingAi, setManagingAi] = useState<AIConfig | null>(null);


    useEffect(() => {
        const fetchAis = async () => {
            setIsLoading(true);
            try {
                const data = await apiService.getManageableAiConfigs(user);
                setAiList(data);
            } catch (error) {
                showToast(t.fetchError, 'error');
            } finally {
                setIsLoading(false);
            }
        };
        fetchAis();
    }, [user, t.fetchError, showToast]);

    const handleFieldChange = (aiId: string | number, field: keyof AIConfig, value: any) => {
        setEditedData(prev => {
            const newAiData = {
                ...(prev[aiId] || {}),
                [field]: value
            };

            // When 'Require Contact' is checked, nullify pricing fields.
            if (field === 'isContactForAccess' && value === true) {
                newAiData.purchaseCost = undefined;
                newAiData.oldPurchaseCost = undefined;
                newAiData.isOnSale = false;
            }

            return {
                ...prev,
                [aiId]: newAiData
            };
        });
    };

    const handleSave = async (ai: AIConfig) => {
        setIsSaving(ai.id);
        try {
            const payload = {
                ...ai,
                ...editedData[ai.id],
                tags: normalizePostgresArray(ai.tags),
                suggestedQuestions: normalizePostgresArray(ai.suggestedQuestions),
                suggestedQuestionsEn: normalizePostgresArray(ai.suggestedQuestionsEn),
            };

            const updatedAi = await apiService.updateAiConfig(payload);
            
            setAiList(prev => prev.map(a => a.id === updatedAi.id ? updatedAi : a));
            setEditedData(prev => {
                const newEdited = { ...prev };
                delete newEdited[ai.id];
                return newEdited;
            });

            showToast(t.saveSuccess, 'success');
        } catch (error: any) {
            showToast(t.saveError.replace('{message}', error.message), 'error');
        } finally {
            setIsSaving(null);
        }
    };

    const handleOpenAccessModal = (ai: AIConfig) => {
        setManagingAi(ai);
        setIsAccessModalOpen(true);
    };

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold mb-6">{t.title}</h1>
            {isLoading ? <p>{t.loading}</p> : (
                 <div className="bg-background-panel shadow-md rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-border-color">
                            <thead className="bg-background-light">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-text-light uppercase">{t.aiName}</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-text-light uppercase">{t.currentPrice}</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-text-light uppercase">{t.oldPrice}</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-text-light uppercase">{t.requestsGranted}</th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-text-light uppercase">{t.onSale}</th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-text-light uppercase">{t.contactForAccess}</th>
                                    <th className="px-6 py-3 text-center text-xs font-medium text-text-light uppercase">{t.accessManagement}</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-text-light uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="bg-background-panel divide-y divide-border-color">
                                {aiList.map(ai => {
                                    const currentData = { ...ai, ...(editedData[ai.id] || {}) };
                                    const isContact = currentData.isContactForAccess || false;
                                    return (
                                        <tr key={ai.id}>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{ai.name}</td>
                                            <td className="px-6 py-4">
                                                <input
                                                    type="number"
                                                    value={currentData.purchaseCost ?? ''}
                                                    onChange={e => handleFieldChange(ai.id, 'purchaseCost', e.target.value === '' ? undefined : Number(e.target.value))}
                                                    className="w-32 p-1 border rounded-md disabled:bg-gray-100 disabled:cursor-not-allowed"
                                                    disabled={isContact}
                                                />
                                            </td>
                                            <td className="px-6 py-4">
                                                <input
                                                    type="number"
                                                    value={currentData.oldPurchaseCost ?? ''}
                                                    onChange={e => handleFieldChange(ai.id, 'oldPurchaseCost', e.target.value === '' ? undefined : Number(e.target.value))}
                                                    className="w-32 p-1 border rounded-md disabled:bg-gray-100 disabled:cursor-not-allowed"
                                                    placeholder="e.g., 250"
                                                    disabled={isContact}
                                                />
                                            </td>
                                             <td className="px-6 py-4">
                                                <input
                                                    type="number"
                                                    value={currentData.requestsGrantedOnPurchase ?? ''}
                                                    onChange={e => handleFieldChange(ai.id, 'requestsGrantedOnPurchase', e.target.value === '' ? undefined : Number(e.target.value))}
                                                    className="w-32 p-1 border rounded-md disabled:bg-gray-100 disabled:cursor-not-allowed"
                                                    placeholder="e.g., 100"
                                                />
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <input
                                                    type="checkbox"
                                                    checked={currentData.isOnSale || false}
                                                    onChange={e => handleFieldChange(ai.id, 'isOnSale', e.target.checked)}
                                                    className="h-5 w-5 rounded text-primary disabled:cursor-not-allowed"
                                                    disabled={isContact}
                                                />
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <input
                                                    type="checkbox"
                                                    checked={currentData.isContactForAccess || false}
                                                    onChange={e => handleFieldChange(ai.id, 'isContactForAccess', e.target.checked)}
                                                    className="h-5 w-5 rounded text-primary"
                                                />
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <button onClick={() => handleOpenAccessModal(ai)} disabled={!isContact} className="text-sm text-primary hover:underline disabled:text-gray-400 disabled:no-underline">
                                                    {t.manage}
                                                </button>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button
                                                    onClick={() => handleSave(ai)}
                                                    disabled={isSaving === ai.id || !editedData[ai.id]}
                                                    className="px-4 py-2 bg-primary text-text-on-primary rounded-md disabled:opacity-50"
                                                >
                                                    {isSaving === ai.id ? t.saving : t.save}
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
            {managingAi && (
                <AccessManagementModal 
                    isOpen={isAccessModalOpen}
                    onClose={() => setIsAccessModalOpen(false)}
                    ai={managingAi}
                    language={language}
                />
            )}
        </div>
    );
};
