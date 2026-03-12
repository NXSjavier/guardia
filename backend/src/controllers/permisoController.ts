import { Response } from 'express';
import { db } from '../config/firebase';
import { v4 as uuidv4 } from 'uuid';
import { AuthRequest } from '../middleware/auth';

export const crearPermiso = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { tipo, fechaInicio, fechaFin, motivo, empleadoId } = req.body;
    const empresaId = req.user?.empresaId;

    if (!empresaId) {
      res.status(401).json({ error: 'No autenticado' });
      return;
    }
    if (!tipo || !fechaInicio || !fechaFin || !motivo || !empleadoId) {
      res.status(400).json({ error: 'Faltan datos requeridos' });
      return;
    }

    const permisoId = uuidv4();
    const permisoData = {
      id: permisoId,
      empresaId,
      empleadoId,
      tipo,
      fechaInicio,
      fechaFin,
      motivo,
      estado: 'pendiente' as const,
      notas: '',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.collection('permisos').doc(permisoId).set(permisoData);

    const adminSnapshot = await db.collection('usuarios')
      .where('empresaId', '==', empresaId)
      .where('rol', '==', 'administrador')
      .get();

    const batch = db.batch();
    adminSnapshot.docs.forEach(doc => {
      const notifRef = db.collection('notificaciones').doc();
      batch.set(notifRef, {
        empresaId,
        usuarioId: doc.id,
        titulo: 'Nueva solicitud de permiso',
        mensaje: `Solicitud de ${tipo} pendiente de aprobación`,
        tipo: 'permiso',
        leida: false,
        data: { permisoId },
        createdAt: new Date(),
      });
    });
    await batch.commit();

    res.status(201).json({
      message: 'Permiso solicitado exitosamente',
      permiso: permisoData,
    });
  } catch (error) {
    console.error('Error al crear permiso:', error);
    res.status(500).json({ error: 'Error al crear el permiso' });
  }
};

export const obtenerPermisos = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const empresaId = req.user?.empresaId;
    const { empleadoId, estado, tipo } = req.query;

    if (!empresaId) {
      res.status(401).json({ error: 'No autenticado' });
      return;
    }

    let query = db.collection('permisos').where('empresaId', '==', empresaId);

    const snapshot = await query.orderBy('createdAt', 'desc').get();
    let permisos = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    if (empleadoId) {
      permisos = permisos.filter((p: any) => p.empleadoId === empleadoId);
    }
    if (estado) {
      permisos = permisos.filter((p: any) => p.estado === estado);
    }
    if (tipo) {
      permisos = permisos.filter((p: any) => p.tipo === tipo);
    }

    res.json(permisos);
  } catch (error) {
    console.error('Error al obtener permisos:', error);
    res.status(500).json({ error: 'Error al obtener los permisos' });
  }
};

export const obtenerPermisoPorId = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const doc = await db.collection('permisos').doc(id).get();
    
    if (!doc.exists) {
      res.status(404).json({ error: 'Permiso no encontrado' });
      return;
    }

    const empresaId = req.user?.empresaId;
    if (!empresaId || doc.data()?.empresaId !== empresaId) {
      res.status(403).json({ error: 'No tienes acceso a este permiso' });
      return;
    }

    res.json({ id: doc.id, ...doc.data() });
  } catch (error) {
    console.error('Error al obtener permiso:', error);
    res.status(500).json({ error: 'Error al obtener el permiso' });
  }
};

export const aprobarPermiso = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { aprobadoPor, notas } = req.body;

    const permisoDoc = await db.collection('permisos').doc(id).get();
    if (!permisoDoc.exists) {
      res.status(404).json({ error: 'Permiso no encontrado' });
      return;
    }
    const empresaId = req.user?.empresaId;
    if (!empresaId || permisoDoc.data()?.empresaId !== empresaId) {
      res.status(403).json({ error: 'No tienes acceso a este permiso' });
      return;
    }

    const updates: any = {
      estado: 'aprobado',
      aprobadoPor: aprobadoPor || '',
      notas: notas || '',
      updatedAt: new Date(),
    };

    await db.collection('permisos').doc(id).update(updates);

    const permisoData = permisoDoc.data();

    if (permisoData) {
      await db.collection('notificaciones').add({
        empresaId: permisoData.empresaId,
        usuarioId: permisoData.empleadoId,
        titulo: 'Permiso aprobado',
        mensaje: `Tu solicitud de ${permisoData.tipo} ha sido aprobada`,
        tipo: 'permiso',
        leida: false,
        data: { permisoId: id },
        createdAt: new Date(),
      });

      if (permisoData.tipo === 'vacacion' || permisoData.tipo === 'enfermedad') {
        await db.collection('usuarios').doc(permisoData.empleadoId).update({
          estado: 'en_permiso',
          updatedAt: new Date(),
        });
      }
    }

    res.json({ message: 'Permiso aprobado exitosamente' });
  } catch (error) {
    console.error('Error al aprobar permiso:', error);
    res.status(500).json({ error: 'Error al aprobar el permiso' });
  }
};

export const rechazarPermiso = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { aprobadoPor, notas } = req.body;

    const permisoDoc = await db.collection('permisos').doc(id).get();
    if (!permisoDoc.exists) {
      res.status(404).json({ error: 'Permiso no encontrado' });
      return;
    }
    const empresaId = req.user?.empresaId;
    if (!empresaId || permisoDoc.data()?.empresaId !== empresaId) {
      res.status(403).json({ error: 'No tienes acceso a este permiso' });
      return;
    }

    const updates = {
      estado: 'rechazado',
      aprobadoPor: aprobadoPor || '',
      notas: notas || '',
      updatedAt: new Date(),
    };

    await db.collection('permisos').doc(id).update(updates);

    const permisoData = permisoDoc.data();

    if (permisoData) {
      await db.collection('notificaciones').add({
        empresaId: permisoData.empresaId,
        usuarioId: permisoData.empleadoId,
        titulo: 'Permiso rechazado',
        mensaje: `Tu solicitud de ${permisoData.tipo} ha sido rechazada. Motivo: ${notas || 'No especificado'}`,
        tipo: 'permiso',
        leida: false,
        data: { permisoId: id },
        createdAt: new Date(),
      });
    }

    res.json({ message: 'Permiso rechazado' });
  } catch (error) {
    console.error('Error al rechazar permiso:', error);
    res.status(500).json({ error: 'Error al rechazar el permiso' });
  }
};
