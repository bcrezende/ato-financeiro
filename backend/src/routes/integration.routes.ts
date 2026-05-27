import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { integrationController, integrationValidators } from '../controllers/integration.controller';
import { requireIntegrationKey } from '../middlewares/integration.middleware';

const router = Router();

// Limite generoso o suficiente para uso real via WhatsApp, mas que contém abuso
const integrationLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: { message: 'Muitas requisições', code: 'RATE_LIMIT' } },
});

router.use(integrationLimiter);
router.use(requireIntegrationKey);

router.post('/transactions', integrationValidators.createTransaction, integrationController.createTransaction);
router.get('/summary', integrationController.getSummary);
router.get('/categories', integrationController.listCategories);

export default router;
