import { Router } from 'express';
import authRoutes from './auth.routes';
import transactionRoutes from './transaction.routes';
import categoryRoutes from './category.routes';
import budgetRoutes from './budget.routes';
import subscriptionRoutes from './subscription.routes';
import webhookRoutes from './webhook.routes';
import dreamRoutes from './dream.routes';

const router = Router();

router.use('/auth', authRoutes);
router.use('/transactions', transactionRoutes);
router.use('/categories', categoryRoutes);
router.use('/budgets', budgetRoutes);
router.use('/dreams', dreamRoutes);
router.use('/subscription', subscriptionRoutes);
router.use('/webhooks', webhookRoutes);

export default router;
