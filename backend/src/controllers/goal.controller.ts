import { Response, NextFunction } from 'express';
import { body } from 'express-validator';
import { goalService } from '../services/goal.service';
import { AuthRequest } from '../types';
import { validate } from '../middlewares/validate.middleware';

export const goalValidators = {
  create: [
    body('title').trim().isLength({ min: 1, max: 200 }).withMessage('Título obrigatório'),
    body('description').optional({ nullable: true }).isString(),
    body('type').isIn(['FINANCIAL', 'OTHER']).withMessage('Tipo deve ser FINANCIAL ou OTHER'),
    body('targetValue').optional({ nullable: true }).isFloat({ gt: 0 }),
    body('targetDate').optional({ nullable: true }).isISO8601(),
    body('color').optional().isString(),
    body('icon').optional().isString(),
    body('initialSteps').optional().isArray(),
    validate,
  ],
  update: [
    body('title').optional().trim().isLength({ min: 1, max: 200 }),
    body('description').optional({ nullable: true }),
    body('targetValue').optional({ nullable: true }).isFloat({ gt: 0 }),
    body('targetDate').optional({ nullable: true }).isISO8601(),
    body('color').optional().isString(),
    body('icon').optional().isString(),
    body('status').optional().isIn(['ACTIVE', 'COMPLETED', 'ARCHIVED']),
    validate,
  ],
  step: [
    body('title').optional().trim().isLength({ min: 1, max: 200 }),
    body('isDone').optional().isBoolean(),
    validate,
  ],
  contribution: [
    body('amount').isFloat({ gt: 0 }).withMessage('Valor deve ser positivo'),
    body('note').optional().isString().isLength({ max: 200 }),
    body('date').optional().isISO8601(),
    validate,
  ],
};

export const goalController = {
  list: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try { res.json({ success: true, data: await goalService.list(req.userId!) }); } catch (e) { next(e); }
  },
  getById: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try { res.json({ success: true, data: await goalService.getById(req.userId!, req.params.id) }); } catch (e) { next(e); }
  },
  create: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try { res.status(201).json({ success: true, data: await goalService.create(req.userId!, req.body) }); } catch (e) { next(e); }
  },
  update: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try { res.json({ success: true, data: await goalService.update(req.userId!, req.params.id, req.body) }); } catch (e) { next(e); }
  },
  delete: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try { await goalService.remove(req.userId!, req.params.id); res.json({ success: true }); } catch (e) { next(e); }
  },
  addStep: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try { res.status(201).json({ success: true, data: await goalService.addStep(req.userId!, req.params.id, req.body.title) }); } catch (e) { next(e); }
  },
  updateStep: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try { res.json({ success: true, data: await goalService.updateStep(req.userId!, req.params.id, req.params.stepId, req.body) }); } catch (e) { next(e); }
  },
  deleteStep: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try { await goalService.removeStep(req.userId!, req.params.id, req.params.stepId); res.json({ success: true }); } catch (e) { next(e); }
  },
  addContribution: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try { res.status(201).json({ success: true, data: await goalService.addContribution(req.userId!, req.params.id, req.body) }); } catch (e) { next(e); }
  },
  deleteContribution: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try { await goalService.removeContribution(req.userId!, req.params.id, req.params.contribId); res.json({ success: true }); } catch (e) { next(e); }
  },
};
