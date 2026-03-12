import { Router } from 'express';
import { registrarEntrada, registrarSalida, obtenerAsistenciasDelDia } from '../controllers/asistenciaController';
import { authenticate, requireEmpresaMatch } from '../middleware/auth';

const router = Router();

router.post('/entrada/:empleadoId', authenticate, registrarEntrada);
router.post('/salida/:empleadoId', authenticate, registrarSalida);
router.get('/dia/:empresaId', authenticate, requireEmpresaMatch(), obtenerAsistenciasDelDia);

export default router;
