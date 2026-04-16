/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: { unoptimized: true },
  webpack: (config) => {
    config.ignoreWarnings = config.ignoreWarnings || [];
    config.ignoreWarnings.push((warning) => {
      const message = typeof warning === 'string' ? warning : warning?.message || '';
      const details = typeof warning === 'string' ? '' : warning?.details || '';
      const moduleResource = typeof warning === 'string' ? '' : warning?.module?.resource || '';
      const text = `${message}\n${details}\n${moduleResource}`;

      const isAvifWorkerWarning = text.includes('@jsquash/avif/codec/enc/avif_enc_mt.worker.mjs');
      const isCriticalDependencyWarning = text.includes('Critical dependency: the request of a dependency is an expression');
      const isCircularChunkWarning = text.includes('Circular dependency between chunks with runtime');

      return isAvifWorkerWarning && (isCriticalDependencyWarning || isCircularChunkWarning);
    });

    return config;
  },
};

module.exports = nextConfig;
