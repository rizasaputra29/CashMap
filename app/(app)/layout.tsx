// File: app/(app)/layout.tsx
import { Navigation } from '../../components/Navigation';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
      <div className="min-h-screen bg-white">
        <Navigation />
        <main className="pb-16 lg:pb-0">
          {children}
        </main>
      </div>
  );
}