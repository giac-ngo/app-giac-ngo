// client/src/components/DharmaTalksTab.tsx
import React from 'react';
import { DharmaTalk } from '../types';
import { PlayIcon, ClockIcon } from './Icons';

interface DharmaTalksTabProps {
    talks: DharmaTalk[];
    isLoading: boolean;
    spaceName: string;
    language: 'vi' | 'en';
    translations: any; // Simplified for this component
}

const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
};

export const DharmaTalksTab: React.FC<DharmaTalksTabProps> = ({ talks, isLoading, spaceName, language, translations: t }) => {
    if (isLoading) {
        return <div className="tab-content coming-soon">{t.loading}</div>;
    }

    return (
        <div className="tab-content dharma-talks-content">
            <h2>{t.dharmaTalksTitle.replace('{name}', spaceName)}</h2>
            {talks.length === 0 ? (
                <p className="text-center text-text-light py-8">{t.noTalks}</p>
            ) : (
                <div className="dharma-talk-list">
                    {talks.map(talk => (
                        <div key={talk.id} className="dharma-talk-card">
                            <div className="talk-info">
                                <h3 className="talk-title">{talk.title}</h3>
                                <div className="talk-meta">
                                    <span><strong>{t.speaker}:</strong> {talk.speaker}</span>
                                    {talk.date && <span><strong>{t.date}:</strong> {new Date(talk.date).toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-US')}</span>}
                                    {talk.duration && <span className="flex items-center gap-1"><ClockIcon className="w-4 h-4" /> {formatDuration(talk.duration)}</span>}
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