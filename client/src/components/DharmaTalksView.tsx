// client/src/components/DharmaTalksView.tsx
import React, { useState, useEffect, useRef } from 'react';
import { DharmaTalk } from '../types';
import { useToast } from './ToastProvider';
import { apiService } from '../services/apiService';
import { ClockIcon, UserIcon, PlayIcon, YouTubeIcon, PauseIcon, HeartIcon, EyeIcon } from './Icons';

// Import CSS for Dharma Talks (which includes PracticeSpacePage.css)
import '../../public/themes/giacngo/DharmaTalksPage.css';

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

const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
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
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [viewIncremented, setViewIncremented] = useState<Set<number | 'new'>>(new Set());
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        setIsLoading(true);
        const fetchTalks = async () => {
            try {
                let data: DharmaTalk[];
                if (typeof spaceId === 'number') {
                    data = await apiService.getDharmaTalksBySpaceId(spaceId);
                } else {
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
        const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
        const handleLoadedMetadata = () => setDuration(audio.duration);

        audio.addEventListener('ended', handleEnded);
        audio.addEventListener('pause', handlePause);
        audio.addEventListener('timeupdate', handleTimeUpdate);
        audio.addEventListener('loadedmetadata', handleLoadedMetadata);

        return () => {
            audio.removeEventListener('ended', handleEnded);
            audio.removeEventListener('pause', handlePause);
            audio.removeEventListener('timeupdate', handleTimeUpdate);
            audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
            if (!audio.paused) audio.pause();
        };
    }, []);

    const handlePlayPause = async (talk: DharmaTalk) => {
        const audio = audioRef.current;
        const audioUrl = language === 'en' && talk.urlEn ? talk.urlEn : talk.url;

        if (!audio || !audioUrl || typeof talk.id !== 'number') return;

        if (audioUrl.includes('youtube.com') || audioUrl.includes('youtu.be')) {
            window.open(audioUrl, '_blank', 'noopener,noreferrer');
            return;
        }

        if (playingTalkId === talk.id) {
            audio.pause();
            setPlayingTalkId(null);
        } else {
            if (!audio.paused) {
                audio.pause();
            }
            audio.src = audioUrl;
            audio.play().catch(e => {
                console.error("Audio playback error:", e);
                showToast(t.audioPlaybackError, "error");
                setPlayingTalkId(null);
            });
            setPlayingTalkId(talk.id);

            // Increment view count only once per talk
            if (!viewIncremented.has(talk.id)) {
                try {
                    const result = await apiService.incrementDharmaTalkView(talk.id as number);
                    setViewIncremented(prev => new Set(prev).add(talk.id));
                    setTalks(prev => prev.map(t =>
                        t.id === talk.id ? { ...t, views: result.views } : t
                    ));
                } catch (error) {
                    console.error("Failed to increment view:", error);
                }
            }
        }
    };

    const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
        const audio = audioRef.current;
        if (!audio || !duration) return;

        const rect = e.currentTarget.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const percentage = clickX / rect.width;
        const newTime = percentage * duration;

        audio.currentTime = newTime;
        setCurrentTime(newTime);
    };

    const handleLike = async (talk: DharmaTalk) => {
        if (typeof talk.id !== 'number') return;

        try {
            const result = await apiService.likeDharmaTalk(talk.id);
            setTalks(prev => prev.map(t =>
                t.id === talk.id ? { ...t, likes: result.likes } : t
            ));
        } catch (error) {
            console.error("Failed to like talk:", error);
            showToast('Không thể thích pháp thoại', 'error');
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
                        const audioUrl = language === 'en' && talk.urlEn ? talk.urlEn : talk.url;
                        const isYouTube = audioUrl && (audioUrl.includes('youtube.com') || audioUrl.includes('youtu.be'));
                        const progress = isPlaying && duration > 0 ? (currentTime / duration) * 100 : 0;

                        return (
                            <div key={talk.id} className="dharma-card-new">
                                <div className="card-header">
                                    {talk.date && <span className="countdown-badge"><ClockIcon className="w-4 h-4" /> {new Date(talk.date).toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-US')}</span>}
                                    <div className="flex items-center gap-3">
                                        <div className="flex items-center gap-1 text-sm text-text-light">
                                            <EyeIcon className="w-4 h-4" />
                                            <span>{talk.views || 0}</span>
                                        </div>
                                        <button
                                            onClick={() => handleLike(talk)}
                                            className="flex items-center gap-1 text-sm text-text-light hover:text-primary transition-colors"
                                        >
                                            <HeartIcon className="w-4 h-4" />
                                            <span>{talk.likes || 0}</span>
                                        </button>
                                    </div>
                                </div>
                                <div className="card-content">
                                    <div className="flex items-start justify-between gap-2">
                                        <h4 className="session-title flex-1">{language === 'en' && talk.titleEn ? talk.titleEn : talk.title}</h4>
                                        {talk.duration != null && (
                                            <div className="flex items-center gap-1 text-sm text-text-light flex-shrink-0">
                                                <ClockIcon className="w-4 h-4" />
                                                <span>{formatDuration(talk.duration)}</span>
                                            </div>
                                        )}
                                    </div>
                                    <p className="session-subtitle">{language === 'en' && talk.subtitleEn ? talk.subtitleEn : talk.subtitle}</p>

                                    <div className="host-info">
                                        <div className="flex-1">
                                            <div className="host-name">{talk.speaker}</div>
                                            <div className="host-label">{t.speaker}</div>
                                        </div>
                                        {talk.speakerAvatarUrl ?
                                            <img src={talk.speakerAvatarUrl} alt={talk.speaker} className="w-24 h-24 rounded-lg object-cover ml-auto" />
                                            : <UserIcon className="w-24 h-24 p-3 rounded-lg bg-background-light text-text-light ml-auto" />
                                        }
                                    </div>

                                    <div className="session-tags">
                                        {(language === 'en' && talk.tagsEn ? talk.tagsEn : talk.tags)?.map(tag => <span key={tag}>{tag}</span>)}
                                    </div>
                                </div>

                                {/* Audio Controls - Moved to bottom */}
                                {audioUrl && (
                                    <div className="audio-controls">
                                        {isYouTube ? (
                                            <a href={audioUrl} target="_blank" rel="noopener noreferrer" className="play-button" title={t.listenOnYoutube}>
                                                <YouTubeIcon className="w-6 h-6" />
                                            </a>
                                        ) : (
                                            <div className="flex items-center gap-3 w-full">
                                                <button onClick={() => handlePlayPause(talk)} className="play-button flex-shrink-0" title={isPlaying ? t.pauseAudio : t.playAudio}>
                                                    {isPlaying ? <PauseIcon className="w-6 h-6" /> : <PlayIcon className="w-6 h-6" />}
                                                </button>
                                                <div className="audio-progress-container flex-1">
                                                    <span className="time-label">{formatTime(isPlaying ? currentTime : 0)}</span>
                                                    <div className="progress-bar" onClick={handleSeek}>
                                                        <div className="progress-fill" style={{ width: `${progress}%` }}></div>
                                                    </div>
                                                    <span className="time-label">{formatTime(isPlaying ? duration : (talk.duration || 0))}</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
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