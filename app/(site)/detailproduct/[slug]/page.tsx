"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Star, ArrowLeft, ArrowRight } from "lucide-react";

type GalleryItem = {
  id: number;
  src: string;
  alt: string;
};

type ProductDetail = {
  slug: string;
  name: string;
  category: string;
  tag: string;
  price: number;
  originalPrice: number;
  stock: number;
  stockLabel: string;
  colors: { label: string; value: string }[];
  gallery: GalleryItem[];
  promo: {
    title: string;
    description: string;
    discountLabel: string;
  };
  description: string;
  technicalDetails: string[][];
  rating: number;
  ratingBreakdown: Record<1 | 2 | 3 | 4 | 5, number>;
  reviews: Array<{
    id: number;
    author: string;
    role: string;
    rating: number;
    comment: string;
    date: string;
  }>;
};

const rupiah = (value: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" })
    .format(value)
    .replace(",00", "");

const products: ProductDetail[] = [
  {
    slug: "bullmoose-bar",
    name: "Bullmoose Bar",
    category: "Handlebar",
    tag: "Hot Sale",
    price: 320_000,
    originalPrice: 499_000,
    stock: 4,
    stockLabel: "Only 4 left in stock!",
    colors: [
      { label: "Black", value: "#0f172a" },
      { label: "Silver", value: "#d4d4d8" },
      { label: "Copper", value: "#b05f3c" },
    ],
    gallery: [
      { id: 1, src: "/images/bullmoose.png", alt: "Bullmoose bar front" },
      { id: 2, src: "/images/bullmoose.png", alt: "Bullmoose bar angle" },
      { id: 3, src: "/images/bullmoose.png", alt: "Bullmoose bar detail" },
      { id: 4, src: "/images/bullmoose.png", alt: "Bullmoose bar mount" },
    ],
    promo: {
      title: "SPECIAL PROMO",
      description: "Lorem ipsum dolor sit amet",
      discountLabel: "-20%",
    },
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris urna nibh, consequat ut lorem eget, elementum pellentesque magna. Vestibulum pretium augue vehicula nisl elementum venenatis. Nullam pretium sapien et vestibulum molestie.",
    technicalDetails: [
      ["Material", "Alloy Steel"],
      ["Width", "780 mm"],
      ["Clamp Diameter", "31.8 mm"],
      ["Rise", "45 mm"],
      ["Weight", "310 gram"],
      ["Suitable For", "MTB, Touring"],
    ],
    rating: 4.3,
    ratingBreakdown: {
      5: 4,
      4: 3,
      3: 1,
      2: 0,
      1: 0,
    },
    reviews: [
      {
        id: 1,
        author: "User 1",
        role: "Verified buyer",
        rating: 5,
        comment:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Duis lacinia laoreet fringilla.",
        date: "January 9, 2024",
      },
      {
        id: 2,
        author: "User 2",
        role: "Verified buyer",
        rating: 4,
        comment:
          "Sturdy handlebar with great finish. Sangat nyaman dipakai touring panjang.",
        date: "January 6, 2024",
      },
    ],
  },
];

const getInitials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .map((n) => n[0]?.toUpperCase() ?? "")
    .join("");

function RatingStars({ value, size = 18 }: { value: number; size?: number }) {
  const filledStars = Math.floor(value);
  const hasPartial = value % 1 >= 0.5;
  const totalStars = 5;

  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: totalStars }, (_, index) => {
        const starFilled = index < filledStars;
        const starHalf = index === filledStars && hasPartial;
        return (
          <Star
            key={index}
            className="text-yellow-500"
            size={size}
            strokeWidth={starFilled || starHalf ? 0 : 1.5}
            fill={starFilled || starHalf ? "#facc15" : "transparent"}
          />
        );
      })}
    </div>
  );
}

function RatingBar({ label, value, total }: { label: number; value: number; total: number }) {
  const percentage = total === 0 ? 0 : Math.round((value / total) * 100);
  return (
    <div className="flex items-center gap-3 text-sm text-gray-600">
      <span className="w-8 font-medium">{label} star</span>
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-200">
        <div
          className="h-full rounded-full bg-yellow-400"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className="w-6 text-right text-xs text-gray-500">{value}</span>
    </div>
  );
}

export default function DetailProductPage() {
  const params = useParams();
  const slug = (params as { slug?: string })?.slug ?? "";
  const product = products.find((item) => item.slug === slug);
  const [activeImage, setActiveImage] = useState<GalleryItem | null>(
    product?.gallery[0] ?? null
  );
  const [selectedColor, setSelectedColor] = useState(product?.colors[0] ?? null);
  const [quantity, setQuantity] = useState(1);

  const totalReviews = useMemo(
    () => (product ? Object.values(product.ratingBreakdown).reduce((acc, cur) => acc + cur, 0) : 0),
    [product]
  );

  const subtotal = useMemo(() => {
    if (!product) return 0;
    return product.price * quantity;
  }, [product, quantity]);

  if (!product) {
    return (
      <div className="container mx-auto py-24 text-center text-lg font-semibold">
        Produk tidak ditemukan.
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10 lg:px-6">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm text-gray-500">
        <Link href="/" className="hover:text-gray-800">
          Home
        </Link>
        <span className="mx-2">/</span>
        <Link href="/products" className="hover:text-gray-800">
          Product
        </Link>
        <span className="mx-2">/</span>
        <span className="text-gray-800 font-medium">{product.name}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,2.2fr)_minmax(0,1fr)]">
        {/* Left content */}
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-[120px_1fr]">
            {/* Thumbnails */}
            <div className="flex sm:flex-col gap-3 order-2 sm:order-1">
              {product.gallery.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveImage(item)}
                  className={`flex-1 overflow-hidden rounded-lg border transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 sm:flex-none ${
                    activeImage?.id === item.id ? "border-gray-900" : "border-gray-200"
                  }`}
                >
                  <Image
                    src={item.src}
                    alt={item.alt}
                    width={120}
                    height={120}
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>

            {/* Main image */}
            <div className="relative flex items-center justify-center overflow-hidden rounded-xl border border-gray-200 bg-white p-6 sm:order-2">
              <button
                type="button"
                className="absolute left-4 top-1/2 -translate-y-1/2 rounded-full border border-gray-200 bg-white p-2 shadow-sm transition hover:bg-gray-100"
                onClick={() => {
                  if (!activeImage) return;
                  const currentIndex = product.gallery.findIndex((item) => item.id === activeImage.id);
                  const prevIndex = (currentIndex - 1 + product.gallery.length) % product.gallery.length;
                  setActiveImage(product.gallery[prevIndex]);
                }}
              >
                <ArrowLeft className="h-4 w-4" />
              </button>

              {activeImage ? (
                <Image
                  src={activeImage.src}
                  alt={activeImage.alt}
                  width={420}
                  height={420}
                  className="max-h-[360px] w-auto"
                />
              ) : null}

              <button
                type="button"
                className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full border border-gray-200 bg-white p-2 shadow-sm transition hover:bg-gray-100"
                onClick={() => {
                  if (!activeImage) return;
                  const currentIndex = product.gallery.findIndex((item) => item.id === activeImage.id);
                  const nextIndex = (currentIndex + 1) % product.gallery.length;
                  setActiveImage(product.gallery[nextIndex]);
                }}
              >
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Promo banner */}
          <div className="flex items-center justify-between gap-4 rounded-xl border border-gray-200 bg-white p-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
                {product.promo.title}
              </p>
              <p className="text-sm text-gray-700">{product.promo.description}</p>
            </div>
            <span className="text-2xl font-bold text-green-600">
              {product.promo.discountLabel}
            </span>
          </div>

          <Separator />

          {/* Description */}
          <section className="space-y-3">
            <header className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Description</h2>
            </header>
            <p className="text-sm leading-relaxed text-gray-600">{product.description}</p>
          </section>

          <Separator />

          {/* Technical Details */}
          <section className="space-y-3">
            <header className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Technical Details</h2>
            </header>
            <div className="overflow-hidden rounded-xl border border-gray-200">
              <table className="w-full text-sm">
                <tbody>
                  {product.technicalDetails.map(([label, value], index) => (
                    <tr key={index} className="even:bg-gray-50">
                      <td className="w-1/2 px-4 py-3 font-medium text-gray-700">{label}</td>
                      <td className="px-4 py-3 text-gray-600">{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <Separator />

          {/* Reviews */}
          <section className="space-y-6">
            <header>
              <h2 className="text-lg font-semibold text-gray-900">Reviews</h2>
            </header>

            <div className="grid gap-6 rounded-xl border border-gray-200 bg-white p-6 md:grid-cols-[180px_1fr]">
              <div className="flex flex-col items-center justify-center gap-2 text-center">
                <span className="text-4xl font-bold text-gray-900">
                  {product.rating.toFixed(1)}
                </span>
                <RatingStars value={product.rating} size={22} />
                <p className="text-xs text-gray-500">{totalReviews} reviews</p>
              </div>

              <div className="space-y-2">
                {(Object.keys(product.ratingBreakdown) as Array<keyof ProductDetail["ratingBreakdown"]>)
                  .sort((a, b) => Number(b) - Number(a))
                  .map((rating) => (
                    <RatingBar
                      key={rating}
                      label={Number(rating)}
                      value={product.ratingBreakdown[rating]}
                      total={totalReviews}
                    />
                  ))}
              </div>
            </div>

            <div className="space-y-4">
              {product.reviews.map((review) => (
                <div
                  key={review.id}
                  className="rounded-xl border border-gray-200 bg-white p-5"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10 text-sm">
                        <AvatarFallback>{getInitials(review.author)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">
                          {review.author}
                        </p>
                        <p className="text-xs text-gray-500">{review.role}</p>
                      </div>
                    </div>
                    <p className="text-xs text-gray-400">{review.date}</p>
                  </div>
                  <div className="mt-3 flex items-center gap-2">
                    <RatingStars value={review.rating} size={16} />
                    <span className="text-xs font-medium text-gray-600">
                      {review.rating.toFixed(1)} / 5
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-gray-600">
                    {review.comment}
                  </p>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right sidebar */}
        <aside className="h-fit rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex flex-wrap items-center gap-2 text-xs uppercase tracking-widest text-gray-400">
            <span>{product.category}</span>
            <span className="rounded-full bg-gray-900 px-2 py-0.5 text-white">
              {product.tag}
            </span>
          </div>

          <h1 className="mt-3 text-2xl font-semibold text-gray-900">
            {product.name}
          </h1>

          <div className="mt-4 space-y-1">
            <div className="flex items-center gap-3">
              <span className="text-2xl font-bold text-gray-900">
                {rupiah(product.price)}
              </span>
              <span className="text-sm text-gray-400 line-through">
                {rupiah(product.originalPrice)}
              </span>
            </div>
            <p className="text-sm">
              Stock: <span className="font-semibold text-gray-900">{product.stock}</span>
              <span className="ml-2 text-sm font-medium text-red-500">
                {product.stockLabel}
              </span>
            </p>
          </div>

          <Separator className="my-6" />

          <div className="space-y-4">
            <div className="space-y-3">
              <p className="text-sm font-semibold text-gray-800">Choose color: {selectedColor?.label}</p>
              <div className="flex gap-3">
                {product.colors.map((color) => {
                  const isActive = selectedColor?.value === color.value;
                  return (
                    <button
                      key={color.value}
                      type="button"
                      onClick={() => setSelectedColor(color)}
                      className={`flex h-10 w-10 items-center justify-center rounded-full border transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60 ${
                        isActive ? "border-gray-900" : "border-gray-300"
                      }`}
                    >
                      <span
                        className="h-7 w-7 rounded-full border border-white"
                        style={{ backgroundColor: color.value }}
                        aria-label={color.label}
                      />
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-3">
              <p className="text-sm font-semibold text-gray-800">Quantity</p>
              <div className="flex items-center gap-4">
                <div className="flex items-center rounded-full border border-gray-200">
                  <button
                    type="button"
                    className="px-3 py-2 text-lg"
                    onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                    aria-label="Decrease quantity"
                  >
                    -
                  </button>
                  <span className="w-8 text-center text-sm font-semibold">{quantity}</span>
                  <button
                    type="button"
                    className="px-3 py-2 text-lg"
                    onClick={() => setQuantity((prev) => Math.min(product.stock, prev + 1))}
                    aria-label="Increase quantity"
                  >
                    +
                  </button>
                </div>
                <div className="text-sm text-gray-600">
                  Subtotal: <span className="font-semibold text-gray-900">{rupiah(subtotal)}</span>
                </div>
              </div>
            </div>

            <Button size="lg" className="w-full">
              Add to Cart
            </Button>
          </div>
        </aside>
      </div>
    </div>
  );
}
