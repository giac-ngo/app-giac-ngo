// server/routes/billingRoutes.js
import { Router } from 'express';
import { billingController } from '../controllers/billingController.js';
import { checkPermission, isAuthenticated } from './../middleware/authMiddleware.js';

const router = Router();

// Pricing Plans (Admin)
router.get('/pricing-plans', billingController.getPricingPlans);
router.post('/pricing-plans', checkPermission('pricing'), billingController.createPricingPlan);
router.put('/pricing-plans/:id', checkPermission('pricing'), billingController.updatePricingPlan);
router.delete('/pricing-plans/:id', checkPermission('pricing'), billingController.deletePricingPlan);

// Transactions
router.get('/transactions', checkPermission('manual-billing'), billingController.getAllTransactions);
router.get('/transactions/user/:userId', isAuthenticated, billingController.getTransactionsByUserId); // User can get their own
router.post('/transactions/manual', checkPermission('manual-billing'), billingController.addMeritsManually);

// Subscriptions
router.post('/subscriptions/purchase', isAuthenticated, billingController.purchaseSubscription);

// Crypto Payments
router.post('/crypto/initiate-merit-purchase', isAuthenticated, billingController.initiateMeritPurchase);
router.post('/crypto/confirm', isAuthenticated, billingController.confirmCryptoPayment);

// Stripe Payments
router.get('/stripe/config', billingController.getStripeConfig); // Provide publishable key
router.get('/stripe/payment-methods', isAuthenticated, billingController.getEnabledPaymentMethods); // Get enabled payment methods
router.post('/stripe/create-payment-intent', isAuthenticated, billingController.createStripePaymentIntent);
router.post('/stripe/confirm-payment', isAuthenticated, billingController.confirmStripePayment);

// Withdrawal Requests
router.get('/admin/withdrawals', checkPermission('manual-billing'), billingController.getWithdrawalRequests);
router.put('/admin/withdrawals/:id/process', checkPermission('manual-billing'), billingController.processWithdrawalRequest);

router.post('/withdrawals', isAuthenticated, (req, res) => billingController.createWithdrawalRequest(req, res));


export default router;