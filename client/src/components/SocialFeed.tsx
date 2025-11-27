// client/src/components/SocialFeed.tsx
import React, { useState } from 'react';
import { HomeIcon, SearchIcon, UserIcon, BellIcon, StarIcon, CommentIcon, HeartIcon, RepeatIcon, FlagIcon, ArrowRightIcon } from './Icons';

type SocialView = 'feed' | 'search' | 'profile' | 'notifications';

const translations = {
    vi: {
        title: "Mạng Xã Hội Tỉnh Thức",
        subtitle: "Chia sẻ và khám phá những lời dạy từ Phật pháp qua các Agent AI",
        home: "Trang chủ",
        search: "Tìm kiếm",
        profile: "Trang cá nhân",
        notifications: "Thông báo",
        post1: {
            userName: "Minh Tâm",
            userHandle: "@minhtam",
            time: "2 giờ trước",
            agentName: "Giác Ngộ",
            question: `"Làm thế nào để tìm thấy bình an trong tâm?"`,
            answer: "Bình an không phải là điều ta tìm kiếm bên ngoài, mà là trạng thái ta nuôi dưỡng từ bên trong. Khi tâm không còn bám víu vào quá khứ, không lo âu về tương lai, chỉ an trú trong giây phút hiện tại - đó chính là bình an chân thật.",
            content: "Lời dạy này đã giúp tôi tìm thấy sự bình yên trong những ngày khó khăn. Cảm ơn Phật pháp!",
        },
        post2: {
            userName: "Tuệ Minh",
            userHandle: "@tueminh",
            time: "1 ngày trước",
            agentName: "Kệ Vấn Ngộ",
            question: `"Thế nào là vô ngã?"`,
            answer: "Vô ngã không phải là không có \"ta\",\nMà là thấy rõ \"ta\" chỉ là giả danh.\nNăm uẩn hợp lại tạm gọi thân,\nNhư mây trôi, như sóng vỗ bờ tan.",
            content: "Bài kệ này thật sâu sắc. Mỗi lần đọc lại là một lần hiểu thêm về vô ngã.",
        },
        searchPlaceholder: "Tìm kiếm người dùng hoặc chủ đề...",
        trendingTopics: "Chủ đề nổi bật",
        popularKeywords: "Từ khóa phổ biến",
        faq: "Câu hỏi thường gặp",
        tags: ["ngã nhân", "bình yên", "giác ngộ", "từ bi", "thiền định"],
        keywords: ["#vô ngã", "#nhân quả", "#tứ diệu đế", "#bát chánh đạo", "#niết bàn"],
        questions: ["A Di Đà nghĩa là gì?", "Cực Lạc Tây Phương là đâu?", "Làm sao để tu tập thiền?", "Vô thường có nghĩa gì?", "Phật dạy gì về khổ đau?"],
        profileName: "Minh Tâm",
        profileHandle: "@minhtam",
        profileBio: "Học Phật, tu tâm, sống an lạc. Chia sẻ những bài học từ Phật pháp và hành trình giác ngộ của bản thân.",
        editProfile: "Chỉnh sửa",
        posts: "Bài viết",
        followers: "Người theo dõi",
        following: "Đang theo dõi",
        follow: "Theo dõi",
        notificationsTitle: "Thông báo",
        markAllRead: "Đánh dấu đã đọc",
        notification1: {
            userName: "Thanh Hương",
            action: "đã thích bài viết của bạn",
            time: "293 ngày trước"
        },
        notification2: {
            userName: "Tuệ Minh",
            action: "đã bình luận về bài viết của bạn",
            time: "293 ngày trước"
        },
        notification3: {
            userName: "An Nhiên",
            action: "đã bắt đầu theo dõi bạn",
            time: "292 ngày trước"
        },
        notification4: {
            userName: "Minh Đức",
            action: "đã chia sẻ lại bài viết của bạn",
            time: "292 ngày trước"
        },
        cta: "Khám phá toàn bộ mạng xã hội",
    },
    en: {
        title: "Awakening Social Network",
        subtitle: "Share and discover teachings from the Dharma through AI Agents",
        home: "Home",
        search: "Search",
        profile: "Profile",
        notifications: "Notifications",
        post1: {
            userName: "Clarity Mind",
            userHandle: "@claritymind",
            time: "2 hours ago",
            agentName: "Enlightenment",
            question: `"How to find peace in mind?"`,
            answer: "Peace is not something we seek outside, but a state we cultivate from within. When the mind no longer clings to the past, nor worries about the future, but simply abides in the present moment - that is true peace.",
            content: "This teaching has helped me find peace in difficult days. Thank you, Dharma!",
        },
        post2: {
            userName: "Bright Wisdom",
            userHandle: "@brightwisdom",
            time: "1 day ago",
            agentName: "Verse of Inquiry",
            question: `"What is non-self?"`,
            answer: "Non-self is not the absence of 'I',\nBut seeing 'I' is just a nominal designation.\nThe five aggregates combine to temporarily form a body,\nLike a drifting cloud, like a wave that breaks on the shore.",
            content: "This verse is so profound. Each time I read it, I understand more about non-self.",
        },
        searchPlaceholder: "Search for users or topics...",
        trendingTopics: "Trending Topics",
        popularKeywords: "Popular Keywords",
        faq: "Frequently Asked Questions",
        tags: ["self-other", "peace", "enlightenment", "compassion", "meditation"],
        keywords: ["#nonself", "#karma", "#fournobletruths", "#eightfoldpath", "#nirvana"],
        questions: ["What does Amitabha mean?", "Where is the Western Pure Land?", "How to practice meditation?", "What does impermanence mean?", "What did Buddha teach about suffering?"],
        profileName: "Clarity Mind",
        profileHandle: "@claritymind",
        profileBio: "Studying Dharma, cultivating the mind, living in peace. Sharing lessons from the Dharma and my own journey of awakening.",
        editProfile: "Edit Profile",
        posts: "Posts",
        followers: "Followers",
        following: "Following",
        follow: "Follow",
        notificationsTitle: "Notifications",
        markAllRead: "Mark all as read",
        notification1: {
            userName: "Thanh Huong",
            action: "liked your post",
            time: "293 days ago"
        },
        notification2: {
            userName: "Tue Minh",
            action: "commented on your post",
            time: "293 days ago"
        },
        notification3: {
            userName: "An Nhien",
            action: "started following you",
            time: "292 days ago"
        },
        notification4: {
            userName: "Minh Duc",
            action: "reposted your post",
            time: "292 days ago"
        },
        cta: "Explore the full social network",
    }
};


const SocialFeed: React.FC<{ language: 'vi' | 'en' }> = ({ language }) => {
    const [activeView, setActiveView] = useState<SocialView>('feed');
    const t = translations[language];

    const showView = (viewName: SocialView) => {
        setActiveView(viewName);
    };

    return (
        <div className="social-section">
            <div className="section-title">
                <h2>{t.title}</h2>
                <p>{t.subtitle}</p>
            </div>

            <div className="nav-container">
                <div className="nav-buttons">
                    <button className={`nav-btn ${activeView === 'feed' ? 'active' : ''}`} onClick={() => showView('feed')} title={t.home}>
                        <HomeIcon />
                    </button>
                    <button className={`nav-btn ${activeView === 'search' ? 'active' : ''}`} onClick={() => showView('search')} title={t.search}>
                        <SearchIcon />
                    </button>
                    <button className={`nav-btn ${activeView === 'profile' ? 'active' : ''}`} onClick={() => showView('profile')} title={t.profile}>
                        <UserIcon />
                    </button>
                    <button className={`nav-btn ${activeView === 'notifications' ? 'active' : ''}`} onClick={() => showView('notifications')} title={t.notifications}>
                        <BellIcon />
                        <span className="notification-badge">4</span>
                    </button>
                </div>
            </div>

            <div id="feedView" className={`view-content ${activeView !== 'feed' ? 'hidden' : ''}`}>
                {/* Post 1 */}
                <div className="post-card">
                    <div className="post-header">
                        <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100" alt={t.post1.userName} className="avatar" />
                        <div className="user-info">
                            <div>
                                <span className="user-name">{t.post1.userName}</span>
                                <span className="user-handle">{t.post1.userHandle}</span>
                                <span className="post-time">· {t.post1.time}</span>
                            </div>
                        </div>
                    </div>

                    <div className="social-agent-card">
                        <div className="agent-header">
                            <StarIcon className="agent-icon" />
                            <span className="agent-name">Agent: {t.post1.agentName}</span>
                        </div>
                        <p className="agent-question">{t.post1.question}</p>
                        <p className="agent-answer">{t.post1.answer}</p>
                    </div>
                    <p className="post-content">{t.post1.content}</p>
                    <div className="post-actions">
                        <button className="action-btn"><HeartIcon /><span>15</span></button>
                        <button className="action-btn"><CommentIcon /><span>7</span></button>
                        <button className="action-btn"><RepeatIcon /><span>3</span></button>
                    </div>
                </div>
                {/* Post 2 */}
                <div className="post-card">
                    <div className="post-header">
                        <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100" alt={t.post2.userName} className="avatar" />
                        <div className="user-info">
                            <div>
                                <span className="user-name">{t.post2.userName}</span>
                                <span className="user-handle">{t.post2.userHandle}</span>
                                <span className="post-time">· {t.post2.time}</span>
                            </div>
                        </div>
                    </div>
                    <div className="social-agent-card">
                        <div className="agent-header">
                            <StarIcon className="agent-icon" />
                            <span className="agent-name">Agent: {t.post2.agentName}</span>
                        </div>
                        <p className="agent-question">{t.post2.question}</p>
                        <p className="agent-answer" style={{ whiteSpace: "pre-line" }}>{t.post2.answer}</p>
                    </div>
                    <p className="post-content">{t.post2.content}</p>
                    <div className="post-actions">
                        <button className="action-btn liked"><HeartIcon /><span>22</span></button>
                        <button className="action-btn"><CommentIcon /><span>12</span></button>
                        <button className="action-btn"><RepeatIcon /><span>5</span></button>
                    </div>
                </div>
            </div>

            <div id="searchView" className={`view-content ${activeView !== 'search' ? 'hidden' : ''}`}>
                <input type="text" className="search-input" placeholder={t.searchPlaceholder} />
                <div className="trending-section">
                    <div className="trending-title"><StarIcon />{t.trendingTopics}</div>
                    <div className="tag-list">
                        {t.tags.map(tag => <button key={tag} className="tag-btn">{tag}</button>)}
                    </div>
                </div>
                <div className="trending-section">
                    <div className="trending-title"><FlagIcon />{t.popularKeywords}</div>
                    <div className="tag-list">
                        {t.keywords.map(kw => <button key={kw} className="tag-btn">{kw}</button>)}
                    </div>
                </div>
                <div className="trending-section">
                    <div className="trending-title"><CommentIcon />{t.faq}</div>
                    <div className="question-list">
                        {t.questions.map(q => <button key={q} className="question-btn">{q}</button>)}
                    </div>
                </div>
            </div>

            <div id="profileView" className={`view-content ${activeView !== 'profile' ? 'hidden' : ''}`}>
                <div className="profile-card">
                    <div className="profile-header">
                        <div className="profile-info">
                            <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100" alt={t.profileName} className="profile-avatar" />
                            <div className="profile-details">
                                <h2>{t.profileName}</h2>
                                <p className="handle">{t.profileHandle}</p>
                                <p className="profile-bio">{t.profileBio}</p>
                            </div>
                        </div>
                        <button className="edit-btn">{t.editProfile}</button>
                    </div>
                    <div className="profile-stats">
                        <div className="stat"><div className="stat-value">24</div><div className="stat-label">{t.posts}</div></div>
                        <div className="stat"><div className="stat-value">156</div><div className="stat-label">{t.followers}</div></div>
                        <div className="stat"><div className="stat-value">89</div><div className="stat-label">{t.following}</div></div>
                        <button className="follow-btn">{t.follow}</button>
                    </div>
                </div>
                <div className="post-card">
                    <div className="post-header">
                        <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100" alt={t.post1.userName} className="avatar" />
                        <div className="user-info">
                            <div><span className="user-name">{t.post1.userName}</span><span className="user-handle">{t.post1.userHandle}</span><span className="post-time">· {t.notification1.time}</span></div>
                        </div>
                    </div>
                    <p className="post-content">{t.post1.content}</p>
                    <div className="social-agent-card">
                        <div className="agent-header"><StarIcon className="agent-icon" /><span className="agent-name">{t.post1.agentName}</span></div>
                        <p className="agent-question">{t.post1.question}</p>
                        <p className="agent-answer">{t.post1.answer}</p>
                    </div>
                    <div className="post-actions">
                        <button className="action-btn"><HeartIcon /><span>15</span></button>
                        <button className="action-btn"><CommentIcon /><span>7</span></button>
                        <button className="action-btn"><RepeatIcon /><span>3</span></button>
                    </div>
                </div>
            </div>

            <div id="notificationsView" className={`view-content ${activeView !== 'notifications' ? 'hidden' : ''}`}>
                <div className="post-card" style={{ padding: 0, overflow: 'hidden' }}>
                    <div style={{ padding: '1rem 1.5rem', borderBottom: '1px solid rgba(139, 69, 19, 0.1)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 style={{ fontSize: '1.125rem', fontWeight: 'bold', color: '#2c2c2c' }}>{t.notificationsTitle}</h3>
                        <button style={{ fontSize: '0.75rem', color: '#991b1b', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, fontFamily: 'inherit' }}>{t.markAllRead}</button>
                    </div>
                    <div className="notification-item">
                        <img src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100" alt={t.notification1.userName} className="notification-avatar" />
                        <div className="notification-content"><p className="notification-text"><span className="username">{t.notification1.userName}</span><span className="action"> {t.notification1.action}</span></p><p className="notification-time">{t.notification1.time}</p></div>
                        <HeartIcon className="notification-icon text-red-700" />
                        <div className="unread-dot"></div>
                    </div>
                    <div className="notification-item">
                        <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100" alt={t.notification2.userName} className="notification-avatar" />
                        <div className="notification-content"><p className="notification-text"><span className="username">{t.notification2.userName}</span><span className="action"> {t.notification2.action}</span></p><p className="notification-time">{t.notification2.time}</p></div>
                        <CommentIcon className="notification-icon text-yellow-600" />
                        <div className="unread-dot"></div>
                    </div>
                    <div className="notification-item">
                        <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100" alt={t.notification3.userName} className="notification-avatar" />
                        <div className="notification-content"><p className="notification-text"><span className="username">{t.notification3.userName}</span><span className="action"> {t.notification3.action}</span></p><p className="notification-time">{t.notification3.time}</p></div>
                        <UserIcon className="notification-icon text-gray-800" />
                        <div className="unread-dot"></div>
                    </div>
                    <div className="notification-item">
                        <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100" alt={t.notification4.userName} className="notification-avatar" />
                        <div className="notification-content"><p className="notification-text"><span className="username">{t.notification4.userName}</span><span className="action"> {t.notification4.action}</span></p><p className="notification-time">{t.notification4.time}</p></div>
                        <RepeatIcon className="notification-icon text-yellow-600" />
                    </div>
                </div>
            </div>

            <div className="cta-container">
                <button className="cta-btn">{t.cta}<ArrowRightIcon /></button>
            </div>
        </div>
    );
};

export default SocialFeed;
