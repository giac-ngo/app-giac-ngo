// client/src/components/LibraryView.tsx
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { apiService } from '../services/apiService';
import { Link } from 'react-router-dom';
import { Document } from '../types';
import { SearchIcon, BookOpenIcon, EyeIcon, ThumbsUpIcon, SpinnerIcon } from './Icons';

interface LibraryFilters {
    typeId?: number;
    authorId?: number;
    topicId?: number;
    search?: string;
}

interface LibraryViewProps {
    filters: LibraryFilters;
    onFiltersChange: (filters: LibraryFilters) => void;
    language: 'vi' | 'en';
    spaceId?: number | null;
    spaceSlug?: string | null;
}

const translations = {
    vi: {
        searchPlaceholder: 'Tìm kiếm kinh sách, kệ, câu chuyện...',
        noResults: 'Không tìm thấy tài liệu nào.',
        loading: 'Đang tải tài liệu...',
        by: 'Bởi',
        loadMore: 'Tải thêm',
        loadingMore: 'Đang tải...',
    },
    en: {
        searchPlaceholder: 'Search for scriptures, verses, stories...',
        noResults: 'No documents found.',
        loading: 'Loading documents...',
        by: 'By',
        loadMore: 'Load More',
        loadingMore: 'Loading...',
    }
};

const DocumentCardSkeleton = () => (
    <div className="doc-card skeleton-card">
        <div className="skeleton skeleton-doc-thumb"></div>
        <div className="doc-card-content">
            <div className="skeleton skeleton-title small"></div>
            <div className="skeleton skeleton-text short"></div>
        </div>
    </div>
);

const PAGE_SIZE = 6;

export const LibraryView: React.FC<LibraryViewProps> = ({ filters, onFiltersChange, language, spaceId, spaceSlug }) => {
    const t = translations[language];
    const [documents, setDocuments] = useState<Document[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [searchTerm, setSearchTerm] = useState(filters.search || '');
    const debounceTimeoutRef = useRef<number | null>(null);

    const fetchDocuments = useCallback(async (pageNum: number, currentFilters: LibraryFilters, currentSpaceId: number | null | undefined, currentSpaceSlug: string | null | undefined, abortSignal: AbortSignal) => {
        if (pageNum === 1) {
            setIsLoading(true);
        } else {
            setIsLoadingMore(true);
        }

        try {
            const { data, total } = await apiService.getLibraryDocuments({
                ...currentFilters,
                spaceId: typeof currentSpaceId === 'number' ? currentSpaceId : undefined,
                spaceSlug: currentSpaceSlug || undefined,
                page: pageNum,
                limit: PAGE_SIZE,
                signal: abortSignal
            });

            if (abortSignal.aborted) return;

            setDocuments(prev => pageNum === 1 ? data : [...prev, ...data]);
            setHasMore((pageNum * PAGE_SIZE) < total);
            setPage(pageNum);

        } catch (err: any) {
            if (err.name !== 'AbortError') {
                console.error('Failed to load documents:', err);
            }
        } finally {
            if (!abortSignal.aborted) {
                if (pageNum === 1) {
                    setIsLoading(false);
                } else {
                    setIsLoadingMore(false);
                }
            }
        }
    }, []);

    useEffect(() => {
        const controller = new AbortController();
        setPage(1);

        // Only fetch if spaceId is resolved (not null/undefined)
        if (typeof spaceId === 'number' || spaceSlug) {
            setDocuments([]);
            setHasMore(true);
            fetchDocuments(1, filters, spaceId, spaceSlug, controller.signal);
        } else {
            // If spaceId is null and no spaceSlug, show empty state
            setDocuments([]);
            setHasMore(false);
            setIsLoading(false);
        }

        return () => controller.abort();
    }, [filters, spaceId, spaceSlug, fetchDocuments]);

    const handleLoadMore = () => {
        if (!isLoading && !isLoadingMore && hasMore) {
            const controller = new AbortController();
            fetchDocuments(page + 1, filters, spaceId, spaceSlug, controller.signal);
        }
    };

    useEffect(() => {
        setSearchTerm(filters.search || '');
    }, [filters.search]);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newSearchTerm = e.target.value;
        setSearchTerm(newSearchTerm);

        if (debounceTimeoutRef.current) {
            clearTimeout(debounceTimeoutRef.current);
        }

        debounceTimeoutRef.current = window.setTimeout(() => {
            onFiltersChange({ ...filters, search: newSearchTerm });
        }, 500);
    };

    useEffect(() => {
        return () => {
            if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);
        };
    }, []);

    return (
        <div className="library-view-container">
            <div className="library-search-bar">
                <SearchIcon className="search-icon" />
                <input
                    type="text"
                    placeholder={t.searchPlaceholder}
                    value={searchTerm}
                    onChange={handleSearchChange}
                />
            </div>

            <div className="library-grid">
                {isLoading ? (
                    Array.from({ length: 6 }).map((_, i) => <DocumentCardSkeleton key={i} />)
                ) : documents.length === 0 ? (
                    <div className="no-results-message">{t.noResults}</div>
                ) : (
                    documents.map(doc => (
                        <Link to={`/${spaceSlug || doc.spaceSlug || 'giac-ngo'}/library/${doc.id}`} key={doc.id} className="doc-card" onClick={() => {
                            sessionStorage.setItem('libraryFilters', JSON.stringify(filters));
                        }}>
                            <div className="doc-card-thumb">
                                {doc.thumbnailUrl && doc.thumbnailUrl !== '' ? <img src={doc.thumbnailUrl} alt={doc.title} loading="lazy" /> : <BookOpenIcon />}
                            </div>
                            <div className="doc-card-content">
                                <span className="doc-card-type">{language === 'en' && doc.typeEn ? doc.typeEn : doc.type}</span>
                                <h3 className="doc-card-title">{language === 'en' && doc.titleEn ? doc.titleEn : doc.title}</h3>
                                <p className="doc-card-summary">
                                    {language === 'en' && doc.summaryEn ? doc.summaryEn : (doc.summary || '')}
                                </p>
                                <i><p className="doc-card-author">{t.by} {language === 'en' && doc.authorEn ? doc.authorEn : doc.author}</p></i>
                                <div className="doc-card-stats">
                                    <span><EyeIcon className="w-4 h-4" /> {doc.views || 0}</span>
                                    <span><ThumbsUpIcon className="w-4 h-4" /> {doc.likes || 0}</span>
                                </div>
                            </div>
                        </Link>
                    ))
                )}
            </div>

            {!isLoading && hasMore && (
                <div className="library-load-more">
                    <button
                        className="btn-load-more"
                        onClick={handleLoadMore}
                        disabled={isLoadingMore}
                    >
                        {isLoadingMore ? (
                            <>
                                <SpinnerIcon className="w-5 h-5 animate-spin" />
                                {t.loadingMore}
                            </>
                        ) : (
                            t.loadMore
                        )}
                    </button>
                </div>
            )}
        </div>
    );
};