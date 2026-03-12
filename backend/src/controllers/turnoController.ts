import { Response } from 'express';
import { db } from '../config/firebase';
import { v4 as uuidv4 } from 'uuid';
import { AuthRequest } from '../middleware/auth';

export const crearTurno = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { empleadoId, sitioId, fecha, horaInicio, horaFin, notas } = req.body;
    const empresaId = req.user?.empresaId;

    if (!empresaId) {
      res.status(401).json({ error: 'No autenticado' });
      return;
    }
    if (!empleadoId || !sitioId || !fecha || !horaInicio || !horaFin) {
      res.status(400).json({ error: 'Faltan datos requeridos' });
      return;
    }

    const turnoId = uuidv4();
    const turnoData = {
      id: turnoId,
      empresaId,
      empleadoId,
      sitioId,
      fecha,
      horaInicio,
      horaFin,
      estado: 'asignado' as const,
      notas: notas || '',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.collection('turnos').doc(turnoId).set(turnoData);

    const [empleadoDoc, sitioDoc] = await Promise.all([
      db.collection('usuarios').doc(empleadoId).get(),
      db.collection('sitios').doc(sitioId).get(),
    ]);

    await db.collection('notificaciones').add({
      empresaId,
      usuarioId: empleadoId,
      titulo: 'Nuevo turno asignado',
      mensaje: `Se te ha asignado un turno para el ${fecha} en ${sitioDoc.data()?.nombre || 'sitio'} de ${horaInicio} a ${horaFin}`,
      tipo: 'turno',
      leida: false,
      data: { turnoId },
      createdAt: new Date(),
    });

    res.status(201).json({
      message: 'Turno creado exitosamente',
      turno: turnoData,
    });
  } catch (error) {
    console.error('Error al crear turno:', error);
    res.status(500).json({ error: 'Error al crear el turno' });
  }
};

export const obtenerTurnos = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const empresaId = req.user?.empresaId;
    const { empleadoId, sitioId, fecha, estado } = req.query;

    if (!empresaId) {
      res.status(401).json({ error: 'No autenticado' });
      return;
    }

    let query = db.collection('turnos').where('empresaId', '==', empresaId);
    
    if (empleadoId) {
      query = query.where('empleadoId', '==', empleadoId);
    }
    if (sitioId) {
      query = query.where('sitioId', '==', sitioId);
    }
    if (fecha) {
      query = query.where('fecha', '==', fecha);
    }
    if (estado) {
      query = query.where('estado', '==', estado);
    }

    const snapshot = await query.orderBy('fecha', 'desc').orderBy('horaInicio', 'desc').get();
    const turnos = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json(turnos);
  } catch (error) {
    console.error('Error al obtener turnos:', error);
    res.status(500).json({ error: 'Error al obtener los turnos' });
  }
};

export const obtenerTurnoPorId = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const doc = await db.collection('turnos').doc(id).get();
    
    if (!doc.exists) {
      res.status(404).json({ error: 'Turno no encontrado' });
      return;
    }

    const empresaId = req.user?.empresaId;
    if (!empresaId || doc.data()?.empresaId !== empresaId) {
      res.status(403).json({ error: 'No tienes acceso a este turno' });
      return;
    }

    res.json({ id: doc.id, ...doc.data() });
  } catch (error) {
    console.error('Error al obtener turno:', error);
    res.status(500).json({ error: 'Error al obtener el turno' });
  }
};

export const actualizarTurno = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const doc = await db.collection('turnos').doc(id).get();
    if (!doc.exists) {
      res.status(404).json({ error: 'Turno no encontrado' });
      return;
    }
    const empresaId = req.user?.empresaId;
    if (!empresaId || doc.data()?.empresaId !== empresaId) {
      res.status(403).json({ error: 'No tienes acceso a este turno' });
      return;
    }

    delete updates.id;
    delete updates.empresaId;
    delete updates.createdAt;

    updates.updatedAt = new Date();

    await db.collection('turnos').doc(id).update(updates);
    res.json({ message: 'Turno actualizado exitosamente' });
  } catch (error) {
    console.error('Error al actualizar turno:', error);
    res.status(500).json({ error: 'Error al actualizar el turno' });
  }
};

export const cambiarEstadoTurno = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    if (!['asignado', 'en_proceso', 'completado', 'cancelado'].includes(estado)) {
      res.status(400).json({ error: 'Estado inválido' });
      return;
    }

    const doc = await db.collection('turnos').doc(id).get();
    if (!doc.exists) {
      res.status(404).json({ error: 'Turno no encontrado' });
      return;
    }
    const empresaId = req.user?.empresaId;
    if (!empresaId || doc.data()?.empresaId !== empresaId) {
      res.status(403).json({ error: 'No tienes acceso a este turno' });
      return;
    }

    await db.collection('turnos').doc(id).update({ estado, updatedAt: new Date() });
    res.json({ message: `Estado del turno actualizado a ${estado}` });
  } catch (error) {
    console.error('Error al cambiar estado del turno:', error);
    res.status(500).json({ error: 'Error al cambiar el estado' });
  }
};

export const obtenerTurnosDelDia = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const empresaId = req.user?.empresaId;
    const hoy = new Date().toISOString().split('T')[0];

    if (!empresaId) {
      res.status(401).json({ error: 'No autenticado' });
      return;
    }

    const snapshot = await db.collection('turnos')
      .where('empresaId', '==', empresaId)
      .get();

    let turnos = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    turnos = turnos.filter((t: any) => t.fecha === hoy);
    turnos.sort((a: any, b: any) => a.horaInicio.localeCompare(b.horaInicio));

    res.json(turnos);
  } catch (error) {
    console.error('Error al obtener turnos del día:', error);
    res.status(500).json({ error: 'Error al obtener los turnos del día' });
  }
};
