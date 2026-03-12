import { useEffect, useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardHeader } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Select } from '../components/Select';
import { Modal } from '../components/Modal';
import { reporteService, sitioService } from '../services/api';
import { Sitio, Reporte } from '../types';
import { HiPlus } from 'react-icons/hi';
import { toast } from 'sonner';
import SignaturePad from 'signature_pad';

export const ReportesPage = () => {
  const { user } = useAuth();
  const [reportes, setReportes] = useState<Reporte[]>([]);
  const [sitios, setSitios] = useState<Sitio[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [filtroTipo, setFiltroTipo] = useState('');
  const [filtroFecha, setFiltroFecha] = useState('');
  const signatureRef = useRef<SignaturePad | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [formData, setFormData] = useState({
    tipo: 'ronda',
    titulo: '',
    descripcion: '',
    sitioId: '',
    fotos: [] as string[],
    firma: '',
  });

  useEffect(() => {
    fetchData();
  }, [user?.empresaId, filtroTipo, filtroFecha]);

  useEffect(() => {
    if (showModal && canvasRef.current) {
      signatureRef.current = new SignaturePad(canvasRef.current, {
        backgroundColor: 'rgb(255,255,255)',
      });
    }
  }, [showModal]);

  const fetchData = async () => {
    if (!user?.empresaId) return;
    try {
      const params: any = {};
      if (filtroTipo) params.tipo = filtroTipo;
      if (filtroFecha) params.fechaDesde = filtroFecha;
      const response = await reporteService.obtenerTodos(user.empresaId, params);
      setReportes(response.data);
      
      const sitiosRes = await sitioService.obtenerTodos(user.empresaId);
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

    const firma = signatureRef.current?.toDataURL() || '';
    
    setSaving(true);
    try {
      await reporteService.crear({
        ...formData,
        empresaId: user.empresaId,
        empleadoId: user.id,
        coordenadas: { lat: 0, lng: 0 },
        firma,
      });
      toast.success('Reporte guardado');
      setShowModal(false);
      resetForm();
      fetchData();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error al guardar reporte');
    } finally {
      setSaving(false);
    }
  };

  const resetForm = () => {
    setFormData({
      tipo: 'ronda',
      titulo: '',
      descripcion: '',
      sitioId: '',
      fotos: [],
      firma: '',
    });
    signatureRef.current?.clear();
  };

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'ronda': return 'bg-blue-100 text-blue-700';
      case 'incidente': return 'bg-red-100 text-red-700';
      case 'emergencia': return 'bg-red-600 text-white';
      case 'evento': return 'bg-purple-100 text-purple-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getSitioNombre = (id: string) => {
    const sit = sitios.find(s => s.id === id);
    return sit?.nombre || 'Desconocido';
  };

  const formatFecha = (fecha: any) => {
    if (!fecha) return '';
    const d = fecha.toDate?.() ? fecha.toDate() : new Date(fecha);
    return d.toLocaleString('es-EC');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reportes</h1>
          <p className="text-gray-500">Registra rondas e incidentes</p>
        </div>
        <Button onClick={() => setShowModal(true)} icon={<HiPlus className="w-5 h-5" />}>
          Nuevo Reporte
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent>
            <Select
              value={filtroTipo}
              onChange={(e) => setFiltroTipo(e.target.value)}
              options={[
                { value: '', label: 'Todos los tipos' },
                { value: 'ronda', label: 'Rondas' },
                { value: 'incidente', label: 'Incidentes' },
                { value: 'evento', label: 'Eventos' },
                { value: 'emergencia', label: 'Emergencias' },
              ]}
            />
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Input
              type="date"
              value={filtroFecha}
              onChange={(e) => setFiltroFecha(e.target.value)}
              placeholder="Filtrar por fecha"
            />
          </CardContent>
        </Card>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full mx-auto" />
        </div>
      ) : reportes.length === 0 ? (
        <Card><CardContent className="text-center py-12"><p className="text-gray-500">No hay reportes</p></CardContent></Card>
      ) : (
        <div className="space-y-4">
          {reportes.map((reporte) => (
            <Card key={reporte.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getTipoColor(reporte.tipo)}`}>
                      {reporte.tipo.toUpperCase()}
                    </span>
                    <h3 className="font-semibold text-gray-900">{reporte.titulo}</h3>
                  </div>
                  <span className="text-sm text-gray-500">{formatFecha(reporte.createdAt)}</span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600 mb-2">{reporte.descripcion}</p>
                <p className="text-sm text-gray-500">📍 {getSitioNombre(reporte.sitioId)}</p>
                {reporte.fotos?.length > 0 && (
                  <div className="flex gap-2 mt-3">
                    {reporte.fotos.map((foto, i) => (
                      <img key={i} src={foto} alt={`Foto ${i + 1}`} className="w-16 h-16 object-cover rounded" />
                    ))}
                  </div>
                )}
                {reporte.firma && (
                  <div className="mt-3">
                    <p className="text-xs text-gray-500 mb-1">Firma:</p>
                    <img src={reporte.firma} alt="Firma" className="h-16 border rounded" />
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Nuevo Reporte" size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select
            label="Tipo de Reporte"
            value={formData.tipo}
            onChange={(e) => setFormData({...formData, tipo: e.target.value})}
            options={[
              { value: 'ronda', label: 'Ronda' },
              { value: 'incidente', label: 'Incidente' },
              { value: 'evento', label: 'Evento' },
              { value: 'emergencia', label: 'Emergencia' },
            ]}
          />
          <Select
            label="Sitio"
            value={formData.sitioId}
            onChange={(e) => setFormData({...formData, sitioId: e.target.value})}
            options={[{ value: '', label: 'Seleccionar...' }, ...sitios.map(s => ({ value: s.id, label: s.nombre }))]}
            required
          />
          <Input
            label="Título"
            value={formData.titulo}
            onChange={(e) => setFormData({...formData, titulo: e.target.value})}
            placeholder="Breve descripción"
            required
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
            <textarea
              className="input-field"
              rows={3}
              value={formData.descripcion}
              onChange={(e) => setFormData({...formData, descripcion: e.target.value})}
              placeholder="Detalles del reporte..."
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Firma</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-2">
              <canvas 
                ref={canvasRef} 
                className="w-full h-32"
              />
            </div>
            <div className="flex gap-2 mt-1">
              <button type="button" onClick={() => signatureRef.current?.clear()} className="text-sm text-gray-500">
                Limpiar firma
              </button>
            </div>
          </div>
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="secondary" className="flex-1" onClick={() => setShowModal(false)}>Cancelar</Button>
            <Button type="submit" className="flex-1" loading={saving}>Guardar</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
