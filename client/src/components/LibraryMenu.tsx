// client/src/components/LibraryMenu.tsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { apiService } from '../services/apiService';
import { SpinnerIcon } from './Icons';

interface LibraryFilters {
    typeId?: number;
    authorId?: number;
    topicId?: number;
    search?: string;
}

interface LibraryMenuProps {
    filters: LibraryFilters;
    onSetFilters: React.Dispatch<React.SetStateAction<LibraryFilters>>;
    language: 'vi' | 'en';
    isSidebarCollapsed: boolean;
    spaceId?: number | 'new' | null;
}

const translations = {
    vi: {
        loading: 'Đang tải...',
        all: 'Tất cả',
    },
    en: {
        loading: 'Loading...',
        all: 'All',
    }
};

const TOPICS_PER_PAGE = 15;

export const LibraryMenu: React.FC<LibraryMenuProps> = ({ filters, onSetFilters, language, isSidebarCollapsed, spaceId }) => {
    const t = translations[language];
    const [types, setTypes] = useState<{ id: number, name: string, nameEn?: string }[]>([]);
    const [authors, setAuthors] = useState<{ id: number, name: string, nameEn?: string }[]>([]);
    const [topics, setTopics] = useState<{ id: number, name: string, nameEn?: string }[]>([]);
    
    const [topicsPage, setTopicsPage] = useState(1);
    const [hasMoreTopics, setHasMoreTopics] = useState(true);

    const [isLoading, setIsLoading] = useState(true);
    const [isTopicLoading, setIsTopicLoading] = useState(false);
    
    const observer = useRef<IntersectionObserver>();
    const lastTopicElementRef = useCallback((node: HTMLButtonElement | null) => {
        if (isTopicLoading) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMoreTopics) {
                setTopicsPage(prevPage => prevPage + 1);
            }
        });
        if (node) observer.current.observe(node);
    }, [isTopicLoading, hasMoreTopics]);

    // Effect 1: Load independent filters (types, authors) when spaceId changes.
    useEffect(() => {
        setIsLoading(true);
        setTopics([]); // Reset topics
        setTopicsPage(1);
        setHasMoreTopics(true);
        const numericSpaceId = typeof spaceId === 'number' ? spaceId : undefined;
        
        apiService.getLibraryFilters(numericSpaceId)
            .then(data => {
                const fetchedTypes = data.types || [];
                const fetchedAuthors = data.authors || [];
                setTypes(fetchedTypes);
                setAuthors(fetchedAuthors);

                // If no type is selected, default to the first one
                if (fetchedTypes.length > 0 && !filters.typeId) {
                    onSetFilters(prev => ({ ...prev, typeId: fetchedTypes[0].id }));
                }
            })
            .catch(err => console.error("Failed to load initial filters:", err))
            .finally(() => setIsLoading(false));
    // FIX: Removed `filters` from dependency array to prevent re-fetching on filter selection.
    }, [spaceId, onSetFilters]); 

    // Effect 2: Load dependent filters (topics) when typeId or topicsPage changes.
    useEffect(() => {
        if (!filters.typeId) {
            setTopics([]);
            return;
        }

        setIsTopicLoading(true);
        const numericSpaceId = typeof spaceId === 'number' ? spaceId : undefined;
        apiService.getLibraryFilters(numericSpaceId, { typeId: filters.typeId, topicsPage, topicsLimit: TOPICS_PER_PAGE })
            .then(data => {
                const newTopics = data.topics || [];
                setHasMoreTopics(newTopics.length === TOPICS_PER_PAGE);
                setTopics(prev => topicsPage === 1 ? newTopics : [...prev, ...newTopics]);
            })
            .catch(err => console.error("Failed to load topics:", err))
            .finally(() => setIsTopicLoading(false));
    }, [spaceId, filters.typeId, topicsPage]);
    
    const handleTypeChange = (typeId: number) => {
        onSetFilters(prev => ({ ...prev, typeId, authorId: undefined, topicId: undefined }));
        setTopics([]);
        setTopicsPage(1);
        setHasMoreTopics(true);
    };
    
    const handleAuthorChange = (authorId: number | undefined) => {
        onSetFilters(prev => ({ ...prev, authorId, topicId: undefined }));
    }
    
    const handleTopicChange = (topicId: number | undefined) => {
        onSetFilters(prev => ({ ...prev, topicId }));
    }
    
    if (isSidebarCollapsed) {
        return null;
    }

    if (isLoading) {
        return <div className="p-4 text-center text-sm">{t.loading}</div>;
    }
    
    const activeTypeId = filters.typeId || types[0]?.id;

    return (
        <div className="library-menu">
            {types.length > 0 && (
                <div className="library-menu-toggles">
                {types.map(type => (
                        <button
                            key={type.id}
                            onClick={() => handleTypeChange(type.id)}
                            className={activeTypeId === type.id ? 'active' : ''}
                        >
                            {language === 'en' && type.nameEn ? type.nameEn : type.name}
                        </button>
                    ))}
                </div>
            )}

            {authors.length > 0 && (
                <div className="library-menu-section">
                    <div className="library-menu-toggles">
                        <button
                            onClick={() => handleAuthorChange(undefined)}
                            className={!filters.authorId ? 'active' : ''}
                        >
                            {t.all}
                        </button>
                        {authors.map(author => (
                             <button
                                key={author.id}
                                onClick={() => handleAuthorChange(author.id)}
                                className={filters.authorId === author.id ? 'active' : ''}
                            >
                                {language === 'en' && author.nameEn ? author.nameEn : author.name}
                            </button>
                        ))}
                    </div>
                </div>
            )}
            
            <div className="library-menu-section">
                <div className="library-topic-list">
                    {/* All topics button */}
                     <button
                        onClick={() => handleTopicChange(undefined)}
                        className={!filters.topicId ? 'active' : ''}
                    >
                        {t.all}
                    </button>
                    {topics.map((topic, index) => {
                        const isLastElement = topics.length === index + 1;
                        return (
                            <button
                                ref={isLastElement ? lastTopicElementRef : null}
                                key={topic.id}
                                onClick={() => handleTopicChange(topic.id)}
                                className={filters.topicId === topic.id ? 'active' : ''}
                            >
                                {language === 'en' && topic.nameEn ? topic.nameEn : topic.name}
                            </button>
                        );
                    })}
                    {isTopicLoading && topics.length > 0 && (
                        <div className="py-4 flex justify-center w-full">
                            <SpinnerIcon className="w-6 h-6 text-primary" />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};