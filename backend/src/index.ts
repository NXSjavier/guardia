import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import empresaRoutes from './routes/empresaRoutes';
import authRoutes from './routes/authRoutes';
import empleadoRoutes from './routes/empleadoRoutes';
import sitioRoutes from './routes/sitioRoutes';
import turnoRoutes from './routes/turnoRoutes';
import reporteRoutes from './routes/reporteRoutes';
import permisoRoutes from './routes/permisoRoutes';
import notificacionRoutes from './routes/notificacionRoutes';
import asistenciaRoutes from './routes/asistenciaRoutes';

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '8080', 10);

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

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
  console.log(`Endpoints disponibles en /api/*`);
});

export default app;
