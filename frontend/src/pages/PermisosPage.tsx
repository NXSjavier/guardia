import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Select } from '../components/Select';
import { Modal } from '../components/Modal';
import { permisoService, empleadoService } from '../services/api';
import { Permiso, Usuario } from '../types';
import { HiPlus, HiCheck, HiX } from 'react-icons/hi';
import { toast } from 'sonner';

export const PermisosPage = () => {
  const { user } = useAuth();
  const [permisos, setPermisos] = useState<Permiso[]>([]);
  const [empleados, setEmpleados] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [filtroEstado, setFiltroEstado] = useState('');

  const [formData, setFormData] = useState({
    tipo: 'vacacion',
    fechaInicio: '',
    fechaFin: '',
    motivo: '',
  });

  const isAdmin = user?.rol === 'administrador' || user?.rol === 'supervisor';

  useEffect(() => {
    fetchData();
  }, [user?.empresaId, filtroEstado]);

  const fetchData = async () => {
    if (!user?.empresaId) return;
    try {
      const params: any = {};
      if (isAdmin && filtroEstado) params.estado = filtroEstado;
      if (!isAdmin) params.empleadoId = user.id;
      
      const response = await permisoService.obtenerTodos(user.empresaId, params);
      setPermisos(response.data);

      if (isAdmin) {
        const empRes = await empleadoService.obtenerTodos(user.empresaId);
        setEmpleados(empRes.data);
      }
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
      await permisoService.crear({
        ...formData,
        empresaId: user.empresaId,
        empleadoId: user.id,
      });
      toast.success('Solicitud enviada');
      setShowModal(false);
      resetForm();
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error al solicitar');
    } finally {
      setSaving(false);
    }
  };

  const handleAprobar = async (id: string) => {
    try {
      await permisoService.aprobar(id, { aprobadoPor: user?.nombre });
      toast.success('Permiso aprobado');
      fetchData();
    } catch (error) {
      toast.error('Error al aprobar');
    }
  };

  const handleRechazar = async (id: string) => {
    const notas = prompt('Motivo del rechazo:');
    if (!notas) return;
    try {
      await permisoService.rechazar(id, { aprobadoPor: user?.nombre, notas });
      toast.success('Permiso rechazado');
      fetchData();
    } catch (error) {
      toast.error('Error al rechazar');
    }
  };

  const resetForm = () => {
    setFormData({ tipo: 'vacacion', fechaInicio: '', fechaFin: '', motivo: '' });
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'pendiente': return 'bg-yellow-100 text-yellow-700';
      case 'aprobado': return 'bg-green-100 text-green-700';
      case 'rechazado': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getEmpleadoNombre = (id: string) => {
    if (!isAdmin) return `${user?.nombre} ${user?.apellido}`;
    const emp = empleados.find(e => e.id === id);
    return emp ? `${emp.nombre} ${emp.apellido}` : 'Desconocido';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{isAdmin ? 'Permisos' : 'Mis Permisos'}</h1>
          <p className="text-gray-500">{isAdmin ? 'Gestiona solicitudes de permiso' : 'Solicita permisos y vacaciones'}</p>
        </div>
        {!isAdmin && (
          <Button onClick={() => setShowModal(true)} icon={<HiPlus className="w-5 h-5" />}>
            Solicitar Permiso
          </Button>
        )}
      </div>

      {isAdmin && (
        <Card>
          <CardContent>
            <Select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              options={[
                { value: '', label: 'Todos los estados' },
                { value: 'pendiente', label: 'Pendientes' },
                { value: 'aprobado', label: 'Aprobados' },
                { value: 'rechazado', label: 'Rechazados' },
              ]}
            />
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full mx-auto" />
        </div>
      ) : permisos.length === 0 ? (
        <Card><CardContent className="text-center py-12"><p className="text-gray-500">No hay solicitudes</p></CardContent></Card>
      ) : (
        <div className="space-y-4">
          {permisos.map((permiso) => (
            <Card key={permiso.id}>
              <CardContent>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-gray-900">{getEmpleadoNombre(permiso.empleadoId)}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getEstadoColor(permiso.estado)}`}>
                        {permiso.estado}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 capitalize">Tipo: {permiso.tipo}</p>
                    <p className="text-sm text-gray-500">
                      📅 {permiso.fechaInicio} - {permiso.fechaFin}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">Motivo: {permiso.motivo}</p>
                    {permiso.notas && (
                      <p className="text-sm text-red-500 mt-1">Notas: {permiso.notas}</p>
                    )}
                  </div>
                  {isAdmin && permiso.estado === 'pendiente' && (
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => handleAprobar(permiso.id)} icon={<HiCheck className="w-4 h-4" />}>
                        Aprobar
                      </Button>
                      <Button size="sm" variant="danger" onClick={() => handleRechazar(permiso.id)} icon={<HiX className="w-4 h-4" />}>
                        Rechazar
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Solicitar Permiso">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select
            label="Tipo de Permiso"
            value={formData.tipo}
            onChange={(e) => setFormData({...formData, tipo: e.target.value})}
            options={[
              { value: 'vacacion', label: 'Vacación' },
              { value: 'enfermedad', label: 'Enfermedad' },
              { value: 'personal', label: 'Personal' },
              { value: 'otro', label: 'Otro' },
            ]}
          />
          <Input
            label="Fecha Inicio"
            type="date"
            value={formData.fechaInicio}
            onChange={(e) => setFormData({...formData, fechaInicio: e.target.value})}
            required
          />
          <Input
            label="Fecha Fin"
            type="date"
            value={formData.fechaFin}
            onChange={(e) => setFormData({...formData, fechaFin: e.target.value})}
            required
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Motivo</label>
            <textarea
              className="input-field"
              rows={3}
              value={formData.motivo}
              onChange={(e) => setFormData({...formData, motivo: e.target.value})}
              placeholder="Explica el motivo de tu solicitud..."
              required
            />
          </div>
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="secondary" className="flex-1" onClick={() => setShowModal(false)}>Cancelar</Button>
            <Button type="submit" className="flex-1" loading={saving}>Enviar Solicitud</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
