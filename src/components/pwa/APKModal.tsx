import React, { useState } from 'react';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import {
  Smartphone,
  Download,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Zap,
  Terminal,
  HelpCircle,
  Copy,
  Check,
  X
} from 'lucide-react';

interface APKModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const APKModal: React.FC<APKModalProps> = ({ isOpen, onClose }) => {
  const { isInstallable, isInstalled, isIOS, isAndroid, install } = usePWAInstall();
  const [copiedLink, setCopiedLink] = useState(false);

  if (!isOpen) return null;

  const appUrl = window.location.origin;

  const copyAppUrl = () => {
    navigator.clipboard.writeText(appUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  // Direct PWABuilder link with current app URL prefilled
  const pwaBuilderUrl = `https://www.pwabuilder.com/reportcard?site=${encodeURIComponent(appUrl)}`;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-emerald-950 via-emerald-900 to-teal-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-black">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base">Instalar / Obter APK Android</h3>
              <p className="text-xs text-emerald-200">Minha Casa AO no seu telemóvel</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-emerald-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 overflow-y-auto">
          {/* Method 1: Instant Direct Android Installation (WebAPK) */}
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-800 text-white text-xs font-black flex items-center justify-center">
                1
              </span>
              <h4 className="font-bold text-sm text-emerald-950">
                Instalação Direta no Telemóvel (Recomendado)
              </h4>
            </div>

            <p className="text-xs text-emerald-900 leading-relaxed">
              O Android (Google Chrome / Samsung Internet) converte esta aplicação instantaneamente num <strong>WebAPK nativo</strong>. Fica com o ícone verde oficial no seu ecrã, abre sem barra de navegador e funciona <strong>100% offline</strong>!
            </p>

            {isInstalled ? (
              <div className="p-3 bg-white rounded-xl border border-emerald-300 flex items-center gap-2 text-xs font-bold text-emerald-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Aplicação já está instalada neste dispositivo!</span>
              </div>
            ) : isInstallable ? (
              <button
                onClick={async () => {
                  await install();
                }}
                className="w-full py-3 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition-transform active:scale-95"
              >
                <Download className="w-4 h-4 text-amber-300" />
                <span>Instalar Agora no Telemóvel (WebAPK)</span>
              </button>
            ) : (
              <div className="p-3 bg-white/80 rounded-xl border border-emerald-200 text-xs text-emerald-900 space-y-1">
                <p className="font-bold">Como instalar no seu Android em 2 passos:</p>
                <ol className="list-decimal list-inside space-y-1 text-[11px] text-emerald-800">
                  <li>No Chrome do telemóvel, toque no menu <strong>⋮ (três pontos)</strong> no canto superior.</li>
                  <li>Selecione <strong>&quot;Instalar aplicação&quot;</strong> ou <strong>&quot;Adicionar ao ecrã principal&quot;</strong>.</li>
                </ol>
              </div>
            )}
          </div>

          {/* Method 2: Download Standalone .APK File via PWABuilder */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-slate-800 text-white text-xs font-black flex items-center justify-center">
                2
              </span>
              <h4 className="font-bold text-sm text-slate-900">
                Gerar Ficheiro .APK de Instalação (PWABuilder)
              </h4>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Deseja um ficheiro <code>.apk</code> ou <code>.aab</code> pronto para enviar por Bluetooth, WhatsApp ou publicar na Google Play Store? O <strong>PWABuilder</strong> oficial da Microsoft empacota esta aplicação num APK assinado gratuitamente:
            </p>

            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={appUrl}
                className="w-full p-2 bg-white rounded-xl border border-slate-200 text-xs font-mono text-slate-700"
              />
              <button
                onClick={copyAppUrl}
                className="px-3 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-bold shrink-0 transition-colors"
                title="Copiar endereço da app"
              >
                {copiedLink ? 'Copiado!' : 'Copiar URL'}
              </button>
            </div>

            <a
              href={pwaBuilderUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
            >
              <ExternalLink className="w-4 h-4 text-emerald-400" />
              <span>Abrir Gerador de APK Oficial (PWABuilder)</span>
            </a>
          </div>

          {/* Method 3: Flutter / Native Build Commands */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-slate-800 text-white text-xs font-black flex items-center justify-center">
                3
              </span>
              <h4 className="font-bold text-sm text-slate-900">
                Compilar via Linha de Comandos (Flutter ou Bubblewrap)
              </h4>
            </div>

            <p className="text-[11px] text-slate-600">
              Se tiver o SDK Android ou Flutter instalado no computador, execute:
            </p>

            <pre className="p-2.5 bg-slate-950 text-emerald-400 rounded-xl text-[11px] font-mono overflow-x-auto border border-slate-800">
              {`# Gerar APK direto da PWA com Bubblewrap:\nnpx @bubblewrap/cli build\n\n# Ou compilar o projeto Flutter nativo:\nflutter build apk --release`}
            </pre>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-100 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2.5 bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold rounded-xl transition-colors"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
