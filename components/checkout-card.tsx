"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trash2, AlertTriangle, AlertCircle } from "lucide-react";
import { useState } from "react";

interface CheckoutCardProps {
  name: string;
  price: number;
  color: string;
  image: string;
  stock: "ready" | "low" | "out";
  qty: number;
}

export default function CheckoutCard({
  name,
  price,
  color,
  image,
  stock,
  qty,
}: CheckoutCardProps) {
  const [quantity, setQuantity] = useState(qty);

  const handleIncrease = () => {
    setQuantity((prev) => prev + 1);
  };

  const handleDecrease = () => {
    setQuantity((prev) => (prev > 1 ? prev - 1 : 1));
  };

  return (
    <Card className="w-full">
      <CardContent className="flex items-start gap-3 p-3">
        {/* Product Image */}
        <div className="relative w-20 h-20 flex-shrink-0">
          <Image
            src={image}
            alt={name}
            fill
            className="object-contain rounded"
          />
        </div>

        {/* Product Info */}
        <div className="flex-1">
          <div className="flex justify-between">
            <p className="font-medium text-sm">{name}</p>
            <button className="text-gray-500 hover:text-red-500">
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          {/* Color */}
          <Badge variant="secondary" className="mt-1">
            {color}
          </Badge>

          {/* Stock info */}
          {stock === "low" && (
            <div className="flex items-center gap-1 text-xs text-orange-500 mt-1">
              <AlertTriangle className="w-3 h-3" />
              Stok hampir habis
            </div>
          )}
          {stock === "out" && (
            <div className="flex items-center gap-1 text-xs text-red-500 mt-1">
              <AlertCircle className="w-3 h-3" />
              Stok habis
            </div>
          )}

          {/* Qty & Price */}
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="icon"
                className="h-6 w-6"
                onClick={handleDecrease}
              >
                -
              </Button>
              <span className="text-sm">{quantity}</span>
              <Button
                variant="outline"
                size="icon"
                className="h-6 w-6"
                onClick={handleIncrease}
              >
                +
              </Button>
            </div>
            <span className="font-semibold text-sm">
              Rp {(price * quantity).toLocaleString("id-ID")}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
