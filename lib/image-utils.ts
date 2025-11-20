// lib/image-utils.ts

/**
 * Get full image URL - Smart handling untuk dev & prod
 *
 * Development:
 * - Backend: http://localhost:3000
 * - Frontend: http://localhost:3001
 * - Next.js proxy: http://localhost:3001/uploads/* -> http://localhost:3000/uploads/*
 *
 * Production:
 * - Backend: https://api.kenbike.store
 * - Frontend: https://kenbike.store
 * - Direct access: https://api.kenbike.store/uploads/*
 */
export function getImageUrl(imageUrl: string | null | undefined): string | undefined {
    if (!imageUrl) return undefined;

    // Jika sudah full URL (http/https), return as is
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
        return imageUrl;
    }

    // Jika relative path (/uploads/...)
    if (imageUrl.startsWith('/uploads')) {
        const isDevelopment = process.env.NODE_ENV === 'development';

        if (isDevelopment) {
            // ✅ Development: Gunakan Next.js proxy (localhost:3001/uploads/...)
            // Next.js akan proxy request ke backend (localhost:3000)
            return imageUrl; // Just return the relative path
        } else {
            // ✅ Production: Prepend API base URL
            const baseUrl = process.env.NEXT_PUBLIC_IMAGE_BASE_URL || '';
            return `${baseUrl}${imageUrl}`;
        }
    }

    // Fallback: return as is
    return imageUrl;
}

/**
 * Get profile image URL with fallback
 */
export function getProfileImageUrl(
    imageUrl: string | null | undefined,
    fallbackUrl?: string
): string | undefined {
    const url = getImageUrl(imageUrl);
    return url || fallbackUrl;
}

/**
 * Validate image file before upload
 */
export function validateImageFile(
    file: File,
    maxSizeMB: number = 2
): { valid: boolean; error?: string } {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

    if (!allowedTypes.includes(file.type)) {
        return {
            valid: false,
            error: 'Only JPG, JPEG, PNG, and WEBP formats are allowed',
        };
    }

    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
        return {
            valid: false,
            error: `File size must not exceed ${maxSizeMB}MB`,
        };
    }

    return { valid: true };
}

/**
 * Format file size to human readable
 */
export function formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

/**
 * Create image preview from File
 */
export function createImagePreview(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

/**
 * ✅ NEW: Convert backend response URL to proper format
 * Backend bisa return:
 * - "/uploads/products/uuid.webp" (relative)
 * - "http://localhost:3000/uploads/products/uuid.webp" (absolute dev)
 * - "https://api.kenbike.store/uploads/products/uuid.webp" (absolute prod)
 */
export function normalizeImageUrl(url: string | null | undefined): string | undefined {
    if (!url) return undefined;

    // Jika sudah full URL, extract pathname
    if (url.startsWith('http://') || url.startsWith('https://')) {
        try {
            const urlObj = new URL(url);
            // Ambil pathname saja: /uploads/products/uuid.webp
            return urlObj.pathname;
        } catch (e) {
            console.error('Invalid URL:', url);
            return undefined;
        }
    }

    // Jika relative, pastikan dimulai dengan /
    if (!url.startsWith('/')) {
        return `/${url}`;
    }

    return url;
}