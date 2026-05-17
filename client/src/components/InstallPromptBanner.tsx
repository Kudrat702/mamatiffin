import React from 'react';
import { Download, X } from 'lucide-react';
import { useInstallPrompt } from '../hooks/useInstallPrompt';

const InstallPromptBanner: React.FC = () => {
  const { canInstall, install, dismiss } = useInstallPrompt();

  if (!canInstall) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 pointer-events-none">
      <div className="max-w-md mx-auto pointer-events-auto">
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
          <div
            className="h-1 w-full"
            style={{ background: 'linear-gradient(135deg, rgb(50, 140, 129), rgb(34, 197, 94))' }}
          />
          <div className="flex items-center gap-3 p-4">
            <img
              src="/android-chrome-192x192.png"
              alt="MamaTiffin"
              className="w-12 h-12 rounded-xl flex-shrink-0 shadow-sm"
            />
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-900 text-sm leading-tight">
                Install MamaTiffin
              </p>
              <p className="text-gray-500 text-xs mt-0.5">
                Home screen pe add karo — fast &amp; offline ready
              </p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={install}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-white text-sm font-semibold shadow-md active:scale-95 transition-transform"
                style={{ background: 'linear-gradient(135deg, rgb(50, 140, 129), rgb(34, 197, 94))' }}
              >
                <Download size={14} />
                Install
              </button>
              <button
                onClick={dismiss}
                className="p-2 rounded-xl text-gray-400 hover:bg-gray-100 active:bg-gray-200 transition-colors"
                aria-label="Dismiss"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstallPromptBanner;
