'use client';

import { ReactLenis, useLenis } from '@studio-freight/react-lenis';
import { ReactNode } from 'react';

function LenisProvider({ children }: { children: ReactNode }) {
  // Opsi untuk Lenis, bisa disesuaikan
  const options = {
    lerp: 0.1, // Linear Interpolation (0.0 - 1.0)
    duration: 1.5,
    smoothTouch: true,
  };

  return (
    <ReactLenis root options={options}>
      {children}
    </ReactLenis>
  );
}

export default LenisProvider;