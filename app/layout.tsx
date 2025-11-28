import './globals.css';
// 1. Import tipe Viewport
import type { Metadata, Viewport } from 'next';
import { Onest } from 'next/font/google';
import { AuthProvider } from '../contexts/AuthContext';
import { FinanceProvider } from '../contexts/FinanceContext';
import { Toaster } from '../components/ui/toaster';
import LenisProvider from '../components/LenisProvider';
import { ServiceWorkerRegister } from '@/components/ServiceWorkerRegister';

const onest = Onest({ subsets: ['latin'] });

// 2. Pisahkan konfigurasi Viewport (themeColor, width, scale, dll)
export const viewport: Viewport = {
  themeColor: '#000000',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

// 3. Konfigurasi Metadata (Judul, Deskripsi, Ikon, Manifest)
export const metadata: Metadata = {
  title: 'CashMap',
  description: 'Track your income, expenses, and savings goals with CashMap',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'CashMap'
  },
  formatDetection: {
    telephone: false
  },
  icons: {
    icon: [
      { url: '/icon-192x192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' }
    ]
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={onest.className} suppressHydrationWarning>
        <ServiceWorkerRegister />
        <LenisProvider>
          <AuthProvider>
            <FinanceProvider>
              {children}
              <Toaster />
            </FinanceProvider>
          </AuthProvider>
        </LenisProvider>
      </body>
    </html>
  );
}