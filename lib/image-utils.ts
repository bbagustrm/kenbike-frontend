// lib/image-utils.ts

/**
 *
 * Development:
 * - Return: /uploads/products/uuid.webp (relative)
 * - Next.js proxy handles the request
 *
 * Production:
 * - Return: https://api.kenbike.store/uploads/products/uuid.webp (full URL)
 * - Direct access to backend
 */
export function getImageUrl(imageUrl: string | null | undefined): string | undefined {
    if (!imageUrl) return undefined;

    // Jika sudah full URL (http/https), return as is
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
        return imageUrl;
    }

    // Jika relative path (/uploads/...)
    if (imageUrl.startsWith('/uploads')) {
        // ✅ CRITICAL FIX: Production MUST use full URL
        const isDevelopment = process.env.NODE_ENV === 'development';

        if (isDevelopment) {
            // Development: Return relative path (Next.js proxy will handle)
            return imageUrl;
        } else {
            // ✅ Production: ALWAYS return full URL
            const baseUrl = process.env.NEXT_PUBLIC_IMAGE_BASE_URL || 'https://api.kenbike.store';
            return `${baseUrl}${imageUrl}`;
        }
    }

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
 * ✅ FIXED: Normalize URL untuk backend submission
 *
 * Backend menyimpan relative paths di database: /uploads/products/uuid.webp
 * Function ini convert backend response ke format yang konsisten
 */
export function normalizeImageUrl(url: string | null | undefined): string | undefined {
    if (!url) return undefined;

    // Jika sudah full URL, extract pathname saja
    if (url.startsWith('http://') || url.startsWith('https://')) {
        try {
            const urlObj = new URL(url);
            // Return pathname: /uploads/products/uuid.webp
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