// server/controllers/billingController.js
import { billingModel } from '../models/billing.model.js';
import { userModel } from '../models/user.model.js';
import { pool } from '../db.js';
import Stripe from 'stripe';

const mapAndSanitizeUser = (user) => {
    if (!user) return null;
    const { password, ...sanitizedUser } = user;
    return sanitizedUser;
};

const getStripeClient = () => {
    if (!process.env.STRIPE_SECRET_KEY) {
        throw new Error('Stripe secret key is not configured on the server.');
    }
    return new Stripe(process.env.STRIPE_SECRET_KEY);
};

const MERIT_PRICE_VND = 1000;

export const billingController = {
    // Pricing Plans
    async getPricingPlans(req, res) {
        try {
            res.json(await billingModel.findAllPlans());
        } catch (error) {
            res.status(500).json({ message: 'Không thể tải danh sách gói giá.' });
        }
    },
    async createPricingPlan(req, res) {
        try {
            res.status(201).json(await billingModel.createPlan(req.body));
        } catch (error) {
            res.status(500).json({ message: 'Lỗi khi tạo gói giá mới.' });
        }
    },
    async updatePricingPlan(req, res) {
        try {
            res.json(await billingModel.updatePlan(req.params.id, req.body));
        } catch (error) {
            res.status(500).json({ message: 'Lỗi khi cập nhật gói giá.' });
        }
    },
    async deletePricingPlan(req, res) {
        try {
            await billingModel.deletePlan(req.params.id);
            res.status(204).send();
        } catch (error) {
            res.status(500).json({ message: 'Lỗi khi xóa gói giá.' });
        }
    },

    // Transactions
    async getAllTransactions(req, res) {
        try {
            res.json(await billingModel.findAllTransactions());
        } catch (error) {
            res.status(500).json({ message: 'Không thể tải lịch sử giao dịch.' });
        }
    },
    async getTransactionsByUserId(req, res) {
        try {
            res.json(await billingModel.findTransactionsByUserId(parseInt(req.params.userId, 10)));
        } catch (error) {
            res.status(500).json({ message: 'Không thể tải lịch sử giao dịch của người dùng.' });
        }
    },
    async addMeritsManually(req, res) {
        const { userId, merits } = req.body;
        const adminId = req.user.id;
        try {
            const updatedUser = await billingModel.addMerits(userId, merits, adminId);
            res.json(mapAndSanitizeUser(updatedUser));
        } catch (error) {
            res.status(500).json({ message: 'Lỗi khi nạp merit.' });
        }
    },
    
    // Subscriptions
    async purchaseSubscription(req, res) {
        const { userId, planId } = req.body;
        try {
            const updatedUser = await billingModel.purchaseSubscription(userId, planId);
            res.json(mapAndSanitizeUser(updatedUser));
        } catch (error) {
            res.status(400).json({ message: error.message || 'Lỗi khi mua gói.' });
        }
    },

    // Crypto (Mocked)
    async initiateMeritPurchase(req, res) {
        res.status(501).json({ message: 'Crypto payments not implemented yet.' });
    },
    
    async confirmCryptoPayment(req, res) {
        res.status(501).json({ message: 'Crypto payments not implemented yet.' });
    },

    // Stripe
    getStripeConfig(req, res) {
        if (!process.env.STRIPE_PUBLISHABLE_KEY) {
            return res.status(500).json({ message: 'Stripe publishable key is not configured.' });
        }
        res.json({ publishableKey: process.env.STRIPE_PUBLISHABLE_KEY });
    },

    async getEnabledPaymentMethods(req, res) {
        try {
            const stripe = getStripeClient();
            // Fetch all payment method configurations from Stripe.
            const paymentMethodConfigurations = await stripe.paymentMethodConfigurations.list();
    
            // Filter for active configurations and then extract the payment method types.
            const enabledMethods = paymentMethodConfigurations.data
                .filter(config => config.active)
                .flatMap(config => 
                    Object.keys(config).filter(key => {
                        const value = config[key];
                        return typeof value === 'object' && value !== null && 'display_preference' in value;
                    })
                );
            
            res.json(enabledMethods);
        } catch (error) {
            console.error("Error fetching Stripe payment methods:", error);
            res.status(500).json({ message: `Could not fetch payment methods: ${error.message}` });
        }
    },

    async createStripePaymentIntent(req, res) {
        try {
            const stripe = getStripeClient();
            const { userId, merits } = req.body;
            if (!userId || !merits || merits <= 0) {
                return res.status(400).json({ message: 'User ID and a valid merit amount are required.' });
            }
        
            const amount = merits * MERIT_PRICE_VND;
            const paymentIntent = await stripe.paymentIntents.create({
                amount,
                currency: 'vnd',
                metadata: { userId, merits },
                automatic_payment_methods: {
                    enabled: true,
                },
            });
            res.send({ clientSecret: paymentIntent.client_secret, paymentIntentId: paymentIntent.id });
        } catch (error) {
            res.status(500).json({ message: `Failed to create payment intent: ${error.message}` });
        }
    },
    
    async confirmStripePayment(req, res) {
        const { paymentIntentId } = req.body;
        if (!paymentIntentId) {
             return res.status(400).json({ message: 'Payment Intent ID is required.' });
        }
        try {
            const stripe = getStripeClient();
            const existingTx = await pool.query('SELECT id FROM transactions WHERE stripe_charge_id = $1', [paymentIntentId]);
            if (existingTx.rows.length > 0) {
                const user = await userModel.findById(req.user.id);
                return res.json(mapAndSanitizeUser(user));
            }

            const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

            if (paymentIntent.status !== 'succeeded') {
                return res.status(400).json({ message: 'Payment not successful or still processing.' });
            }

            const { userId, merits } = paymentIntent.metadata;
            if (!userId || !merits) {
                 return res.status(400).json({ message: 'Payment metadata is missing.' });
            }

            const userIdNum = parseInt(userId, 10);
            const meritsNum = parseInt(merits, 10);

            const updatedUser = await billingModel.addMerits(userIdNum, meritsNum, null, 'stripe', paymentIntentId);
            res.json(mapAndSanitizeUser(updatedUser));
        } catch(error) {
            console.error("Stripe confirmation error:", error);
            res.status(500).json({ message: `Failed to confirm payment and add merits: ${error.message}` });
        }
    },

    // Withdrawals
    async getWithdrawalRequests(req, res) {
        try {
            const requests = await billingModel.findWithdrawalRequests();
            res.json(requests);
        } catch (error) {
            res.status(500).json({ message: 'Failed to fetch withdrawal requests.' });
        }
    },

    async processWithdrawalRequest(req, res) {
        const { id } = req.params;
        const { action } = req.body;
        if (!['approved', 'rejected'].includes(action)) {
            return res.status(400).json({ message: 'Invalid action.' });
        }
        try {
            const updatedRequest = await billingModel.processWithdrawalRequest(id, action);
            res.json(updatedRequest);
        } catch (error) {
            res.status(500).json({ message: `Failed to process withdrawal request: ${error.message}` });
        }
    },

    async createWithdrawalRequest(req, res) {
        const { amount } = req.body;
        const userId = req.user.id;
        
        if (!amount || amount <= 0) {
            return res.status(400).json({ message: 'A valid amount is required.' });
        }

        try {
            const user = await userModel.findById(userId);
            if (!user.stripeAccountId) {
                return res.status(400).json({ message: 'User does not have a connected account for withdrawals.' });
            }
            const newRequest = await billingModel.createWithdrawalRequest(userId, amount);
            res.status(201).json(newRequest);
        } catch (error) {
            res.status(500).json({ message: `Failed to create withdrawal request: ${error.message}` });
        }
    },
};
