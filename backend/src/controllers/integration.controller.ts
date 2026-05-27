import { Request, Response, NextFunction } from 'express';
import { body } from 'express-validator';
import { integrationService } from '../services/integration.service';
import { validate } from '../middlewares/validate.middleware';

export const integrationValidators = {
  createTransaction: [
    body('phone').isString().notEmpty().withMessage('phone obrigatório'),
    body('amount').isFloat({ gt: 0 }).withMessage('amount deve ser positivo'),
    body('type').isIn(['INCOME', 'EXPENSE']).withMessage('type deve ser INCOME ou EXPENSE'),
    body('description').isString().trim().isLength({ min: 1, max: 255 }).withMessage('description obrigatório'),
    body('category').optional().isString(),
    body('date').optional().isString(),
    body('status').optional().isIn(['PAID', 'PENDING']),
    validate,
  ],
};

export const integrationController = {
  createTransaction: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await integrationService.createTransaction({ ...req.body, amount: Number(req.body.amount) });
      res.status(201).json({ success: true, data });
    } catch (e) { next(e); }
  },

  getSummary: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const phone = req.query.phone as string;
      const month = req.query.month ? parseInt(req.query.month as string) : undefined;
      const year = req.query.year ? parseInt(req.query.year as string) : undefined;
      const data = await integrationService.getSummary(phone, month, year);
      res.json({ success: true, data });
    } catch (e) { next(e); }
  },

  listCategories: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const data = await integrationService.listCategories(req.query.phone as string);
      res.json({ success: true, data });
    } catch (e) { next(e); }
  },
};
