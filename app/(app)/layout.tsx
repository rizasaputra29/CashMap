// File: app/(app)/layout.tsx
// Pastikan file ini ada dan berisi kode berikut

import { Navigation } from '../../components/Navigation';
import { ProtectedRoute } from '../../components/ProtectedRoute';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-white">
        <Navigation />
        {/* pb-16 (padding-bottom: 4rem) memberi ruang untuk bottom nav.
          lg:pb-0 menghapusnya di desktop.
          Tidak perlu padding-top, karena top-bar (DesktopNav)
          sudah 'sticky' dan akan mendorong konten, dan di mobile
          memang tidak ada top-bar.
        */}
        <main className="pb-16 lg:pb-0">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
}