import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';

export type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
};

interface PwaInstallContextValue {
  isIos: boolean;
  show: boolean;
  hasPrompt: boolean;
  promptInstall: () => Promise<void>;
  closePrompt: () => void;
  triggerInstall: () => void;
}

const PwaInstallContext = createContext<PwaInstallContextValue | undefined>(undefined);

export const PwaInstallProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [show, setShow] = useState(false);
  const [isIos, setIsIos] = useState(false);

  useEffect(() => {
    const ua = window.navigator.userAgent.toLowerCase();
    const ios = /iphone|ipad|ipod/.test(ua);
    setIsIos(ios);

    const dismissed = localStorage.getItem('pwa_install_dismissed');
    const seenSession = sessionStorage.getItem('pwa_install_seen_session');
    if (dismissed === '1' || seenSession === '1') {
      return;
    }

    const handler = (e: Event) => {
      e.preventDefault();
      sessionStorage.setItem('pwa_install_seen_session', '1');
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShow(true);
    };

    window.addEventListener('beforeinstallprompt', handler as EventListener);
    return () => window.removeEventListener('beforeinstallprompt', handler as EventListener);
  }, []);

  useEffect(() => {
    if (!show) return;
    const timer = setTimeout(() => setShow(false), 10000);
    return () => clearTimeout(timer);
  }, [show]);

  const promptInstall = useCallback(async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    setShow(false);
    if (choice.outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  }, [deferredPrompt]);

  const closePrompt = useCallback(() => {
    setShow(false);
    localStorage.setItem('pwa_install_dismissed', '1');
  }, []);

  const triggerInstall = useCallback(() => {
    setShow(true);
  }, []);

  return (
    <PwaInstallContext.Provider
      value={{
        isIos,
        show,
        hasPrompt: !!deferredPrompt,
        promptInstall,
        closePrompt,
        triggerInstall,
      }}
    >
      {children}
    </PwaInstallContext.Provider>
  );
};

export const usePwaInstall = () => {
  const ctx = useContext(PwaInstallContext);
  if (!ctx) {
    throw new Error('usePwaInstall must be used within PwaInstallProvider');
  }
  return ctx;
};
