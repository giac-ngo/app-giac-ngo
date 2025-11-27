// server/services/mailService.js
import nodemailer from 'nodemailer';
import 'dotenv/config';

// User-facing email configuration
const userFacingTransport = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || '587', 10),
    secure: (process.env.EMAIL_PORT || '587') === '465',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

const translations = {
    vi: {
        resetSubject: 'Yêu cầu Đặt lại Mật khẩu Giác Ngộ AI',
        resetBody: (url) => `Bạn nhận được email này vì bạn (hoặc ai đó) đã yêu cầu đặt lại mật khẩu cho tài khoản của bạn.\n\nVui lòng nhấp vào liên kết sau, hoặc dán vào trình duyệt của bạn để hoàn tất quá trình:\n\n${url}\n\nNếu bạn không yêu cầu điều này, vui lòng bỏ qua email này và mật khẩu của bạn sẽ không thay đổi.\n`,
        contactSubject: (spaceName) => `[Giác Ngộ Contact] Yêu cầu từ: ${spaceName}`
    },
    en: {
        resetSubject: 'Giác Ngộ AI Password Reset Request',
        resetBody: (url) => `You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\nPlease click on the following link, or paste this into your browser to complete the process:\n\n${url}\n\nIf you did not request this, please ignore this email and your password will remain unchanged.\n`,
        contactSubject: (spaceName) => `[Giác Ngộ Contact] Inquiry from: ${spaceName}`
    }
};

export const mailService = {
    async sendPasswordResetEmail(to, token, language = 'vi') {
        const t = translations[language];
        const resetUrl = `${process.env.BASE_URL}/reset-password?token=${token}`;
        const mailOptions = {
            from: process.env.EMAIL_FROM,
            to,
            subject: t.resetSubject,
            text: t.resetBody(resetUrl),
        };
        try {
            await userFacingTransport.sendMail(mailOptions);
            console.log('Password reset email sent to:', to);
        } catch (error) {
            console.error('Error sending password reset email:', error);
            throw new Error('Could not send password reset email.');
        }
    },
    
    async sendContactFormEmail(formData) {
        const { name, email, spaceName, message } = formData;
        const adminEmail = process.env.ADMIN_EMAIL;
        if (!adminEmail) {
            console.error('ADMIN_EMAIL not set, cannot send contact form email.');
            // Fail silently from user's perspective, but log the error.
            return;
        }
        
        const mailOptions = {
            from: process.env.EMAIL_FROM, // Should be a no-reply or system email
            to: adminEmail,
            replyTo: email, // So admin can reply directly to the user
            subject: translations.vi.contactSubject(spaceName || name),
            text: `
Name: ${name}
Email: ${email}
---
${message}
            `,
            html: `
                <p><strong>From:</strong> ${name} (&lt;${email}&gt;)</p>
                <hr>
                <pre style="white-space: pre-wrap; font-family: sans-serif;">${message}</pre>
            `
        };

        try {
            await userFacingTransport.sendMail(mailOptions);
            console.log('Contact form email sent successfully from:', email);
        } catch (error) {
            console.error('Error sending contact form email:', error);
            throw new Error('Could not send contact form email.');
        }
    }
};
