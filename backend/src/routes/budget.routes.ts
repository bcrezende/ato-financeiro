import { Router } from 'express';
import { budgetController, budgetValidators } from '../controllers/budget.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { requireActiveSubscription } from '../middlewares/subscription.middleware';

const router = Router();
router.use(authenticate);
router.use(requireActiveSubscription);

router.get('/', budgetController.findAll);
router.post('/', budgetValidators.create, budgetController.create);
router.get('/alerts', budgetController.getAlerts);
router.get('/months', budgetController.listMonths);
router.put('/:id', budgetValidators.update, budgetController.update);
router.delete('/:id', budgetController.delete);

export default router;
