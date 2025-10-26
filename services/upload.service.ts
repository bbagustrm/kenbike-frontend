import apiClient from "@/lib/api-client";
import { UploadFolder, UploadResponse, MultipleUploadResponse } from "@/types/upload";

export class UploadService {
    /**
     * Upload single image
     */
    static async uploadImage(
        file: File,
        folder: UploadFolder
    ): Promise<UploadResponse> {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder", folder);

        const response = await apiClient.post<UploadResponse>(
            "/upload/image",
            formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            }
        );

        return response.data;
    }

    /**
     * Upload multiple images
     */
    static async uploadImages(
        files: File[],
        folder: UploadFolder
    ): Promise<MultipleUploadResponse> {
        const formData = new FormData();
        files.forEach((file) => {
            formData.append("files", file);
        });
        formData.append("folder", folder);

        const response = await apiClient.post<MultipleUploadResponse>(
            "/upload/images",
            formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            }
        );

        return response.data;
    }

    /**
     * Upload profile image (shorthand)
     */
    static async uploadProfile(file: File): Promise<UploadResponse> {
        const formData = new FormData();
        formData.append("file", file);

        const response = await apiClient.post<UploadResponse>(
            "/upload/profile",
            formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            }
        );

        return response.data;
    }

    /**
     * Upload product image (shorthand)
     */
    static async uploadProduct(file: File): Promise<UploadResponse> {
        const formData = new FormData();
        formData.append("file", file);

        const response = await apiClient.post<UploadResponse>(
            "/upload/product",
            formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            }
        );

        return response.data;
    }

    /**
     * Upload variant images (shorthand)
     */
    static async uploadVariants(files: File[]): Promise<MultipleUploadResponse> {
        const formData = new FormData();
        files.forEach((file) => {
            formData.append("files", file);
        });

        const response = await apiClient.post<MultipleUploadResponse>(
            "/upload/variants",
            formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            }
        );

        return response.data;
    }
}