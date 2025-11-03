// lib/image-utils.ts

/**
 * Get full image URL
 * Backend returns: http://localhost:3000/uploads/profiles/uuid.jpg
 * We need to ensure it's accessible from frontend
 */
export function getImageUrl(imageUrl: string | null | undefined): string | undefined {
    if (!imageUrl) return undefined;

    // If it's already a full URL (http/https), return as is
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
        return imageUrl;
    }

    // If it's a relative path, prepend base URL
    if (imageUrl.startsWith('/uploads')) {
        const baseUrl = process.env.NEXT_PUBLIC_IMAGE_BASE_URL || '';
        return `${baseUrl}${imageUrl}`;
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