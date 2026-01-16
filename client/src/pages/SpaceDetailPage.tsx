// client/src/pages/SpaceDetailPage.tsx
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { apiService } from '../services/apiService';
import { Space, User, AIConfig } from '../types';
import { useToast } from '../components/ToastProvider';
import { MapPinIcon, UsersIcon, StarIcon, ChevronLeftIcon, BookOpenIcon, CalendarIcon, AiIcon, RadioIcon, HeartIcon, GlobeAltIcon, PhoneIcon, EnvelopeIcon, BellIcon, SquaresIcon, CardIcon, CashAppIcon, ApplePayIcon, VenmoIcon, USBankIcon, GooglePayIcon, AmazonPayIcon, LinkIcon } from '../components/Icons';
import { loadStripe, PaymentIntent, StripeElementsOptions, StripeError } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements, PaymentRequestButtonElement } from '@stripe/react-stripe-js';

const translations = {
    vi: {
        backToList: 'Quay lại',
        members: 'thành viên',
        views: 'lượt xem',
        likes: 'yêu thích',
        loading: 'Đang tải...',
        notFound: 'Không tìm thấy không gian này.',
        loadError: 'Không thể tải dữ liệu không gian.',
        aiLoadError: 'Không thể tải AI Agents cho không gian này.',
        contact: 'Liên hệ',
        website: 'Trang web',
        joinCommunity: 'Tham gia cộng đồng',
        // Tabs
        tabInfo: 'Giới thiệu',
        tabDharma: 'Pháp Thoại',
        tabSchedule: 'Lịch & Sự kiện',
        tabLibrary: 'Thư viện',
        tabAgents: 'AI Agents',
        tabOffering: 'Cúng dường',
        // Tab Content
        about: 'Về',
        details: 'Thông tin chi tiết',
        rank: 'Xếp hạng',
        type: 'Loại hình',
        rating: 'Đánh giá',
        scheduleInfo: 'Lịch sinh hoạt và các khóa tu sẽ được cập nhật sớm tại đây.',
        libraryLinkText: 'Khám phá thư viện',
        dharmaLinkText: 'Nghe pháp thoại',
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
        likeSuccess: 'Cảm ơn bạn đã yêu thích!',
        likeError: 'Yêu thích thất bại.',
        loginToLike: 'Vui lòng đăng nhập để yêu thích.',
        // Offering Tab Content
        offeringSupportTitle: 'Hỗ trợ {name}',
        offeringSupportSubtitle: 'Chấp nhận cúng dường với lòng tôn nghiêm—sự cúng dường rộng lượng được coi là một thực hành tâm linh, không phải là gây quỹ giao dịch.',
        recurringDanaTitle: 'Cúng dường Định kỳ',
        recurringDanaDesc: 'Cho phép các cam kết hàng tháng để tôn vinh những người ủng hộ tận tụy.',
        recurringDanaFeatures: ['Hàng tháng, hàng quý, hàng năm', 'Quản lý và tạm dừng dễ dàng', 'Ghi nhận sự hỗ trợ bền vững'],
        qrCodesTitle: 'Mã QR & Nhiều Phương thức',
        qrCodesDesc: 'Dễ dàng nhận quyên góp qua các phương thức hiện đại và truyền thống.',
        qrCodesFeatures: ['Mã QR để tặng ngay', 'Thẻ tín dụng/ghi nợ, chuyển khoản ngân hàng', 'Cash App, Apple Pay, Venmo'],
        meritDedicationTitle: 'Hồi hướng Công đức & Cúng dường Ẩn danh',
        meritDedicationDesc: 'Cho phép người cúng dường hồi hướng công đức và thực hành bố thí vô ngã.',
        meritDedicationFeatures: ['Hồi hướng công đức cho người thân', 'Hỗ trợ cúng dường ẩn danh', 'Ghi nhận công đức công khai'],
        makeDonationTitle: 'Thực hiện Cúng dường',
        makeDonationSubtitle: 'Chọn một số tiền và phương thức thanh toán để hỗ trợ {name}.',
        popular: 'Phổ biến',
        basicSupport: 'Hỗ trợ cơ bản',
        mediumSupport: 'Hỗ trợ vừa',
        majorSupport: 'Hỗ trợ lớn',
        customAmount: 'Hoặc nhập số tiền tùy chỉnh',
        enterAmount: 'Nhập số tiền (VND)',
        paymentMethod: 'Phương thức Thanh toán',
        cardInformation: 'Thông tin Thanh toán',
        cardNumber: 'Số thẻ',
        expiration: 'Ngày hết hạn',
        cvc: 'CVC',
        country: 'Quốc gia',
        zip: 'ZIP',
        completeDonation: 'Hoàn tất Cúng dường',
        donationSuccess: 'Cảm ơn sự cúng dường của bạn!',
        invalidAmount: 'Vui lòng nhập số tiền hợp lệ.',
        stripeError: 'Lỗi thanh toán: {message}',
        paymentSuccessful: 'Thanh toán thành công!',
        paymentProcessing: 'Đang xử lý thanh toán...',
        paymentFailed: 'Thanh toán thất bại. Vui lòng thử lại.',
        paymentMethodsLoadError: 'Không thể tải các phương thức thanh toán.',
        walletNotAvailable: 'Apple Pay/Google Pay không khả dụng trên thiết bị hoặc trình duyệt này.',
    },
    en: {
        backToList: 'Back',
        members: 'members',
        views: 'views',
        likes: 'likes',
        loading: 'Loading...',
        notFound: 'This space could not be found.',
        loadError: 'Could not load space data.',
        aiLoadError: 'Failed to load AI Agents for this space.',
        contact: 'Contact',
        website: 'Website',
        joinCommunity: 'Join Community',
        // Tabs
        tabInfo: 'Introduction',
        tabDharma: 'Dharma Talk',
        tabSchedule: 'Schedule & Events',
        tabLibrary: 'Library',
        tabAgents: 'AI Agents',
        tabOffering: 'Offering',
         // Tab Content
        about: 'About',
        details: 'Detailed Information',
        rank: 'Rank',
        type: 'Type',
        rating: 'Rating',
        scheduleInfo: 'Activity schedules and retreats will be updated here soon.',
        libraryLinkText: 'Explore the library',
        dharmaLinkText: 'Listen to dharma talks',
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
        likeSuccess: 'Thank you for your like!',
        likeError: 'Failed to like.',
        loginToLike: 'Please log in to like.',
        // Offering Tab Content
        offeringSupportTitle: 'Support {name}',
        offeringSupportSubtitle: 'Accept dāna with dignity—generous giving framed as spiritual practice, not transactional fundraising.',
        recurringDanaTitle: 'Recurring Dāna',
        recurringDanaDesc: 'Enable monthly commitments to honor supporters who dedicate long-term.',
        recurringDanaFeatures: ['Monthly, quarterly, annually', 'Easy management & pausing', 'Recognition for sustained support'],
        qrCodesTitle: 'QR Codes & Multiple Methods',
        qrCodesDesc: 'Seamlessly accept donations through modern and traditional payment methods.',
        qrCodesFeatures: ['QR codes for instant giving', 'Credit/debit cards, bank transfers', 'Cash App, Apple Pay, Venmo'],
        meritDedicationTitle: 'Merit Dedication & Anonymous Giving',
        meritDedicationDesc: 'Enable donors to dedicate merit and practice selfless giving.',
        meritDedicationFeatures: ['Dedicate merit to loved ones', 'Anonymous donations supported', 'Public or private recognition'],
        makeDonationTitle: 'Make a Donation',
        makeDonationSubtitle: 'Select an amount and payment method to support {name}.',
        popular: 'Popular',
        basicSupport: 'Basic support',
        mediumSupport: 'Medium support',
        majorSupport: 'Major support',
        customAmount: 'Or enter custom amount',
        enterAmount: 'Enter amount (VND)',
        paymentMethod: 'Payment Method',
        cardInformation: 'Payment Information',
        cardNumber: 'Card number',
        expiration: 'Expiration',
        cvc: 'CVC',
        country: 'Country',
        zip: 'ZIP',
        completeDonation: 'Complete Donation',
        donationSuccess: 'Thank you for your donation!',
        invalidAmount: 'Please enter a valid amount.',
        stripeError: 'Payment Error: {message}',
        paymentSuccessful: 'Payment successful!',
        paymentProcessing: 'Processing payment...',
        paymentFailed: 'Payment failed. Please try again.',
        paymentMethodsLoadError: 'Could not load payment methods.',
        walletNotAvailable: 'Apple Pay/Google Pay is not available on this device or browser.',
    }
};

interface SpaceDetailPageProps {
    user: User | null;
    onUserUpdate: (updatedData: Partial<User>) => void;
}

// Global promise for Stripe.js
const stripePromise = apiService.getStripeConfig()
  .then(config => config.publishableKey ? loadStripe(config.publishableKey) : null)
  .catch(err => {
    console.error("Failed to load Stripe config:", err);
    return null;
  });

const DonationForm: React.FC<{
    user: User;
    center: Space;
    t: any;
    onUserUpdate: (updatedData: Partial<User>) => void;
    navigate: any;
    location: any;
    language: 'vi' | 'en';
    enabledPaymentMethods: string[];
    isLoadingPaymentMethods: boolean;
    amountVND: number;
    clientSecret: string;
}> = ({ user, center, t, onUserUpdate, navigate, location, language, enabledPaymentMethods, isLoadingPaymentMethods, amountVND, clientSecret }) => {
    const stripe = useStripe();
    const elements = useElements();
    const { showToast } = useToast();

    const [isDonating, setIsDonating] = useState(false);
    const [message, setMessage] = useState<string | null>(null);
    const [paymentMethod, setPaymentMethod] = useState<string>("card");
    const [paymentRequest, setPaymentRequest] = useState<any>(null);
    
    const isStripeElementsLoading = !stripe || !elements;

    const paymentMethodMap: { [key: string]: { icon: React.FC<any>; name: string; iconClass?: string } } = {
        card: { icon: CardIcon, name: 'Card' },
        cashapp: { icon: CashAppIcon, name: 'Cash App', iconClass: 'cash-app-icon' },
        apple_pay: { icon: ApplePayIcon, name: 'Apple Pay' },
        google_pay: { icon: GooglePayIcon, name: 'Google Pay' },
        amazon_pay: { icon: AmazonPayIcon, name: 'Amazon Pay' },
        link: { icon: LinkIcon, name: 'Link' },
        us_bank_account: { icon: USBankIcon, name: 'US Bank' },
        venmo: { icon: VenmoIcon, name: 'Venmo', iconClass: 'venmo-icon'},
    };

    useEffect(() => {
        if (!stripe || !elements) return;

        const pr = stripe.paymentRequest({
            country: 'US', // Required for wallets like Cash App
            currency: 'usd', // Wallets often require major currencies
            total: {
                label: t.offeringTitle.replace('{name}', center.name),
                // Assuming 1 USD = 25,000 VND for demo purposes
                amount: Math.round((amountVND / 25000) * 100),
            },
            requestPayerName: true,
            requestPayerEmail: true,
        });

        pr.canMakePayment().then((result) => {
            if (result) {
                setPaymentRequest(pr);
            } else {
                setPaymentRequest(null);
            }
        });
    }, [stripe, elements, amountVND, t.offeringTitle, center.name]);


     useEffect(() => {
        if (!stripe) {
            return;
        }

        const clientSecret = new URLSearchParams(window.location.search).get("payment_intent_client_secret");

        if (!clientSecret) {
            return;
        }

        stripe.retrievePaymentIntent(clientSecret).then(({ paymentIntent }: { paymentIntent?: PaymentIntent }) => {
            switch (paymentIntent?.status) {
                case "succeeded":
                    setMessage(t.paymentSuccessful);
                    if (paymentIntent.id) {
                         apiService.confirmStripePayment(paymentIntent.id)
                            .then(onUserUpdate)
                            .catch(err => console.error("Error confirming payment on backend:", err));
                    }
                    break;
                case "processing":
                    setMessage(t.paymentProcessing);
                    break;
                case "requires_payment_method":
                    setMessage(t.paymentFailed);
                    break;
                default:
                    setMessage(t.paymentFailed);
                    break;
            }
        });
    }, [stripe, t, onUserUpdate]);

    const handleDonationSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isDonating || !stripe) {
            return;
        }

        if (!user) {
            showToast(t.loginToOffer, 'info');
            navigate('/login', { state: { from: location } });
            return;
        }
        
        setIsDonating(true);
        setMessage(null);

        let resultError: StripeError | undefined;

        // Special handling for Cash App to avoid PaymentElement validation issues
        if (paymentMethod === 'cashapp') {
            if (!clientSecret) {
                setMessage("Cannot process payment. Client secret is missing.");
                setIsDonating(false);
                return;
            }
            const { error } = await stripe.confirmCashappPayment(clientSecret, {
                payment_method: {
                    billing_details: {
                        name: user.name,
                        email: user.email,
                    },
                },
                return_url: window.location.href.split('?')[0],
            });
            resultError = error;
        } else {
            if (!elements) {
                setIsDonating(false);
                return;
            }
            // Default flow for all other methods handled by PaymentElement
            const { error } = await stripe.confirmPayment({
                elements,
                confirmParams: {
                    return_url: window.location.href.split('?')[0],
                },
            });
            resultError = error;
        }

        // This part of the code is only reached if a redirect doesn't happen or if it fails.
        if (resultError) {
            if (resultError.type === "card_error" || resultError.type === "validation_error") {
                setMessage(resultError.message || t.stripeError.replace('{message}', 'Unknown error'));
            } else {
                setMessage(t.stripeError.replace('{message}', 'An unexpected error occurred.'));
            }
        }
        
        setIsDonating(false);
    };
    
    const paymentMethodDetails = paymentMethodMap[paymentMethod];
    const isFormMethod = ['card', 'link', 'us_bank_account'].includes(paymentMethod);
    const isRedirectMethodWithPE = ['venmo', 'amazon_pay'].includes(paymentMethod);
    const isWalletPayment = ['apple_pay', 'google_pay'].includes(paymentMethod);
    const isCashApp = paymentMethod === 'cashapp';

    const usesPaymentElement = isFormMethod || isRedirectMethodWithPE;


    return (
        <form onSubmit={handleDonationSubmit}>
            <div className="mb-6">
                <label className="form-label mb-3">{t.paymentMethod}</label>
                {isLoadingPaymentMethods ? (
                    <div className="payment-grid-dynamic">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="payment-method-card skeleton">
                                <div className="skeleton-icon"></div>
                                <div className="skeleton-text"></div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="payment-grid-dynamic">
                        {enabledPaymentMethods.map(methodKey => {
                            const methodDetails = paymentMethodMap[methodKey];
                            if (!methodDetails) return null;
                            const Icon = methodDetails.icon;
                            return (
                                <button type="button" key={methodKey} onClick={() => setPaymentMethod(methodKey)} className={`payment-method-card ${paymentMethod === methodKey ? "selected" : ""}`}>
                                    <Icon className={methodDetails.iconClass || ''} />
                                    <span>{methodDetails.name}</span>
                                </button>
                            )
                        })}
                    </div>
                )}
            </div>

            {isWalletPayment && (
                paymentRequest ? (
                    <div className="mt-4">
                        <PaymentRequestButtonElement options={{ paymentRequest }} />
                    </div>
                ) : (
                    <div className="text-center p-4 bg-background-light rounded-lg text-text-light text-sm">
                        {t.walletNotAvailable}
                    </div>
                )
            )}
            
            {usesPaymentElement && (
                 <div className="card-info-form">
                    {isFormMethod && <label className="form-label">{t.cardInformation}</label>}
                    <div className={!isFormMethod ? 'hidden-payment-element' : ''}>
                        <div className="relative" style={{ minHeight: isFormMethod ? '150px' : '0' }}>
                            {isStripeElementsLoading && isFormMethod && (
                                <div className="stripe-loader-overlay">
                                    <div className="stripe-loader-spinner"></div>
                                    <span>{language === 'vi' ? 'Đang tải biểu mẫu...' : 'Loading form...'}</span>
                                </div>
                            )}
                            <div style={{ opacity: isStripeElementsLoading ? 0 : 1, transition: 'opacity 0.3s ease-in-out' }}>
                                <PaymentElement id="payment-element" />
                            </div>
                        </div>
                    </div>

                    {isRedirectMethodWithPE && paymentMethodDetails && (
                        <div className="payment-method-placeholder">
                            <paymentMethodDetails.icon className={`placeholder-icon ${paymentMethodDetails.iconClass || ''}`} />
                            <p>{language === 'vi' ? `Bạn sẽ được chuyển hướng để hoàn tất thanh toán bằng ${paymentMethodDetails.name}.` : `You will be redirected to complete your payment with ${paymentMethodDetails.name}.`}</p>
                        </div>
                    )}
                </div>
            )}

            {isCashApp && paymentMethodDetails && (
                <div className="payment-method-placeholder">
                    <paymentMethodDetails.icon className={`placeholder-icon ${paymentMethodDetails.iconClass || ''}`} />
                    <p>{language === 'vi' ? `Bạn sẽ được chuyển hướng để hoàn tất thanh toán bằng ${paymentMethodDetails.name}.` : `You will be redirected to complete your payment with ${paymentMethodDetails.name}.`}</p>
                </div>
            )}
            
            {message && <div id="payment-message" className="text-center text-accent-red my-4">{message}</div>}

            {!isWalletPayment && (
                <button type="submit" className="donation-submit-btn" disabled={isDonating || isStripeElementsLoading}>
                    {isDonating ? t.offeringLoading : t.completeDonation}
                </button>
            )}
        </form>
    );
};

export const SpaceDetailPage: React.FC<SpaceDetailPageProps> = ({ user, onUserUpdate }) => {
    const language: 'vi' | 'en' = (localStorage.getItem('language') as 'vi' | 'en') || 'vi';
    const t = translations[language];
    const { spaceSlug: slug } = useParams<{ spaceSlug: string }>();
    const { showToast } = useToast();
    const navigate = useNavigate();
    const location = useLocation();

    const [center, setCenter] = useState<Space | null>(null);
    const [aiAgents, setAiAgents] = useState<AIConfig[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('schedule');
    const [likes, setLikes] = useState(0);
    const [isLiking, setIsLiking] = useState(false);
    
    // Stripe Payment Element State
    const [clientSecret, setClientSecret] = useState('');
    const [selectedAmount, setSelectedAmount] = useState<number | 'custom'>(500000);
    const [customAmount, setCustomAmount] = useState<string>('');
    const amountVND = selectedAmount === 'custom' ? parseInt(customAmount.replace(/[^0-9]/g, ''), 10) || 0 : selectedAmount;
    const [isClientSecretLoading, setIsClientSecretLoading] = useState(false);

    // Dynamic Payment Methods State
    const [enabledPaymentMethods, setEnabledPaymentMethods] = useState<string[]>([]);
    const [isLoadingPaymentMethods, setIsLoadingPaymentMethods] = useState(true);

    useEffect(() => {
        if (!slug) return;
        setIsLoading(true);
        apiService.getSpaceBySlug(slug)
            .then((data: Space) => {
                setCenter(data);
                setLikes(data.likes || 0);
                if (data && typeof data.id === 'number') {
                    apiService.incrementSpaceView(data.id).catch(err => console.error("Failed to increment view count", err));
                    
                    apiService.getAiConfigsBySpaceId(data.id)
                        .then(setAiAgents)
                        .catch(() => showToast(t.aiLoadError, 'error'));
                }
            })
            .catch((err: any) => {
                showToast(t.loadError, 'error');
                console.error(err);
            })
            .finally(() => setIsLoading(false));
    }, [slug, showToast, t.loadError, t.aiLoadError]);
    
    useEffect(() => {
        if (activeTab === 'offering' && user) {
            setIsLoadingPaymentMethods(true);
            apiService.getEnabledPaymentMethods()
                .then(methods => {
                    const sortedMethods = methods.sort((a, b) => {
                        if (a === 'card') return -1;
                        if (b === 'card') return 1;
                        return a.localeCompare(b);
                    });
                    setEnabledPaymentMethods(sortedMethods);
                })
                .catch(err => {
                    console.error("Failed to fetch payment methods:", err);
                    showToast(t.paymentMethodsLoadError, 'error');
                    setEnabledPaymentMethods(['card']);
                })
                .finally(() => {
                    setIsLoadingPaymentMethods(false);
                });
        }
    }, [activeTab, user, showToast, t.paymentMethodsLoadError]);
    
     useEffect(() => {
        if (activeTab === 'offering' && user && amountVND > 0) {
            const meritAmount = Math.floor(amountVND / 1000);
            if (meritAmount > 0) {
                setIsClientSecretLoading(true);
                setClientSecret('');
                apiService.initiateStripePurchase(user.id as number, meritAmount)
                    .then(data => setClientSecret(data.clientSecret))
                    .catch(err => console.error("Failed to create PaymentIntent", err))
                    .finally(() => setIsClientSecretLoading(false));
            } else {
                 setClientSecret('');
            }
        }
    }, [activeTab, user, amountVND]);

    const handleLike = async () => {
        if (!user) {
            showToast(t.loginToLike, 'info');
            navigate('/login', { state: { from: location } });
            return;
        }
        if (!center || isLiking) return;

        setIsLiking(true);
        try {
            const response = await apiService.likeSpace(center.id as number);
            setLikes(response.likes);
            showToast(t.likeSuccess, 'success');
        } catch (error) {
            showToast(t.likeError, 'error');
        } finally {
            setIsLiking(false);
        }
    };

    const handleSelectAi = (aiId: string | number) => {
        if (!slug) return;
        localStorage.setItem('lastSelectedAiId', String(aiId));
        navigate(`/${slug}/chat`);
    };

    const TabButton: React.FC<{id: string, label: string, icon: React.ReactNode}> = ({ id, label, icon }) => (
        <button onClick={() => setActiveTab(id)} className={`tab-btn ${activeTab === id ? 'active' : ''}`}>
          {icon}
          <span>{label}</span>
        </button>
    );

    const renderTabContent = () => {
        if (!center || !slug) return null;
        const eventContent = language === 'en' && center.eventEn ? center.eventEn : center.event;
        const centerName = language === 'en' && center.nameEn ? center.nameEn : center.name;

        switch (activeTab) {
            case 'schedule':
                return (
                    <div className="tab-content">
                        {eventContent ? (
                            <div className="detail-description" dangerouslySetInnerHTML={{ __html: eventContent }} />
                        ) : (
                            <div className="coming-soon">{t.scheduleInfo}</div>
                        )}
                    </div>
                );
            case 'agents':
                 return (
                    <div className="tab-content">
                        <h2>AI Agents at {centerName}</h2>
                        <div className="ai-agent-list">
                            {aiAgents.map(ai => (
                                <div key={ai.id} className="ai-agent-card" onClick={() => handleSelectAi(ai.id)}>
                                    <img src={ai.avatarUrl} alt={(language === 'en' && ai.nameEn) ? ai.nameEn : ai.name} />
                                    <div className="ai-agent-info">
                                        <h3>{(language === 'en' && ai.nameEn) ? ai.nameEn : ai.name}</h3>
                                        <p>{(language === 'en' && ai.descriptionEn) ? ai.descriptionEn : ai.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            case 'library':
                return (
                    <div className="tab-content coming-soon">
                         <Link to={`/${slug}/library`} className="library-link-text">
                            {t.libraryLinkText} &rarr;
                        </Link>
                    </div>
                );
            case 'dharma':
                 return (
                    <div className="tab-content coming-soon">
                         <Link to={`/${slug}/dharmatalks`} className="library-link-text">
                            {t.dharmaLinkText} &rarr;
                        </Link>
                    </div>
                );
            case 'offering':
                 const stripeOptions: StripeElementsOptions = {
                    clientSecret,
                    appearance: {
                        theme: 'stripe',
                        variables: { colorPrimary: '#991b1b', colorBackground: '#fefcf5' },
                    },
                 };
                 return (
                    <div className="tab-content offering-content">
                        <div className="offering-section-header">
                            <HeartIcon className="w-10 h-10"/>
                            <h2>{t.offeringSupportTitle.replace('{name}', centerName)}</h2>
                            <p>{t.offeringSupportSubtitle}</p>
                        </div>
                        <div className="offering-grid-3">
                            <div className="offering-card-feature">
                                <BellIcon className="w-12 h-12"/>
                                <h3>{t.recurringDanaTitle}</h3>
                                <p>{t.recurringDanaDesc}</p>
                                <ul>{t.recurringDanaFeatures.map((f: string, i: number) => <li key={i}>{f}</li>)}</ul>
                            </div>
                            <div className="offering-card-feature">
                                <SquaresIcon className="w-12 h-12"/>
                                <h3>{t.qrCodesTitle}</h3>
                                <p>{t.qrCodesDesc}</p>
                                <ul>{t.qrCodesFeatures.map((f: string, i: number) => <li key={i}>{f}</li>)}</ul>
                            </div>
                            <div className="offering-card-feature">
                                <BookOpenIcon className="w-12 h-12"/>
                                <h3>{t.meritDedicationTitle}</h3>
                                <p>{t.meritDedicationDesc}</p>
                                <ul>{t.meritDedicationFeatures.map((f: string, i: number) => <li key={i}>{f}</li>)}</ul>
                            </div>
                        </div>

                        <div className="donation-form-section">
                             <div className="offering-section-header">
                                <HeartIcon className="w-10 h-10"/>
                                <h2>{t.makeDonationTitle}</h2>
                                <p>{t.makeDonationSubtitle.replace('{name}', centerName)}</p>
                            </div>
                             <div className="amount-options">
                                <button type="button" onClick={() => { setSelectedAmount(100000); setCustomAmount('') }} className={`amount-option ${selectedAmount === 100000 ? 'selected' : ''}`}>
                                    <span className="amount">100.000đ</span>
                                    <span className="support-level">{t.basicSupport}</span>
                                </button>
                                <button type="button" onClick={() => { setSelectedAmount(500000); setCustomAmount('') }} className={`amount-option ${selectedAmount === 500000 ? 'selected' : ''}`}>
                                    <div className="popular-badge">{t.popular}</div>
                                    <span className="amount">500.000đ</span>
                                    <span className="support-level">{t.mediumSupport}</span>
                                </button>
                                <button type="button" onClick={() => { setSelectedAmount(1000000); setCustomAmount('') }} className={`amount-option ${selectedAmount === 1000000 ? 'selected' : ''}`}>
                                    <span className="amount">1.000.000đ</span>
                                    <span className="support-level">{t.majorSupport}</span>
                                </button>
                            </div>
                            <div className="custom-amount">
                                <label htmlFor="custom-amount-input">{t.customAmount}</label>
                                <input id="custom-amount-input" type="text" placeholder={t.enterAmount} value={customAmount} onChange={e => { setCustomAmount(e.target.value); setSelectedAmount('custom'); }} />
                            </div>
                            {isClientSecretLoading ? (
                                <div className="stripe-loader-overlay" style={{position: 'relative', height: '200px', backgroundColor: 'transparent'}}>
                                    <div className="stripe-loader-spinner"></div>
                                    <span>{t.paymentProcessing}</span>
                                </div>
                            ) : clientSecret && user ? (
                                <Elements stripe={stripePromise} options={stripeOptions}>
                                    <DonationForm 
                                        user={user} 
                                        center={center} 
                                        t={t} 
                                        onUserUpdate={onUserUpdate}
                                        navigate={navigate}
                                        location={location}
                                        language={language}
                                        enabledPaymentMethods={enabledPaymentMethods}
                                        isLoadingPaymentMethods={isLoadingPaymentMethods}
                                        amountVND={amountVND}
                                        clientSecret={clientSecret}
                                    />
                                </Elements>
                            ) : <p className="text-center">{user ? t.enterAmount : t.loginToOffer}</p>}
                        </div>
                    </div>
                );
            default:
                return <div className="tab-content coming-soon">{t.scheduleInfo}</div>
        }
    };

    if (isLoading) return <div className="loading-container">{t.loading}</div>;
    if (!center) return <div className="loading-container">{t.notFound}</div>;

    const centerName = language === 'en' && center.nameEn ? center.nameEn : center.name;

    return (
        <div className="space-detail-page">
            <div className="detail-card-container">
                <Link to="/" className="back-link"><ChevronLeftIcon className="w-5 h-5"/> {t.backToList}</Link>

                <div 
                    className="detail-image-container"
                    style={!center.imageUrl && center.spaceColor ? { backgroundColor: center.spaceColor } : {}}
                >
                    {center.imageUrl && <img src={center.imageUrl} alt={centerName} />}
                    <div className="detail-rank-badge">#{center.rank}</div>
                </div>

                <div className="detail-info-card">
                    <div className="detail-main-info">
                         <div className="detail-header-top">
                            {center.status && <span className="status-badge">{language === 'en' && center.statusEn ? center.statusEn : center.status}</span>}
                        </div>
                        <h1 className="detail-title">{centerName}</h1>
                        <p className="detail-description-short">{language === 'en' && center.descriptionEn ? center.descriptionEn : center.description}</p>
                        <div className="detail-meta">
                            <span><UsersIcon className="w-5 h-5" />{center.membersCount?.toLocaleString()} {t.members}</span>
                            <span><StarIcon className="w-5 h-5 text-yellow-400" />{center.rating} / 5.0</span>
                            <span><MapPinIcon className="w-5 h-5" />{language === 'en' && center.locationTextEn ? center.locationTextEn : center.locationText}</span>
                             <button onClick={handleLike} disabled={isLiking} className="flex items-center gap-1 p-1 rounded-full hover:bg-accent-red-light disabled:opacity-50">
                                <HeartIcon className="w-5 h-5 text-accent-red" />
                                <span className="font-semibold">{likes.toLocaleString()}</span>
                            </button>
                        </div>
                         <div className="detail-tags">
                            {(language === 'en' && center.tagsEn ? center.tagsEn : center.tags)?.map((tag: string) => <span key={tag} className="tag">{tag}</span>)}
                        </div>
                    </div>
                    <div className="detail-contact-card">
                        <h3>{t.contact}</h3>
                        <ul>
                            <li><GlobeAltIcon className="w-5 h-5"/> <a href="https://plumvillage.org" target="_blank" rel="noopener noreferrer">{center.website}</a></li>
                            <li><PhoneIcon className="w-5 h-5"/> <span>{center.phoneNumber}</span></li>
                            <li><EnvelopeIcon className="w-5 h-5"/> <span>{center.email}</span></li>
                        </ul>
                         <button className="join-btn">{t.joinCommunity}</button>
                    </div>
                </div>

                <div className="detail-tabs-card">
                     <div className="detail-tabs">
                        <TabButton id="schedule" label={t.tabSchedule} icon={<CalendarIcon className="w-5 h-5"/>}/>
                        <TabButton id="dharma" label={t.tabDharma} icon={<RadioIcon className="w-5 h-5"/>}/>
                        <TabButton id="library" label={t.tabLibrary} icon={<BookOpenIcon className="w-5 h-5"/>}/>
                        <TabButton id="agents" label={t.tabAgents} icon={<AiIcon className="w-5 h-5"/>}/>
                        <TabButton id="offering" label={t.tabOffering} icon={<HeartIcon className="w-5 h-5"/>}/>
                    </div>
                    {renderTabContent()}
                </div>
            </div>
        </div>
    );
};