import { useEffect, useState } from 'react';
import { Download, X, Share, Plus, Smartphone } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const isIos = () =>
  /iphone|ipad|ipod/i.test(window.navigator.userAgent) && !(window as any).MSStream;

const isStandalone = () =>
  window.matchMedia('(display-mode: standalone)').matches ||
  (window.navigator as any).standalone === true;

export const InstallPWA = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showIosModal, setShowIosModal] = useState(false);
  const [installed, setInstalled] = useState(isStandalone());

  useEffect(() => {
    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };
    const onInstalled = () => {
      setInstalled(true);
      setDeferredPrompt(null);
    };
    window.addEventListener('beforeinstallprompt', onBeforeInstall);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstall);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  // Already installed → nothing to show
  if (installed) return null;

  // On iOS there's no install prompt; on other platforms only show once we have the event
  const ios = isIos();
  if (!ios && !deferredPrompt) return null;

  const handleClick = async () => {
    if (ios) {
      setShowIosModal(true);
      return;
    }
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') setInstalled(true);
    setDeferredPrompt(null);
  };

  return (
    <>
      <div className="px-3 pb-2">
        <button
          onClick={handleClick}
          className="group w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-200/60 dark:border-gray-700/60 transition-colors"
        >
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary-500 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-sm">
            <Download className="w-4 h-4 text-white" />
          </div>
          <div className="text-left">
            <p className="text-xs font-bold text-gray-700 dark:text-gray-200">Instalar app</p>
            <p className="text-[10px] text-gray-500 dark:text-gray-400">Acesso rápido na tela inicial</p>
          </div>
        </button>
      </div>

      {/* iOS instructions modal */}
      {showIosModal && (
        <div
          className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in"
          onClick={() => setShowIosModal(false)}
        >
          <div
            className="w-full max-w-sm bg-white dark:bg-gray-900 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden animate-fade-in-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="relative bg-gradient-to-br from-primary-600 to-indigo-700 px-6 py-6 text-white text-center">
              <button
                onClick={() => setShowIosModal(false)}
                className="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-white/20 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="w-12 h-12 mx-auto mb-2 rounded-2xl bg-white/15 backdrop-blur flex items-center justify-center">
                <Smartphone className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-extrabold">Instalar no iPhone/iPad</h3>
              <p className="text-xs text-primary-200 mt-0.5">Adicione o Ato à sua tela inicial</p>
            </div>

            {/* Steps */}
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-primary-700 dark:text-primary-300">1</span>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Toque no botão <Share className="inline w-4 h-4 mx-0.5 text-primary-600" /> <strong>Compartilhar</strong> na barra do Safari
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-primary-700 dark:text-primary-300">2</span>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Role e toque em <Plus className="inline w-4 h-4 mx-0.5 text-primary-600" /> <strong>Adicionar à Tela de Início</strong>
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/40 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-primary-700 dark:text-primary-300">3</span>
                </div>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Toque em <strong>Adicionar</strong> — pronto! O Ato vira um app 🎉
                </p>
              </div>

              <button
                onClick={() => setShowIosModal(false)}
                className="w-full mt-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold py-3 rounded-xl hover:bg-primary-600 dark:hover:bg-primary-500 dark:hover:text-white transition-colors"
              >
                Entendi
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
