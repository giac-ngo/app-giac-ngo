// client/src/components/admin/MeditationManagement.tsx
import React, { useState, useEffect, useRef } from 'react';
import { apiService } from '../../services/apiService';
import { MeditationSession, Space } from '../../types';
import { useToast } from '../ToastProvider';
import { PlusIcon, TrashIcon, PencilIcon, SearchIcon, PlayIcon, PauseIcon } from '../Icons';

interface MeditationManagementProps {
    language: 'vi' | 'en';
}

const translations = {
    vi: {
        title: 'Quản lý Thiền',
        addMeditation: 'Thêm bài thiền',
        editMeditation: 'Sửa bài thiền',
        space: 'Không gian',
        sessionTitle: 'Tiêu đề',
        sessionTitleEn: 'Tiêu đề (EN)',
        description: 'Mô tả',
        descriptionEn: 'Mô tả (EN)',
        audioFile: 'File Audio (VI)',
        audioFileEn: 'File Audio (EN)',
        duration: 'Thời lượng (liệt kê bằng giây)',
        durationNote: 'Ví dụ: 900 cho 15 phút',
        actions: 'Hành động',
        save: 'Lưu',
        cancel: 'Hủy',
        deleteConfirm: 'Bạn có chắc chắn muốn xóa bài thiền này?',
        searchPlaceholder: 'Tìm kiếm bài thiền...',
        noData: 'Không có dữ liệu',
        loading: 'Đang tải...',
        play: 'Nghe thử',
        pause: 'Tạm dừng',
    },
    en: {
        title: 'Meditation Management',
        addMeditation: 'Add Meditation',
        editMeditation: 'Edit Meditation',
        space: 'Space',
        sessionTitle: 'Title',
        sessionTitleEn: 'Title (EN)',
        description: 'Description',
        descriptionEn: 'Description (EN)',
        audioFile: 'Audio File (VI)',
        audioFileEn: 'Audio File (EN)',
        duration: 'Duration (in seconds)',
        durationNote: 'E.g., 900 for 15 minutes',
        actions: 'Actions',
        save: 'Save',
        cancel: 'Cancel',
        deleteConfirm: 'Are you sure you want to delete this meditation?',
        searchPlaceholder: 'Search meditations...',
        noData: 'No data',
        loading: 'Loading...',
        play: 'Preview',
        pause: 'Pause',
    }
};

const MeditationModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: FormData) => void;
    meditation: Partial<MeditationSession> | null;
    spaces: Space[];
    language: 'vi' | 'en';
    isSaving: boolean;
}> = ({ isOpen, onClose, onSave, meditation, spaces, language, isSaving }) => {
    const t = translations[language];
    const [formData, setFormData] = useState<Partial<MeditationSession>>({
        spaceId: 0,
        title: '',
        titleEn: '',
        description: '',
        descriptionEn: '',
        duration: 900, // Default 15 mins
    });
    const [audioFile, setAudioFile] = useState<File | null>(null);
    const [audioFileEn, setAudioFileEn] = useState<File | null>(null);

    useEffect(() => {
        if (meditation) {
            setFormData(meditation);
        } else {
            setFormData({
                spaceId: spaces.length > 0 && typeof spaces[0].id === 'number' ? spaces[0].id : 0,
                title: '',
                titleEn: '',
                description: '',
                descriptionEn: '',
                duration: 900,
            });
        }
        setAudioFile(null);
        setAudioFileEn(null);
    }, [meditation, spaces, isOpen]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const data = new FormData();
        if (formData.spaceId) data.append('spaceId', String(formData.spaceId));
        if (formData.title) data.append('title', formData.title);
        if (formData.titleEn) data.append('titleEn', formData.titleEn);
        if (formData.description) data.append('description', formData.description);
        if (formData.descriptionEn) data.append('descriptionEn', formData.descriptionEn);
        if (formData.duration) data.append('duration', String(formData.duration));

        if (audioFile) data.append('audioFile', audioFile);
        if (audioFileEn) data.append('audioFileEn', audioFileEn);

        onSave(data);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-background-panel p-6 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <h3 className="text-xl font-bold mb-4">{meditation ? t.editMeditation : t.addMeditation}</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">{t.space}</label>
                        <select
                            value={formData.spaceId}
                            onChange={(e) => setFormData({ ...formData, spaceId: Number(e.target.value) })}
                            className="w-full p-2 border border-border-color rounded bg-background-light text-text-main"
                            disabled={!!meditation} // Only allow setting space on create
                        >
                            {spaces.map(space => (
                                <option key={space.id} value={space.id}>{space.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">{t.sessionTitle} (VI)</label>
                            <input
                                type="text"
                                value={formData.title || ''}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                className="w-full p-2 border border-border-color rounded bg-background-light text-text-main"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">{t.sessionTitleEn}</label>
                            <input
                                type="text"
                                value={formData.titleEn || ''}
                                onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })}
                                className="w-full p-2 border border-border-color rounded bg-background-light text-text-main"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">{t.description} (VI)</label>
                            <textarea
                                value={formData.description || ''}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full p-2 border border-border-color rounded bg-background-light text-text-main h-24"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">{t.descriptionEn}</label>
                            <textarea
                                value={formData.descriptionEn || ''}
                                onChange={(e) => setFormData({ ...formData, descriptionEn: e.target.value })}
                                className="w-full p-2 border border-border-color rounded bg-background-light text-text-main h-24"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">{t.duration} (seconds)</label>
                        <input
                            type="number"
                            value={formData.duration || 0}
                            onChange={(e) => setFormData({ ...formData, duration: Number(e.target.value) })}
                            className="w-full p-2 border border-border-color rounded bg-background-light text-text-main"
                            required
                        />
                        <p className="text-xs text-text-light mt-1">{t.durationNote}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">{t.audioFile} (VI)</label>
                            <input
                                type="file"
                                accept="audio/*"
                                onChange={(e) => setAudioFile(e.target.files ? e.target.files[0] : null)}
                                className="w-full p-2 border border-border-color rounded bg-background-light text-text-main"
                            />
                            {meditation?.audioUrl && <p className="text-xs text-text-light mt-1 truncate">{meditation.audioUrl}</p>}
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">{t.audioFileEn}</label>
                            <input
                                type="file"
                                accept="audio/*"
                                onChange={(e) => setAudioFileEn(e.target.files ? e.target.files[0] : null)}
                                className="w-full p-2 border border-border-color rounded bg-background-light text-text-main"
                            />
                            {meditation?.audioUrlEn && <p className="text-xs text-text-light mt-1 truncate">{meditation.audioUrlEn}</p>}
                        </div>
                    </div>

                    <div className="flex justify-end gap-2 mt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 rounded bg-background-light hover:bg-border-color text-text-main"
                            disabled={isSaving}
                        >
                            {t.cancel}
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 rounded bg-primary hover:bg-primary-dark text-white"
                            disabled={isSaving}
                        >
                            {isSaving ? t.loading : t.save}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export const MeditationManagement: React.FC<MeditationManagementProps> = ({ language }) => {
    const t = translations[language];
    const { showToast } = useToast();
    const [meditations, setMeditations] = useState<MeditationSession[]>([]);
    const [spaces, setSpaces] = useState<Space[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingMeditation, setEditingMeditation] = useState<MeditationSession | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const [playingUrl, setPlayingUrl] = useState<string | null>(null);

    useEffect(() => {
        fetchData();
        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
        }
    }, []);

    const fetchData = async () => {
        setIsLoading(true);
        try {
            const [meditationData, spaceData] = await Promise.all([
                apiService.getAllMeditations(),
                apiService.getSpaces()
            ]);
            setMeditations(meditationData);
            setSpaces(spaceData || []);
        } catch (error) {
            console.error('Error fetching data:', error);
            showToast('Failed to load data', 'error');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreate = () => {
        setEditingMeditation(null);
        setIsModalOpen(true);
    };

    const handleEdit = (meditation: MeditationSession) => {
        setEditingMeditation(meditation);
        setIsModalOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm(t.deleteConfirm)) return;
        try {
            await apiService.deleteMeditation(id);
            setMeditations(prev => prev.filter(m => m.id !== id));
            showToast('Meditation deleted successfully', 'success');
        } catch (error) {
            console.error('Error deleting meditation:', error);
            showToast('Failed to delete meditation', 'error');
        }
    };

    const handleSave = async (data: FormData) => {
        setIsSaving(true);
        try {
            if (editingMeditation) {
                const updated = await apiService.updateMeditation(editingMeditation.id, data);
                setMeditations(prev => prev.map(m => m.id === updated.id ? { ...updated, spaceName: spaces.find(s => s.id === updated.spaceId)?.name } : m));
                showToast('Meditation updated successfully', 'success');
            } else {
                const created = await apiService.createMeditation(data);
                const spaceName = spaces.find(s => s.id === created.spaceId)?.name;
                setMeditations(prev => [...prev, { ...created, spaceName }]);
                showToast('Meditation created successfully', 'success');
            }
            setIsModalOpen(false);
        } catch (error) {
            console.error('Error saving meditation:', error);
            showToast('Failed to save meditation', 'error');
        } finally {
            setIsSaving(false);
        }
    };

    const handlePlayPause = (url: string) => {
        if (playingUrl === url) {
            audioRef.current?.pause();
            setPlayingUrl(null);
        } else {
            if (audioRef.current) {
                audioRef.current.pause();
            }
            audioRef.current = new Audio(url);
            audioRef.current.play();
            audioRef.current.onended = () => setPlayingUrl(null);
            setPlayingUrl(url);
        }
    };

    const filteredMeditations = meditations.filter(m =>
        m.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (m.spaceName && m.spaceName.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">{t.title}</h2>
                <button
                    onClick={handleCreate}
                    className="flex items-center gap-2 bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg transition-colors"
                >
                    <PlusIcon className="w-5 h-5" />
                    {t.addMeditation}
                </button>
            </div>

            <div className="mb-6 relative">
                <input
                    type="text"
                    placeholder={t.searchPlaceholder}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-border-color rounded-lg bg-background-light text-text-main focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                />
                <SearchIcon className="w-5 h-5 absolute left-3 top-2.5 text-text-light" />
            </div>

            {isLoading ? (
                <div className="text-center py-8">{t.loading}</div>
            ) : filteredMeditations.length === 0 ? (
                <div className="text-center py-8 text-text-light">{t.noData}</div>
            ) : (
                <div className="bg-background-panel rounded-lg shadow overflow-hidden border border-border-color">
                    <table className="w-full">
                        <thead className="bg-background-light border-b border-border-color">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-text-light uppercase tracking-wider">{t.space}</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-text-light uppercase tracking-wider">{t.sessionTitle}</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-text-light uppercase tracking-wider">{t.duration}</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-text-light uppercase tracking-wider">{t.play}</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-text-light uppercase tracking-wider">{t.actions}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border-color">
                            {filteredMeditations.map((item) => (
                                <tr key={item.id} className="hover:bg-background-light transition-colors">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">{item.spaceName}</td>
                                    <td className="px-6 py-4 text-sm font-medium">{language === 'en' && item.titleEn ? item.titleEn : item.title}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">{Math.floor(item.duration / 60)}m {item.duration % 60}s</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                                        <button onClick={() => handlePlayPause(item.audioUrl)} className="text-primary hover:text-primary-dark">
                                            {playingUrl === item.audioUrl ? <PauseIcon className="w-5 h-5" /> : <PlayIcon className="w-5 h-5" />}
                                        </button>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button
                                            onClick={() => handleEdit(item)}
                                            className="text-primary hover:text-primary-dark mr-3"
                                        >
                                            <PencilIcon className="w-5 h-5" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(item.id)}
                                            className="text-accent-red hover:text-red-700"
                                        >
                                            <TrashIcon className="w-5 h-5" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            <MeditationModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSave}
                meditation={editingMeditation}
                spaces={spaces}
                language={language}
                isSaving={isSaving}
            />
        </div>
    );
};
