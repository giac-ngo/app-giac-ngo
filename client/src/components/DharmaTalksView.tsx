// client/src/components/DharmaTalksView.tsx
import React, { useState, useEffect } from 'react';
import { DharmaTalk } from '../types';
import { useToast } from './ToastProvider';
import { apiService } from '../services/apiService';
import { ClockIcon, BellIcon, UserIcon, PlayIcon } from './Icons';

const translations = {
    vi: {
        title: 'Pháp Thoại',
        subtitle: 'Lắng nghe các bài giảng pháp thoại từ các thiền sư và giảng sư uy tín từ khắp nơi.',
        loading: 'Đang tải pháp thoại...',
        loadError: 'Không thể tải dữ liệu pháp thoại.',
        noTalks: 'Chưa có bài pháp thoại nào cho không gian này.',
        speaker: 'Thuyết giảng',
        date: 'Ngày',
        listen: 'Nghe',
        fromSpace: 'Tại',
        host: 'Host',
    },
    en: {
        title: 'Dharma Talks',
        subtitle: 'Listen to dharma talks from reputable Zen masters and teachers from around the world.',
        loading: 'Loading dharma talks...',
        loadError: 'Could not load dharma talk data.',
        noTalks: 'No dharma talks available for this space yet.',
        speaker: 'Speaker',
        date: 'Date',
        listen: 'Listen',
        fromSpace: 'From',
        host: 'Host',
    }
};

const formatDuration = (seconds: number) => {
    if (isNaN(seconds) || seconds < 0) return 'N/A';
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    if (hours > 0) {
        return `${hours}h ${String(minutes).padStart(2, '0')}m`;
    }
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
};

interface DharmaTalksViewProps {
  language: 'vi' | 'en';
  spaceId: number | null;
}

export const DharmaTalksView: React.FC<DharmaTalksViewProps> = ({ language, spaceId }) => {
    const t = translations[language];
    const { showToast } = useToast();
    const [talks, setTalks] = useState<(DharmaTalk & { spaceName?: string })[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setIsLoading(true);
        const fetchTalks = async () => {
            try {
                let data: DharmaTalk[];
                if (typeof spaceId === 'number') {
                    data = await apiService.getDharmaTalksBySpaceId(spaceId);
                } else {
                    // Fallback if no spaceId is provided, fetch all public ones.
                    data = await apiService.getAllDharmaTalks();
                }
                setTalks(data || []);
            } catch (error) {
                showToast(t.loadError, 'error');
                console.error(error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchTalks();
    }, [spaceId, showToast, t.loadError]);


    return (
        <div className="dharma-talks-view-container">
            {isLoading ? (
                <p className="text-center">{t.loading}</p>
            ) : talks.length === 0 ? (
                <p className="text-center">{t.noTalks}</p>
            ) : (
                <div className="dharma-talk-grid">
                    {talks.map(talk => (
                        <div key={talk.id} className="dharma-card-new">
                            <div className="card-header">
                                {talk.date && <span className="countdown-badge"><ClockIcon className="w-4 h-4" /> {new Date(talk.date).toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-US')}</span>}
                                <span className="notification-count"><BellIcon className="w-4 h-4" /> {talk.notifications || 0}</span>
                            </div>
                            <div className="card-content">
                                <h4 className="session-title">{language === 'en' && talk.titleEn ? talk.titleEn : talk.title}</h4>
                                <p className="session-subtitle">{talk.subtitle}</p>
                                <div className="host-info">
                                    <UserIcon className="w-8 h-8 rounded-full bg-background-light p-1" />
                                    <div>
                                        <span className="host-name">{talk.speaker}</span>
                                        <span className="host-label">{t.speaker}</span>
                                    </div>
                                    {talk.duration != null && (
                                        <div className="ml-auto flex items-center gap-1 text-sm text-text-light">
                                            <ClockIcon className="w-4 h-4" />
                                            <span>{formatDuration(talk.duration)}</span>
                                        </div>
                                    )}
                                </div>
                                <div className="session-tags">
                                    {(language === 'en' && talk.tagsEn ? talk.tagsEn : talk.tags)?.map(tag => <span key={tag}>{tag}</span>)}
                                </div>
                            </div>
                            {talk.url && (
                                <a href={talk.url} target="_blank" rel="noopener noreferrer" className="play-button" title={t.listen}>
                                    <PlayIcon className="w-5 h-5"/>
                                </a>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
