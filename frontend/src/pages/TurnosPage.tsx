import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Select } from '../components/Select';
import { Modal } from '../components/Modal';
import { turnoService, empleadoService, sitioService } from '../services/api';
import { Turno, Usuario, Sitio } from '../types';
import { HiPlus, HiPlay, HiCheck, HiX } from 'react-icons/hi';
import { toast } from 'sonner';

export const TurnosPage = () => {
  const { user } = useAuth();
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [empleados, setEmpleados] = useState<Usuario[]>([]);
  const [sitios, setSitios] = useState<Sitio[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [filtroFecha, setFiltroFecha] = useState(new Date().toISOString().split('T')[0]);

  const [formData, setFormData] = useState({
    empleadoId: '',
    sitioId: '',
    fecha: new Date().toISOString().split('T')[0],
    horaInicio: '08:00',
    horaFin: '20:00',
    notas: '',
  });

  useEffect(() => {
    fetchData();
  }, [user?.empresaId, filtroFecha]);

  const fetchData = async () => {
    if (!user?.empresaId) return;
    try {
      const [turnosRes, empleadosRes, sitiosRes] = await Promise.all([
        turnoService.obtenerTodos(user.empresaId, { fecha: filtroFecha }),
        empleadoService.obtenerTodos(user.empresaId, { rol: 'guardia' }),
        sitioService.obtenerTodos(user.empresaId),
      ]);
      setTurnos(turnosRes.data);
      setEmpleados(empleadosRes.data.filter((e: Usuario) => e.estado === 'activo'));
      setSitios(sitiosRes.data.filter((s: Sitio) => s.activa));
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.empresaId) return;
    
    setSaving(true);
    try {
      await turnoService.crear({ ...formData, empresaId: user.empresaId });
      toast.success('Turno asignado');
      setShowModal(false);
      resetForm();
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error al crear turno');
    } finally {
      setSaving(false);
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

  const resetForm = () => {
    setFormData({
      empleadoId: '',
      sitioId: '',
      fecha: new Date().toISOString().split('T')[0],
      horaInicio: '08:00',
      horaFin: '20:00',
      notas: '',
    });
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

  const getEmpleadoNombre = (id: string) => {
    const emp = empleados.find(e => e.id === id);
    return emp ? `${emp.nombre} ${emp.apellido}` : 'Desconocido';
  };

  const getSitioNombre = (id: string) => {
    const sit = sitios.find(s => s.id === id);
    return sit?.nombre || 'Desconocido';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Turnos</h1>
          <p className="text-gray-500">Gestiona los turnos de trabajo</p>
        </div>
        <Button onClick={() => setShowModal(true)} icon={<HiPlus className="w-5 h-5" />}>
          Nuevo Turno
        </Button>
      </div>

      <Card>
        <CardContent>
          <Input
            type="date"
            value={filtroFecha}
            onChange={(e) => setFiltroFecha(e.target.value)}
          />
        </CardContent>
      </Card>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full mx-auto" />
        </div>
      ) : turnos.length === 0 ? (
        <Card><CardContent className="text-center py-12"><p className="text-gray-500">No hay turnos para esta fecha</p></CardContent></Card>
      ) : (
        <div className="space-y-3">
          {turnos.map((turno) => (
            <Card key={turno.id}>
              <CardContent className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-gray-900">{getEmpleadoNombre(turno.empleadoId)}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getEstadoColor(turno.estado)}`}>
                      {turno.estado.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">📍 {getSitioNombre(turno.sitioId)}</p>
                  <p className="text-sm text-gray-500">🕐 {turno.horaInicio} - {turno.horaFin}</p>
                </div>
                <div className="flex gap-2">
                  {turno.estado === 'asignado' && (
                    <Button size="sm" variant="secondary" onClick={() => handleCambiarEstado(turno.id, 'en_proceso')} icon={<HiPlay className="w-4 h-4" />}>
                      Iniciar
                    </Button>
                  )}
                  {turno.estado === 'en_proceso' && (
                    <Button size="sm" onClick={() => handleCambiarEstado(turno.id, 'completado')} icon={<HiCheck className="w-4 h-4" />}>
                      Completar
                    </Button>
                  )}
                  {(turno.estado === 'asignado' || turno.estado === 'en_proceso') && (
                    <Button size="sm" variant="danger" onClick={() => handleCambiarEstado(turno.id, 'cancelado')} icon={<HiX className="w-4 h-4" />}>
                      Cancelar
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Nuevo Turno">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select
            label="Guardia"
            value={formData.empleadoId}
            onChange={(e) => setFormData({...formData, empleadoId: e.target.value})}
            options={[{ value: '', label: 'Seleccionar...' }, ...empleados.map(e => ({ value: e.id, label: `${e.nombre} ${e.apellido}` }))]}
            required
          />
          <Select
            label="Sitio"
            value={formData.sitioId}
            onChange={(e) => setFormData({...formData, sitioId: e.target.value})}
            options={[{ value: '', label: 'Seleccionar...' }, ...sitios.map(s => ({ value: s.id, label: s.nombre }))]}
            required
          />
          <Input label="Fecha" type="date" value={formData.fecha} onChange={(e) => setFormData({...formData, fecha: e.target.value})} required />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Hora Inicio" type="time" value={formData.horaInicio} onChange={(e) => setFormData({...formData, horaInicio: e.target.value})} required />
            <Input label="Hora Fin" type="time" value={formData.horaFin} onChange={(e) => setFormData({...formData, horaFin: e.target.value})} required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notas</label>
            <textarea className="input-field" rows={2} value={formData.notas} onChange={(e) => setFormData({...formData, notas: e.target.value})} />
          </div>
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="secondary" className="flex-1" onClick={() => setShowModal(false)}>Cancelar</Button>
            <Button type="submit" className="flex-1" loading={saving}>Asignar</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
