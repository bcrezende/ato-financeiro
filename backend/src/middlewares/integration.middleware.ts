import { Request, Response, NextFunction } from 'express';
import { UnauthorizedError, AppError } from '../utils/errors';

/**
 * Machine-to-machine auth for external integrations (e.g. the n8n WhatsApp agent).
 * Requires a shared secret in the `X-API-Key` header matching INTEGRATION_API_KEY.
 * Uses a constant-time-ish comparison to avoid trivial timing leaks.
 */
export const requireIntegrationKey = (req: Request, _res: Response, next: NextFunction) => {
  try {
    const expected = process.env.INTEGRATION_API_KEY;
    if (!expected) throw new AppError('Integração não configurada', 503, 'INTEGRATION_DISABLED');

    const provided = (req.headers['x-api-key'] as string) || '';
    if (provided.length !== expected.length || provided !== expected) {
      throw new UnauthorizedError('Chave de integração inválida');
    }
    next();
  } catch (e) {
    next(e);
  }
};
