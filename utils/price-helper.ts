export function getFinalPrice(product: {
    idPrice?: number;
    enPrice?: number;
    promotion?: {
        discount: number;
        endDate: string;
    } | null;
}, locale: string = "id"): number {
    const basePrice = locale === "id" ? product.idPrice : product.enPrice;
    if (!basePrice) return 0;

    const hasActivePromotion = product.promotion &&
        product.promotion.endDate &&
        new Date(product.promotion.endDate) > new Date();

    if (hasActivePromotion && product.promotion) {
        return basePrice * (1 - product.promotion.discount);
    }

    return basePrice;
}