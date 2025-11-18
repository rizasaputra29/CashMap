import './globals.css';
// 1. Import tipe Viewport
import type { Metadata, Viewport } from 'next';
import { Onest } from 'next/font/google';
import { AuthProvider } from '../contexts/AuthContext';
import { FinanceProvider } from '../contexts/FinanceContext';
import { Toaster } from '../components/ui/toaster';
import LenisProvider from '../components/LenisProvider';

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
  title: 'Cash Map',
  description: 'Track your income, expenses, and savings goals',
  manifest: '/site.webmanifest',
  // themeColor DIHAPUS dari sini karena sudah pindah ke viewport
  icons: {
    icon: '/android-chrome-512x512.png',
    apple: '/apple-touch-icon.png',
    other: [
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '32x32',
        url: '/favicon-32x32.png',
      },
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '16x16',
        url: '/favicon-16x16.png',
      },
       {
         rel: 'shortcut icon',
         url: '/favicon.ico',
       },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={onest.className} suppressHydrationWarning>
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