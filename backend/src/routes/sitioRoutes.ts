import { Router } from 'express';
import { 
  crearSitio, 
  obtenerSitios, 
  obtenerSitioPorId, 
  actualizarSitio, 
  eliminarSitio 
} from '../controllers/sitioController';
import { authenticate, authorize, requireEmpresaMatch } from '../middleware/auth';

const router = Router();

router.post('/', authenticate, authorize('administrador'), requireEmpresaMatch(), crearSitio);
router.get('/:empresaId', authenticate, requireEmpresaMatch(), obtenerSitios);
router.get('/sitio/:id', authenticate, obtenerSitioPorId);
router.put('/:id', authenticate, authorize('administrador', 'supervisor'), actualizarSitio);
router.delete('/:id', authenticate, authorize('administrador'), eliminarSitio);

export default router;
