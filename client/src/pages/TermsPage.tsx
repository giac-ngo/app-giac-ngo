// client/src/pages/TermsPage.tsx
import { Link } from "react-router-dom";
import { ChevronLeftIcon } from "../components/Icons";

const newLogoUrl = "/uploads/trainingFiles-1760925528911-497608075.png";

export default function TermsPage() {
  const language: 'vi' | 'en' = (localStorage.getItem('language') as 'vi' | 'en') || 'vi';

  const content = {
    vi: {
      title: "Điều khoản sử dụng",
      subtitle: "Giác Ngộ – Điều khoản sử dụng và Chính sách quyền riêng tư",
      disclaimer:
        "Tài liệu này chỉ nhằm mục đích cung cấp thông tin chung. Để đảm bảo tính chính xác và phù hợp với pháp luật hiện hành, Quý vị nên tham khảo ý kiến tư vấn chuyên môn trước khi sử dụng.",
      effectiveDate: "Ngày có hiệu lực: 10/06/2025",
      sections: [
        {
          title: "1. Chấp nhận điều khoản",
          content:
            "Khi truy cập và sử dụng bất kỳ dịch vụ nào do Giác Ngộ vận hành – bao gồm trang web, ứng dụng di động, chatbot Buddha AI Chat và các nền tảng liên quan (gọi chung là Dịch vụ) – bạn thừa nhận rằng đã đọc, hiểu và đồng ý chịu ràng buộc bởi các điều khoản trong tài liệu này. Nếu bạn không đồng ý với bất kỳ điều khoản nào, vui lòng không sử dụng Dịch vụ. Giác Ngộ có thể sửa đổi Điều khoản này bất kỳ lúc nào bằng cách đăng bản cập nhật; việc tiếp tục sử dụng sau khi có thay đổi đồng nghĩa với việc bạn chấp nhận các thay đổi đó.",
        },
        {
          title: "2. Mục đích và phạm vi sử dụng",
          content:
            "Giác Ngộ là tổ chức phi lợi nhuận với sứ mệnh truyền đạt triết lý Phật giáo thông qua công nghệ. Dịch vụ cung cấp thông tin, nội dung giáo dục và công cụ trò chuyện do trí tuệ nhân tạo hỗ trợ. Các nội dung và phản hồi từ chatbot chỉ mang tính tham khảo, không phải lời khuyên y tế, pháp lý hay tâm lý chuyên môn. Bạn chịu trách nhiệm cho mọi quyết định dựa trên thông tin nhận được từ Dịch vụ và nên tham khảo chuyên gia khi cần.\n\nNgười dùng chỉ được sử dụng Dịch vụ cho mục đích cá nhân, phi thương mại và phù hợp với pháp luật. Bạn không được tái sản xuất, phân phối, bán, chuyển nhượng hoặc khai thác thương mại bất kỳ nội dung nào từ Dịch vụ khi chưa có sự chấp thuận bằng văn bản của Giác Ngộ.",
        },
        {
          title: "3. Tài khoản và gói thành viên",
          content:
            "Để truy cập đầy đủ các tính năng (như lưu lịch sử trò chuyện, truy cập các tác nhân AI nâng cao hoặc mua gói thành viên), bạn cần tạo tài khoản. Bạn cam kết cung cấp thông tin chính xác và bảo mật thông tin đăng nhập. Giác Ngộ có quyền vô hiệu hoá hoặc chấm dứt tài khoản của bất kỳ người dùng nào vi phạm Điều khoản này.\n\nCác gói thành viên (Basic, Pro, Premium) được mô tả trong Mô hình thành viên. Nếu bạn nâng cấp gói, bạn đồng ý thanh toán theo phương thức được hỗ trợ.",
        },
        {
          title: "3.1. Sử dụng phí dịch vụ",
          content:
            "Giác Ngộ là tổ chức phi lợi nhuận; mọi khoản phí gói thành viên (Pro, Premium) đều được coi là sự đóng góp nhằm duy trì và phát triển sứ mệnh giáo dục Phật pháp. Phí thu được sẽ được sử dụng để:\n\n• Làm công đức và Phật sự: hỗ trợ các hoạt động từ thiện, cúng dường, xây dựng cơ sở hạ tầng phục vụ cộng đồng Phật giáo\n• Hỗ trợ cộng đồng: tài trợ cho các chương trình học bổng, nội dung miễn phí, sự kiện và công cụ hỗ trợ tinh thần\n• Duy trì dịch vụ: trang trải chi phí vận hành hệ thống, nghiên cứu, phát triển AI và bảo trì nền tảng",
        },
        {
          title: "4. Quyền sở hữu trí tuệ",
          content:
            "Toàn bộ nội dung của Dịch vụ (bao gồm văn bản, đồ hoạ, logo, thiết kế giao diện, mã nguồn và cơ sở dữ liệu) thuộc sở hữu của Giác Ngộ hoặc các bên cấp phép và được bảo vệ bởi luật sở hữu trí tuệ. Bạn được cấp phép giới hạn để truy cập và sử dụng Dịch vụ cho mục đích cá nhân.",
        },
        {
          title: "5. Miễn trừ trách nhiệm và giới hạn trách nhiệm",
          content:
            'Nội dung và Dịch vụ được cung cấp "nguyên trạng" và "khả dụng" mà không có bất kỳ cam kết hay bảo đảm nào. Giác Ngộ không đảm bảo Dịch vụ sẽ không gián đoạn, không có lỗi hoặc đáp ứng yêu cầu cụ thể của bạn.',
        },
        {
          title: "6. Liên kết và nội dung của bên thứ ba",
          content:
            "Dịch vụ có thể chứa liên kết đến website hoặc dịch vụ của bên thứ ba. Giác Ngộ không chịu trách nhiệm về nội dung, chính sách hoặc thực hành của các bên đó.",
        },
        {
          title: "7. Luật áp dụng và giải quyết tranh chấp",
          content:
            "Điều khoản này được điều chỉnh bởi pháp luật Việt Nam (trừ khi quy định khác theo luật nơi bạn cư trú). Mọi tranh chấp phát sinh từ việc sử dụng Dịch vụ sẽ được giải quyết trước tiên bằng thương lượng thiện chí.",
        },
        {
          title: "8. Sửa đổi điều khoản",
          content:
            "Giác Ngộ có thể cập nhật Điều khoản sử dụng khi cần thiết. Ngày cập nhật cuối cùng sẽ được ghi rõ ở đầu tài liệu. Bạn có trách nhiệm xem lại Điều khoản định kỳ để nắm được các thay đổi.",
        },
      ],
    },
    en: {
      title: "Terms of Use",
      subtitle: "Giac Ngo – Terms of Use and Privacy Policy",
      disclaimer:
        "This document is provided for general informational purposes. For accuracy and compliance with applicable laws, you should consult a professional advisor before relying on it.",
      effectiveDate: "Effective date: June 10, 2025",
      sections: [
        {
          title: "1. Acceptance of Terms",
          content:
            "By accessing or using any service operated by Giac Ngo – including the website, mobile applications, the Buddha AI Chat chatbot, and related platforms (collectively, the Services) – you acknowledge that you have read, understood and agree to be bound by these Terms. If you do not agree to any part of the Terms, please do not use the Services.",
        },
        {
          title: "2. Purpose and Scope of Use",
          content:
            "Giac Ngo is a non-profit organization whose mission is to transmit Buddhist teachings through technology. The Services provide information, educational content and chat tools powered by artificial intelligence. Content and responses from the chatbot are for reference only and are not medical, legal or psychological advice.\n\nUsers may only use the Services for personal, non-commercial purposes in compliance with the law. You may not reproduce, distribute, sell, transfer or otherwise commercially exploit any content from the Services without the prior written permission of Giac Ngo.",
        },
        {
          title: "3. Accounts and Membership Plans",
          content:
            "To access full features (such as saving chat history, using advanced AI agents or purchasing membership plans), you must create an account. You agree to provide accurate information and keep your login credentials confidential. Giac Ngo reserves the right to disable or terminate any account that violates these Terms.\n\nMembership plans (Basic, Pro, Premium) are described in our membership model. If you upgrade your plan, you agree to pay using the supported methods.",
        },
        {
          title: "3.1. Use of Membership Fees",
          content:
            "Giac Ngo is a non-profit organization; all membership fees (Pro, Premium) are considered contributions that sustain and develop our mission of Buddhist education. Fees collected will be used to:\n\n• Support merit and Buddhist activities: funding charity work, religious offerings, and building infrastructure\n• Support the community: sponsoring scholarships, free content, events and spiritual support tools\n• Maintain the service: covering operational costs, research, AI development and platform maintenance",
        },
        {
          title: "4. Intellectual Property Rights",
          content:
            "All content of the Services (including text, graphics, logos, interface designs, source code and databases) is owned by Giac Ngo or its licensors and is protected by intellectual property laws. You are granted a limited licence to access and use the Services for personal purposes.",
        },
        {
          title: "5. Disclaimer and Limitation of Liability",
          content:
            'The content and Services are provided "as is" and "as available" without any warranty, express or implied. Giac Ngo does not guarantee that the Services will be uninterrupted, error-free or meet your specific requirements.',
        },
        {
          title: "6. Links and Third-Party Content",
          content:
            "The Services may contain links to third-party websites or services. Giac Ngo is not responsible for the content, policies or practices of those third parties.",
        },
        {
          title: "7. Governing Law and Dispute Resolution",
          content:
            "These Terms are governed by the laws of Việt Nam (unless otherwise required by the law of your residence). Any disputes arising from your use of the Services should first be settled amicably.",
        },
        {
          title: "8. Changes to the Terms",
          content:
            "Giac Ngo may update these Terms when necessary. The last updated date will be indicated at the top. It is your responsibility to review the Terms periodically.",
        },
      ],
    },
  };

  const currentContent = content[language];

  return (
    <div className="terms-page-container">
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
        {/* Main Content Card */}
         <div className="relative mx-auto h-full w-full max-w-6xl pt-24">
        <div className="main-content-card">
          {/* Title */}
          <div className="title-section">
            <h1 data-testid="heading-terms-title">
              {currentContent.title}
            </h1>
            <p data-testid="text-terms-subtitle">
              {currentContent.subtitle}
            </p>
            <p className="disclaimer" data-testid="text-disclaimer">
              {currentContent.disclaimer}
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
            <Link to="/privacy" className="btn btn-outline" data-testid="button-go-to-privacy">
                {language === "vi" ? "Chính sách quyền riêng tư" : "Privacy Policy"}
            </Link>
            <Link to="/" className="btn btn-primary" data-testid="button-back-to-home">
              {language === "vi" ? "Về trang chủ" : "Back to Home"}
            </Link>
          </div>
        </div>
        </div>
      </div>    
  );
}
