import { useEffect, useState } from 'react';
import { HiDownload, HiDesktopComputer, HiDeviceMobile } from 'react-icons/hi';
import { Button } from '../components/Button';
import { Card, CardContent, CardHeader } from '../components/Card';
import { usePwaInstall } from '../context/PwaInstallContext';

export const InstallPage = () => {
  const [alreadyInstalled, setAlreadyInstalled] = useState(false);
  const [ios, setIos] = useState(false);
  const { hasPrompt, promptInstall, triggerInstall } = usePwaInstall();

  useEffect(() => {
    // check display-mode and iOS
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setAlreadyInstalled(true);
    }
    const ua = window.navigator.userAgent.toLowerCase();
    setIos(/iphone|ipad|ipod/.test(ua));

    if (hasPrompt) {
      // if we already know the prompt is available, show it immediately
      triggerInstall();
    }
  }, [hasPrompt, triggerInstall]);

  if (alreadyInstalled) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card>
          <CardHeader>
            <h2 className="font-semibold text-gray-900">Aplicación instalada</h2>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500">Tu aplicación ya está instalada en este dispositivo.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <Card>
          <CardHeader>
            <h2 className="font-semibold text-gray-900 flex items-center gap-2">
              <HiDownload className="w-6 h-6" /> Instalar GuardiaApp
            </h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-500">
              Puedes añadir la aplicación a tu pantalla de inicio y usarla como una app nativa. También existe un atajo “Instalar app” en el menú de navegación si ya estás usando la PWA.
            </p>

            {/* desktop instructions */}
            <div className="flex items-start gap-3">
              <HiDesktopComputer className="w-6 h-6 text-gray-400 mt-1" />
              <div>
                <p className="font-medium">En escritorio (Chrome / Edge / Firefox):</p>
                <ul className="list-disc list-inside text-gray-500">
                  <li>Haz clic en el menú de tres puntos arriba a la derecha.</li>
                  <li>Selecciona «Instalar GuardiaApp» o «Agregar a pantalla de inicio».</li>
                </ul>
              </div>
            </div>

            {/* mobile instructions */}
            <div className="flex items-start gap-3">
              <HiDeviceMobile className="w-6 h-6 text-gray-400 mt-1" />
              <div>
                <p className="font-medium">En móvil:</p>
                {ios ? (
                  <p className="text-gray-500">Usa el botón <strong>Compartir</strong> y elige «Agregar a pantalla de inicio».</p>
                ) : (
                  <p className="text-gray-500">Abre el menú del navegador (tres puntos) y toca «Instalar».</p>
                )}
              </div>
            </div>

            <div className="text-center">
              <Button
                onClick={promptInstall}
                disabled={!hasPrompt}
                className="w-full"
              >
                {hasPrompt ? 'Mostrar instalador' : 'Seguir instrucciones manualmente'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};