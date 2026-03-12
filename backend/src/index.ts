import express from 'express';
import cors from 'cors';
import * as functions from 'firebase-functions';

import empresaRoutes from './routes/empresaRoutes';
import authRoutes from './routes/authRoutes';
import empleadoRoutes from './routes/empleadoRoutes';
import sitioRoutes from './routes/sitioRoutes';
import turnoRoutes from './routes/turnoRoutes';
import reporteRoutes from './routes/reporteRoutes';
import permisoRoutes from './routes/permisoRoutes';
import notificacionRoutes from './routes/notificacionRoutes';
import asistenciaRoutes from './routes/asistenciaRoutes';

const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Guardia Management API running' });
});

app.use('/api/empresas', empresaRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/empleados', empleadoRoutes);
app.use('/api/sitios', sitioRoutes);
app.use('/api/turnos', turnoRoutes);
app.use('/api/reportes', reporteRoutes);
app.use('/api/permisos', permisoRoutes);
app.use('/api/notificaciones', notificacionRoutes);
app.use('/api/asistencias', asistenciaRoutes);

app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Error interno del servidor' });
});

export const api = functions.https.onRequest(app);
