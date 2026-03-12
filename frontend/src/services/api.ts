import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const empresaService = {
  crear: (data: any) => api.post('/empresas', data),
  obtenerTodos: () => api.get('/empresas'),
  obtenerPorId: (id: string) => api.get(`/empresas/${id}`),
  actualizar: (id: string, data: any) => api.put(`/empresas/${id}`, data),
};

export const authService = {
  registrar: (data: any) => api.post('/auth/registrar', data),
  login: (data: any) => api.post('/auth/login', data),
  obtenerPerfil: (uid: string) => api.get(`/auth/perfil/${uid}`),
  actualizarPerfil: (uid: string, data: any) => api.put(`/auth/perfil/${uid}`, data),
  actualizarFcmToken: (uid: string, fcmToken: string) => api.put(`/auth/fcm/${uid}`, { fcmToken }),
};

export const empleadoService = {
  crear: (data: any) => api.post('/empleados', data),
  obtenerTodos: (empresaId: string, params?: any) => api.get(`/empleados/${empresaId}`, { params }),
  obtenerPorId: (id: string) => api.get(`/empleados/empleado/${id}`),
  actualizar: (id: string, data: any) => api.put(`/empleados/${id}`, data),
  eliminar: (id: string) => api.delete(`/empleados/${id}`),
  cambiarEstado: (id: string, estado: string) => api.patch(`/empleados/${id}/estado`, { estado }),
};

export const sitioService = {
  crear: (data: any) => api.post('/sitios', data),
  obtenerTodos: (empresaId: string, params?: any) => api.get(`/sitios/${empresaId}`, { params }),
  obtenerPorId: (id: string) => api.get(`/sitios/sitio/${id}`),
  actualizar: (id: string, data: any) => api.put(`/sitios/${id}`, data),
  eliminar: (id: string) => api.delete(`/sitios/${id}`),
};

export const turnoService = {
  crear: (data: any) => api.post('/turnos', data),
  obtenerTodos: (empresaId: string, params?: any) => api.get(`/turnos/${empresaId}`, { params }),
  obtenerDelDia: (empresaId: string) => api.get(`/turnos/dia/${empresaId}`),
  obtenerPorId: (id: string) => api.get(`/turnos/turno/${id}`),
  actualizar: (id: string, data: any) => api.put(`/turnos/${id}`, data),
  cambiarEstado: (id: string, estado: string) => api.patch(`/turnos/${id}/estado`, { estado }),
};

export const reporteService = {
  crear: (data: any) => api.post('/reportes', data),
  obtenerTodos: (empresaId: string, params?: any) => api.get(`/reportes/${empresaId}`, { params }),
  obtenerDelEmpleado: (empleadoId: string, limite?: number) => 
    api.get(`/reportes/empleado/${empleadoId}`, { params: { limite } }),
  obtenerPorId: (id: string) => api.get(`/reportes/reporte/${id}`),
};

export const permisoService = {
  crear: (data: any) => api.post('/permisos', data),
  obtenerTodos: (empresaId: string, params?: any) => api.get(`/permisos/${empresaId}`, { params }),
  obtenerPorId: (id: string) => api.get(`/permisos/permiso/${id}`),
  aprobar: (id: string, data: any) => api.patch(`/permisos/aprobar/${id}`, data),
  rechazar: (id: string, data: any) => api.patch(`/permisos/rechazar/${id}`, data),
};

export const notificacionService = {
  obtenerTodos: (usuarioId: string, params?: any) => 
    api.get(`/notificaciones/${usuarioId}`, { params }),
  marcarLeida: (id: string) => api.patch(`/notificaciones/${id}/leida`),
  marcarTodasLeidas: (usuarioId: string) => api.patch(`/notificaciones/leidas/${usuarioId}`),
  crear: (data: any) => api.post('/notificaciones', data),
};

export const asistenciaService = {
  registrarEntrada: (empleadoId: string, data: { lat: number; lng: number }) =>
    api.post(`/asistencias/entrada/${empleadoId}`, data),
  registrarSalida: (empleadoId: string, data: { lat: number; lng: number }) =>
    api.post(`/asistencias/salida/${empleadoId}`, data),
  obtenerDelDia: (empresaId: string, params?: any) =>
    api.get(`/asistencias/dia/${empresaId}`, { params }),
};
