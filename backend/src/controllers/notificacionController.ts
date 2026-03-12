import { Response } from 'express';
import { db } from '../config/firebase';
import admin from '../config/firebase';
import { AuthRequest } from '../middleware/auth';

export const obtenerNotificaciones = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { usuarioId } = req.params;
    const { limite = '50', noLeidas } = req.query;
    const empresaId = req.user?.empresaId;
    const rol = req.user?.rol;
    const uid = req.user?.uid;

    if (!empresaId) {
      res.status(401).json({ error: 'No autenticado' });
      return;
    }
    if (rol !== 'administrador' && rol !== 'supervisor' && usuarioId !== uid) {
      res.status(403).json({ error: 'No tienes acceso a estas notificaciones' });
      return;
    }

    let query = db.collection('notificaciones')
      .where('empresaId', '==', empresaId)
      .where('usuarioId', '==', usuarioId)
      .orderBy('createdAt', 'desc')
      .limit(parseInt(limite as string));

    const snapshot = await query.get();
    let notificaciones = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    if (noLeidas === 'true') {
      notificaciones = notificaciones.filter((n: any) => !n.leida);
    }

    res.json(notificaciones);
  } catch (error) {
    console.error('Error al obtener notificaciones:', error);
    res.status(500).json({ error: 'Error al obtener las notificaciones' });
  }
};

export const marcarNotificacionLeida = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const doc = await db.collection('notificaciones').doc(id).get();
    if (!doc.exists) {
      res.status(404).json({ error: 'Notificacion no encontrada' });
      return;
    }

    const empresaId = req.user?.empresaId;
    if (!empresaId || doc.data()?.empresaId !== empresaId) {
      res.status(403).json({ error: 'No tienes acceso a esta notificacion' });
      return;
    }
    const rol = req.user?.rol;
    const uid = req.user?.uid;
    if (rol !== 'administrador' && rol !== 'supervisor' && doc.data()?.usuarioId !== uid) {
      res.status(403).json({ error: 'No tienes acceso a esta notificacion' });
      return;
    }

    await db.collection('notificaciones').doc(id).update({ leida: true });
    res.json({ message: 'Notificacion marcada como leida' });
  } catch (error) {
    console.error('Error al marcar notificacion:', error);
    res.status(500).json({ error: 'Error al marcar la notificacion' });
  }
};

export const marcarTodasLeidas = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { usuarioId } = req.params;
    const empresaId = req.user?.empresaId;
    const rol = req.user?.rol;
    const uid = req.user?.uid;

    if (!empresaId) {
      res.status(401).json({ error: 'No autenticado' });
      return;
    }
    if (rol !== 'administrador' && rol !== 'supervisor' && usuarioId !== uid) {
      res.status(403).json({ error: 'No tienes acceso a estas notificaciones' });
      return;
    }

    const snapshot = await db.collection('notificaciones')
      .where('empresaId', '==', empresaId)
      .where('usuarioId', '==', usuarioId)
      .where('leida', '==', false)
      .get();

    const batch = db.batch();
    snapshot.docs.forEach(doc => {
      batch.update(doc.ref, { leida: true });
    });

    await batch.commit();
    res.json({ message: 'Todas las notificaciones marcadas como leidas' });
  } catch (error) {
    console.error('Error al marcar notificaciones:', error);
    res.status(500).json({ error: 'Error al marcar las notificaciones' });
  }
};

export const enviarNotificacionPush = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { token, titulo, mensaje, data } = req.body;

    if (!token || !titulo || !mensaje) {
      res.status(400).json({ error: 'Faltan datos requeridos' });
      return;
    }

    const message = {
      notification: {
        title: titulo,
        body: mensaje,
      },
      data: data || {},
      token,
    };

    await admin.messaging().send(message);
    res.json({ message: 'Notificacion enviada exitosamente' });
  } catch (error) {
    console.error('Error al enviar notificacion:', error);
    res.status(500).json({ error: 'Error al enviar la notificacion' });
  }
};

export const crearNotificacion = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { usuarioId, titulo, mensaje, tipo, data } = req.body;
    const empresaId = req.user?.empresaId;

    if (!empresaId) {
      res.status(401).json({ error: 'No autenticado' });
      return;
    }
    if (!usuarioId || !titulo || !mensaje) {
      res.status(400).json({ error: 'Faltan datos requeridos' });
      return;
    }

    const notifData = {
      empresaId,
      usuarioId,
      titulo,
      mensaje,
      tipo: tipo || 'sistema',
      leida: false,
      data: data || {},
      createdAt: new Date(),
    };

    await db.collection('notificaciones').add(notifData);
    res.status(201).json({ message: 'Notificacion creada' });
  } catch (error) {
    console.error('Error al crear notificacion:', error);
    res.status(500).json({ error: 'Error al crear la notificacion' });
  }
};
