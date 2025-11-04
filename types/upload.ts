// Upload folder types
export type UploadFolder = 'profiles' | 'products' | 'variants'| "gallery" | 'reviews';

// Upload response
export interface UploadResponse {
    message: string;
    data: {
        url: string;
        filename: string;
        size: number;
    };
}

// Multiple upload response
export interface MultipleUploadResponse {
    message: string;
    data: {
        urls: string[];
        count: number;
    };
}

// Upload progress
export interface UploadProgress {
    loaded: number;
    total: number;
    percentage: number;
}

// Image preview data
export interface ImagePreview {
    file: File;
    preview: string;
    url?: string;
    uploading?: boolean;
    uploaded?: boolean;
    error?: string;
}