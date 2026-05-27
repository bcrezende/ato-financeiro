import { Response, NextFunction } from 'express';
import { body } from 'express-validator';
import { AuthRequest } from '../types';
import { dreamService } from '../services/dream.service';
import { validate } from '../middlewares/validate.middleware';

export const dreamValidators = {
  create: [
    body('imageData').isString().notEmpty().withMessage('imageData required'),
    body('title').optional().isString().isLength({ max: 100 }),
    body('size').optional().isIn(['sm', 'md', 'lg', 'wide', 'tall']),
    validate,
  ],
};

export const dreamController = {
  findAll: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const items = await dreamService.findAll(req.userId!);
      res.json({ success: true, data: items });
    } catch (e) { next(e); }
  },

  create: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { imageData, title, size } = req.body;
      const item = await dreamService.create(req.userId!, { imageData, title, size });
      res.status(201).json({ success: true, data: item });
    } catch (e) { next(e); }
  },

  delete: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      await dreamService.delete(req.userId!, req.params.id);
      res.json({ success: true, message: 'Deleted' });
    } catch (e) { next(e); }
  },
};
