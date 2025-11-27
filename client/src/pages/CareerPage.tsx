// client/src/pages/CareerPage.tsx
import  { useState } from "react";
import { Link } from "react-router-dom";
// FIX: Changed import from SparklesIcon to the correct SparkleIcon.
import { ChevronDownIcon, EnvelopeIcon, ChevronLeftIcon, SparkleIcon } from "../components/Icons";

const newLogoUrl = "/uploads/trainingFiles-1760925528911-497608075.png";

export default function CareerPage() {
  const language: 'vi' | 'en' = (localStorage.getItem('language') as 'vi' | 'en') || 'vi';
  const [expandedRole, setExpandedRole] = useState<number | null>(null);
  const [activeSection, setActiveSection] = useState<"career" | "volunteer">("career");

  const content = {
    vi: {
      title: "Tuyển dụng",
      subtitle: "Cùng xây dựng con đường giác ngộ bằng công nghệ",
      intro:
        "Giác Ngộ là tổ chức phi lợi nhuận ứng dụng trí tuệ nhân tạo để truyền tải triết lý Phật giáo và hỗ trợ hành giả quay về với bản thể. Ngoài năng lực kỹ thuật, chúng tôi đặc biệt trân trọng tâm đạo – tấm lòng hướng thiện, niềm say mê tìm hiểu giáo lý và thực hành tỉnh thức trong đời sống.",
      careerLabel: "Nghề nghiệp",
      volunteerLabel: "Tình nguyện",
      roles: [
        {
          title: "CTO / Tech Lead AI",
          summary: "Dẫn dắt tầm nhìn kỹ thuật và kiến trúc AI",
          experience: "5+ năm",
          responsibilities: [
            "Định hướng tầm nhìn kỹ thuật và kiến trúc tổng thể cho các dự án AI; dẫn dắt và cố vấn các kỹ sư khác, lập kế hoạch, phân chia công việc, theo dõi tiến độ và quản lý rủi ro",
            "Giám sát việc xây dựng hệ thống retrieval-augmented generation (RAG): thiết kế quy trình đầu cuối, tối ưu hoá cơ chế truy xuất, phát triển pipeline nạp dữ liệu và hệ thống đánh giá",
            "Hợp tác chặt chẽ với các nhóm nội dung, nghiên cứu và cộng đồng để đảm bảo sản phẩm phù hợp với triết lý Giác Ngộ",
          ],
          qualifications: [
            "Tối thiểu 5 năm kinh nghiệm trong lĩnh vực AI/ML và phát triển sản phẩm",
            "Hiểu sâu về mô hình ngôn ngữ lớn (LLM), RAG, fine-tuning, các cơ sở dữ liệu vector",
            "Thành thạo Python, các framework ML (PyTorch, TensorFlow) và có kinh nghiệm với MLOps, triển khai đám mây",
            "Có kỹ năng lãnh đạo, mentoring và khả năng phối hợp nhiều dự án",
            "Niềm quan tâm hoặc thực hành các giá trị Phật giáo và có tâm đạo",
          ],
          techStack: [
            "Python",
            "PyTorch",
            "TensorFlow",
            "LLM",
            "RAG",
            "Pinecone",
            "Weaviate",
            "Milvus",
            "MLOps",
            "Vector Databases",
          ],
        },
        {
          title: "Kỹ sư AI cấp cao – RAG & Fine-tuning",
          summary: "Thiết kế và triển khai hệ thống RAG",
          experience: "3+ năm",
          responsibilities: [
            "Thiết kế và triển khai hệ thống RAG; tối ưu cơ chế truy xuất và sinh để đạt độ chính xác, tốc độ và chi phí hợp lý",
            "Xây dựng và duy trì pipeline nạp dữ liệu, đánh giá và theo dõi mô hình",
            "Fine-tune mô hình LLM, phát triển prompt engineering và thử nghiệm các phương pháp kết hợp tri thức",
            "Làm việc cùng các chuyên gia nội dung để nâng cao chất lượng câu trả lời",
          ],
          qualifications: [
            "Thạc sĩ hoặc tiến sĩ ngành Khoa học máy tính, AI hoặc lĩnh vực liên quan",
            "Ít nhất 3 năm kinh nghiệm làm việc với LLM và cơ sở dữ liệu vector",
            "Thành thạo Python và các framework ML",
            "Hiểu biết về MLOps, hệ thống phân tán và bảo mật dữ liệu",
            "Yêu thích hoặc có kiến thức về Phật giáo và có tâm đạo",
          ],
          techStack: [
            "Python",
            "LLM",
            "RAG",
            "Vector Databases",
            "Fine-tuning",
            "Prompt Engineering",
            "MLOps",
            "Distributed Systems",
          ],
        },
        {
          title: "Lập trình viên Full-stack tích hợp AI",
          summary: "Xây dựng giao diện và API cho dịch vụ AI",
          experience: "3+ năm",
          responsibilities: [
            "Phát triển giao diện người dùng và API tích hợp các dịch vụ AI; đảm bảo trải nghiệm mượt mà giữa front-end và back-end",
            "Bảo trì codebase, triển khai và tối ưu hóa trên môi trường đám mây",
            "Hỗ trợ nhóm AI trong việc triển khai các tính năng mới và xử lý dữ liệu",
          ],
          qualifications: [
            "Ít nhất 3 năm kinh nghiệm full-stack (React, Next.js, Node.js)",
            "Hiểu về các API AI như OpenAI, hệ thống RAG và khả năng tích hợp chúng vào ứng dụng",
            "Kỹ năng viết mã sạch, dễ bảo trì và tinh thần học hỏi liên tục",
            "Quan tâm đến các sản phẩm mang lại giá trị tỉnh thức, hướng thiện và có tâm đạo",
          ],
          techStack: ["React", "Next.js", "Node.js", "TypeScript", "OpenAI API", "RAG", "REST API", "Cloud Deployment"],
        },
      ],
      volunteerRoles: [
        {
          title: "Biên tập & Dịch thuật Phật học",
          summary: "Hỗ trợ biên soạn và dịch thuật kinh điển Phật giáo",
          experience: "Linh hoạt",
          responsibilities: [
            "Rà soát, biên tập và tổ chức kinh điển, luận giải và giáo lý Phật giáo cho thư viện số",
            "Dịch thuật kinh điển Phật giáo giữa tiếng Việt, tiếng Anh và các ngôn ngữ khác, giữ nguyên ý nghĩa và ngữ cảnh",
            "Kiểm tra độ chính xác của bản dịch do AI tạo ra và đóng góp ý kiến để cải thiện hệ thống",
            "Hợp tác với các vị Thầy, học giả và hành giả để đảm bảo tính xác thực của giáo lý",
          ],
          qualifications: [
            "Thành thạo tiếng Việt và tiếng Anh; biết thêm tiếng Hán, Pali, Sanskrit là lợi thế",
            "Hiểu biết sâu về triết lý Phật giáo, kinh điển và các truyền thống tu tập",
            "Có kinh nghiệm dịch thuật, biên tập nội dung hoặc nghiên cứu học thuật về Phật học",
            "Tỉ mỉ và cam kết bảo toàn tính toàn vẹn của giáo lý",
            "Có tâm đạo vững vàng và tận tâm đưa Phật pháp đến với mọi người",
          ],
          techStack: ["Dịch thuật", "Biên tập", "Phật học", "Pali", "Sanskrit", "Nghiên cứu", "Hiệu đính"],
        },
        {
          title: "Quản lý Cộng đồng & Hỗ trợ Tâm linh",
          summary: "Hỗ trợ quản lý cộng đồng và đồng hành tu tập",
          experience: "Linh hoạt",
          responsibilities: [
            "Điều hành diễn đàn, nhóm chat và mạng xã hội với lòng từ bi và trí tuệ",
            "Giải đáp thắc mắc của người dùng về tu tập Phật giáo, thiền định và sử dụng nền tảng",
            "Tổ chức các sự kiện trực tuyến, buổi thiền và thảo luận Phật pháp",
            "Đóng góp ý kiến cho nhóm sản phẩm về nhu cầu người dùng và góc nhìn cộng đồng",
          ],
          qualifications: [
            "Thực hành Phật giáo tích cực và hiểu biết về các truyền thống và phương pháp khác nhau",
            "Kỹ năng giao tiếp xuất sắc bằng tiếng Việt và/hoặc tiếng Anh",
            "Có kinh nghiệm quản lý cộng đồng, hỗ trợ khách hàng hoặc giảng dạy",
            "Kiên nhẫn, đồng cảm và khả năng hướng dẫn người khác với lòng từ ái",
            "Cam kết xây dựng cộng đồng tâm linh hỗ trợ và hòa nhập",
          ],
          techStack: [
            "Quản lý cộng đồng",
            "Mạng xã hội",
            "Discord",
            "Telegram",
            "Hỗ trợ khách hàng",
            "Tổ chức sự kiện",
            "Điều phối",
          ],
        },
      ],
      culture: {
        title: "Văn hoá của chúng tôi",
        description:
          "Giác Ngộ đề cao tính minh bạch, lòng từ bi và tinh thần học hỏi gắn liền với tâm đạo. Chúng tôi tin rằng công nghệ có thể được dùng để giảm khổ, giúp con người trở về với bản tánh, nhưng điều này chỉ bền vững khi mỗi thành viên nuôi dưỡng đời sống tâm linh của mình. Ngoài công việc, chúng tôi khuyến khích nhân sự tham gia thiền tập, đọc kinh, chia sẻ hành trình tu tập và hỗ trợ lẫn nhau trên con đường giác ngộ.",
      },
      apply: {
        title: "Cách ứng tuyển",
        description: "Vui lòng gửi CV, liên kết GitHub, code mẫu hoặc portfolio của bạn tới email",
        email: "talent@giac.ngo",
        note: "Trong thư, hãy chia sẻ đôi điều về lý do bạn muốn kết hợp công nghệ với con đường giác ngộ.",
      },
      volunteerApply: {
        title: "Cách đăng ký tình nguyện",
        description: "Vui lòng gửi giới thiệu ngắn và lĩnh vực bạn quan tâm tới email",
        email: "talent@giac.ngo",
        note: "Chia sẻ về hành trình tu tập Phật giáo của bạn và cách bạn muốn đóng góp cho sứ mệnh của chúng tôi.",
      },
    },
    en: {
      title: "Careers",
      subtitle: "Building the path to enlightenment through technology",
      intro:
        "Giac Ngo is a non-profit organization that applies artificial intelligence to transmit Buddhist philosophy and help practitioners return to their true nature. Beyond technical excellence, we deeply value the spiritual heart (tâm đạo) – a genuine love for Buddhist teachings and a commitment to mindfulness practice.",
      careerLabel: "Career",
      volunteerLabel: "Volunteer",
      roles: [
        {
          title: "CTO / Tech Lead – AI",
          summary: "Lead technical vision and AI architecture",
          experience: "5+ years",
          responsibilities: [
            "Provide technical vision and overall architecture for AI projects; lead and mentor other engineers, plan and break down work, track progress and manage risks",
            "Oversee the construction of retrieval-augmented generation (RAG) systems: design end-to-end pipelines, optimize retrieval mechanisms, develop data ingestion pipelines and evaluation systems",
            "Collaborate closely with content, research and community teams to ensure products align with the Giac Ngo philosophy",
          ],
          qualifications: [
            "At least 5 years of experience in AI/ML and product development",
            "Deep understanding of large language models (LLM), RAG, fine-tuning and vector databases",
            "Proficiency in Python and ML frameworks (PyTorch, TensorFlow) and experience with MLOps and cloud deployment",
            "Strong leadership, mentoring and multi-project coordination skills",
            "A genuine interest in or practice of Buddhist values and a spiritual heart (tâm đạo)",
          ],
          techStack: [
            "Python",
            "PyTorch",
            "TensorFlow",
            "LLM",
            "RAG",
            "Pinecone",
            "Weaviate",
            "Milvus",
            "MLOps",
            "Vector Databases",
          ],
        },
        {
          title: "Senior AI Engineer – RAG & Fine-tuning",
          summary: "Design and implement RAG systems",
          experience: "3+ years",
          responsibilities: [
            "Design and implement RAG systems; optimize retrieval and generation mechanisms for accuracy, speed and cost",
            "Build and maintain data ingestion pipelines, evaluation and monitoring systems",
            "Fine-tune LLMs, develop prompt engineering strategies and experiment with knowledge integration methods",
            "Work with subject-matter experts to enhance answer quality",
          ],
          qualifications: [
            "Master's or Ph.D. in Computer Science, AI or a related field",
            "At least 3 years of experience working with LLMs and vector databases",
            "Proficiency in Python and ML frameworks",
            "Familiarity with MLOps, distributed systems and data security",
            "Interest in or knowledge of Buddhism and meditation practices and a spiritual heart",
          ],
          techStack: [
            "Python",
            "LLM",
            "RAG",
            "Vector Databases",
            "Fine-tuning",
            "Prompt Engineering",
            "MLOps",
            "Distributed Systems",
          ],
        },
        {
          title: "Full-stack Developer – AI Integration",
          summary: "Build user interfaces and APIs for AI services",
          experience: "3+ years",
          responsibilities: [
            "Develop user interfaces and APIs that integrate AI services; ensure a smooth experience between front-end and back-end components",
            "Maintain the codebase, deploy and optimize in cloud environments",
            "Support the AI team in deploying new features and handling data",
          ],
          qualifications: [
            "At least 3 years of full-stack experience (React, Next.js, Node.js)",
            "Knowledge of AI APIs such as OpenAI and RAG systems and the ability to integrate them into applications",
            "Ability to write clean, maintainable code and a spirit of continuous learning",
            "Interest in building products that provide mindful and compassionate value and a spiritual heart",
          ],
          techStack: ["React", "Next.js", "Node.js", "TypeScript", "OpenAI API", "RAG", "REST API", "Cloud Deployment"],
        },
      ],
      volunteerRoles: [
        {
          title: "Buddhist Content Curator & Translator",
          summary: "Help curate and translate Buddhist texts and teachings",
          experience: "Flexible",
          responsibilities: [
            "Review, curate and organize Buddhist sutras, commentaries and teachings for the digital library",
            "Translate Buddhist texts between Vietnamese, English and other languages while preserving meaning and context",
            "Verify accuracy of AI-generated translations and provide feedback to improve the system",
            "Collaborate with monks, scholars and practitioners to ensure authenticity of teachings",
          ],
          qualifications: [
            "Fluency in Vietnamese and English; additional languages (Chinese, Pali, Sanskrit) are a plus",
            "Deep knowledge of Buddhist philosophy, sutras and practice traditions",
            "Experience in translation, content curation or academic research in Buddhist studies",
            "Attention to detail and commitment to preserving the integrity of teachings",
            "Strong tâm đạo and dedication to making the Dharma accessible to all",
          ],
          techStack: ["Translation", "Content Curation", "Buddhist Studies", "Pali", "Sanskrit", "Research", "Editing"],
        },
        {
          title: "Community Manager & Support Volunteer",
          summary: "Help manage community and provide spiritual support",
          experience: "Flexible",
          responsibilities: [
            "Moderate community forums, chat groups and social media channels with compassion and wisdom",
            "Answer user questions about Buddhist practice, meditation and using the platform",
            "Organize online events, meditation sessions and Dharma discussions",
            "Provide feedback to the product team about user needs and community insights",
          ],
          qualifications: [
            "Active Buddhist practice and understanding of various traditions and approaches",
            "Excellent communication skills in Vietnamese and/or English",
            "Experience in community management, customer support or teaching",
            "Patience, empathy and ability to guide others with kindness",
            "Commitment to fostering a supportive, inclusive spiritual community",
          ],
          techStack: [
            "Community Management",
            "Social Media",
            "Discord",
            "Telegram",
            "Customer Support",
            "Event Planning",
            "Facilitation",
          ],
        },
      ],
      culture: {
        title: "Our Culture",
        description:
          "Giac Ngo values transparency, compassion and a love of learning aligned with a spiritual path. We believe technology can be used to alleviate suffering and help people return to their true nature, but this is sustainable only when each member nurtures their own inner journey. Beyond work, we encourage colleagues to meditate, study sutras and share their spiritual journeys, cultivating an environment of support and mutual growth.",
      },
      apply: {
        title: "How to Apply",
        description: "Please send your resume, GitHub links, code samples or portfolio to",
        email: "talent@giac.ngo",
        note: "In your message, share a few words about why you want to combine technology with the path to enlightenment.",
      },
      volunteerApply: {
        title: "How to Volunteer",
        description: "Please send a brief introduction and your areas of interest to",
        email: "talent@giac.ngo",
        note: "Share your Buddhist practice background and how you'd like to contribute to our mission.",
      },
    },
  };

  const currentContent = content[language];
  const currentRoles = activeSection === "career" ? currentContent.roles : currentContent.volunteerRoles;
  const currentApply = activeSection === "career" ? currentContent.apply : currentContent.volunteerApply;

  return (
    <div className="career-page-container">
       <header>
                    <div className="container">
                      <Link to="/" data-testid="link-home">
                          <img src={newLogoUrl} alt="Giác Ngộ" className="h-8" />
                      </Link>
                      <Link to="/" data-testid="link-back" className="header-link">
                          <ChevronLeftIcon className="w-4 h-4" />
                          <span>{language === "en" ? "Back to Home" : "Trở về Trang chủ"}</span>
                      </Link>
                    </div>
                </header> 
         <div className="relative mx-auto h-full w-full max-w-6xl pt-24">
        <div className="content-section">
          <div className="content-title">
            <SparkleIcon className="icon" />
            <h1 data-testid="heading-career-title">{currentContent.title}</h1>
            <SparkleIcon className="icon" />
          </div>
          <p className="content-subtitle">{currentContent.subtitle}</p>
          <p className="content-intro">{currentContent.intro}</p>
        </div>

        <div className="section-toggle">
          <div className="toggle-group">
            <button
              onClick={() => {
                setActiveSection("career");
                setExpandedRole(null);
              }}
              className={activeSection === "career" ? "active" : ""}
              data-testid="button-section-career"
            >
              {currentContent.careerLabel}
            </button>
            <button
              onClick={() => {
                setActiveSection("volunteer");
                setExpandedRole(null);
              }}
              className={activeSection === "volunteer" ? "active" : ""}
              data-testid="button-section-volunteer"
            >
              {currentContent.volunteerLabel}
            </button>
          </div>
        </div>

        <div className="roles-list">
          {currentRoles.map((role, index) => (
            <div key={index} className="role-card">
              <button
                onClick={() => setExpandedRole(expandedRole === index ? null : index)}
                className="role-header"
                data-testid={`button-toggle-role-${index}`}
              >
                <div className="role-summary">
                  <h3>{role.title}</h3>
                  <p>{role.summary}</p>
                  <div className="role-pills">
                    <span className="pill">{role.experience}</span>
                    <span className="pill">{language === "en" ? "Remote" : "Từ xa"}</span>
                  </div>
                </div>
                <ChevronDownIcon className={`chevron ${expandedRole === index ? "expanded" : ""}`} />
              </button>

              <div className={`role-details ${expandedRole === index ? "expanded" : ""}`}>
                <div className="details-content">
                  <div className="tech-stack">
                    <h4>{language === "en" ? "Tech Stack" : "Công nghệ"}</h4>
                    <div className="tech-pills">
                      {role.techStack.map((tech, techIndex) => (
                        <span key={techIndex} className="pill-tech">{tech}</span>
                      ))}
                    </div>
                  </div>
                  <div className="responsibilities">
                    <h4>{language === "en" ? "Role" : "Vai trò"}</h4>
                    <ul>
                      {role.responsibilities.map((resp, respIndex) => (
                        <li key={respIndex}>{resp}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="qualifications">
                    <h4>{language === "en" ? "Qualifications" : "Yêu cầu"}</h4>
                    <ul>
                      {role.qualifications.map((qual, qualIndex) => (
                        <li key={qualIndex}>{qual}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="culture-section">
          <div className="culture-card">
            <h2 data-testid="heading-culture">{currentContent.culture.title}</h2>
            <p>{currentContent.culture.description}</p>
          </div>
        </div>

        <div className="apply-section">
          <div className="apply-card">
            <h2 data-testid="heading-apply">{currentApply.title}</h2>
            <p>{currentApply.description}</p>
            <a href={`mailto:${currentApply.email}`} className="btn btn-primary" data-testid="link-email-apply">
              <EnvelopeIcon className="icon" />
              {currentApply.email}
            </a>
            <p className="apply-note">{currentApply.note}</p>
          </div>
        </div>
        <br></br>
        </div>
      
    </div>
  );
}
