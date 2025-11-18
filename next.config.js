/** @type {import('next').NextConfig} */

const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  // PENTING: Set ke 'false' agar PWA aktif di mode dev DAN production.
  // Jika Anda menghapus baris ini, defaultnya biasanya disable di dev.
  disable: false, 
});

const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
};

module.exports = withPWA(nextConfig);