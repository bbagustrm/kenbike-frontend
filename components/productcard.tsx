"use client";

import Image from "next/image";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Star } from "lucide-react";

interface ProductCardProps {
  name: string;
  price: string;
  image: string;
  rating: number;
  reviews: number;
  colors: string[];
}

export function ProductCard({
  name,
  price,
  image,
  rating,
  reviews,
  colors,
}: ProductCardProps) {
  return (
    <Card className="w-[180px] rounded-lg border shadow-sm hover:shadow-md transition">
      <CardContent className="flex flex-col items-center pt-4">
        {/* Product Image */}
        <div className="relative h-28 w-28">
          <Image src={image} alt={name} fill className="object-contain" />
        </div>

        {/* Product Name */}
        <p className="mt-3 text-sm font-medium text-center">{name}</p>

        {/* Price */}
        <p className="text-sm font-semibold text-gray-900">{price}</p>

        {/* Colors */}
        <div className="flex gap-2 mt-2">
          {colors.map((c, i) => (
            <span
              key={i}
              className="h-3 w-3 rounded-full border"
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      </CardContent>

      <CardFooter className="flex justify-center pb-3">
        <div className="flex items-center text-xs text-blue-600">
          <Star className="h-4 w-4 fill-blue-500 text-blue-500 mr-1" />
          <span>{rating.toFixed(1)}</span>
          <span className="ml-1 text-gray-500">({reviews})</span>
        </div>
      </CardFooter>
    </Card>
  );
}
