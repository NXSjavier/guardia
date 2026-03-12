import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Card, CardContent, CardHeader } from '../components/Card';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { toast } from 'sonner';
import { usePwaInstall } from '../context/PwaInstallContext';

export const ConfiguracionPage = () => {
  const { user, updateUser } = useAuth();
  const { triggerInstall } = usePwaInstall();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    nombre: user?.nombre || '',
    apellido: user?.apellido || '',
    telefono: user?.telefono || '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setSaving(true);
    try {
      updateUser({ ...user, ...formData });
      toast.success('Perfil actualizado');
    } catch (error) {
      toast.error('Error al actualizar');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Configuración</h1>
        <p className="text-gray-500">Administra tu cuenta</p>
      </div>

      <Card>
        <CardHeader>
          <h2 className="font-semibold text-gray-900">Información Personal</h2>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Nombre"
                value={formData.nombre}
                onChange={(e) => setFormData({...formData, nombre: e.target.value})}
              />
              <Input
                label="Apellido"
                value={formData.apellido}
                onChange={(e) => setFormData({...formData, apellido: e.target.value})}
              />
            </div>
            <Input
              label="Teléfono"
              type="tel"
              value={formData.telefono}
              onChange={(e) => setFormData({...formData, telefono: e.target.value})}
            />
            <Input
              label="Email"
              type="email"
              value={user?.email || ''}
              disabled
            />
            <Input
              label="Cédula"
              value={user?.cedula || ''}
              disabled
            />
            <Button type="submit" loading={saving}>
              Guardar Cambios
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="font-semibold text-gray-900">Información de la Empresa</h2>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <p><span className="text-gray-500">Rol:</span> <span className="font-medium capitalize">{user?.rol}</span></p>
            <p><span className="text-gray-500">Estado:</span> <span className="font-medium capitalize">{user?.estado?.replace('_', ' ')}</span></p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="font-semibold text-gray-900">Aplicación</h2>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 mb-4">
            Descarga la aplicación en tu dispositivo para tener acceso rápido y trabajar en modo pantalla completa.
          </p>
          <Button onClick={triggerInstall}>Instalar / Descargar App</Button>
        </CardContent>
      </Card>

      <Card className="border-red-200">
        <CardHeader>
          <h2 className="font-semibold text-red-600">Zona Peligrosa</h2>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500 mb-4">
            Una vez que elimines tu cuenta, no hay vuelta atrás. Por favor, ten cuidado.
          </p>
          <Button variant="danger">
            Eliminar Mi Cuenta
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
