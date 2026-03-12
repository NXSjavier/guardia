import { Response } from 'express';
import { db, auth } from '../config/firebase';
import { v4 as uuidv4 } from 'uuid';
import { AuthRequest } from '../middleware/auth';

export const crearEmpleado = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { nombre, apellido, cedula, email, telefono, rol = 'guardia', tipoTurno = 'diurno' } = req.body;
    const empresaId = req.user?.empresaId;

    if (!empresaId) {
      res.status(401).json({ error: 'No autenticado' });
      return;
    }
    if (!nombre || !cedula) {
      res.status(400).json({ error: 'Faltan datos requeridos' });
      return;
    }

    const usuariosSnapshot = await db.collection('usuarios')
      .where('empresaId', '==', empresaId)
      .where('cedula', '==', cedula)
      .get();
    
    if (!usuariosSnapshot.empty) {
      res.status(400).json({ error: 'Ya existe un empleado con esta cédula' });
      return;
    }

    const tempPassword = `Guardia${cedula.slice(-4)}`;
    
    const userRecord = await auth.createUser({
      email: email || `${cedula}@guardia.app`,
      password: tempPassword,
      displayName: `${nombre} ${apellido || ''}`.trim(),
    });

    await auth.setCustomUserClaims(userRecord.uid, {
      empresaId,
      rol,
    });

    const empleadoId = uuidv4();
    const empleadoData = {
      id: userRecord.uid,
      empresaId,
      cedula,
      nombre,
      apellido: apellido || '',
      email: email || '',
      telefono: telefono || '',
      rol,
      tipoTurno,
      estado: 'activo' as const,
      documentos: {},
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await db.collection('usuarios').doc(userRecord.uid).set(empleadoData);

    res.status(201).json({
      message: 'Empleado creado exitosamente',
      empleado: empleadoData,
      tempPassword,
    });
  } catch (error) {
    console.error('Error al crear empleado:', error);
    res.status(500).json({ error: 'Error al crear el empleado' });
  }
};

export const obtenerEmpleados = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const empresaId = req.user?.empresaId;
    const { estado, rol } = req.query;

    if (!empresaId) {
      res.status(401).json({ error: 'No autenticado' });
      return;
    }

    let query = db.collection('usuarios').where('empresaId', '==', empresaId);
    
    if (estado) {
      query = query.where('estado', '==', estado);
    }
    if (rol) {
      query = query.where('rol', '==', rol);
    }

    const snapshot = await query.get();
    const empleados = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    }));

    res.json(empleados);
  } catch (error) {
    console.error('Error al obtener empleados:', error);
    res.status(500).json({ error: 'Error al obtener los empleados' });
  }
};

export const obtenerEmpleadoPorId = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const doc = await db.collection('usuarios').doc(id).get();
    
    if (!doc.exists) {
      res.status(404).json({ error: 'Empleado no encontrado' });
      return;
    }

    const empresaId = req.user?.empresaId;
    if (!empresaId || doc.data()?.empresaId !== empresaId) {
      res.status(403).json({ error: 'No tienes acceso a este empleado' });
      return;
    }

    res.json({ id: doc.id, ...doc.data() });
  } catch (error) {
    console.error('Error al obtener empleado:', error);
    res.status(500).json({ error: 'Error al obtener el empleado' });
  }
};

export const actualizarEmpleado = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const doc = await db.collection('usuarios').doc(id).get();
    if (!doc.exists) {
      res.status(404).json({ error: 'Empleado no encontrado' });
      return;
    }
    const empresaId = req.user?.empresaId;
    if (!empresaId || doc.data()?.empresaId !== empresaId) {
      res.status(403).json({ error: 'No tienes acceso a este empleado' });
      return;
    }

    delete updates.id;
    delete updates.email;
    delete updates.empresaId;
    delete updates.createdAt;

    updates.updatedAt = new Date();

    await db.collection('usuarios').doc(id).update(updates);
    res.json({ message: 'Empleado actualizado exitosamente' });
  } catch (error) {
    console.error('Error al actualizar empleado:', error);
    res.status(500).json({ error: 'Error al actualizar el empleado' });
  }
};

export const eliminarEmpleado = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const doc = await db.collection('usuarios').doc(id).get();
    if (!doc.exists) {
      res.status(404).json({ error: 'Empleado no encontrado' });
      return;
    }
    const empresaId = req.user?.empresaId;
    if (!empresaId || doc.data()?.empresaId !== empresaId) {
      res.status(403).json({ error: 'No tienes acceso a este empleado' });
      return;
    }

    try {
      await auth.deleteUser(id);
    } catch (error: any) {
      if (error?.code !== 'auth/user-not-found') {
        throw error;
      }
    }

    await db.collection('usuarios').doc(id).delete();

    res.json({ message: 'Empleado eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar empleado:', error);
    res.status(500).json({ error: 'Error al eliminar el empleado' });
  }
};

export const cambiarEstadoEmpleado = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    if (!['activo', 'en_permiso', 'en_servicio', 'inactivo'].includes(estado)) {
      res.status(400).json({ error: 'Estado inválido' });
      return;
    }

    const doc = await db.collection('usuarios').doc(id).get();
    if (!doc.exists) {
      res.status(404).json({ error: 'Empleado no encontrado' });
      return;
    }
    const empresaId = req.user?.empresaId;
    if (!empresaId || doc.data()?.empresaId !== empresaId) {
      res.status(403).json({ error: 'No tienes acceso a este empleado' });
      return;
    }

    const debeDesactivar = estado === 'inactivo';
    await auth.updateUser(id, { disabled: debeDesactivar });
    await db.collection('usuarios').doc(id).update({ estado, updatedAt: new Date() });
    res.json({ message: `Estado actualizado a ${estado}` });
  } catch (error) {
    console.error('Error al cambiar estado:', error);
    res.status(500).json({ error: 'Error al cambiar el estado' });
  }
};
