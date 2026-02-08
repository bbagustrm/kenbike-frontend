import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    output: 'standalone',  // ✅ BENAR - untuk production optimization

    images: {
        formats: ['image/avif', 'image/webp'],
        deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
        imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
        minimumCacheTTL: 31536000,

        // ⚠️ DEPRECATED - ganti dengan remotePatterns saja
        // domains: [
        //     'localhost',
        //     'api.kenbikestore.com',
        // ],

        remotePatterns: [
            // Development
            {
                protocol: 'http',
                hostname: 'localhost',
                port: '3000',
                pathname: '/uploads/**',
            },
            // Production - API subdomain
            {
                protocol: 'https',
                hostname: 'api.kenbikestore.com',
                pathname: '/uploads/**',
            },
        ],
    },

    async headers() {
        return [
            // Static assets caching
            {
                source: '/:all*(svg|jpg|jpeg|png|gif|webp|avif|ico|woff|woff2)',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'public, max-age=31536000, immutable',
                    },
                ],
            },
            // Next.js static files
            {
                source: '/_next/static/:path*',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'public, max-age=31536000, immutable',
                    },
                ],
            },
            // Next.js optimized images
            {
                source: '/_next/image/:path*',
                headers: [
                    {
                        key: 'Cache-Control',
                        value: 'public, max-age=31536000, immutable',
                    },
                ],
            },
        ];
    },

    // ⚠️ PRODUCTION TIDAK PERLU REWRITES - Nginx yang handle
    async rewrites() {
        if (process.env.NODE_ENV === 'development') {
            return [
                {
                    source: '/api/:path*',
                    destination: 'http://localhost:3000/api/:path*',
                },
                {
                    source: '/uploads/:path*',
                    destination: 'http://localhost:3000/uploads/:path*',
                },
            ];
        }

        // Production: no rewrites needed (Nginx handles routing)
        return [];
    },

    compress: true,  // ✅ BENAR

    compiler: {
        removeConsole:
            process.env.NODE_ENV === "production"
                ? { exclude: ["error", "warn"] }
                : false,
    },

    productionBrowserSourceMaps: false,  // ✅ BENAR - untuk security
};

export default nextConfig;
