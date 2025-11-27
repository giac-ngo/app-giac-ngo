// client/src/pages/DonationPage.tsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ChevronLeftIcon, SparkleIcon, HeartIcon, BookOpenIcon, DashboardIcon as HomeIcon, CardIcon, CashAppIcon, ApplePayIcon, VenmoIcon, USBankIcon, GooglePayIcon, AmazonPayIcon, LinkIcon } from "../components/Icons";
import { useToast } from '../components/ToastProvider';
import { apiService } from '../services/apiService';
import { User } from '../types';


const newLogoUrl = "/uploads/trainingFiles-1760925528911-497608075.png";

const translations = {
  vi: {
    backHome: "Trở về Trang chủ",
    title: "Hồi Hướng Công Đức",
    subtitle: "Hành động trở về: Cúng dường công đức cho chúng sinh",

    meritSection: {
      title: "Hồi Hướng Công Đức",
      subtitle: "Hành động trở về: Cúng dường công đức cho chúng sinh",
      offeringTitle: "Lời Cúng Dường Công Đức",
      offeringDescription: "Đây không chỉ là một khoản đóng góp. Đây là thực hành cúng dường vô ngã.",
      cards: [
        {
          title: "Hành Động Của Bạn",
          description: "Bằng cách cho đi không mong cầu phần thưởng cá nhân, bạn đang thực hiện hành động",
          highlight: "Hồi Hướng Công Đức",
          descriptionEnd: "—sự cúng dường vô ngã về công đức nội tại.",
        },
        {
          title: "Động Cơ",
          description: "Công đức này không dành cho một người, mà cho tất cả. Nó được hồi hướng cho sự giải thoát và giác ngộ của chúng sinh.",
        },
        {
          title: "Kết Quả",
          description: "Bạn đang gieo hạt giống giác ngộ, thoát khỏi những ràng buộc của nhân quả chi phối các phước báo thế gian.",
        },
      ],
      buddhaWorkTitle: "Hỗ Trợ Công Việc Giác Ngộ (Phật Sự)",
      buddhaWorkDescription: "100% lời cúng dường của bạn hỗ trợ trực tiếp sự tiếp nối Phật pháp trên thế gian này. Đóng góp của bạn được sử dụng cho:",
      buddhaWorkAreas: [
        {
          title: "Duy Trì Tăng Đoàn",
          description: "Phụng dưỡng các bậc thầy và hành giả cống hiến đời mình cho việc giữ gìn và truyền tải giáo pháp.",
        },
        {
          title: "Hoằng Bố Phật Pháp",
          description: "Tài trợ việc biên soạn và chia sẻ giáo lý, kinh điển và tài nguyên số hóa đến với những ai đang tìm kiếm.",
        },
        {
          title: "Duy Trì Không Gian Tu Tập",
          description: "Đảm bảo các nơi tu tập vật lý và số của chúng tôi luôn thanh tịnh, dễ tiếp cận và thuận lợi cho tu tập.",
        },
        {
          title: "Hành Động Từ Bi Chân Thật",
          description: "Thực hiện các dự án giảm khổ đau và dẫn dắt người khác đến con đường giải thoát.",
        },
      ],
    },

    donorForm: {
      title: "Ghi Danh Công Đức",
      description: "Xin mời điền thông tin để ghi nhận lời cúng dường và hồi hướng công đức.",
      fullName: "Họ và Tên",
      fullNamePlaceholder: "Nguyễn Văn Minh",
      email: "Email",
      emailPlaceholder: "minh.nguyen@email.vn",
      dedicatedTo: "Hồi Hướng Công Đức Cho (Tùy Chọn)",
      dedicatedToPlaceholder: "VD: Cha mẹ, Tổ tiên, Chúng sinh khắp mười phương...",
      intention: "Lời Nguyện (Tùy Chọn)",
      intentionPlaceholder: "Chia sẻ tâm nguyện và lời cầu nguyện của bạn...",
      submitButton: "Ghi Danh",
      submitNote: "Công đức này được hồi hướng cho sự giải thoát và giác ngộ của tất cả chúng sinh.",
    },

    donation: {
      title: "Cúng Dường Tương Tác",
      description: "Trải nghiệm cách người cúng dường sẽ tương tác với trang cúng dường của bạn. Chọn số tiền và thử giao diện.",
      amounts: [
        { value: 100000, label: "100.000đ", subtitle: "Hỗ trợ cơ bản" },
        { value: 300000, label: "300.000đ", subtitle: "Hỗ trợ trung bình", popular: true },
        { value: 1000000, label: "1.000.000đ", subtitle: "Hỗ trợ lớn" },
      ],
      customAmount: "Hoặc nhập số tiền tùy ý",
      customPlaceholder: "Nhập số tiền (VNĐ)",
      paymentMethod: "Phương Thức Thanh Toán",
      cardInfo: "Thông Tin Thẻ",
      cardNumber: "Số thẻ",
      expiration: "Ngày hết hạn",
      country: "Quốc gia",
      completeDonation: "Hoàn Tất Cúng Dường",
      demoNote: "Đây là demo. Không có giao dịch thực sự được xử lý.",
      paymentMethodsLoadError: 'Không thể tải các phương thức thanh toán.',
    },
  },
  en: {
    backHome: "Back to Home",
    title: "Hồi Hướng Công Đức",
    subtitle: "The Act of Returning: Dedicating Merit to All Beings",

    meritSection: {
      title: "Hồi Hướng Công Đức",
      subtitle: "The Act of Returning: Dedicating Merit to All Beings",
      offeringTitle: "An Offering of Merit (Công Đức)",
      offeringDescription: "This is more than a donation. It is a practice of selfless offering.",
      cards: [
        {
          title: "Your Action",
          description: "By giving without expectation of personal reward, you are performing the act of",
          highlight: "Hồi Hướng Công Đức",
          descriptionEnd: "—the selfless dedication of intrinsic merit.",
        },
        {
          title: "The Intention",
          description: "This merit is not for one, but for all. It is dedicated to the liberation and awakening of all beings.",
        },
        {
          title: "The Result",
          description: "You are planting a seed of awakening, free from the bonds of cause and effect that govern worldly blessings.",
        },
      ],
      buddhaWorkTitle: "Supporting the Work of Awakening (Phật Sự)",
      buddhaWorkDescription: "100% of your offering directly supports the continuation of the Dharma in this world. Your contribution is used exclusively for:",
      buddhaWorkAreas: [
        {
          title: "Sustaining the Sangha",
          description: "Providing for masters and practitioners who dedicate their lives to holding and transmitting the teachings.",
        },
        {
          title: "Spreading the Dharma",
          description: "Funding the creation and sharing of teachings, texts, and digital resources to reach all who are searching.",
        },
        {
          title: "Maintaining Sacred Space",
          description: "Ensuring our physical and digital sanctuaries remain pure, accessible, and conducive to practice.",
        },
        {
          title: "Acts of True Compassion",
          description: "Enabling projects that alleviate suffering and guide others toward the path of liberation.",
        },
      ],
    },

    donorForm: {
      title: "Merit Dedication Register",
      description: "Please share your information to record your offering and merit dedication.",
      fullName: "Full Name",
      fullNamePlaceholder: "Nguyen Van Minh",
      email: "Email",
      emailPlaceholder: "minh.nguyen@email.com",
      dedicatedTo: "Dedicated To (Optional)",
      dedicatedToPlaceholder: "e.g., Parents, Ancestors, All sentient beings...",
      intention: "Your Intention (Optional)",
      intentionPlaceholder: "Share your aspiration and prayer...",
      submitButton: "Register",
      submitNote: "This merit is dedicated to the liberation and awakening of all beings.",
    },

    donation: {
      title: "Interactive Donation Demo",
      description: "Experience how your donors will interact with your donation page. Select an amount and try the interface.",
      amounts: [
        { value: 100000, label: "100,000đ", subtitle: "Basic support" },
        { value: 300000, label: "300,000đ", subtitle: "Medium support", popular: true },
        { value: 1000000, label: "1,000,000đ", subtitle: "Major support" },
      ],
      customAmount: "Or enter custom amount",
      customPlaceholder: "Enter amount (VND)",
      paymentMethod: "Payment Method",
      cardInfo: "Card Information",
      cardNumber: "Card number",
      expiration: "Expiration",
      country: "Country",
      completeDonation: "Complete Donation",
      demoNote: "This is a demo. No actual payment will be processed.",
      paymentMethodsLoadError: 'Could not load payment methods.',
    },
  },
};


interface DonationDemoProps {
    language: 'vi' | 'en';
    currentContent: typeof translations['vi'];
    user: User | null;
}

const DonationDemo: React.FC<DonationDemoProps> = ({ language, currentContent, user }) => {
    const [selectedAmount, setSelectedAmount] = useState<number | null>(300000);
    const [customAmount, setCustomAmount] = useState<string>("");
    const [paymentMethod, setPaymentMethod] = useState<string>("card");
    const [enabledPaymentMethods, setEnabledPaymentMethods] = useState<string[]>([]);
    const [isLoadingPaymentMethods, setIsLoadingPaymentMethods] = useState(true);
    const { showToast } = useToast();

    useEffect(() => {
        if (!user) { // No need to fetch if not logged in
            setIsLoadingPaymentMethods(false);
            setEnabledPaymentMethods(['card']);
            return;
        }
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
                showToast(currentContent.donation.paymentMethodsLoadError, 'error');
                setEnabledPaymentMethods(['card']); // Fallback to card only
            })
            .finally(() => setIsLoadingPaymentMethods(false));
    }, [user, showToast, currentContent.donation.paymentMethodsLoadError]);


    const handleAmountSelect = (amount: number) => {
        setSelectedAmount(amount);
        setCustomAmount("");
    };

    const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const numericValue = e.target.value.replace(/\D/g, "");
        setCustomAmount(numericValue);
        if (numericValue) {
            setSelectedAmount(null);
        }
    };
    
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

    return (
        <div className="form-section">
            <div className="flex items-center gap-3 mb-4">
                <HeartIcon className="w-6 h-6 text-[#991b1b]" />
                <h2 className="section-title-form">{currentContent.donation.title}</h2>
            </div>
            <p className="form-description">{currentContent.donation.description}</p>

            <div className="card-grid-3 mb-6">
                {currentContent.donation.amounts.map((amount) => (
                    <button key={amount.value} onClick={() => handleAmountSelect(amount.value)} className={`amount-card ${selectedAmount === amount.value ? "selected" : ""}`} data-testid={`button-amount-${amount.value}`}>
                        {amount.popular && <div className="popular-badge">{language === 'vi' ? 'Phổ biến' : 'Popular'}</div>}
                        <div className="flex items-center gap-2 mb-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-flower2 w-10 h-10 text-[#991b1b]"><path d="M12 5a3 3 0 1 1 3 3m-3-3a3 3 0 1 0-3 3m3-3v1M9 8a3 3 0 1 0 3 3M9 8h1m5 0a3 3 0 1 1-3 3m3-3h-1m-2 3v-1"></path><circle cx="12" cy="8" r="2"></circle><path d="M12 10v12"></path><path d="M12 22c4.2 0 7-1.667 7-5-4.2 0-7 1.667-7 5Z"></path><path d="M12 22c-4.2 0-7-1.667-7-5 4.2 0 7 1.667 7 5Z"></path></svg>
                            <span className="amount-label">{amount.label}</span>
                        </div>
                        <p className="amount-subtitle">{amount.subtitle}</p>
                    </button>
                ))}
            </div>

            <div className="mb-6">
                <label className="form-label">{currentContent.donation.customAmount}</label>
                <input value={customAmount} onChange={handleCustomAmountChange} placeholder={currentContent.donation.customPlaceholder} className="form-input" data-testid="input-custom-amount" />
            </div>

            <div className="mb-6">
                <label className="form-label mb-3">{currentContent.donation.paymentMethod}</label>
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

            {paymentMethod === "card" && (
                <div className="mb-6">
                    <label className="form-label mb-3">{currentContent.donation.cardInfo}</label>
                    <div className="space-y-4">
                        <input placeholder={currentContent.donation.cardNumber} className="form-input" data-testid="input-card-number" />
                        <div className="grid grid-cols-2 gap-4">
                            <input placeholder={currentContent.donation.expiration} className="form-input" data-testid="input-expiry" />
                            <input placeholder="CVC" className="form-input" data-testid="input-cvc" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <select className="form-input">
                                <option>Vietnam</option>
                                <option>United States</option>
                                <option>United Kingdom</option>
                            </select>
                            <input placeholder="12345" className="form-input" data-testid="input-zip" />
                        </div>
                    </div>
                </div>
            )}

            <button className="form-submit-btn" data-testid="button-complete-donation">
                {currentContent.donation.completeDonation}
            </button>
            <p className="demo-note">{currentContent.donation.demoNote}</p>
        </div>
    );
};


interface DonationPageProps {
  user: User | null;
  onUserUpdate: (updatedData: Partial<User>) => void;
}

// FIX: Corrected component signature to use React.FC and the defined props interface.
export const DonationPage: React.FC<DonationPageProps> = ({ user }) => {
  const language: 'vi' | 'en' = (localStorage.getItem('language') as 'vi' | 'en') || 'vi';
  const currentContent = translations[language];

  const [donorInfo, setDonorInfo] = useState({
    fullName: "",
    email: "",
    dedicatedTo: "",
    intention: "",
  });

  const handleDonorInfoChange = (field: string, value: string) => {
    setDonorInfo({ ...donorInfo, [field]: value });
  };

  return (
    <div className="donation-page-container">      
          <header>
            <div className="container">
                <Link to="/" data-testid="link-home">
                    <img src={newLogoUrl} alt="Giác Ngộ" className="h-8" />
                </Link>
                <Link to="/" data-testid="link-back" className="header-link">
                    <ChevronLeftIcon className="w-4 h-4" />
                    <span>{currentContent.backHome}</span>
                </Link>
            </div>
          </header>
      <div className="relative mx-auto h-full w-full max-w-6xl pt-24">
        <div className="container py-12 max-w-6xl">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center gap-3 mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-flower2 w-10 h-10 text-[#991b1b]"><path d="M12 5a3 3 0 1 1 3 3m-3-3a3 3 0 1 0-3 3m3-3v1M9 8a3 3 0 1 0 3 3M9 8h1m5 0a3 3 0 1 1-3 3m3-3h-1m-2 3v-1"></path><circle cx="12" cy="8" r="2"></circle><path d="M12 10v12"></path><path d="M12 22c4.2 0 7-1.667 7-5-4.2 0-7 1.667-7 5Z"></path><path d="M12 22c-4.2 0-7-1.667-7-5 4.2 0 7 1.667 7 5Z"></path></svg>
              <h1 className="hero-title" data-testid="text-hero-title">
                {currentContent.title}
              </h1>
            </div>
            <p className="hero-subtitle">
              {currentContent.subtitle}
            </p>
          </div>

          <div className="merit-section">
            <div className="text-center mb-8">
              <div className="flex items-center justify-center gap-3 mb-3">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-flower2 w-10 h-10 text-[#991b1b]"><path d="M12 5a3 3 0 1 1 3 3m-3-3a3 3 0 1 0-3 3m3-3v1M9 8a3 3 0 1 0 3 3M9 8h1m5 0a3 3 0 1 1-3 3m3-3h-1m-2 3v-1"></path><circle cx="12" cy="8" r="2"></circle><path d="M12 10v12"></path><path d="M12 22c4.2 0 7-1.667 7-5-4.2 0-7 1.667-7 5Z"></path><path d="M12 22c-4.2 0-7-1.667-7-5 4.2 0 7 1.667 7 5Z"></path></svg>
                <h3 className="section-title">{currentContent.meritSection.title}</h3>
              </div>
              <p className="section-subtitle">{currentContent.meritSection.subtitle}</p>
            </div>

            <div className="mb-8">
              <h4 className="offering-title">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-flower2 w-10 h-10 text-[#991b1b]"><path d="M12 5a3 3 0 1 1 3 3m-3-3a3 3 0 1 0-3 3m3-3v1M9 8a3 3 0 1 0 3 3M9 8h1m5 0a3 3 0 1 1-3 3m3-3h-1m-2 3v-1"></path><circle cx="12" cy="8" r="2"></circle><path d="M12 10v12"></path><path d="M12 22c4.2 0 7-1.667 7-5-4.2 0-7 1.667-7 5Z"></path><path d="M12 22c-4.2 0-7-1.667-7-5 4.2 0 7 1.667 7 5Z"></path></svg>
                {currentContent.meritSection.offeringTitle}
              </h4>
              <p className="offering-description">
                {currentContent.meritSection.offeringDescription}
              </p>

              <div className="card-grid-3">
                {currentContent.meritSection.cards.map((card, idx) => (
                  <div key={idx} className="merit-card">
                    <div className="flex items-start gap-3 mb-3">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-flower2 w-10 h-10 text-[#991b1b]"><path d="M12 5a3 3 0 1 1 3 3m-3-3a3 3 0 1 0-3 3m3-3v1M9 8a3 3 0 1 0 3 3M9 8h1m5 0a3 3 0 1 1-3 3m3-3h-1m-2 3v-1"></path><circle cx="12" cy="8" r="2"></circle><path d="M12 10v12"></path><path d="M12 22c4.2 0 7-1.667 7-5-4.2 0-7 1.667-7 5Z"></path><path d="M12 22c-4.2 0-7-1.667-7-5 4.2 0 7 1.667 7 5Z"></path></svg>
                      <h5 className="merit-card-title">{card.title}</h5>
                    </div>
                    <p className="merit-card-description">
                      {card.description}
                      {card.highlight && (
                        <>
                          {" "}<span className="font-semibold text-[#991b1b]">{card.highlight}</span>{card.descriptionEnd}
                        </>
                      )}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="offering-title">
                <HomeIcon className="w-6 h-6 text-[#991b1b]" />
                {currentContent.meritSection.buddhaWorkTitle}
              </h4>
              <p className="offering-description">
                {currentContent.meritSection.buddhaWorkDescription}
              </p>

              <div className="card-grid-2">
                {currentContent.meritSection.buddhaWorkAreas.map((area, idx) => {
                  const icons = [SparkleIcon, BookOpenIcon, HomeIcon, HeartIcon];
                  const Icon = icons[idx];

                  return (
                    <div key={idx} className="work-area-card">
                      <Icon className="w-8 h-8 text-[#991b1b] flex-shrink-0" />
                      <div>
                        <h5 className="work-area-title">{area.title}</h5>
                        <p className="work-area-description">
                          {area.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="form-section">
            <div className="flex items-center gap-3 mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-flower2 w-10 h-10 text-[#991b1b]"><path d="M12 5a3 3 0 1 1 3 3m-3-3a3 3 0 1 0-3 3m3-3v1M9 8a3 3 0 1 0 3 3M9 8h1m5 0a3 3 0 1 1-3 3m3-3h-1m-2 3v-1"></path><circle cx="12" cy="8" r="2"></circle><path d="M12 10v12"></path><path d="M12 22c4.2 0 7-1.667 7-5-4.2 0-7 1.667-7 5Z"></path><path d="M12 22c-4.2 0-7-1.667-7-5 4.2 0 7 1.667 7 5Z"></path></svg>
              <h2 className="section-title-form">
                {currentContent.donorForm.title}
              </h2>
            </div>
            <p className="form-description">
              {currentContent.donorForm.description}
            </p>

            <div className="mb-6">
              <label className="form-label">
                {currentContent.donorForm.fullName}
              </label>
              <input value={donorInfo.fullName} onChange={(e) => handleDonorInfoChange("fullName", e.target.value)} placeholder={currentContent.donorForm.fullNamePlaceholder} className="form-input" data-testid="input-full-name" />
            </div>

            <div className="mb-6">
              <label className="form-label">{currentContent.donorForm.email}</label>
              <input type="email" value={donorInfo.email} onChange={(e) => handleDonorInfoChange("email", e.target.value)} placeholder={currentContent.donorForm.emailPlaceholder} className="form-input" data-testid="input-email" />
            </div>

            <div className="mb-6">
              <label className="form-label">{currentContent.donorForm.dedicatedTo}</label>
              <input value={donorInfo.dedicatedTo} onChange={(e) => handleDonorInfoChange("dedicatedTo", e.target.value)} placeholder={currentContent.donorForm.dedicatedToPlaceholder} className="form-input" data-testid="input-dedicated-to" />
            </div>

            <div className="mb-6">
              <label className="form-label">{currentContent.donorForm.intention}</label>
              <textarea value={donorInfo.intention} onChange={(e) => handleDonorInfoChange("intention", e.target.value)} placeholder={currentContent.donorForm.intentionPlaceholder} className="form-textarea" data-testid="textarea-intention" />
            </div>

            <button className="form-submit-btn" data-testid="button-submit-merit-dedication">
              {currentContent.donorForm.submitButton}
            </button>
            <p className="form-submit-note">{currentContent.donorForm.submitNote}</p>
          </div>
          
          <DonationDemo language={language} currentContent={currentContent} user={user} />
          
        </div>
      </div>
    </div>
  );
}