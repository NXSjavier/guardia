export type Rol = 'administrador' | 'supervisor' | 'guardia';

export type EstadoEmpleado = 'activo' | 'en_permiso' | 'en_servicio' | 'inactivo';

export type EstadoPermiso = 'pendiente' | 'aprobado' | 'rechazado';

export type TipoReporte = 'ronda' | 'incidente' | 'evento' | 'emergencia';

export type TipoTurnoEmpleado = 'diurno' | 'nocturno' | 'mixto';

export interface Empresa {
  id: string;
  nombre: string;
  ruc: string;
  telefono: string;
  email: string;
  direccion: string;
  documentos: {
    licenciaFuncionamiento?: string;
    ruc?: string;
    otros?: string[];
  };
  configuraciones: {
    permiteRegistroPublico: boolean;
    requiereFirmaRondas: boolean;
    notificacionesPush: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface Usuario {
  uid?: string;
  id?: string;
  empresaId?: string;
  cedula?: string;
  nombre?: string;
  apellido?: string;
  email?: string;
  telefono?: string;
  rol?: Rol;
  tipoTurno?: TipoTurnoEmpleado;
  estado?: EstadoEmpleado;
  fotoPerfil?: string;
  documentos?: any;
  fcmToken?: string;
  createdAt?: any;
  updatedAt?: any;
  [key: string]: any;
}

export interface Sitio {
  id: string;
  empresaId: string;
  nombre: string;
  direccion: string;
  coordenadas: {
    lat: number;
    lng: number;
  };
  instrucciones: string;
  activa: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Turno {
  id: string;
  empresaId: string;
  empleadoId: string;
  sitioId: string;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  estado: 'asignado' | 'en_proceso' | 'completado' | 'cancelado';
  notas?: string;
  createdAt: Date;
  updatedAt: Date;
  empleado?: Usuario;
  sitio?: Sitio;
}

export interface Reporte {
  id: string;
  empresaId: string;
  empleadoId: string;
  sitioId: string;
  turnoId?: string;
  tipo: TipoReporte;
  titulo: string;
  descripcion: string;
  fotos: string[];
  videos: string[];
  firma?: string;
  coordenadas?: {
    lat: number;
    lng: number;
  };
  createdAt: Date;
  updatedAt: Date;
  empleado?: Usuario;
  sitio?: Sitio;
}

export interface Permiso {
  id: string;
  empresaId: string;
  empleadoId: string;
  tipo: 'vacacion' | 'enfermedad' | 'personal' | 'otro';
  fechaInicio: string;
  fechaFin: string;
  motivo: string;
  estado: EstadoPermiso;
  aprobadoPor?: string;
  notas?: string;
  createdAt: Date;
  updatedAt: Date;
  empleado?: Usuario;
}

export interface Notificacion {
  id: string;
  empresaId: string;
  usuarioId: string;
  titulo: string;
  mensaje: string;
  tipo: 'turno' | 'permiso' | 'incidente' | 'sistema' | 'emergencia';
  leida: boolean;
  data?: Record<string, string>;
  createdAt: Date;
}

export interface Asistencia {
  id: string;
  empresaId: string;
  empleadoId: string;
  tipo: 'entrada' | 'salida';
  fecha: string;
  hora: string;
  coordenadas: {
    lat: number;
    lng: number;
  };
  createdAt: Date;
}

export interface AuthState {
  user: Usuario | null;
  token: string | null;
  loading: boolean;
}
