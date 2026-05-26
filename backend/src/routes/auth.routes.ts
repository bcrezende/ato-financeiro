import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { authController, authValidators } from '../controllers/auth.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

// Strict limiter for sensitive auth endpoints — mitigates brute-force and
// password-reset-email abuse (well below the global 100/15min limit).
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: { message: 'Muitas tentativas. Tente novamente em alguns minutos.', code: 'RATE_LIMIT' } },
});

router.post('/register', authLimiter, authValidators.register, authController.register);
router.post('/login', authLimiter, authValidators.login, authController.login);
router.post('/refresh', authLimiter, authValidators.refresh, authController.refresh);
router.post('/logout', authController.logout);
router.post('/forgot-password', authLimiter, authValidators.forgotPassword, authController.forgotPassword);
router.post('/reset-password', authLimiter, authValidators.resetPassword, authController.resetPassword);

router.get('/profile', authenticate, authController.getProfile);
router.put('/profile', authenticate, authValidators.updateProfile, authController.updateProfile);
router.put('/password', authenticate, authValidators.changePassword, authController.changePassword);
router.delete('/account', authenticate, authController.deleteAccount);

export default router;
