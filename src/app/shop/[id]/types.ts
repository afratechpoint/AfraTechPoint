// ── TypeScript interfaces shared across the product detail page ──

export interface Variant {
  id: string;
  name: string;
  regularPrice?: number;
  salePrice?: number;
  image?: string;
}

export interface Specification {
  label: string;
  value: string;
}

export interface Product {
  id: string;
  name: string;
  brand?: string;
  /** Primary regular / full price */
  regularPrice: number;
  /** Sale / discounted price — show as active price when present */
  salePrice?: number;
  /** @deprecated use regularPrice */
  price?: number;
  category: string;
  /** Primary (hero) image URL */
  image: string;
  /** Additional gallery images uploaded via admin panel */
  gallery?: string[];
  /** Short summary shown below product title */
  aboutItem?: string;
  /** Full description shown in the Description tab */
  description: string;
  /** Key-value pairs shown in the Specifications tab */
  specifications?: Specification[];
  /** Product variants (colors, sizes, models, etc.) */
  variants?: Variant[];
  /** Rating out of 5 */
  rating?: number;
  /** Total number of reviews */
  reviewCount?: number;
  /** Available stock quantity */
  stock?: number;
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  variantName?: string;
  quantity: number;
}
