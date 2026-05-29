import { Response, NextFunction } from 'express';
import { body } from 'express-validator';
import { AuthRequest } from '../types';
import { suggestionService, VALID_CATEGORIES } from '../services/suggestion.service';
import { validate } from '../middlewares/validate.middleware';

export const suggestionValidators = {
  create: [
    body('content').isString().trim().isLength({ min: 5, max: 2000 })
      .withMessage('Sua sugestão precisa ter entre 5 e 2000 caracteres.'),
    body('title').optional({ nullable: true }).isString().trim().isLength({ max: 120 })
      .withMessage('Título no máximo 120 caracteres.'),
    body('category').optional().isIn(VALID_CATEGORIES as unknown as string[])
      .withMessage('Categoria inválida.'),
    validate,
  ],
};

export const suggestionController = {
  list: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const items = await suggestionService.findAllForUser(req.userId!);
      res.json({ success: true, data: items });
    } catch (e) { next(e); }
  },

  create: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { content, title, category } = req.body;
      const item = await suggestionService.create(req.userId!, { content, title, category });
      res.status(201).json({ success: true, data: item });
    } catch (e) { next(e); }
  },

  delete: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      await suggestionService.delete(req.userId!, req.params.id);
      res.json({ success: true, message: 'Sugestão removida.' });
    } catch (e) { next(e); }
  },
};
