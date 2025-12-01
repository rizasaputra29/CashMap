/** @type {import('next').NextConfig} */
const runtimeCaching = require('next-pwa/cache');

const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: false, 
  importScripts: ['/custom-sw.js'],
  runtimeCaching: [
    ...runtimeCaching,
  ],
});

const nextConfig = {
  reactStrictMode: false,
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