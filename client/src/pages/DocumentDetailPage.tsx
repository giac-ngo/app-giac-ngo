// client/src/pages/DocumentDetailPage.tsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { apiService } from '../services/apiService';
import { Document, User } from '../types';
import { useToast } from '../components/ToastProvider';
import { ChevronLeftIcon, UserIcon, CalendarIcon, EyeIcon, ThumbsUpIcon, ChevronRightIcon } from '../components/Icons';

const translations = {
    vi: {
        backToList: 'Quay lại Thư viện',
        loading: 'Đang tải...',
        notFound: 'Không tìm thấy tài liệu.',
        loadError: 'Không thể tải dữ liệu.',
        author: 'Tác giả',
        createdAt: 'Ngày tạo',
        views: 'Lượt xem',
        likes: 'Yêu thích',
        likeSuccess: 'Cảm ơn bạn đã yêu thích!',
        likeError: 'Yêu thích thất bại.',
        loginToLike: 'Vui lòng đăng nhập để yêu thích.',
        prevStory: 'Câu chuyện trước',
        nextStory: 'Câu chuyện tiếp theo',
        prevVerse: 'Kệ trước',
        nextVerse: 'Kệ tiếp theo',
        audioVi: 'Âm thanh (VI)',
        audioEn: 'Audio (EN)',
    },
    en: {
        backToList: 'Back to Library',
        loading: 'Loading...',
        notFound: 'Document not found.',
        loadError: 'Could not load data.',
        author: 'Author',
        createdAt: 'Created At',
        views: 'Views',
        likes: 'Likes',
        likeSuccess: 'Thank you for your like!',
        likeError: 'Failed to like.',
        loginToLike: 'Please log in to like.',
        prevStory: 'Previous Story',
        nextStory: 'Next Story',
        prevVerse: 'Previous Verse',
        nextVerse: 'Next Verse',
        audioVi: 'Audio (VI)',
        audioEn: 'Audio (EN)',
    }
};

interface DocumentDetailPageProps {
    user: User | null;
}

const DocumentDetailPage: React.FC<DocumentDetailPageProps> = ({ user }) => {
    const language: 'vi' | 'en' = (localStorage.getItem('language') as 'vi' | 'en') || 'vi';
    const t = translations[language];
    const { id, spaceSlug } = useParams<{ id: string; spaceSlug?: string }>();
    const { showToast } = useToast();

    const [document, setDocument] = useState<Document | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [likes, setLikes] = useState(0);
    const [isLiking, setIsLiking] = useState(false);

    useEffect(() => {
        if (!id) return;
        setIsLoading(true);
        // Scroll to top when new document ID is loaded
        window.scrollTo(0, 0);
        apiService.getDocumentDetail(Number(id))
            .then(data => {
                setDocument(data);
                setLikes(data.likes || 0);
            })
            .catch(err => {
                showToast(t.loadError, 'error');
                console.error(err);
            })
            .finally(() => setIsLoading(false));
    }, [id, showToast, t.loadError]);

    const handleLike = async () => {
        if (!user) {
            showToast(t.loginToLike, 'error');
            return;
        }
        if (isLiking || !document || typeof document.id !== 'number') return;

        setIsLiking(true);
        try {
            const response = await apiService.likeDocument(document.id);
            setLikes(response.likes);
            showToast(t.likeSuccess, 'success');
        } catch (error) {
            showToast(t.likeError, 'error');
        } finally {
            setIsLiking(false);
        }
    };


    if (isLoading) return <div className="loading-container">{t.loading}</div>;
    if (!document) return <div className="loading-container">{t.notFound}</div>;
    
    const title = language === 'en' && document.titleEn ? document.titleEn : document.title;
    const content = language === 'en' && document.contentEn ? document.contentEn : document.content;

    const prevLabel = document.type === 'Kệ' ? t.prevVerse : t.prevStory;
    const nextLabel = document.type === 'Kệ' ? t.nextVerse : t.nextStory;
    const prevTitle = language === 'en' && document.prevTitleEn ? document.prevTitleEn : document.prevTitle;
    const nextTitle = language === 'en' && document.nextTitleEn ? document.nextTitleEn : document.nextTitle;
    
    const effectiveSpaceSlug = spaceSlug || document.spaceSlug || 'giac-ngo';

    return (
        <div className="document-detail-page">
            <div className="document-detail-container">
                <Link to={`/${effectiveSpaceSlug}/library`} className="back-link">
                    <ChevronLeftIcon className="w-5 h-5"/> {t.backToList}
                </Link>
                
                <article className="document-content-card">
                    {document.thumbnailUrl && <img src={document.thumbnailUrl} alt={title} className="document-thumbnail" />}
                    <h1 className="document-title">{title}</h1>
                    <div className="document-meta">
                        <span><UserIcon className="w-5 h-5" /> {t.author}: {language === 'en' && document.authorEn ? document.authorEn : document.author}</span>
                        <span><CalendarIcon className="w-5 h-5" /> {t.createdAt}: {new Date(document.createdAt).toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-US')}</span>
                        <span><EyeIcon className="w-5 h-5" /> {document.views || 0} {t.views}</span>
                        <button onClick={handleLike} disabled={isLiking} className="like-button">
                            <ThumbsUpIcon className="w-5 h-5" /> {likes} {t.likes}
                        </button>
                    </div>

                    {(document.audioUrl || document.audioUrlEn) && (
                        <div className="document-audio-player">
                            {document.audioUrl && (
                                <div className="audio-control">
                                    <label>{t.audioVi}</label>
                                    <audio controls src={document.audioUrl} />
                                </div>
                            )}
                            {document.audioUrlEn && (
                                <div className="audio-control">
                                    <label>{t.audioEn}</label>
                                    <audio controls src={document.audioUrlEn} />
                                </div>
                            )}
                        </div>
                    )}

                    <div className="document-body prose" dangerouslySetInnerHTML={{ __html: content || '' }} />
                </article>

                {(document.prevId || document.nextId) && (
                    <nav className="document-navigation">
                        {document.prevId && prevTitle ? (
                            <Link to={`/${effectiveSpaceSlug}/library/${document.prevId}`} className="nav-link prev">
                                <ChevronLeftIcon className="w-6 h-6 nav-arrow" />
                                <div className="nav-text">
                                    <span className="nav-label">{prevLabel}</span>
                                    <span className="nav-title">{prevTitle}</span>
                                </div>
                            </Link>
                        ) : <div />}
                        {document.nextId && nextTitle ? (
                            <Link to={`/${effectiveSpaceSlug}/library/${document.nextId}`} className="nav-link next">
                                <div className="nav-text">
                                    <span className="nav-label">{nextLabel}</span>
                                    <span className="nav-title">{nextTitle}</span>
                                </div>
                                <ChevronRightIcon className="w-6 h-6 nav-arrow" />
                            </Link>
                        ) : <div />}
                    </nav>
                )}
            </div>
        </div>
    );
};

export default DocumentDetailPage;