// client/src/components/admin/DharmaTalksManagement.tsx
import React, { useState, useEffect } from 'react';
import { DharmaTalk, Space } from '../../types';
import { apiService } from '../../services/apiService';
import { useToast } from '../ToastProvider';
import { PlusIcon } from '../Icons';

const translations = {
    vi: {
        title: 'Quản lý Pháp Thoại',
        newTalk: 'Pháp thoại Mới',
        loading: 'Đang tải...',
        selectOrCreate: 'Chọn một pháp thoại để xem chi tiết hoặc tạo mới.',
        save: 'Lưu',
        saving: 'Đang lưu...',
        delete: 'Xóa',
        confirmDeleteTitle: 'Xác nhận xóa',
        confirmDeleteBody: 'Bạn có chắc muốn xóa "{name}" không?',
        saveSuccess: 'Lưu pháp thoại thành công!',
        saveError: 'Lưu thất bại: {message}',
        deleteSuccess: 'Xóa pháp thoại thành công!',
        deleteError: 'Xóa thất bại: {message}',
        // Form Fields
        talkTitle: 'Tiêu đề (VI)',
        talkTitleEn: 'Tiêu đề (EN)',
        talkSubtitle: 'Phụ đề',
        speaker: 'Người thuyết giảng',
        url: 'URL (Youtube, etc.)',
        duration: 'Thời lượng (giây)',
        date: 'Ngày phát hành',
        space: 'Không gian',
        noSpace: '-- Không thuộc không gian nào --',
        status: 'Trạng thái (VI)',
        statusEn: 'Trạng thái (EN)',
        tags: 'Thẻ (VI, phân cách bởi dấu phẩy)',
        tagsEn: 'Thẻ (EN, phân cách bởi dấu phẩy)',
        uploadAudio: 'Hoặc tải file âm thanh lên',
        uploading: 'Đang tải lên...',
    },
    en: {
        title: 'Dharma Talks Management',
        newTalk: 'New Talk',
        loading: 'Loading...',
        selectOrCreate: 'Select a talk to see details or create a new one.',
        save: 'Save',
        saving: 'Saving...',
        delete: 'Delete',
        confirmDeleteTitle: 'Confirm Deletion',
        confirmDeleteBody: 'Are you sure you want to delete "{name}"?',
        saveSuccess: 'Dharma talk saved successfully!',
        saveError: 'Save failed: {message}',
        deleteSuccess: 'Dharma talk deleted successfully!',
        deleteError: 'Delete failed: {message}',
        // Form Fields
        talkTitle: 'Title (VI)',
        talkTitleEn: 'Title (EN)',
        talkSubtitle: 'Subtitle',
        speaker: 'Speaker',
        url: 'URL (Youtube, etc.)',
        duration: 'Duration (seconds)',
        date: 'Release Date',
        space: 'Space',
        noSpace: '-- No Space --',
        status: 'Status (VI)',
        statusEn: 'Status (EN)',
        tags: 'Tags (VI, comma-separated)',
        tagsEn: 'Tags (EN, comma-separated)',
        uploadAudio: 'Or upload an audio file',
        uploading: 'Uploading...',
    }
}

export const DharmaTalksManagement: React.FC<{ language: 'vi' | 'en' }> = ({ language }) => {
    const t = translations[language];
    const { showToast } = useToast();
    const [talks, setTalks] = useState<DharmaTalk[]>([]);
    const [spaces, setSpaces] = useState<Space[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedTalk, setSelectedTalk] = useState<Partial<DharmaTalk> | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [audioFile, setAudioFile] = useState<File | null>(null);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [talkData, spaceData] = await Promise.all([
                apiService.getAllDharmaTalks(),
                apiService.getSpaces()
            ]);
            setTalks(talkData || []);
            setSpaces(spaceData || []);
        } catch (error) {
            showToast('Failed to load initial data.', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSelectTalk = (talk: DharmaTalk) => {
        setSelectedTalk({ ...talk, tags: Array.isArray(talk.tags) ? talk.tags : [], tagsEn: Array.isArray(talk.tagsEn) ? talk.tagsEn : [] });
        setAudioFile(null);
    };

    const handleNewTalk = () => {
        setSelectedTalk({
            id: 'new',
            title: '',
            titleEn: '',
            speaker: '',
            url: '',
            duration: 0,
            date: new Date().toISOString().split('T')[0],
            spaceId: null,
            tags: [],
            tagsEn: [],
            status: '',
            statusEn: '',
        });
        setAudioFile(null);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        let processedValue: any = value;
        if (type === 'number') {
            processedValue = value === '' ? undefined : Number(value);
        }
        if (name === 'spaceId' && value === '') {
            processedValue = null;
        }
        setSelectedTalk(prev => prev ? { ...prev, [name]: processedValue } : null);
    };
    
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setAudioFile(e.target.files[0]);
             setSelectedTalk(prev => prev ? { ...prev, url: URL.createObjectURL(e.target.files![0]) } : null);
        }
    };

    const handleSave = async () => {
        if (!selectedTalk) return;
        setIsSaving(true);
        try {
            const payload = { ...selectedTalk };

            if (audioFile) {
                const formData = new FormData();
                formData.append('context', 'DharmaTalks');
                formData.append('spaceId', String(payload.spaceId || 'system'));
                formData.append('file', audioFile);
                const res = await apiService.uploadFiles(formData);
                if (res.filePaths && res.filePaths[0]) {
                    payload.url = res.filePaths[0];
                } else {
                    throw new Error('Audio file upload failed.');
                }
            }

            payload.duration = Number(payload.duration) || 0;
            payload.spaceId = payload.spaceId ? Number(payload.spaceId) : null;

            if (selectedTalk.id === 'new') {
                const newTalk = await apiService.createDharmaTalk(payload);
                setTalks(prev => [newTalk, ...prev]);
                setSelectedTalk(newTalk);
            } else {
                const updatedTalk = await apiService.updateDharmaTalk(selectedTalk as DharmaTalk);
                setTalks(prev => prev.map(s => s.id === updatedTalk.id ? updatedTalk : s));
                setSelectedTalk(updatedTalk);
            }
            showToast(t.saveSuccess, 'success');
            setAudioFile(null);
        } catch (error: any) {
            showToast(t.saveError.replace('{message}', error.message), 'error');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!selectedTalk || selectedTalk.id === 'new') return;
        if (window.confirm(t.confirmDeleteBody.replace('{name}', selectedTalk.title || ''))) {
            try {
                await apiService.deleteDharmaTalk(selectedTalk.id as number);
                setTalks(prev => prev.filter(s => s.id !== selectedTalk.id));
                setSelectedTalk(null);
                showToast(t.deleteSuccess, 'success');
            } catch (error: any) {
                showToast(t.deleteError.replace('{message}', error.message), 'error');
            }
        }
    };
    
    const renderForm = () => {
        if (!selectedTalk) {
            return <div className="flex items-center justify-center h-full text-text-light">{t.selectOrCreate}</div>
        }
        return (
            <div className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div><label className="block text-sm font-medium">{t.talkTitle}</label><input type="text" name="title" value={selectedTalk.title || ''} onChange={handleInputChange} className="mt-1 w-full p-2 border rounded-md" /></div>
                    <div><label className="block text-sm font-medium">{t.talkTitleEn}</label><input type="text" name="titleEn" value={selectedTalk.titleEn || ''} onChange={handleInputChange} className="mt-1 w-full p-2 border rounded-md" /></div>
                    
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium">{t.talkSubtitle}</label>
                        <textarea name="subtitle" value={selectedTalk.subtitle || ''} onChange={handleInputChange} className="mt-1 w-full p-2 border rounded-md" rows={2}></textarea>
                    </div>

                    <div><label className="block text-sm font-medium">{t.speaker}</label><input type="text" name="speaker" value={selectedTalk.speaker || ''} onChange={handleInputChange} className="mt-1 w-full p-2 border rounded-md" /></div>
                    <div><label className="block text-sm font-medium">{t.date}</label><input type="date" name="date" value={selectedTalk.date ? new Date(selectedTalk.date).toISOString().split('T')[0] : ''} onChange={handleInputChange} className="mt-1 w-full p-2 border rounded-md" /></div>
                    
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium">{t.url}</label>
                        <input type="url" name="url" value={selectedTalk.url || ''} onChange={handleInputChange} className="mt-1 w-full p-2 border rounded-md" />
                         <div className="mt-2">
                            <label className="block text-sm font-medium text-text-light">{t.uploadAudio}</label>
                            <input type="file" onChange={handleFileChange} accept="audio/*" className="mt-1 text-sm"/>
                        </div>
                        {selectedTalk.url && <audio key={selectedTalk.url} controls src={selectedTalk.url} className="mt-2 w-full" />}
                    </div>
                    
                    <div><label className="block text-sm font-medium">{t.duration}</label><input type="number" name="duration" value={selectedTalk.duration ?? ''} onChange={handleInputChange} className="mt-1 w-full p-2 border rounded-md" /></div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium">{t.space}</label>
                        <select name="spaceId" value={selectedTalk.spaceId ?? ''} onChange={handleInputChange} className="mt-1 w-full p-2 border rounded-md">
                            <option value="">{t.noSpace}</option>
                            {spaces.map(space => <option key={space.id as number} value={space.id as number}>{space.name}</option>)}
                        </select>
                    </div>

                    <div><label className="block text-sm font-medium">{t.status}</label><input type="text" name="status" value={selectedTalk.status || ''} onChange={handleInputChange} className="mt-1 w-full p-2 border rounded-md" /></div>
                    <div><label className="block text-sm font-medium">{t.statusEn}</label><input type="text" name="statusEn" value={selectedTalk.statusEn || ''} onChange={handleInputChange} className="mt-1 w-full p-2 border rounded-md" /></div>

                    <div className="md:col-span-2"><label className="block text-sm font-medium">{t.tags}</label><input type="text" value={Array.isArray(selectedTalk.tags) ? selectedTalk.tags.join(', ') : ''} onChange={e => setSelectedTalk(prev => prev ? {...prev, tags: e.target.value.split(',').map(t=>t.trim())} : null)} className="mt-1 w-full p-2 border rounded-md" /></div>
                    <div className="md:col-span-2"><label className="block text-sm font-medium">{t.tagsEn}</label><input type="text" value={Array.isArray(selectedTalk.tagsEn) ? selectedTalk.tagsEn.join(', ') : ''} onChange={e => setSelectedTalk(prev => prev ? {...prev, tagsEn: e.target.value.split(',').map(t=>t.trim())} : null)} className="mt-1 w-full p-2 border rounded-md" /></div>
                </div>
                <div className="flex justify-end space-x-2 pt-4">
                    {selectedTalk.id !== 'new' && <button onClick={handleDelete} className="px-4 py-2 bg-accent-red text-white rounded-md">{t.delete}</button>}
                    <button onClick={handleSave} disabled={isSaving} className="px-4 py-2 bg-primary text-white rounded-md">{isSaving ? t.saving : t.save}</button>
                </div>
            </div>
        );
    };

    return (
        <div className="flex h-full">
            <aside className="w-96 border-r flex flex-col">
                 <div className="p-4 border-b flex justify-between items-center">
                    <h2 className="text-lg font-bold">{t.title}</h2>
                    <button onClick={handleNewTalk}><PlusIcon className="w-6 h-6"/></button>
                </div>
                <div className="flex-1 overflow-y-auto">
                    {isLoading ? <p className="p-4">{t.loading}</p> : talks.map(talk => (
                        <button key={talk.id} onClick={() => handleSelectTalk(talk)} className={`w-full text-left p-3 border-b ${selectedTalk?.id === talk.id ? 'bg-primary-light' : 'hover:bg-gray-100'}`}>
                            <p className="font-semibold truncate">{talk.title}</p>
                            <p className="text-sm text-gray-500">{talk.speaker}</p>
                        </button>
                    ))}
                </div>
            </aside>
            <main className="flex-1 overflow-y-auto">
                {renderForm()}
            </main>
        </div>
    );
};
