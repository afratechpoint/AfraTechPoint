// ── Admin Panel: Shared TypeScript Types ──────────────────────────
// Single source of truth for product-related types in the admin panel.

export interface Variant {
  id: string;
  name: string;
  regularPrice?: number;
  salePrice?: number;
  image?: string;
  /** If true, this variant inherits the main product price */
  useMainPrice?: boolean;
}

export interface Specification {
  label: string;
  value: string;
}

export interface Product {
  id: string;
  name: string;
  /** Full / regular price */
  regularPrice: number;
  /** Sale price — when present it is the active selling price */
  salePrice?: number;
  /** @deprecated Use regularPrice */
  price?: number;
  category: string;
  /** Main (hero) image URL */
  image: string;
  /** Extra gallery images */
  gallery?: string[];
  /** Short "About This Item" blurb */
  aboutItem?: string;
  /** Full product description */
  description: string;
  /** Key-value specification pairs */
  specifications?: Specification[];
  /** Product variants (colours, storage sizes, models…) */
  variants?: Variant[];
  /** Total stock available */
  stock?: number;
  /** Rating out of 5 */
  rating?: number;
}
