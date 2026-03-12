import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import net from 'net';

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
const PORT = process.env.PORT || 3001;
const HOST = process.env.HOST || '0.0.0.0';

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

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const tester = net
      .createServer()
      .once('error', () => resolve(false))
      .once('listening', () => tester.close(() => resolve(true)))
      .listen(port, HOST);
  });
}

async function start() {
  const preferred = Number(PORT) || 3001;
  let selected = preferred;
  for (let i = 0; i < 10; i++) {
    const port = preferred + i;
    const available = await isPortAvailable(port);
    if (available) {
      selected = port;
      break;
    }
  }
  app.listen(selected, HOST, () => {
    console.log(`Servidor corriendo en http://${HOST}:${selected}`);
    console.log(`Endpoints disponibles en /api/*`);
  });
}

start();

export default app;
