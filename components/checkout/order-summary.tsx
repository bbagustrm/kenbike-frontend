// components/checkout/order-summary.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { formatCurrency, calculateTax } from '@/lib/payment-utils';
import { ShippingOption } from '@/types/shipping';

// Definisikan tipe untuk promosi produk
interface ProductPromotion {
    isActive: boolean;
    discount: number;
}

// Definisikan tipe untuk produk
interface Product {
    idPrice: number;
    enPrice: number;
    promotion?: ProductPromotion;
}

// Definisikan tipe untuk item dalam keranjang
interface CartItem {
    product: Product;
    quantity: number;
}

interface OrderSummaryProps {
    // Ganti any[] dengan CartItem[]
    items: CartItem[];
    selectedShipping?: ShippingOption;
    currency: 'IDR' | 'USD';
    locale?: 'id' | 'en';
}

export function OrderSummary({
                                 items,
                                 selectedShipping,
                                 currency,
                                 locale = 'en'
                             }: OrderSummaryProps) {
    // Calculate subtotal
    const subtotal = items.reduce((sum, item) => {
        const price = locale === 'id' ? item.product.idPrice : item.product.enPrice;
        const hasPromotion = item.product.promotion?.isActive;
        const discount = hasPromotion ? item.product.promotion!.discount : 0;
        const finalPrice = price * (1 - discount);
        return sum + (finalPrice * item.quantity);
    }, 0);

    const shippingCost = selectedShipping?.price || 0;
    const tax = calculateTax(subtotal, currency);
    const total = subtotal + shippingCost + tax;

    return (
        <Card className="sticky top-24">
            <CardHeader>
                <CardTitle>
                    {locale === 'id' ? 'Ringkasan Pesanan' : 'Order Summary'}
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Items Count */}
                <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">
            {locale === 'id' ? 'Total Item' : 'Total Items'}
          </span>
                    <span className="font-medium">
            {items.reduce((sum, item) => sum + item.quantity, 0)} {locale === 'id' ? 'barang' : 'items'}
          </span>
                </div>

                <Separator />

                {/* Subtotal */}
                <div className="flex justify-between">
          <span className="text-muted-foreground">
            {locale === 'id' ? 'Subtotal' : 'Subtotal'}
          </span>
                    <span className="font-semibold">
            {formatCurrency(subtotal, currency)}
          </span>
                </div>

                {/* Shipping */}
                <div className="flex justify-between">
          <span className="text-muted-foreground">
            {locale === 'id' ? 'Ongkos Kirim' : 'Shipping'}
          </span>
                    {selectedShipping ? (
                        <span className="font-semibold">
              {formatCurrency(shippingCost, currency)}
            </span>
                    ) : (
                        <span className="text-xs text-muted-foreground">
              {locale === 'id' ? 'Pilih metode pengiriman' : 'Select shipping method'}
            </span>
                    )}
                </div>

                {/* Tax (only for IDR) */}
                {currency === 'IDR' && (
                    <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">
              {locale === 'id' ? 'PPN (11%)' : 'Tax (11%)'}
            </span>
                        <span className="font-medium">
              {formatCurrency(tax, currency)}
            </span>
                    </div>
                )}

                <Separator />

                {/* Total */}
                <div className="flex justify-between">
          <span className="text-lg font-bold">
            {locale === 'id' ? 'Total' : 'Total'}
          </span>
                    <span className="text-lg font-bold text-primary">
            {formatCurrency(total, currency)}
          </span>
                </div>

                {/* Shipping Info */}
                {selectedShipping && (
                    <div className="pt-4 space-y-2 text-xs text-muted-foreground border-t">
                        <div className="flex items-center justify-between">
                            <span>{locale === 'id' ? 'Kurir' : 'Courier'}:</span>
                            <span className="font-medium text-foreground">
                {selectedShipping.courierName}
              </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span>{locale === 'id' ? 'Layanan' : 'Service'}:</span>
                            <span className="font-medium text-foreground">
                {selectedShipping.description}
              </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span>{locale === 'id' ? 'Estimasi' : 'Estimate'}:</span>
                            <span className="font-medium text-foreground">
                {selectedShipping.estimatedDays} {locale === 'id' ? 'hari' : 'days'}
              </span>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}