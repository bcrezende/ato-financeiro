import { Router } from 'express';
import { transactionController, transactionValidators } from '../controllers/transaction.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();
router.use(authenticate);

router.get('/', transactionController.findAll);
router.post('/', transactionValidators.create, transactionController.create);
router.get('/summary', transactionController.getSummary);
router.get('/by-category', transactionController.getByCategory);
router.get('/monthly-evolution', transactionController.getMonthlyEvolution);
router.get('/export/excel', transactionController.exportExcel);
router.get('/export/csv', transactionController.exportCsv);
router.get('/:id', transactionController.findById);
router.put('/:id', transactionValidators.update, transactionController.update);
router.delete('/:id', transactionController.delete);

export default router;
