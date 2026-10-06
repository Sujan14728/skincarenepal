import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Script from 'next/script';
import { prisma } from '@/lib/prisma';
import ProductDetailView from '@/components/storefront/products/ProductDetailView';
import {
  effectivePrice,
  getPublishedReviews,
  getStorefrontProducts,
  isPurchasable,
  pickRoutine,
  stripHtml
} from '@/lib/storefront';

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}
export const dynamic = 'force-dynamic';

export async function generateStaticParams() {
  return [];
}

export async function generateMetadata({
  params
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;

  try {
    const product = await prisma.product.findUnique({ where: { slug } });
    if (!product) return { title: 'Product not found' };
    const description = product.excerpt || stripHtml(product.description);

    return {
      title: product.name,
      description,
      alternates: { canonical: `/products/${slug}` },
      openGraph: {
        title: product.name,
        url: `https://careandcleannp.com/products/${slug}`,
        description,
        images: product.images.map(src => ({
          url: src,
          width: 800,
          height: 800
        }))
      },
      twitter: {
        card: 'summary_large_image',
        title: product.name,
        description,
        images: product.images[0] ? [product.images[0]] : []
      }
    };
  } catch (e) {
    console.error('Failed to generate metadata for', slug, e);
    return { title: 'Product' };
  }
}

const ProductPage = async ({ params }: ProductPageProps) => {
  const { slug } = await params;

  // Discontinued products keep their page (old links) but are never suggested.
  const allProducts = await getStorefrontProducts({ includeDiscontinued: true });
  const product = allProducts.find(p => p.slug === slug);
  if (!product) return notFound();
  const products = allProducts.filter(p => p.status !== 'DISCONTINUED');

  const reviews = await getPublishedReviews({ productId: product.id });
  const related = products.filter(p => p.id !== product.id).slice(0, 4);

  return (
    <>
      {/* Breadcrumb JSON-LD */}
      <Script
        id='ld-breadcrumb'
        type='application/ld+json'
        strategy='afterInteractive'
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              {
                '@type': 'ListItem',
                position: 1,
                name: 'Home',
                item: 'https://careandcleannp.com/'
              },
              {
                '@type': 'ListItem',
                position: 2,
                name: 'Products',
                item: 'https://careandcleannp.com/products'
              },
              {
                '@type': 'ListItem',
                position: 3,
                name: product.name,
                item: `https://careandcleannp.com/products/${product.slug}`
              }
            ]
          })
        }}
      />

      {/* Product JSON-LD */}
      <Script
        id='ld-product'
        type='application/ld+json'
        strategy='afterInteractive'
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Product',
            name: product.name,
            image: product.images,
            description: product.excerpt || stripHtml(product.description),
            brand: {
              '@type': 'Brand',
              name: 'Care And Clean Nepal'
            },
            ...(product.reviewCount > 0 && {
              aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: product.rating,
                reviewCount: product.reviewCount
              }
            }),
            offers: {
              '@type': 'Offer',
              priceCurrency: 'NPR',
              price: effectivePrice(product),
              availability:
                isPurchasable(product)
                  ? 'https://schema.org/InStock'
                  : 'https://schema.org/OutOfStock',
              url: `https://careandcleannp.com/products/${product.slug}`
            }
          })
        }}
      />

      <ProductDetailView
        product={product}
        related={related}
        routine={pickRoutine(products)}
        reviews={reviews}
      />
    </>
  );
};

export default ProductPage;
