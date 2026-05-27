import { Request, Response, NextFunction } from 'express';
import { body } from 'express-validator';
import { adminService } from '../services/admin.service';
import { AdminRequest } from '../types';
import { validate } from '../middlewares/validate.middleware';

export const adminValidators = {
  login: [
    body('email').isEmail().normalizeEmail().withMessage('Email válido obrigatório'),
    body('password').notEmpty().withMessage('Senha obrigatória'),
    validate,
  ],
  updateSubscription: [
    body('subscriptionStatus').optional().isIn(['TRIAL', 'ACTIVE', 'EXPIRED', 'CANCELED', 'PAST_DUE']),
    body('trialEndsAt').optional({ nullable: true }).isISO8601(),
    validate,
  ],
  block: [
    body('blocked').isBoolean().withMessage('blocked deve ser booleano'),
    validate,
  ],
  createAdmin: [
    body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Nome 2-100 caracteres'),
    body('email').isEmail().normalizeEmail().withMessage('Email válido obrigatório'),
    body('password').isLength({ min: 8 }).withMessage('Senha mínima de 8 caracteres'),
    validate,
  ],
};

export const adminController = {
  login: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;
      const result = await adminService.login(email, password);
      res.json({ success: true, data: result });
    } catch (e) { next(e); }
  },

  getMetrics: async (_req: AdminRequest, res: Response, next: NextFunction) => {
    try {
      res.json({ success: true, data: await adminService.getMetrics() });
    } catch (e) { next(e); }
  },

  getSignups: async (req: AdminRequest, res: Response, next: NextFunction) => {
    try {
      const days = Math.min(parseInt(req.query.days as string) || 30, 90);
      res.json({ success: true, data: await adminService.getSignups(days) });
    } catch (e) { next(e); }
  },

  listUsers: async (req: AdminRequest, res: Response, next: NextFunction) => {
    try {
      const result = await adminService.listUsers({
        search: req.query.search as string,
        status: req.query.status as string,
        page: parseInt(req.query.page as string) || 1,
        limit: parseInt(req.query.limit as string) || 20,
      });
      res.json({ success: true, ...result });
    } catch (e) { next(e); }
  },

  getUser: async (req: AdminRequest, res: Response, next: NextFunction) => {
    try {
      res.json({ success: true, data: await adminService.getUser(req.params.id) });
    } catch (e) { next(e); }
  },

  updateSubscription: async (req: AdminRequest, res: Response, next: NextFunction) => {
    try {
      const updated = await adminService.updateUserSubscription(req.adminId!, req.params.id, req.body);
      res.json({ success: true, data: updated });
    } catch (e) { next(e); }
  },

  block: async (req: AdminRequest, res: Response, next: NextFunction) => {
    try {
      const updated = await adminService.setUserBlocked(req.adminId!, req.params.id, req.body.blocked);
      res.json({ success: true, data: updated });
    } catch (e) { next(e); }
  },

  deleteUser: async (req: AdminRequest, res: Response, next: NextFunction) => {
    try {
      await adminService.deleteUser(req.adminId!, req.params.id);
      res.json({ success: true, message: 'Usuário excluído' });
    } catch (e) { next(e); }
  },

  listAdmins: async (_req: AdminRequest, res: Response, next: NextFunction) => {
    try {
      res.json({ success: true, data: await adminService.listAdmins() });
    } catch (e) { next(e); }
  },

  createAdmin: async (req: AdminRequest, res: Response, next: NextFunction) => {
    try {
      const admin = await adminService.createAdmin(req.adminId!, req.body);
      res.status(201).json({ success: true, data: admin });
    } catch (e) { next(e); }
  },

  listAudit: async (req: AdminRequest, res: Response, next: NextFunction) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 50;
      const result = await adminService.listAudit(page, limit);
      res.json({ success: true, ...result });
    } catch (e) { next(e); }
  },
};
