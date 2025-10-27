import React, { useState, useEffect, useRef } from 'react';
import { PlayIcon, PauseIcon, ResetIcon } from './Icons';

const translations = {
    vi: {
        title: 'Tĩnh tâm còn lại:',
        statusReady: 'Sẵn sàng',
        statusRunning: 'Đang thiền',
        statusFinished: 'Hoàn thành',
        startButton: 'Bắt đầu',
        pauseButton: 'Tạm dừng',
        resetButton: 'Reset',
    },
    en: {
        title: 'Meditation time remaining:',
        statusReady: 'Ready',
        statusRunning: 'Meditating',
        statusFinished: 'Finished',
        startButton: 'Start',
        pauseButton: 'Pause',
        resetButton: 'Reset',
    }
};

const INITIAL_TIME = 30 * 60; // 30 minutes

export const MeditationTimer: React.FC<{ language?: 'vi' | 'en' }> = ({ language = 'vi' }) => {
    const t = translations[language];
    const [timeLeft, setTimeLeft] = useState(INITIAL_TIME);
    const [isActive, setIsActive] = useState(false);
    const intervalRef = useRef<number | null>(null);

    useEffect(() => {
        if (isActive) {
            intervalRef.current = window.setInterval(() => {
                setTimeLeft((prevTime) => {
                    if (prevTime > 0) {
                        return prevTime - 1;
                    } else {
                        setIsActive(false);
                        return 0;
                    }
                });
            }, 1000);
        } else {
            if (intervalRef.current) {
                window.clearInterval(intervalRef.current);
            }
        }

        return () => {
            if (intervalRef.current) {
                window.clearInterval(intervalRef.current);
            }
        };
    }, [isActive]);

    const handleStartPause = () => {
        if (timeLeft === 0 && !isActive) {
            handleReset();
            setTimeout(() => setIsActive(true), 100);
        } else {
            setIsActive(!isActive);
        }
    };

    const handleReset = () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }
        setIsActive(false);
        setTimeLeft(INITIAL_TIME);
    };

    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${String(minutes).padStart(2, '0')} : ${String(remainingSeconds).padStart(2, '0')}`;
    };
    
    const getStatusText = () => {
        if (timeLeft === 0 && !isActive) return t.statusFinished;
        if (isActive) return t.statusRunning;
        return t.statusReady;
    }

    return (
        <div className="flex flex-col items-center justify-center h-full text-center p-4 bg-background-main text-text-main">
            <div className="timer-display-container">
                <span className="timer-label">{t.title}</span>
                <span className="timer-time">{formatTime(timeLeft)}</span>
                <span className="timer-status">{getStatusText()}</span>
            </div>
            <div className="flex items-center gap-4 mt-8">
                <button onClick={handleStartPause} className="timer-btn-start">
                    {isActive ? <PauseIcon className="w-5 h-5" /> : <PlayIcon className="w-5 h-5" />}
                    <span>{isActive ? t.pauseButton : t.startButton}</span>
                </button>
                <button onClick={handleReset} className="timer-btn-reset">
                    <ResetIcon className="w-5 h-5" />
                    <span>{t.resetButton}</span>
                </button>
            </div>
        </div>
    );
};