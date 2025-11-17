import { prisma } from '@/lib/prisma';
import type { MetadataRoute } from 'next';

const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL || 'https://careandcleannp.com';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/`, changeFrequency: 'weekly', priority: 1 },
    { url: `${BASE_URL}/products`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${BASE_URL}/about`, changeFrequency: 'monthly', priority: 0.5 },
    { url: `${BASE_URL}/contact`, changeFrequency: 'monthly', priority: 0.5 }
  ];

  try {
    const products = await prisma.product.findMany({
      select: { slug: true, updatedAt: true }
    });
    const productRoutes: MetadataRoute.Sitemap = products.map(p => ({
      url: `${BASE_URL}/products/${p.slug}`,
      lastModified: p.updatedAt,
      changeFrequency: 'weekly',
      priority: 0.8
    }));
    return [...staticRoutes, ...productRoutes];
  } catch (e) {
    console.error('Failed to build sitemap, returning static routes only', e);
    return staticRoutes;
  }
}
