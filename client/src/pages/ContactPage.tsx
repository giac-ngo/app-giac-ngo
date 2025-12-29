// client/src/pages/ContactPage.tsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronLeftIcon, MapPinIcon, EnvelopeIcon, FacebookIcon, InstagramIcon, ThreadsIcon } from "../components/Icons";
import { useToast } from '../components/ToastProvider';
import { apiService } from '../services/apiService';

const newLogoUrl = "/uploads/trainingFiles-1760925528911-497608075.png";

const translations = {
  vi: {
    backToHome: "Về Trang chủ",
    contactTitle: "Liên hệ",
    contactSubtitle: "Chúng tôi ở đây để giúp các tổ chức Phật giáo bảo tồn trí tuệ và kết nối với các hành giả trên toàn thế giới.",
    firstName: "Tên",
    lastName: "Họ",
    email: "Email",
    organizationName: "Tên tổ chức",
    role: "Vai trò của bạn",
    organizationType: "Loại hình tổ chức",
    communitySize: "Quy mô cộng đồng",
    howCanWeHelp: "Liên hệ với Nhóm của chúng tôi",
    requestInfo: "Yêu cầu thông tin",
    sending: "Đang gửi...",
    messageSent: "Đã gửi tin nhắn!",
    messageSentDesc: "Chúng tôi sẽ liên hệ lại với bạn trong vòng 24 giờ.",
    submitError: "Lỗi",
    submitErrorDesc: "Không thể gửi tin nhắn. Vui lòng thử lại.",
    validation: {
        firstName: "Tên không được để trống",
        lastName: "Họ không được để trống",
        email: "Địa chỉ email không hợp lệ",
        organizationName: "Tên tổ chức không được để trống",
        role: "Vai trò không được để trống",
        organizationType: "Vui lòng chọn loại hình tổ chức",
        communitySize: "Vui lòng chọn quy mô cộng đồng",
        message: "Tin nhắn phải có ít nhất 10 ký tự",
    }
  },
  en: {
    backToHome: "Back to Home",
    contactTitle: "Contact Us",
    contactSubtitle: "We're here to help Buddhist organizations preserve their wisdom and connect with practitioners worldwide.",
    firstName: "First Name",
    lastName: "Last Name",
    email: "Email",
    organizationName: "Organization Name",
    role: "Your Role",
    organizationType: "Organization Type",
    communitySize: "Community Size",
    howCanWeHelp: "Contact Our Team",
    requestInfo: "Request Information",
    sending: "Sending...",
    messageSent: "Message Sent!",
    messageSentDesc: "We'll get back to you within 24 hours.",
    submitError: "Error",
    submitErrorDesc: "Could not send message. Please try again.",
    validation: {
        firstName: "First name is required",
        lastName: "Last name is required",
        email: "Invalid email address",
        organizationName: "Organization name is required",
        role: "Your role is required",
        organizationType: "Please select an organization type",
        communitySize: "Please select a community size",
        message: "Message must be at least 10 characters",
    }
  }
};

const TracingBeam: React.FC<{children: React.ReactNode, className?: string}> = ({ children, className }) => (
  <div className={`tracing-beam-container ${className || ''}`}>
    {children}
  </div>
);

type FormData = {
    firstName: string;
    lastName: string;
    email: string;
    organizationName: string;
    role: string;
    organizationType: string;
    communitySize: string;
    message: string;
};

export default function ContactPage() {
  const language: 'vi' | 'en' = (localStorage.getItem('language') as 'vi' | 'en') || 'vi';
  const t = translations[language];
  const { showToast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    firstName: "", lastName: "", email: "", organizationName: "", role: "",
    organizationType: "", communitySize: "", message: "",
  });
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>({});

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};
    if (!formData.firstName) newErrors.firstName = t.validation.firstName;
    if (!formData.lastName) newErrors.lastName = t.validation.lastName;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = t.validation.email;
    if (!formData.organizationName) newErrors.organizationName = t.validation.organizationName;
    if (!formData.role) newErrors.role = t.validation.role;
    if (!formData.organizationType) newErrors.organizationType = t.validation.organizationType;
    if (formData.message.length < 10) newErrors.message = t.validation.message;
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({...prev, [name]: value}));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    
    setIsSubmitting(true);
    try {
      const fullMessage = `
        Organization: ${formData.organizationName}
        Role: ${formData.role}
        Type: ${formData.organizationType}
        Size: ${formData.communitySize}
        ---
        Message:
        ${formData.message}
      `;

      await apiService.sendContactForm({
        name: `${formData.firstName} ${formData.lastName}`,
        email: formData.email,
        spaceName: formData.organizationName,
        message: fullMessage,
      });

      showToast(t.messageSent, 'success');
      setFormData({ firstName: "", lastName: "", email: "", organizationName: "", role: "", organizationType: "", communitySize: "", message: "" });
      setErrors({});
    } catch (error) {
      showToast(t.submitErrorDesc, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="contact-page-container">
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
        <div className="relative mx-auto h-full w-full max-w-6xl pt-24">
          <div className="container py-12 max-w-6xl">
            <div className="text-center mb-16">
              <h1 data-testid="text-contact-title">{t.contactTitle}</h1>
              <p>{t.contactSubtitle}</p>
            </div>

            <div className="contact-grid">
              <div>
                <div className="info-card">
                  <h3>GIAC NGO CORP</h3>
                  <div className="info-details">
                    <div className="info-item" data-testid="info-address">
                      <MapPinIcon className="w-5 h-5" />
                      <div>867 Boylston Street, 5th Floor, Suite 1860<br />Boston, MA 02116, USA</div>
                    </div>
                    <div className="info-item" data-testid="info-email">
                      <EnvelopeIcon className="w-5 h-5" />
                      <a href="mailto:info@giac.ngo">info@giac.ngo</a>
                    </div>
                  </div>
                  <div>
                    <h4>Connect With Us</h4>
                    <div className="socials">
                      <a href="https://www.facebook.com/people/Giac-Ngo/61579805139150/" target="_blank" rel="noopener noreferrer" className="social-icon facebook" data-testid="link-facebook"><FacebookIcon /></a>
                      <a href="https://www.instagram.com/giacngo000/" target="_blank" rel="noopener noreferrer" className="social-icon instagram" data-testid="link-instagram"><InstagramIcon /></a>
                      <a href="https://www.thread.com/giacngo000/" target="_blank" rel="noopener noreferrer" className="social-icon threads" data-testid="link-threads"><ThreadsIcon /></a>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="form-card">
                <h2 data-testid="heading-form-title">{t.howCanWeHelp}</h2>
                <p className="form-subtitle">{language === 'vi' ? 'Điền vào biểu mẫu dưới đây và chúng tôi sẽ liên hệ lại với bạn.' : 'Fill out the form below and we will get back to you.'}</p>
                <form onSubmit={handleSubmit} noValidate>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="form-item">
                            <label htmlFor="firstName">{t.firstName} <span className="text-red-500">*</span></label>
                            <input type="text" id="firstName" name="firstName" value={formData.firstName} onChange={handleChange} required className={errors.firstName ? 'input-error' : ''} />
                            {errors.firstName && <p className="form-message">{errors.firstName}</p>}
                        </div>
                         <div className="form-item">
                            <label htmlFor="lastName">{t.lastName} <span className="text-red-500">*</span></label>
                            <input type="text" id="lastName" name="lastName" value={formData.lastName} onChange={handleChange} required className={errors.lastName ? 'input-error' : ''} />
                            {errors.lastName && <p className="form-message">{errors.lastName}</p>}
                        </div>
                    </div>
                    <div className="form-item">
                        <label htmlFor="email">{t.email} <span className="text-red-500">*</span></label>
                        <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required className={errors.email ? 'input-error' : ''} />
                        {errors.email && <p className="form-message">{errors.email}</p>}
                    </div>
                    <div className="form-item">
                        <label htmlFor="organizationName">{t.organizationName} <span className="text-red-500">*</span></label>
                        <input type="text" id="organizationName" name="organizationName" value={formData.organizationName} onChange={handleChange} required className={errors.organizationName ? 'input-error' : ''} />
                        {errors.organizationName && <p className="form-message">{errors.organizationName}</p>}
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                        <div className="form-item">
                            <label htmlFor="role">{t.role} <span className="text-red-500">*</span></label>
                            <input type="text" id="role" name="role" value={formData.role} onChange={handleChange} required className={errors.role ? 'input-error' : ''} />
                            {errors.role && <p className="form-message">{errors.role}</p>}
                        </div>
                         <div className="form-item">
                            <label htmlFor="organizationType">{t.organizationType} <span className="text-red-500">*</span></label>
                            <select id="organizationType" name="organizationType" value={formData.organizationType} onChange={handleChange} required className={errors.organizationType ? 'input-error' : ''}>
                                <option value="">--</option>
                                <option value="Temple">{language === 'vi' ? 'Chùa' : 'Temple'}</option>
                                <option value="Meditation Center">{language === 'vi' ? 'Trung tâm Thiền' : 'Meditation Center'}</option>
                                <option value="Monastery">{language === 'vi' ? 'Tu viện' : 'Monastery'}</option>
                            </select>
                            {errors.organizationType && <p className="form-message">{errors.organizationType}</p>}
                        </div>
                         <div className="form-item">
                            <label htmlFor="communitySize">{t.communitySize}</label>
                            <select id="communitySize" name="communitySize" value={formData.communitySize} onChange={handleChange} className={errors.communitySize ? 'input-error' : ''}>
                                <option value="">--</option>
                                <option value="1-50">1-50</option>
                                <option value="51-200">51-200</option>
                                <option value="201-1000">201-1000</option>
                                <option value="1000+">1000+</option>
                            </select>
                            {errors.communitySize && <p className="form-message">{errors.communitySize}</p>}
                        </div>
                    </div>
                    <div className="form-item">
                        <label htmlFor="message">{t.howCanWeHelp} <span className="text-red-500">*</span></label>
                        <textarea id="message" name="message" value={formData.message} onChange={handleChange} required className={errors.message ? 'input-error' : ''}></textarea>
                        {errors.message && <p className="form-message">{errors.message}</p>}
                    </div>

                    <button type="submit" className="form-submit-btn" disabled={isSubmitting}>
                        {isSubmitting ? t.sending : t.requestInfo}
                    </button>
                    <p className="form-terms">{language === 'vi' ? 'Bằng cách gửi, bạn đồng ý với Điều khoản Dịch vụ của chúng tôi.' : 'By submitting, you agree to our Terms of Service.'}</p>
                </form>
              </div>
            </div>
          </div>
          </div>
      </TracingBeam>
    </div>
  );
}