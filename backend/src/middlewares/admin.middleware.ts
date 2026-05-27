import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AdminRequest, AdminJwtPayload } from '../types';
import { UnauthorizedError } from '../utils/errors';
import prisma from '../utils/prisma';

/**
 * Verifies an admin JWT (signed with ADMIN_JWT_SECRET, distinct from the user
 * secret) and confirms the admin still exists. A normal user token can never
 * satisfy this — different secret + required role claim.
 */
export const requireAdmin = async (req: AdminRequest, _res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) throw new UnauthorizedError('No token provided');

    const token = authHeader.split(' ')[1];
    let payload: AdminJwtPayload;
    try {
      payload = jwt.verify(token, process.env.ADMIN_JWT_SECRET!) as AdminJwtPayload;
    } catch {
      throw new UnauthorizedError('Invalid or expired admin token');
    }

    if (payload.role !== 'ADMIN' || !payload.adminId) throw new UnauthorizedError('Not an admin');

    const admin = await prisma.admin.findUnique({ where: { id: payload.adminId }, select: { id: true, email: true } });
    if (!admin) throw new UnauthorizedError('Admin not found');

    req.adminId = admin.id;
    req.admin = { id: admin.id, email: admin.email };
    next();
  } catch (e) {
    next(e);
  }
};
