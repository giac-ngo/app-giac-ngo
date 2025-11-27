// client/src/components/admin/UserManagement.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { User, Role } from '../../types';
import { apiService } from '../../services/apiService';
import { useToast } from '../ToastProvider';
import { SpinnerIcon } from '../Icons';

const translations = {
    vi: {
        listTitle: 'Danh sách Người dùng',
        newUserButton: 'Tạo người dùng',
        formTitle: 'Chi tiết Người dùng',
        noUserSelected: 'Chọn một người dùng từ danh sách hoặc tạo người dùng mới.',
        loading: 'Đang tải...',
        loadingMore: 'Đang tải thêm...',
        nameLabel: 'Tên',
        emailLabel: 'Email',
        passwordLabel: 'Mật khẩu',
        passwordPlaceholderNew: 'Bắt buộc khi tạo mới',
        passwordPlaceholderEdit: 'Để trống nếu không đổi',
        avatarUrlLabel: 'URL Avatar',
        meritsLabel: 'Merits',
        isActiveLabel: 'Đang hoạt động?',
        rolesLabel: 'Quyền',
        deleteButton: 'Xóa',
        saveButton: 'Lưu thay đổi',
        saving: 'Đang lưu...',
        changeAvatar: 'Đổi Avatar',
        saveSuccess: 'Lưu thành công!',
        searchPlaceholder: 'Tìm theo tên hoặc email...',
        alerts: {
            cannotDeleteSelf: 'Bạn không thể xóa chính mình.',
            confirmDelete: 'Bạn có chắc chắn muốn xóa người dùng "{name}" không?',
            deleteError: 'Xóa người dùng thất bại.',
            saveError: 'Lưu thất bại: {message}',
            fetchError: 'Không thể tải danh sách người dùng.',
            errorAvatarRequired: 'Vui lòng cung cấp ảnh đại diện cho người dùng.',
        }
    },
    en: {
        listTitle: 'User List',
        newUserButton: 'Create User',
        formTitle: 'User Details',
        noUserSelected: 'Select a user from the list or create a new one.',
        loading: 'Loading...',
        loadingMore: 'Loading more...',
        nameLabel: 'Name',
        emailLabel: 'Email',
        passwordLabel: 'Password',
        passwordPlaceholderNew: 'Required for new user',
        passwordPlaceholderEdit: 'Leave blank to keep unchanged',
        avatarUrlLabel: 'Avatar URL',
        meritsLabel: 'Merits',
        isActiveLabel: 'Is Active?',
        rolesLabel: 'Roles',
        deleteButton: 'Delete',
        saveButton: 'Save Changes',
        saving: 'Saving...',
        changeAvatar: 'Change Avatar',
        saveSuccess: 'Saved successfully!',
        searchPlaceholder: 'Search by name or email...',
        alerts: {
            cannotDeleteSelf: 'You cannot delete yourself.',
            confirmDelete: 'Are you sure you want to delete user "{name}"?',
            deleteError: 'Failed to delete user.',
            saveError: 'Save failed: {message}',
            fetchError: 'Could not load user list.',
            errorAvatarRequired: 'Please provide an avatar for the user.',
        }
    }
};

const ITEMS_PER_PAGE = 15;

export const UserManagement: React.FC<{ user: User, language: 'vi' | 'en', onUserUpdate: (data: Partial<User>) => void }> = ({ user: adminUser, language, onUserUpdate }) => {
    const [users, setUsers] = useState<User[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
    const [selectedUser, setSelectedUser] = useState<Partial<User> & { password?: string } | null>(null);
    const [formState, setFormState] = useState<Partial<User> & { password?: string } | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    const { showToast } = useToast();
    const t = translations[language];
    const avatarInputRef = useRef<HTMLInputElement>(null);
    const listContainerRef = useRef<HTMLDivElement>(null);

    const isSuperAdmin = adminUser.permissions?.includes('roles');
    
    // Debounce search term
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
        }, 300);

        return () => {
            clearTimeout(handler);
        };
    }, [searchTerm]);
    
    const fetchUsers = useCallback(async (pageNum: number, search: string) => {
        setIsLoading(true);
        try {
            if (isSuperAdmin) {
                const fetchedUsers = await apiService.getAllUsers(pageNum, ITEMS_PER_PAGE, search);
                setUsers(prevUsers => pageNum === 1 ? fetchedUsers : [...prevUsers, ...fetchedUsers]);
                setHasMore(fetchedUsers.length === ITEMS_PER_PAGE);
            } else {
                setUsers([adminUser]);
                setSelectedUser(adminUser);
                setHasMore(false);
            }
        } catch (error) {
            showToast(t.alerts.fetchError, 'error');
        } finally {
            setIsLoading(false);
        }
    }, [isSuperAdmin, adminUser, showToast, t.alerts.fetchError]);

    // Initial load and search term change effect
    useEffect(() => {
        setUsers([]);
        setPage(1);
        setHasMore(true);
        fetchUsers(1, debouncedSearchTerm);
    }, [debouncedSearchTerm, fetchUsers]);

    // Initial roles fetch
    useEffect(() => {
        if (isSuperAdmin) {
            apiService.getAllRoles().then(setRoles).catch(() => showToast(t.alerts.fetchError, 'error'));
        }
    }, [isSuperAdmin, showToast, t.alerts.fetchError]);

    const loadMoreUsers = () => {
        if (!isLoading && hasMore) {
            const nextPage = page + 1;
            setPage(nextPage);
            fetchUsers(nextPage, debouncedSearchTerm);
        }
    };

    // Infinite scroll observer
    useEffect(() => {
        const observer = new IntersectionObserver(
            entries => {
                if (entries[0].isIntersecting) {
                    loadMoreUsers();
                }
            },
            { threshold: 1 }
        );

        const lastUserElement = listContainerRef.current?.querySelector('ul > li:last-child');
        if (lastUserElement) {
            observer.observe(lastUserElement);
        }

        return () => {
            if (lastUserElement) {
                observer.unobserve(lastUserElement);
            }
        };
    }, [users, hasMore, isLoading]);

    useEffect(() => {
        setFormState(selectedUser ? { ...selectedUser } : null);
    }, [selectedUser]);

    const handleNewUser = () => {
        const newUserTemplate: Partial<User> & { password?: string } = {
            id: 'new', name: '', email: '', password: '',
            isActive: true, merits: 0, avatarUrl: '', roleIds: []
        };
        setSelectedUser(newUserTemplate);
    };

    const handleFormChange = (field: keyof (User & { password?: string }), value: any) => {
        if (formState) {
            const newValue = field === 'merits' ? (value === '' ? null : Number(value)) : value;
            setFormState({ ...formState, [field]: newValue });
        }
    };

     const handleRoleChange = (roleId: number) => {
        if (formState) {
            const currentRoleIds = formState.roleIds || [];
            const newRoleIds = currentRoleIds.includes(roleId)
                ? currentRoleIds.filter(id => id !== roleId)
                : [...currentRoleIds, roleId];
            setFormState({ ...formState, roleIds: newRoleIds });
        }
    };
    
    const handleSave = async () => {
        if (!formState) return;
        if (!formState.avatarUrl) {
            showToast(t.alerts.errorAvatarRequired, 'error');
            return;
        }

        setIsSaving(true);
        try {
            let savedUser;
    
            if (formState.id === 'new') {
                const { permissions, id, ...createPayload } = formState;
                savedUser = await apiService.createUser(createPayload);
            } else {
                const updatePayload: Partial<User> & { password?: string } = {
                    id: formState.id, name: formState.name, avatarUrl: formState.avatarUrl,
                };
                if(isSuperAdmin) {
                    updatePayload.email = formState.email; updatePayload.password = formState.password;
                    updatePayload.merits = formState.merits; updatePayload.isActive = formState.isActive;
                    updatePayload.roleIds = formState.roleIds;
                }
                if (!updatePayload.password) delete updatePayload.password;
                savedUser = await apiService.updateUser(updatePayload);
            }
            showToast(t.saveSuccess);
            
            if (isSuperAdmin) {
                setUsers([]); setPage(1); setHasMore(true);
                fetchUsers(1, debouncedSearchTerm);
                setSelectedUser(savedUser);
            } else {
                setUsers([savedUser]); setSelectedUser(savedUser);
            }
    
            if (savedUser.id === adminUser.id) onUserUpdate(savedUser);
        } catch (error: any) {
            showToast(t.alerts.saveError.replace('{message}', error.message), 'error');
        } finally {
            setIsSaving(false);
        }
    };
    
    const handleDelete = async () => {
        if (!formState || formState.id === 'new' || formState.id === adminUser.id) {
            if (formState?.id === adminUser.id) showToast(t.alerts.cannotDeleteSelf, 'error');
            return;
        }
        if (window.confirm(t.alerts.confirmDelete.replace('{name}', formState.name || ''))) {
            try {
                await apiService.deleteUser(formState.id as number);
                setUsers(users.filter(u => u.id !== formState.id));
                setSelectedUser(null);
            } catch (error) {
                showToast(t.alerts.deleteError, 'error');
            }
        }
    };

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && formState) {
            const reader = new FileReader();
            reader.onloadend = () => {
                handleFormChange('avatarUrl', reader.result as string);
            };
            reader.readAsDataURL(file);
        }
        if (e.target) e.target.value = '';
    };

    return (
        <div className="flex h-full bg-background-light">
            <aside className="w-96 border-r border-border-color bg-background-panel flex flex-col h-full">
                <div className="p-4 border-b border-border-color flex justify-between items-center">
                    <h2 className="text-lg font-bold">{t.listTitle}</h2>
                    {isSuperAdmin && <button onClick={handleNewUser} className="px-3 py-1 text-sm bg-primary text-text-on-primary rounded-md hover:bg-primary-hover">{t.newUserButton}</button>}
                </div>
                 <div className="p-2 border-b border-border-color">
                    <input type="text" placeholder={t.searchPlaceholder} value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full px-3 py-1.5 bg-background-light border-border-color rounded-md focus:ring-primary focus:border-primary"/>
                </div>
                <div ref={listContainerRef} className="flex-1 overflow-y-auto">
                     {isLoading && page === 1 ? <div className="p-4 text-center">{t.loading}</div> : (
                        <ul>
                            {users.map(u => (
                                <li key={u.id}>
                                    <button onClick={() => setSelectedUser(u)} className={`w-full text-left p-3 flex items-center space-x-3 border-b border-border-color ${selectedUser?.id === u.id ? 'bg-primary-light' : 'hover:bg-background-light'}`}>
                                        <img src={u.avatarUrl} alt={u.name} className="w-12 h-12 rounded-full object-cover" />
                                        <div>
                                            <p className="font-semibold text-text-main">{u.name}</p>
                                            <p className="text-sm text-text-light">{u.email}</p>
                                        </div>
                                    </button>
                                </li>
                            ))}
                             {isLoading && page > 1 && <div className="p-4 flex justify-center items-center"><SpinnerIcon className="w-6 h-6"/> <span className="ml-2">{t.loadingMore}</span></div>}
                        </ul>
                    )}
                </div>
            </aside>

            <main className="bg-background-panel flex-1 overflow-y-auto p-8">
                {formState ? (
                    <div className="space-y-6">
                        <div className="flex items-center space-x-4">
                            {formState.avatarUrl ? (
                                <img src={formState.avatarUrl} alt="Avatar" className="w-24 h-24 rounded-full object-cover" />
                            ) : (
                                <div className="w-24 h-24 rounded-full bg-background-light border-2 border-dashed border-border-color flex items-center justify-center text-text-light text-center text-xs p-2">
                                    {t.changeAvatar}
                                </div>
                            )}
                            <div>
                                <h2 className="text-2xl font-bold mb-2">{t.formTitle}</h2>
                                <button onClick={() => avatarInputRef.current?.click()} className="text-sm text-primary hover:underline">{t.changeAvatar}</button>
                                <input type="file" ref={avatarInputRef} onChange={handleAvatarChange} className="hidden" accept="image/*" />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div><label className="block text-sm font-medium text-text-main">{t.nameLabel}</label><input type="text" value={formState.name || ''} onChange={e => handleFormChange('name', e.target.value)} className="mt-1 w-full p-2 border border-border-color rounded-md focus:ring-primary focus:border-primary" /></div>
                            {isSuperAdmin &&
                                <div><label className="block text-sm font-medium text-text-main">{t.emailLabel}</label><input type="email" value={formState.email || ''} onChange={e => handleFormChange('email', e.target.value)} className="mt-1 w-full p-2 border border-border-color rounded-md focus:ring-primary focus:border-primary" /></div>
                            }
                            {isSuperAdmin &&
                                <div className="col-span-2"><label className="block text-sm font-medium text-text-main">{t.passwordLabel}</label><input type="password" value={formState.password || ''} onChange={e => handleFormChange('password', e.target.value)} placeholder={formState.id === 'new' ? t.passwordPlaceholderNew : t.passwordPlaceholderEdit} className="mt-1 w-full p-2 border border-border-color rounded-md focus:ring-primary focus:border-primary" /></div>
                            }
                            <div><label className="block text-sm font-medium text-text-main">{t.avatarUrlLabel}</label><input type="text" value={formState.avatarUrl || ''} onChange={e => handleFormChange('avatarUrl', e.target.value)} className="mt-1 w-full p-2 border border-border-color rounded-md focus:ring-primary focus:border-primary" /></div>
                            {isSuperAdmin &&
                                <div><label className="block text-sm font-medium text-text-main">{t.meritsLabel}</label><input type="number" value={formState.merits ?? ''} onChange={e => handleFormChange('merits', e.target.value)} className="mt-1 w-full p-2 border border-border-color rounded-md focus:ring-primary focus:border-primary" /></div>
                            }
                        </div>
                        
                        {isSuperAdmin && (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-text-main">{t.rolesLabel}</label>
                                    <div className="mt-2 grid grid-cols-2 md:grid-cols-3 gap-2 p-4 border border-border-color rounded-md">
                                        {roles.map(role => (
                                            <label key={role.id} className="flex items-center space-x-2">
                                                <input
                                                    type="checkbox"
                                                    checked={formState.roleIds?.includes(role.id as number) || false}
                                                    onChange={() => handleRoleChange(role.id as number)}
                                                    className="h-4 w-4 text-primary border-border-color rounded focus:ring-primary"
                                                />
                                                <span className="text-sm">{role.name}</span>
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="flex items-center justify-between mt-6">
                            <div>
                                {isSuperAdmin && (
                                    <div className="flex items-center">
                                        <input id="isActive" type="checkbox" checked={formState.isActive ?? true} onChange={e => handleFormChange('isActive', e.target.checked)} className="h-4 w-4 text-primary border-border-color rounded focus:ring-primary" />
                                        <label htmlFor="isActive" className="ml-2 block text-sm font-medium text-text-main">{t.isActiveLabel}</label>
                                    </div>
                                )}
                            </div>
                            
                            <div className="flex items-center space-x-4">
                                {isSuperAdmin && formState.id !== 'new' && (
                                    <button onClick={handleDelete} disabled={formState.id === adminUser.id} className="px-4 py-2 bg-accent-red text-text-on-primary rounded-md hover:bg-accent-red-hover disabled:opacity-50 disabled:cursor-not-allowed">{t.deleteButton}</button>
                                )}
                                <button onClick={handleSave} disabled={isSaving} className="px-6 py-2 bg-primary text-text-on-primary rounded-md hover:bg-primary-hover disabled:opacity-70">
                                    {isSaving ? t.saving : t.saveButton}
                                </button>
                            </div>
                        </div>

                    </div>
                ) : (
                    <div className="flex items-center justify-center h-full"><p className="text-text-light">{t.noUserSelected}</p></div>
                )}
            </main>
        </div>
    );
};