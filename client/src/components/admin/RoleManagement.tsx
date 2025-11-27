// client/src/components/admin/RoleManagement.tsx
import React, { useState, useEffect } from 'react';
import { Role } from '../../types';
import { apiService } from '../../services/apiService';
import { useToast } from '../ToastProvider';
import { SettingsIcon, BookOpenIcon, AiIcon, UsersIcon, BillingIcon } from '../Icons';

const translations = {
    vi: {
        title: 'Quản lý Quyền',
        loading: 'Đang tải...',
        roleList: 'Danh sách Quyền',
        newRole: 'Tạo quyền mới',
        noRoleSelected: 'Chọn một quyền để chỉnh sửa hoặc tạo quyền mới.',
        roleName: 'Tên quyền',
        permissions: 'Các quyền truy cập menu',
        save: 'Lưu thay đổi',
        saving: 'Đang lưu...',
        delete: 'Xóa',
        confirmDelete: 'Bạn có chắc chắn muốn xóa quyền "{name}" không? Người dùng thuộc quyền này sẽ mất các quyền truy cập tương ứng.',
        saveSuccess: 'Lưu quyền thành công!',
        saveError: 'Lưu quyền thất bại: {message}',
        deleteSuccess: 'Xóa quyền thành công!',
        deleteError: 'Xóa quyền thất bại: {message}',
        fetchError: 'Không thể tải danh sách quyền.',
        groupSystem: 'Tổng quan & Hệ thống',
        groupContent: 'Nội dung & Thư viện',
        groupAi: 'AI & Dữ liệu',
        groupUsers: 'Người dùng & Phân quyền',
        groupFinance: 'Tài chính',
        permissionLabels: {
            'dashboard': 'Dashboard',
            'files': 'Tệp & Tài liệu',
            'spaces': 'Quản lý Không gian',
            'dharma-talks': 'Quản lý Pháp Thoại',
            'ai': 'Quản lý AI',
            'users': 'Quản lý Người dùng',
            'roles': 'Phân quyền',
            'conversations': 'Quản lý Hội thoại',
            'pricing': 'Quản lý Giá',
            'user-billing': 'Giao dịch & Nạp Merit',
            'space-billing': 'Ví Space',
            'manual-billing': 'Giao dịch & Rút tiền',
            'templates': 'Giao diện',
            'finetune': 'Fine-tune Dữ liệu',
            'settings': 'Cài đặt',
            'comments': 'Quản lý Bình luận',
        }
    },
    en: {
        title: 'Role Management',
        loading: 'Loading...',
        roleList: 'Role List',
        newRole: 'New Role',
        noRoleSelected: 'Select a role to edit or create a new one.',
        roleName: 'Role Name',
        permissions: 'Menu Access Permissions',
        save: 'Save Changes',
        saving: 'Saving...',
        delete: 'Delete',
        confirmDelete: 'Are you sure you want to delete the "{name}" role? Users with this role will lose the corresponding permissions.',
        saveSuccess: 'Role saved successfully!',
        saveError: 'Failed to save role: {message}',
        deleteSuccess: 'Role deleted successfully!',
        deleteError: 'Failed to delete role: {message}',
        fetchError: 'Could not load roles.',
        groupSystem: 'Overview & System',
        groupContent: 'Content & Library',
        groupAi: 'AI & Data',
        groupUsers: 'Users & Permissions',
        groupFinance: 'Finance',
        permissionLabels: {
            'dashboard': 'Dashboard',
            'files': 'Files & Documents',
            'spaces': 'Space Management',
            'dharma-talks': 'Dharma Talk Management',
            'ai': 'AI Management',
            'users': 'User Management',
            'roles': 'Permissions',
            'conversations': 'Conversation Management',
            'pricing': 'Pricing Management',
            'user-billing': 'Transactions & Merit Top-up',
            'space-billing': 'Space Wallet',
            'manual-billing': 'Transactions & Withdrawals',
            'templates': 'Appearance',
            'finetune': 'Fine-tune Data',
            'settings': 'Settings',
            'comments': 'Comment Management',
        }
    }
};

type PermissionKey = keyof typeof translations['vi']['permissionLabels'];

const permissionGroups: { titleKey: keyof Omit<typeof translations['vi'], 'permissionLabels' | 'title' | 'loading' | 'roleList' | 'newRole' | 'noRoleSelected' | 'roleName' | 'permissions' | 'save' | 'saving' | 'delete' | 'confirmDelete' | 'saveSuccess' | 'saveError' | 'deleteSuccess' | 'deleteError' | 'fetchError'>; icon: React.FC<{className?: string}>; permissions: PermissionKey[] }[] = [
    { titleKey: 'groupSystem', icon: SettingsIcon, permissions: ['dashboard', 'settings', 'templates'] },
    { titleKey: 'groupContent', icon: BookOpenIcon, permissions: ['files', 'spaces', 'dharma-talks', 'comments'] },
    { titleKey: 'groupAi', icon: AiIcon, permissions: ['ai', 'conversations', 'finetune'] },
    { titleKey: 'groupUsers', icon: UsersIcon, permissions: ['users', 'roles'] },
    { titleKey: 'groupFinance', icon: BillingIcon, permissions: ['pricing', 'user-billing', 'space-billing', 'manual-billing'] },
];


export const RoleManagement: React.FC<{ language: 'vi' | 'en' }> = ({ language }) => {
    const [roles, setRoles] = useState<Role[]>([]);
    const [selectedRole, setSelectedRole] = useState<Partial<Role> | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const { showToast } = useToast();
    const t = translations[language];

    const fetchRoles = async () => {
        setIsLoading(true);
        try {
            const data = await apiService.getAllRoles();
            setRoles(data);
        } catch (error) {
            showToast(t.fetchError, 'error');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchRoles();
    }, []);

    const handleNewRole = () => {
        setSelectedRole({ id: 'new', name: '', permissions: [] });
    };

    const handleFormChange = (field: keyof Role, value: any) => {
        if (selectedRole) {
            setSelectedRole({ ...selectedRole, [field]: value });
        }
    };
    
    const handlePermissionChange = (permission: string) => {
        if (selectedRole) {
            const currentPermissions = selectedRole.permissions || [];
            const newPermissions = currentPermissions.includes(permission)
                ? currentPermissions.filter(p => p !== permission)
                : [...currentPermissions, permission];
            handleFormChange('permissions', newPermissions);
        }
    };
    
    const handleSave = async () => {
        if (!selectedRole || !selectedRole.name?.trim()) return;
        setIsSaving(true);
        try {
            let savedRole;
            if (selectedRole.id === 'new') {
                const { id, ...createPayload } = selectedRole;
                savedRole = await apiService.createRole(createPayload);
            } else {
                savedRole = await apiService.updateRole(selectedRole as Role);
            }
            showToast(t.saveSuccess);
            await fetchRoles();
            setSelectedRole(savedRole);
        } catch (error: any) {
            showToast(t.saveError.replace('{message}', error.message), 'error');
        } finally {
            setIsSaving(false);
        }
    };
    
    const handleDelete = async () => {
        if (!selectedRole || selectedRole.id === 'new') return;
        if (window.confirm(t.confirmDelete.replace('{name}', selectedRole.name || ''))) {
            try {
                await apiService.deleteRole(selectedRole.id as number);
                showToast(t.deleteSuccess);
                setSelectedRole(null);
                await fetchRoles();
            } catch (error: any) {
                showToast(t.deleteError.replace('{message}', error.message), 'error');
            }
        }
    };

    const renderPermissionCheckbox = (permissionKey: PermissionKey) => (
        <label key={permissionKey} className="flex items-center space-x-3 cursor-pointer">
            <input
                type="checkbox"
                checked={selectedRole?.permissions?.includes(permissionKey) || false}
                onChange={() => handlePermissionChange(permissionKey)}
                className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary"
            />
            <span className="text-sm text-text-main">{t.permissionLabels[permissionKey]}</span>
        </label>
    );
    
    return (
        <div className="flex h-full bg-background-light">
            <aside className="w-80 border-r border-border-color bg-background-panel flex flex-col h-full">
                <div className="p-4 border-b border-border-color flex justify-between items-center">
                    <h2 className="text-lg font-bold">{t.roleList}</h2>
                    <button onClick={handleNewRole} className="px-3 py-1 text-sm bg-primary text-text-on-primary rounded-md hover:bg-primary-hover">{t.newRole}</button>
                </div>
                <div className="flex-1 overflow-y-auto">
                     {isLoading ? <p className="p-4">{t.loading}</p> : (
                        <ul>
                            {roles.map(role => (
                                <li key={role.id}>
                                    <button onClick={() => setSelectedRole(role)} className={`w-full text-left p-3 border-b border-border-color ${selectedRole?.id === role.id ? 'bg-primary-light' : 'hover:bg-background-light'}`}>
                                        <p className="font-semibold text-text-main">{role.name}</p>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </aside>

            <main className="bg-background-panel flex-1 overflow-y-auto p-8">
                 {selectedRole ? (
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-text-main">{t.roleName}</label>
                            <input
                                type="text"
                                value={selectedRole.name || ''}
                                onChange={e => handleFormChange('name', e.target.value)}
                                className="mt-1 w-full p-2 border border-border-color rounded-md focus:ring-primary focus:border-primary bg-white"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text-main mb-2">{t.permissions}</label>
                             <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {permissionGroups.map((group) => {
                                    const Icon = group.icon;
                                    return (
                                        <div key={group.titleKey} className="bg-white border border-border-color rounded-lg p-4 shadow-sm">
                                            <h3 className="flex items-center gap-2 font-semibold mb-4 text-text-main border-b border-border-color pb-2">
                                                <Icon className="w-5 h-5 text-gray-500" />
                                                {t[group.titleKey]}
                                            </h3>
                                            <div className="space-y-3">
                                                {group.permissions.map(p => renderPermissionCheckbox(p))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                        <div className="flex justify-end items-center space-x-4 pt-4 border-t border-border-color">
                            {selectedRole.id !== 'new' && (
                                <button onClick={handleDelete} className="px-4 py-2 bg-accent-red text-text-on-primary rounded-md hover:bg-accent-red-hover">{t.delete}</button>
                            )}
                            <button onClick={handleSave} disabled={isSaving} className="px-6 py-2 bg-primary text-text-on-primary rounded-md hover:bg-primary-hover disabled:opacity-70">
                                {isSaving ? t.saving : t.save}
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-full"><p className="text-text-light">{t.noRoleSelected}</p></div>
                )}
            </main>
        </div>
    );
};