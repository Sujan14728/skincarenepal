import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  poweredByHeader: false,
  compress: true,
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 604800,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**'
      },
      {
        protocol: 'http',
        hostname: '**'
      }
    ]
  },
  async headers() {
    return [
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable'
          }
        ]
      },
      {
        source: '/images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=604800, stale-while-revalidate=86400'
          }
        ]
      },
      {
        source: '/favicon.ico',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=86400' }]
      }
    ];
  },
  async rewrites() {
    return [
      { source: '/', destination: '/landing' },
      { source: '/about', destination: '/landing/about' },
      { source: '/cart', destination: '/landing/cart' },
      { source: '/checkout', destination: '/landing/checkout' },
      { source: '/contact', destination: '/landing/contact' },
      { source: '/faqs', destination: '/landing/faqs' },
      { source: '/order-confirmed', destination: '/landing/order-confirmed' },
      {
        source: '/order/confirmation',
        destination: '/landing/order/confirmation'
      },
      { source: '/privacy', destination: '/landing/privacy' },
      { source: '/products', destination: '/landing/products' },
      { source: '/products/:slug', destination: '/landing/products/:slug' },
      { source: '/returns', destination: '/landing/returns' },
      { source: '/shipping', destination: '/landing/shipping' },
      { source: '/terms', destination: '/landing/terms' }
    ];
  },
  async redirects() {
    return [
      {
        source: '/landing',
        destination: '/',
        permanent: true
      },
      {
        source: '/landing/:path*',
        destination: '/:path*',
        permanent: true
      }
    ];
  }
};

export default nextConfig;
