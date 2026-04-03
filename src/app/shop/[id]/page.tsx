// ── Product Detail Page — Server Wrapper ──────────────────────
// This server component exists solely to generate dynamic OG/Twitter
// metadata for each product, so that Facebook, WhatsApp, Twitter, etc.
// can show the product image and title when the link is shared.
//
// The actual UI is rendered by ProductDetailClient (a client component).

import type { Metadata } from "next";
import ProductDetailClient from "./ProductDetailClient";

const SHOP_URL = process.env.NEXT_PUBLIC_SHOP_URL || "https://afratechpoint.shop";

interface Props {
  params: { id: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const res = await fetch(`${SHOP_URL}/api/products/${params.id}`, {
      next: { revalidate: 3600 }, // cache for 1 hour
    });

    if (!res.ok) throw new Error("Not found");

    const product = await res.json();

    const title = product.name || "Product";
    const description =
      product.description?.substring(0, 160) ||
      `Buy ${product.name} at the best price.`;
    const price =
      product.salePrice ?? product.regularPrice ?? product.price ?? 0;
    const currency = "BDT";

    // Use the raw product image URL for OG — no ImageKit transforms
    // so that Facebook's crawler (which can't handle some redirects) can access it
    const imageUrl = product.image || `${SHOP_URL}/logo.png`;

    return {
      title: `${title} | Afra Tech Point`,
      description,
      openGraph: {
        type: "website",
        siteName: "Afra Tech Point",
        title,
        description,
        url: `${SHOP_URL}/shop/${params.id}`,
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
  } catch {
    // Fallback metadata if product fetch fails
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

export default function ProductDetailPage({ params }: Props) {
  return <ProductDetailClient />;
}
