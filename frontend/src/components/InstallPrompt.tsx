import { HiDownload } from 'react-icons/hi';
import { usePwaInstall } from '../context/PwaInstallContext';

export const InstallPrompt = () => {
  const { isIos, show, hasPrompt, promptInstall, closePrompt } = usePwaInstall();

  if (!show && !isIos) return null;

  return (
    <div className="fixed inset-x-0 bottom-16 lg:bottom-4 z-50 px-4">
      <div className="mx-auto max-w-md rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-lg p-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-600 text-white flex items-center justify-center">
            <HiDownload className="w-6 h-6" />
          </div>
          <div className="flex-1">
            <p className="font-semibold">Instalar app</p>
            {isIos ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                En iOS: Compartir → Agregar a pantalla de inicio.
              </p>
            ) : hasPrompt ? (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Instala la app para acceso rapido y pantalla completa.
              </p>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Abre el menú del navegador y selecciona "Agregar a pantalla de inicio".
              </p>
            )}
          </div>
        </div>
        <div className="mt-3 flex gap-2">
          {!isIos && (
            <>
              <button
                onClick={promptInstall}
                disabled={!hasPrompt}
                className="flex-1 bg-primary-600 text-white py-2 rounded-lg font-medium disabled:opacity-50"
              >
                {hasPrompt ? 'Instalar' : 'Cómo instalar'}
              </button>
            </>
          )}
          <button
            onClick={closePrompt}
            className="flex-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 py-2 rounded-lg font-medium"
          >
            Ahora no
          </button>
        </div>
      </div>
    </div>
  );
};
