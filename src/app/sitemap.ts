import { MetadataRoute } from 'next';
import { DESIGNS, PRODUCTS } from '@/data/products';

export const revalidate = 604800;

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://banditbrothers.com';
  
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/products`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/reviews`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ];

  // Generate product pages
  const productRoutes: MetadataRoute.Sitemap = PRODUCTS.map((product) => ({
    url: `${baseUrl}/products/${product.id}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  // Generate design pages for each product
  const designRoutes: MetadataRoute.Sitemap = [];
  
  PRODUCTS.forEach((product) => {
    DESIGNS.forEach((design) => {
      designRoutes.push({
        url: `${baseUrl}/products/${product.id}/${design.id}`,
        lastModified: new Date(),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      });
    });
  });

  return [...staticRoutes, ...productRoutes, ...designRoutes];
} 