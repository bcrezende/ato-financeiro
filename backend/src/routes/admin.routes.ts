import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { adminController, adminValidators } from '../controllers/admin.controller';
import { requireAdmin } from '../middlewares/admin.middleware';

const router = Router();

// Strict limiter for admin login — brute-force mitigation on a high-value target
const adminLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: { message: 'Muitas tentativas. Tente novamente em alguns minutos.', code: 'RATE_LIMIT' } },
});

// Public
router.post('/login', adminLoginLimiter, adminValidators.login, adminController.login);

// Protected
router.use(requireAdmin);

router.get('/metrics', adminController.getMetrics);
router.get('/metrics/signups', adminController.getSignups);

router.get('/users', adminController.listUsers);
router.get('/users/:id', adminController.getUser);
router.patch('/users/:id/subscription', adminValidators.updateSubscription, adminController.updateSubscription);
router.patch('/users/:id/block', adminValidators.block, adminController.block);
router.delete('/users/:id', adminController.deleteUser);

router.get('/admins', adminController.listAdmins);
router.post('/admins', adminValidators.createAdmin, adminController.createAdmin);

router.get('/audit', adminController.listAudit);

export default router;
