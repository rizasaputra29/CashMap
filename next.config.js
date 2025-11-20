/** @type {import('next').NextConfig} */
const runtimeCaching = require('next-pwa/cache');

const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: false, 
  importScripts: ['/custom-sw.js'], // Pastikan file ini ada di folder public!
  runtimeCaching: [
    // ... caching rules Anda
    ...runtimeCaching,
  ],
});

const nextConfig = {
  // Hapus blok eslint: { ... }
  images: { 
    unoptimized: false, 
    remotePatterns: [
      { protocol: 'https', hostname: 'cdn.worldvectorlogo.com' },
      { protocol: 'https', hostname: 'upload.wikimedia.org' },
      { protocol: 'https', hostname: 'images.seeklogo.com' },
      { protocol: 'https', hostname: 'ui-avatars.com' },
    ]
  },
};

module.exports = withPWA(nextConfig);