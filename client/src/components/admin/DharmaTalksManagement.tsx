
// client/src/components/admin/DharmaTalksManagement.tsx
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { DharmaTalk, Space } from '../../types';
import { apiService } from '../../services/apiService';
import { useToast } from '../ToastProvider';
import { PlusIcon, PencilIcon, TrashIcon, UserIcon, PlayIcon, PauseIcon, YouTubeIcon, XIcon, DharmaWheelIcon } from '../Icons';

const translations = {
    vi: {
        title: 'Quản lý Pháp Thoại',
        newTalk: 'Pháp thoại Mới',
        loading: 'Đang tải...',
        save: 'Lưu',
        saving: 'Đang lưu...',
        delete: 'Xóa',
        edit: 'Sửa',
        confirmDeleteTitle: 'Xác nhận xóa',
        confirmDeleteBody: 'Bạn có chắc muốn xóa "{name}" không?',
        saveSuccess: 'Lưu pháp thoại thành công!',
        saveError: 'Lưu thất bại: {message}',
        deleteSuccess: 'Xóa pháp thoại thành công!',
        deleteError: 'Xóa thất bại: {message}',
        // Form Fields
        editTitle: 'Chỉnh sửa Pháp thoại',
        createTitle: 'Tạo Pháp thoại mới',
        talkTitle: 'Tiêu đề (VI)',
        talkTitleEn: 'Tiêu đề (EN)',
        talkSubtitle: 'Tóm tắt',
        speaker: 'Tác giả',
        speakerAvatar: 'Ảnh bìa',
        changeAvatar: 'Đổi ảnh',
        url: 'URL (Youtube, Audio file)',
        duration: 'Thời lượng (giây)',
        date: 'Ngày tạo',
        space: 'Không gian',
        noSpace: '-- Không thuộc không gian nào --',
        status: 'Trạng thái (VI)',
        statusEn: 'Trạng thái (EN)',
        tags: 'Thẻ (VI, phân cách bởi dấu phẩy)',
        tagsEn: 'Thẻ (EN, phân cách bởi dấu phẩy)',
        uploadAudio: 'Hoặc tải file âm thanh lên',
        uploading: 'Đang tải lên...',
        cancel: 'Hủy',
        searchPlaceholder: 'Lọc theo tiêu đề...',
        noTalksFound: 'Không tìm thấy pháp thoại nào.',
         // Table Headers
        stt: 'STT',
        titleHeader: 'Tiêu đề',
        actions: 'Hành động',
        createdAt: 'Ngày tạo',
        // Pagination
        showing: 'Hiển thị',
        to: 'tới',
        of: 'trên',
        prev: 'Trước',
        next: 'Sau',
        filterAll: 'Tất cả',
        audioPlaybackError: 'Không thể phát âm thanh.',
        listenOnYoutube: 'Nghe trên YouTube',
        pauseAudio: 'Tạm dừng',
        playAudio: 'Phát',
    },
    en: {
        title: 'Dharma Talks Management',
        newTalk: 'New Talk',
        loading: 'Loading...',
        save: 'Save',
        saving: 'Saving...',
        delete: 'Delete',
        edit: 'Edit',
        confirmDeleteTitle: 'Confirm Deletion',
        confirmDeleteBody: 'Are you sure you want to delete "{name}"?',
        saveSuccess: 'Dharma talk saved successfully!',
        saveError: 'Save failed: {message}',
        deleteSuccess: 'Dharma talk deleted successfully!',
        deleteError: 'Delete failed: {message}',
        // Form Fields
        editTitle: 'Edit Dharma Talk',
        createTitle: 'Create New Dharma Talk',
        talkTitle: 'Title (VI)',
        talkTitleEn: 'Title (EN)',
        talkSubtitle: 'Summary',
        speaker: 'Author',
        speakerAvatar: 'Thumbnail',
        changeAvatar: 'Change',
        url: 'URL (Youtube, Audio file)',
        duration: 'Duration (seconds)',
        date: 'Created At',
        space: 'Space',
        noSpace: '-- No Space --',
        status: 'Status (VI)',
        statusEn: 'Status (EN)',
        tags: 'Tags (VI, comma-separated)',
        tagsEn: 'Tags (EN, comma-separated)',
        uploadAudio: 'Or upload an audio file',
        uploading: 'Uploading...',
        cancel: 'Cancel',
        searchPlaceholder: 'Filter by title...',
        noTalksFound: 'No dharma talks found.',
         // Table Headers
        stt: 'No.',
        titleHeader: 'Title',
        actions: 'Actions',
        createdAt: 'Created At',
        // Pagination
        showing: 'Showing',
        to: 'to',
        of: 'of',
        prev: 'Previous',
        next: 'Next',
        filterAll: 'All',
        audioPlaybackError: 'Failed to play audio.',
        listenOnYoutube: 'Listen on YouTube',
        pauseAudio: 'Pause',
        playAudio: 'Play',
    }
}

const ITEMS_PER_PAGE = 10;

const DharmaTalkModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (talk: Partial<DharmaTalk>, audioFile: File | null, avatarFile: File | null) => void;
    talk: Partial<DharmaTalk> | null;
    spaces: Space[];
    language: 'vi' | 'en';
    isSaving: boolean;
}> = ({ isOpen, onClose, onSave, talk, spaces, language, isSaving }) => {
    const t = translations[language];
    const [formData, setFormData] = useState<Partial<DharmaTalk>>({});
    const [audioFile, setAudioFile] = useState<File | null>(null);
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const audioInputRef = useRef<HTMLInputElement>(null);
    const avatarInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen && talk) {
            setFormData({
                ...talk,
                tags: Array.isArray(talk.tags) ? talk.tags : [],
                tagsEn: Array.isArray(talk.tagsEn) ? talk.tagsEn : [],
            });
        } else {
            setFormData({});
            setAudioFile(null);
            setAvatarFile(null);
        }
    }, [isOpen, talk]);

    if (!isOpen) return null;

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value, type } = e.target;
        let processedValue: any = value;
        if (type === 'number') processedValue = value === '' ? 0 : Number(value);
        if (name === 'spaceId' && value === '') processedValue = null;
        setFormData(prev => ({ ...prev, [name]: processedValue }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'audio' | 'avatar') => {
        if (!e.target.files || e.target.files.length === 0) return;
        const file = e.target.files[0];
        const previewUrl = URL.createObjectURL(file);
        
        if (type === 'audio') {
            setAudioFile(file);
            setFormData(prev => ({ ...prev, url: previewUrl }));
        } else {
            setAvatarFile(file);
            setFormData(prev => ({ ...prev, speakerAvatarUrl: previewUrl }));
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-background-panel rounded-lg shadow-xl w-full max-w-3xl flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-4 border-b">
                    <h2 className="text-xl font-bold">{talk?.id === 'new' ? t.createTitle : t.editTitle}</h2>
                    <button onClick={onClose} className="p-1 rounded-full text-gray-500 hover:bg-gray-200 hover:text-gray-800 transition-colors">
                        <XIcon className="w-5 h-5" />
                    </button>
                </div>
                <div className="p-6 overflow-y-auto space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><label className="block text-sm font-medium">{t.talkTitle}</label><input type="text" name="title" value={formData.title || ''} onChange={handleInputChange} className="mt-1 w-full p-2 border rounded-md" /></div>
                        <div><label className="block text-sm font-medium">{t.talkTitleEn}</label><input type="text" name="titleEn" value={formData.titleEn || ''} onChange={handleInputChange} className="mt-1 w-full p-2 border rounded-md" /></div>
                    </div>
                    <div><label className="block text-sm font-medium">{t.talkSubtitle}</label><textarea name="subtitle" value={formData.subtitle || ''} onChange={handleInputChange} className="mt-1 w-full p-2 border rounded-md" rows={2}></textarea></div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-2"><label className="block text-sm font-medium">{t.speaker}</label><input type="text" name="speaker" value={formData.speaker || ''} onChange={handleInputChange} className="mt-1 w-full p-2 border rounded-md" /></div>
                         <div>
                            <label className="block text-sm font-medium">{t.speakerAvatar}</label>
                            <div className="flex items-center gap-2 mt-1">
                                {formData.speakerAvatarUrl ? <img src={formData.speakerAvatarUrl} alt="avatar" className="w-10 h-10 rounded-full object-cover"/> : <UserIcon className="w-10 h-10 p-1 rounded-full bg-gray-200 text-gray-500" />}
                                <input type="file" ref={avatarInputRef} onChange={(e) => handleFileChange(e, 'avatar')} className="hidden" accept="image/*" />
                                <button type="button" onClick={() => avatarInputRef.current?.click()} className="text-sm text-primary hover:underline">{t.changeAvatar}</button>
                            </div>
                        </div>
                    </div>
                    <div><label className="block text-sm font-medium">{t.url}</label><input type="url" name="url" value={formData.url || ''} onChange={handleInputChange} className="mt-1 w-full p-2 border rounded-md" /><div className="mt-2"><label className="block text-sm text-text-light">{t.uploadAudio}</label><input type="file" ref={audioInputRef} onChange={(e) => handleFileChange(e, 'audio')} accept="audio/*" className="mt-1 text-sm"/></div></div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div><label className="block text-sm font-medium">{t.duration}</label><input type="number" name="duration" value={formData.duration ?? ''} onChange={handleInputChange} className="mt-1 w-full p-2 border rounded-md" /></div>
                        <div><label className="block text-sm font-medium">{t.date}</label><input type="date" name="date" value={formData.date ? new Date(formData.date).toISOString().split('T')[0] : ''} onChange={handleInputChange} className="mt-1 w-full p-2 border rounded-md" /></div>
                        <div className="md:col-span-2"><label className="block text-sm font-medium">{t.space}</label><select name="spaceId" value={formData.spaceId ?? ''} onChange={handleInputChange} className="mt-1 w-full p-2 border rounded-md"><option value="">{t.noSpace}</option>{spaces.map(space => <option key={space.id as number} value={space.id as number}>{space.name}</option>)}</select></div>
                    </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div><label className="block text-sm font-medium">{t.tags}</label><input type="text" value={Array.isArray(formData.tags) ? formData.tags.join(', ') : ''} onChange={e => setFormData(prev => ({...prev, tags: e.target.value.split(',').map(t=>t.trim())}))} className="mt-1 w-full p-2 border rounded-md" /></div>
                        <div><label className="block text-sm font-medium">{t.tagsEn}</label><input type="text" value={Array.isArray(formData.tagsEn) ? formData.tagsEn.join(', ') : ''} onChange={e => setFormData(prev => ({...prev, tagsEn: e.target.value.split(',').map(t=>t.trim())}))} className="mt-1 w-full p-2 border rounded-md" /></div>
                    </div>
                </div>
                <div className="p-4 border-t flex justify-end gap-2">
                    <button onClick={onClose} className="px-4 py-2 bg-gray-200 rounded-md">{t.cancel}</button>
                    <button onClick={() => onSave(formData, audioFile, avatarFile)} disabled={isSaving} className="px-4 py-2 bg-primary text-white rounded-md">{isSaving ? t.saving : t.save}</button>
                </div>
            </div>
        </div>
    );
};


export const DharmaTalksManagement: React.FC<{ language: 'vi' | 'en' }> = ({ language }) => {
    const t = translations[language];
    const { showToast } = useToast();
    const [talks, setTalks] = useState<DharmaTalk[]>([]);
    const [spaces, setSpaces] = useState<Space[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [editingTalk, setEditingTalk] = useState<Partial<DharmaTalk> | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [speakerFilter, setSpeakerFilter] = useState('');
    const [spaceFilter, setSpaceFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    
    const [playingTalkId, setPlayingTalkId] = useState<number | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    const fetchData = useCallback(async () => {
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
    }, [showToast]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    useEffect(() => {
        audioRef.current = new Audio();
        const audio = audioRef.current;
        const handleEnded = () => setPlayingTalkId(null);
        const handlePause = () => setPlayingTalkId(null);
        audio.addEventListener('ended', handleEnded);
        audio.addEventListener('pause', handlePause);
        return () => {
            audio.removeEventListener('ended', handleEnded);
            audio.removeEventListener('pause', handlePause);
            if (!audio.paused) audio.pause();
        };
    }, []);

    const handlePlayPause = (talk: DharmaTalk) => {
        const audio = audioRef.current;
        if (!audio || !talk.url || typeof talk.id !== 'number') return;
        if (talk.url.includes('youtube.com') || talk.url.includes('youtu.be')) {
            window.open(talk.url, '_blank', 'noopener,noreferrer');
            return;
        }
        if (playingTalkId === talk.id) {
            audio.pause();
        } else {
            if (!audio.paused) audio.pause();
            audio.src = talk.url;
            audio.play().catch(e => {
                console.error("Audio playback error:", e);
                showToast(t.audioPlaybackError, "error");
                setPlayingTalkId(null);
            });
            setPlayingTalkId(talk.id);
        }
    };

    const handleNewTalk = () => {
        setEditingTalk({ id: 'new', date: new Date().toISOString().split('T')[0] });
        setIsModalOpen(true);
    };

    const handleEditTalk = (talk: DharmaTalk) => {
        setEditingTalk(talk);
        setIsModalOpen(true);
    };

    const handleSave = async (formData: Partial<DharmaTalk>, audioFile: File | null, avatarFile: File | null) => {
        setIsSaving(true);
        try {
            const data = new FormData();

            Object.entries(formData).forEach(([key, value]) => {
                if (value === null || value === undefined) {
                    // Do not append null/undefined, but allow empty strings
                } else if (Array.isArray(value)) {
                    data.append(key, value.join(','));
                } else {
                    data.append(key, String(value));
                }
            });

            if (avatarFile) data.append('avatarFile', avatarFile);
            if (audioFile) data.append('audioFile', audioFile);

            if (formData.id === 'new') {
                data.delete('id');
                await apiService.createDharmaTalk(data);
            } else {
                await apiService.updateDharmaTalk(formData.id as number, data);
            }

            showToast(t.saveSuccess, 'success');
            setIsModalOpen(false);
            setEditingTalk(null);
            fetchData();
        } catch (error: any) {
            showToast(t.saveError.replace('{message}', error.message), 'error');
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (talk: DharmaTalk) => {
        if (window.confirm(t.confirmDeleteBody.replace('{name}', talk.title || ''))) {
            try {
                await apiService.deleteDharmaTalk(talk.id as number);
                showToast(t.deleteSuccess, 'success');
                fetchData();
            } catch (error: any) {
                showToast(t.deleteError.replace('{message}', error.message), 'error');
            }
        }
    };

    const uniqueSpeakers = useMemo(() => Array.from(new Set(talks.map(t => t.speaker).filter(Boolean))), [talks]);

    const filteredTalks = useMemo(() => {
        const searchLower = searchTerm.toLowerCase();
        return talks.filter(talk => {
            const titleMatch = (talk.title?.toLowerCase().includes(searchLower) || talk.titleEn?.toLowerCase().includes(searchLower));
            const speakerMatch = !speakerFilter || talk.speaker === speakerFilter;
            const spaceMatch = !spaceFilter || String(talk.spaceId) === spaceFilter;
            return titleMatch && speakerMatch && spaceMatch;
        });
    }, [talks, searchTerm, speakerFilter, spaceFilter]);
    
    const paginatedTalks = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredTalks.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [filteredTalks, currentPage]);

    const totalPages = Math.ceil(filteredTalks.length / ITEMS_PER_PAGE);
    const getSpaceName = (spaceId: number | null | undefined) => spaces.find(s => s.id === spaceId)?.name || '-';

    return (
        <div className="p-6 h-full flex flex-col bg-background-panel">
            <div className="flex justify-between items-center mb-4 flex-shrink-0">
                <div><h1 className="text-2xl font-bold font-serif">{t.title}</h1></div>
                 <div className="flex items-center gap-2">
                    <button onClick={handleNewTalk} className="px-4 py-2 bg-primary text-text-on-primary rounded-md flex items-center space-x-2 font-semibold">
                        <PlusIcon className="w-5 h-5" />
                        <span>{t.newTalk}</span>
                    </button>
                </div>
            </div>
            <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-4 p-4 border rounded-lg bg-background-light border-border-color flex-shrink-0">
                 <div><label className="text-sm font-medium text-text-light">{t.titleHeader}</label><input type="text" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder={t.searchPlaceholder} className="p-2 border border-border-color rounded-md bg-background-panel text-sm w-full mt-1" /></div>
                 <div><label className="text-sm font-medium text-text-light">{t.speaker}</label><select value={speakerFilter} onChange={(e) => setSpeakerFilter(e.target.value)} className="p-2 border border-border-color rounded-md bg-background-panel text-sm w-full mt-1"><option value="">{t.filterAll}</option>{uniqueSpeakers.map(name => <option key={name} value={name}>{name}</option>)}</select></div>
                 <div><label className="text-sm font-medium text-text-light">{t.space}</label><select value={spaceFilter} onChange={(e) => setSpaceFilter(e.target.value)} className="p-2 border border-border-color rounded-md bg-background-panel text-sm w-full mt-1"><option value="">{t.filterAll}</option>{spaces.map(s => <option key={s.id as number} value={s.id as number}>{s.name}</option>)}</select></div>
            </div>

            <div className="flex-1 overflow-auto border border-border-color rounded-lg shadow-sm bg-background-panel">
                <table className="min-w-full divide-y divide-border-color">
                    <thead className="bg-background-light sticky top-0 z-10">
                        <tr>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-text-light uppercase tracking-wider">{t.stt}</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-text-light uppercase tracking-wider">{t.speakerAvatar}</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-text-light uppercase tracking-wider">{t.titleHeader}</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-text-light uppercase tracking-wider">{t.speaker}</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-text-light uppercase tracking-wider">{t.space}</th>
                            <th className="px-4 py-3 text-left text-xs font-semibold text-text-light uppercase tracking-wider">{t.createdAt}</th>
                            <th className="px-4 py-3 text-right text-xs font-semibold text-text-light uppercase tracking-wider">{t.actions}</th>
                        </tr>
                    </thead>
                    <tbody className="bg-background-panel divide-y divide-border-color">
                        {isLoading ? ( <tr><td colSpan={7} className="text-center p-4">{t.loading}</td></tr> ) : paginatedTalks.length === 0 ? ( <tr><td colSpan={7} className="text-center p-4">{t.noTalksFound}</td></tr> ) : (
                            paginatedTalks.map((talk, index) => {
                                const isPlaying = playingTalkId === talk.id;
                                const isYouTube = talk.url && (talk.url.includes('youtube.com') || talk.url.includes('youtu.be'));
                                return (
                                <tr key={talk.id} className="hover:bg-background-light">
                                    <td className="px-4 py-3 text-sm text-text-light">{(currentPage - 1) * ITEMS_PER_PAGE + index + 1}</td>
                                    <td className="px-4 py-3">
                                        <div className="w-16 h-12 flex items-center justify-center">
                                            {talk.speakerAvatarUrl ? <img src={talk.speakerAvatarUrl} alt={talk.speaker} className="w-12 h-12 rounded-md object-cover"/> : <DharmaWheelIcon className="w-12 h-12 text-text-light"/>}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 font-semibold text-text-main max-w-xs">
                                        <div className="flex items-center gap-3">
                                            {talk.url && (<button onClick={() => handlePlayPause(talk)} className="p-2 rounded-full hover:bg-gray-200 flex-shrink-0" title={isYouTube ? t.listenOnYoutube : isPlaying ? t.pauseAudio : t.playAudio}>{isYouTube ? <YouTubeIcon className="w-5 h-5 text-red-600" /> : isPlaying ? <PauseIcon className="w-5 h-5 text-primary" /> : <PlayIcon className="w-5 h-5 text-primary" />}</button>)}
                                            <span className="truncate" title={talk.title}>{talk.title}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 text-sm">{talk.speaker}</td>
                                    <td className="px-4 py-3 text-sm">{getSpaceName(talk.spaceId)}</td>
                                    <td className="px-4 py-3 text-sm text-text-light">{new Date(talk.date || talk.createdAt!).toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-US')}</td>
                                    <td className="px-4 py-3 text-right text-sm space-x-2 whitespace-nowrap">
                                        <button onClick={() => handleEditTalk(talk)} title={t.edit} className="p-2 rounded-full hover:bg-gray-200"><PencilIcon className="w-5 h-5 text-text-light"/></button>
                                        <button onClick={() => handleDelete(talk)} title={t.delete} className="p-2 rounded-full hover:bg-gray-200"><TrashIcon className="w-5 h-5 text-accent-red"/></button>
                                    </td>
                                </tr>
                                )}
                            )
                        )}
                    </tbody>
                </table>
            </div>
            {totalPages > 1 && (
                <div className="flex justify-between items-center mt-4 flex-shrink-0">
                    <p className="text-sm text-text-light">{t.showing} {filteredTalks.length > 0 ? (currentPage - 1) * ITEMS_PER_PAGE + 1 : 0} {t.to} {Math.min(currentPage * ITEMS_PER_PAGE, filteredTalks.length)} {t.of} {filteredTalks.length}</p>
                    <div className="flex space-x-1">
                        <button 
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
                            disabled={currentPage === 1} 
                            className="px-3 py-1 text-sm border rounded-md disabled:opacity-50 disabled:cursor-not-allowed bg-white hover:bg-gray-50"
                        >
                            {t.prev}
                        </button>
                        <button 
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} 
                            disabled={currentPage === totalPages || totalPages === 0}
                            className="px-3 py-1 text-sm border rounded-md disabled:opacity-50 disabled:cursor-not-allowed bg-white hover:bg-gray-50"
                        >
                            {t.next}
                        </button>
                    </div>
                </div>
            )}
            <DharmaTalkModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={handleSave} talk={editingTalk} spaces={spaces} language={language} isSaving={isSaving}/>
        </div>
    );
};
