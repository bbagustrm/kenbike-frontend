import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    images: {
        domains: ['kenbike.store', 'localhost'],
        remotePatterns: [
            // Development
            {
                protocol: 'http',
                hostname: 'localhost',
                port: '3000',
                pathname: '/uploads/**',
            },
            // Production
            {
                protocol: 'https',
                hostname: 'api.kenbike.store',
                pathname: '/uploads/**',
            },
        ],
    },
};

export default nextConfig;
