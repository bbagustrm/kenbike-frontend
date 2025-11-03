import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    images: {
        unoptimized: true,
        remotePatterns: [
            {
                protocol: 'http',
                hostname: 'localhost',
                port: '3000',
                pathname: '/uploads/**',
            },
            {
                protocol: 'https',
                hostname: 'api.kenbike.store',
                pathname: '/uploads/**',
            },
            {
                protocol: 'https',
                hostname: 'kenbike.store',
                pathname: '/uploads/**',
            },
        ],
    },
};

export default nextConfig;
