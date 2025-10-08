"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProductCard } from "@/components/productcard";

const categories = ["Category 1", "Category 2", "Category 3"];
const activeFilters = [
  "All",
  "Price 60.000 - 240.000",
  "Including out of stock",
];

const products = Array.from({ length: 12 }, (_, index) => ({
  id: index,
  name: "Bullmoose Bar",
  price: "Rp. 319.000",
  image: "/bullmoose.jpg",
  rating: 5,
  reviews: 12,
  colors: ["#5c4b3b", "#000000", "#c0c0c0", "#ffffff"],
}));

const sortOptions = [
  { label: "Paling Sesuai", value: "relevance" },
  { label: "Pembelian Terbanyak", value: "best-seller" },
  { label: "Harga Tertinggi", value: "highest-price" },
  { label: "Harga Terendah", value: "lowest-price" },
];

export default function SearchPage() {
  const [sortBy, setSortBy] = useState(sortOptions[0].value);
  const [showAllProducts, setShowAllProducts] = useState(true);

  return (
    <div className="container mx-auto py-10">
      <nav className="mb-6 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
        <Link href="/" className="transition hover:text-foreground">
          Home
        </Link>
        <span>/</span>
        <Link href="/search" className="transition hover:text-foreground">
          Search
        </Link>
        <span>/</span>
        <span className="font-semibold text-foreground">All</span>
      </nav>

      <div className="flex flex-col gap-6 lg:flex-row">
        <aside className="lg:w-72">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Filter Products</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <p className="text-sm font-medium text-foreground">Category</p>
                <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                  {categories.map((category) => (
                    <li key={category}>
                      <button
                        type="button"
                        className="transition hover:text-foreground"
                      >
                        {category}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <div className="text-sm font-medium text-foreground">Price</div>
                <div className="mt-3 space-y-2">
                  <Input placeholder="Harga Minimum" type="number" min="0" />
                  <Input placeholder="Harga Maksimum" type="number" min="0" />
                </div>
              </div>

              <div>
                <button
                  type="button"
                  onClick={() => setShowAllProducts((prev) => !prev)}
                  className="flex w-full items-center gap-3 rounded-lg border px-3 py-3 text-left transition hover:border-foreground"
                >
                  <span
                    className={`relative inline-flex h-5 w-10 items-center rounded-full border transition ${
                      showAllProducts
                        ? "border-gray-900 bg-gray-900"
                        : "border-muted bg-muted"
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 rounded-full bg-white transition ${
                        showAllProducts ? "translate-x-5" : "translate-x-1"
                      }`}
                    />
                  </span>
                  <span>
                    <span className="block text-sm font-medium text-foreground">
                      Show All Products
                    </span>
                    <span className="block text-xs text-muted-foreground">
                      Including out of stock
                    </span>
                  </span>
                </button>
              </div>
            </CardContent>
          </Card>
        </aside>

        <section className="flex-1">
          <header className="flex flex-col gap-4 border-b pb-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <h1 className="text-lg font-semibold text-foreground">
                Showing 24 result from total 127 for &quot;All&quot;
              </h1>
              <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
                <span className="text-muted-foreground">Filter:</span>
                {activeFilters.map((filter) => (
                  <Badge
                    key={filter}
                    variant="secondary"
                    className="flex items-center gap-2 rounded-full px-3 py-1 text-xs"
                  >
                    {filter}
                    <button
                      type="button"
                      className="text-muted-foreground transition hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Sort by:</span>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </header>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))}
          </div>

          <footer className="mt-8 flex flex-wrap items-center justify-center gap-2 text-sm">
            <Button variant="ghost" className="flex items-center gap-1" size="sm">
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <Button variant="default" size="sm">
              1
            </Button>
            <Button variant="ghost" size="sm">
              2
            </Button>
            <Button variant="ghost" size="sm">
              3
            </Button>
            <span className="px-1">...</span>
            <Button variant="ghost" className="flex items-center gap-1" size="sm">
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </footer>
        </section>
      </div>
    </div>
  );
}
