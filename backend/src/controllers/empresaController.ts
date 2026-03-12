import { Request, Response } from 'express';
import { db, auth } from '../config/firebase';
import { v4 as uuidv4 } from 'uuid';

export const crearEmpresa = async (req: Request, res: Response): Promise<void> => {
  try {
    const { nombre, ruc, telefono, email, direccion, password } = req.body;

    if (!nombre || !ruc || !email || !password) {
      res.status(400).json({ error: 'Faltan datos requeridos' });
      return;
    }

    const empresasSnapshot = await db.collection('empresas').where('ruc', '==', ruc).get();
    if (!empresasSnapshot.empty) {
      res.status(400).json({ error: 'Ya existe una empresa con este RUC' });
      return;
    }

    const empresaId = uuidv4();
    const empresaData = {
      id: empresaId,
      nombre,
      ruc,
      telefono: telefono || '',
      email,
      direccion: direccion || '',
      documentos: {},
      configuraciones: {
        permiteRegistroPublico: false,
        requiereFirmaRondas: true,
        notificacionesPush: true,
      },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.collection('empresas').doc(empresaId).set(empresaData);

    const userRecord = await auth.createUser({
      email,
      password,
      displayName: nombre,
    });

    await auth.setCustomUserClaims(userRecord.uid, {
      empresaId,
      rol: 'administrador',
    });

    await db.collection('usuarios').doc(userRecord.uid).set({
      id: userRecord.uid,
      empresaId,
      email,
      nombre,
      apellido: '',
      cedula: ruc,
      telefono: telefono || '',
      rol: 'administrador',
      estado: 'activo',
      documentos: {},
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    res.status(201).json({
      message: 'Empresa creada exitosamente',
      empresaId,
      userId: userRecord.uid,
    });
  } catch (error) {
    console.error('Error al crear empresa:', error);
    res.status(500).json({ error: 'Error al crear la empresa' });
  }
};

export const obtenerEmpresas = async (req: Request, res: Response): Promise<void> => {
  try {
    const snapshot = await db.collection('empresas').get();
    const empresas = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));
    res.json(empresas);
  } catch (error) {
    console.error('Error al obtener empresas:', error);
    res.status(500).json({ error: 'Error al obtener las empresas' });
  }
};

export const obtenerEmpresaPorId = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const doc = await db.collection('empresas').doc(id).get();
    
    if (!doc.exists) {
      res.status(404).json({ error: 'Empresa no encontrada' });
      return;
    }

    res.json({ id: doc.id, ...doc.data() });
  } catch (error) {
    console.error('Error al obtener empresa:', error);
    res.status(500).json({ error: 'Error al obtener la empresa' });
  }
};

export const actualizarEmpresa = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updates = req.body;

    delete updates.id;
    delete updates.ruc;
    delete updates.createdAt;

    updates.updatedAt = new Date();

    await db.collection('empresas').doc(id).update(updates);
    res.json({ message: 'Empresa actualizada exitosamente' });
  } catch (error) {
    console.error('Error al actualizar empresa:', error);
    res.status(500).json({ error: 'Error al actualizar la empresa' });
  }
};
