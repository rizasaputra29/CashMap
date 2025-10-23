// rizasaputra29/financial-tracker/Financial-Tracker-15996308ee6cfd5d3abc50bd8eb71447eefc8019/app/layout.tsx
import './globals.css';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { AuthProvider } from '@/contexts/AuthContext';
import { FinanceProvider } from '@/contexts/FinanceContext';
import { Toaster } from '@/components/ui/toaster';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  // *** UPDATE: Change title ***
  title: 'Cash Map',
  description: 'Track your income, expenses, and savings goals',
  manifest: '/site.webmanifest',
  themeColor: '#000000', // Or '#ffffff' depending on your manifest
  icons: {
    // Keep existing references as they match your public folder files
    icon: '/android-chrome-512x512.png', // Main icon
    apple: '/apple-touch-icon.png', // Apple touch icon
    other: [
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '32x32',
        url: '/favicon-32x32.png', //
      },
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '16x16',
        url: '/favicon-16x16.png', //
      },
       // You might also want to explicitly add favicon.ico if needed by older browsers
       {
         rel: 'shortcut icon',
         url: '/favicon.ico', //
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
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          <FinanceProvider>
            {children}
            <Toaster /> {/* */}
          </FinanceProvider>
        </AuthProvider>
      </body>
    </html>
  );
}