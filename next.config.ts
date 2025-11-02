import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    images: {
        domains: ['kenbike.store', 'localhost'],
        remotePatterns: [
            // ✅ Local Development
            {
                protocol: 'http',
                hostname: 'localhost',
                port: '3000',
                pathname: '/uploads/**',
            },
            // ✅ Production API Server
            {
                protocol: 'https',
                hostname: 'api.kenbike.store',
                pathname: '/uploads/**',
            },
            // ✅ Production Main Domain
            {
                protocol: 'https',
                hostname: 'kenbike.store',
                pathname: '/uploads/**',
            },
        ],
    },
};

export default nextConfig;
