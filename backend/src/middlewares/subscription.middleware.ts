import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types';
import prisma from '../utils/prisma';
import { AppError } from '../utils/errors';

/**
 * Enforces an active subscription at the API layer.
 *
 * Frontend gating (AppLayout redirect) is trivial to bypass with a valid JWT
 * and a direct API call — so paid access MUST also be enforced server-side.
 *
 * Allows: ACTIVE, or TRIAL within the trial window.
 * Blocks: EXPIRED / CANCELED / PAST_DUE (and auto-expires stale trials).
 */
export const requireActiveSubscription = async (
  req: AuthRequest,
  _res: Response,
  next: NextFunction,
) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId! },
      select: { subscriptionStatus: true, trialEndsAt: true },
    });
    if (!user) throw new AppError('User not found', 404, 'NOT_FOUND');

    let status = user.subscriptionStatus;

    // Server-side trial expiry — don't trust the client to call getStatus
    if (status === 'TRIAL' && user.trialEndsAt && user.trialEndsAt < new Date()) {
      await prisma.user.update({
        where: { id: req.userId! },
        data: { subscriptionStatus: 'EXPIRED' },
      });
      status = 'EXPIRED';
    }

    if (status === 'ACTIVE' || status === 'TRIAL') {
      return next();
    }

    // 402 Payment Required — frontend can detect this code and route to /subscription
    throw new AppError('Assinatura inativa. Renove para continuar.', 402, 'SUBSCRIPTION_REQUIRED');
  } catch (e) {
    next(e);
  }
};
