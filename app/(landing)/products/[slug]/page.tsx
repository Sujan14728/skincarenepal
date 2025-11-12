import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import ProductDetails from '@/components/landing/product-page/ProductDetails';
import ProductImageGallery from '@/components/landing/product-page/ProductImageGallery';
import ProductTabs from '@/components/landing/product-page/ProductTabs';
import Link from 'next/link';
import { Metadata } from 'next';
import Script from 'next/script';

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

    return {
      title: product.name,
      description: product.excerpt || product.description || '',
      alternates: { canonical: `/products/${slug}` },
      openGraph: {
        title: product.name,
        url: `https://careandcleannp.com/products/${slug}`,
        description: product.excerpt || product.description || '',
        images: product.images.map(src => ({
          url: src,
          width: 800,
          height: 800
        }))
      },
      twitter: {
        card: 'summary_large_image',
        title: product.name,
        description: product.excerpt || product.description || '',
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

  let product;
  try {
    product = await prisma.product.findUnique({ where: { slug } });
  } catch (err) {
    console.error('Failed to fetch product:', err);
    return notFound();
  }

  if (!product) return notFound();

  const hasDiscount = !!(
    product.salePrice && product.salePrice < product.price
  );
  const discountedPercent = hasDiscount
    ? Math.round(
        ((product.price - (product.salePrice || 0)) / product.price) * 100
      )
    : 0;

  return (
    <div className='container mx-auto mb-10 px-4 py-12'>
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
            description: product.excerpt || product.description || '',
            brand: {
              '@type': 'Brand',
              name: 'Care And Clean Nepal'
            },
            offers: {
              '@type': 'Offer',
              priceCurrency: 'NPR',
              price: (product.salePrice ?? product.price) || product.price,
              availability:
                product.stock > 0 && product.status !== 'DISCONTINUED'
                  ? 'https://schema.org/InStock'
                  : 'https://schema.org/OutOfStock',
              url: `https://careandcleannp.com/products/${product.slug}`
            }
          })
        }}
      />
      <nav className='mb-6 text-sm text-gray-500'>
        <Link href='/' className='hover:text-green-600'>
          Home
        </Link>{' '}
        &gt;
        <Link href='/products' className='hover:text-green-600'>
          Products
        </Link>{' '}
        &gt;
        <span className='font-semibold text-gray-700'>{product.name}</span>
      </nav>

      <div className='grid gap-12 lg:grid-cols-2 lg:gap-20'>
        <ProductImageGallery
          images={product.images}
          productName={product.name}
          hasDiscount={hasDiscount}
          discountedPercent={discountedPercent}
        />

        <ProductDetails product={product} />
      </div>

      <ProductTabs product={product} />
    </div>
  );
};

export default ProductPage;
