// client/src/pages/AboutPage.tsx
import { Link } from "react-router-dom";
// FIX: Import UsersIcon to fix a reference error.
import { ChevronLeftIcon, SparkleIcon, HeartIcon, BookOpenIcon,  UsersIcon } from "../components/Icons";

// The TracingBeam component from the prompt is not available in this project.
// We'll use a simple div as a container and style it with CSS.
const TracingBeam: React.FC<{children: React.ReactNode, className?: string}> = ({ children, className }) => (
  <div className={`tracing-beam-container ${className || ''}`}>
    {children}
  </div>
);

const translations = {
    vi: {
        backToHome: "Trở về Trang chủ",
        aboutTitle: "Về Sáng kiến Giác Ngộ",
        subtitle: "Một nền tảng phi lợi nhuận trao quyền cho các tổ chức Phật giáo để bảo tồn kiến thức, đào tạo AI Agent và xây dựng một mạng lưới giác ngộ toàn cầu.",
        ourMission: "Sứ mệnh của Chúng tôi",
        missionText1: "Sáng kiến Giác Ngộ là một nền tảng công nghệ phi lợi nhuận được thiết kế đặc biệt cho các tổ chức Phật giáo—bao gồm chùa, trung tâm thiền và tu viện—để lưu giữ kiến thức kỹ thuật số, đào tạo AI Agent tùy chỉnh và kết nối với các hành giả trên toàn thế giới.",
        missionText2: "Chúng tôi cung cấp cơ sở hạ tầng và công cụ để các cộng đồng Phật giáo tạo ra các trợ lý AI của riêng họ, có khả năng trả lời câu hỏi, hướng dẫn hành giả và chia sẻ giáo lý một cách chân thực và dễ tiếp cận.",
        whatWeProvide: "Những gì Chúng tôi Cung cấp",
        knowledgeStorage: "Lưu trữ Kiến thức",
        knowledgeStorageDesc: "Kho lưu trữ an toàn, có tổ chức cho kinh điển, pháp thoại, giáo lý, Hỏi & Đáp và trí tuệ cộng đồng. Kiến thức của tổ chức bạn được bảo tồn và dễ dàng truy cập.",
        aiAgentTraining: "Đào tạo AI Agent",
        aiAgentTrainingDesc: "Đào tạo các AI Agent tùy chỉnh sử dụng giáo lý và dòng truyền thừa cụ thể của tổ chức bạn. Mỗi Agent học từ cơ sở kiến thức độc đáo của bạn để cung cấp hướng dẫn chân thực.",
        socialNetwork: "Mạng xã hội Giác ngộ",
        socialNetworkDesc: "Kết nối các hành giả trên toàn cầu thông qua một mạng xã hội thức tỉnh. Chia sẻ hiểu biết, tương tác với AI Agent và xây dựng một cộng đồng tập trung vào trí tuệ và lòng từ bi.",
        discoveryPlatform: "Nền tảng Khám phá",
        discoveryPlatformDesc: "Giúp các hành giả khám phá các chùa, trung tâm thiền và tu viện trên toàn thế giới. Mỗi trung tâm giới thiệu các dịch vụ, giáo lý và AI Agent độc đáo của mình.",
        howItWorks: "Cách Hoạt động",
        step1Title: "Đăng ký Tổ chức của bạn",
        step1Desc: "Các chùa, trung tâm thiền và tu viện Phật giáo tạo hồ sơ tổ chức của họ trên nền tảng.",
        step2Title: "Tải lên Kiến thức của bạn",
        step2Desc: "Lưu trữ kinh điển, pháp thoại, giáo lý, Hỏi & Đáp và trí tuệ cộng đồng của bạn trong một cơ sở kiến thức an toàn, có tổ chức.",
        step3Title: "Đào tạo AI Agent của bạn",
        step3Desc: "Nền tảng của chúng tôi đào tạo các AI Agent tùy chỉnh về giáo lý cụ thể của bạn, tạo ra các trợ lý thông minh đại diện chân thực cho dòng truyền thừa và trí tuệ của bạn.",
        step4Title: "Chia sẻ và Kết nối",
        step4Desc: "Các hành giả trên toàn thế giới có thể khám phá trung tâm của bạn, tương tác với AI Agent của bạn và kết nối thông qua mạng xã hội giác ngộ của chúng tôi.",
        whoWeServe: "Chúng tôi Phục vụ ai",
        serveTemples: "Chùa chiền Phật giáo",
        serveTemplesDesc: "Bảo tồn giáo lý và kết nối với tín đồ trên toàn cầu",
        serveCenters: "Trung tâm Thiền",
        serveCentersDesc: "Chia sẻ kỹ thuật thiền và hướng dẫn hành giả",
        serveMonasteries: "Tu viện",
        serveMonasteriesDesc: "Ghi lại đời sống tu viện và đào tạo AI Agent theo truyền thống của bạn",
        nonProfit: "Cam kết Phi lợi nhuận",
        nonProfitDesc1: "Sáng kiến Giác Ngộ hoạt động như một tổ chức phi lợi nhuận chuyên bảo tồn và chia sẻ trí tuệ Phật giáo. Sứ mệnh của chúng tôi là phục vụ cộng đồng Phật giáo toàn cầu, không phải để tạo ra lợi nhuận.",
        nonProfitDesc2: "Tất cả các đóng góp đều hỗ trợ phát triển nền tảng, cơ sở hạ tầng máy chủ và hỗ trợ kỹ thuật cho các tổ chức Phật giáo trên toàn thế giới."
    },
    en: {
        backToHome: "Back to Home",
        aboutTitle: "About Giác Ngộ Initiative",
        subtitle: "A non-profit platform empowering Buddhist organizations to preserve knowledge, train AI Agents, and build a global network of enlightenment",
        ourMission: "Our Mission",
        missionText1: "Giác Ngộ Initiative is a non-profit technology platform designed specifically for Buddhist organizations—including temples, meditation centers, and monasteries—to digitally preserve their knowledge, train custom AI Agents, and connect with practitioners worldwide.",
        missionText2: "We provide the infrastructure and tools for Buddhist communities to create their own AI-powered assistants that can answer questions, guide practitioners, and share teachings in an authentic and accessible way.",
        whatWeProvide: "What We Provide",
        knowledgeStorage: "Knowledge Storage",
        knowledgeStorageDesc: "Secure, organized repository for sutras, dharma talks, teachings, Q&As, and community wisdom. Your organization's knowledge is preserved and easily accessible.",
        aiAgentTraining: "AI Agent Training",
        aiAgentTrainingDesc: "Train custom AI Agents using your organization's specific teachings and lineage. Each Agent learns from your unique knowledge base to provide authentic guidance.",
        socialNetwork: "Social Network of Enlightenment",
        socialNetworkDesc: "Connect practitioners globally through an awakening social network. Share insights, engage with AI Agents, and build a community centered on wisdom and compassion.",
        discoveryPlatform: "Discovery Platform",
        discoveryPlatformDesc: "Help practitioners discover temples, meditation centers, and monasteries worldwide. Each center showcases its unique offerings, teachings, and AI Agents.",
        howItWorks: "How It Works",
        step1Title: "Register Your Organization",
        step1Desc: "Buddhist temples, meditation centers, and monasteries create their organizational profile on the platform.",
        step2Title: "Upload Your Knowledge",
        step2Desc: "Store your sutras, dharma talks, teachings, Q&As, and community wisdom in a secure, organized knowledge base.",
        step3Title: "Train Your AI Agents",
        step3Desc: "Our platform trains custom AI Agents on your specific teachings, creating intelligent assistants that authentically represent your lineage and wisdom.",
        step4Title: "Share and Connect",
        step4Desc: "Practitioners worldwide can discover your center, interact with your AI Agents, and connect through our social network of enlightenment.",
        whoWeServe: "Who We Serve",
        serveTemples: "Buddhist Temples",
        serveTemplesDesc: "Preserve teachings and connect with devotees globally",
        serveCenters: "Meditation Centers",
        serveCentersDesc: "Share meditation techniques and guide practitioners",
        serveMonasteries: "Monasteries",
        serveMonasteriesDesc: "Document monastic life and train AI Agents in your tradition",
        nonProfit: "Non-Profit Commitment",
        nonProfitDesc1: "Giác Ngộ Initiative operates as a non-profit organization dedicated to preserving and sharing Buddhist wisdom. Our mission is to serve the global Buddhist community, not to generate profit.",
        nonProfitDesc2: "All contributions support platform development, server infrastructure, and technical support for Buddhist organizations worldwide."
    }
};

const newLogoUrl = "/uploads/trainingFiles-1760925528911-497608075.png";

interface AboutPageProps {
  language: 'vi' | 'en';
}

export default function AboutPage({ language }: AboutPageProps) {
  const t = translations[language];

  return (
    <div className="about-page-container"> 
      <header>
              <div className="container">
                <Link to="/" data-testid="link-home">
                    <img src={newLogoUrl} alt="Giác Ngộ" className="h-8" />
                </Link>
                <Link to="/" data-testid="link-back" className="header-link">
                    <ChevronLeftIcon className="w-4 h-4" />
                    <span>{t.backToHome}</span>
                </Link>
              </div>
          </header> 
        <TracingBeam className="pt-24">
          <div className="relative mx-auto h-full w-full max-w-6xl">
          <div className="container mx-auto px-4 py-12 max-w-5xl">
            {/* Hero Section */}
            <div className="text-center mb-16">
              <div className="flex items-center justify-center gap-3 mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-building2 w-10 h-10 text-[#991b1b]"><path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z"></path><path d="M6 12H4a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2h2"></path><path d="M18 9h2a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-2"></path><path d="M10 6h4"></path><path d="M10 10h4"></path><path d="M10 14h4"></path><path d="M10 18h4"></path></svg>
                <h1 className="font-serif text-5xl font-bold text-[#991b1b]" data-testid="text-about-title">
                  {t.aboutTitle}
                </h1>
              </div>
              <p className="font-serif text-xl text-[#8B4513]/80 max-w-3xl mx-auto leading-relaxed">
                {t.subtitle}
              </p>
            </div>

            {/* Mission Statement */}
            <div className="bg-white/60 rounded-2xl border-2 border-[#8B4513]/30 p-10 mb-12">
              <h2 className="font-serif text-3xl font-bold text-[#991b1b] mb-6 text-center">
                {t.ourMission}
              </h2>
              <p className="font-serif text-lg text-[#2c2c2c] leading-relaxed mb-4">
                {t.missionText1}
              </p>
              <p className="font-serif text-lg text-[#2c2c2c] leading-relaxed">
                {t.missionText2}
              </p>
            </div>

            {/* What We Provide */}
            <div className="mb-12">
              <h2 className="font-serif text-3xl font-bold text-[#991b1b] mb-8 text-center">
                {t.whatWeProvide}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white/60 rounded-2xl border-2 border-[#8B4513]/30 p-8 hover:shadow-lg transition-all" data-testid="card-feature-storage">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-[#991b1b]/10 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-database w-6 h-6 text-[#991b1b]"><ellipse cx="12" cy="5" rx="9" ry="3"></ellipse><path d="M3 5V19A9 3 0 0 0 21 19V5"></path><path d="M3 12A9 3 0 0 0 21 12"></path></svg>
                    </div>
                    <h3 className="font-serif text-xl font-bold text-[#991b1b]">
                      {t.knowledgeStorage}
                    </h3>
                  </div>
                  <p className="font-serif text-[#2c2c2c] leading-relaxed">
                    {t.knowledgeStorageDesc}
                  </p>
                </div>

                <div className="bg-white/60 rounded-2xl border-2 border-[#8B4513]/30 p-8 hover:shadow-lg transition-all" data-testid="card-feature-ai">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-[#991b1b]/10 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-bot w-6 h-6 text-[#991b1b]"><path d="M12 8V4H8"></path><rect width="16" height="12" x="4" y="8" rx="2"></rect><path d="M2 14h2"></path><path d="M20 14h2"></path><path d="M15 13v2"></path><path d="M9 13v2"></path></svg>
                    </div>
                    <h3 className="font-serif text-xl font-bold text-[#991b1b]">
                      {t.aiAgentTraining}
                    </h3>
                  </div>
                  <p className="font-serif text-[#2c2c2c] leading-relaxed">
                    {t.aiAgentTrainingDesc}
                  </p>
                </div>

                <div className="bg-white/60 rounded-2xl border-2 border-[#8B4513]/30 p-8 hover:shadow-lg transition-all" data-testid="card-feature-network">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-[#991b1b]/10 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-network w-6 h-6 text-[#991b1b]"><rect x="16" y="16" width="6" height="6" rx="1"></rect><rect x="2" y="16" width="6" height="6" rx="1"></rect><rect x="9" y="2" width="6" height="6" rx="1"></rect><path d="M5 16v-3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3"></path><path d="M12 12V8"></path></svg>
                    </div>
                    <h3 className="font-serif text-xl font-bold text-[#991b1b]">
                      {t.socialNetwork}
                    </h3>
                  </div>
                  <p className="font-serif text-[#2c2c2c] leading-relaxed">
                    {t.socialNetworkDesc}
                  </p>
                </div>

                <div className="bg-white/60 rounded-2xl border-2 border-[#8B4513]/30 p-8 hover:shadow-lg transition-all" data-testid="card-feature-discovery">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full bg-[#991b1b]/10 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-globe w-6 h-6 text-[#991b1b]"><circle cx="12" cy="12" r="10"></circle><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"></path><path d="M2 12h20"></path></svg>
                    </div>
                    <h3 className="font-serif text-xl font-bold text-[#991b1b]">
                      {t.discoveryPlatform}
                    </h3>
                  </div>
                  <p className="font-serif text-[#2c2c2c] leading-relaxed">
                    {t.discoveryPlatformDesc}
                  </p>
                </div>
              </div>
            </div>

            {/* How It Works */}
            <div className="bg-gradient-to-br from-[#EFE0BD]/90 to-[#E5D5B7]/90 rounded-2xl border-2 border-[#8B4513]/30 p-10 mb-12">
              <h2 className="font-serif text-3xl font-bold text-[#991b1b] mb-8 text-center">
                {t.howItWorks}
              </h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#991b1b] text-white flex items-center justify-center font-serif font-bold">1</div>
                  <div><h3 className="font-serif text-lg font-bold text-[#2c2c2c] mb-2">{t.step1Title}</h3><p className="font-serif text-[#2c2c2c]/80 leading-relaxed">{t.step1Desc}</p></div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#991b1b] text-white flex items-center justify-center font-serif font-bold">2</div>
                  <div><h3 className="font-serif text-lg font-bold text-[#2c2c2c] mb-2">{t.step2Title}</h3><p className="font-serif text-[#2c2c2c]/80 leading-relaxed">{t.step2Desc}</p></div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#991b1b] text-white flex items-center justify-center font-serif font-bold">3</div>
                  <div><h3 className="font-serif text-lg font-bold text-[#2c2c2c] mb-2">{t.step3Title}</h3><p className="font-serif text-[#2c2c2c]/80 leading-relaxed">{t.step3Desc}</p></div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-10 h-10 rounded-full bg-[#991b1b] text-white flex items-center justify-center font-serif font-bold">4</div>
                  <div><h3 className="font-serif text-lg font-bold text-[#2c2c2c] mb-2">{t.step4Title}</h3><p className="font-serif text-[#2c2c2c]/80 leading-relaxed">{t.step4Desc}</p></div>
                </div>
              </div>
            </div>

            {/* Who We Serve */}
            <div className="mb-12">
              <h2 className="font-serif text-3xl font-bold text-[#991b1b] mb-8 text-center">{t.whoWeServe}</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white/60 rounded-2xl border-2 border-[#8B4513]/30 p-6 text-center" data-testid="card-serve-temples">
                  <div className="w-16 h-16 rounded-full bg-[#991b1b]/10 flex items-center justify-center mx-auto mb-4"><BookOpenIcon className="w-8 h-8 text-[#991b1b]" /></div>
                  <h3 className="font-serif text-xl font-bold text-[#991b1b] mb-2">{t.serveTemples}</h3><p className="font-serif text-sm text-[#2c2c2c]/70">{t.serveTemplesDesc}</p>
                </div>
                <div className="bg-white/60 rounded-2xl border-2 border-[#8B4513]/30 p-6 text-center" data-testid="card-serve-centers">
                  <div className="w-16 h-16 rounded-full bg-[#991b1b]/10 flex items-center justify-center mx-auto mb-4"><SparkleIcon className="w-8 h-8 text-[#991b1b]" /></div>
                  <h3 className="font-serif text-xl font-bold text-[#991b1b] mb-2">{t.serveCenters}</h3><p className="font-serif text-sm text-[#2c2c2c]/70">{t.serveCentersDesc}</p>
                </div>
                <div className="bg-white/60 rounded-2xl border-2 border-[#8B4513]/30 p-6 text-center" data-testid="card-serve-monasteries">
                  <div className="w-16 h-16 rounded-full bg-[#991b1b]/10 flex items-center justify-center mx-auto mb-4"><UsersIcon className="w-8 h-8 text-[#991b1b]" /></div>
                  <h3 className="font-serif text-xl font-bold text-[#991b1b] mb-2">{t.serveMonasteries}</h3><p className="font-serif text-sm text-[#2c2c2c]/70">{t.serveMonasteriesDesc}</p>
                </div>
              </div>
            </div>

            {/* Non-Profit Commitment */}
            <div className="bg-white/60 rounded-2xl border-2 border-[#8B4513]/30 p-10 text-center">
              <HeartIcon className="w-12 h-12 text-[#991b1b] mx-auto mb-4" />
              <h2 className="font-serif text-2xl font-bold text-[#991b1b] mb-4">{t.nonProfit}</h2>
              <p className="font-serif text-lg text-[#2c2c2c] leading-relaxed max-w-3xl mx-auto mb-6">{t.nonProfitDesc1}</p>
              <p className="font-serif text-base text-[#8B4513]/70 leading-relaxed max-w-2xl mx-auto">{t.nonProfitDesc2}</p>
            </div>
          </div>
          </div>
        </TracingBeam>   
    </div>
  );
}