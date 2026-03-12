import { Router } from 'express';
import { 
  crearPermiso, 
  obtenerPermisos, 
  obtenerPermisoPorId, 
  aprobarPermiso,
  rechazarPermiso 
} from '../controllers/permisoController';
import { authenticate, authorize, requireEmpresaMatch } from '../middleware/auth';

const router = Router();

router.post('/', authenticate, requireEmpresaMatch(), crearPermiso);
router.get('/:empresaId', authenticate, requireEmpresaMatch(), obtenerPermisos);
router.get('/permiso/:id', authenticate, obtenerPermisoPorId);
router.patch('/aprobar/:id', authenticate, authorize('administrador', 'supervisor'), aprobarPermiso);
router.patch('/rechazar/:id', authenticate, authorize('administrador', 'supervisor'), rechazarPermiso);

export default router;
