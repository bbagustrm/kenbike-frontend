"use client";
import Image from "next/image";
import Link from "next/link";
import { Facebook, Instagram, Mail, Phone, MapPin } from "lucide-react";
import { useTranslation } from "@/hooks/use-translation";

export default function Footer() {
  const { t, locale } = useTranslation();

  const productCategories = [
    { name: "Stang", href: "/products/stang" },
    { name: "Rack", href: "/products/rack" },
    { name: "Centerpull", href: "/products/centerpull" },
    { name: "Merch", href: "/products/merch" },
    { name: "Accessories", href: "/products/accessories" },
  ];

  const customerService = [
    { name: t.footer.returns, href: "/help/returns" },
    { name: "FAQ", href: "/faq" },
  ];

  const aboutLinks = [
    { name: t.nav.about, href: "/about" },
    { name: t.nav.contact, href: "/contact" },
    { name: t.footer.privacyPolicy, href: "/privacy" },
    { name: t.footer.termsOfService, href: "/terms" },
  ];

  const socialMedia = [
    { name: "Facebook", icon: Facebook, href: "https://www.facebook.com/kenbike.632277/", color: "hover:text-blue-600 dark:hover:text-blue-400" },
    { name: "Instagram", icon: Instagram, href: "https://www.instagram.com/kenbike.id/", color: "hover:text-pink-600 dark:hover:text-pink-400" },
  ];

  return (
      <footer className="w-full border-t border-border bg-background text-foreground">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
            <div className="lg:col-span-2">
              <Link href="/" className="inline-block mb-4">
                <Image
                    src="/logo.webp"
                    alt="Kenbike Logo"
                    width={160}
                    height={160}
                    loading="lazy"
                    quality={85}
                />
              </Link>
              <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                {t.footer.description}
              </p>

              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-muted-foreground" />
                  <span className="text-muted-foreground">
                  {locale === "id"
                      ? "Jl. Contoh No. 123, Jakarta Selatan, Indonesia 12345"
                      : "Jl. Contoh No. 123, South Jakarta, Indonesia 12345"}
                </span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 flex-shrink-0 text-muted-foreground" />
                  <a href="tel:+6281234567890" className="text-muted-foreground hover:text-primary transition-colors">
                    +62 812-3456-7890
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4 flex-shrink-0 text-muted-foreground" />
                  <a href="mailto:info@kenbike.com" className="text-muted-foreground hover:text-primary transition-colors">
                    info@kenbike.com
                  </a>
                </div>
              </div>

              <div className="mt-6">
                <p className="font-semibold mb-3 text-sm uppercase tracking-wide">{t.footer.followUs}</p>
                <div className="flex gap-3">
                  {socialMedia.map((social) => (
                      <Link
                          key={social.name}
                          href={social.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center transition-colors ${social.color}`}
                          aria-label={social.name}
                      >
                        <social.icon className="w-5 h-5" />
                      </Link>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-4 text-sm uppercase tracking-wide">{t.footer.shop}</h3>
              <ul className="space-y-2.5">
                {productCategories.map((item) => (
                    <li key={item.name}>
                      <Link
                          href={item.href}
                          className="text-sm text-muted-foreground hover:text-primary transition-colors"
                      >
                        {item.name}
                      </Link>
                    </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4 text-sm uppercase tracking-wide">{t.footer.customerService}</h3>
              <ul className="space-y-2.5">
                {customerService.map((item) => (
                    <li key={item.name}>
                      <Link
                          href={item.href}
                          className="text-sm text-muted-foreground hover:text-primary transition-colors"
                      >
                        {item.name}
                      </Link>
                    </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4 text-sm uppercase tracking-wide">{t.footer.about}</h3>
              <ul className="space-y-2.5">
                {aboutLinks.map((item) => (
                    <li key={item.name}>
                      <Link
                          href={item.href}
                          className="text-sm text-muted-foreground hover:text-primary transition-colors"
                      >
                        {item.name}
                      </Link>
                    </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Payment & Marketplace dengan lazy loading */}
          <div className="mt-12 pt-8 border-t border-border">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-semibold mb-4 text-sm uppercase tracking-wide">
                  {t.footer.officialStores}
                </h3>
                <div className="flex flex-wrap gap-4">
                  <Link
                      href="https://www.tokopedia.com/kenbike"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:border-primary hover:shadow-sm transition-all bg-card"
                  >
                    {/* ✅ Lazy load marketplace icons */}
                    <Image
                        src="/ic-tokopedia.webp"
                        alt="Tokopedia"
                        width={24}
                        height={24}
                    />
                    <span className="text-sm font-medium">Tokopedia</span>
                  </Link>
                  <Link
                      href="https://shopee.co.id/kenbike.id"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:border-primary hover:shadow-sm transition-all bg-card"
                  >
                    <Image
                        src="/ic-shopee.webp"
                        alt="Shopee"
                        width={24}
                        height={24}
                        loading="lazy"
                    />
                    <span className="text-sm font-medium">Shopee</span>
                  </Link>
                </div>
              </div>

              {/* ✅ Payment methods dengan lazy loading */}
              <div>
                <h3 className="font-semibold mb-4 text-sm uppercase tracking-wide">
                  {t.footer.paymentMethods}
                </h3>
                <div className="space-y-8">
                  <div className="flex flex-wrap items-center gap-5">
                    <Image src="/ic-bni.webp" alt="BNI" width={60} height={20} loading="lazy" />
                    <Image src="/ic-bri.webp" alt="BRI" width={60} height={20} loading="lazy" />
                    <Image src="/ic-mandiri.webp" alt="Mandiri" width={80} height={20} loading="lazy" />
                    <Image src="/ic-cimbniaga.webp" alt="CIMB" width={100} height={20} loading="lazy" />
                    <Image src="/ic-permatabank.webp" alt="Permata" width={100} height={20} loading="lazy" />
                  </div>
                  <div className="flex flex-wrap items-center gap-5">
                    <Image src="/ic-gopay.webp" alt="Gopay" width={80} height={20} loading="lazy" />
                    <Image src="/ic-qris.webp" alt="QRIS" width={50} height={20} loading="lazy" />
                    <Image src="/ic-paypal.webp" alt="Paypal" width={70} height={30} loading="lazy" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-border bg-muted/50">
          <div className="container mx-auto px-4 py-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
              <p>
                © {new Date().getFullYear()} Kenbike. {t.footer.copyright}.
              </p>
              <div className="flex flex-wrap items-center gap-6">
                <Link href="/privacy" className="hover:text-primary transition-colors">
                  {t.footer.privacyPolicy}
                </Link>
                <Link href="/terms" className="hover:text-primary transition-colors">
                  {t.footer.termsOfService}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
  );
}