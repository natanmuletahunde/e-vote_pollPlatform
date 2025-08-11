/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  experimental: {
    serverActions: true,
  },
  images: {
    domains: [
      'play-lh.googleusercontent.com', // For your logo
      'lh3.googleusercontent.com'     // For Google profile images
    ],
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': path.resolve(__dirname, 'app'),
    };
    return config;
  }
};

module.exports = nextConfig;