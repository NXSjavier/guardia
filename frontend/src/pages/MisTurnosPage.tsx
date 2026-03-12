import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent } from '../components/Card';
import { Button } from '../components/Button';
import { turnoService, sitioService } from '../services/api';
import { Turno, Sitio } from '../types';
import { HiPlay, HiCheck } from 'react-icons/hi';
import { toast } from 'sonner';

export const MisTurnosPage = () => {
  const { user } = useAuth();
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [sitios, setSitios] = useState<Sitio[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [user?.id]);

  const fetchData = async () => {
    if (!user?.empresaId || !user?.id) return;
    try {
      const [turnosRes, sitiosRes] = await Promise.all([
        turnoService.obtenerTodos(user.empresaId, { empleadoId: user.id }),
        sitioService.obtenerTodos(user.empresaId),
      ]);
      setTurnos(turnosRes.data);
      setSitios(sitiosRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCambiarEstado = async (turnoId: string, estado: string) => {
    try {
      await turnoService.cambiarEstado(turnoId, estado);
      toast.success('Estado actualizado');
      fetchData();
    } catch (error) {
      toast.error('Error al cambiar estado');
    }
  };

  const getSitioNombre = (id: string) => {
    const sit = sitios.find(s => s.id === id);
    return sit?.nombre || 'Desconocido';
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'asignado': return 'bg-gray-100 text-gray-700';
      case 'en_proceso': return 'bg-blue-100 text-blue-700';
      case 'completado': return 'bg-green-100 text-green-700';
      case 'cancelado': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mis Turnos</h1>
        <p className="text-gray-500">Tus turnos de trabajo</p>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full mx-auto" />
        </div>
      ) : turnos.length === 0 ? (
        <Card><CardContent className="text-center py-12"><p className="text-gray-500">No tienes turnos asignados</p></CardContent></Card>
      ) : (
        <div className="space-y-4">
          {turnos.map((turno) => (
            <Card key={turno.id}>
              <CardContent className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getEstadoColor(turno.estado)}`}>
                      {turno.estado.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="font-semibold text-gray-900">📍 {getSitioNombre(turno.sitioId)}</p>
                  <p className="text-sm text-gray-500">📅 {turno.fecha}</p>
                  <p className="text-sm text-gray-500">🕐 {turno.horaInicio} - {turno.horaFin}</p>
                  {turno.notas && <p className="text-sm text-gray-600 mt-2">Nota: {turno.notas}</p>}
                </div>
                <div>
                  {turno.estado === 'asignado' && (
                    <Button onClick={() => handleCambiarEstado(turno.id, 'en_proceso')} icon={<HiPlay className="w-4 h-4" />}>
                      Iniciar Turno
                    </Button>
                  )}
                  {turno.estado === 'en_proceso' && (
                    <Button onClick={() => handleCambiarEstado(turno.id, 'completado')} icon={<HiCheck className="w-4 h-4" />}>
                      Finalizar Turno
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
