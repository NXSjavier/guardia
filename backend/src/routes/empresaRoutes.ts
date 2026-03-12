import { Router } from 'express';
import { crearEmpresa, obtenerEmpresas, obtenerEmpresaPorId, actualizarEmpresa } from '../controllers/empresaController';

const router = Router();

router.post('/', crearEmpresa);
router.get('/', obtenerEmpresas);
router.get('/:id', obtenerEmpresaPorId);
router.put('/:id', actualizarEmpresa);

export default router;
