import { Response, NextFunction } from 'express';
import { body } from 'express-validator';
import { budgetService } from '../services/budget.service';
import { AuthRequest } from '../types';
import { validate } from '../middlewares/validate.middleware';

export const budgetValidators = {
  create: [
    body('name').trim().isLength({ min: 1, max: 100 }).withMessage('Name required'),
    body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be positive'),
    body('categoryId').isUUID().withMessage('Valid categoryId required'),
    body('month').isInt({ min: 1, max: 12 }).withMessage('Month 1-12'),
    body('year').isInt({ min: 2000, max: 2100 }).withMessage('Valid year required'),
    body('alertAt').optional().isInt({ min: 1, max: 100 }).withMessage('alertAt must be 1-100'),
    validate,
  ],
  update: [
    body('name').optional().trim().isLength({ min: 1, max: 100 }),
    body('amount').optional().isFloat({ min: 0.01 }),
    body('alertAt').optional().isInt({ min: 1, max: 100 }),
    validate,
  ],
};

export const budgetController = {
  findAll: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const month = req.query.month ? parseInt(req.query.month as string) : undefined;
      const year = req.query.year ? parseInt(req.query.year as string) : undefined;
      const budgets = await budgetService.findAll(req.userId!, month, year);
      res.json({ success: true, data: budgets });
    } catch (e) { next(e); }
  },

  create: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const budget = await budgetService.create(req.userId!, {
        ...req.body,
        amount: Number(req.body.amount),
      });
      res.status(201).json({ success: true, data: budget });
    } catch (e) { next(e); }
  },

  update: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const data = { ...req.body };
      if (data.amount) data.amount = Number(data.amount);
      const budget = await budgetService.update(req.userId!, req.params.id, data);
      res.json({ success: true, data: budget });
    } catch (e) { next(e); }
  },

  delete: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      await budgetService.delete(req.userId!, req.params.id);
      res.json({ success: true, message: 'Budget deleted' });
    } catch (e) { next(e); }
  },

  listMonths: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const months = await budgetService.listMonths(req.userId!);
      res.json({ success: true, data: months });
    } catch (e) { next(e); }
  },

  getAlerts: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const alerts = await budgetService.getAlerts(req.userId!);
      res.json({ success: true, data: alerts });
    } catch (e) { next(e); }
  },
};
