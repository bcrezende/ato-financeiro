import { Router } from 'express';
import { budgetController, budgetValidators } from '../controllers/budget.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();
router.use(authenticate);

router.get('/', budgetController.findAll);
router.post('/', budgetValidators.create, budgetController.create);
router.get('/alerts', budgetController.getAlerts);
router.put('/:id', budgetValidators.update, budgetController.update);
router.delete('/:id', budgetController.delete);

export default router;
