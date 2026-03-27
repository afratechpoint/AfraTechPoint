export function getShopUrl() {
  return process.env.NEXT_PUBLIC_SHOP_URL || 
         (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "https://afratechpoint.vercel.app");
}
