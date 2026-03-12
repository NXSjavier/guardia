import { Router } from 'express';
import { 
  crearTurno, 
  obtenerTurnos, 
  obtenerTurnoPorId, 
  actualizarTurno, 
  cambiarEstadoTurno,
  obtenerTurnosDelDia 
} from '../controllers/turnoController';
import { authenticate, authorize, requireEmpresaMatch } from '../middleware/auth';

const router = Router();

router.post('/', authenticate, authorize('administrador', 'supervisor'), requireEmpresaMatch(), crearTurno);
router.get('/:empresaId', authenticate, requireEmpresaMatch(), obtenerTurnos);
router.get('/dia/:empresaId', authenticate, requireEmpresaMatch(), obtenerTurnosDelDia);
router.get('/turno/:id', authenticate, obtenerTurnoPorId);
router.put('/:id', authenticate, authorize('administrador', 'supervisor'), actualizarTurno);
router.patch('/:id/estado', authenticate, cambiarEstadoTurno);

export default router;
