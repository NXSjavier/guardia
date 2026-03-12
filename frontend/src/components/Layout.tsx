import { ReactNode, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { usePwaInstall } from '../context/PwaInstallContext';
import {
  HiHome,
  HiUsers,
  HiOfficeBuilding,
  HiCalendar,
  HiDocumentReport,
  HiCog,
  HiBell,
  HiMenu,
  HiX,
  HiLogout,
  HiShieldCheck,
  HiMoon,
  HiSun,
  HiDownload,
} from 'react-icons/hi';

interface LayoutProps {
  children: ReactNode;
}

interface MenuItem {
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  roles?: string[];
  onClick?: () => void;
}

export const Layout = ({ children }: LayoutProps) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const { triggerInstall } = usePwaInstall();

  const menuItems: MenuItem[] = [
    { path: '/dashboard', icon: HiHome, label: 'Dashboard' },
    { path: '/empleados', icon: HiUsers, label: 'Empleados', roles: ['administrador', 'supervisor'] },
    { path: '/sitios', icon: HiOfficeBuilding, label: 'Sitios', roles: ['administrador', 'supervisor'] },
    { path: '/turnos', icon: HiCalendar, label: 'Turnos', roles: ['administrador', 'supervisor'] },
    { path: '/mis-turnos', icon: HiCalendar, label: 'Mis Turnos', roles: ['guardia'] },
    { path: '/reportes', icon: HiDocumentReport, label: 'Reportes' },
    { path: '/permisos', icon: HiShieldCheck, label: 'Permisos', roles: ['administrador', 'supervisor'] },
    { path: '/mis-permisos', icon: HiShieldCheck, label: 'Mis Permisos', roles: ['guardia'] },
    { path: '/mapa', icon: HiOfficeBuilding, label: 'Mapa' },
    { path: '/configuracion', icon: HiCog, label: 'Configuracion' },
    { path: '#install', icon: HiDownload, label: 'Instalar App', onClick: triggerInstall },
  ];

  const filteredMenuItems = menuItems.filter(
    (item) => !item.roles || (user && item.roles.includes(user.rol))
  );

  const bottomNavPaths =
    user?.rol === 'guardia'
      ? ['/dashboard', '/mis-turnos', '/reportes', '/mapa', '/configuracion']
      : ['/dashboard', '/empleados', '/turnos', '/mapa', '/configuracion'];

  const bottomNavItems = filteredMenuItems.filter((item) => bottomNavPaths.includes(item.path));

  useEffect(() => {
    const stored = localStorage.getItem('theme');
    const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
    const initial = stored ? stored === 'dark' : prefersDark;
    setDarkMode(initial);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 flex">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`
        fixed lg:static inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800
        transform transition-transform duration-200 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}
      >
        <div className="h-full flex flex-col">
          <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <HiShieldCheck className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-gray-900 dark:text-gray-100">Guardia</span>
            </div>
            <button
              className="lg:hidden p-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
              onClick={() => setSidebarOpen(false)}
            >
              <HiX className="w-6 h-6" />
            </button>
          </div>

          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {filteredMenuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;

              if (item.onClick) {
                return (
                  <button
                    key={item.path}
                    onClick={() => {
                      item.onClick!();
                      setSidebarOpen(false);
                    }}
                    className={`
                      w-full text-left flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                      text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-gray-100
                    `}
                  >
                    <Icon className="w-5 h-5" />
                    {item.label}
                  </button>
                );
              }

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-lg transition-colors
                    ${
                      isActive
                        ? 'bg-primary-50 text-primary-600 font-medium dark:bg-gray-800 dark:text-primary-300'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-gray-100'
                    }
                  `}
                  onClick={() => setSidebarOpen(false)}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-primary-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                <span className="text-primary-600 dark:text-primary-300 font-medium">
                  {user?.nombre?.charAt(0)}
                  {user?.apellido?.charAt(0)}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                  {user?.nombre} {user?.apellido}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{user?.rol}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-lg transition-colors"
            >
              <HiLogout className="w-4 h-4" />
              Cerrar Sesion
            </button>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-4 lg:px-6">
          <button
            className="lg:hidden p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800"
            onClick={() => setSidebarOpen(true)}
          >
            <HiMenu className="w-6 h-6" />
          </button>

          <div className="flex-1" />

          <div className="flex items-center gap-3">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
              title={darkMode ? 'Modo claro' : 'Modo oscuro'}
            >
              {darkMode ? (
                <HiSun className="w-5 h-5 text-yellow-400" />
              ) : (
                <HiMoon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              )}
            </button>
            <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 relative">
              <HiBell className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-6 overflow-y-auto pb-24 lg:pb-6">{children}</main>

        <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-gray-900/95 backdrop-blur border-t border-gray-200 dark:border-gray-800">
          <div className="grid grid-cols-5 gap-1 px-2 pb-[env(safe-area-inset-bottom)]">
            {bottomNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex flex-col items-center justify-center py-3 rounded-lg text-xs transition-colors ${
                    isActive ? 'text-primary-600 dark:text-primary-300' : 'text-gray-500 dark:text-gray-400'
                  }`}
                >
                  <Icon className="w-6 h-6 mb-1" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
};
