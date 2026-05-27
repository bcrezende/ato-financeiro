import { Router } from 'express';
import { dreamController, dreamValidators } from '../controllers/dream.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { requireActiveSubscription } from '../middlewares/subscription.middleware';

const router = Router();
router.use(authenticate);
router.use(requireActiveSubscription);

router.get('/', dreamController.findAll);
router.post('/', dreamValidators.create, dreamController.create);
router.delete('/:id', dreamController.delete);

export default router;
