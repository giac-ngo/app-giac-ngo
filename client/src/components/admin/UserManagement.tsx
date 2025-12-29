
// client/src/components/admin/UserManagement.tsx
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { User, Role } from '../../types';
import { apiService } from '../../services/apiService';
import { useToast } from '../ToastProvider';
import { PlusIcon, PencilIcon, TrashIcon } from '../Icons';

const translations = {
    vi: {
        title: 'Quản lý Người dùng',
        newUser: 'Người dùng Mới',
        searchPlaceholder: 'Tìm theo tên hoặc email...',
        filterByRole: 'Lọc theo quyền',
        filterByStatus: 'Lọc theo trạng thái',
        allRoles: 'Tất cả Quyền',
        allStatuses: 'Tất cả Trạng thái',
        active: 'Hoạt động',
        inactive: 'Không hoạt động',
        table: { name: 'Tên', email: 'Email', roles: 'Quyền', merits: 'Merits', status: 'Trạng thái', actions: 'Hành động' },
        
        // Pagination (Standardized with DharmaTalks)
        showing: 'Hiển thị',
        to: 'tới',
        of: 'trên',
        prev: 'Trước',
        next: 'Sau',

        modal: {
            createTitle: 'Tạo Người dùng Mới',
            editTitle: 'Chỉnh sửa Người dùng',
            name: 'Tên',
            email: 'Email',
            password: 'Mật khẩu',
            passwordNew: 'Bắt buộc khi tạo mới',
            passwordEdit: 'Để trống nếu không đổi',
            avatar: 'Ảnh bìa',
            changeAvatar: 'Đổi ảnh',
            merits: 'Merits',
            roles: 'Quyền',
            active: 'Hoạt động',
            save: 'Lưu',
            saving: 'Đang lưu...',
            cancel: 'Hủy',
            delete: 'Xóa',
        },
        feedback: {
            loading: 'Đang tải người dùng...',
            noUsers: 'Không tìm thấy người dùng.',
            fetchError: 'Tải người dùng thất bại.',
            saveSuccess: 'Lưu người dùng thành công!',
            saveError: 'Lưu thất bại: {message}',
            deleteConfirm: 'Bạn có chắc muốn xóa "{name}"?',
            deleteSuccess: 'Xóa người dùng thành công!',
            deleteError: 'Xóa thất bại: {message}',
            cannotDeleteSelf: 'Bạn không thể xóa chính mình.',
            errorAvatarRequired: 'Vui lòng cung cấp ảnh đại diện.',
        }
    },
    en: {
        title: 'User Management',
        newUser: 'New User',
        searchPlaceholder: 'Search by name or email...',
        filterByRole: 'Filter by role',
        filterByStatus: 'Filter by status',
        allRoles: 'All Roles',
        allStatuses: 'All Statuses',
        active: 'Active',
        inactive: 'Inactive',
        table: { name: 'Name', email: 'Email', roles: 'Roles', merits: 'Merits', status: 'Status', actions: 'Actions' },
        
        // Pagination
        showing: 'Showing',
        to: 'to',
        of: 'of',
        prev: 'Previous',
        next: 'Next',

        modal: {
            createTitle: 'Create New User',
            editTitle: 'Edit User',
            name: 'Name',
            email: 'Email',
            password: 'Password',
            passwordNew: 'Required for new user',
            passwordEdit: 'Leave blank to keep unchanged',
            avatar: 'Avatar',
            changeAvatar: 'Change Avatar',
            merits: 'Merits',
            roles: 'Roles',
            active: 'Active',
            save: 'Save',
            saving: 'Saving...',
            cancel: 'Cancel',
            delete: 'Delete',
        },
        feedback: {
            loading: 'Loading users...',
            noUsers: 'No users found.',
            fetchError: 'Failed to load users.',
            saveSuccess: 'User saved successfully!',
            saveError: 'Save failed: {message}',
            deleteConfirm: 'Are you sure you want to delete "{name}"?',
            deleteSuccess: 'User deleted successfully!',
            deleteError: 'Failed to delete user: {message}',
            cannotDeleteSelf: 'You cannot delete yourself.',
            errorAvatarRequired: 'Please provide an avatar.',
        }
    }
};

const ITEMS_PER_PAGE = 10;

// FIX: Destructure onUserUpdate from props to update global user state
export const UserManagement: React.FC<{ user: User, language: 'vi' | 'en', onUserUpdate: (data: Partial<User>) => void }> = ({ user: adminUser, language, onUserUpdate }) => {
    const t = translations[language];
    const { showToast } = useToast();

    const [users, setUsers] = useState<User[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<Partial<User> & { password?: string } | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const avatarInputRef = useRef<HTMLInputElement>(null);
    
    useEffect(() => {
        apiService.getAllRoles().then(setRoles).catch(err => showToast(err.message, 'error'));
    }, [showToast]);

    const fetchUsers = useCallback(async () => {
        setIsLoading(true);
        try {
            const allUsers = await apiService.getAllUsers(1, 9999, ''); 
            setUsers(allUsers);
        } catch (error) {
            showToast(translations[language].feedback.fetchError, 'error');
        } finally {
            setIsLoading(false);
        }
    }, [language, showToast]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);
    
    const filteredUsers = useMemo(() => {
        return users.filter((u: User) => {
            const searchLower = searchTerm.toLowerCase();
            const matchesSearch = u.name.toLowerCase().includes(searchLower) || u.email.toLowerCase().includes(searchLower);
            const matchesRole = !roleFilter || u.roleIds?.includes(Number(roleFilter));
            const matchesStatus = statusFilter === '' || String(u.isActive) === statusFilter;
            return matchesSearch && matchesRole && matchesStatus;
        });
    }, [users, searchTerm, roleFilter, statusFilter]);

    const paginatedUsers = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredUsers.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [filteredUsers, currentPage]);

    const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);

    const openModal = (user: Partial<User> | null) => {
        setEditingUser(user ? { ...user } : { id: 'new', name: '', email: '', password: '', isActive: true, merits: 0, roleIds: [] });
        setAvatarFile(null);
        setIsModalOpen(true);
    };

    const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        if (!editingUser) return;
        const { name, value, type } = e.target;
        let processedValue: any = value;
        if (type === 'checkbox') processedValue = (e.target as HTMLInputElement).checked;
        if (type === 'number') processedValue = value === '' ? 0 : Number(value);
        setEditingUser(prev => prev ? { ...prev, [name]: processedValue } : null);
    };
    
    const handleRoleChange = (roleId: number) => {
        if (!editingUser) return;
        const currentRoles = editingUser.roleIds || [];
        const newRoles = currentRoles.includes(roleId) ? currentRoles.filter(id => id !== roleId) : [...currentRoles, roleId];
        setEditingUser(prev => prev ? { ...prev, roleIds: newRoles } : null);
    };
    
    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setAvatarFile(file);
            setEditingUser(prev => prev ? { ...prev, avatarUrl: URL.createObjectURL(file) } : null);
        }
    };

    const handleSave = async () => {
        if (!editingUser) return;
        
        if (!editingUser.avatarUrl) {
            showToast(t.feedback.errorAvatarRequired, 'error');
            return;
        }

        setIsSaving(true);
        try {
            const payload = { ...editingUser };

            if (avatarFile) {
                const formData = new FormData();
                formData.append('context', 'avatars');
                formData.append('spaceId', 'global');
                formData.append('file', avatarFile);
                const uploadRes = await apiService.uploadFiles(formData);
                if (uploadRes.filePaths && uploadRes.filePaths[0]) {
                    payload.avatarUrl = uploadRes.filePaths[0];
                } else {
                    throw new Error("Avatar upload failed to return a path.");
                }
            }
            
            let savedUser;
            if (payload.id === 'new') {
                savedUser = await apiService.createUser(payload);
            } else {
                if (payload.password === '') delete payload.password;
                savedUser = await apiService.updateUser(payload);
            }

            // FIX: If the updated user is the currently logged-in admin, propagate the changes globally
            if (savedUser && savedUser.id === adminUser.id) {
                onUserUpdate(savedUser);
            }
            
            showToast(t.feedback.saveSuccess, 'success');
            setIsModalOpen(false);
            fetchUsers();
        } catch (error: any) {
            showToast(t.feedback.saveError.replace('{message}', error.message), 'error');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (userToDelete: Partial<User>) => {
        if (!userToDelete || typeof userToDelete.id !== 'number') return;
        if (userToDelete.id === adminUser.id) {
            showToast(t.feedback.cannotDeleteSelf, 'error');
            return;
        }
        if (window.confirm(t.feedback.deleteConfirm.replace('{name}', userToDelete.name || ''))) {
            try {
                await apiService.deleteUser(userToDelete.id);
                showToast(t.feedback.deleteSuccess, 'success');
                fetchUsers();
            } catch (error: any) {
                showToast(t.feedback.deleteError.replace('{message}', error.message), 'error');
            }
        }
    };

    const getRoleNames = (roleIds: number[] | undefined) => {
        if (!roleIds) return '';
        return roleIds.map(id => roles.find(r => r.id === id)?.name).filter(Boolean).join(', ');
    };

    return (
        <div className="p-6 h-full flex flex-col bg-background-panel">
            <div className="flex justify-between items-center mb-4 flex-shrink-0">
                <h1 className="text-2xl font-bold font-serif">{t.title}</h1>
                <button onClick={() => openModal(null)} className="px-4 py-2 bg-primary text-text-on-primary rounded-md flex items-center gap-2 font-semibold">
                    <PlusIcon className="w-5 h-5" /> {t.newUser}
                </button>
            </div>
            
            <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg bg-background-light border-border-color flex-shrink-0">
                 <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder={t.searchPlaceholder} className="p-2 border rounded-md bg-background-panel border-border-color" />
                 <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} className="p-2 border rounded-md bg-background-panel border-border-color"><option value="">{t.allRoles}</option>{roles.map(r => <option key={r.id as number} value={r.id as number}>{r.name}</option>)}</select>
                 <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="p-2 border rounded-md bg-background-panel border-border-color"><option value="">{t.allStatuses}</option><option value="true">{t.active}</option><option value="false">{t.inactive}</option></select>
            </div>

            <div className="flex-1 overflow-auto border border-border-color rounded-lg shadow-sm bg-background-panel">
                <table className="min-w-full divide-y divide-border-color">
                    <thead className="bg-background-light sticky top-0"><tr>
                        <th className="px-4 py-3 text-left text-xs font-semibold uppercase">{t.table.name}</th><th className="px-4 py-3 text-left text-xs font-semibold uppercase">{t.table.email}</th><th className="px-4 py-3 text-left text-xs font-semibold uppercase">{t.table.roles}</th><th className="px-4 py-3 text-left text-xs font-semibold uppercase">{t.table.merits}</th><th className="px-4 py-3 text-left text-xs font-semibold uppercase">{t.table.status}</th><th className="px-4 py-3 text-right text-xs font-semibold uppercase">{t.table.actions}</th>
                    </tr></thead>
                    <tbody className="bg-background-panel divide-y divide-border-color">
                        {isLoading ? (<tr><td colSpan={6} className="text-center p-4">{t.feedback.loading}</td></tr>) : paginatedUsers.length === 0 ? (<tr><td colSpan={6} className="text-center p-4">{t.feedback.noUsers}</td></tr>) : (
                            paginatedUsers.map((u: User) => (
                                <tr key={u.id} className="hover:bg-background-light">
                                    <td className="px-4 py-3 flex items-center gap-3"><img src={u.avatarUrl} alt={u.name} className="w-10 h-10 rounded-full object-cover"/>{u.name}</td>
                                    <td className="px-4 py-3">{u.email}</td><td className="px-4 py-3 text-sm text-gray-500">{getRoleNames(u.roleIds)}</td><td className="px-4 py-3">{u.merits === null ? '∞' : u.merits}</td>
                                    <td className="px-4 py-3"><span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${u.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>{u.isActive ? t.active : t.inactive}</span></td>
                                    <td className="px-4 py-3 text-right space-x-2"><button onClick={() => openModal(u)} className="p-2 rounded-full hover:bg-gray-200"><PencilIcon className="w-5 h-5"/></button><button onClick={() => handleDelete(u)} className="p-2 rounded-full hover:bg-gray-200"><TrashIcon className="w-5 h-5 text-red-600"/></button></td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {totalPages > 1 && (
                <div className="flex justify-between items-center mt-4 flex-shrink-0">
                    <p className="text-sm text-text-light">{t.showing} {(currentPage-1)*ITEMS_PER_PAGE+1} {t.to} {Math.min(currentPage*ITEMS_PER_PAGE, filteredUsers.length)} {t.of} {filteredUsers.length}</p>
                    <div className="flex gap-1">
                        <button 
                            onClick={() => setCurrentPage(p=>Math.max(1, p-1))} 
                            disabled={currentPage===1} 
                            className="px-3 py-1 text-sm border rounded-md disabled:opacity-50 disabled:cursor-not-allowed bg-white hover:bg-gray-50"
                        >
                            {t.prev}
                        </button>
                        <button 
                            onClick={() => setCurrentPage(p=>Math.min(totalPages, p+1))} 
                            disabled={currentPage===totalPages} 
                            className="px-3 py-1 text-sm border rounded-md disabled:opacity-50 disabled:cursor-not-allowed bg-white hover:bg-gray-50"
                        >
                            {t.next}
                        </button>
                    </div>
                </div>
            )}

            {isModalOpen && editingUser && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={() => setIsModalOpen(false)}>
                    <div className="bg-background-panel rounded-lg shadow-xl w-full max-w-2xl" onClick={e=>e.stopPropagation()}>
                        <h2 className="text-xl font-bold p-4 border-b border-border-color">{editingUser.id==='new' ? t.modal.createTitle : t.modal.editTitle}</h2>
                        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                            <div className="flex items-center gap-4">
                                <img src={editingUser.avatarUrl || `https://i.pravatar.cc/150?u=${editingUser.email}`} alt="Avatar" className="w-16 h-16 rounded-full object-cover"/>
                                <div><label className="block text-sm font-medium">{t.modal.avatar}</label><button type="button" onClick={()=>avatarInputRef.current?.click()} className="text-sm text-primary hover:underline">{t.modal.changeAvatar}</button><input type="file" ref={avatarInputRef} onChange={handleAvatarChange} className="hidden" accept="image/*"/></div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="block text-sm font-medium">{t.modal.name}</label><input name="name" value={editingUser.name || ''} onChange={handleFormChange} className="mt-1 w-full p-2 border rounded-md bg-background-light border-border-color"/></div>
                                <div>
                                    <label className="block text-sm font-medium">{t.modal.email}</label>
                                    <input 
                                        type="email" 
                                        name="email" 
                                        value={editingUser.email || ''} 
                                        onChange={handleFormChange} 
                                        className="mt-1 w-full p-2 border rounded-md bg-background-light border-border-color disabled:bg-gray-200 disabled:text-gray-500"
                                        disabled={editingUser.id !== 'new'}
                                    />
                                </div>
                            </div>
                            <div><label className="block text-sm font-medium">{t.modal.password}</label><input type="password" name="password" value={editingUser.password || ''} onChange={handleFormChange} placeholder={editingUser.id==='new' ? t.modal.passwordNew : t.modal.passwordEdit} className="mt-1 w-full p-2 border rounded-md bg-background-light border-border-color"/></div>
                            <div><label className="block text-sm font-medium">{t.modal.merits}</label><input type="number" name="merits" value={editingUser.merits ?? ''} onChange={handleFormChange} className="mt-1 w-full p-2 border rounded-md bg-background-light border-border-color"/></div>
                            <div>
                                <label className="block text-sm font-medium">{t.modal.roles}</label>
                                <div className="mt-2 grid grid-cols-3 gap-2 p-4 border rounded-md bg-background-light border-border-color">
                                    {roles.map(role => <label key={role.id as number} className="flex items-center gap-2"><input type="checkbox" checked={editingUser.roleIds?.includes(role.id as number) || false} onChange={()=>handleRoleChange(role.id as number)} className="h-4 w-4"/><span>{role.name}</span></label>)}
                                </div>
                            </div>
                             <div className="flex items-center"><input id="isActive" name="isActive" type="checkbox" checked={editingUser.isActive ?? true} onChange={handleFormChange} className="h-4 w-4 mr-2"/><label htmlFor="isActive">{t.modal.active}</label></div>
                        </div>
                        <div className="p-4 border-t border-border-color flex justify-end gap-2">
                             <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-background-light border border-border-color rounded-md hover:bg-gray-200">{t.modal.cancel}</button>
                             <button onClick={handleSave} disabled={isSaving} className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-hover disabled:opacity-70">{isSaving ? t.modal.saving : t.modal.save}</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
