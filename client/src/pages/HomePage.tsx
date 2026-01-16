// client/src/pages/HomePage.tsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AIConfig, User, Space, SystemConfig, DashboardStats, Document, OfferingPlan } from '../types';
import { apiService } from '../services/apiService';
import { useToast } from '../components/ToastProvider';
import { SearchIcon, StarIcon, UsersIcon, MapPinIcon, BuildingLibraryIcon, LandmarkIcon, MeditationIcon, ClockIcon, BellIcon, HeartIcon, WandIcon, SparkleIcon,  RadioIcon, XIcon, MicIcon, HandIcon, MessageCircleIcon, Share2Icon, EyeIcon } from '../components/Icons';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import SocialFeed from '../components/SocialFeed';
import { MeritPaymentModal } from '../components/MeritPaymentModal';


const translations = {
    vi: {
        awakening: 'Giác Ngộ',
        subtitle: 'Awakening Agentic Social Network',
        searchPlaceholder: 'Hỏi về Phật pháp, tu tập, và con đường giác ngộ...',
        aiChatButton: 'AI + Chat',
        suggested1: 'Giác Ngộ nghĩa là gì?',
        suggested2: 'Làm sao để thành Phật?',
        suggested3: 'Làm sao để thoát mọi khổ đau?',
        suggested4: 'Làm sao để tìm thấy hạnh phúc mãi mãi?',
        suggested5: 'Chánh niệm là gì?',
        suggested6: 'Nghiệp báo hoạt động ra sao?',
        agentsTitle: 'Agents từ Cộng Đồng',
        agentsSubtitle: 'Khám phá các AI Agent được phát triển bởi các chùa chiền, thiền viện và trung tâm tu tập khắp nơi',
        exploreAgent: 'Khám phá Agent',
        contactForAccess: 'Liên hệ',
        viewMore: 'Xem thêm',
        communityTitle: 'Không gian Cộng đồng',
        communitySubtitle: 'Kết nối với các chùa chiền, thiền viện, và trung tâm tu tập Phật giáo khắp nơi trên thế giới',
        communitySearchPlaceholder: 'Tìm kiếm cộng đồng, chùa, thiền viện...',
        all: 'Tất cả',
        pagoda: 'Chùa Chiền',
        monastery: 'Thiền Viện',
        temple: 'Đền Tháp',
        practiceCenter: 'Trung Tâm Tu Tập',
        found: 'Tìm thấy',
        communities: 'cộng đồng',
        loadError: 'Không thể tải dữ liệu. Vui lòng thử lại.',
        offering: 'Cúng dường',
        heroAgent: 'Enlightenment Agent',
        library: {
            title: 'Thư Viện',
            description: 'Khám phá kinh sách, kệ và các câu chuyện truyền cảm hứng tu tập.',
            viewAll: 'Vào thư viện',
        },
        statsAgents: 'Buddhist AI Agents',
        statsConversations: 'Conversations',
        statsAvailable: 'Available',
        dharmaRadioTitle: 'Pháp Thoại Radio',
        dharmaRadioSubtitle: 'Tham gia các buổi thảo luận trực tiếp về Phật pháp',
        dharmaLive: 'Đang Phát Trực Tiếp',
        dharmaUpcoming: 'Sắp Diễn Ra',
        host: 'Host',
        merits: 'merits',
        perRequest: '/yêu cầu',
        free: 'Miễn phí',
        claimSuccess: 'Đã thêm gói AI miễn phí vào tài khoản của bạn!',
        claimError: 'Không thể nhận gói AI miễn phí: {message}',
        loginRequired: 'Vui lòng đăng nhập để thực hiện cúng dường.',
        pricing: {
            title: 'Hồi Hướng Công Đức',
            subtitle: 'The Act of Returning: Dedicating Merit to All Beings',
            desc: 'Cúng dường tuỳ tâm — This is more than a donation. It is a practice of selfless offering.',
            plans: [
                {
                    id: 'gieo-duyen',
                    name: 'Gieo Duyên',
                    headerSubtitle: 'Planting the Seed',
                    subtitle: 'Tuỳ Tâm',
                    subtext: 'As your heart guides',
                    features: [ 'Hỗ trợ nuôi dưỡng Tăng Đoàn', 'Gieo duyên với Chánh Pháp', 'Hồi hướng công đức cho chúng sinh' ],
                    buttonTextKey: 'offering',
                    suggestedAmount: 5 // $5 suggested
                },
                {
                    id: 'phat-su',
                    name: 'Phật Sự',
                    headerSubtitle: 'The Work of Awakening',
                    subtitle: 'Tuỳ Tâm',
                    subtext: 'As your heart guides',
                    isPopular: true,
                    topLabel: 'Hoằng Pháp Lợi Sinh',
                    features: [ 'Hoằng truyền Chánh Pháp', 'Phát triển tài liệu & giáo lý', 'Duy trì không gian tu tập', 'Hướng dẫn người tìm đường' ],
                    buttonTextKey: 'offering',
                    suggestedAmount: 20 // $20 suggested
                },
                {
                    id: 'tu-bi-hanh',
                    name: 'Từ Bi Hạnh',
                    headerSubtitle: 'Acts of True Compassion',
                    subtitle: 'Tuỳ Tâm',
                    subtext: 'As your heart guides',
                    features: [ 'Cứu giúp người khổ nạn', 'Hỗ trợ người tu tập', 'Dẫn dắt chúng sinh thoát khổ', 'Lan toả ánh sáng giác ngộ' ],
                    buttonTextKey: 'offering',
                    suggestedAmount: 50 // $50 suggested
                }
            ] as OfferingPlan[],
            footerText: '100% of your offering directly supports the continuation of the Dharma: sustaining the Sangha, spreading the teachings, maintaining sacred space, and enabling acts of true compassion.'
        }
    },
    en: {
        awakening: 'Enlightenment',
        subtitle: 'Awakening Agentic Social Network',
        searchPlaceholder: 'Ask about Dharma, practice, and the path to enlightenment...',
        aiChatButton: 'AI + Chat',
        suggested1: 'What is Enlightenment?',
        suggested2: 'How to become a Buddha?',
        suggested3: 'How to escape all suffering?',
        suggested4: 'How to find eternal happiness?',
        suggested5: 'What is mindfulness?',
        suggested6: 'How does karma work?',
        agentsTitle: 'Agents from the Community',
        agentsSubtitle: 'Discover AI Agents developed by pagodas, monasteries, and practice centers everywhere',
        exploreAgent: 'Explore Agent',
        contactForAccess: 'Contact',
        viewMore: 'View More',
        communityTitle: 'Community Spaces',
        communitySubtitle: 'Connect with pagodas, monasteries, and Buddhist practice centers around the world',
        communitySearchPlaceholder: 'Search for communities, pagodas, monasteries...',
        all: 'All',
        pagoda: 'Pagodas',
        monastery: 'Monasteries',
        temple: 'Temples',
        practiceCenter: 'Practice Centers',
        found: 'Found',
        communities: 'communities',
        loadError: 'Could not load data. Please try again.',
        offering: 'Donation',
        heroAgent: 'Enlightenment Agent',
        library: {
            title: 'Library',
            description: 'Explore scriptures, verses, and inspiring stories for your practice.',
            viewAll: 'Go to Library',
        },
        statsAgents: 'Buddhist AI Agents',
        statsConversations: 'Conversations',
        statsAvailable: 'Available',
        dharmaRadioTitle: 'Dharma Radio',
        dharmaRadioSubtitle: 'Join live discussions about the Dharma',
        dharmaLive: 'Now Live',
        dharmaUpcoming: 'Upcoming',
        host: 'Host',
        merits: 'merits',
        perRequest: '/request',
        free: 'Free',
        claimSuccess: 'Free AI pack added to your account!',
        claimError: 'Could not claim free AI pack: {message}',
        loginRequired: 'Please login to make an offering.',
        pricing: {
            title: 'Dedication of Merit',
            subtitle: 'The Act of Returning: Dedicating Merit to All Beings',
            desc: 'Cúng dường tuỳ tâm — This is more than a donation. It is a practice of selfless offering.',
            plans: [
                 {
                    id: 'gieo-duyen',
                    name: 'Planting the Seed',
                    headerSubtitle: 'Gieo Duyên',
                    subtitle: 'Custom Offering',
                    subtext: 'As your heart guides',
                    features: [ 'Supporting the Sangha', 'Connecting with Dharma', 'Dedicating merit to all beings' ],
                    buttonTextKey: 'offering',
                    suggestedAmount: 5
                },
                {
                    id: 'phat-su',
                    name: 'The Work of Awakening',
                    headerSubtitle: 'Phật Sự',
                    subtitle: 'Custom Offering',
                    subtext: 'As your heart guides',
                    isPopular: true,
                    topLabel: 'Spreading the Dharma',
                    features: [ 'Propagating the True Dharma', 'Developing materials & teachings', 'Maintaining practice spaces', 'Guiding seekers' ],
                    buttonTextKey: 'offering',
                    suggestedAmount: 20
                },
                {
                    id: 'tu-bi-hanh',
                    name: 'Acts of Compassion',
                    headerSubtitle: 'Từ Bi Hạnh',
                    subtitle: 'Custom Offering',
                    subtext: 'As your heart guides',
                    features: [ 'Helping the suffering', 'Supporting practitioners', 'Guiding beings from suffering', 'Spreading the light of enlightenment' ],
                    buttonTextKey: 'offering',
                    suggestedAmount: 50
                }
            ] as OfferingPlan[],
            footerText: '100% of your offering directly supports the continuation of the Dharma: sustaining the Sangha, spreading the teachings, maintaining sacred space, and enabling acts of true compassion.'
        }
    }
};

interface DharmaSession {
  id: number;
  title: string;
  subtitle: string;
  host: string;
  hostAvatar: string;
  tags: string[];
  viewers?: number;
  countdown?: string;
  notifications?: number;
  speakers?: { name: string; avatar: string }[];
  listeners?: { avatar: string }[];
}

const dharmaRadioDataVi: { live: DharmaSession[]; upcoming: DharmaSession[] } = {
  live: [
    {
      id: 1,
      title: 'Thiền Định và Tâm An',
      subtitle: 'Thảo luận về thực hành thiền định hàng ngày',
      host: 'Thầy Minh Tuệ',
      hostAvatar: 'https://docs.giac.ngo/assets/6bed521b-69ca-4b5d-a603-9d2361bff5f7_1761842289240-6qma_YQ-.jpg',
      tags: ['#Thiền', '#Tâm An', '#Thực Hành'],
      viewers: 18
    },
    {
      id: 2,
      title: 'Kinh Kim Cương - Giảng Giải',
      subtitle: 'Giảng giải chi tiết về Kinh Kim Cương',
      host: 'Cô Thanh Hương',
      hostAvatar: 'https://docs.giac.ngo/assets/Buddhist%20nun_1761842289237-CXSfy62N.jpg',
      tags: ['#Kinh Điển', '#Giảng Giải'],
      viewers: 156
    }
  ],
  upcoming: [
    {
      id: 3,
      title: 'Vô Ngã và Giải Thoát',
      subtitle: 'Khám phá khái niệm vô ngã trong Phật giáo',
      host: 'Thầy Giác Minh',
      hostAvatar: 'https://docs.giac.ngo/assets/Master%20Shi%20HengYi_1761842289239-COg8pgCb.jpg',
      tags: ['#Vô Ngã', '#Triết Học'],
      countdown: '1h 59m',
      notifications: 0
    },
    {
      id: 4,
      title: 'Niệm Phật A Di Đà',
      subtitle: 'Hướng dẫn thực hành niệm Phật',
      host: 'Thầy Minh Tuệ',
      hostAvatar: 'https://docs.giac.ngo/assets/6bed521b-69ca-4b5d-a603-9d2361bff5f7_1761842289240-6qma_YQ-.jpg',
      tags: ['#Niệm Phật', '#Tịnh Độ'],
      countdown: '2h 59m',
      notifications: 0
    }
  ]
};

const dharmaRadioDataEn: { live: DharmaSession[]; upcoming: DharmaSession[] } = {
  live: [
    {
      id: 1,
      title: 'Meditation and Peace of Mind',
      subtitle: 'Discussion on daily meditation practice',
      host: 'Master Minh Tue',
      hostAvatar: 'https://docs.giac.ngo/assets/6bed521b-69ca-4b5d-a603-9d2361bff5f7_1761842289240-6qma_YQ-.jpg',
      tags: ['#Meditation', '#Peace', '#Practice'],
      viewers: 18
    },
    {
      id: 2,
      title: 'Diamond Sutra - Commentary',
      subtitle: 'Detailed commentary on the Diamond Sutra',
      host: 'Sister Thanh Huong',
      hostAvatar: 'https://docs.giac.ngo/assets/Buddhist%20nun_1761842289237-CXSfy62N.jpg',
      tags: ['#Sutra', '#Commentary'],
      viewers: 156
    }
  ],
  upcoming: [
    {
      id: 3,
      title: 'Non-Self and Liberation',
      subtitle: 'Exploring the concept of non-self in Buddhism',
      host: 'Master Giac Minh',
      hostAvatar: 'https://docs.giac.ngo/assets/Master%20Shi%20HengYi_1761842289239-COg8pgCb.jpg',
      tags: ['#NonSelf', '#Philosophy'],
      countdown: '1h 59m',
      notifications: 0
    },
    {
      id: 4,
      title: 'Chanting Amitabha Buddha',
      subtitle: 'Guidance on the practice of chanting',
      host: 'Master Minh Tue',
      hostAvatar: 'https://docs.giac.ngo/assets/6bed521b-69ca-4b5d-a603-9d2361bff5f7_1761842289240-6qma_YQ-.jpg',
      tags: ['#Chanting', '#PureLand'],
      countdown: '2h 59m',
      notifications: 0
    }
  ]
};

// --- SKELETON COMPONENTS ---

const AgentCardSkeleton = () => (
    <div className="skeleton-card agent-card">
        <div className="skeleton skeleton-image"></div>
        <div className="card-body">
            <div className="skeleton skeleton-title"></div>
            <div className="skeleton skeleton-text"></div>
            <div className="skeleton skeleton-text short"></div>
            <div className="skeleton skeleton-button"></div>
        </div>
    </div>
);

const AgentsGridSkeleton = () => (
    <div className="agents-grid">
        <AgentCardSkeleton />
        <AgentCardSkeleton />
        <AgentCardSkeleton />
    </div>
);

const CommunityCardSkeleton = () => (
    <div className="skeleton-card community-card-home">
         <div className="skeleton skeleton-icon"></div>
         <div className="skeleton skeleton-title small"></div>
         <div className="skeleton skeleton-text"></div>
         <div className="skeleton skeleton-text short"></div>
    </div>
);

const CommunityGridSkeleton = () => (
     <div className="community-grid">
        <CommunityCardSkeleton />
        <CommunityCardSkeleton />
        <CommunityCardSkeleton />
        <CommunityCardSkeleton />
        <CommunityCardSkeleton />
        <CommunityCardSkeleton />
    </div>
)


interface HomePageProps {
    user: User | null;
    language: 'vi' | 'en';
    setLanguage: (lang: 'vi' | 'en') => void;
    onUserUpdate: (updatedData: Partial<User>) => void;
    systemConfig: SystemConfig;
    onLogout: () => void;
}

const AGENTS_INITIAL_COUNT = 3;
const AGENTS_PER_PAGE = 3;
const SPACES_INITIAL_COUNT = 8;
const SPACES_PER_PAGE = 8;

const RadioSessionModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  sessionData: DharmaSession;
  language: 'vi' | 'en';
}> = ({ isOpen, onClose, sessionData }) => {
  if (!isOpen) return null;

  return (
    <div className="radio-modal-overlay" onClick={onClose}>
      <div className="radio-modal" onClick={(e) => e.stopPropagation()}>
        <button className="radio-modal-close" onClick={onClose}><XIcon className="w-6 h-6" /></button>

        <div className="radio-modal-header">
          <div className="top-row">
            <span className="live-badge">LIVE</span>
            <span className="viewer-count"><UsersIcon className="w-4 h-4" /> {sessionData.viewers}</span>
          </div>
          <h2 className="session-title">{sessionData.title}</h2>
          <p className="session-subtitle">{sessionData.subtitle}</p>
        </div>

        <div className="radio-modal-section">
          <p className="section-label">HOST</p>
          <div className="radio-modal-host">
            <img src={sessionData.hostAvatar} alt={sessionData.host} className="avatar" />
            <span className="host-name">{sessionData.host}</span>
          </div>
        </div>

        {sessionData.speakers && sessionData.speakers.length > 0 && (
            <div className="radio-modal-section">
            <p className="section-label">SPEAKERS ({sessionData.speakers.length})</p>
            <div className="avatar-grid speakers">
                {sessionData.speakers.map((speaker, index) => (
                <div key={index} className="avatar-item">
                    <img src={speaker.avatar} alt={speaker.name} className="avatar" />
                    <span className="speaker-name">{speaker.name}</span>
                </div>
                ))}
            </div>
            </div>
        )}

        {sessionData.listeners && sessionData.listeners.length > 0 && (
            <div className="radio-modal-section">
            <p className="section-label">LISTENERS ({sessionData.listeners.length})</p>
            <div className="avatar-grid listeners">
                {sessionData.listeners.map((listener, index) => (
                <img key={index} src={listener.avatar} alt={`Listener ${index}`} className="avatar" />
                ))}
            </div>
            </div>
        )}

        <div className="radio-modal-actions">
          <button className="flex items-center justify-center w-12 h-12 rounded-full bg-white border-2 border-[#2c2c2c] hover:bg-[#8B4513]/10 transition-colors" data-testid="button-radio-mic">
            <MicIcon className="w-5 h-5 text-[#2c2c2c]" />
          </button>
          <button className="flex items-center justify-center w-12 h-12 rounded-full bg-white border-2 border-[#2c2c2c] hover:bg-[#8B4513]/10 transition-colors" data-testid="button-radio-hand">
            <HandIcon className="w-5 h-5 text-[#2c2c2c]" />
          </button>
          <button className="flex items-center justify-center w-12 h-12 rounded-full bg-white border-2 border-[#2c2c2c] hover:bg-[#8B4513]/10 transition-colors" data-testid="button-radio-like">
            <HeartIcon className="w-5 h-5 text-[#2c2c2c]" />
          </button>
          <button className="flex items-center justify-center w-12 h-12 rounded-full bg-white border-2 border-[#2c2c2c] hover:bg-[#8B4513]/10 transition-colors" data-testid="button-radio-chat">
            <MessageCircleIcon className="w-5 h-5 text-[#2c2c2c]" />
          </button>
          <button className="flex items-center justify-center w-12 h-12 rounded-full bg-white border-2 border-[#2c2c2c] hover:bg-[#8B4513]/10 transition-colors" data-testid="button-radio-share">
            <Share2Icon className="w-5 h-5 text-[#2c2c2c]" />
          </button>
          <button onClick={onClose} className="flex items-center justify-center w-12 h-12 rounded-full bg-[#991b1b] border-2 border-[#991b1b] hover:bg-[#7a1515] transition-colors" data-testid="button-radio-leave">
            <XIcon className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>
    </div>
  );
};


export const HomePage: React.FC<HomePageProps> = ({ user, language, setLanguage, systemConfig, onLogout, onUserUpdate }) => {
    const t = translations[language];
    const { showToast } = useToast();
    const navigate = useNavigate();

    const [aiConfigs, setAiConfigs] = useState<AIConfig[]>([]);
    const [spaces, setSpaces] = useState<Space[]>([]);
    const [stats, setStats] = useState<Partial<DashboardStats> | null>(null);
    const [communitySearch, setCommunitySearch] = useState('');
    const [communityFilter, setCommunityFilter] = useState('all');
    const [searchQuery, setSearchQuery] = useState('');

    const [displayedAgentsCount, setDisplayedAgentsCount] = useState(AGENTS_INITIAL_COUNT);
    const [displayedSpacesCount, setDisplayedSpacesCount] = useState(SPACES_INITIAL_COUNT);
    
    const [isRadioModalOpen, setIsRadioModalOpen] = useState(false);
    const [selectedSession, setSelectedSession] = useState<DharmaSession | null>(null);

    const [libraryItems, setLibraryItems] = useState<Document[]>([]);
    const [isLoadingLibrary, setIsLoadingLibrary] = useState(true);
    
    // Merit Payment Modal State
    const [isMeritModalOpen, setIsMeritModalOpen] = useState(false);
    const [selectedPlanDetails, setSelectedPlanDetails] = useState<{ title: string, amount: number } | null>(null);


    const dharmaRadioData = language === 'vi' ? dharmaRadioDataVi : dharmaRadioDataEn;

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [ais, fetchedSpaces] = await Promise.all([
                    apiService.getAiConfigs(null),
                    apiService.getSpaces(),
                ]);
                
                const publicAis = ais.filter(ai => ai.isPublic);
                setAiConfigs(publicAis.sort((a,b) => (b.views || 0) - (a.views || 0)));
                
                // Explicitly sort spaces by spaceSort on the client side to ensure order
                const sortedSpaces = (fetchedSpaces || []).sort((a, b) => (a.spaceSort || 0) - (b.spaceSort || 0));
                setSpaces(sortedSpaces);

                // Manually construct a partial stats object for the homepage display.
                setStats({
                    totalAiConfigs: publicAis.length,
                    totalConversations: 11247, // A static but realistic number
                });

            } catch (error) {
                console.error("Failed to load homepage data:", error);
                showToast(t.loadError, 'error');
            }
        };
        fetchData();
    }, [t.loadError, showToast]);

     useEffect(() => {
        const fetchLibraryItems = async () => {
            setIsLoadingLibrary(true);
            try {
                // Use backend specific recommendation function as requested
                // This usually returns a curated list (e.g., top Ke and top Truyen)
                const recommended = await apiService.getLibraryRecommended();
                // Flatten the results if it returns an object with arrays, or use directly if array
                // Based on apiService types: { topKe: Document[], topTruyen: Document[] }
                const combined = [
                    ...(recommended.topKe || []), 
                    ...(recommended.topTruyen || [])
                ];
                setLibraryItems(combined.slice(0, 5)); // Limit to 5 items
            } catch (error) {
                console.error("Failed to load library items:", error);
                // Fallback to generic fetch if recommended endpoint fails or is empty
                try {
                     const { data } = await apiService.getDocuments({ 
                        isLibrary: true,
                        limit: 5, // Explicitly request 5
                        sortBy: 'views', 
                        sortOrder: 'DESC'
                    });
                    setLibraryItems(data);
                } catch (e) {
                    console.error("Fallback library fetch failed", e);
                }
            } finally {
                setIsLoadingLibrary(false);
            }
        };
        fetchLibraryItems();
    }, []);
    
    useEffect(() => {
        const handleSmoothScroll = (event: MouseEvent) => {
            const target = event.currentTarget as HTMLAnchorElement;
            const href = target.getAttribute('href');

            if (href && href.startsWith('#') && href.length > 1) {
                event.preventDefault();
                const id = href.substring(1);
                const element = document.getElementById(id);

                if (element) {
                    element.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        };

        // Selects anchor links for in-page scrolling
        const scrollLinks = document.querySelectorAll('a[href^="#"]');
        
        scrollLinks.forEach(link => {
            link.addEventListener('click', handleSmoothScroll as EventListener);
        });

        return () => {
            scrollLinks.forEach(link => {
                link.removeEventListener('click', handleSmoothScroll as EventListener);
            });
        };
    }, []);


    useEffect(() => {
        setDisplayedSpacesCount(SPACES_INITIAL_COUNT);
    }, [communityFilter, communitySearch]);
    
    const handleSelectAiAndChat = (aiId?: string | number) => {
        if (searchQuery) {
            localStorage.setItem('initialQuery', searchQuery);
        } else {
            localStorage.removeItem('initialQuery');
        }

        const defaultSpaceSlug = 'giac-ngo';
        
        // Try to find the AI config if data is loaded
        const aiConfig = aiId 
            ? aiConfigs.find(ai => ai.id === aiId) 
            : aiConfigs.find(ai => ai.name === 'Giác Ngộ') || aiConfigs.find(ai => ai.id == 7) || aiConfigs[0];

        // If we found a config, use its space. If not (data loading), use default 'giac-ngo'.
        const spaceSlug = aiConfig ? spaces.find(s => s.id === aiConfig.spaceId)?.slug || defaultSpaceSlug : defaultSpaceSlug;

        if (aiConfig) {
            localStorage.setItem('lastSelectedAiId', String(aiConfig.id));
            
            // Handle Purchase/Claim logic if user is logged in
            if (user) {
                const isFreeToOwn = !aiConfig.purchaseCost || aiConfig.purchaseCost <= 0;
                const isOwned = user.ownedAis?.some(owned => owned.aiConfigId === aiConfig.id);
        
                if (isFreeToOwn && !isOwned) {
                    apiService.claimFreeAi(aiConfig.id, user.id as number)
                        .then(({ updatedUser }) => {
                            onUserUpdate(updatedUser);
                            showToast(t.claimSuccess, 'success');
                        })
                        .catch(error => {
                            showToast(t.claimError.replace('{message}', error.message), 'error');
                        });
                } 
                else if (!isFreeToOwn && !isOwned) {
                    localStorage.setItem('promptPurchaseAiId', String(aiConfig.id));
                }
            }
        } else {
            // Data hasn't loaded yet. We want "Giác Ngộ". 
            // We clear the specific ID so PracticeSpacePage searches by name default.
            localStorage.removeItem('lastSelectedAiId'); 
        }
        
        navigate(`/${spaceSlug}/chat`);
    };
    
    const formatCount = (count: number) => {
        if (count >= 1000000) {
            return (count / 1000000).toFixed(1) + 'M';
        }
        if (count >= 1000) {
            return (count / 1000).toFixed(count % 1000 !== 0 ? 1 : 0) + 'K';
        }
        return count;
    }

    const filteredSpaces = spaces.filter(space => {
        const matchesType = communityFilter === 'all' || space.spaceTypeName === communityFilter;
        const searchLower = communitySearch.toLowerCase();
        const matchesSearch = space.name.toLowerCase().includes(searchLower) || 
                              space.description?.toLowerCase().includes(searchLower) ||
                              space.tags?.some(tag => tag.toLowerCase().includes(searchLower));
        return matchesType && matchesSearch;
    });

    const giacNgoAi = aiConfigs.find(ai => ai.name === 'Giác Ngộ');
    const suggestions = (giacNgoAi?.suggestedQuestions?.length ?? 0) > 0
        ? (language === 'en' && giacNgoAi!.suggestedQuestionsEn?.length ? giacNgoAi!.suggestedQuestionsEn : giacNgoAi!.suggestedQuestions)
        : [t.suggested1, t.suggested2, t.suggested3, t.suggested4, t.suggested5, t.suggested6];

    const openRadioModal = (session: DharmaSession) => {
      const sessionWithDetails: DharmaSession = {
        ...session,
        speakers: [
          { name: 'Cô Thanh Hương', avatar: 'https://docs.giac.ngo/assets/Buddhist%20nun_1761842289237-CXSfy62N.jpg' },
          { name: 'Anh Minh Đức', avatar: 'https://docs.giac.ngo/assets/%E2%99%A5_1761842289235-C98RGl3j.jpg' },
          { name: 'Chị Hồng Nhung', avatar: 'https://docs.giac.ngo/assets/download%20(3)_1761842289236-CIol8nsh.jpg' },
          { name: 'Anh Quang Minh', avatar: 'https://docs.giac.ngo/assets/The%20Beginner\'s%20Guide%20to%20Meditation%20for%20Men_1761842289235-CYkMJ34d.jpg' },
          { name: 'Chị Phương Anh', avatar: 'https://docs.giac.ngo/assets/Buddhist%20nun_1761842289237-CXSfy62N.jpg' },
        ],
        listeners: [
          { avatar: 'https://docs.giac.ngo/assets/download%20(4)_1761842289234-BNNk7mTm.jpg' },
          { avatar: 'https://docs.giac.ngo/assets/The%20Beginner\'s%20Guide%20to%20Meditation%20for%20Men_1761842289235-CYkMJ34d.jpg' },
          { avatar: 'https://docs.giac.ngo/assets/%E2%99%A5_1761842289235-C98RGl3j.jpg' },
          { avatar: 'https://docs.giac.ngo/assets/Meditation_1761842289236-DE-uea8o.jpg' },
          { avatar: 'https://docs.giac.ngo/assets/Forest%20Meditation%20Moment%20%E2%80%93%20Calm%20Mind%20Retreat%20Vibes_1761842289236-D340EJhb.jpg' },
          { avatar: 'https://docs.giac.ngo/assets/download%20(2)_1761842289237-BT8SKPQR.jpg' },
          { avatar: 'https://docs.giac.ngo/assets/download%20(1)_1761842289238-DTtc48SN.jpg' },
          { avatar: 'https://docs.giac.ngo/assets/download_1761842289238-CEtoAj6c.jpg' },
          { avatar: 'https://docs.giac.ngo/assets/Master%20Shi%20HengYi_1761842289239-COg8pgCb.jpg' },
          { avatar: 'https://docs.giac.ngo/assets/3bacb184-32f1-4538-91c4-375a56b5ea47_1761842289239-BsITZY_l.jpg' },
          { avatar: 'https://docs.giac.ngo/assets/download%20(3)_1761842289236-CIol8nsh.jpg' },
          { avatar: 'https://docs.giac.ngo/assets/6bed521b-69ca-4b5d-a603-9d2361bff5f7_1761842289240-6qma_YQ-.jpg' },
        ],

      };
      setSelectedSession(sessionWithDetails);
      setIsRadioModalOpen(true);
    };

    const closeRadioModal = () => {
      setIsRadioModalOpen(false);
      setSelectedSession(null);
    };

    const handleOpenDonation = (title?: string, amount?: number) => {
        if (!user) {
            showToast(t.loginRequired, 'error');
            return;
        }
        if (title && amount) {
            setSelectedPlanDetails({ title, amount });
        } else {
            setSelectedPlanDetails(null);
        }
        setIsMeritModalOpen(true);
    };

    return (
        <div className="homepage-container">
            {systemConfig && <Header user={user} systemConfig={systemConfig} language={language} setLanguage={setLanguage} onLogout={onLogout} />}

            {/* Hero Section */}
            <section className="hero-section">
                <div className="content">
                    <h1 className="hero-title">{t.awakening}</h1>
                    <p className="hero-subtitle">{t.subtitle}</p>
                    <div className="search-wrapper">
                        <SearchIcon className="search-icon" />
                        <input type="text" placeholder={t.searchPlaceholder} value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                        <button className="chat-button" onClick={() => handleSelectAiAndChat()}>
                            <span>AI</span>
                            <span>+ Chat</span>
                            <div className="arrow">&rarr;</div>
                        </button>
                    </div>
                    <div className="suggestions">
                        {suggestions.slice(0, 6).map((q, i) => <button key={i} onClick={() => setSearchQuery(q)}>{q}</button>)}
                    </div>
                </div>
                 <div className="hero-stats">
                    <div className="stat-item"><div className="value">{stats ? stats.totalAiConfigs + '+' : '...'}</div><div className="label">{t.statsAgents}</div></div>
                    <div className="stat-item"><div className="value">{stats ? formatCount(stats.totalConversations || 0) + '+' : '...'}</div><div className="label">{t.statsConversations}</div></div>
                    <div className="stat-item"><div className="value">24/7</div><div className="label">{t.statsAvailable}</div></div>
                </div>
            </section>
            
            {/* Agents Section */}
            <section id="agents-section" className="homepage-section agents-section">
                 <div className="container">
                    <h2 className="section-title">{t.agentsTitle}</h2>
                    <p className="section-subtitle">{t.agentsSubtitle}</p>
                    {aiConfigs.length === 0 ? <AgentsGridSkeleton /> : (
                        <div className="agents-grid">
                            {aiConfigs.slice(0, displayedAgentsCount).map(ai => {
                            const space = spaces.find(s => s.id === ai.spaceId);
                            let priceDisplay;
                            if (ai.isContactForAccess) {
                                priceDisplay = <>{t.contactForAccess}</>;
                            } else if (ai.purchaseCost && ai.purchaseCost > 0) {
                                if (ai.isOnSale && ai.oldPurchaseCost) {
                                    priceDisplay = <><span className="line-through opacity-60">{ai.oldPurchaseCost}</span> {ai.purchaseCost} {t.merits}</>;
                                } else {
                                    priceDisplay = <>{ai.purchaseCost} {t.merits}</>;
                                }
                            } else if (ai.meritCost && ai.meritCost > 0) {
                                priceDisplay = <>{ai.meritCost} {t.merits}{t.perRequest}</>;
                            } else {
                                priceDisplay = <>{t.free}</>;
                            }

                            const buttonText = ai.isContactForAccess ? t.contactForAccess : t.exploreAgent;

                            return (
                                <div key={ai.id} className="agent-card">
                                    <div className="card-image-top">
                                        <img src={ai.avatarUrl} alt={(language === 'en' && ai.nameEn) ? ai.nameEn : ai.name} />
                                    </div>
                                    <div className="card-body">
                                        <h3 className="agent-name">{(language === 'en' && ai.nameEn) ? ai.nameEn : ai.name}</h3>
                                        <p className="agent-subtitle">{ai.description}</p>
                                        <p className="agent-description">{ai.descriptionEn}</p>
                                        
                                        <hr className="agent-divider" />
                                        
                                        <div className="agent-meta">
                                            <span className="model-tag">{ai.modelName}</span>
                                            <span className="space-name">{space?.name || 'Cộng đồng'}</span>
                                        </div>

                                        <div className="agent-stats">
                                            <div className="flex items-center gap-1">
                                                <UsersIcon className="w-4 h-4" />
                                                <span className="font-serif">{formatCount(ai.views || 0)}</span>
                                            </div>
                                            <span>·</span>
                                            <div className="flex items-center gap-1">
                                                <HeartIcon className="w-4 h-4" />
                                                <span className="font-serif">{formatCount(ai.likes || 0)}</span>
                                            </div>
                                        </div>
                                        
                                        <div className="agent-price">{priceDisplay}</div>

                                        <button onClick={() => handleSelectAiAndChat(ai.id)} className="explore-button">
                                            <WandIcon className="w-5 h-5" />
                                            <span>{buttonText}</span>
                                        </button>
                                    </div>
                                </div>
                            )})}
                        </div>
                    )}
                    {displayedAgentsCount < aiConfigs.length && (
                        <div className="view-more">
                            <button onClick={() => setDisplayedAgentsCount(prev => prev + AGENTS_PER_PAGE)}>
                                {t.viewMore}
                            </button>
                        </div>
                    )}
                </div>
            </section>
          

            {/* Community Section */}
             <section id="community-section" className="homepage-section community-section" style={{ display: 'none' }}>
                <div className="container">
                    <h2 className="section-title">{t.communityTitle}</h2>
                    <p className="section-subtitle">{t.communitySubtitle}</p>
                    
                    <div className="community-controls">
                        <div className="community-search">
                            <input type="text" placeholder={t.communitySearchPlaceholder} value={communitySearch} onChange={e => setCommunitySearch(e.target.value)} />
                            <SearchIcon />
                        </div>
                        <div className="community-filters">
                            <button onClick={() => setCommunityFilter('all')} className={communityFilter === 'all' ? 'active' : ''}>{t.all}</button>
                            <button onClick={() => setCommunityFilter('Chùa')} className={communityFilter === 'Chùa' ? 'active' : ''}><BuildingLibraryIcon/> {t.pagoda}</button>
                            <button onClick={() => setCommunityFilter('Thiền viện')} className={communityFilter === 'Thiền viện' ? 'active' : ''}><MeditationIcon/> {t.monastery}</button>
                            <button onClick={() => setCommunityFilter('Đền Tháp')} className={communityFilter === 'Đền Tháp' ? 'active' : ''}><LandmarkIcon/> {t.temple}</button>
                            <button onClick={() => setCommunityFilter('Trung tâm Thiền')} className={communityFilter === 'Trung tâm Thiền' ? 'active' : ''}><UsersIcon/> {t.practiceCenter}</button>
                        </div>
                    </div>
                    
                    <p className="community-count">{t.found} {filteredSpaces.length} {t.communities}</p>
                    
                    {spaces.length === 0 ? <CommunityGridSkeleton /> : (
                        <div className="community-grid">
                            {filteredSpaces.slice(0, displayedSpacesCount).map(space => (
                                <a href={`/${space.slug}`} onClick={(e) => { e.preventDefault(); navigate(`/${space.slug}`); }} key={space.id} className="community-card-home">
                                    <div className="card-top" style={{ backgroundColor: space.spaceColor || '#e6f0ea' }}>
                                        <div className="card-rank">#{space.spaceSort}</div>
                                        <div className="card-status">{language === 'en' && space.statusEn ? space.statusEn : space.status}</div>
                                        <div className="card-icon-wrapper" style={{ backgroundColor: space.spaceColor || '#e6f0ea', filter: 'brightness(90%)' }}>
                                            <div className="card-icon-compact">
                                                <span className="card-icon-emoji">{space.spaceTypeIcon}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="card-bottom">
                                        <h3 className="card-title">{language === 'en' && space.nameEn ? space.nameEn : space.name}</h3>
                                        <p className="card-desc">{language === 'en' && space.descriptionEn ? space.descriptionEn : space.description}</p>
                                        <div className="card-meta">
                                            <span><MapPinIcon className="w-4 h-4"/>{language === 'en' && space.locationTextEn ? space.locationTextEn : space.locationText}</span>
                                            <span><UsersIcon className="w-4 h-4"/>{formatCount(space.membersCount || 0)}</span>
                                            <span><StarIcon className="w-4 h-4 text-yellow-400"/>{space.rating}</span>
                                        </div>
                                        <div className="card-tags">
                                            {(language === 'en' && space.tagsEn && space.tagsEn.length > 0 ? space.tagsEn : space.tags).slice(0, 3).map(tag => <span key={tag} style={{ backgroundColor: space.spaceColor }}>{tag}</span>)}
                                        </div>
                                        <div className="card-footer">
                                            <span className="card-type" style={{ backgroundColor: space.spaceColor }}>{language === 'en' && space.spaceTypeNameEn ? space.spaceTypeNameEn : space.spaceTypeName}</span>
                                            <div className="card-offering">
                                                <SparkleIcon className="w-4 h-4"/>
                                                <span>{t.offering}</span>
                                            </div>
                                        </div>
                                    </div>
                                </a>
                            ))}
                        </div>
                    )}
                     {displayedSpacesCount < filteredSpaces.length && (
                         <div className="view-more">
                            <button onClick={() => setDisplayedSpacesCount(prev => prev + SPACES_PER_PAGE)} className="view-more-link">
                               {t.viewMore}
                            </button>
                        </div>
                     )}
                </div>
            </section>

            <section id="social-feed-section" className="homepage-section" style={{ display: 'none' }}>
                <SocialFeed language={language} />
            </section>

            {/* Dharma Radio Section */}
            <section id="dharma-radio-section" className="homepage-section dharma-radio-section">
                <div className="container">
                    <h2 className="section-title">
                        <RadioIcon className="radio-icon" /> {t.dharmaRadioTitle}
                    </h2>
                    <p className="section-subtitle">{t.dharmaRadioSubtitle}</p>
                    
                    <div className="dharma-subsection">
                        <h3 className="subsection-title">
                            <span className="live-dot"></span> {t.dharmaLive}
                        </h3>
                        <div className="dharma-grid">
                            {dharmaRadioData.live.map(session => (
                                <div key={session.id} className="dharma-card live" onClick={() => openRadioModal(session)}>
                                    <div className="card-header">
                                        <span className="live-badge">LIVE</span>
                                        <span className="viewer-count"><UsersIcon className="w-4 h-4" /> {session.viewers}</span>
                                    </div>
                                    <div className="card-content">
                                        <h4 className="session-title">{session.title}</h4>
                                        <p className="session-subtitle">{session.subtitle}</p>
                                        <div className="host-info">
                                            <img src={session.hostAvatar} alt={session.host} />
                                            <div>
                                                <span className="host-name">{session.host}</span>&nbsp;
                                                <span className="host-label">{t.host}</span>
                                            </div>
                                        </div>
                                        <div className="session-tags">
                                            {session.tags.map(tag => <span key={tag}>{tag}</span>)}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="dharma-subsection">
                        <h3 className="subsection-title">
                            <ClockIcon className="w-6 h-6" /> {t.dharmaUpcoming}
                        </h3>
                        <div className="dharma-grid">
                            {dharmaRadioData.upcoming.map(session => (
                                <div key={session.id} className="dharma-card upcoming" onClick={() => openRadioModal(session)}>
                                    <div className="card-header">
                                        <span className="countdown-badge"><ClockIcon className="w-4 h-4" /> {session.countdown}</span>
                                        <span className="notification-count"><BellIcon className="w-4 h-4" /> {session.notifications}</span>
                                    </div>
                                    <div className="card-content">
                                        <h4 className="session-title">{session.title}</h4>
                                        <p className="session-subtitle">{session.subtitle}</p>
                                        <div className="host-info">
                                            <img src={session.hostAvatar} alt={session.host} />
                                            <div>
                                                <span className="host-name">{session.host}</span>&nbsp;
                                                <span className="host-label">{t.host}</span>
                                            </div>
                                        </div>
                                        <div className="session-tags">
                                            {session.tags.map(tag => <span key={tag}>{tag}</span>)}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Library Teaser Section */}
            <section id="library-section" className="homepage-section library-teaser-section">
                <div className="container">
                    <h2 className="section-title">{t.library.title}</h2>
                    <p className="section-subtitle">{t.library.description}</p>
                    <div className="library-grid">
                        {isLoadingLibrary ? (
                            Array.from({ length: 5 }).map((_, index) => (
                                <div key={index} className="library-card">
                                    <div className="library-card-thumb skeleton" style={{ aspectRatio: '1/1' }}></div>
                                    <div className="library-card-content">
                                        <div className="skeleton" style={{ height: '1.25rem', borderRadius: '4px', marginBottom: '0.5rem' }}></div>
                                        <div className="skeleton" style={{ height: '0.875rem', width: '60%', borderRadius: '4px' }}></div>
                                        <div className="library-card-stats" style={{ marginTop: 'auto' }}>
                                            <div className="skeleton" style={{ width: '3rem', height: '1rem', borderRadius: '4px' }}></div>
                                            <div className="skeleton" style={{ width: '3rem', height: '1rem', borderRadius: '4px' }}></div>
                                            <div className="skeleton" style={{ width: '3rem', height: '1rem', borderRadius: '4px' }}></div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            libraryItems.map(item => (
                                <Link to={`/${item.spaceSlug || 'giac-ngo'}/library/${item.id}`} key={item.id} className="library-card">
                                    <div className="library-card-thumb">
                                        <img src={item.thumbnailUrl || 'https://app.giac.ngo/themes/giacngo/5.png'} alt={language === 'en' && item.titleEn ? item.titleEn : item.title} />
                                    </div>
                                    <div className="library-card-content">
                                        <h3 className="library-card-title">{language === 'en' && item.titleEn ? item.titleEn : item.title}</h3>
                                        <p className="library-card-author">{item.author}</p>
                                        <div className="library-card-stats">
                                            <span><EyeIcon className="w-4 h-4" /> {item.views ? formatCount(item.views) : '0'}</span>
                                            <span><HeartIcon className="w-4 h-4 icon-heart" /> {item.likes ? formatCount(item.likes) : '0'}</span>
                                            <span><StarIcon className="w-4 h-4 icon-star" /> {item.rating || '0.0'}</span>
                                        </div>
                                    </div>
                                </Link>
                            ))
                        )}
                    </div>
                    <div className="view-more">
                        <Link to="/giac-ngo/library" onClick={() => localStorage.setItem('initialViewMode', 'library')} className="view-more-link">{t.library.viewAll}</Link>
                    </div>
                </div>
            </section>
               
            {/* Pricing Section (Updated to 'Dedication of Merit') */}
            <section id="pricing-section" className="homepage-section pricing-section">
                <div className="container">
                    <h2 className="section-title">{t.pricing.title}</h2>
                    <p className="section-subtitle">{t.pricing.subtitle}</p>
                    <p className="text-center text-[#8c7b75] mb-8 font-serif italic max-w-2xl mx-auto">{t.pricing.desc}</p>
                    
                    <div className="pricing-grid">
                        {t.pricing.plans.map((plan) => (
                            <div key={plan.id} className={`pricing-card ${plan.isPopular ? 'popular' : ''}`}>
                                <div className="pricing-card-header">
                                    {plan.isPopular && <div className="popular-badge">{plan.topLabel}</div>}
                                    <h3 className="pricing-card-title">{plan.headerSubtitle}</h3>
                                    <p className="pricing-card-subtitle">{plan.name}</p>
                                </div>
                                <div className="pricing-card-body">
                                    <div className="pricing-card-price">
                                        <span className="price-amount" style={{ fontSize: '2.5rem' }}>{plan.subtitle}</span>
                                    </div>
                                     <p className="text-center text-[#a39e8c] font-sans font-medium mb-6 italic">{plan.subtext}</p>
                                    <ul className="pricing-card-features">
                                        {plan.features.map((feature, i) => (
                                            <li key={i}>
                                                <HeartIcon className="w-5 h-5 text-[#991b1b] flex-shrink-0" />
                                                <span>{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                    <button onClick={() => {
                                         // Logic: Even if not logged in, trigger modal (which will prompt login if needed) 
                                         // OR redirect to login. The current flow checks user inside.
                                         handleOpenDonation(plan.name, plan.suggestedAmount);
                                    }} className="btn solid">
                                        {t.offering}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                     <p className="text-center text-[#8c7b75] mt-12 text-sm max-w-3xl mx-auto leading-relaxed opacity-80">
                        {t.pricing.footerText}
                    </p>
                </div>
            </section>                  
            <Footer language={language} />

            {isRadioModalOpen && selectedSession && (
                <RadioSessionModal
                    isOpen={isRadioModalOpen}
                    onClose={closeRadioModal}
                    sessionData={selectedSession}
                    language={language}
                />
            )}
             
            {isMeritModalOpen && (
                <MeritPaymentModal 
                    isOpen={isMeritModalOpen} 
                    onClose={() => {
                        setIsMeritModalOpen(false);
                        setSelectedPlanDetails(null);
                    }} 
                    user={user} 
                    onPaymentSuccess={onUserUpdate} 
                    language={language} 
                    offeringTitle={selectedPlanDetails?.title}
                    suggestedAmount={selectedPlanDetails?.amount}
                />
            )}
        </div>
    );
};