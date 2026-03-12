import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent } from '../components/Card';
import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from 'react-leaflet';
import { sitioService, turnoService, asistenciaService, empleadoService } from '../services/api';
import { Sitio, Turno, Asistencia, Usuario } from '../types';
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

export const MapaPage = () => {
  const { user } = useAuth();
  const [sitios, setSitios] = useState<Sitio[]>([]);
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [asistencias, setAsistencias] = useState<Asistencia[]>([]);
  const [empleados, setEmpleados] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [user?.empresaId]);

  const fetchData = async () => {
    if (!user?.empresaId) return;
    try {
      const [sitiosRes, turnosRes, asistenciasRes, empleadosRes] = await Promise.all([
        sitioService.obtenerTodos(user.empresaId),
        turnoService.obtenerDelDia(user.empresaId),
        asistenciaService.obtenerDelDia(user.empresaId),
        empleadoService.obtenerTodos(user.empresaId),
      ]);
      setSitios(sitiosRes.data.filter((s: Sitio) => s.activa && s.coordenadas.lat !== 0));
      setTurnos(turnosRes.data);
      setAsistencias(asistenciasRes.data);
      setEmpleados(empleadosRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const defaultCenter: [number, number] = [-0.1807, -78.4678];
  const center: [number, number] = sitios.length > 0 
    ? [sitios[0].coordenadas.lat, sitios[0].coordenadas.lng]
    : defaultCenter;

  const empleadoPorId = (id: string) => empleados.find(e => e.id === id);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mapa de Operaciones</h1>
        <p className="text-gray-500">Visualiza sitios y turnos del día</p>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full mx-auto" />
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <Card>
              <CardContent className="text-center">
                <p className="text-2xl font-bold text-primary-600">{sitios.length}</p>
                <p className="text-sm text-gray-500">Sitios Activos</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="text-center">
                <p className="text-2xl font-bold text-blue-600">{turnos.filter(t => t.estado !== 'cancelado').length}</p>
                <p className="text-sm text-gray-500">Turnos Hoy</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="text-center">
                <p className="text-2xl font-bold text-green-600">{turnos.filter(t => t.estado === 'completado').length}</p>
                <p className="text-sm text-gray-500">Completados</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="text-center">
                <p className="text-2xl font-bold text-yellow-600">{turnos.filter(t => t.estado === 'en_proceso').length}</p>
                <p className="text-sm text-gray-500">En Proceso</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="text-center">
                <p className="text-2xl font-bold text-green-600">{asistencias.filter(a => a.tipo === 'entrada').length}</p>
                <p className="text-sm text-gray-500">Entradas</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="text-center">
                <p className="text-2xl font-bold text-red-600">{asistencias.filter(a => a.tipo === 'salida').length}</p>
                <p className="text-sm text-gray-500">Salidas</p>
              </CardContent>
            </Card>
          </div>

          {/* Map */}
          <Card className="overflow-hidden">
            <div className="h-[500px]">
              <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%' }}>
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {sitios.map((sitio) => (
                  <Marker 
                    key={sitio.id} 
                    position={[sitio.coordenadas.lat, sitio.coordenadas.lng]}
                    icon={markerIcon}
                  >
                    <Popup>
                      <div className="text-sm">
                        <strong className="block mb-1">{sitio.nombre}</strong>
                        <span className="text-gray-600">{sitio.direccion}</span>
                      </div>
                    </Popup>
                  </Marker>
                ))}
                {asistencias
                  .filter(a => a.coordenadas?.lat && a.coordenadas?.lng)
                  .map((asistencia) => {
                    const empleado = empleadoPorId(asistencia.empleadoId);
                    const color = asistencia.tipo === 'entrada' ? '#16a34a' : '#dc2626';
                    return (
                      <CircleMarker
                        key={asistencia.id}
                        center={[asistencia.coordenadas.lat, asistencia.coordenadas.lng]}
                        radius={6}
                        pathOptions={{ color, fillColor: color, fillOpacity: 0.9 }}
                      >
                        <Popup>
                          <div className="text-sm">
                            <strong className="block mb-1">
                              {empleado ? `${empleado.nombre} ${empleado.apellido}` : 'Empleado'}
                            </strong>
                            <span className="text-gray-600 block">{asistencia.tipo === 'entrada' ? 'Entrada' : 'Salida'}</span>
                            <span className="text-gray-600 block">{asistencia.hora}</span>
                          </div>
                        </Popup>
                      </CircleMarker>
                    );
                  })}
              </MapContainer>
            </div>
          </Card>

          {/* Legend */}
          <Card>
            <CardContent>
              <h3 className="font-semibold mb-3">Leyenda</h3>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-primary-500 rounded-full" />
                  <span className="text-sm text-gray-600">Sitio de trabajo</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-600 rounded-full" />
                  <span className="text-sm text-gray-600">Entrada registrada</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-600 rounded-full" />
                  <span className="text-sm text-gray-600">Salida registrada</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};
