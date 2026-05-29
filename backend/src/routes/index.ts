import { Router } from 'express';
import authRoutes from './auth.routes';
import transactionRoutes from './transaction.routes';
import categoryRoutes from './category.routes';
import budgetRoutes from './budget.routes';
import subscriptionRoutes from './subscription.routes';
import webhookRoutes from './webhook.routes';
import dreamRoutes from './dream.routes';
import adminRoutes from './admin.routes';
import integrationRoutes from './integration.routes';
import goalRoutes from './goal.routes';
import suggestionRoutes from './suggestion.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/transactions', transactionRoutes);
router.use('/categories', categoryRoutes);
router.use('/budgets', budgetRoutes);
router.use('/dreams', dreamRoutes);
router.use('/subscription', subscriptionRoutes);
router.use('/webhooks', webhookRoutes);
router.use('/admin', adminRoutes);
router.use('/integrations', integrationRoutes);
router.use('/goals', goalRoutes);
router.use('/suggestions', suggestionRoutes);

export default router;
