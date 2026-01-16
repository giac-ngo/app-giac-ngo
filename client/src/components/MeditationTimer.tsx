import React, { useState, useEffect, useRef } from 'react';
import { PlayIcon, PauseIcon } from './Icons';
import { apiService } from '../services/apiService';
import { MeditationSession } from '../types';

const translations = {
    vi: {
        title: 'Thiền Định',
        statusReady: 'Sẵn sàng',
        statusRunning: 'Đang thiền',
        statusFinished: 'Hoàn thành',
        startButton: 'Bắt đầu',
        pauseButton: 'Tạm dừng',
        stopButton: 'Dừng',
        noMeditation: 'Chưa có bài thiền cho không gian này',
        loading: 'Đang tải...',
    },
    en: {
        title: 'Meditation',
        statusReady: 'Ready',
        statusRunning: 'Meditating',
        statusFinished: 'Finished',
        startButton: 'Start',
        pauseButton: 'Pause',
        stopButton: 'Stop',
        noMeditation: 'No meditation available for this space',
        loading: 'Loading...',
    }
};

const StopIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={className}>
        <path fillRule="evenodd" d="M4.5 7.5a3 3 0 013-3h9a3 3 0 013 3v9a3 3 0 01-3 3h-9a3 3 0 01-3-3v-9z" clipRule="evenodd" />
    </svg>
);

export const MeditationTimer: React.FC<{ language?: 'vi' | 'en', spaceId?: number }> = ({ language = 'vi', spaceId }) => {
    const t = translations[language];
    const [meditationData, setMeditationData] = useState<MeditationSession | null>(null);
    const [timeLeft, setTimeLeft] = useState(0);
    const [timerState, setTimerState] = useState<'idle' | 'playing' | 'paused' | 'stopped'>('idle');
    const [loading, setLoading] = useState(true);

    // Use a ref for the audio element to control playback without re-rendering
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        if (spaceId) {
            setLoading(true);
            apiService.getMeditationBySpaceId(spaceId)
                .then(data => {
                    setMeditationData(data);
                    if (data) {
                        setTimeLeft(data.duration);
                        // Initialize audio
                        const url = language === 'en' && data.audioUrlEn ? data.audioUrlEn : data.audioUrl;
                        if (audioRef.current) {
                            audioRef.current.pause();
                            audioRef.current = null;
                        }
                        audioRef.current = new Audio(url);
                        audioRef.current.loop = true; // Optional: loop specifically the background music if it was separate, but here it's one file. Assuming the file is long enough or we loop it? 
                        // Actually, usually a guided meditation is played once. If it's shorter than duration, it stops. If longer, it stops when timer stops.
                        // Let's assume play once.
                        audioRef.current.loop = false;
                    }
                })
                .catch(err => console.error(err))
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }

        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current = null;
            }
        };
    }, [spaceId, language]);

    // Update audio source if language changes and we have both
    useEffect(() => {
        if (meditationData && audioRef.current) {
            const url = language === 'en' && meditationData.audioUrlEn ? meditationData.audioUrlEn : meditationData.audioUrl;
            if (audioRef.current.src !== new URL(url, window.location.origin).href && audioRef.current.src !== url) {
                const wasPlaying = !audioRef.current.paused;
                audioRef.current.src = url;
                if (wasPlaying) audioRef.current.play();
            }
        }
    }, [language, meditationData]);

    useEffect(() => {
        let interval: number;
        if (timerState === 'playing' && timeLeft > 0) {
            interval = window.setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        handleStop();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [timerState, timeLeft]);

    const handlePlay = () => {
        if (!meditationData || !audioRef.current) return;

        if (timerState === 'idle' || timerState === 'stopped') {
            // If starting fresh
            if (timeLeft === 0) setTimeLeft(meditationData.duration);
            audioRef.current.currentTime = 0;
        }

        audioRef.current.play().catch(e => console.error("Audio play failed", e));
        setTimerState('playing');
    };

    const handlePause = () => {
        audioRef.current?.pause();
        setTimerState('paused');
    };

    const handleStop = () => {
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }
        setTimeLeft(meditationData?.duration || 0); // User requested: "quay lại số 0" -> No, "quay lại số 0" means 00:00? Or reset to start? 
        // User said: "khi nhân stop thì quay lại số 0 và nhấn play thì bắt đầu lại"
        // Usually "reset to 0" might mean "reset to initial duration" or "reset to 00:00". 
        // Context: "nhấn play thì bắt đầu lại" implies resetting to start duration so it can start again.
        // Wait, "quay lại số 0" literally means returning to 0. But if I play again, it starts from beginning.
        // If I set timeLeft to 0, then play button needs to check if it's 0 and set it to duration.
        // Let's set it to 0 as requested, and handlePlay will reset it to duration.
        setTimeLeft(0);
        setTimerState('stopped');
    };

    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${String(minutes).padStart(2, '0')} : ${String(remainingSeconds).padStart(2, '0')}`;
    };

    const getStatusText = () => {
        if (timeLeft === 0 && timerState === 'stopped') return t.statusReady; // Or 'Stopped'
        if (timeLeft === 0 && timerState !== 'idle') return t.statusFinished;
        if (timerState === 'playing') return t.statusRunning;
        if (timerState === 'paused') return t.pauseButton;
        return t.statusReady;
    }

    const titleDisplay = language === 'en' && meditationData?.titleEn ? meditationData.titleEn : meditationData?.title || t.title;
    const descDisplay = language === 'en' && meditationData?.descriptionEn ? meditationData.descriptionEn : meditationData?.description;

    if (loading) return <div className="flex justify-center items-center h-full">{t.loading}</div>;

    if (!meditationData && !loading) return <div className="flex justify-center items-center h-full text-center px-4">{t.noMeditation}</div>;

    return (
        <div className="flex flex-col items-center justify-center h-full text-center p-4 bg-background-main text-text-main">
            <div className="timer-display-container w-full max-w-xs md:max-w-md lg:max-w-lg">
                <h3 className="text-xl font-bold mb-2">{titleDisplay}</h3>
                {descDisplay && <p className="text-sm text-text-light mb-4 line-clamp-3">{descDisplay}</p>}

                <span className="timer-label">{t.title}</span><br />
                <span className="timer-time">{formatTime(timeLeft)}</span><br />
                <span className="timer-status">{getStatusText()}</span>
            </div>
            <div className="flex items-center gap-4 mt-8">
                {timerState === 'playing' ? (
                    <button onClick={handlePause} className="timer-btn-start flex flex-row items-center gap-2">
                        <PauseIcon className="w-5 h-5" />
                        <span>{t.pauseButton}</span>
                    </button>
                ) : (
                    <button onClick={handlePlay} className="timer-btn-start flex flex-row items-center gap-2">
                        <PlayIcon className="w-5 h-5" />
                        <span>{t.startButton}</span>
                    </button>
                )}

                <button onClick={handleStop} className="timer-btn-reset flex flex-row items-center gap-2" title={t.stopButton}>
                    <StopIcon className="w-5 h-5" />
                    <span>{t.stopButton}</span>
                </button>
            </div>
        </div>
    );
};