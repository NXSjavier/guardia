import { Request, Response } from 'express';
import { db, auth } from '../config/firebase';
import { AuthRequest, generateToken } from '../middleware/auth';

export const registrarUsuario = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, nombre, apellido, cedula, telefono, empresaId, rol = 'guardia', tipoTurno = 'diurno' } = req.body;

    if (!email || !password || !nombre || !empresaId) {
      res.status(400).json({ error: 'Faltan datos requeridos' });
      return;
    }

    const empresaDoc = await db.collection('empresas').doc(empresaId).get();
    if (!empresaDoc.exists) {
      res.status(404).json({ error: 'Empresa no encontrada' });
      return;
    }

    const usuariosSnapshot = await db.collection('usuarios')
      .where('empresaId', '==', empresaId)
      .where('cedula', '==', cedula)
      .get();
    
    if (!usuariosSnapshot.empty) {
      res.status(400).json({ error: 'Ya existe un usuario con esta cédula en la empresa' });
      return;
    }

    const userRecord = await auth.createUser({
      email,
      password,
      displayName: `${nombre} ${apellido || ''}`.trim(),
    });

    await auth.setCustomUserClaims(userRecord.uid, {
      empresaId,
      rol,
    });

    const usuarioData = {
      id: userRecord.uid,
      empresaId,
      cedula: cedula || '',
      nombre,
      apellido: apellido || '',
      email,
      telefono: telefono || '',
      rol,
      tipoTurno,
      estado: 'activo' as const,
      documentos: {},
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.collection('usuarios').doc(userRecord.uid).set(usuarioData);

    const token = generateToken({
      uid: userRecord.uid,
      email: userRecord.email || email,
      empresaId,
      rol,
    });

    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      token,
      user: {
        uid: userRecord.uid,
        ...usuarioData,
      },
    });
  } catch (error) {
    console.error('Error al registrar usuario:', error);
    res.status(500).json({ error: 'Error al registrar el usuario' });
  }
};

export const iniciarSesion = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email y contraseña requeridos' });
      return;
    }

    const userRecord = await auth.getUserByEmail(email);
    const customClaims = userRecord.customClaims || {};

    const usuarioDoc = await db.collection('usuarios').doc(userRecord.uid).get();
    const usuarioData = usuarioDoc.exists ? usuarioDoc.data() : null;

    const token = generateToken({
      uid: userRecord.uid,
      email: userRecord.email || email,
      empresaId: customClaims.empresaId || '',
      rol: customClaims.rol || 'guardia',
    });

    res.json({
      token,
      user: {
        uid: userRecord.uid,
        ...usuarioData,
      },
    });
  } catch (error) {
    console.error('Error al iniciar sesión:', error);
    res.status(401).json({ error: 'Credenciales inválidas' });
  }
};

export const obtenerPerfil = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { uid } = req.params;
    const doc = await db.collection('usuarios').doc(uid).get();
    
    if (!doc.exists) {
      res.status(404).json({ error: 'Usuario no encontrado' });
      return;
    }

    const empresaId = req.user?.empresaId;
    if (!empresaId || doc.data()?.empresaId !== empresaId) {
      res.status(403).json({ error: 'No tienes acceso a este perfil' });
      return;
    }

    res.json({ id: doc.id, ...doc.data() });
  } catch (error) {
    console.error('Error al obtener perfil:', error);
    res.status(500).json({ error: 'Error al obtener el perfil' });
  }
};

export const actualizarPerfil = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { uid } = req.params;
    const updates = req.body;

    const doc = await db.collection('usuarios').doc(uid).get();
    if (!doc.exists) {
      res.status(404).json({ error: 'Usuario no encontrado' });
      return;
    }
    const empresaId = req.user?.empresaId;
    if (!empresaId || doc.data()?.empresaId !== empresaId) {
      res.status(403).json({ error: 'No tienes acceso a este perfil' });
      return;
    }

    delete updates.id;
    delete updates.email;
    delete updates.empresaId;
    delete updates.rol;
    delete updates.createdAt;

    updates.updatedAt = new Date();

    await db.collection('usuarios').doc(uid).update(updates);
    res.json({ message: 'Perfil actualizado exitosamente' });
  } catch (error) {
    console.error('Error al actualizar perfil:', error);
    res.status(500).json({ error: 'Error al actualizar el perfil' });
  }
};

export const actualizarFcmToken = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { uid } = req.params;
    const { fcmToken } = req.body;

    const doc = await db.collection('usuarios').doc(uid).get();
    if (!doc.exists) {
      res.status(404).json({ error: 'Usuario no encontrado' });
      return;
    }
    const empresaId = req.user?.empresaId;
    if (!empresaId || doc.data()?.empresaId !== empresaId) {
      res.status(403).json({ error: 'No tienes acceso a este perfil' });
      return;
    }

    await db.collection('usuarios').doc(uid).update({ fcmToken });
    res.json({ message: 'Token FCM actualizado' });
  } catch (error) {
    console.error('Error al actualizar FCM token:', error);
    res.status(500).json({ error: 'Error al actualizar el token' });
  }
};
