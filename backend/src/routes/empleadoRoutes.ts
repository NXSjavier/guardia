import { Router } from 'express';
import { 
  crearEmpleado, 
  obtenerEmpleados, 
  obtenerEmpleadoPorId, 
  actualizarEmpleado, 
  eliminarEmpleado,
  cambiarEstadoEmpleado 
} from '../controllers/empleadoController';
import { authenticate, authorize, requireEmpresaMatch } from '../middleware/auth';

const router = Router();

router.post('/', authenticate, authorize('administrador'), requireEmpresaMatch(), crearEmpleado);
router.get('/:empresaId', authenticate, authorize('administrador', 'supervisor'), requireEmpresaMatch(), obtenerEmpleados);
router.get('/empleado/:id', authenticate, obtenerEmpleadoPorId);
router.put('/:id', authenticate, authorize('administrador', 'supervisor'), actualizarEmpleado);
router.delete('/:id', authenticate, authorize('administrador'), eliminarEmpleado);
router.patch('/:id/estado', authenticate, authorize('administrador', 'supervisor'), cambiarEstadoEmpleado);

export default router;
