import { Response, NextFunction } from 'express';
import { body } from 'express-validator';
import { categoryService } from '../services/category.service';
import { AuthRequest } from '../types';
import { validate } from '../middlewares/validate.middleware';
import { CategoryType } from '@prisma/client';

export const categoryValidators = {
  create: [
    body('name').trim().isLength({ min: 1, max: 100 }).withMessage('Name required'),
    body('color').matches(/^#[0-9A-Fa-f]{6}$/).withMessage('Valid hex color required'),
    body('icon').trim().isLength({ min: 1 }).withMessage('Icon required'),
    body('type').isIn(['INCOME', 'EXPENSE']).withMessage('Type must be INCOME or EXPENSE'),
    validate,
  ],
  update: [
    body('name').optional().trim().isLength({ min: 1, max: 100 }),
    body('color').optional().matches(/^#[0-9A-Fa-f]{6}$/),
    body('icon').optional().trim().isLength({ min: 1 }),
    validate,
  ],
};

export const categoryController = {
  findAll: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const categories = await categoryService.findAll(req.userId!);
      res.json({ success: true, data: categories });
    } catch (e) { next(e); }
  },

  create: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const cat = await categoryService.create(req.userId!, {
        ...req.body,
        type: req.body.type as CategoryType,
      });
      res.status(201).json({ success: true, data: cat });
    } catch (e) { next(e); }
  },

  update: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const cat = await categoryService.update(req.userId!, req.params.id, req.body);
      res.json({ success: true, data: cat });
    } catch (e) { next(e); }
  },

  delete: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      await categoryService.delete(req.userId!, req.params.id);
      res.json({ success: true, message: 'Category deleted' });
    } catch (e) { next(e); }
  },
};
