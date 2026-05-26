import { Router } from 'express';
import { webhookController } from '../controllers/webhook.controller';
import express from 'express';

const router = Router();
router.post('/stripe', express.raw({ type: 'application/json' }), webhookController.stripe);

export default router;
