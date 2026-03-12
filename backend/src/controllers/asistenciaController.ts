import { Response } from 'express';
import { db } from '../config/firebase';
import { v4 as uuidv4 } from 'uuid';
import { AuthRequest } from '../middleware/auth';

const puedeRegistrarParaEmpleado = (req: AuthRequest, empleadoId: string): boolean => {
  const rol = req.user?.rol;
  const uid = req.user?.uid;
  return rol === 'administrador' || rol === 'supervisor' || uid === empleadoId;
};

const construirMarcacion = (empresaId: string, empleadoId: string, tipo: 'entrada' | 'salida', lat: number, lng: number) => {
  const now = new Date();
  const fecha = now.toISOString().split('T')[0];
  const hora = now.toISOString().slice(11, 16);

  return {
    id: uuidv4(),
    empresaId,
    empleadoId,
    tipo,
    fecha,
    hora,
    coordenadas: { lat, lng },
    createdAt: now,
  };
};

export const registrarEntrada = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { empleadoId } = req.params;
    const { lat, lng } = req.body || {};
    const empresaId = req.user?.empresaId;

    if (!empresaId) {
      res.status(401).json({ error: 'No autenticado' });
      return;
    }
    if (!empleadoId || typeof lat !== 'number' || typeof lng !== 'number') {
      res.status(400).json({ error: 'Faltan datos requeridos' });
      return;
    }
    if (!puedeRegistrarParaEmpleado(req, empleadoId)) {
      res.status(403).json({ error: 'No tienes permisos para esta accion' });
      return;
    }

    const empleadoDoc = await db.collection('usuarios').doc(empleadoId).get();
    if (!empleadoDoc.exists || empleadoDoc.data()?.empresaId !== empresaId) {
      res.status(404).json({ error: 'Empleado no encontrado' });
      return;
    }

    const asistencia = construirMarcacion(empresaId, empleadoId, 'entrada', lat, lng);
    await db.collection('asistencias').doc(asistencia.id).set(asistencia);

    res.status(201).json({ message: 'Entrada registrada', asistencia });
  } catch (error) {
    console.error('Error al registrar entrada:', error);
    res.status(500).json({ error: 'Error al registrar la entrada' });
  }
};

export const registrarSalida = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { empleadoId } = req.params;
    const { lat, lng } = req.body || {};
    const empresaId = req.user?.empresaId;

    if (!empresaId) {
      res.status(401).json({ error: 'No autenticado' });
      return;
    }
    if (!empleadoId || typeof lat !== 'number' || typeof lng !== 'number') {
      res.status(400).json({ error: 'Faltan datos requeridos' });
      return;
    }
    if (!puedeRegistrarParaEmpleado(req, empleadoId)) {
      res.status(403).json({ error: 'No tienes permisos para esta accion' });
      return;
    }

    const empleadoDoc = await db.collection('usuarios').doc(empleadoId).get();
    if (!empleadoDoc.exists || empleadoDoc.data()?.empresaId !== empresaId) {
      res.status(404).json({ error: 'Empleado no encontrado' });
      return;
    }

    const asistencia = construirMarcacion(empresaId, empleadoId, 'salida', lat, lng);
    await db.collection('asistencias').doc(asistencia.id).set(asistencia);

    res.status(201).json({ message: 'Salida registrada', asistencia });
  } catch (error) {
    console.error('Error al registrar salida:', error);
    res.status(500).json({ error: 'Error al registrar la salida' });
  }
};

export const obtenerAsistenciasDelDia = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const empresaId = req.user?.empresaId;
    const { fecha } = req.query;

    if (!empresaId) {
      res.status(401).json({ error: 'No autenticado' });
      return;
    }

    const fechaConsulta = typeof fecha === 'string' && fecha ? fecha : new Date().toISOString().split('T')[0];

    const snapshot = await db.collection('asistencias')
      .where('empresaId', '==', empresaId)
      .where('fecha', '==', fechaConsulta)
      .orderBy('createdAt', 'asc')
      .get();

    const asistencias = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json(asistencias);
  } catch (error) {
    console.error('Error al obtener asistencias:', error);
    res.status(500).json({ error: 'Error al obtener asistencias' });
  }
};
