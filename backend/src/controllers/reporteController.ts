import { Response } from 'express';
import { db } from '../config/firebase';
import { v4 as uuidv4 } from 'uuid';
import { AuthRequest } from '../middleware/auth';

export const crearReporte = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { tipo, titulo, descripcion, fotos, videos, firma, coordenadas, empleadoId, sitioId, turnoId } = req.body;
    const empresaId = req.user?.empresaId;

    if (!empresaId) {
      res.status(401).json({ error: 'No autenticado' });
      return;
    }
    if (!titulo || !tipo || !empleadoId || !sitioId) {
      res.status(400).json({ error: 'Faltan datos requeridos' });
      return;
    }

    const reporteId = uuidv4();
    const reporteData = {
      id: reporteId,
      empresaId,
      empleadoId,
      sitioId,
      turnoId: turnoId || null,
      tipo,
      titulo,
      descripcion: descripcion || '',
      fotos: fotos || [],
      videos: videos || [],
      firma: firma || null,
      coordenadas: coordenadas || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.collection('reportes').doc(reporteId).set(reporteData);

    if (tipo === 'incidente' || tipo === 'emergencia') {
      const sitioDoc = await db.collection('sitios').doc(sitioId).get();
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
          titulo: tipo === 'emergencia' ? '🚨 EMERGENCIA' : '⚠️ Incidente reportado',
          mensaje: `${titulo} - ${sitioDoc.data()?.nombre || 'Sitio'} (${new Date().toLocaleString()})`,
          tipo: tipo === 'emergencia' ? 'emergencia' : 'incidente',
          leida: false,
          data: { reporteId },
          createdAt: new Date(),
        });
      });
      await batch.commit();
    }

    res.status(201).json({
      message: 'Reporte creado exitosamente',
      reporte: reporteData,
    });
  } catch (error) {
    console.error('Error al crear reporte:', error);
    res.status(500).json({ error: 'Error al crear el reporte' });
  }
};

export const obtenerReportes = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const empresaId = req.user?.empresaId;
    const { empleadoId, sitioId, tipo, fechaDesde, fechaHasta } = req.query;

    if (!empresaId) {
      res.status(401).json({ error: 'No autenticado' });
      return;
    }

    let query = db.collection('reportes').where('empresaId', '==', empresaId);
    
    let snapshot = await query.orderBy('createdAt', 'desc').get();
    let reportes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    if (empleadoId) {
      reportes = reportes.filter((r: any) => r.empleadoId === empleadoId);
    }
    if (sitioId) {
      reportes = reportes.filter((r: any) => r.sitioId === sitioId);
    }
    if (tipo) {
      reportes = reportes.filter((r: any) => r.tipo === tipo);
    }

    if (fechaDesde || fechaHasta) {
      reportes = reportes.filter((r: any) => {
        const fecha = r.createdAt?.toDate?.() || new Date(r.createdAt);
        if (fechaDesde && fecha < new Date(String(fechaDesde))) return false;
        if (fechaHasta && fecha > new Date(String(fechaHasta))) return false;
        return true;
      });
    }

    res.json(reportes);
  } catch (error) {
    console.error('Error al obtener reportes:', error);
    res.status(500).json({ error: 'Error al obtener los reportes' });
  }
};

export const obtenerReportePorId = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const doc = await db.collection('reportes').doc(id).get();
    
    if (!doc.exists) {
      res.status(404).json({ error: 'Reporte no encontrado' });
      return;
    }

    const empresaId = req.user?.empresaId;
    if (!empresaId || doc.data()?.empresaId !== empresaId) {
      res.status(403).json({ error: 'No tienes acceso a este reporte' });
      return;
    }

    res.json({ id: doc.id, ...doc.data() });
  } catch (error) {
    console.error('Error al obtener reporte:', error);
    res.status(500).json({ error: 'Error al obtener el reporte' });
  }
};

export const obtenerReportesDelEmpleado = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { empleadoId } = req.params;
    const { limite = '50' } = req.query;

    const snapshot = await db.collection('reportes')
      .where('empleadoId', '==', empleadoId)
      .orderBy('createdAt', 'desc')
      .limit(parseInt(limite as string))
      .get();

    const reportes = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    const empresaId = req.user?.empresaId;
    if (!empresaId) {
      res.status(401).json({ error: 'No autenticado' });
      return;
    }

    const filtrados = reportes.filter((r: any) => r.empresaId === empresaId);

    res.json(filtrados);
  } catch (error) {
    console.error('Error al obtener reportes del empleado:', error);
    res.status(500).json({ error: 'Error al obtener los reportes' });
  }
};
