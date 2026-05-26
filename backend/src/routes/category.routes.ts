import { Router } from 'express';
import { categoryController, categoryValidators } from '../controllers/category.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { requireActiveSubscription } from '../middlewares/subscription.middleware';

const router = Router();
router.use(authenticate);
router.use(requireActiveSubscription);

router.get('/', categoryController.findAll);
router.post('/', categoryValidators.create, categoryController.create);
router.put('/:id', categoryValidators.update, categoryController.update);
router.delete('/:id', categoryController.delete);

export default router;
