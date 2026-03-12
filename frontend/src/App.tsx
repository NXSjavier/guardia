import { Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { Layout } from './components/Layout';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { EmpleadosPage } from './pages/EmpleadosPage';
import { SitiosPage } from './pages/SitiosPage';
import { TurnosPage } from './pages/TurnosPage';
import { ReportesPage } from './pages/ReportesPage';
import { PermisosPage } from './pages/PermisosPage';
import { MapaPage } from './pages/MapaPage';
import { ConfiguracionPage } from './pages/ConfiguracionPage';
import { MisTurnosPage } from './pages/MisTurnosPage';
import { InstallPrompt } from './components/InstallPrompt';
import { InstallPage } from './pages/InstallPage';
import { PwaInstallProvider } from './context/PwaInstallContext';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return <Layout>{children}</Layout>;
};

function App() {
  const { user, loading } = useAuth();

  useEffect(() => {
    const handler = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const anchor = target?.closest('a');
      if (!anchor) return;
      const href = anchor.getAttribute('href');
      if (!href) return;
      if (href.startsWith('http') && !href.startsWith(window.location.origin)) {
        event.preventDefault();
        window.open(href, '_blank', 'noopener,noreferrer');
      }
    };

    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <PwaInstallProvider>
      <>
        <Routes>
          <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
          <Route path="/registrar" element={user ? <Navigate to="/dashboard" replace /> : <RegisterPage />} />
          <Route path="/install" element={<InstallPage />} />
          
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/empleados" element={<ProtectedRoute><EmpleadosPage /></ProtectedRoute>} />
          <Route path="/sitios" element={<ProtectedRoute><SitiosPage /></ProtectedRoute>} />
          <Route path="/turnos" element={<ProtectedRoute><TurnosPage /></ProtectedRoute>} />
          <Route path="/mis-turnos" element={<ProtectedRoute><MisTurnosPage /></ProtectedRoute>} />
          <Route path="/reportes" element={<ProtectedRoute><ReportesPage /></ProtectedRoute>} />
          <Route path="/permisos" element={<ProtectedRoute><PermisosPage /></ProtectedRoute>} />
          <Route path="/mis-permisos" element={<ProtectedRoute><PermisosPage /></ProtectedRoute>} />
          <Route path="/mapa" element={<ProtectedRoute><MapaPage /></ProtectedRoute>} />
          <Route path="/configuracion" element={<ProtectedRoute><ConfiguracionPage /></ProtectedRoute>} />
          
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
        {/* automatic install dialog (works when browser fires beforeinstallprompt) */}
        <InstallPrompt />
      </>
    </PwaInstallProvider>
  );
}

export default App;
