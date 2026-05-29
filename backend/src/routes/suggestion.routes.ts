import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { suggestionController, suggestionValidators } from '../controllers/suggestion.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

// Sugestões NÃO exigem assinatura ativa — feedback é valioso de trial/expired/canceled users também.
router.use(authenticate);

// Limite específico: evita que um usuário descarregue centenas de sugestões em loop.
const createLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1h
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: { message: 'Limite de envios atingido. Tente novamente em 1 hora.', code: 'RATE_LIMIT' } },
});

router.get('/', suggestionController.list);
router.post('/', createLimiter, suggestionValidators.create, suggestionController.create);
router.delete('/:id', suggestionController.delete);

export default router;
