'use client';

import { useEffect } from 'react';

// Extend the Window interface to include the workbox property
declare global {
  interface Window {
    workbox?: any;
  }
}

export function ServiceWorkerRegister() {
  useEffect(() => {
    if ('serviceWorker' in navigator && window.workbox !== undefined) {
      const wb = window.workbox;
      
      // Log ketika SW aktif
      wb.addEventListener('activated', (event: any) => {
        console.log(`Service Worker active! (${event.isUpdate ? 'Update' : 'New'})`);
      });

      // Log jika ada error saat register
      wb.register().catch((err: any) => {
        console.error('Service Worker registration failed:', err);
      });
    } else if ('serviceWorker' in navigator) {
        // Fallback manual jika workbox tidak terdeteksi
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered manually:', registration);
            })
            .catch(error => {
                console.error('SW registration failed:', error);
            });
    }
  }, []);

  return null;
}