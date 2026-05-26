import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import { subscriptionService } from '../services/subscription.service';

export const subscriptionController = {
  checkout: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const dbUser = await import('../utils/prisma').then(m => m.default.user.findUnique({ where: { id: req.userId! }, select: { email: true } }));
      const session = await subscriptionService.createCheckoutSession(req.userId!, dbUser!.email);
      res.json({ success: true, data: { url: session.url } });
    } catch (e) { next(e); }
  },

  portal: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const session = await subscriptionService.createPortalSession(req.userId!);
      res.json({ success: true, data: { url: session.url } });
    } catch (e) { next(e); }
  },

  getStatus: async (req: AuthRequest, res: Response, next: NextFunction) => {
    try {
      const status = await subscriptionService.getStatus(req.userId!);
      res.json({ success: true, data: status });
    } catch (e) { next(e); }
  },
};
