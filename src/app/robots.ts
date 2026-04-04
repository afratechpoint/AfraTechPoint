import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const shopUrl = process.env.NEXT_PUBLIC_SHOP_URL || 'https://afratechpoint.shop'
  
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/admin/',
        '/api/',
        '/account/',
        '/_next/',
      ],
    },
    sitemap: `${shopUrl}/sitemap.xml`,
  }
}
