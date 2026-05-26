import { Request, Response, NextFunction } from 'express';
import { body } from 'express-validator';
import { authService } from '../services/auth.service';
import { AuthRequest } from '../types';
import { validate } from '../middlewares/validate.middleware';

export const authValidators = {
  register: [
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('name').trim().isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
    validate,
  ],
  login: [
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('password').notEmpty().withMessage('Password required'),
    validate,
  ],
  changePassword: [
    body('currentPassword').notEmpty(),
    body('newPassword').isLength({ min: 8 }).withMessage('New password must be at least 8 characters'),
    validate,
  ],
  refresh: [
    body('refreshToken').isString().trim().notEmpty().withMessage('refreshToken required'),
    validate,
  ],
  forgotPassword: [
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    validate,
  ],
  resetPassword: [
    body('token').isString().trim().notEmpty().withMessage('Token required'),
    body('newPassword').isLength({ min: 8 }).withMessage('New password must be at least 8 characters'),
    validate,
  ],
  updateProfile: [
    body('name').optional().trim().isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters'),
    body('currency').optional().isIn(['BRL', 'USD', 'EUR']).withMessage('Invalid currency'),
    body('locale').optional().isIn(['pt-BR', 'en-US', 'es-ES']).withMessage('Invalid locale'),
    validate,
  ],
};

export const authController = {
  register: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, name, password } = req.body;
      const user = await authService.register(email, name, password);
      res.status(201).json({ success: true, data: user });
    } catch (e) { next(e); }
  },

  login: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;
      const result = await authService.login(email, password);
      res.json({ success: true, data: result });
    } catch (e) { next(e); }
  },

  refresh: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { refreshToken } = req.body;
      if (!refreshToken) { res.status(400).json({ success: false, error: { message: 'refreshToken required' } }); return; }
      const tokens = await authService.refresh(refreshToken);
      res.json({ success: true, data: tokens });
    } catch (e) { next(e); }
  },

  logout: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { refreshToken } = req.body;
      if (refreshToken) await authService.logout(refreshToken);
      res.json({ success: true, message: 'Logged out' });
    } catch (e) { next(e); }
  },

  getProfile: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const user = await authService.getProfile(req.userId!);
      res.json({ success: true, data: user });
    } catch (e) { next(e); }
  },

  updateProfile: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { name, currency, locale } = req.body;
      const user = await authService.updateProfile(req.userId!, { name, currency, locale });
      res.json({ success: true, data: user });
    } catch (e) { next(e); }
  },

  changePassword: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { currentPassword, newPassword } = req.body;
      await authService.changePassword(req.userId!, currentPassword, newPassword);
      res.json({ success: true, message: 'Password updated' });
    } catch (e) { next(e); }
  },

  forgotPassword: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email } = req.body;
      if (!email) { res.status(400).json({ success: false, error: { message: 'Email obrigatório' } }); return; }
      await authService.forgotPassword(email);
      // Always 200 — don't leak whether email exists
      res.json({ success: true, message: 'Se este email estiver cadastrado, você receberá as instruções em breve.' });
    } catch (e) { next(e); }
  },

  resetPassword: async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { token, newPassword } = req.body;
      if (!token || !newPassword) { res.status(400).json({ success: false, error: { message: 'Token e nova senha são obrigatórios' } }); return; }
      if (newPassword.length < 8) { res.status(400).json({ success: false, error: { message: 'Senha deve ter no mínimo 8 caracteres' } }); return; }
      await authService.resetPassword(token, newPassword);
      res.json({ success: true, message: 'Senha redefinida com sucesso!' });
    } catch (e) { next(e); }
  },

  deleteAccount: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const { password } = req.body;
      if (!password) { res.status(400).json({ success: false, error: { message: 'Senha obrigatória' } }); return; }
      await authService.deleteAccount(req.userId!, password);
      res.json({ success: true, message: 'Account deleted' });
    } catch (e) { next(e); }
  },
};
