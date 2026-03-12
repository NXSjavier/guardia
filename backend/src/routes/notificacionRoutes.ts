import { Router } from 'express';
import { 
  obtenerNotificaciones, 
  marcarNotificacionLeida, 
  marcarTodasLeidas,
  enviarNotificacionPush,
  crearNotificacion
} from '../controllers/notificacionController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.get('/:usuarioId', authenticate, obtenerNotificaciones);
router.patch('/:id/leida', authenticate, marcarNotificacionLeida);
router.patch('/leidas/:usuarioId', authenticate, marcarTodasLeidas);
router.post('/push', authenticate, authorize('administrador'), enviarNotificacionPush);
router.post('/', authenticate, authorize('administrador', 'supervisor'), crearNotificacion);

export default router;
