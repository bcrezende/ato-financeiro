import { Response, NextFunction } from 'express';
import { body, query } from 'express-validator';
import { transactionService } from '../services/transaction.service';
import { exportService } from '../services/export.service';
import { AuthRequest } from '../types';
import { validate } from '../middlewares/validate.middleware';

export const transactionValidators = {
  create: [
    body('description').trim().isLength({ min: 1, max: 255 }).withMessage('Description required (max 255 chars)'),
    body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be positive'),
    body('type').isIn(['INCOME', 'EXPENSE']).withMessage('Type must be INCOME or EXPENSE'),
    body('date').isISO8601().withMessage('Valid date required'),
    body('categoryId').isUUID().withMessage('Valid categoryId required'),
    body('frequency').optional().isIn(['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY']),
    body('installments').optional().isInt({ min: 2, max: 360 }).withMessage('Parcelas deve ser entre 2 e 360'),
    body('status').optional().isIn(['PAID', 'PENDING']).withMessage('Status inválido'),
    validate,
  ],
  update: [
    body('description').optional().trim().isLength({ min: 1, max: 255 }),
    body('amount').optional().isFloat({ min: 0.01 }),
    body('type').optional().isIn(['INCOME', 'EXPENSE']),
    body('date').optional().isISO8601(),
    body('categoryId').optional().isUUID(),
    body('status').optional().isIn(['PAID', 'PENDING']).withMessage('Status inválido'),
    validate,
  ],
};

export const transactionController = {
  create: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const t = await transactionService.create(req.userId!, {
        ...req.body,
        amount: Number(req.body.amount),
        date: new Date(req.body.date),
      });
      res.status(201).json({ success: true, data: t });
    } catch (e) { next(e); }
  },

  findAll: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);
      const result = await transactionService.findAll(req.userId!, req.query as any, page, limit);
      res.json({ success: true, ...result });
    } catch (e) { next(e); }
  },

  findById: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const t = await transactionService.findById(req.userId!, req.params.id);
      res.json({ success: true, data: t });
    } catch (e) { next(e); }
  },

  update: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const data = { ...req.body };
      if (data.amount) data.amount = Number(data.amount);
      if (data.date) data.date = new Date(data.date);
      const scope = req.query.scope as 'this' | 'future' | 'all' | undefined;
      const t = (scope === 'future' || scope === 'all')
        ? await transactionService.updateScope(req.userId!, req.params.id, scope, data)
        : await transactionService.update(req.userId!, req.params.id, data);
      res.json({ success: true, data: t });
    } catch (e) { next(e); }
  },

  delete: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const scope = req.query.scope as 'this' | 'future' | 'all' | undefined;
      if (scope === 'future' || scope === 'all') {
        await transactionService.deleteScope(req.userId!, req.params.id, scope);
      } else {
        await transactionService.delete(req.userId!, req.params.id);
      }
      res.json({ success: true, message: 'Transaction deleted' });
    } catch (e) { next(e); }
  },

  getSummary: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const now = new Date();
      const month = parseInt(req.query.month as string) || now.getMonth() + 1;
      const year = parseInt(req.query.year as string) || now.getFullYear();
      const summary = await transactionService.getSummary(req.userId!, month, year);
      res.json({ success: true, data: summary });
    } catch (e) { next(e); }
  },

  getByCategory: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const now = new Date();
      const startDate = req.query.startDate
        ? new Date(`${req.query.startDate}T00:00:00.000Z`)
        : new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0));
      const endDate = req.query.endDate
        ? new Date(`${req.query.endDate}T23:59:59.999Z`)
        : new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1, 0, 0, 0) - 1);
      const data = await transactionService.getByCategory(req.userId!, startDate, endDate);
      res.json({ success: true, data });
    } catch (e) { next(e); }
  },

  getMonthlyEvolution: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const months = Math.min(parseInt(req.query.months as string) || 12, 24);
      const data = await transactionService.getMonthlyEvolution(req.userId!, months);
      res.json({ success: true, data });
    } catch (e) { next(e); }
  },

  exportExcel: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const workbook = await exportService.toExcel(req.userId!, req.query as any);
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="transacoes-${Date.now()}.xlsx"`);
      await workbook.xlsx.write(res);
    } catch (e) { next(e); }
  },

  exportCsv: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const csv = await exportService.toCsv(req.userId!, req.query as any);
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="transacoes-${Date.now()}.csv"`);
      res.send('﻿' + csv); // BOM for Excel UTF-8
    } catch (e) { next(e); }
  },
};
