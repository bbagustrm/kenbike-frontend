import apiClient from "@/lib/api-client";
import {
    ProductListItem,
    CreateProductData,
    UpdateProductData,
    GetProductsParams,
    ProductsResponse,
    ProductResponse,
    ProductActionResponse,
    BulkActionResponse,
} from "@/types/product";

export class ProductService {
    // ==========================================
    // PUBLIC ENDPOINTS
    // ==========================================

    /**
     * Get all products (public)
     */
    static async getProducts(params?: GetProductsParams): Promise<ProductsResponse> {
        const response = await apiClient.get<ProductsResponse>("/products", { params });
        return response.data;
    }

    /**
     * Get product by slug (public)
     */
    static async getProductBySlug(slug: string): Promise<ProductResponse> {
        const response = await apiClient.get<ProductResponse>(`/products/${slug}`);
        return response.data;
    }

    /**
     * Get featured products
     */
    static async getFeaturedProducts(limit: number = 10): Promise<{ data: ProductListItem[] }> {
        const response = await apiClient.get<{ data: ProductListItem[] }>("/products/featured", {
            params: { limit },
        });
        return response.data;
    }

    /**
     * Get best sellers
     */
    static async getBestSellers(
        limit: number = 10,
        categorySlug?: string
    ): Promise<{ data: ProductListItem[] }> {
        const response = await apiClient.get<{ data: ProductListItem[] }>("/products/best-sellers", {
            params: { limit, categorySlug },
        });
        return response.data;
    }

    /**
     * Get trending products
     */
    static async getTrendingProducts(
        limit: number = 10,
        days: number = 7
    ): Promise<{ data: ProductListItem[] }> {
        const response = await apiClient.get<{ data: ProductListItem[] }>("/products/trending", {
            params: { limit, days },
        });
        return response.data;
    }

    // ==========================================
    // ADMIN ENDPOINTS
    // ==========================================

    /**
     * Get all products (admin) - includes deleted and inactive
     */
    static async getAdminProducts(params?: GetProductsParams): Promise<ProductsResponse> {
        const response = await apiClient.get<ProductsResponse>("/admin/products", { params });
        return response.data;
    }

    /**
     * Get product by ID (admin)
     */
    static async getProductById(id: string): Promise<ProductResponse> {
        const response = await apiClient.get<ProductResponse>(`/admin/products/${id}`);
        return response.data;
    }

    /**
     * Create product
     */
    static async createProduct(data: CreateProductData): Promise<ProductResponse> {
        const response = await apiClient.post<ProductResponse>("/admin/products", data);
        return response.data;
    }

    /**
     * Update product
     */
    static async updateProduct(id: string, data: UpdateProductData): Promise<ProductResponse> {
        const response = await apiClient.patch<ProductResponse>(`/admin/products/${id}`, data);
        return response.data;
    }

    /**
     * Soft delete product
     */
    static async deleteProduct(id: string): Promise<ProductActionResponse> {
        const response = await apiClient.delete<ProductActionResponse>(`/admin/products/${id}`);
        return response.data;
    }

    /**
     * Restore deleted product
     */
    static async restoreProduct(id: string): Promise<ProductResponse> {
        const response = await apiClient.post<ProductResponse>(`/admin/products/${id}/restore`);
        return response.data;
    }

    /**
     * Hard delete product (permanent)
     */
    static async hardDeleteProduct(id: string): Promise<ProductActionResponse> {
        const response = await apiClient.delete<ProductActionResponse>(`/admin/products/${id}/hard`);
        return response.data;
    }

    /**
     * Toggle product active status
     */
    static async toggleProductActive(id: string): Promise<ProductActionResponse> {
        const response = await apiClient.patch<ProductActionResponse>(
            `/admin/products/${id}/toggle-active`
        );
        return response.data;
    }

    /**
     * Toggle product featured status
     */
    static async toggleProductFeatured(id: string): Promise<ProductActionResponse> {
        const response = await apiClient.patch<ProductActionResponse>(
            `/admin/products/${id}/toggle-featured`
        );
        return response.data;
    }

    /**
     * Bulk delete products
     */
    static async bulkDeleteProducts(ids: string[]): Promise<BulkActionResponse> {
        const response = await apiClient.post<BulkActionResponse>("/admin/products/bulk-delete", {
            ids,
        });
        return response.data;
    }

    /**
     * Bulk restore products
     */
    static async bulkRestoreProducts(ids: string[]): Promise<BulkActionResponse> {
        const response = await apiClient.post<BulkActionResponse>("/admin/products/bulk-restore", {
            ids,
        });
        return response.data;
    }
}