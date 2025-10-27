// ...existing code...
import React, { useState, useEffect } from 'react';
import { SystemConfig, User } from '../../types';
import { apiService } from '../../services/apiService';
import { useToast } from '../ToastProvider';

const translations = {
    vi: {
        title: 'Cài đặt',
        systemSettingsTab: 'Cài đặt Hệ thống',
        personalKeysTab: 'API Keys cá nhân',
        guestSettings: 'Cài đặt Khách',
        guestMessageLimit: 'Giới hạn tin nhắn cho khách',
        guestMessageLimitDesc: 'Số lượng tin nhắn một khách có thể gửi trước khi được yêu cầu đăng nhập.',
        systemApiKeys: 'Khóa API Hệ thống',
        systemApiKeysDesc: 'Các khóa này sẽ được sử dụng nếu người dùng không có khóa riêng. Ưu tiên khóa của người dùng.',
        personalApiKeys: 'Khóa API Cá nhân',
        personalApiKeysDesc: 'Các khóa này chỉ áp dụng cho tài khoản của bạn và sẽ ghi đè lên khóa hệ thống.',
        personalAccessToken: 'Personal Access Token',
        personalAccessTokenDesc: 'Sử dụng token này để xác thực các yêu cầu API từ ứng dụng bên ngoài.',
        geminiKey: 'Gemini API Key',
        gptKey: 'GPT API Key',
        grokKey: 'Grok API Key',
        save: 'Lưu Cài đặt',
        saving: 'Đang lưu...',
        saveSuccess: 'Cài đặt đã được lưu!',
        saveError: 'Lưu cài đặt thất bại: {message}',
        show: 'Hiển thị',
        hide: 'Ẩn',
        copy: 'Sao chép',
        copied: 'Đã sao chép!',
        regenerateToken: 'Tạo token mới',
        regenerateTokenConfirm: 'Bạn có chắc muốn tạo token mới không? Token cũ sẽ bị vô hiệu hóa ngay lập tức.',
        tokenRegenerated: 'Token mới đã được tạo!',
    },
    en: {
        title: 'Settings',
        systemSettingsTab: 'System Settings',
        personalKeysTab: 'Personal API Keys',
        guestSettings: 'Guest Settings',
        guestMessageLimit: 'Guest Message Limit',
        guestMessageLimitDesc: 'The number of messages a guest can send before being prompted to log in.',
        systemApiKeys: 'System API Keys',
        systemApiKeysDesc: 'These keys will be used if a user does not have their own key. User keys take precedence.',
        personalApiKeys: 'Personal API Keys',
        personalApiKeysDesc: 'These keys apply only to your account and will override system keys.',
        personalAccessToken: 'Personal Access Token',
        personalAccessTokenDesc: 'Use this token to authenticate API requests from external applications.',
        geminiKey: 'Gemini API Key',
        gptKey: 'GPT API Key',
        grokKey: 'Grok API Key',
        save: 'Save Settings',
        saving: 'Saving...',
        saveSuccess: 'Settings saved successfully!',
        saveError: 'Failed to save settings: {message}',
        show: 'Show',
        hide: 'Hide',
        copy: 'Copy',
        copied: 'Copied!',
        regenerateToken: 'Regenerate Token',
        regenerateTokenConfirm: 'Are you sure you want to regenerate your token? The old token will be invalidated immediately.',
        tokenRegenerated: 'New token generated!',
    }
};

interface SettingsProps {
    user: User;
    language: 'vi' | 'en';
    systemConfig: SystemConfig;
    onSystemConfigUpdate: (newConfig: SystemConfig) => void;
    onUserUpdate: (updatedData: Partial<User>) => void;
}

const Settings: React.FC<SettingsProps> = ({ user, language, systemConfig, onSystemConfigUpdate, onUserUpdate }) => {
    const t = translations[language];
    const { showToast } = useToast();
    const [activeTab, setActiveTab] = useState<'system' | 'personal'>(user.isAdmin ? 'system' : 'personal');
    
    // System Config State
    const [localSystemConfig, setLocalSystemConfig] = useState<SystemConfig>(systemConfig);
    const [isSavingSystem, setIsSavingSystem] = useState(false);

    // Personal User State
    const [localUser, setLocalUser] = useState<User>(user);
    const [isSavingPersonal, setIsSavingPersonal] = useState(false);
    const [showToken, setShowToken] = useState(false);

    // Sync props -> local state when parent updates props
    useEffect(() => {
        setLocalSystemConfig(systemConfig);
    }, [systemConfig]);

    useEffect(() => {
        setLocalUser(user);
    }, [user]);

    const handleSystemConfigChange = <K extends keyof SystemConfig>(key: K, value: SystemConfig[K]) => {
        setLocalSystemConfig(prev => ({ ...prev, [key]: value }));
    };
    
    const handleSystemKeyChange = (keyName: 'gemini' | 'gpt' | 'grok', value: string) => {
        setLocalSystemConfig(prev => ({
            ...prev,
            systemKeys: { ...(prev.systemKeys || {}), [keyName]: value }
        }));
    };
    
    const handlePersonalKeyChange = (keyName: 'gemini' | 'gpt' | 'grok', value: string) => {
        setLocalUser(prev => ({
            ...prev,
            apiKeys: { ...(prev.apiKeys || {}), [keyName]: value }
        }));
    };

    const handleSaveSystem = async () => {
        setIsSavingSystem(true);
        try {
            const updatedConfig = await apiService.updateSystemConfig(localSystemConfig);
            onSystemConfigUpdate(updatedConfig);
            showToast(t.saveSuccess, 'success');
        } catch (error: any) {
            showToast(t.saveError.replace('{message}', error?.message || String(error)), 'error');
        } finally {
            setIsSavingSystem(false);
        }
    };

    const handleSavePersonal = async () => {
        setIsSavingPersonal(true);
        try {
            const updatedUser = await apiService.updateUser(localUser);
            onUserUpdate(updatedUser);
            showToast(t.saveSuccess, 'success');
        } catch (error: any) {
            showToast(t.saveError.replace('{message}', error?.message || String(error)), 'error');
        } finally {
            setIsSavingPersonal(false);
        }
    };

    const handleRegenerateToken = async () => {
        if (!window.confirm(t.regenerateTokenConfirm)) return;
        setIsSavingPersonal(true);
        try {
            const updatedUser = await apiService.regenerateApiToken(user.id as number);
            setLocalUser(updatedUser);
            onUserUpdate(updatedUser);
            showToast(t.tokenRegenerated, 'success');
        } catch (error: any) {
             showToast(error?.message || String(error), 'error');
        } finally {
            setIsSavingPersonal(false);
        }
    };
    
    const handleCopy = async (text: string) => {
        if(!text) return;
        try {
            await navigator.clipboard.writeText(text);
            showToast(t.copied, 'info');
        } catch (err: any) {
            showToast(err?.message || 'Copy failed', 'error');
        }
    };

    const renderSystemSettings = () => (
         <div className="space-y-8">
            <div>
                <h2 className="text-xl font-semibold mb-1">{t.guestSettings}</h2>
                <div>
                    <label htmlFor="guestMessageLimit" className="block text-sm font-medium text-text-main">{t.guestMessageLimit}</label>
                    <input
                        type="number"
                        id="guestMessageLimit"
                        value={localSystemConfig.guestMessageLimit ?? ''}
                        onChange={e => {
                            const v = e.target.value;
                            handleSystemConfigChange('guestMessageLimit', v === '' ? 0 : Number(v) as any);
                        }}
                        className="mt-1 w-full max-w-xs p-2 border border-border-color rounded-md"
                    />
                    <p className="text-xs text-text-light mt-1">{t.guestMessageLimitDesc}</p>
                </div>
            </div>

            <div className="border-t border-border-color pt-6">
                <h2 className="text-xl font-semibold mb-1">{t.systemApiKeys}</h2>
                <p className="text-sm text-text-light mb-4">{t.systemApiKeysDesc}</p>
                <div className="space-y-4">
                    <div>
                        <label htmlFor="geminiKey" className="block text-sm font-medium text-text-main">{t.geminiKey}</label>
                        <input
                            type="password"
                            id="geminiKey"
                            value={localSystemConfig.systemKeys?.gemini || ''}
                            onChange={e => handleSystemKeyChange('gemini', e.target.value)}
                            className="mt-1 w-full p-2 border border-border-color rounded-md"
                        />
                    </div>
                    <div>
                        <label htmlFor="gptKey" className="block text-sm font-medium text-text-main">{t.gptKey}</label>
                        <input
                            type="password"
                            id="gptKey"
                            value={localSystemConfig.systemKeys?.gpt || ''}
                            onChange={e => handleSystemKeyChange('gpt', e.target.value)}
                            className="mt-1 w-full p-2 border border-border-color rounded-md"
                        />
                    </div>
                    <div>
                        <label htmlFor="grokKey" className="block text-sm font-medium text-text-main">{t.grokKey}</label>
                        <input
                            type="password"
                            id="grokKey"
                            value={localSystemConfig.systemKeys?.grok || ''}
                            onChange={e => handleSystemKeyChange('grok', e.target.value)}
                            className="mt-1 w-full p-2 border border-border-color rounded-md"
                        />
                    </div>
                </div>
            </div>
             <div className="flex justify-end items-center pt-6 border-t border-border-color">
                <button onClick={handleSaveSystem} disabled={isSavingSystem} className="px-6 py-2 bg-primary text-text-on-primary rounded-md hover:bg-primary-hover disabled:opacity-70">{isSavingSystem ? t.saving : t.save}</button>
            </div>
        </div>
    );
    
    const renderPersonalSettings = () => (
        <div className="space-y-8">
             <div>
                <h2 className="text-xl font-semibold mb-1">{t.personalAccessToken}</h2>
                <p className="text-sm text-text-light mb-4">{t.personalAccessTokenDesc}</p>
                 <div className="flex items-center space-x-2">
                    <input
                        type={showToken ? 'text' : 'password'}
                        readOnly
                        value={localUser.apiToken || 'No token generated'}
                        className="flex-grow p-2 border border-border-color rounded-md bg-background-light"
                    />
                    <button onClick={() => setShowToken(!showToken)} className="px-3 py-2 text-sm border rounded-md">{showToken ? t.hide : t.show}</button>
                    <button onClick={() => handleCopy(localUser.apiToken || '')} className="px-3 py-2 text-sm border rounded-md">{t.copy}</button>
                </div>
                 <button onClick={handleRegenerateToken} className="mt-3 text-sm text-primary hover:underline" disabled={isSavingPersonal}>{t.regenerateToken}</button>
            </div>

            <div className="border-t border-border-color pt-6">
                <h2 className="text-xl font-semibold mb-1">{t.personalApiKeys}</h2>
                <p className="text-sm text-text-light mb-4">{t.personalApiKeysDesc}</p>
                <div className="space-y-4">
                    <div>
                        <label htmlFor="p-geminiKey" className="block text-sm font-medium text-text-main">{t.geminiKey}</label>
                        <input
                            type="password"
                            id="p-geminiKey"
                            value={localUser.apiKeys?.gemini || ''}
                            onChange={e => handlePersonalKeyChange('gemini', e.target.value)}
                            className="mt-1 w-full p-2 border border-border-color rounded-md"
                        />
                    </div>
                    <div>
                        <label htmlFor="p-gptKey" className="block text-sm font-medium text-text-main">{t.gptKey}</label>
                        <input
                            type="password"
                            id="p-gptKey"
                            value={localUser.apiKeys?.gpt || ''}
                            onChange={e => handlePersonalKeyChange('gpt', e.target.value)}
                            className="mt-1 w-full p-2 border border-border-color rounded-md"
                        />
                    </div>
                    <div>
                        <label htmlFor="p-grokKey" className="block text-sm font-medium text-text-main">{t.grokKey}</label>
                        <input
                            type="password"
                            id="p-grokKey"
                            value={localUser.apiKeys?.grok || ''}
                            onChange={e => handlePersonalKeyChange('grok', e.target.value)}
                            className="mt-1 w-full p-2 border border-border-color rounded-md"
                        />
                    </div>
                </div>
            </div>
             <div className="flex justify-end items-center pt-6 border-t border-border-color">
                <button onClick={handleSavePersonal} disabled={isSavingPersonal} className="px-6 py-2 bg-primary text-text-on-primary rounded-md hover:bg-primary-hover disabled:opacity-70">{isSavingPersonal ? t.saving : t.save}</button>
            </div>
        </div>
    );
    
    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold mb-6">{t.title}</h1>
            <div className="bg-background-panel shadow-md rounded-lg p-6 max-w-3xl mx-auto">
                 <div className="border-b border-border-color mb-6">
                    <nav className="-mb-px flex space-x-6">
                        {user.isAdmin && (
                            <button onClick={() => setActiveTab('system')} className={`py-3 px-1 font-medium border-b-2 ${activeTab === 'system' ? 'border-primary text-primary' : 'border-transparent text-text-light hover:text-text-main'}`}>{t.systemSettingsTab}</button>
                        )}
                        <button onClick={() => setActiveTab('personal')} className={`py-3 px-1 font-medium border-b-2 ${activeTab === 'personal' ? 'border-primary text-primary' : 'border-transparent text-text-light hover:text-text-main'}`}>{t.personalKeysTab}</button>
                    </nav>
                </div>

                {activeTab === 'system' && user.isAdmin ? renderSystemSettings() : renderPersonalSettings()}
            </div>
        </div>
    );
};

export default Settings;
// ...existing code...