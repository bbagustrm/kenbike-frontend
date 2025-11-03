import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    images: {
        remotePatterns: [
            // Local Development (HTTP)
            {
                protocol: 'http',
                hostname: 'localhost',
                port: '3000',
                pathname: '/uploads/**',
            },
            // Production API (HTTPS) - ✅ TAMBAHKAN INI
            {
                protocol: 'https',
                hostname: 'api.kenbike.store',
                pathname: '/uploads/**',
            },
            // Production Main (HTTPS)
            {
                protocol: 'https',
                hostname: 'kenbike.store',
                pathname: '/uploads/**',
            },
        ],
    },
};

export default nextConfig;
