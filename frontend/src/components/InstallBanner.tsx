import { HiDownload } from 'react-icons/hi';
import { usePwaInstall } from '../context/PwaInstallContext';

export default function InstallBanner() {
  const { show, isIos, hasPrompt, promptInstall } = usePwaInstall();

  if (!show || isIos) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg p-4 z-50">
      <div className="max-w-md mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center">
            <HiDownload className="w-5 h-5 text-primary-600" />
          </div>
          <div>
            <p className="font-medium text-gray-900">Instalar GuardiaApp</p>
            <p className="text-sm text-gray-500">Añádelo a tu pantalla de inicio</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={promptInstall}
            disabled={!hasPrompt}
            className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
          >
            Instalar
          </button>
        </div>
      </div>
    </div>
  );
}
