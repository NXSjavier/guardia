import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Select } from '../components/Select';
import { Modal } from '../components/Modal';
import { empleadoService, asistenciaService } from '../services/api';
import { Usuario } from '../types';
import { HiPlus, HiSearch, HiPencil, HiTrash, HiPhone, HiMail, HiBan, HiCheck, HiLogin, HiLogout } from 'react-icons/hi';
import { toast } from 'sonner';

export const EmpleadosPage = () => {
  const { user } = useAuth();
  const [empleados, setEmpleados] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingEmpleado, setEditingEmpleado] = useState<Usuario | null>(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    cedula: '',
    email: '',
    telefono: '',
    rol: 'guardia',
    tipoTurno: 'diurno',
  });

  useEffect(() => {
    fetchEmpleados();
  }, [user?.empresaId, filtroEstado]);

  const fetchEmpleados = async () => {
    if (!user?.empresaId) return;
    
    try {
      const params: any = {};
      if (filtroEstado) params.estado = filtroEstado;
      const response = await empleadoService.obtenerTodos(user.empresaId, params);
      setEmpleados(response.data);
    } catch (error) {
      console.error('Error fetching empleados:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.empresaId) return;
    
    setSaving(true);
    try {
      if (editingEmpleado) {
        await empleadoService.actualizar(editingEmpleado.id, formData);
        toast.success('Empleado actualizado');
      } else {
        const response = await empleadoService.crear({ ...formData, empresaId: user.empresaId });
        toast.success(`Empleado creado. Contraseña temporal: ${response.data.tempPassword}`, {
          duration: 10000,
        });
      }
      setShowModal(false);
      setEditingEmpleado(null);
      resetForm();
      fetchEmpleados();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (empleado: Usuario) => {
    setEditingEmpleado(empleado);
      setFormData({
        nombre: empleado.nombre,
        apellido: empleado.apellido || '',
        cedula: empleado.cedula,
        email: empleado.email || '',
        telefono: empleado.telefono || '',
        rol: empleado.rol,
        tipoTurno: empleado.tipoTurno || 'diurno',
      });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Estas seguro de borrar este empleado? Esta accion es permanente.')) return;
    
    try {
      await empleadoService.eliminar(id);
      toast.success('Empleado eliminado');
      fetchEmpleados();
    } catch (error) {
      toast.error('Error al eliminar empleado');
    }
  };

  const handleToggleEstado = async (empleado: Usuario) => {
    const activar = empleado.estado === 'inactivo';
    const confirmMsg = activar
      ? 'Deseas activar este empleado?'
      : 'Deseas desactivar este empleado?';

    if (!confirm(confirmMsg)) return;

    try {
      const nuevoEstado = activar ? 'activo' : 'inactivo';
      await empleadoService.cambiarEstado(empleado.id, nuevoEstado);
      toast.success(activar ? 'Empleado activado' : 'Empleado desactivado');
      fetchEmpleados();
    } catch (error) {
      toast.error('Error al cambiar el estado');
    }
  };

  const resetForm = () => {
    setFormData({
      nombre: '',
      apellido: '',
      cedula: '',
      email: '',
      telefono: '',
      rol: 'guardia',
      tipoTurno: 'diurno',
    });
  };

  const getCurrentPosition = () =>
    new Promise<{ lat: number; lng: number }>((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocalizacion no disponible'));
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => reject(error),
        { enableHighAccuracy: true, timeout: 10000 }
      );
    });

  const handleEntrada = async (empleadoId: string) => {
    try {
      const coords = await getCurrentPosition();
      await asistenciaService.registrarEntrada(empleadoId, coords);
      toast.success('Entrada registrada');
    } catch (error) {
      toast.error('No se pudo registrar la entrada');
    }
  };

  const handleSalida = async (empleadoId: string) => {
    try {
      const coords = await getCurrentPosition();
      await asistenciaService.registrarSalida(empleadoId, coords);
      toast.success('Salida registrada');
    } catch (error) {
      toast.error('No se pudo registrar la salida');
    }
  };

  const filteredEmpleados = empleados.filter(emp => {
    const search = searchTerm.toLowerCase();
    return (
      emp.nombre.toLowerCase().includes(search) ||
      emp.apellido?.toLowerCase().includes(search) ||
      emp.cedula.includes(search)
    );
  });

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'activo': return 'bg-green-100 text-green-700';
      case 'en_permiso': return 'bg-yellow-100 text-yellow-700';
      case 'en_servicio': return 'bg-blue-100 text-blue-700';
      case 'inactivo': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Empleados</h1>
          <p className="text-gray-500">Gestiona el personal de seguridad</p>
        </div>
        <Button
          onClick={() => { resetForm(); setEditingEmpleado(null); setShowModal(true); }}
          icon={<HiPlus className="w-5 h-5" />}
        >
          Nuevo Empleado
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Input
              placeholder="Buscar por nombre o cédula..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              icon={<HiSearch className="w-5 h-5" />}
            />
          </div>
          <Select
            value={filtroEstado}
            onChange={(e) => setFiltroEstado(e.target.value)}
            options={[
              { value: '', label: 'Todos los estados' },
              { value: 'activo', label: 'Activo' },
              { value: 'en_permiso', label: 'En permiso' },
              { value: 'en_servicio', label: 'En servicio' },
              { value: 'inactivo', label: 'Inactivo' },
            ]}
            className="w-full md:w-48"
          />
        </CardContent>
      </Card>

      {/* Employee List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full mx-auto" />
        </div>
      ) : filteredEmpleados.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-gray-500">No hay empleados registrados</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredEmpleados.map((empleado) => (
            <Card key={empleado.id}>
              <CardContent className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-primary-600 font-medium">
                    {empleado.nombre.charAt(0)}{empleado.apellido?.charAt(0)}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {empleado.nombre} {empleado.apellido}
                    </h3>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getEstadoColor(empleado.estado)}`}>
                      {empleado.estado.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500">Cédula: {empleado.cedula}</p>
                  <p className="text-sm text-gray-500 capitalize">{empleado.rol}</p>
                  {empleado.tipoTurno && (
                    <p className="text-sm text-gray-500 capitalize">Turno: {empleado.tipoTurno}</p>
                  )}
                  
                  <div className="flex gap-2 mt-3">
                    {empleado.telefono && (
                      <a href={`tel:${empleado.telefono}`} className="p-1.5 text-gray-400 hover:text-primary-600">
                        <HiPhone className="w-4 h-4" />
                      </a>
                    )}
                    {empleado.email && (
                      <a href={`mailto:${empleado.email}`} className="p-1.5 text-gray-400 hover:text-primary-600">
                        <HiMail className="w-4 h-4" />
                      </a>
                    )}
                    <button
                      onClick={() => handleEntrada(empleado.id)}
                      className="p-1.5 text-gray-400 hover:text-green-600"
                      title="Marcar entrada"
                    >
                      <HiLogin className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleSalida(empleado.id)}
                      className="p-1.5 text-gray-400 hover:text-red-600"
                      title="Marcar salida"
                    >
                      <HiLogout className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleToggleEstado(empleado)}
                      className={`p-1.5 text-gray-400 ${
                        empleado.estado === 'inactivo'
                          ? 'hover:text-green-600'
                          : 'hover:text-yellow-600'
                      }`}
                      title={empleado.estado === 'inactivo' ? 'Activar' : 'Desactivar'}
                    >
                      {empleado.estado === 'inactivo' ? (
                        <HiCheck className="w-4 h-4" />
                      ) : (
                        <HiBan className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={() => handleEdit(empleado)}
                      className="p-1.5 text-gray-400 hover:text-primary-600"
                    >
                      <HiPencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(empleado.id)}
                      className="p-1.5 text-gray-400 hover:text-red-600"
                    >
                      <HiTrash className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => { setShowModal(false); setEditingEmpleado(null); }}
        title={editingEmpleado ? 'Editar Empleado' : 'Nuevo Empleado'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Nombre"
            value={formData.nombre}
            onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
            required
          />
          <Input
            label="Apellido"
            value={formData.apellido}
            onChange={(e) => setFormData({ ...formData, apellido: e.target.value })}
          />
          <Input
            label="Cédula"
            value={formData.cedula}
            onChange={(e) => setFormData({ ...formData, cedula: e.target.value })}
            required
            disabled={!!editingEmpleado}
          />
          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
          <Input
            label="Teléfono"
            type="tel"
            value={formData.telefono}
            onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
          />
          <Select
            label="Rol"
            value={formData.rol}
            onChange={(e) => setFormData({ ...formData, rol: e.target.value })}
            options={[
              { value: 'guardia', label: 'Guardia' },
              { value: 'supervisor', label: 'Supervisor' },
              { value: 'administrador', label: 'Administrador' },
            ]}
          />
          <Select
            label="Turno"
            value={formData.tipoTurno}
            onChange={(e) => setFormData({ ...formData, tipoTurno: e.target.value })}
            options={[
              { value: 'diurno', label: 'Diurno' },
              { value: 'nocturno', label: 'Nocturno' },
              { value: 'mixto', label: 'Mixto' },
            ]}
          />
          
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              className="flex-1"
              onClick={() => { setShowModal(false); setEditingEmpleado(null); }}
            >
              Cancelar
            </Button>
            <Button type="submit" className="flex-1" loading={saving}>
              {editingEmpleado ? 'Actualizar' : 'Crear'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
