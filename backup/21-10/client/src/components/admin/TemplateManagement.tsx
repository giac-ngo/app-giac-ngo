import React, { useState, useRef } from 'react';
import { SystemConfig, TemplateName } from '../../types';
import { apiService } from '../../services/apiService';
import { useToast } from '../ToastProvider';

interface TemplateManagementProps {
    language: 'vi' | 'en';
    systemConfig: SystemConfig;
    onSystemConfigUpdate: (newConfig: SystemConfig) => void;
}

const translations = {
    vi: {
        title: 'Quản lý Giao diện',
        templateTitle: 'Giao diện (Template)',
        templateDesc: 'Chọn giao diện chung cho toàn bộ ứng dụng.',
        templateLabel: 'Template đang hoạt động',
        templateW5g: 'W5G (Mặc định)',
        templateGiacNgo: 'Giác Ngộ',
        logoManagement: 'Quản lý Logo',
        uploadLogo: 'Tải logo mới',
        uploading: 'Đang tải lên...',
        uploadError: 'Tải lên thất bại.',
        saveSettings: 'Lưu cài đặt',
        saving: 'Đang lưu...',
        saveSuccess: 'Đã lưu cài đặt giao diện!',
        saveError: 'Lưu cài đặt giao diện thất bại.',
    },
    en: {
        title: 'Appearance Management',
        templateTitle: 'Appearance (Template)',
        templateDesc: 'Choose the general look and feel for the entire application.',
        templateLabel: 'Active Template',
        templateW5g: 'W5G (Default)',
        templateGiacNgo: 'Enlightenment',
        logoManagement: 'Logo Management',
        uploadLogo: 'Upload new logo',
        uploading: 'Uploading...',
        uploadError: 'Upload failed.',
        saveSettings: 'Save Settings',
        saving: 'Saving...',
        saveSuccess: 'Appearance settings saved!',
        saveError: 'Failed to save appearance settings.',
    }
}

const TemplateManagement: React.FC<TemplateManagementProps> = ({ language, systemConfig, onSystemConfigUpdate }) => {
    const [localSystemConfig, setLocalSystemConfig] = useState<SystemConfig>(systemConfig);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState<TemplateName | null>(null);
    
    const w5gLogoInputRef = useRef<HTMLInputElement>(null);
    const giacngoLogoInputRef = useRef<HTMLInputElement>(null);

    const { showToast } = useToast();
    const t = translations[language];

    const handleConfigChange = <K extends keyof SystemConfig>(key: K, value: SystemConfig[K]) => {
        setLocalSystemConfig(prev => ({ ...prev, [key]: value }));
    };

    const handleLogoUpload = async (templateName: TemplateName, e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;
        
        const file = e.target.files[0];
        const formData = new FormData();
        formData.append('trainingFiles', file);

        setIsUploading(templateName);
        try {
            const response = await apiService.uploadFiles(formData);
            if (response.filePaths && response.filePaths.length > 0) {
                const newLogoUrl = response.filePaths[0];
                setLocalSystemConfig(prev => ({
                    ...prev,
                    templateSettings: {
                        ...prev.templateSettings,
                        [templateName]: { logoUrl: newLogoUrl },
                    }
                }));
            }
        } catch (error) {
            console.error("Lỗi tải logo:", error);
            showToast(t.uploadError, 'error');
        } finally {
            setIsUploading(null);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const updatedConfig = await apiService.updateSystemConfig(localSystemConfig);
            onSystemConfigUpdate(updatedConfig);
            showToast(t.saveSuccess);
        } catch (error) {
            console.error("Lỗi khi lưu cài đặt giao diện:", error);
            showToast(t.saveError, 'error');
        } finally {
            setIsSaving(false);
        }
    };

    const LogoManager = ({ templateName, displayName, inputRef }: { templateName: TemplateName, displayName: string, inputRef: React.RefObject<HTMLInputElement>}) => (
        <div className="p-4 border border-border-color rounded-lg">
            <p className="font-semibold text-text-main">{displayName}</p>
            <div className="flex items-center space-x-4 mt-2">
                <div className="w-48 h-16 flex items-center justify-center bg-background-light rounded-md p-2">
                    <img src={localSystemConfig.templateSettings[templateName]?.logoUrl} alt={`${displayName} Logo`} className="max-w-full max-h-full object-contain" />
                </div>
                <input type="file" accept="image/*" ref={inputRef} onChange={(e) => handleLogoUpload(templateName, e)} className="hidden" />
                <button
                    onClick={() => inputRef.current?.click()}
                    disabled={isUploading === templateName}
                    className="px-4 py-2 text-sm font-medium text-text-main bg-background-panel border border-border-color rounded-md shadow-sm hover:bg-background-light disabled:opacity-50"
                >
                    {isUploading === templateName ? t.uploading : t.uploadLogo}
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
                         <div>
                            <label htmlFor="template-select" className="block text-sm font-medium text-text-main">{t.templateLabel}</label>
                            <select
                                id="template-select"
                                value={localSystemConfig.template}
                                onChange={e => handleConfigChange('template', e.target.value as TemplateName)}
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
                    <button onClick={handleSave} disabled={isSaving || !!isUploading} className="px-5 py-2 text-sm font-medium text-text-on-primary bg-primary rounded-md hover:bg-primary-hover disabled:opacity-70">
                        {isSaving ? t.saving : t.saveSettings}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TemplateManagement;