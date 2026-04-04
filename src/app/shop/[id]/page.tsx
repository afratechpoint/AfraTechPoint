// ── Product Detail Page — Server Wrapper ──────────────────────
// This server component exists solely to generate dynamic OG/Twitter
// metadata for each product, so that Facebook, WhatsApp, Twitter, etc.
// can show the product image and title when the link is shared.
//
// The actual UI is rendered by ProductDetailClient (a client component).

import type { Metadata } from "next";
import ProductDetailClient from "./ProductDetailClient";
import { storage } from "@/lib/storage";

const SHOP_URL = process.env.NEXT_PUBLIC_SHOP_URL || "https://afratechpoint.shop";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  try {
    const product = await storage.getProductById(id);
    if (!product) throw new Error("Not found");

    const title = product.name || "Product";
    const settings = await storage.getSettings();
    const siteName = settings.storeName || "Afra Tech Point";

    const description =
      product.description?.substring(0, 160) ||
      `Buy ${product.name} at the best price.`;
    const price =
      product.salePrice ?? product.regularPrice ?? product.price ?? 0;
    const currency = "BDT";

    // Use the raw product image URL for OG — ensuring it's absolute
    let imageUrl = product.image;
    if (imageUrl && !imageUrl.startsWith("http")) {
       // Combine with shop URL if it's relative
       imageUrl = `${SHOP_URL}${imageUrl.startsWith("/") ? "" : "/"}${imageUrl}`;
    }
    if (!imageUrl) imageUrl = `${SHOP_URL}/logo.png`;

    return {
      title: `${title} | ${siteName}`,
      description,
      openGraph: {
        type: "article",
        siteName,
        title,
        description,
        url: `${SHOP_URL}/shop/${id}`,
        images: [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: title,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: [imageUrl],
      },
      other: {
        // Rich product snippet for Facebook / WhatsApp
        "og:price:amount": String(price),
        "og:price:currency": currency,
      },
    };
  } catch (err) {
    console.error("[generateMetadata] Error:", err);
    // Fallback metadata if product lookup fails
    return {
      title: "Product | Afra Tech Point",
      description: "Shop electronics at Afra Tech Point.",
      openGraph: {
        title: "Afra Tech Point",
        description: "Shop electronics at Afra Tech Point.",
        images: [`${SHOP_URL}/logo.png`],
      },
    };
  }
}

export default async function ProductDetailPage({ params }: Props) {
  return <ProductDetailClient />;
}
