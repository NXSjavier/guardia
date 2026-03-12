import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { empresaService, authService } from '../services/api';
import { HiShieldCheck, HiMail, HiLockClosed, HiPhone, HiOfficeBuilding, HiUser } from 'react-icons/hi';
import { toast } from 'sonner';

export const RegisterPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  
  const [empresa, setEmpresa] = useState({
    nombre: '',
    ruc: '',
    telefono: '',
    email: '',
    direccion: '',
    password: '',
  });
  
  const [usuario, setUsuario] = useState({
    nombre: '',
    apellido: '',
    cedula: '',
    telefono: '',
    password: '',
    confirmarPassword: '',
  });

  const handleCrearEmpresa = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await empresaService.crear(empresa);
      toast.success('Empresa creada exitosamente');
      setStep(2);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error al crear la empresa');
    } finally {
      setLoading(false);
    }
  };

  const handleRegistrarAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (usuario.password !== usuario.confirmarPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }

    setLoading(true);
    
    try {
      const response = await empresaService.obtenerTodos();
      const empresaData = response.data.find((e: any) => e.ruc === empresa.ruc);
      
      if (!empresaData) {
        throw new Error('Empresa no encontrada');
      }

      await authService.registrar({
        ...usuario,
        email: empresa.email,
        empresaId: empresaData.id,
        rol: 'administrador',
      });
      
      toast.success('Administrador registrado exitosamente');
      navigate('/login');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error al registrar el usuario');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-800 to-primary-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-lg mb-4">
            <HiShieldCheck className="w-10 h-10 text-primary-600" />
          </div>
          <h1 className="text-2xl font-bold text-white">Guardia Management</h1>
          <p className="text-primary-200 mt-1">
            {step === 1 ? 'Registra tu empresa' : 'Crea el administrador'}
          </p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {step === 1 ? (
            <form onSubmit={handleCrearEmpresa} className="space-y-5">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Datos de la Empresa</h2>
              
              <Input
                label="Nombre de la empresa"
                value={empresa.nombre}
                onChange={(e) => setEmpresa({ ...empresa, nombre: e.target.value })}
                placeholder="Seguridad Ecuador Cía. Ltda."
                icon={<HiOfficeBuilding className="w-5 h-5" />}
                required
              />

              <Input
                label="RUC"
                value={empresa.ruc}
                onChange={(e) => setEmpresa({ ...empresa, ruc: e.target.value })}
                placeholder="1234567890001"
                required
              />

              <Input
                label="Email"
                type="email"
                value={empresa.email}
                onChange={(e) => setEmpresa({ ...empresa, email: e.target.value })}
                placeholder="contacto@empresa.com"
                icon={<HiMail className="w-5 h-5" />}
                required
              />

              <Input
                label="Teléfono"
                type="tel"
                value={empresa.telefono}
                onChange={(e) => setEmpresa({ ...empresa, telefono: e.target.value })}
                placeholder="0991234567"
                icon={<HiPhone className="w-5 h-5" />}
              />

              <Input
                label="Dirección"
                value={empresa.direccion}
                onChange={(e) => setEmpresa({ ...empresa, direccion: e.target.value })}
                placeholder="Av. Principal 123, Quito"
              />

              <Input
                label="Contraseña del Administrador"
                type="password"
                value={empresa.password}
                onChange={(e) => setEmpresa({ ...empresa, password: e.target.value })}
                placeholder="••••••••"
                icon={<HiLockClosed className="w-5 h-5" />}
                required
              />

              <Button type="submit" className="w-full" loading={loading}>
                Continuar
              </Button>
            </form>
          ) : (
            <form onSubmit={handleRegistrarAdmin} className="space-y-5">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Datos del Administrador</h2>
              
              <Input
                label="Nombre"
                value={usuario.nombre}
                onChange={(e) => setUsuario({ ...usuario, nombre: e.target.value })}
                placeholder="Juan"
                icon={<HiUser className="w-5 h-5" />}
                required
              />

              <Input
                label="Apellido"
                value={usuario.apellido}
                onChange={(e) => setUsuario({ ...usuario, apellido: e.target.value })}
                placeholder="Pérez"
                required
              />

              <Input
                label="Cédula"
                value={usuario.cedula}
                onChange={(e) => setUsuario({ ...usuario, cedula: e.target.value })}
                placeholder="1234567890"
                required
              />

              <Input
                label="Teléfono"
                type="tel"
                value={usuario.telefono}
                onChange={(e) => setUsuario({ ...usuario, telefono: e.target.value })}
                placeholder="0991234567"
                icon={<HiPhone className="w-5 h-5" />}
              />

              <Input
                label="Contraseña"
                type="password"
                value={usuario.password}
                onChange={(e) => setUsuario({ ...usuario, password: e.target.value })}
                placeholder="••••••••"
                icon={<HiLockClosed className="w-5 h-5" />}
                required
              />

              <Input
                label="Confirmar contraseña"
                type="password"
                value={usuario.confirmarPassword}
                onChange={(e) => setUsuario({ ...usuario, confirmarPassword: e.target.value })}
                placeholder="••••••••"
                icon={<HiLockClosed className="w-5 h-5" />}
                required
              />

              <Button type="submit" className="w-full" loading={loading}>
                Completar Registro
              </Button>

              <button
                type="button"
                onClick={() => setStep(1)}
                className="w-full text-sm text-gray-500 hover:text-gray-700"
              >
                ← Volver
              </button>
            </form>
          )}

          <div className="mt-6 text-center">
            <Link 
              to="/login" 
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              ¿Ya tienes cuenta? Inicia sesión
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
