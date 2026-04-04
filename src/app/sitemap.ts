import { MetadataRoute } from 'next'
import { storage } from '@/lib/storage'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const shopUrl = process.env.NEXT_PUBLIC_SHOP_URL || 'https://afratechpoint.shop'
  const lastModified = new Date()

  // Base routes
  const routes = [
    '',
    '/shop',
    '/contact',
    '/about',
    '/terms',
  ].map((route) => ({
    url: `${shopUrl}${route}`,
    lastModified,
    changeFrequency: 'daily' as const,
    priority: route === '' ? 1 : 0.8,
  }))

  try {
    const products = await storage.getProducts()
    const productRoutes = products.map((product: any) => {
      let productDate = lastModified;
      if (product.updatedAt) {
        try {
          const parsed = new Date(product.updatedAt?.seconds ? product.updatedAt.seconds * 1000 : product.updatedAt);
          if (!isNaN(parsed.getTime())) {
            productDate = parsed;
          }
        } catch(e) {}
      }
      return {
        url: `${shopUrl}/shop/${product.id}`,
        lastModified: productDate,
        changeFrequency: 'weekly' as const,
        priority: 0.6,
      };
    })

    return [...routes, ...productRoutes]
  } catch (error) {
    console.error('[Sitemap] Fetch error:', error)
    return routes
  }
}
