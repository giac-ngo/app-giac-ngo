// client/src/components/admin/TemplateManagement.tsx
import React, { useState, useRef, useEffect } from 'react';
// FIX: The 'TemplateName' type was missing. It has been added to 'types.ts'.
import { SystemConfig, TemplateName, User } from '../../types';
import { apiService } from '../../services/apiService';
import { useToast } from '../ToastProvider';

interface TemplateManagementProps {
    language: 'vi' | 'en';
    systemConfig: SystemConfig;
    onSystemConfigUpdate: (newConfig: SystemConfig) => void;
    user: User;
    onUserUpdate: (updatedData: Partial<User>) => void;
}

const translations = {
    vi: {
        title: 'Quản lý Giao diện',
        templateTitle: 'Giao diện (Template)',
        templateDesc: 'Quản lý logo cho từng giao diện. Giao diện mặc định cho người dùng mới và khách có thể được đặt trong Cài đặt Hệ thống.',
        personalAppearance: 'Giao diện cá nhân',
        personalAppearanceDesc: 'Chọn giao diện bạn muốn sử dụng cho tài khoản này.',
        templateLabel: 'Giao diện của bạn',
        templateW5g: 'W5G (Mặc định)',
        templateGiacNgo: 'Giác Ngộ',
        logoManagement: 'Quản lý Logo',
        uploadLogo: 'Tải logo mới',
        uploading: 'Đang tải lên...',
        uploadError: 'Tải lên thất bại.',
        saveSettings: 'Lưu cài đặt',
        saving: 'Đang lưu...',
        saveSuccess: 'Đã lưu cài đặt giao diện!',
        saveError: 'Lỗi khi lưu cài đặt giao diện: {message}',
    },
    en: {
        title: 'Appearance Management',
        templateTitle: 'Appearance (Template)',
        templateDesc: 'Manage logos for each theme. The default theme for new users and guests can be set in System Settings.',
        personalAppearance: 'Personal Appearance',
        personalAppearanceDesc: 'Choose the theme you want to use for this account.',
        templateLabel: 'Your Theme',
        templateW5g: 'W5G (Default)',
        templateGiacNgo: 'Enlightenment',
        logoManagement: 'Logo Management',
        uploadLogo: 'Upload new logo',
        uploading: 'Uploading...',
        uploadError: 'Upload failed.',
        saveSettings: 'Save Settings',
        saving: 'Saving...',
        saveSuccess: 'Appearance settings saved!',
        saveError: 'Failed to save appearance settings: {message}',
    }
}

export const TemplateManagement: React.FC<TemplateManagementProps> = ({ language, systemConfig, onSystemConfigUpdate, user, onUserUpdate }) => {
    const [localSystemConfig, setLocalSystemConfig] = useState<SystemConfig>(systemConfig);
    const [localUser, setLocalUser] = useState<User>(user);
    const [isSaving, setIsSaving] = useState(false);
    
    const [w5gLogoFile, setW5gLogoFile] = useState<File | null>(null);
    const [giacngoLogoFile, setGiacngoLogoFile] = useState<File | null>(null);
    
    const w5gLogoInputRef = useRef<HTMLInputElement>(null);
    const giacngoLogoInputRef = useRef<HTMLInputElement>(null);

    const { showToast } = useToast();
    const t = translations[language];

    useEffect(() => {
        setLocalSystemConfig(systemConfig);
        setLocalUser(user);
        // Do not reset file inputs here, as it can cause issues if a re-render happens after file selection but before save.
        // setW5gLogoFile(null);
        // setGiacngoLogoFile(null);
    }, [systemConfig, user]);

    const handleLogoUpload = (templateName: TemplateName, e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        
        const file = e.target.files[0];
        const previewUrl = URL.createObjectURL(file);

        if (templateName === 'w5g') {
            setW5gLogoFile(file);
        } else {
            setGiacngoLogoFile(file);
        }

        setLocalSystemConfig(prev => ({
            ...prev,
            templateSettings: {
                ...prev.templateSettings,
                [templateName]: { logoUrl: previewUrl },
            }
        }));
    };

    const handleUserTemplateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setLocalUser(prev => ({
            ...prev,
            template: e.target.value as TemplateName,
        }));
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            // Deep copy the config to avoid race conditions with state updates.
            const configPayload = JSON.parse(JSON.stringify(localSystemConfig));

            const uploadLogo = async (file: File | null, templateName: TemplateName): Promise<string | null> => {
                if (!file) return null;
                const formData = new FormData();
                formData.append('context', 'template');
                formData.append('spaceId', 'system');
                formData.append('file', file);
                const response = await apiService.uploadFiles(formData);
                if (response.filePaths && response.filePaths[0]) {
                    return response.filePaths[0];
                }
                throw new Error(`Upload failed for ${templateName} logo`);
            };

            const [w5gUrl, giacngoUrl] = await Promise.all([
                uploadLogo(w5gLogoFile, 'w5g'),
                uploadLogo(giacngoLogoFile, 'giacngo')
            ]);

            if (w5gUrl) {
                configPayload.templateSettings.w5g.logoUrl = w5gUrl;
            }
            if (giacngoUrl) {
                configPayload.templateSettings.giacngo.logoUrl = giacngoUrl;
            }

            const systemConfigPromise = apiService.updateSystemConfig(configPayload);
            const userPromise = apiService.updateUser({ 
                id: localUser.id, 
                template: localUser.template 
            });

            const [updatedConfig, updatedUser] = await Promise.all([systemConfigPromise, userPromise]);
            
            onSystemConfigUpdate(updatedConfig);
            onUserUpdate(updatedUser); 
            showToast(t.saveSuccess, 'success');

            setW5gLogoFile(null);
            setGiacngoLogoFile(null);

        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            console.error("Lỗi khi lưu cài đặt giao diện:", error);
            showToast(t.saveError.replace('{message}', message), 'error');
        } finally {
            setIsSaving(false);
        }
    };


    const LogoManager = ({ templateName, displayName, inputRef }: { templateName: TemplateName, displayName: string, inputRef: React.RefObject<HTMLInputElement>}) => (
        <div className="p-4 border border-border-color rounded-lg">
            <p className="font-semibold text-text-main">{displayName}</p>
            <div className="flex items-center space-x-4 mt-2">
                <div className="w-48 h-16 flex items-center justify-center bg-background-light rounded-md p-2">
                    {/* FIX: 'templateSettings' was missing. Added to SystemConfig type. */}
                    <img src={localSystemConfig.templateSettings[templateName]?.logoUrl} alt={`${displayName} Logo`} className="max-w-full max-h-full object-contain" />
                </div>
                <input type="file" accept="image/*" ref={inputRef} onChange={(e) => handleLogoUpload(templateName, e)} className="hidden" />
                <button
                    onClick={() => inputRef.current?.click()}
                    disabled={isSaving}
                    className="px-4 py-2 text-sm font-medium text-text-main bg-background-panel border border-border-color rounded-md shadow-sm hover:bg-background-light disabled:opacity-50"
                >
                    {isSaving ? t.saving : t.uploadLogo}
                </button>
            </div>
        </div>
    );

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold mb-6">{t.title}</h1>
            <div className="bg-background-panel shadow-md rounded-lg p-6 space-y-8">
                <div>
                    <h2 className="text-xl font-semibold mb-1">{t.templateTitle}</h2>
                    <p className="text-sm text-text-light mb-4">{t.templateDesc}</p>
                    <div className="space-y-6">
                        <div className="p-4 border border-border-color rounded-lg bg-background-light">
                            <h3 className="text-lg font-medium text-text-main mb-1">{t.personalAppearance}</h3>
                            <p className="text-xs text-text-light mb-3">{t.personalAppearanceDesc}</p>
                            <label htmlFor="template-select" className="block text-sm font-medium text-text-main">{t.templateLabel}</label>
                            <select
                                id="template-select"
                                // FIX: 'template' was missing. Added to User type.
                                value={localUser.template || 'w5g'}
                                onChange={handleUserTemplateChange}
                                className="mt-1 block w-full max-w-xs pl-3 pr-10 py-2 text-base border-border-color focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
                            >
                                <option value="w5g">{t.templateW5g}</option>
                                <option value="giacngo">{t.templateGiacNgo}</option>
                            </select>
                        </div>

                        <div>
                            <h3 className="text-lg font-medium text-text-main mb-2">{t.logoManagement}</h3>
                            <div className="space-y-4">
                                <LogoManager templateName="w5g" displayName="W5G Logo" inputRef={w5gLogoInputRef} />
                                <LogoManager templateName="giacngo" displayName="Giác Ngộ Logo" inputRef={giacngoLogoInputRef} />
                            </div>
                        </div>
                    </div>
                </div>
                 <div className="flex justify-end items-center pt-4 border-t border-border-color mt-6">
                    <button onClick={handleSave} disabled={isSaving} className="px-5 py-2 text-sm font-medium text-text-on-primary bg-primary rounded-md hover:bg-primary-hover disabled:opacity-70">
                        {isSaving ? t.saving : t.saveSettings}
                    </button>
                </div>
            </div>
        </div>
    );
};