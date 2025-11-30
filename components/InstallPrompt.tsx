// components/InstallPrompt.tsx
'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Check if running in standalone mode (already installed)
    setIsStandalone(window.matchMedia('(display-mode: standalone)').matches);

    // Check for iOS
    setIsIOS(
      /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream
    );

    const handler = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => {
      window.removeEventListener('beforeinstallprompt', handler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();

    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      toast({ title: 'Success', description: 'Installing application...' });
    }
  };

  if (isStandalone) return null;

  // For Android/Desktop (Chrome/Edge)
  if (deferredPrompt) {
    return (
      <Button 
        onClick={handleInstallClick}
        variant="outline" 
        className="h-9 rounded-full border-2 border-black text-black font-bold hover:bg-black hover:text-white transition-colors gap-2"
      >
        <Download className="w-4 h-4" /> Install App
      </Button>
    );
  }

  // Optional: Instructions for iOS (since they don't support programmatic install)
  if (isIOS) {
    return null; // Or render a specific iOS instruction component
  }

  return null;
}