import { Router } from 'express';
import { goalController, goalValidators } from '../controllers/goal.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { requireActiveSubscription } from '../middlewares/subscription.middleware';

const router = Router();
router.use(authenticate);
router.use(requireActiveSubscription);

router.get('/', goalController.list);
router.post('/', goalValidators.create, goalController.create);
router.get('/:id', goalController.getById);
router.put('/:id', goalValidators.update, goalController.update);
router.delete('/:id', goalController.delete);

router.post('/:id/steps', goalValidators.step, goalController.addStep);
router.patch('/:id/steps/:stepId', goalValidators.step, goalController.updateStep);
router.delete('/:id/steps/:stepId', goalController.deleteStep);

router.post('/:id/contributions', goalValidators.contribution, goalController.addContribution);
router.delete('/:id/contributions/:contribId', goalController.deleteContribution);

export default router;
