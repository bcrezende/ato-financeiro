import { Request, Response, NextFunction } from 'express';
import StripeLib = require('stripe');
import { subscriptionService } from '../services/subscription.service';

const stripe = new StripeLib(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2026-04-22.dahlia' });

export const webhookController = {
  stripe: async (req: Request, res: Response, next: NextFunction) => {
    const sig = req.headers['stripe-signature'] as string;
    let event: ReturnType<typeof stripe.webhooks.constructEvent>;
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
    } catch (err: any) {
      res.status(400).json({ error: `Webhook Error: ${err.message}` });
      return;
    }
    try {
      await subscriptionService.handleWebhookEvent(event);
      res.json({ received: true });
    } catch (e) { next(e); }
  },
};
