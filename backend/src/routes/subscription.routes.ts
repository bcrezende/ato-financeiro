import { Router } from 'express';
import { subscriptionController } from '../controllers/subscription.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();
router.use(authenticate);
router.post('/checkout', subscriptionController.checkout);
router.post('/portal', subscriptionController.portal);
router.get('/status', subscriptionController.getStatus);

export default router;
