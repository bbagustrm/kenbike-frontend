"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Facebook, Instagram } from "lucide-react";


export default function Footer() {
  return (
    <footer className="w-full border-t bg-white text-black">
      <div className="container mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-4 gap-8 text-left">
        {/* Logo & Deskripsi */}
        <div>
          <Link href="/" className="">
            <Image src="/logo.png" alt="Logo" width={100} height={100} />
          </Link>
          <p className="mt-4 text-sm text-gray-600">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas
            mattis libero et semper molestie. Proin varius dui ex, vel dignissim
            risus mollis sit amet.
          </p>
          <div className="mt-4">
            <span className="font-semibold">FOLLOW US</span>
            <div className="flex gap-3 mt-2">
              <Link href="https://facebook.com" target="_blank">
                <Facebook className="w-5 h-5" />
              </Link>
              <Link href="https://instagram.com" target="_blank">
                <Instagram className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Shop */}
        <div>
          <h3 className="font-semibold mb-2">Shop</h3>
          <ul className="space-y-1 text-sm">
            <li>
              <Link href="/products/stang">Stang</Link>
            </li>
            <li>
              <Link href="/products/rack">Rack</Link>
            </li>
            <li>
              <Link href="/products/centerpull">Centerpull</Link>
            </li>
            <li>
              <Link href="/products/merch">Merch</Link>
            </li>
          </ul>
        </div>

        {/* Domestic Store */}
        <div>
          <h3 className="font-semibold mb-2">Domestic Store</h3>
          <div className="flex flex-col gap-2">
            <Button
              asChild
              variant="link"
              className="flex items-center gap-2 p-0 h-auto"
            >
              <Link href="https://www.tokopedia.com/kenbike" target="_blank">
                <Image
                  src="/tokopedia.png"
                  alt="Tokopedia"
                  width={24}
                  height={24}
                />
                Tokopedia
              </Link>
            </Button>
            <Button
              asChild
              variant="link"
              className="flex items-center gap-2 p-0 h-auto"
            >
              <Link href="https://shopee.co.id/kenbike.id" target="_blank">
                <Image src="/shopee.png" alt="Shopee" width={24} height={24} />
                Shopee
              </Link>
            </Button>
          </div>
        </div>

        {/* Payment */}
        <div>
          <h3 className="font-semibold mb-2">Payment</h3>
          <div className="flex flex-wrap items-center gap-3">
            <Image src="/bni.png" alt="BNI" width={50} height={20} />
            <Image src="/bri.png" alt="BRI" width={50} height={20} />
            <Image src="/mandiri.png" alt="Mandiri" width={50} height={20} />
            <Image src="/cimb.png" alt="CIMB" width={50} height={20} />
            <Image src="/permata.png" alt="Permata" width={50} height={20} />
            <Image src="/gopay.png" alt="Gopay" width={50} height={20} />
            <Image src="/qris.png" alt="QRIS" width={50} height={20} />
          </div>
          <div className="mt-3">
            <Image src="/paypal.png" alt="Paypal" width={70} height={30} />
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="border-t py-4 text-center text-sm text-gray-500">
        © 2025 Kenbike - All rights reserved
      </div>
    </footer>
  );
}
