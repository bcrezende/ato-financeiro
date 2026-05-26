import prisma from '../utils/prisma';
import logger from '../utils/logger';

/**
 * Marks any TRIAL user whose trial window has passed as EXPIRED.
 * The subscription middleware already expires trials on access, but this
 * sweep keeps the DB accurate for users who simply stop logging in.
 */
export async function expireStaleTrials() {
  try {
    const result = await prisma.user.updateMany({
      where: { subscriptionStatus: 'TRIAL', trialEndsAt: { lt: new Date() } },
      data: { subscriptionStatus: 'EXPIRED' },
    });
    if (result.count > 0) logger.info(`Trial expiry sweep: ${result.count} user(s) expired`);
  } catch (e) {
    logger.error('Trial expiry sweep failed', e);
  }
}

const ONE_DAY = 24 * 60 * 60 * 1000;

export function startTrialExpiryJob() {
  // Run shortly after boot, then once a day
  setTimeout(expireStaleTrials, 10_000);
  setInterval(expireStaleTrials, ONE_DAY);
}
