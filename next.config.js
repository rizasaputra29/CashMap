/** @type {import('next').NextConfig} */

// Konfigurasi PWA
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: false, 
});

// Konfigurasi Next.js
const nextConfig = {
  images: { unoptimized: true },
};

// Bungkus config dengan PWA
module.exports = withPWA(nextConfig);