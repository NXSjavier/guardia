import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent } from '../components/Card';
import { 
  HiUsers, 
  HiOfficeBuilding, 
  HiCalendar, 
  HiDocumentReport,
  HiShieldCheck,
  HiClock,
  HiCheckCircle
} from 'react-icons/hi';
import { turnoService, reporteService, empleadoService, permisoService } from '../services/api';

export const DashboardPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    empleadosActivos: 0,
    sitiosActivos: 0,
    turnosHoy: 0,
    reportesHoy: 0,
    permisosPendientes: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      if (!user?.empresaId) return;

      try {
        const [empRes, sitioRes, turnoRes, reporteRes, permisoRes] = await Promise.all([
          empleadoService.obtenerTodos(user.empresaId, { estado: 'activo' }),
          { data: [] },
          turnoService.obtenerDelDia(user.empresaId),
          reporteService.obtenerTodos(user.empresaId),
          user.rol !== 'guardia' ? permisoService.obtenerTodos(user.empresaId, { estado: 'pendiente' }) : { data: [] },
        ]);

        const reportesHoy = (reporteRes.data as any[]).filter((r: any) => {
          const today = new Date().toISOString().split('T')[0];
          const fecha = r.createdAt?.toDate?.()?.toISOString()?.split('T')[0] || 
                       new Date(r.createdAt).toISOString().split('T')[0];
          return fecha === today;
        });

        setStats({
          empleadosActivos: empRes.data.length,
          sitiosActivos: sitioRes.data.filter((s: any) => s.activa).length,
          turnosHoy: turnoRes.data.length,
          reportesHoy: reportesHoy.length,
          permisosPendientes: permisoRes.data?.length || 0,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchStats();
  }, [user]);

  const statCards = [
    { 
      label: 'Empleados Activos', 
      value: stats.empleadosActivos, 
      icon: HiUsers, 
      color: 'bg-blue-500' 
    },
    { 
      label: 'Sitios Activos', 
      value: stats.sitiosActivos, 
      icon: HiOfficeBuilding, 
      color: 'bg-green-500' 
    },
    { 
      label: 'Turnos Hoy', 
      value: stats.turnosHoy, 
      icon: HiCalendar, 
      color: 'bg-purple-500' 
    },
    { 
      label: 'Reportes Hoy', 
      value: stats.reportesHoy, 
      icon: HiDocumentReport, 
      color: 'bg-orange-500' 
    },
  ];

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buenos días';
    if (hour < 18) return 'Buenas tardes';
    return 'Buenas noches';
  };

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 rounded-2xl p-6 text-white">
        <h1 className="text-2xl font-bold">
          {getGreeting()}, {user?.nombre}
        </h1>
        <p className="text-primary-100 mt-1">
          {user?.rol === 'administrador' && 'Administrador de la empresa'}
          {user?.rol === 'supervisor' && 'Supervisor de operaciones'}
          {user?.rol === 'guardia' && 'Guardia de seguridad'}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardContent className="flex items-center gap-4">
                <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Alerts / Quick Actions */}
      {user?.rol !== 'guardia' && stats.permisosPendientes > 0 && (
        <Card className="border-l-4 border-l-yellow-500">
          <CardContent className="flex items-center gap-4">
            <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center">
              <HiClock className="w-5 h-5 text-yellow-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-gray-900">
                {stats.permisosPendientes} permiso(s) pendiente(s) de aprobación
              </p>
              <p className="text-sm text-gray-500">Revisa las solicitudes de permiso</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <a
          href="#"
          className="flex flex-col items-center justify-center p-6 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
        >
          <HiDocumentReport className="w-8 h-8 text-primary-600 mb-2" />
          <span className="text-sm font-medium text-gray-700">Nuevo Reporte</span>
        </a>
        <a
          href="#"
          className="flex flex-col items-center justify-center p-6 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
        >
          <HiCalendar className="w-8 h-8 text-primary-600 mb-2" />
          <span className="text-sm font-medium text-gray-700">Ver Turnos</span>
        </a>
        <a
          href="#"
          className="flex flex-col items-center justify-center p-6 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
        >
          <HiCheckCircle className="w-8 h-8 text-primary-600 mb-2" />
          <span className="text-sm font-medium text-gray-700">Mis Rondas</span>
        </a>
        <a
          href="#"
          className="flex flex-col items-center justify-center p-6 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
        >
          <HiShieldCheck className="w-8 h-8 text-primary-600 mb-2" />
          <span className="text-sm font-medium text-gray-700">Solicitar Permiso</span>
        </a>
      </div>
    </div>
  );
};
