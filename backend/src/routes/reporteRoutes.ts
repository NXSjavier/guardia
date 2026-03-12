import { Router } from 'express';
import { 
  crearReporte, 
  obtenerReportes, 
  obtenerReportePorId,
  obtenerReportesDelEmpleado 
} from '../controllers/reporteController';
import { authenticate, requireEmpresaMatch } from '../middleware/auth';

const router = Router();

router.post('/', authenticate, requireEmpresaMatch(), crearReporte);
router.get('/:empresaId', authenticate, requireEmpresaMatch(), obtenerReportes);
router.get('/empleado/:empleadoId', authenticate, obtenerReportesDelEmpleado);
router.get('/reporte/:id', authenticate, obtenerReportePorId);

export default router;
