import StripeLib = require('stripe');
import prisma from '../utils/prisma';

type StripeEvent = ReturnType<InstanceType<typeof StripeLib>['webhooks']['constructEvent']>;

const stripe = new StripeLib(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2026-04-22.dahlia' });

export const subscriptionService = {
  async createCheckoutSession(userId: string, email: string) {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      customer_email: email,
      line_items: [{ price: process.env.STRIPE_PRICE_ID!, quantity: 1 }],
      success_url: `${process.env.FRONTEND_URL}/subscription/success`,
      cancel_url: `${process.env.FRONTEND_URL}/subscription`,
      metadata: { userId },
      subscription_data: { metadata: { userId } },
    });
    return session;
  },

  async createPortalSession(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user?.stripeCustomerId) throw new Error('No Stripe customer found');
    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${process.env.FRONTEND_URL}/settings`,
    });
    return session;
  },

  async getStatus(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { subscriptionStatus: true, trialEndsAt: true, stripeCustomerId: true },
    });
    if (!user) throw new Error('User not found');

    // Auto-expire trial
    if (user.subscriptionStatus === 'TRIAL' && user.trialEndsAt && user.trialEndsAt < new Date()) {
      await prisma.user.update({ where: { id: userId }, data: { subscriptionStatus: 'EXPIRED' } });
      return { subscriptionStatus: 'EXPIRED', trialEndsAt: user.trialEndsAt, daysLeft: 0 };
    }

    const daysLeft = user.trialEndsAt
      ? Math.max(0, Math.ceil((user.trialEndsAt.getTime() - Date.now()) / 86400000))
      : null;
    return { subscriptionStatus: user.subscriptionStatus, trialEndsAt: user.trialEndsAt, daysLeft };
  },

  async handleWebhookEvent(event: StripeEvent) {
    switch ((event as any).type) {
      case 'checkout.session.completed': {
        const session = (event as any).data.object;
        const userId = session.metadata?.userId;
        if (!userId) break;
        await prisma.user.update({
          where: { id: userId },
          data: {
            subscriptionStatus: 'ACTIVE',
            stripeCustomerId: session.customer as string,
            stripeSubscriptionId: session.subscription as string,
          },
        });
        break;
      }
      case 'customer.subscription.updated': {
        const sub = (event as any).data.object;
        const userId = sub.metadata?.userId;
        if (!userId) break;
        const status = sub.status === 'active' ? 'ACTIVE'
          : sub.status === 'past_due' ? 'PAST_DUE'
          : sub.status === 'canceled' ? 'CANCELED'
          : 'EXPIRED';
        await prisma.user.update({ where: { id: userId }, data: { subscriptionStatus: status } });
        break;
      }
      case 'customer.subscription.deleted': {
        const sub = (event as any).data.object;
        const userId = sub.metadata?.userId;
        if (!userId) break;
        await prisma.user.update({ where: { id: userId }, data: { subscriptionStatus: 'CANCELED' } });
        break;
      }
      case 'invoice.payment_succeeded': {
        const invoice = (event as any).data.object;
        const customerId = invoice.customer as string;
        if (customerId) {
          await prisma.user.updateMany({ where: { stripeCustomerId: customerId }, data: { subscriptionStatus: 'ACTIVE' } });
        }
        break;
      }
      case 'invoice.payment_failed': {
        const invoice = (event as any).data.object;
        const customerId = invoice.customer as string;
        if (customerId) {
          await prisma.user.updateMany({ where: { stripeCustomerId: customerId }, data: { subscriptionStatus: 'PAST_DUE' } });
        }
        break;
      }
    }
  },
};
