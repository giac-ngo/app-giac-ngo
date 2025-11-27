// client/src/pages/PrivacyPage.tsx
import { Link } from "react-router-dom";
import { ChevronLeftIcon } from "../components/Icons";

const newLogoUrl = "/uploads/trainingFiles-1760925528911-497608075.png";

export default function PrivacyPage() {
   const language: 'vi' | 'en' = (localStorage.getItem('language') as 'vi' | 'en') || 'vi';

  const content = {
    vi: {
      title: "Chính sách quyền riêng tư",
      subtitle: "Giác Ngộ – Chính sách quyền riêng tư",
      effectiveDate: "Ngày có hiệu lực: 10/06/2025",
      sections: [
        {
          title: "1. Giới thiệu",
          content:
            "Chính sách quyền riêng tư này mô tả cách Giác Ngộ thu thập, sử dụng, lưu trữ và chia sẻ dữ liệu cá nhân. Chúng tôi tuân thủ các nguyên tắc minh bạch, an toàn và tôn trọng quyền riêng tư.",
        },
        {
          title: "2. Dữ liệu thu thập",
          content:
            "Chúng tôi thu thập thông tin cá nhân khi bạn sử dụng Dịch vụ, bao gồm:\n\n• Thông tin nhận dạng: tên, địa chỉ email, số điện thoại, tên người dùng và mật khẩu\n• Dữ liệu tương tác: nội dung hội thoại với chatbot, phản hồi, bình luận, bài đăng\n• Dữ liệu thanh toán: số lượng tiền mã hóa (USDC), địa chỉ ví và lịch sử giao dịch\n• Dữ liệu kỹ thuật: địa chỉ IP, loại trình duyệt, hệ điều hành, cookie",
        },
        {
          title: "3. Mục đích sử dụng dữ liệu",
          content:
            "Chúng tôi sử dụng dữ liệu cá nhân cho các mục đích sau:\n\n• Cung cấp và duy trì Dịch vụ: tạo tài khoản, xử lý thanh toán, lưu lịch sử trò chuyện\n• Cải thiện Dịch vụ: phân tích cách người dùng sử dụng để tối ưu giao diện và chức năng\n• Giao tiếp: gửi thông báo về hoạt động tài khoản, thông tin quan trọng, bản tin\n• Tuân thủ pháp luật: đáp ứng yêu cầu cơ quan quản lý và bảo vệ quyền lợi",
        },
        {
          title: "4. Cơ sở pháp lý và sự đồng ý",
          content:
            "Tùy thuộc vào vị trí cư trú của bạn, chúng tôi có thể dựa trên các cơ sở pháp lý khác nhau để xử lý dữ liệu cá nhân, bao gồm: (i) thực hiện hợp đồng, (ii) tuân thủ nghĩa vụ pháp lý, (iii) lợi ích hợp pháp, và (iv) sự đồng ý của bạn.",
        },
        {
          title: "5. Chia sẻ và chuyển giao dữ liệu",
          content:
            "Chúng tôi chỉ chia sẻ dữ liệu cá nhân trong những trường hợp sau:\n\n• Nhà cung cấp dịch vụ: lưu trữ, phân tích, xác thực, onramp, ví Privy\n• Tuân thủ pháp luật: khi được yêu cầu bởi cơ quan có thẩm quyền\n• Chuyển giao tổ chức: nếu Giác Ngộ tái cấu trúc hoặc sáp nhập\n\nChúng tôi không bán dữ liệu cá nhân cho bất kỳ bên thứ ba nào.",
        },
        {
          title: "6. Lưu trữ và bảo mật",
          content:
            "Chúng tôi thực hiện các biện pháp bảo mật hợp lý để bảo vệ dữ liệu khỏi truy cập trái phép, bao gồm mã hóa khi truyền và lưu trữ, kiểm soát truy cập và giám sát hệ thống.",
        },
        {
          title: "7. Thời gian lưu trữ",
          content:
            "Chúng tôi lưu giữ dữ liệu cá nhân chỉ trong thời gian cần thiết để đáp ứng mục đích đã nêu và tuân thủ pháp luật. Khi không còn cần thiết, chúng tôi sẽ xóa hoặc ẩn danh dữ liệu.",
        },
        {
          title: "8. Quyền của người dùng",
          content:
            "Phụ thuộc vào luật áp dụng, bạn có thể có quyền:\n\n• Truy cập: yêu cầu bản sao dữ liệu cá nhân\n• Sửa đổi: yêu cầu chỉnh sửa dữ liệu không chính xác\n• Xóa: yêu cầu xoá dữ liệu cá nhân\n• Phản đối hoặc hạn chế xử lý\n• Di chuyển dữ liệu: nhận dữ liệu ở định dạng có cấu trúc",
        },
        {
          title: "9. Quyền riêng tư của trẻ em",
          content:
            "Dịch vụ không dành cho trẻ em dưới 13 tuổi và chúng tôi không cố ý thu thập dữ liệu của trẻ em. Nếu phát hiện thu thập dữ liệu trái phép, chúng tôi sẽ xoá ngay lập tức.",
        },
        {
          title: "10. Cookie và công nghệ theo dõi",
          content:
            "Chúng tôi sử dụng cookie và công nghệ tương tự để ghi nhớ tuỳ chọn người dùng, phân tích lưu lượng và cải thiện Dịch vụ. Người dùng có thể điều chỉnh cài đặt trình duyệt để quản lý cookie.",
        },
        {
          title: "11. Thay đổi chính sách",
          content:
            "Chúng tôi có thể cập nhật Chính sách quyền riêng tư để phản ánh thay đổi trong thực tiễn hoặc yêu cầu pháp lý. Khi cập nhật, chúng tôi sẽ đăng chính sách sửa đổi lên trang web.",
        },
      ],
    },
    en: {
      title: "Privacy Policy",
      subtitle: "Giac Ngo – Privacy Policy",
      effectiveDate: "Effective date: June 10, 2025",
      sections: [
        {
          title: "1. Introduction",
          content:
            "This Privacy Policy describes how Giac Ngo collects, uses, stores and shares personal data. We abide by principles of transparency, security and respect for privacy.",
        },
        {
          title: "2. Data We Collect",
          content:
            "We collect personal information when you use the Services, including:\n\n• Identifiers: name, email address, phone number, username and password\n• Interaction data: chat content with the chatbot, feedback, comments, posts\n• Payment data: amounts of crypto (USDC), wallet addresses and transaction history\n• Technical data: IP address, browser type, operating system, cookies",
        },
        {
          title: "3. Purposes of Data Use",
          content:
            "We use personal data for the following purposes:\n\n• Providing and maintaining the Services: creating accounts, processing payments\n• Improving the Services: analyzing usage patterns to optimize interface and functionality\n• Communication: sending notifications about account activity, newsletters\n• Legal compliance: responding to requests from authorities",
        },
        {
          title: "4. Legal Basis and Consent",
          content:
            "Depending on your location, we may rely on different legal bases to process personal data, including: (i) performing a contract, (ii) complying with legal obligations, (iii) legitimate interests, and (iv) your consent.",
        },
        {
          title: "5. Sharing and Transfers of Data",
          content:
            "We only share personal data in the following cases:\n\n• Service providers: hosting, analytics, authentication, on-ramp providers, Privy wallet services\n• Legal compliance: when required by authorities\n• Organizational transfers: if Giac Ngo restructures or merges\n\nWe do not sell personal data to any third parties.",
        },
        {
          title: "6. Storage and Security",
          content:
            "We implement reasonable security measures to protect data against unauthorized access, including encryption in transit and at rest, access controls and system monitoring.",
        },
        {
          title: "7. Retention",
          content:
            "We retain personal data only as long as necessary to fulfill the purposes described and comply with legal obligations. When data is no longer needed, we will delete or anonymize it.",
        },
        {
          title: "8. User Rights",
          content:
            "Depending on applicable law, you may have the right to:\n\n• Access: request a copy of personal data\n• Correct: request correction of inaccurate data\n• Delete: request deletion of personal data\n• Object or restrict processing\n• Data portability: receive data in a structured format",
        },
        {
          title: "9. Children's Privacy",
          content:
            "The Services are not intended for children under 13 and we do not knowingly collect data from children. If unauthorized data collection is discovered, we will promptly delete it.",
        },
        {
          title: "10. Cookies and Tracking Technologies",
          content:
            "We use cookies and similar technologies to remember user preferences, analyze traffic and improve the Services. Users can adjust browser settings to manage cookies.",
        },
        {
          title: "11. Changes to the Policy",
          content:
            "We may update this Privacy Policy to reflect changes in practices or legal requirements. When we update, we will post the revised policy on our website.",
        },
      ],
    },
  };

  const currentContent = content[language];

  return (
    <div className="privacy-page-container">
      <header>
                     <div className="container">
                       <Link to="/" data-testid="link-home">
                           <img src={newLogoUrl} alt="Giác Ngộ" className="h-8" />
                       </Link>
                       <Link to="/" data-testid="link-back" className="header-link">
                           <ChevronLeftIcon className="w-4 h-4" />
                           <span>{language === "vi" ? "Về Trang chủ" : "Back to Home"}</span>
                       </Link>
                     </div>
                 </header>
<div className="relative mx-auto h-full w-full max-w-6xl pt-24">
        {/* Main Content Card */}
        <div className="main-content-card">
          {/* Title */}
          <div className="title-section">
            <h1 data-testid="heading-privacy-title">
              {currentContent.title}
            </h1>
            <p data-testid="text-privacy-subtitle">
              {currentContent.subtitle}
            </p>
          </div>

          {/* Content Sections */}
          <div className="content-sections">
            {currentContent.sections.map((section, index) => (
              <div key={index} id={`section-${index}`}>
                <h2 data-testid={`heading-section-${index + 1}`}>
                  {section.title}
                </h2>
                <div className="section-text" data-testid={`text-section-${index + 1}`}>
                  {section.content}
                </div>
              </div>
            ))}
          </div>

          {/* Contact Information */}
          <div className="contact-section">
            <h3 data-testid="heading-contact">
              {language === "vi" ? "Liên hệ" : "Contact Us"}
            </h3>
            <div className="contact-info" data-testid="text-contact-info">
              <p className="font-semibold">GIAC NGO CORP</p>
              <p>867 Boylston Street, 5th Floor, Suite 1860</p>
              <p>Boston, MA 02116, USA</p>
              <p className="mt-2">
                Email:{" "}
                <a href="mailto:privacy@giac.ngo">
                  privacy@giac.ngo
                </a>
              </p>
            </div>
          </div>

          {/* Effective Date */}
          <div className="effective-date">
            <p data-testid="text-effective-date">
              {currentContent.effectiveDate}
            </p>
          </div>

          {/* Navigation Links */}
          <div className="nav-links">
            <Link to="/" className="btn btn-primary" data-testid="button-back-to-home">
              {language === "vi" ? "Về trang chủ" : "Back to Home"}
            </Link>
          </div>
        </div>
        </div>
      </div>    
  );
}
