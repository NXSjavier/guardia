import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { HiShieldCheck, HiMail, HiLockClosed } from 'react-icons/hi';
import { toast } from 'sonner';

export const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await login(email, password);
      toast.success('Bienvenido al sistema');
      navigate('/dashboard', { replace: true });
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Error al iniciar sesión');
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
          <p className="text-primary-200 mt-1">Gestión de seguridad privada</p>
        </div>

        {/* Login form */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Iniciar Sesión</h2>
          
          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              label="Correo electrónico"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="correo@empresa.com"
              icon={<HiMail className="w-5 h-5" />}
              required
            />

            <Input
              label="Contraseña"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              icon={<HiLockClosed className="w-5 h-5" />}
              required
            />

            <Button
              type="submit"
              className="w-full"
              loading={loading}
            >
              Iniciar Sesión
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link 
              to="/registrar" 
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              ¿No tienes cuenta? Regístrate
            </Link>
          </div>
        </div>

        <p className="text-center text-primary-200 text-sm mt-8 space-y-1">
          <span>© 2024 Guardia Management. Todos los derechos reservados.</span>
          <Link
            to="/install"
            className="text-xs text-primary-200 hover:text-primary-100 underline"
          >
            ¿Cómo instalar la aplicación?
          </Link>
        </p>
      </div>
    </div>
  );
};
