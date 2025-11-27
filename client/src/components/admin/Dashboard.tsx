// client/src/components/admin/Dashboard.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { DashboardStats } from '../../types';
import { apiService } from '../../services/apiService';
import { UserIcon, AiIcon, ConversationIcon, ThumbsUpIcon, ThumbsDownIcon, BookOpenIcon, MapPinIcon, SpeakerWaveIcon, EyeIcon } from '../Icons';

const translations = {
    vi: {
        title: 'Tổng quan',
        loading: 'Đang tải dữ liệu...',
        error: 'Không thể tải dữ liệu tổng quan.',
        totalUsers: 'Tổng số người dùng',
        totalAIs: 'Tổng số AI',
        totalConversations: 'Tổng số hội thoại',
        interactingUsers: 'Người dùng tương tác',
        topAIs: 'AI được sử dụng nhiều nhất',
        recentConversations: 'Các cuộc hội thoại gần đây',
        conversations: 'hội thoại',
        user: 'Người dùng',
        ai: 'AI',
        time: 'Thời gian',
        totalDocuments: 'Tổng số Tài liệu',
        totalSpaces: 'Tổng số Không gian',
        totalDharmaTalks: 'Tổng số Pháp thoại',
        topDocuments: 'Tài liệu được xem nhiều nhất',
        topSpaces: 'Không gian nổi bật nhất',
        topDharmaTalks: 'Pháp thoại được nghe nhiều nhất',
        views: 'lượt xem',
        likes: 'lượt thích',
        members: 'thành viên',
    },
    en: {
        title: 'Dashboard',
        loading: 'Loading data...',
        error: 'Could not load dashboard data.',
        totalUsers: 'Total Users',
        totalAIs: 'Total AIs',
        totalConversations: 'Total Conversations',
        interactingUsers: 'Interacting Users',
        topAIs: 'Most Used AIs',
        recentConversations: 'Recent Conversations',
        conversations: 'conversations',
        user: 'User',
        ai: 'AI',
        time: 'Time',
        totalDocuments: 'Total Documents',
        totalSpaces: 'Total Spaces',
        totalDharmaTalks: 'Total Dharma Talks',
        topDocuments: 'Most Viewed Documents',
        topSpaces: 'Top Spaces',
        topDharmaTalks: 'Most Listened Dharma Talks',
        views: 'views',
        likes: 'likes',
        members: 'members',
    }
};

const StatCard: React.FC<{ icon: React.ReactNode; title: string; value: number | string, color: string }> = ({ icon, title, value, color }) => (
    <div className="bg-background-panel p-6 rounded-lg shadow-sm flex items-start space-x-4">
        <div className={`flex-shrink-0 w-12 h-12 flex items-center justify-center rounded-full ${color}`}>
            {icon}
        </div>
        <div>
            <p className="text-sm font-medium text-text-light">{title}</p>
            <p className="text-3xl font-bold text-text-main">{value}</p>
        </div>
    </div>
);


export const Dashboard: React.FC<{ language: 'vi' | 'en' }> = ({ language }) => {
    const t = translations[language];
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await apiService.getDashboardStats();
                setStats(data);
            } catch (err) {
                setError(t.error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchStats();
    }, [language, t.error]);

    if (isLoading) {
        return <div className="p-8 text-center">{t.loading}</div>;
    }

    if (error) {
        return <div className="p-8 text-center text-accent-red">{error}</div>;
    }

    if (!stats) {
        return null;
    }
    
    const maxConversationCount = Math.max(...stats.topAIs.map(ai => parseInt(ai.conversationCount, 10)), 1);
    const maxDocViews = Math.max(...stats.topDocuments.map(doc => doc.views), 1);
    const maxSpaceMembers = Math.max(...stats.topSpaces.map(space => space.membersCount), 1);
    const maxTalkViews = Math.max(...stats.topDharmaTalks.map(talk => talk.views), 1);


    return (
        <div className="p-8 space-y-8">
            <h1 className="text-3xl font-bold text-text-main">{t.title}</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard icon={<UserIcon className="w-6 h-6 text-blue-800" />} title={t.totalUsers} value={stats.totalUsers} color="bg-blue-100" />
                <StatCard icon={<AiIcon className="w-6 h-6 text-purple-800" />} title={t.totalAIs} value={stats.totalAiConfigs} color="bg-purple-100" />
                <StatCard icon={<ConversationIcon className="w-6 h-6 text-green-800" />} title={t.totalConversations} value={stats.totalConversations} color="bg-green-100" />
                <StatCard icon={<UserIcon className="w-6 h-6 text-yellow-800" />} title={t.interactingUsers} value={stats.interactingUsers} color="bg-yellow-100" />
            </div>
            
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard icon={<BookOpenIcon className="w-6 h-6 text-cyan-800" />} title={t.totalDocuments} value={stats.totalDocuments} color="bg-cyan-100" />
                <StatCard icon={<MapPinIcon className="w-6 h-6 text-fuchsia-800" />} title={t.totalSpaces} value={stats.totalSpaces} color="bg-fuchsia-100" />
                <StatCard icon={<SpeakerWaveIcon className="w-6 h-6 text-orange-800" />} title={t.totalDharmaTalks} value={stats.totalDharmaTalks} color="bg-orange-100" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="bg-background-panel p-6 rounded-lg shadow-sm">
                    <h2 className="text-xl font-semibold mb-4 text-text-main">{t.topAIs}</h2>
                    <div className="space-y-4">
                        {stats.topAIs.map((ai, index) => (
                            <div key={index} className="flex items-center space-x-3">
                                <img src={ai.avatarUrl || `https://i.pravatar.cc/150?u=${ai.name}`} alt={ai.name} className="w-10 h-10 rounded-full" />
                                <div className="flex-1">
                                    <div className="flex justify-between items-center text-sm">
                                        <p className="font-medium">{ai.name}</p>
                                        <div className="flex items-center space-x-4">
                                            <div className="flex items-center text-green-600" title="Likes">
                                                <ThumbsUpIcon className="w-4 h-4 mr-1" />
                                                <span>{ai.totalLikes || 0}</span>
                                            </div>
                                            <div className="flex items-center text-red-600" title="Dislikes">
                                                <ThumbsDownIcon className="w-4 h-4 mr-1" />
                                                <span>{ai.totalDislikes || 0}</span>
                                            </div>
                                            <p className="text-text-light">{`${ai.conversationCount} ${t.conversations}`}</p>
                                        </div>
                                    </div>
                                    <div className="w-full bg-background-light rounded-full h-2.5 mt-1">
                                        <div 
                                            className="bg-primary h-2.5 rounded-full" 
                                            style={{ width: `${(parseInt(ai.conversationCount, 10) / maxConversationCount) * 100}%` }}
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-background-panel p-6 rounded-lg shadow-sm">
                    <h2 className="text-xl font-semibold mb-4 text-text-main">{t.topDocuments}</h2>
                    <div className="space-y-4">
                        {stats.topDocuments.map((doc, index) => (
                             <Link to={`/library/${doc.id}`} key={index} className="flex items-center space-x-3 group">
                                <img src={doc.thumbnailUrl || '/themes/giacngo/logo.svg'} alt={language === 'en' ? doc.titleEn : doc.title} className="w-10 h-10 rounded-md object-cover" />
                                <div className="flex-1">
                                     <div className="flex justify-between items-center text-sm">
                                        <p className="font-medium group-hover:text-primary transition-colors">{language === 'en' ? doc.titleEn : doc.title}</p>
                                         <div className="flex items-center space-x-2 text-text-light">
                                            <div className="flex items-center" title={t.views}><EyeIcon className="w-4 h-4 mr-1" /><span>{doc.views || 0}</span></div>
                                            <div className="flex items-center" title={t.likes}><ThumbsUpIcon className="w-4 h-4 mr-1" /><span>{doc.likes || 0}</span></div>
                                        </div>
                                    </div>
                                    <div className="w-full bg-background-light rounded-full h-2.5 mt-1">
                                        <div className="bg-cyan-500 h-2.5 rounded-full" style={{ width: `${(doc.views / maxDocViews) * 100}%` }}></div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>

                 <div className="bg-background-panel p-6 rounded-lg shadow-sm">
                    <h2 className="text-xl font-semibold mb-4 text-text-main">{t.topSpaces}</h2>
                    <div className="space-y-4">
                        {stats.topSpaces.map((space, index) => (
                             <Link to={`/spaces/${space.slug}`} key={index} className="flex items-center space-x-3 group">
                                <img src={space.imageUrl || '/themes/giacngo/logo.svg'} alt={language === 'en' ? space.nameEn : space.name} className="w-10 h-10 rounded-md object-cover" />
                                <div className="flex-1">
                                     <div className="flex justify-between items-center text-sm">
                                        <p className="font-medium group-hover:text-primary transition-colors">{language === 'en' ? space.nameEn : space.name}</p>
                                         <div className="flex items-center space-x-2 text-text-light">
                                            <div className="flex items-center" title={t.members}><UserIcon className="w-4 h-4 mr-1" /><span>{space.membersCount || 0}</span></div>
                                            <div className="flex items-center" title={t.views}><EyeIcon className="w-4 h-4 mr-1" /><span>{space.views || 0}</span></div>
                                        </div>
                                    </div>
                                    <div className="w-full bg-background-light rounded-full h-2.5 mt-1">
                                        <div className="bg-fuchsia-500 h-2.5 rounded-full" style={{ width: `${(space.membersCount / maxSpaceMembers) * 100}%` }}></div>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-background-panel p-6 rounded-lg shadow-sm">
                    <h2 className="text-xl font-semibold mb-4 text-text-main">{t.topDharmaTalks}</h2>
                    <div className="space-y-4">
                        {stats.topDharmaTalks.map((talk, index) => (
                            <div key={index} className="flex items-center space-x-3">
                                <div className="w-10 h-10 rounded-md bg-orange-100 flex items-center justify-center">
                                    <SpeakerWaveIcon className="w-6 h-6 text-orange-600" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-center text-sm">
                                        <p className="font-medium">{language === 'en' ? talk.titleEn : talk.title}</p>
                                        <div className="flex items-center space-x-2 text-text-light">
                                            <div className="flex items-center" title={t.views}><EyeIcon className="w-4 h-4 mr-1" /><span>{talk.views || 0}</span></div>
                                            <div className="flex items-center" title={t.likes}><ThumbsUpIcon className="w-4 h-4 mr-1" /><span>{talk.likes || 0}</span></div>
                                        </div>
                                    </div>
                                    <div className="w-full bg-background-light rounded-full h-2.5 mt-1">
                                        <div className="bg-orange-500 h-2.5 rounded-full" style={{ width: `${(talk.views / maxTalkViews) * 100}%` }}></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-background-panel p-6 rounded-lg shadow-sm">
                    <h2 className="text-xl font-semibold mb-4 text-text-main">{t.recentConversations}</h2>
                    <ul className="divide-y divide-border-color">
                        {stats.recentConversations.map(conv => (
                            <li key={conv.id} className="py-3">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="font-medium text-sm">{conv.userName}</p>
                                        <p className="text-xs text-text-light">{t.ai}: {conv.aiName}</p>
                                    </div>
                                    <p className="text-xs text-text-light">{new Date(conv.startTime).toLocaleString(language)}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};