// client/src/components/DharmaTalksView.tsx
import React, { useState, useEffect, useRef } from 'react';
import { DharmaTalk } from '../types';
import { useToast } from './ToastProvider';
import { apiService } from '../services/apiService';
import { ClockIcon, BellIcon, UserIcon, PlayIcon, YouTubeIcon, PauseIcon } from './Icons';

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
        audioPlaybackError: 'Không thể phát âm thanh.',
        listenOnYoutube: 'Nghe trên YouTube',
        pauseAudio: 'Tạm dừng',
        playAudio: 'Phát',
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
        audioPlaybackError: 'Failed to play audio.',
        listenOnYoutube: 'Listen on YouTube',
        pauseAudio: 'Pause',
        playAudio: 'Play',
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
    
    const [playingTalkId, setPlayingTalkId] = useState<number | 'new' | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

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

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;
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
            setPlayingTalkId(null);
        } else {
            if (!audio.paused) {
                 audio.pause();
            }
            audio.src = talk.url;
            audio.play().catch(e => {
                console.error("Audio playback error:", e);
                showToast(t.audioPlaybackError, "error");
                setPlayingTalkId(null);
            });
            setPlayingTalkId(talk.id);
        }
    };

    return (
        <div className="dharma-talks-view-container">
            {isLoading ? (
                <p className="text-center">{t.loading}</p>
            ) : talks.length === 0 ? (
                <p className="text-center">{t.noTalks}</p>
            ) : (
                <div className="dharma-talk-grid">
                    {talks.map(talk => {
                        const isPlaying = playingTalkId === talk.id;
                        const isYouTube = talk.url && (talk.url.includes('youtube.com') || talk.url.includes('youtu.be'));
                        
                        return (
                            <div key={talk.id} className="dharma-card-new">
                                <div className="card-header">
                                    {talk.date && <span className="countdown-badge"><ClockIcon className="w-4 h-4" /> {new Date(talk.date).toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-US')}</span>}
                                    <span className="notification-count"><BellIcon className="w-4 h-4" /> {talk.notifications || 0}</span>
                                </div>
                                <div className="card-content">
                                    <h4 className="session-title">{language === 'en' && talk.titleEn ? talk.titleEn : talk.title}</h4>
                                    <p className="session-subtitle">{talk.subtitle}</p>
                                    <div className="host-info">
                                        {talk.speakerAvatarUrl ? 
                                            <img src={talk.speakerAvatarUrl} alt={talk.speaker} className="w-10 h-10 rounded-full object-cover" />
                                            : <UserIcon className="w-10 h-10 p-1 rounded-full bg-background-light text-text-light" />
                                        }
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
                                    isYouTube ? (
                                        <a href={talk.url} target="_blank" rel="noopener noreferrer" className="play-button" title={t.listenOnYoutube}>
                                            <YouTubeIcon className="w-6 h-6"/>
                                        </a>
                                    ) : (
                                        <button onClick={() => handlePlayPause(talk)} className="play-button" title={isPlaying ? t.pauseAudio : t.playAudio}>
                                            {isPlaying ? <PauseIcon className="w-5 h-5"/> : <PlayIcon className="w-5 h-5"/>}
                                        </button>
                                    )
                                )}
                            </div>
                        )
                    })}
                </div>
            )}
             <audio ref={audioRef} />
        </div>
    );
};