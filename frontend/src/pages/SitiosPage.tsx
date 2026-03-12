import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Modal } from '../components/Modal';
import { sitioService } from '../services/api';
import { Sitio } from '../types';
import { HiPlus, HiSearch, HiPencil, HiTrash, HiLocationMarker, HiMap } from 'react-icons/hi';
import { toast } from 'sonner';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

const markerIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export const SitiosPage = () => {
  const { user } = useAuth();
  const [sitios, setSitios] = useState<Sitio[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);
  const [editingSitio, setEditingSitio] = useState<Sitio | null>(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    nombre: '',
    direccion: '',
    coordenadas: { lat: 0, lng: 0 },
    instrucciones: '',
  });

  useEffect(() => {
    fetchSitios();
  }, [user?.empresaId]);

  const fetchSitios = async () => {
    if (!user?.empresaId) return;
    try {
      const response = await sitioService.obtenerTodos(user.empresaId);
      setSitios(response.data.filter((s: any) => s.activa));
    } catch (error) {
      console.error('Error fetching sitios:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.empresaId) return;
    
    setSaving(true);
    try {
      const data = { ...formData, empresaId: user.empresaId };
      if (editingSitio) {
        await sitioService.actualizar(editingSitio.id, data);
        toast.success('Sitio actualizado');
      } else {
        await sitioService.crear(data);
        toast.success('Sitio creado');
      }
      setShowModal(false);
      setEditingSitio(null);
      resetForm();
      fetchSitios();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (sitio: Sitio) => {
    setEditingSitio(sitio);
    setFormData({
      nombre: sitio.nombre,
      direccion: sitio.direccion,
      coordenadas: sitio.coordenadas,
      instrucciones: sitio.instrucciones,
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este sitio?')) return;
    try {
      await sitioService.eliminar(id);
      toast.success('Sitio eliminado');
      fetchSitios();
    } catch (error) {
      toast.error('Error al eliminar');
    }
  };

  const resetForm = () => {
    setFormData({ nombre: '', direccion: '', coordenadas: { lat: 0, lng: 0 }, instrucciones: '' });
  };

  const filteredSitios = sitios.filter(s => 
    s.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.direccion.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sitios</h1>
          <p className="text-gray-500">Gestiona los lugares de trabajo</p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setShowMapModal(true)} icon={<HiMap className="w-5 h-5" />}>
            Ver Mapa
          </Button>
          <Button onClick={() => { resetForm(); setEditingSitio(null); setShowModal(true); }} icon={<HiPlus className="w-5 h-5" />}>
            Nuevo Sitio
          </Button>
        </div>
      </div>

      <Card>
        <CardContent>
          <Input
            placeholder="Buscar sitios..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={<HiSearch className="w-5 h-5" />}
          />
        </CardContent>
      </Card>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full mx-auto" />
        </div>
      ) : filteredSitios.length === 0 ? (
        <Card><CardContent className="text-center py-12"><p className="text-gray-500">No hay sitios registrados</p></CardContent></Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredSitios.map((sitio) => (
            <Card key={sitio.id}>
              <CardContent>
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">{sitio.nombre}</h3>
                  <div className="flex gap-1">
                    <button onClick={() => handleEdit(sitio)} className="p-1.5 text-gray-400 hover:text-primary-600">
                      <HiPencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDelete(sitio.id)} className="p-1.5 text-gray-400 hover:text-red-600">
                      <HiTrash className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="flex items-start gap-2 text-sm text-gray-500 mb-2">
                  <HiLocationMarker className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{sitio.direccion}</span>
                </div>
                {sitio.instrucciones && (
                  <p className="text-sm text-gray-500 bg-gray-50 p-2 rounded">{sitio.instrucciones}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingSitio ? 'Editar Sitio' : 'Nuevo Sitio'} size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Nombre" value={formData.nombre} onChange={(e) => setFormData({...formData, nombre: e.target.value})} required />
          <Input label="Dirección" value={formData.direccion} onChange={(e) => setFormData({...formData, direccion: e.target.value})} required />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Latitud" type="number" step="any" value={formData.coordenadas.lat} onChange={(e) => setFormData({...formData, coordenadas: {...formData.coordenadas, lat: parseFloat(e.target.value)}})} />
            <Input label="Longitud" type="number" step="any" value={formData.coordenadas.lng} onChange={(e) => setFormData({...formData, coordenadas: {...formData.coordenadas, lng: parseFloat(e.target.value)}})} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Instrucciones</label>
            <textarea className="input-field" rows={3} value={formData.instrucciones} onChange={(e) => setFormData({...formData, instrucciones: e.target.value})} />
          </div>
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="secondary" className="flex-1" onClick={() => setShowModal(false)}>Cancelar</Button>
            <Button type="submit" className="flex-1" loading={saving}>{editingSitio ? 'Actualizar' : 'Crear'}</Button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={showMapModal} onClose={() => setShowMapModal(false)} title="Mapa de Sitios" size="lg">
        <div className="h-96">
          <MapContainer center={[-0.1807, -78.4678]} zoom={12} style={{ height: '100%', width: '100%' }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {sitios.filter(s => s.coordenadas.lat !== 0).map(sitio => (
              <Marker key={sitio.id} position={[sitio.coordenadas.lat, sitio.coordenadas.lng]} icon={markerIcon}>
                <Popup><strong>{sitio.nombre}</strong><br/>{sitio.direccion}</Popup>
              </Marker>
            ))}
          </MapContainer>
        </div>
      </Modal>
    </div>
  );
};
