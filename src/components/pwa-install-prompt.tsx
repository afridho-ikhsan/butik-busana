"use client";

import { useState, useEffect } from "react";
import { Button } from "antd";
import { Download, X } from "lucide-react";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export default function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("pwa-install-dismissed");
    if (stored) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };

    const checkStandalone = () => {
      const inStandalone =
        window.matchMedia("(display-mode: standalone)").matches ||
        (window.navigator as { standalone?: boolean }).standalone === true;
      setIsInstalled(inStandalone);
    };

    window.addEventListener("beforeinstallprompt", handler);
    checkStandalone();

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") setShowPrompt(false);
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem("pwa-install-dismissed", Date.now().toString());
  };

  if (!showPrompt || isInstalled || !deferredPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-sm z-50">
      <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center shrink-0">
          <Download className="w-5 h-5 text-blue-600" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-slate-800 text-sm">Pasang Toserbanet</p>
          <p className="text-xs text-slate-500">Akses lebih cepat dari layar utama</p>
        </div>
        <div className="flex gap-2 shrink-0">
          <Button type="primary" size="small" onClick={handleInstall} icon={<Download className="w-4 h-4" />}>
            Pasang
          </Button>
          <Button type="text" size="small" onClick={handleDismiss} icon={<X className="w-4 h-4" />} />
        </div>
      </div>
    </div>
  );
}
