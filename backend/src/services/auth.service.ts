import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import prisma from '../utils/prisma';
import { ConflictError, UnauthorizedError, NotFoundError } from '../utils/errors';
import { emailService } from './email.service';
import { normalizePhone } from '../utils/phone';
import { JwtPayload } from '../types';

const SALT_ROUNDS = 12;

export const authService = {
  async register(email: string, name: string, password: string) {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) throw new ConflictError('Email already in use');

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await prisma.user.create({
      data: {
        email, name, passwordHash,
        trialEndsAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        subscriptionStatus: 'TRIAL',
      },
      select: { id: true, email: true, name: true, subscriptionStatus: true, trialEndsAt: true, createdAt: true },
    });
    return user;
  },

  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new UnauthorizedError('Invalid credentials');

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw new UnauthorizedError('Invalid credentials');

    if (user.isBlocked) throw new UnauthorizedError('Conta suspensa. Entre em contato com o suporte.');

    const { accessToken, refreshToken } = await this.generateTokens(user.id, user.email);
    return {
      user: { id: user.id, email: user.email, name: user.name, subscriptionStatus: user.subscriptionStatus, trialEndsAt: user.trialEndsAt },
      accessToken,
      refreshToken,
    };
  },

  async refresh(token: string) {
    let payload: JwtPayload;
    try {
      payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET!) as JwtPayload;
    } catch {
      throw new UnauthorizedError('Invalid refresh token');
    }

    const stored = await prisma.refreshToken.findUnique({ where: { token } });
    if (!stored || stored.expiresAt < new Date()) {
      throw new UnauthorizedError('Refresh token expired or not found');
    }

    await prisma.refreshToken.delete({ where: { token } });
    return this.generateTokens(payload.userId, payload.email);
  },

  async logout(token: string) {
    await prisma.refreshToken.deleteMany({ where: { token } });
  },

  async generateTokens(userId: string, email: string) {
    const accessToken = jwt.sign({ userId, email }, process.env.JWT_SECRET!, {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    } as jwt.SignOptions);

    const refreshToken = uuidv4();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    await prisma.refreshToken.create({ data: { token: refreshToken, userId, expiresAt } });
    return { accessToken, refreshToken };
  },

  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, avatarUrl: true, currency: true, locale: true, phone: true, subscriptionStatus: true, trialEndsAt: true, createdAt: true },
    });
    if (!user) throw new NotFoundError('User');
    return user;
  },

  async updateProfile(userId: string, data: { name?: string; currency?: string; locale?: string; phone?: string | null }) {
    const update: any = {};
    if (data.name !== undefined) update.name = data.name;
    if (data.currency !== undefined) update.currency = data.currency;
    if (data.locale !== undefined) update.locale = data.locale;
    if (data.phone !== undefined) update.phone = normalizePhone(data.phone);

    try {
      return await prisma.user.update({
        where: { id: userId },
        data: update,
        select: { id: true, email: true, name: true, currency: true, locale: true, phone: true },
      });
    } catch (e: any) {
      if (e.code === 'P2002') throw new ConflictError('Este telefone já está cadastrado em outra conta');
      throw e;
    }
  },

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundError('User');
    const valid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!valid) throw new UnauthorizedError('Current password is incorrect');
    const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
    await prisma.user.update({ where: { id: userId }, data: { passwordHash } });
  },

  async forgotPassword(email: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    // Always return silently — don't reveal whether email exists
    if (!user) return;

    // Invalidate previous tokens
    await prisma.passwordResetToken.deleteMany({ where: { userId: user.id } });

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.passwordResetToken.create({ data: { token, userId: user.id, expiresAt } });

    const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
    await emailService.sendPasswordReset({ email: user.email, name: user.name }, resetUrl);
  },

  async resetPassword(token: string, newPassword: string) {
    // Atomically claim the token: only ONE concurrent request can flip used:false → true
    // for a valid, unexpired token. This closes the check-then-act race condition.
    const claimed = await prisma.passwordResetToken.updateMany({
      where: { token, used: false, expiresAt: { gt: new Date() } },
      data: { used: true },
    });
    if (claimed.count === 0) {
      throw new UnauthorizedError('Link inválido ou expirado. Solicite um novo.');
    }

    const record = await prisma.passwordResetToken.findUnique({ where: { token } });
    if (!record) throw new UnauthorizedError('Link inválido ou expirado. Solicite um novo.');

    const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);

    await prisma.$transaction([
      prisma.user.update({ where: { id: record.userId }, data: { passwordHash } }),
      // Invalidate all refresh tokens so existing sessions are logged out
      prisma.refreshToken.deleteMany({ where: { userId: record.userId } }),
    ]);
  },

  async deleteAccount(userId: string, password: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundError('User');
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw new UnauthorizedError('Senha incorreta');
    // Cascade deletes handle: transactions, categories, budgets, refreshTokens
    await prisma.user.delete({ where: { id: userId } });
  },
};
