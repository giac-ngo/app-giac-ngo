
import React, { useState, useRef } from 'react';
import { User } from '../../types';
import { apiService } from '../../services/apiService';
import { useToast } from '../ToastProvider';
import { UserIcon } from '../Icons';

const translations = {
    vi: {
        title: 'Cập nhật thông tin',
        nameLabel: 'Tên hiển thị',
        avatarLabel: 'Ảnh đại diện',
        changePasswordLabel: 'Đổi mật khẩu',
        currentPasswordLabel: 'Mật khẩu hiện tại',
        newPasswordLabel: 'Mật khẩu mới',
        confirmNewPasswordLabel: 'Xác nhận mật khẩu mới',
        saveButton: 'Lưu thay đổi',
        savingButton: 'Đang lưu...',
        cancelButton: 'Hủy',
        updateSuccess: 'Cập nhật thông tin thành công!',
        changePasswordSuccess: 'Đổi mật khẩu thành công!',
        passwordMismatch: 'Mật khẩu xác nhận không khớp.',
        updateError: 'Cập nhật thất bại: {message}',
        uploadError: 'Lỗi tải ảnh: {message}',
    },
    en: {
        title: 'Update Profile',
        nameLabel: 'Display Name',
        avatarLabel: 'Avatar',
        changePasswordLabel: 'Change Password',
        currentPasswordLabel: 'Current Password',
        newPasswordLabel: 'New Password',
        confirmNewPasswordLabel: 'Confirm New Password',
        saveButton: 'Save Changes',
        savingButton: 'Saving...',
        cancelButton: 'Cancel',
        updateSuccess: 'Profile updated successfully!',
        changePasswordSuccess: 'Password changed successfully!',
        passwordMismatch: 'Passwords do not match.',
        updateError: 'Update failed: {message}',
        uploadError: 'Upload failed: {message}',
    }
};

interface EditProfileModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: User;
    language: 'vi' | 'en';
    onUserUpdate: (updatedData: Partial<User>) => void;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({ isOpen, onClose, user, language, onUserUpdate }) => {
    const t = translations[language];
    const [name, setName] = useState(user.name);
    const [avatarUrl, setAvatarUrl] = useState(user.avatarUrl);
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [showPasswordFields, setShowPasswordFields] = useState(false);
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { showToast } = useToast();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setAvatarFile(file);
            setAvatarUrl(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            // 1. Password Change
            if (showPasswordFields) {
                if (newPassword !== confirmPassword) {
                    showToast(t.passwordMismatch, 'error');
                    setLoading(false);
                    return;
                }
                await apiService.changePassword(user.id as number, oldPassword, newPassword);
                showToast(t.changePasswordSuccess, 'success');
            }

            // 2. Profile Update
            let finalAvatarUrl = user.avatarUrl;
            let profileUpdated = false;

            if (avatarFile) {
                const formData = new FormData();
                formData.append('file', avatarFile);
                const { filePaths } = await apiService.uploadFiles(formData);
                if (filePaths && filePaths.length > 0) {
                    finalAvatarUrl = filePaths[0];
                    profileUpdated = true;
                }
            }

            if (name !== user.name) {
                profileUpdated = true;
            }

            if (profileUpdated || (showPasswordFields && !profileUpdated)) {
                const updatedUser = await apiService.updateUser({
                    id: user.id as number,
                    name,
                    avatarUrl: finalAvatarUrl
                });
                onUserUpdate(updatedUser);
                if (profileUpdated) showToast(t.updateSuccess, 'success');
            }

            onClose();
            // Reset fields
            setOldPassword('');
            setNewPassword('');
            setConfirmPassword('');
            setShowPasswordFields(false);

        } catch (err: any) {
            console.error("Profile update error:", err);
            const errorMsg = err?.message || (typeof err === 'string' ? err : 'Unknown error');
            showToast(t.updateError.replace('{message}', errorMsg), 'error');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-background-panel rounded-lg shadow-xl w-full max-w-md p-6 relative transform transition-all animate-fade-in-right max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                <h2 className="text-2xl font-bold text-text-main mb-6">{t.title}</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Avatar Section */}
                    <div className="flex flex-col items-center">
                        <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                            <img
                                src={avatarUrl}
                                alt="Avatar Preview"
                                className="w-24 h-24 rounded-full object-cover border-2 border-border-color group-hover:border-primary transition-colors"
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <UserIcon className="w-8 h-8 text-white" />
                            </div>
                        </div>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileChange}
                            accept="image/*"
                            className="hidden"
                        />
                        <p className="text-sm text-text-light mt-2">{t.avatarLabel}</p>
                    </div>

                    {/* Name Input */}
                    <div>
                        <label className="block text-sm font-medium text-text-main mb-1">{t.nameLabel}</label>
                        <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="login-input w-full"
                        />
                    </div>

                    {/* Change Password Toggle */}
                    <div>
                        <button
                            type="button"
                            onClick={() => setShowPasswordFields(!showPasswordFields)}
                            className="text-sm text-primary hover:underline focus:outline-none"
                        >
                            {t.changePasswordLabel}
                        </button>
                    </div>

                    {/* Password Fields */}
                    {showPasswordFields && (
                        <div className="space-y-4 p-4 border border-border-color rounded-md bg-background-light">
                            <div>
                                <label className="block text-sm font-medium text-text-main mb-1">{t.currentPasswordLabel}</label>
                                <input
                                    type="password"
                                    required={showPasswordFields}
                                    value={oldPassword}
                                    onChange={(e) => setOldPassword(e.target.value)}
                                    className="login-input w-full"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-main mb-1">{t.newPasswordLabel}</label>
                                <input
                                    type="password"
                                    required={showPasswordFields}
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="login-input w-full"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text-main mb-1">{t.confirmNewPasswordLabel}</label>
                                <input
                                    type="password"
                                    required={showPasswordFields}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="login-input w-full"
                                />
                            </div>
                        </div>
                    )}

                    <div className="flex justify-end space-x-3 pt-4">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-text-main bg-background-light border border-border-color rounded-md hover:bg-border-color transition-colors">
                            {t.cancelButton}
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-4 py-2 bg-primary text-text-on-primary text-sm font-medium rounded-md hover:bg-primary-hover disabled:opacity-50 transition-colors"
                        >
                            {loading ? t.savingButton : t.saveButton}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
