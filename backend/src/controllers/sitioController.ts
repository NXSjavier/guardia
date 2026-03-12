import { Response } from 'express';
import { db } from '../config/firebase';
import { v4 as uuidv4 } from 'uuid';
import { AuthRequest } from '../middleware/auth';

export const crearSitio = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { nombre, direccion, coordenadas, instrucciones } = req.body;
    const empresaId = req.user?.empresaId;

    if (!empresaId) {
      res.status(401).json({ error: 'No autenticado' });
      return;
    }
    if (!nombre || !direccion) {
      res.status(400).json({ error: 'Faltan datos requeridos' });
      return;
    }

    const sitioId = uuidv4();
    const sitioData = {
      id: sitioId,
      empresaId,
      nombre,
      direccion,
      coordenadas: coordenadas || { lat: 0, lng: 0 },
      instrucciones: instrucciones || '',
      activa: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.collection('sitios').doc(sitioId).set(sitioData);

    res.status(201).json({
      message: 'Sitio creado exitosamente',
      sitio: sitioData,
    });
  } catch (error) {
    console.error('Error al crear sitio:', error);
    res.status(500).json({ error: 'Error al crear el sitio' });
  }
};

export const obtenerSitios = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const empresaId = req.user?.empresaId;
    const { activa } = req.query;

    if (!empresaId) {
      res.status(401).json({ error: 'No autenticado' });
      return;
    }

    let query = db.collection('sitios').where('empresaId', '==', empresaId);
    
    if (activa !== undefined) {
      query = query.where('activa', '==', activa === 'true');
    }

    const snapshot = await query.get();
    const sitios = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json(sitios);
  } catch (error) {
    console.error('Error al obtener sitios:', error);
    res.status(500).json({ error: 'Error al obtener los sitios' });
  }
};

export const obtenerSitioPorId = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const doc = await db.collection('sitios').doc(id).get();
    
    if (!doc.exists) {
      res.status(404).json({ error: 'Sitio no encontrado' });
      return;
    }

    const empresaId = req.user?.empresaId;
    if (!empresaId || doc.data()?.empresaId !== empresaId) {
      res.status(403).json({ error: 'No tienes acceso a este sitio' });
      return;
    }

    res.json({ id: doc.id, ...doc.data() });
  } catch (error) {
    console.error('Error al obtener sitio:', error);
    res.status(500).json({ error: 'Error al obtener el sitio' });
  }
};

export const actualizarSitio = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const doc = await db.collection('sitios').doc(id).get();
    if (!doc.exists) {
      res.status(404).json({ error: 'Sitio no encontrado' });
      return;
    }
    const empresaId = req.user?.empresaId;
    if (!empresaId || doc.data()?.empresaId !== empresaId) {
      res.status(403).json({ error: 'No tienes acceso a este sitio' });
      return;
    }

    delete updates.id;
    delete updates.empresaId;
    delete updates.createdAt;

    updates.updatedAt = new Date();

    await db.collection('sitios').doc(id).update(updates);
    res.json({ message: 'Sitio actualizado exitosamente' });
  } catch (error) {
    console.error('Error al actualizar sitio:', error);
    res.status(500).json({ error: 'Error al actualizar el sitio' });
  }
};

export const eliminarSitio = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const doc = await db.collection('sitios').doc(id).get();
    if (!doc.exists) {
      res.status(404).json({ error: 'Sitio no encontrado' });
      return;
    }
    const empresaId = req.user?.empresaId;
    if (!empresaId || doc.data()?.empresaId !== empresaId) {
      res.status(403).json({ error: 'No tienes acceso a este sitio' });
      return;
    }

    await db.collection('sitios').doc(id).update({ activa: false, updatedAt: new Date() });
    res.json({ message: 'Sitio desactivado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar sitio:', error);
    res.status(500).json({ error: 'Error al eliminar el sitio' });
  }
};
