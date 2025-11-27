// client/src/pages/SpaceDetailPage.tsx
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { apiService } from './client/src/services/apiService';
import { Space, User, AIConfig } from './client/src/types';
import { useToast } from './client/src/components/ToastProvider';
import { MapPinIcon, UsersIcon, StarIcon, ChevronLeftIcon, InfoIcon, BookOpenIcon, CalendarIcon, AiIcon, SpeakerWaveIcon, CryptoIcon } from './client/src/components/Icons';

const translations = {
    vi: {
        backToList: 'Quay lại',
        members: 'thành viên',
        loading: 'Đang tải...',
        notFound: 'Không tìm thấy không gian này.',
        loadError: 'Không thể tải dữ liệu không gian.',
        contact: 'Liên hệ',
        joinCommunity: 'Tham gia cộng đồng',
        // Tabs
        tabInfo: 'Giới thiệu',
        tabDharma: 'Pháp Thoại',
        tabSchedule: 'Lịch',
        tabLibrary: 'Thư viện',
        tabAgents: 'AI Agents',
        tabOffering: 'Cúng dường',
        // Tab Content
        about: 'Về',
        details: 'Thông tin chi tiết',
        rank: 'Xếp hạng',
        type: 'Loại hình',
        rating: 'Đánh giá',
        comingSoon: 'Nội dung cho mục này sẽ được cập nhật sớm.',
        libraryLinkText: 'Khám phá các bài kệ và câu chuyện hay trong thư viện',
        // Offering Modal
        offeringTitle: 'Cúng dường cho {name}',
        offeringAmount: 'Số Merit cúng dường',
        yourBalance: 'Số dư của bạn: {balance} Merit',
        unlimitedBalance: 'Số dư của bạn: Không giới hạn',
        offeringButton: 'Cúng dường',
        offeringLoading: 'Đang xử lý...',
        offeringSuccess: 'Cúng dường thành công! Xin chân thành cảm ơn.',
        offeringError: 'Cúng dường thất bại: {message}',
        insufficientMerits: 'Bạn không đủ Merit để thực hiện cúng dường.',
        loginToOffer: 'Vui lòng đăng nhập để cúng dường.',
    },
    en: {
        backToList: 'Back',
        members: 'members',
        loading: 'Loading...',
        notFound: 'This space could not be found.',
        loadError: 'Could not load space data.',
        contact: 'Contact',
        joinCommunity: 'Join Community',
        // Tabs
        tabInfo: 'Introduction',
        tabDharma: 'Dharma Talk',
        tabSchedule: 'Schedule',
        tabLibrary: 'Library',
        tabAgents: 'AI Agents',
        tabOffering: 'Offering',
         // Tab Content
        about: 'About',
        details: 'Detailed Information',
        rank: 'Rank',
        type: 'Type',
        rating: 'Rating',
        comingSoon: 'Content for this section will be updated soon.',
        libraryLinkText: 'Explore interesting verses and stories in the library',
        // Offering Modal
        offeringTitle: 'Make an offering to {name}',
        offeringAmount: 'Merit amount to offer',
        yourBalance: 'Your balance: {balance} Merit',
        unlimitedBalance: 'Your balance: Unlimited',
        offeringButton: 'Offer',
        offeringLoading: 'Processing...',
        offeringSuccess: 'Offering successful! Thank you for your generosity.',
        offeringError: 'Offering failed: {message}',
        insufficientMerits: 'You do not have enough Merit for this offering.',
        loginToOffer: 'Please log in to make an offering.',
    }
};

interface OfferingModalProps {
    space: Space;
    user: User | null;
    onClose: () => void;
    onSuccess: (updatedUser: User) => void;
}

const OfferingModal: React.FC<OfferingModalProps> = ({ space, user, onClose, onSuccess }) => {
    const language = 'vi';
    const t = translations[language];
    const { showToast } = useToast();
    const [amount, setAmount] = useState<number | ''>('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async () => {
        if (!user) {
            showToast(t.loginToOffer, 'error');
            return;
        }
        if (!amount || amount <= 0) return;
        if (user.merits !== null && user.merits < amount) {
            showToast(t.insufficientMerits, 'error');
            return;
        }
        setIsLoading(true);
        try {
            const { updatedUser } = await apiService.makeOffering(space.id as number, amount, user.id as number);
            onSuccess(updatedUser);
            showToast(t.offeringSuccess, 'success');
            onClose();
        } catch (error: any) {
            showToast(t.offeringError.replace('{message}', error.message), 'error');
        } finally {
            setIsLoading(false);
        }
    };
    
    const balanceText = user 
        ? user.merits === null ? t.unlimitedBalance : t.yourBalance.replace('{balance}', user.merits.toLocaleString())
        : '';


    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4" onClick={onClose}>
            <div className="bg-background-panel rounded-lg shadow-xl w-full max-w-sm" onClick={e => e.stopPropagation()}>
                <h2 className="text-xl font-bold p-4 border-b">{t.offeringTitle.replace('{name}', space.name)}</h2>
                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium">{t.offeringAmount}</label>
                        <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
                            min="1"
                            className="mt-1 w-full p-2 border rounded"
                        />
                         {user && <p className="text-xs text-text-light mt-1">{balanceText}</p>}
                    </div>
                </div>
                <div className="p-4 border-t text-right">
                    <button
                        onClick={handleSubmit}
                        disabled={isLoading || !amount || !user}
                        className="px-6 py-2 bg-primary text-text-on-primary rounded-md font-semibold disabled:opacity-50"
                    >
                        {isLoading ? t.offeringLoading : t.offeringButton}
                    </button>
                </div>
            </div>
        </div>
    );
};

interface SpaceDetailPageProps {
    user: User | null;
    onUserUpdate: (updatedData: Partial<User>) => void;
}

export const SpaceDetailPage: React.FC<SpaceDetailPageProps> = ({ user, onUserUpdate }) => {
    const language = 'vi';
    const t = translations[language];
    const { slug } = useParams<{ slug: string }>();
    const { showToast } = useToast();
    const navigate = useNavigate();

    const [center, setCenter] = useState<Space | null>(null);
    const [aiAgents, setAiAgents] = useState<AIConfig[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('info');
    const [isOfferingModalOpen, setIsOfferingModalOpen] = useState(false);

    useEffect(() => {
        if (!slug) return;
        setIsLoading(true);
        apiService.getSpaceBySlug(slug)
            .then(data => {
                setCenter(data);
                if (data && typeof data.id === 'number') {
                    apiService.getAiConfigsBySpaceId(data.id)
                        .then(setAiAgents)
                        .catch(() => showToast('Failed to load AI Agents for this space.', 'error'));
                }
            })
            .catch(err => {
                showToast(t.loadError, 'error');
                console.error(err);
            })
            .finally(() => setIsLoading(false));
    }, [slug, showToast, t.loadError]);

    const handleSelectAi = (aiId: string | number) => {
        localStorage.setItem('lastSelectedAiId', String(aiId));
        navigate('/app');
    };

    const TabButton: React.FC<{id: string, label: string, icon: React.ReactNode}> = ({ id, label, icon }) => (
        <button onClick={() => setActiveTab(id)} className={`tab-btn ${activeTab === id ? 'active' : ''}`}>
          {icon}
          <span>{label}</span>
        </button>
    );

    const renderTabContent = () => {
        if (!center) return null;
        switch (activeTab) {
            case 'info':
                return (
                    <div className="tab-content">
                        <h2>{t.about} {center.name}</h2>
                        <p className="detail-description">{center.description}</p>
                        <h3>{t.details}</h3>
                        <div className="info-grid">
                            <div><div className="value rank-value">#{center.rank}</div><div className="label">{t.rank}</div></div>
                            <div><div className="value">{center.centerType}</div><div className="label">{t.type}</div></div>
                            <div><div className="value">{center.membersCount?.toLocaleString()}</div><div className="label">{t.members}</div></div>
                            <div><div className="value rating-value">{center.rating} / 5.0</div><div className="label">{t.rating}</div></div>
                        </div>
                    </div>
                );
            case 'agents':
                 return (
                    <div className="tab-content">
                        <h2>AI Agents at {center.name}</h2>
                        <div className="ai-agent-list">
                            {aiAgents.map(ai => (
                                <div key={ai.id} className="ai-agent-card" onClick={() => handleSelectAi(ai.id)}>
                                    <img src={ai.avatarUrl} alt={ai.name} />
                                    <div className="ai-agent-info">
                                        <h3>{ai.name}</h3>
                                        <p>{ai.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            case 'library':
                return (
                    <div className="tab-content coming-soon">
                         <Link to="/app" onClick={() => localStorage.setItem('initialViewMode', 'library')} className="library-link-text">
                            {t.libraryLinkText}
                        </Link>
                    </div>
                );
            case 'dharma':
            case 'schedule':
            default:
                return <div className="tab-content coming-soon">{t.comingSoon}</div>
        }
    };

    if (isLoading) return <div className="loading-container">{t.loading}</div>;
    if (!center) return <div className="loading-container">{t.notFound}</div>;

    return (
        <div className="space-detail-page">
            <div className="detail-card-container">
                <Link to="/" className="back-link"><ChevronLeftIcon className="w-5 h-5"/> {t.backToList}</Link>
                <div className="detail-card">
                    <div className="detail-image-container"><img src={center.imageUrl} alt={center.name} /></div>
                    <div className="detail-content">
                        <p className="detail-type">{center.centerType}</p>
                        <h1 className="detail-title">{center.name}</h1>
                        <div className="detail-meta">
                            <span><MapPinIcon className="w-5 h-5" />{center.locationText}</span>
                            <span><UsersIcon className="w-5 h-5" />{center.membersCount?.toLocaleString()} {t.members}</span>
                            <span><StarIcon className="w-5 h-5 text-yellow-400" />{center.rating}</span>
                        </div>
                         <div className="detail-tags">
                            {center.tags.map(tag => <span key={tag} className="tag">{tag}</span>)}
                        </div>
                         <div className="detail-actions">
                            <button className="join-btn">{t.joinCommunity}</button>
                            <button className="contact-btn">{t.contact}</button>
                        </div>
                    </div>
                     <div className="detail-tabs">
                        <TabButton id="info" label={t.tabInfo} icon={<InfoIcon className="w-5 h-5"/>}/>
                        <TabButton id="dharma" label={t.tabDharma} icon={<SpeakerWaveIcon className="w-5 h-5"/>}/>
                        <TabButton id="schedule" label={t.tabSchedule} icon={<CalendarIcon className="w-5 h-5"/>}/>
                        <TabButton id="library" label={t.tabLibrary} icon={<BookOpenIcon className="w-5 h-5"/>}/>
                        <TabButton id="agents" label={t.tabAgents} icon={<AiIcon className="w-5 h-5"/>}/>
                        <button onClick={() => setIsOfferingModalOpen(true)} className={`tab-btn offering-tab ${activeTab === 'offering' ? 'active' : ''}`}>
                            <CryptoIcon className="w-5 h-5"/>
                            <span>{t.tabOffering}</span>
                        </button>
                    </div>
                    {renderTabContent()}
                </div>
            </div>
            {isOfferingModalOpen && (
                <OfferingModal 
                    space={center} 
                    user={user} 
                    onClose={() => setIsOfferingModalOpen(false)} 
                    onSuccess={onUserUpdate} 
                />
            )}
        </div>
    );
};