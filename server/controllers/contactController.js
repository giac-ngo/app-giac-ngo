// server/controllers/contactController.js
import { mailService } from '../services/mailService.js';

export const contactController = {
    async sendContactForm(req, res) {
        try {
            const { name, email, spaceName, message } = req.body;
            if (!name || !email || !message) {
                return res.status(400).json({ message: 'Name, email, and message are required.' });
            }
            
            await mailService.sendContactFormEmail({ name, email, spaceName, message });
            res.status(204).send();

        } catch (error) {
            console.error('Error in sendContactForm controller:', error);
            res.status(500).json({ message: 'An internal error occurred while sending the message.' });
        }
    },
};
