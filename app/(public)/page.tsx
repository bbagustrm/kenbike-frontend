"use client";

import Image from "next/image";
import Link from "next/link";
import { MoveRight, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

// ProductCard Component
interface ProductCardProps {
  name: string;
  price: string;
  image: string;
  rating: number;
  reviews: number;
  colors: string[];
}

function ProductCard({
  name,
  price,
  image,
  rating,
  reviews,
  colors,
}: ProductCardProps) {
  return (
    <Card className="w-full rounded-lg border shadow-sm hover:shadow-md transition">
      <CardContent className="p-2">
        {/* Product Image (1:1 aspect) */}
        <div className="relative w-full aspect-square">
          <Image
            src={image}
            alt={name}
            fill
            className="object-contain rounded-md"
          />
        </div>

        {/* Name & Price */}
        <div className="mt-2">
          <p className="text-sm font-medium text-gray-800">{name}</p>
          <p className="text-sm font-semibold text-gray-900">{price}</p>
        </div>
      </CardContent>

      <CardFooter className="flex flex-row items-center justify-between px-3 pb-3">
        {/* Rating */}
        <div className="flex items-center text-xs text-blue-600">
          <Star className="h-4 w-4 fill-blue-500 text-blue-500 mr-1" />
          <span>{rating.toFixed(1)}</span>
          <span className="ml-1 text-gray-500">({reviews})</span>
        </div>

        {/* Colors */}
        <div className="flex gap-1">
          {colors.map((c, i) => (
            <span
              key={i}
              className="h-3 w-3 rounded-full border"
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      </CardFooter>
    </Card>
  );
}

// Home Page
export default function Home() {
  // Dummy product (Bullmoose Bar)
  const product = {
    name: "Bullmoose Bar",
    price: "Rp. 319.000",
    image: "/bullmoose.jpg", // ganti sesuai path gambar kamu
    rating: 5.0,
    reviews: 12,
    colors: ["#5c4b3b", "#000000", "#c0c0c0", "#ffffff"],
  };

  // Gandakan produk agar ada banyak data
  const products = Array.from({ length: 15 }, () => product);

  return (
    <div className="h-full">
      {/* Banner Carousel */}
      <Carousel className="container flex-col mx-auto justify-center w-full p-2 sm:container md:container lg:container">
        <CarouselContent>
          {products.slice(0, 3).map((p, index) => (
            <CarouselItem key={index}>
              <div className="p-1">
                <Card className="relative w-full rounded-lg border shadow-sm hover:shadow-md transition">
                  <CardContent className="p-0">
                    {/* Banner Image (wide aspect) */}
                    <div className="relative w-full h-[400px]">
                      <Image
                        src={p.image}
                        alt={p.name}
                        fill
                        className="object-cover rounded-md"
                      />
                    </div>

                    {/* Overlay Info (nama & harga) */}
                    <div className="container w-full mx-auto flex-col absolute bottom-0 left-0 right-0 bg-black/40 text-white p-4 rounded-b-md">
                      <p className="text-lg font-bold">{p.name}</p>
                      <p className="text-md font-semibold">{p.price}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>

      {/* Section Header */}
      <div className="container flex flex-row justify-between items-center mx-auto my-2 font-bold">
        <span>New Release</span>
        <Button variant="link" className="text-blue-400 underline font-bold">
          <Link href="/products">
            See More <MoveRight className="inline-block w-4 h-4" />
          </Link>
        </Button>
      </div>

      {/* Product Carousel */}
      <Carousel
        opts={{ align: "start" }}
        className="container flex-col mx-auto justify-center w-full p-2 sm:container md:container lg:container"
      >
        <CarouselContent>
          {products.map((p, index) => (
            <CarouselItem key={index} className="md:basis-1/3 lg:basis-1/5">
              <div className="p-1">
                <ProductCard {...p} />
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious />
        <CarouselNext />
      </Carousel>

      {/* All Products Grid */}
      <div className="container mx-auto my-6">
        <h2 className="text-lg font-bold mb-4 text-center">All Products</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:container md:container lg:container">
          {products.map((p, i) => (
            <ProductCard key={i} {...p} />
          ))}
        </div>

        {/* Tombol Semua Produk */}
        <div className="flex justify-center mt-6">
          <Button asChild variant="outline">
            <Link href="/products">Semua Produk →</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
