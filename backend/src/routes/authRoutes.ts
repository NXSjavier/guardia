import { Router } from 'express';
import { registrarUsuario, iniciarSesion, obtenerPerfil, actualizarPerfil, actualizarFcmToken } from '../controllers/authController';
import { authenticate, authorize } from '../middleware/auth';

const router = Router();

router.post('/registrar', registrarUsuario);
router.post('/login', iniciarSesion);
router.get('/perfil/:uid', authenticate, obtenerPerfil);
router.put('/perfil/:uid', authenticate, authorize('administrador', 'supervisor', 'guardia'), actualizarPerfil);
router.put('/fcm/:uid', authenticate, actualizarFcmToken);

export default router;
