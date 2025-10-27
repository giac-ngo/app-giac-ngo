import React, { useState, useEffect } from 'react';
import { User, SystemConfig } from '../../types';
import { apiService } from '../../services/apiService';
import { useToast } from '../ToastProvider';

interface SettingsProps {
    user: User;
    language: 'vi' | 'en';
    systemConfig: SystemConfig | null;
    onSystemConfigUpdate: (newConfig: SystemConfig) => void;
}

const translations = {
    vi: {
        title: 'Cài đặt',
        loading: 'Đang tải cài đặt...',
        systemTab: 'Hệ thống',
        personalTab: 'API Keys cá nhân',
        systemSettingsTitle: 'Cấu hình chung',
        systemSettingsDesc: 'Các cài đặt này ảnh hưởng đến toàn bộ người dùng và khách truy cập.',
        guestLimitLabel: 'Giới hạn tin nhắn cho khách',
        systemKeysTitle: 'API Keys hệ thống',
        systemKeysDesc: 'Các key này sẽ được sử dụng mặc định khi người dùng không có key riêng, hoặc cho khách.',
        personalKeysTitle: 'API Keys cá nhân',
        personalKeysDesc: 'Key của bạn là bắt buộc để có thể chat. Nếu bạn không cung cấp key cho một nhà cung cấp, bạn sẽ không thể sử dụng AI của nhà cung cấp đó.',
        showKeys: 'Hiển thị Keys',
        hideKeys: 'Ẩn Keys',
        saveSystemSettings: 'Lưu cài đặt hệ thống',
        saveMyKeys: 'Lưu Keys của tôi',
        saving: 'Đang lưu...',
        loadError: 'Không thể tải được cài đặt.',
        saveSystemSuccess: 'Đã lưu cài đặt hệ thống!',
        saveSystemError: 'Lưu cài đặt hệ thống thất bại.',
        savePersonalSuccess: 'Đã lưu API keys của bạn!',
        savePersonalError: 'Lưu API keys cá nhân thất bại.',
    },
    en: {
        title: 'Settings',
        loading: 'Loading settings...',
        systemTab: 'System',
        personalTab: 'Personal API Keys',
        systemSettingsTitle: 'General Configuration',
        systemSettingsDesc: 'These settings affect all users and guests.',
        guestLimitLabel: 'Guest Message Limit',
        systemKeysTitle: 'System API Keys',
        systemKeysDesc: 'These keys will be used by default when users do not have their own keys, or for guests.',
        personalKeysTitle: 'Personal API Keys',
        personalKeysDesc: 'Your keys are required to chat. If you do not provide a key for a provider, you will not be able to use that provider\'s AI.',
        showKeys: 'Show Keys',
        hideKeys: 'Hide Keys',
        saveSystemSettings: 'Save System Settings',
        saveMyKeys: 'Save My Keys',
        saving: 'Saving...',
        loadError: 'Could not load settings.',
        saveSystemSuccess: 'System settings saved!',
        saveSystemError: 'Failed to save system settings.',
        savePersonalSuccess: 'Your API keys have been saved!',
        savePersonalError: 'Failed to save personal API keys.',
    }
}

const Settings: React.FC<SettingsProps> = ({ user, language, systemConfig, onSystemConfigUpdate }) => {
    const [activeTab, setActiveTab] = useState(user.isAdmin ? 'system' : 'personal');
    const [localSystemConfig, setLocalSystemConfig] = useState<SystemConfig | null>(systemConfig);

    const [userGeminiKey, setUserGeminiKey] = useState('');
    const [userGptKey, setUserGptKey] = useState('');
    const [userGrokKey, setUserGrokKey] = useState('');
    const [showKeys, setShowKeys] = useState(false);
    
    const [isSaving, setIsSaving] = useState(false);
    
    const { showToast } = useToast();
    const t = translations[language];

    useEffect(() => {
        setLocalSystemConfig(systemConfig);
        setUserGeminiKey(user.apiKeys?.gemini || '');
        setUserGptKey(user.apiKeys?.gpt || '');
        setUserGrokKey(user.apiKeys?.grok || '');
    }, [systemConfig, user]);

    const handleSystemConfigChange = <K extends keyof SystemConfig>(key: K, value: SystemConfig[K]) => {
        if (!localSystemConfig) return;
        setLocalSystemConfig({ ...localSystemConfig, [key]: value });
    };
    
    const handleSystemKeyChange = (provider: 'gemini' | 'gpt' | 'grok', value: string) => {
        if (!localSystemConfig) return;
        setLocalSystemConfig({
            ...localSystemConfig,
            systemKeys: {
                ...localSystemConfig.systemKeys,
                [provider]: value,
            },
        });
    };
    
    const handleSaveSystemSettings = async () => {
        if (!localSystemConfig) return;
        setIsSaving(true);
        try {
            const updatedConfig = await apiService.updateSystemConfig(localSystemConfig);
            onSystemConfigUpdate(updatedConfig);
            showToast(t.saveSystemSuccess);
        } catch (error) {
            console.error("Lỗi khi lưu cài đặt hệ thống:", error);
            showToast(t.saveSystemError, 'error');
        } finally {
            setIsSaving(false);
        }
    };
    
    const handleSavePersonalKeys = async () => {
        setIsSaving(true);
        try {
            const updatedUser: User = {
                ...user,
                apiKeys: {
                    gemini: userGeminiKey,
                    gpt: userGptKey,
                    grok: userGrokKey,
                }
            };
            const savedUser = await apiService.updateUser(updatedUser);
            sessionStorage.setItem('user', JSON.stringify(savedUser));
            showToast(t.savePersonalSuccess);
        } catch (error) {
            console.error("Lỗi khi lưu API keys cá nhân:", error);
            showToast(t.savePersonalError, 'error');
        } finally {
            setIsSaving(false);
        }
    };

    const KeyInput = ({ label, value, onChange }: { label: string, value: string, onChange: (val: string) => void }) => (
        <div>
            <label className="block text-sm font-medium text-text-main">{label}</label>
            <div className="relative mt-1">
                <input
                    type={showKeys ? 'text' : 'password'}
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    className="block w-full px-3 py-2 border border-border-color rounded-md shadow-sm focus:ring-primary focus:border-primary"
                />
            </div>
        </div>
    );
    
    if (!localSystemConfig && user.isAdmin) {
        return <div className="p-8 text-center">{t.loading}</div>;
    }

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold mb-6">{t.title}</h1>

            <div className="mb-6 border-b border-border-color">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    {user.isAdmin && (
                        <button
                            onClick={() => setActiveTab('system')}
                            className={`${activeTab === 'system' ? 'border-primary text-primary' : 'border-transparent text-text-light hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                        >
                            {t.systemTab}
                        </button>
                    )}
                    <button
                        onClick={() => setActiveTab('personal')}
                        className={`${activeTab === 'personal' ? 'border-primary text-primary' : 'border-transparent text-text-light hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                    >
                        {t.personalTab}
                    </button>
                </nav>
            </div>

            {activeTab === 'system' && user.isAdmin && localSystemConfig && (
                <div className="bg-background-panel shadow-md rounded-lg p-6 space-y-8">
                    {/* General Settings */}
                    <div>
                        <h2 className="text-xl font-semibold mb-1">{t.systemSettingsTitle}</h2>
                        <p className="text-sm text-text-light mb-4">{t.systemSettingsDesc}</p>
                        <div>
                            <label className="block text-sm font-medium text-text-main">{t.guestLimitLabel}</label>
                            <input
                                type="number"
                                value={localSystemConfig.guestMessageLimit}
                                onChange={e => handleSystemConfigChange('guestMessageLimit', parseInt(e.target.value, 10))}
                                className="mt-1 block w-full max-w-xs px-3 py-2 border border-border-color rounded-md shadow-sm focus:ring-primary focus:border-primary"
                            />
                        </div>
                    </div>

                     <hr className="border-border-color" />

                     <div>
                        <h2 className="text-xl font-semibold mb-1">{t.systemKeysTitle}</h2>
                        <p className="text-sm text-text-light mb-4">{t.systemKeysDesc}</p>
                        <div className="space-y-4">
                            <KeyInput label="System Gemini Key" value={localSystemConfig.systemKeys.gemini} onChange={v => handleSystemKeyChange('gemini', v)} />
                            <KeyInput label="System GPT Key" value={localSystemConfig.systemKeys.gpt} onChange={v => handleSystemKeyChange('gpt', v)} />
                            <KeyInput label="System Grok Key" value={localSystemConfig.systemKeys.grok} onChange={v => handleSystemKeyChange('grok', v)} />
                        </div>
                    </div>
                    <div className="flex justify-between items-center pt-4 border-t border-border-color mt-6">
                        <button type="button" onClick={() => setShowKeys(!showKeys)} className="text-sm text-primary hover:underline">
                            {showKeys ? t.hideKeys : t.showKeys}
                        </button>
                        <button onClick={handleSaveSystemSettings} disabled={isSaving} className="px-5 py-2 text-sm font-medium text-text-on-primary bg-primary rounded-md hover:bg-primary-hover disabled:opacity-70">
                            {isSaving ? t.saving : t.saveSystemSettings}
                        </button>
                    </div>
                </div>
            )}
            
            {activeTab === 'personal' && (
                 <div className="bg-background-panel shadow-md rounded-lg p-6 space-y-6">
                     <div>
                        <h2 className="text-xl font-semibold mb-1">{t.personalKeysTitle}</h2>
                        <p className="text-sm text-text-light mb-4">{t.personalKeysDesc}</p>
                        <div className="space-y-4">
                            <KeyInput label="Your Gemini Key" value={userGeminiKey} onChange={setUserGeminiKey} />
                            <KeyInput label="Your GPT Key" value={userGptKey} onChange={setUserGptKey} />
                            <KeyInput label="Your Grok Key" value={userGrokKey} onChange={setUserGrokKey} />
                        </div>
                    </div>
                    <div className="flex justify-between items-center pt-4 border-t border-border-color mt-6">
                        <button type="button" onClick={() => setShowKeys(!showKeys)} className="text-sm text-primary hover:underline">
                            {showKeys ? t.hideKeys : t.showKeys}
                        </button>
                        <button onClick={handleSavePersonalKeys} disabled={isSaving} className="px-5 py-2 text-sm font-medium text-text-on-primary bg-primary rounded-md hover:bg-primary-hover disabled:opacity-70">
                           {isSaving ? t.saving : t.saveMyKeys}
                        </button>
                    </div>
                 </div>
            )}
        </div>
    );
};

export default Settings;