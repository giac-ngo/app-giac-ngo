// client/src/components/admin/UserManagement.tsx
import React, { useState, useEffect, useRef } from 'react';
import { User, Role } from '../../types';
import { apiService } from '../../services/apiService';
import { useToast } from '../ToastProvider';

const translations = {
    vi: {
        listTitle: 'Danh sách Người dùng',
        newUserButton: 'Tạo người dùng',
        formTitle: 'Chi tiết Người dùng',
        noUserSelected: 'Chọn một người dùng từ danh sách hoặc tạo người dùng mới.',
        loading: 'Đang tải...',
        nameLabel: 'Tên',
        emailLabel: 'Email',
        passwordLabel: 'Mật khẩu',
        passwordPlaceholderNew: 'Bắt buộc khi tạo mới',
        passwordPlaceholderEdit: 'Để trống nếu không đổi',
        avatarUrlLabel: 'URL Avatar',
        coinsLabel: 'Coins (để trống cho không giới hạn)',
        isAdminLabel: 'Là Super Admin?',
        isAdminDesc: 'Super Admin có tất cả các quyền, bao gồm cả quản lý Quyền.',
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
            confirmDelete: 'Bạn có chắc chắn muốn xóa người dùng này không?',
            deleteError: 'Xóa người dùng thất bại.',
            saveError: 'Lưu thất bại: {message}',
            fetchError: 'Không thể tải danh sách người dùng.',
        }
    },
    en: {
        listTitle: 'User List',
        newUserButton: 'Create User',
        formTitle: 'User Details',
        noUserSelected: 'Select a user from the list or create a new one.',
        loading: 'Loading...',
        nameLabel: 'Name',
        emailLabel: 'Email',
        passwordLabel: 'Password',
        passwordPlaceholderNew: 'Required for new user',
        passwordPlaceholderEdit: 'Leave blank to keep unchanged',
        avatarUrlLabel: 'Avatar URL',
        coinsLabel: 'Coins (leave blank for unlimited)',
        isAdminLabel: 'Is Super Admin?',
        isAdminDesc: 'Super Admin has all permissions, including managing Roles.',
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
            confirmDelete: 'Are you sure you want to delete this user?',
            deleteError: 'Failed to delete user.',
            saveError: 'Save failed: {message}',
            fetchError: 'Could not load user list.',
        }
    }
};

const UserManagement: React.FC<{ user: User, language: 'vi' | 'en', onUserUpdate: (data: Partial<User>) => void }> = ({ user: adminUser, language, onUserUpdate }) => {
    const [users, setUsers] = useState<User[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
    const [selectedUser, setSelectedUser] = useState<Partial<User> & { password?: string } | null>(null);
    const [formState, setFormState] = useState<Partial<User> & { password?: string } | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const { showToast } = useToast();
    const t = translations[language];
    const avatarInputRef = useRef<HTMLInputElement>(null);
    
    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
        setFormState(selectedUser ? { ...selectedUser } : null);
    }, [selectedUser]);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [allUsers, allRoles] = await Promise.all([
                apiService.getAllUsers(),
                apiService.getAllRoles()
            ]);
            setUsers(allUsers);
            setRoles(allRoles);
        } catch (error) {
            showToast(t.alerts.fetchError, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleNewUser = () => {
        const newUserTemplate: Partial<User> & { password?: string } = {
            id: 'new',
            name: '',
            email: '',
            password: '',
            isAdmin: false,
            isActive: true,
            coins: 0,
            avatarUrl: `https://i.pravatar.cc/150?u=${Date.now()}`,
            roleIds: []
        };
        setSelectedUser(newUserTemplate);
    };

    const handleFormChange = (field: keyof (User & { password?: string }), value: any) => {
        if (formState) {
            const newValue = field === 'coins' ? (value === '' ? null : Number(value)) : value;
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
        setIsSaving(true);
        try {
            let savedUser;
            // The Super Admin role ID is typically 1, based on initDb.js
            const isSuperAdmin = formState.roleIds?.includes(1);
            
            const payload = {
                ...formState,
                isAdmin: !!isSuperAdmin, // Set isAdmin based on role presence
            };

            if (formState.id === 'new') {
                 const { id, permissions, ...createPayload } = payload;
                 savedUser = await apiService.createUser(createPayload);
            } else {
                const { permissions, ...updatePayload } = payload;
                savedUser = await apiService.updateUser(updatePayload as User);
            }
            showToast(t.saveSuccess);
            await fetchData();
            setSelectedUser(savedUser);

            if (savedUser.id === adminUser.id) {
                onUserUpdate(savedUser);
            }
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
        if (window.confirm(t.alerts.confirmDelete)) {
            try {
                await apiService.deleteUser(formState.id as number);
                setSelectedUser(null);
                fetchData();
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
        if (e.target) {
            e.target.value = '';
        }
    };

    const filteredUsers = users.filter(u => 
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex h-full bg-background-light">
            <aside className="w-96 border-r border-border-color bg-background-panel flex flex-col h-full">
                <div className="p-4 border-b border-border-color flex justify-between items-center">
                    <h2 className="text-lg font-bold">{t.listTitle}</h2>
                    <button onClick={handleNewUser} className="px-3 py-1 text-sm bg-primary text-text-on-primary rounded-md hover:bg-primary-hover">{t.newUserButton}</button>
                </div>
                 <div className="p-2 border-b border-border-color">
                    <input type="text" placeholder={t.searchPlaceholder} value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full px-3 py-1.5 bg-background-light border-border-color rounded-md focus:ring-primary focus:border-primary"/>
                </div>
                <div className="flex-1 overflow-y-auto">
                     {isLoading ? <p className="p-4">{t.loading}</p> : (
                        <ul>
                            {filteredUsers.map(u => (
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
                        </ul>
                    )}
                </div>
            </aside>

            <main className="flex-1 overflow-y-auto p-8 relative">
                 {formState ? (
                    <div className="space-y-6 pb-20">
                         <div className="flex items-center space-x-4">
                            <img src={formState.avatarUrl} alt="Avatar" className="w-24 h-24 rounded-full object-cover" />
                            <div>
                                <h2 className="text-2xl font-bold">{formState.name || 'New User'}</h2>
                                <button onClick={() => avatarInputRef.current?.click()} className="text-sm text-primary hover:underline">{t.changeAvatar}</button>
                                <input
                                    type="file"
                                    ref={avatarInputRef}
                                    onChange={handleAvatarChange}
                                    className="hidden"
                                    accept="image/*"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div><label className="block text-sm font-medium text-text-main">{t.nameLabel}</label><input type="text" value={formState.name || ''} onChange={e => handleFormChange('name', e.target.value)} className="mt-1 w-full p-2 border border-border-color rounded-md focus:ring-primary focus:border-primary" /></div>
                            <div><label className="block text-sm font-medium text-text-main">{t.emailLabel}</label><input type="email" value={formState.email || ''} onChange={e => handleFormChange('email', e.target.value)} className="mt-1 w-full p-2 border border-border-color rounded-md focus:ring-primary focus:border-primary" /></div>
                            <div className="col-span-2"><label className="block text-sm font-medium text-text-main">{t.passwordLabel}</label><input type="password" value={formState.password || ''} onChange={e => handleFormChange('password', e.target.value)} placeholder={formState.id === 'new' ? t.passwordPlaceholderNew : t.passwordPlaceholderEdit} className="mt-1 w-full p-2 border border-border-color rounded-md focus:ring-primary focus:border-primary" /></div>
                            <div><label className="block text-sm font-medium text-text-main">{t.avatarUrlLabel}</label><input type="text" value={formState.avatarUrl || ''} onChange={e => handleFormChange('avatarUrl', e.target.value)} className="mt-1 w-full p-2 border border-border-color rounded-md focus:ring-primary focus:border-primary" /></div>
                            <div><label className="block text-sm font-medium text-text-main">{t.coinsLabel}</label><input type="number" value={formState.coins ?? ''} onChange={e => handleFormChange('coins', e.target.value)} className="mt-1 w-full p-2 border border-border-color rounded-md focus:ring-primary focus:border-primary" /></div>
                        </div>

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
                            <div className="flex items-center"><input id="isActive" type="checkbox" checked={formState.isActive ?? true} onChange={e => handleFormChange('isActive', e.target.checked)} className="h-4 w-4 text-primary border-border-color rounded focus:ring-primary" /><label htmlFor="isActive" className="ml-2 block text-sm font-medium text-text-main">{t.isActiveLabel}</label></div>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-full"><p className="text-text-light">{t.noUserSelected}</p></div>
                )}

                 {formState && (
                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-background-panel border-t flex justify-end items-center space-x-4">
                         {formState.id !== 'new' && (
                            <button onClick={handleDelete} disabled={formState.id === adminUser.id} className="px-4 py-2 bg-accent-red text-text-on-primary rounded-md hover:bg-accent-red-hover disabled:opacity-50 disabled:cursor-not-allowed">{t.deleteButton}</button>
                        )}
                        <button onClick={handleSave} disabled={isSaving} className="px-6 py-2 bg-primary text-text-on-primary rounded-md hover:bg-primary-hover disabled:opacity-70">
                            {isSaving ? t.saving : t.saveButton}
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
};

export default UserManagement;